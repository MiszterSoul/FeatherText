/*
 * FeatherText - lightweight rich text editor
 * License: MIT
 */

import {
  copyConfig,
  createConfig,
  defaultConfig,
  PROJECT_URL,
  SUPPORT_URL,
  themes,
} from "./config.js";
import { iconMarkup } from "./icons.js";
import { translate } from "./i18n.js";
import { buttons, CommandManager } from "./commands.js";
import { CommandCompatibilityAdapter } from "./command-adapter.js";
import { SelectionManager } from "./selection.js";
import { TransactionHistory } from "./history.js";
import { DialogManager } from "./dialogs.js";
import { buildStatus, shouldBuildStatus } from "./status.js";
import { ThemeController } from "./theme.js";
import { FindReplaceManager } from "./find-replace.js";
import { AutosaveManager, isAutosaveEnabled } from "./autosave.js";
import {
  escapeHTML,
  htmlToText,
  isSafeUrl,
  normalizeSafeUrl,
  normalizeUserLink,
  replaceElementHTML,
  sanitizeUntrustedHTML,
  toSafeVideoEmbedUrl,
} from "./security.js";

const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "param",
  "source",
  "track",
  "wbr",
]);
const SOURCE_BRACKET_PAIRS = Object.freeze({ "(": ")", "[": "]", "{": "}" });
const STATEFUL_TOOLBAR_KEYS = new Set([
  "toolbar",
  "headings",
  "fonts",
  "fontSizes",
  "language",
]);
const STATUS_KEYS = new Set([
  "wordCount",
  "charCount",
  "attribution",
  "supportLink",
  "projectUrl",
  "supportUrl",
  "autosave",
  "language",
]);
const pluginRegistry = new Map();

function valuesDiffer(left, right) {
  if (Array.isArray(left) || Array.isArray(right))
    return JSON.stringify(left) !== JSON.stringify(right);
  if (left && right && typeof left === "object" && typeof right === "object") {
    if (left.storage !== right.storage) return true;
    return JSON.stringify(left) !== JSON.stringify(right);
  }
  return left !== right;
}

function clampInteger(value, minimum, maximum, fallback) {
  const number = Number.parseInt(value, 10);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(maximum, Math.max(minimum, number));
}

function closestElement(node, selector, boundary) {
  let element = node?.nodeType === 1 ? node : node?.parentElement;
  while (element && element !== boundary) {
    if (element.matches?.(selector)) return element;
    element = element.parentElement;
  }
  return null;
}

export default class FeatherText {
  constructor(element, config = {}) {
    const documentRef = globalThis.document;
    this.element =
      typeof element === "string"
        ? documentRef?.querySelector(element)
        : element;
    if (!this.element) throw new Error("FeatherText: Element not found");
    if (!this.element.parentNode)
      throw new Error("FeatherText: Element must be attached to the document");

    this.document = this.element.ownerDocument;
    this.window = this.document.defaultView || globalThis.window;
    this.config = createConfig(config);
    if (!Object.hasOwn(config || {}, "disabled"))
      this.config.disabled = !!this.element.disabled;
    if (!Object.hasOwn(config || {}, "readOnly"))
      this.config.readOnly = !!this.element.readOnly;

    this.id = `feather_${Math.random().toString(36).slice(2, 10)}`;
    this.isFullscreen = false;
    this.isSource = false;
    this.sourceLanguage = "html";
    this.autosaveTimer = null;
    this._managedListeners = [];
    this._eventListeners = new Map();
    this._plugins = [];
    this._isFocusedWithin = false;
    this._countDebounceTimer = null;
    this._sourceRefreshHandle = null;
    this._sourceLineCount = 0;
    this._forceSourceGutterRefresh = false;
    this._resetTimer = null;
    this._destroyed = false;
    this._lastNotifiedValue = null;
    this._originalDisplay = this.element.style.display;
    this._initialValue = this.readOriginalValue();

    this.sourcePane = null;
    this.sourceGutter = null;
    this.sourceLanguageSelect = null;
    this.sourceWrapToggle = null;
    this.sourceSmartTabsToggle = null;
    this.sourceAutoCloseToggle = null;
    this.wordCountEl = null;
    this.charCountEl = null;
    this.saveStateEl = null;
    this.statusBar = null;
    this.tooltipEl = null;
    this.tooltipAnchor = null;
    this.tooltipFrame = null;

    this._scheduleFrame =
      typeof this.window?.requestAnimationFrame === "function"
        ? this.window.requestAnimationFrame.bind(this.window)
        : (callback) => setTimeout(callback, 16);
    this._cancelFrame =
      typeof this.window?.cancelAnimationFrame === "function"
        ? this.window.cancelAnimationFrame.bind(this.window)
        : clearTimeout;

    this.buildEditor();
    this.themeController = new ThemeController(this.wrapper);
    this.themeController.set(this.config.theme);
    this.selectionManager = new SelectionManager(this.editor, this.source);
    this.commandAdapter = new CommandCompatibilityAdapter(
      this.document,
      (context, error) => this.reportError(context, error),
    );
    this.commandManager = new CommandManager(this, this.commandAdapter);
    this.dialogs = new DialogManager(this);
    this.findReplaceManager = new FindReplaceManager(this);
    this.autosaveManager = new AutosaveManager(this);
    this.autosaveManager.configure(
      this.config.autosave,
      this.config.autosaveInterval,
    );
    this.transactionHistory = new TransactionHistory({
      limit: this.config.historyLimit,
      delay: this.config.historyDebounceMs,
      snapshot: (label) => this.createHistorySnapshot(label),
      restore: (entry, action) => this.restoreHistorySnapshot(entry, action),
      onChange: (detail) => this.emit("transaction", detail),
    });

    this.setupEvents();
    this.setContent(this._initialValue, { history: false, notify: false });
    if (this.config.startInSource)
      this.setSourceMode(true, { focus: false, history: false });
    this.transactionHistory.reset("initial");
    this.applyInteractiveState();
    this.autosaveManager.start();
    this.installConfiguredPlugins();

    if (typeof this.config.onReady === "function")
      this.invokeCallback("onReady", this);
    this.emit("ready", {});
  }

  t(key, params = {}, fallback = key) {
    return translate(this.config?.language, key, params, fallback);
  }

  localizedConfigText(configKey, translationKey) {
    const configured = this.config?.[configKey];
    const englishDefault = defaultConfig[configKey];
    if (configured == null || configured === englishDefault)
      return this.t(translationKey, {}, englishDefault || "");
    return String(configured);
  }

  get history() {
    return this.transactionHistory
      ? this.transactionHistory.entries.map((entry) => entry.value)
      : [];
  }

  get historyIndex() {
    return this.transactionHistory?.index ?? -1;
  }

  readOriginalValue() {
    if ("value" in this.element) return String(this.element.value ?? "");
    return this.element.textContent || "";
  }

  writeOriginalValue(value) {
    if ("value" in this.element) this.element.value = value;
    else replaceElementHTML(this.element, value, { document: this.document });
  }

  resolveDimension(value, fallback) {
    if (value === null || value === undefined || value === "") return fallback;
    if (typeof value === "number") return `${value}px`;
    if (typeof value === "string")
      return /^\d+$/.test(value) ? `${value}px` : value;
    return fallback;
  }

  buildEditor() {
    this.wrapper = this.document.createElement("div");
    this.wrapper.className = "feather";
    this.wrapper.id = this.id;
    this.wrapper.lang = this.config.language;
    this.applyPresentationOptions();
    this.applyDimensions();

    this.toolbar = this.buildToolbar();
    this.wrapper.appendChild(this.toolbar);

    this.editor = this.document.createElement("div");
    this.editor.className = "feather-editor";
    this.editor.contentEditable = "true";
    this.editor.setAttribute("contenteditable", "true");
    this.editor.tabIndex = 0;
    this.editor.setAttribute(
      "placeholder",
      this.localizedConfigText("placeholder", "editor.placeholder"),
    );
    this.editor.setAttribute("role", "textbox");
    this.editor.setAttribute("aria-multiline", "true");
    this.editor.setAttribute(
      "aria-label",
      this.localizedConfigText("ariaLabel", "editor.ariaLabel"),
    );
    this.wrapper.appendChild(this.editor);

    this.sourceWrap = this.document.createElement("div");
    this.sourceWrap.className = "feather-source-wrap feather-hidden";
    this.sourceHeader = this.buildSourceToolbar();
    this.sourceWrap.appendChild(this.sourceHeader);

    this.sourcePane = this.document.createElement("div");
    this.sourcePane.className = "feather-source-pane";
    this.sourceGutter = this.document.createElement("div");
    this.sourceGutter.className = "feather-gutter";
    this.sourceGutter.setAttribute("aria-hidden", "true");
    this.codeOverlay = this.document.createElement("pre");
    this.codeOverlay.className = "feather-code";
    this.codeOverlay.setAttribute("aria-hidden", "true");
    this.source = this.document.createElement("textarea");
    this.source.className = "feather-source";
    this.source.rows = clampInteger(this.config.sourceRows, 1, 1000, 10);
    this.source.setAttribute(
      "aria-label",
      this.localizedConfigText("sourceAriaLabel", "editor.sourceAriaLabel"),
    );
    this.sourcePane.append(this.sourceGutter, this.codeOverlay, this.source);
    this.sourceWrap.appendChild(this.sourcePane);
    this.wrapper.appendChild(this.sourceWrap);

    this.rebuildStatus();
    this.element.style.display = "none";
    this.element.parentNode.insertBefore(this.wrapper, this.element);
    this.applySourcePreferences();
  }

  applyDimensions() {
    if (!this.wrapper) return;
    this.wrapper.style.setProperty(
      "--feather-source-tab-size",
      String(this.config.sourceTabSize || 4),
    );
    this.wrapper.style.setProperty(
      "--feather-min-height",
      this.resolveDimension(this.config.minHeight, "220px"),
    );
    this.wrapper.style.setProperty(
      "--feather-max-height",
      this.resolveDimension(this.config.maxHeight, "600px"),
    );
    this.wrapper.classList.toggle(
      "feather-fixed-height",
      this.config.height !== "auto",
    );
    this.wrapper.classList.toggle(
      "feather-scrollable",
      !!this.config.maxHeight,
    );
    if (this.config.height !== "auto")
      this.wrapper.style.setProperty(
        "--feather-height",
        this.resolveDimension(this.config.height, "auto"),
      );
    else this.wrapper.style.removeProperty("--feather-height");
  }

  buildToolbar() {
    const bar = this.document.createElement("div");
    bar.className = "feather-toolbar";
    bar.setAttribute("role", "toolbar");
    bar.setAttribute("aria-label", this.t("toolbar.label"));

    let group = null;
    let awaiting = { fore: false, back: false };
    const ensure = () => {
      if (!group) {
        group = this.document.createElement("div");
        group.className = "feather-group";
        bar.appendChild(group);
      }
    };
    const flush = () => {
      if (!awaiting.fore && !awaiting.back) return;
      ensure();
      if (awaiting.fore) group.appendChild(this.createColorPicker("fore"));
      if (awaiting.back) group.appendChild(this.createColorPicker("back"));
      awaiting = { fore: false, back: false };
    };

    for (const item of this.config.toolbar || []) {
      if (item === "|") {
        flush();
        group = null;
      } else if (item === "format") {
        flush();
        ensure();
        group.appendChild(this.createHeadingDropdown());
      } else if (item === "fontname") {
        flush();
        ensure();
        group.appendChild(this.createFontDropdown());
      } else if (item === "fontsize") {
        flush();
        ensure();
        group.appendChild(this.createFontSizeDropdown());
      } else if (item === "forecolor") awaiting.fore = true;
      else if (item === "backcolor") awaiting.back = true;
      else if (buttons[item]) {
        flush();
        ensure();
        const control = this.createToolbarButton(item);
        if (control) group.appendChild(control);
      }
    }
    flush();
    return bar;
  }

  buildSourceToolbar() {
    const bar = this.document.createElement("div");
    bar.className = "feather-source-toolbar";
    bar.id = `${this.id}_srcbar`;
    bar.setAttribute("role", "toolbar");
    bar.setAttribute("aria-label", this.t("source.label"));

    const selectWrapper = this.document.createElement("div");
    selectWrapper.className = "feather-select";
    const select = this.document.createElement("select");
    select.id = `${this.id}_lang`;
    select.setAttribute("aria-label", this.t("source.syntaxMode"));
    for (const language of ["html", "css", "javascript", "xml", "json"]) {
      const option = this.document.createElement("option");
      option.value = language;
      option.textContent = language.toUpperCase();
      select.appendChild(option);
    }
    select.value = this.sourceLanguage;
    this.sourceLanguageSelect = select;
    selectWrapper.dataset.featherTooltip = this.t("source.chooseSyntax");
    selectWrapper.appendChild(select);
    bar.appendChild(selectWrapper);

    this.sourceWrapToggle = this.createToolbarToggleButton(
      "wrap",
      this.t("source.wrapLines"),
      this.config.sourceWrapLines,
    );
    this.sourceWrapToggle.dataset.setting = "sourceWrapLines";
    bar.appendChild(this.sourceWrapToggle);
    this.sourceSmartTabsToggle = this.createToolbarToggleButton(
      "braces",
      this.t("source.smartTabs"),
      this.config.sourceSmartTabs,
    );
    this.sourceSmartTabsToggle.dataset.setting = "sourceSmartTabs";
    bar.appendChild(this.sourceSmartTabsToggle);
    this.sourceAutoCloseToggle = this.createToolbarToggleButton(
      "code",
      this.t("source.autoCloseTags"),
      this.config.sourceAutoClose,
    );
    this.sourceAutoCloseToggle.dataset.setting = "sourceAutoClose";
    bar.appendChild(this.sourceAutoCloseToggle);
    return bar;
  }

  createToolbarButton(name) {
    const definition = buttons[name];
    if (!definition) return null;
    const control = this.document.createElement("button");
    control.className = "feather-btn";
    control.type = "button";
    control.innerHTML = definition.icon;
    const tip = this.t(
      `toolbar.${name}`,
      {},
      definition.tip || definition.tooltip || name,
    );
    control.dataset.featherTooltip = tip;
    control.dataset.command = name;
    control.setAttribute("aria-label", tip);
    control.addEventListener("mousedown", (event) => {
      if (
        !this.isMutationBlocked() ||
        ["copy", "fullscreen", "source"].includes(name)
      )
        event.preventDefault();
      this.saveSelection();
    });
    control.addEventListener("click", (event) => {
      event.preventDefault();
      this.exec(name, definition);
    });
    return control;
  }

  createToolbarToggleButton(iconName, label, pressed) {
    const control = this.document.createElement("button");
    control.type = "button";
    control.className = "feather-btn feather-toggle-btn";
    control.innerHTML = iconMarkup[iconName] || iconMarkup.code;
    control.setAttribute("aria-label", label);
    control.dataset.featherTooltip = label;
    control.setAttribute("aria-pressed", pressed ? "true" : "false");
    control.classList.toggle("is-active", !!pressed);
    control.addEventListener("mousedown", (event) => event.preventDefault());
    return control;
  }

  createHeadingDropdown() {
    const wrapper = this.document.createElement("div");
    wrapper.className = "feather-select";
    wrapper.dataset.featherTooltip = this.t("format.paragraphFormat");
    const select = this.document.createElement("select");
    select.setAttribute("aria-label", this.t("format.paragraphFormat"));
    for (const heading of this.config.headings || []) {
      const option = this.document.createElement("option");
      option.value = String(heading).toLowerCase();
      option.textContent =
        heading === "P"
          ? this.t("format.paragraph")
          : this.t("format.heading", { level: String(heading).slice(1) });
      select.appendChild(option);
    }
    select.addEventListener("mousedown", () => this.saveSelection());
    select.addEventListener("change", () => {
      this.restoreSelection();
      const value = select.value === "p" ? "div" : select.value;
      this.commandManager.execute("formatBlock", value, {
        label: "format:block",
      });
      this.updateToolbarState();
      this.editor.focus();
    });
    wrapper.appendChild(select);
    return wrapper;
  }

  createFontDropdown() {
    return this.createStyleDropdown(
      "fontname",
      this.t("format.fontFamily"),
      this.config.fonts,
      "fontFamily",
    );
  }

  createFontSizeDropdown() {
    return this.createStyleDropdown(
      "fontsize",
      this.t("format.fontSize"),
      this.config.fontSizes,
      "fontSize",
    );
  }

  createStyleDropdown(className, label, values, property) {
    const wrapper = this.document.createElement("div");
    wrapper.className = `feather-select feather-${className}`;
    wrapper.dataset.featherTooltip = label;
    const select = this.document.createElement("select");
    select.setAttribute("aria-label", label);
    for (const value of values || []) {
      const option = this.document.createElement("option");
      option.value = value;
      option.textContent = value;
      if (property === "fontFamily") option.style.fontFamily = value;
      select.appendChild(option);
    }
    select.addEventListener("mousedown", () => this.saveSelection());
    select.addEventListener("change", () => {
      this.restoreSelection();
      this.applyInlineStyle(property, select.value);
      this.commitMutation(`format:${property}`, { nativeInput: true });
      this.editor.focus();
    });
    wrapper.appendChild(select);
    return wrapper;
  }

  createColorPicker(kind) {
    const wrapper = this.document.createElement("div");
    wrapper.className = "feather-color";
    wrapper.dataset.featherTooltip =
      kind === "fore"
        ? this.t("format.textColor")
        : this.t("format.backgroundColor");
    const input = this.document.createElement("input");
    input.type = "color";
    input.value = kind === "fore" ? "#000000" : "#ffff00";
    input.tabIndex = -1;
    input.setAttribute("aria-hidden", "true");
    const trigger = this.document.createElement("button");
    trigger.type = "button";
    trigger.className = "feather-color-trigger";
    trigger.setAttribute(
      "aria-label",
      kind === "fore"
        ? this.t("format.textColor")
        : this.t("format.backgroundColor"),
    );
    trigger.setAttribute("aria-haspopup", "dialog");
    const swatch = this.document.createElement("span");
    swatch.className = "feather-swatch";
    const swatchInner = this.document.createElement("span");
    swatchInner.className = "feather-swatch-i";
    swatch.appendChild(swatchInner);
    const updateSwatch = () => {
      swatchInner.style.background = input.value;
    };
    updateSwatch();
    trigger.addEventListener("pointerdown", () => this.saveSelection());
    trigger.addEventListener("mousedown", () => this.saveSelection());
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      input.click();
    });
    input.addEventListener("change", () => {
      this.restoreSelection();
      this.applyInlineStyle(
        kind === "fore" ? "color" : "backgroundColor",
        input.value,
      );
      this.commitMutation(`format:${kind}color`, { nativeInput: true });
      this.editor.focus();
      updateSwatch();
    });
    trigger.appendChild(swatch);
    wrapper.append(input, trigger);

    const clear = this.document.createElement("button");
    clear.type = "button";
    clear.className = "feather-clear-color";
    clear.dataset.featherTooltip = this.t("format.clearColor");
    clear.setAttribute(
      "aria-label",
      kind === "fore"
        ? this.t("format.clearTextColor")
        : this.t("format.clearBackgroundColor"),
    );
    clear.textContent = "×";
    clear.addEventListener("mousedown", () => this.saveSelection());
    clear.addEventListener("click", (event) => {
      event.preventDefault();
      this.restoreSelection();
      this.clearColor(kind);
      this.commitMutation(`format:clear-${kind}color`, { nativeInput: true });
      this.editor.focus();
    });
    wrapper.appendChild(clear);
    return wrapper;
  }

  rebuildToolbar() {
    const replacement = this.buildToolbar();
    this.toolbar.replaceWith(replacement);
    this.toolbar = replacement;
    this.applyInteractiveState();
  }

  rebuildStatus() {
    if (this.statusBar) this.statusBar.remove();
    this.statusBar = null;
    this.wordCountEl = null;
    this.charCountEl = null;
    this.saveStateEl = null;
    if (!shouldBuildStatus(this.config)) return;
    this.statusBar = buildStatus(this);
    this.wrapper.appendChild(this.statusBar);
    this.updateCounts();
    this.autosaveManager?.refreshStatus();
  }

  exec(name, definition = buttons[name]) {
    const result = this.commandManager.run(name, definition);
    this.updateToolbarState();
    if (
      !this.dialogs?.active &&
      !["undo", "redo", "source", "fullscreen", "copy", "paste"].includes(name)
    )
      this.editor.focus();
    return result;
  }

  execCommand(command, value = null) {
    return this.commandManager.execute(command, value, {
      label: `command:${command}`,
    });
  }

  setupEvents() {
    this.addManagedListener(this.wrapper, "focusin", (event) => {
      if (this.wrapper.contains(event.target)) this._isFocusedWithin = true;
    });
    this.addManagedListener(this.wrapper, "focusout", (event) => {
      this._isFocusedWithin = !!(
        event.relatedTarget && this.wrapper.contains(event.relatedTarget)
      );
    });
    this.addManagedListener(this.wrapper, "keydown", (event) =>
      this.handleToolbarKeydown(event),
    );
    this.addManagedListener(this.wrapper, "mouseover", (event) =>
      this.handleTooltipPointer(event, true),
    );
    this.addManagedListener(this.wrapper, "mouseout", (event) =>
      this.handleTooltipPointer(event, false),
    );
    this.addManagedListener(this.wrapper, "focusin", (event) =>
      this.handleTooltipFocus(event.target, true, event.relatedTarget),
    );
    this.addManagedListener(this.wrapper, "focusout", (event) =>
      this.handleTooltipFocus(event.target, false, event.relatedTarget),
    );
    this.addManagedListener(this.wrapper, "mouseleave", () =>
      this.hideTooltip(),
    );

    this.addManagedListener(this.editor, "beforeinput", (event) =>
      this.handleBeforeInput(event),
    );
    this.addManagedListener(this.editor, "input", () =>
      this.handleSurfaceInput("typing"),
    );
    this.addManagedListener(this.editor, "focus", () => {
      this._isFocusedWithin = true;
      if (typeof this.config.onFocus === "function")
        this.invokeCallback("onFocus", this);
      this.emit("focus", { mode: "editor" });
    });
    this.addManagedListener(this.editor, "blur", () => {
      this.transactionHistory.flush();
      this.flushCountsUpdate();
      this.dispatchOriginalChange();
      if (typeof this.config.onBlur === "function")
        this.invokeCallback("onBlur", this);
      this.emit("blur", { mode: "editor" });
    });
    this.addManagedListener(this.editor, "paste", (event) =>
      this.handlePaste(event),
    );
    this.addManagedListener(this.editor, "keydown", (event) =>
      this.handleEditorKeydown(event),
    );

    this.addManagedListener(this.document, "selectionchange", () => {
      if (this.isSource || !this._isFocusedWithin) return;
      const selection = this.window?.getSelection?.();
      if (this.selectionManager.contains(selection?.anchorNode))
        this.updateToolbarState();
    });

    this.addManagedListener(this.source, "input", () =>
      this.handleSurfaceInput("source-typing"),
    );
    this.addManagedListener(this.source, "focus", () => {
      this._isFocusedWithin = true;
      if (typeof this.config.onFocus === "function")
        this.invokeCallback("onFocus", this);
      this.emit("focus", { mode: "source" });
    });
    this.addManagedListener(this.source, "blur", () => {
      this.transactionHistory.flush();
      this.flushCountsUpdate();
      this.dispatchOriginalChange();
      if (typeof this.config.onBlur === "function")
        this.invokeCallback("onBlur", this);
      this.emit("blur", { mode: "source" });
    });
    this.addManagedListener(this.source, "scroll", () =>
      this.syncSourceScroll(),
    );
    this.addManagedListener(this.source, "keydown", (event) =>
      this.handleSourceKeydown(event),
    );

    this.addManagedListener(this.sourceHeader, "click", (event) => {
      const control = event.target.closest?.("button[data-setting]");
      if (!control) return;
      event.preventDefault();
      this.toggleSourceSetting(control.dataset.setting);
    });
    this.addManagedListener(this.sourceLanguageSelect, "change", () => {
      this.sourceLanguage = this.sourceLanguageSelect.value;
      this.highlightSource();
    });

    const form = this.element.form || this.element.closest?.("form");
    if (form) {
      this.form = form;
      this.addManagedListener(form, "reset", () => {
        if (this._resetTimer) clearTimeout(this._resetTimer);
        this._resetTimer = setTimeout(() => {
          this._resetTimer = null;
          const resetValue = this.readOriginalValue();
          this.setContent(resetValue, { history: false, notify: false });
          this.transactionHistory.reset("form-reset");
          this.autosaveManager?.schedule();
          this.emit("reset", { html: resetValue });
        }, 0);
      });
    }
    this.updateSourceControlsState();
  }

  addManagedListener(target, type, handler, options) {
    if (!target) return;
    target.addEventListener(type, handler, options);
    this._managedListeners.push({ target, type, handler, options });
  }

  removeManagedListeners() {
    for (const { target, type, handler, options } of this._managedListeners)
      target.removeEventListener(type, handler, options);
    this._managedListeners = [];
  }

  handleBeforeInput(event) {
    if (this.isMutationBlocked()) {
      event.preventDefault();
      return;
    }
    if (
      this.config.maxLength === null ||
      this.config.maxLength === undefined ||
      this.config.maxLength === ""
    )
      return;
    const maximum = Number(this.config.maxLength);
    if (
      !Number.isFinite(maximum) ||
      maximum < 0 ||
      !event.data ||
      event.inputType?.startsWith("delete")
    )
      return;
    const selection = this.window.getSelection?.();
    const selectedLength = selection?.toString?.().length || 0;
    if (this.getText().length - selectedLength + event.data.length > maximum)
      event.preventDefault();
  }

  handleSurfaceInput(label) {
    if (this.isMutationBlocked()) return;
    this.syncOriginal(this.getHTML(), { nativeInput: true });
    this.scheduleCountsUpdate();
    this.transactionHistory.schedule(label);
    this.notifyChange(label);
    if (this.isSource) this.scheduleSourceRefresh(true);
  }

  handleEditorKeydown(event) {
    if (event.ctrlKey || event.metaKey) {
      const key = event.key.toLowerCase();
      if (key === "f") {
        event.preventDefault();
        this.openFindReplace();
      } else if (key === "z") {
        event.preventDefault();
        if (event.shiftKey) this.redo();
        else this.undo();
      } else if (key === "y") {
        event.preventDefault();
        this.redo();
      } else if (key === "b" || key === "i" || key === "u") {
        event.preventDefault();
        const command = { b: "bold", i: "italic", u: "underline" }[key];
        this.commandManager.execute(command, null, {
          label: `shortcut:${command}`,
        });
      } else if (key === "k") {
        event.preventDefault();
        this.insertLink();
      }
    }
    if (typeof this.config.onKeydown === "function")
      this.invokeCallback("onKeydown", event, this);
  }

  handlePaste(event) {
    if (this.isMutationBlocked()) {
      event.preventDefault();
      return true;
    }
    const clipboard = event.clipboardData || this.window?.clipboardData;
    const payload = {
      text: clipboard?.getData?.("text/plain") || "",
      html: clipboard?.getData?.("text/html") || "",
      files: clipboard?.files ? [...clipboard.files] : [],
    };

    if (payload.files.length && typeof this.config.imageUpload === "function") {
      const image = payload.files.find((file) =>
        String(file.type || "").startsWith("image/"),
      );
      if (image) {
        event.preventDefault();
        this.saveSelection();
        void this.uploadImage(image).catch((error) =>
          this.reportError("imageUpload:paste", error),
        );
        this.invokePasteCallback(event, payload);
        return true;
      }
    }

    let content = null;
    if (typeof this.config.pasteFilter === "function") {
      try {
        content = this.config.pasteFilter(payload, event, this);
      } catch (error) {
        this.reportError("pasteFilter", error);
      }
    }
    if (content === false) {
      event.preventDefault();
      this.invokePasteCallback(event, payload);
      return true;
    }
    if (typeof content === "string") content = { type: "text", content };
    if (!content) {
      const mode =
        this.config.pasteMode === "auto"
          ? this.config.sanitizePaste
            ? "text"
            : "html"
          : this.config.pasteMode;
      content =
        mode === "html"
          ? {
              type: payload.html ? "html" : "text",
              content: payload.html || payload.text,
            }
          : { type: "text", content: payload.text };
    }
    if (!content?.content) {
      this.invokePasteCallback(event, payload);
      return false;
    }

    event.preventDefault();
    if (content.type === "html") {
      const safe = sanitizeUntrustedHTML(content.content, {
        document: this.document,
      });
      this.commandManager.execute("insertHTML", safe, { label: "paste:html" });
    } else {
      this.commandManager.execute("insertText", String(content.content), {
        label: "paste:text",
      });
    }
    this.invokePasteCallback(event, payload);
    return true;
  }

  invokePasteCallback(event, payload) {
    if (typeof this.config.onPaste === "function")
      this.invokeCallback("onPaste", event, payload, this);
    this.emit("paste", { event, payload });
  }

  syncOriginal(value = this.getHTML(), { nativeInput = false } = {}) {
    this.writeOriginalValue(value);
    if (nativeInput) {
      const EventConstructor = this.window?.Event || globalThis.Event;
      if (EventConstructor)
        this.element.dispatchEvent(
          new EventConstructor("input", { bubbles: true }),
        );
    }
  }

  dispatchOriginalChange() {
    const EventConstructor = this.window?.Event || globalThis.Event;
    if (EventConstructor)
      this.element.dispatchEvent(
        new EventConstructor("change", { bubbles: true }),
      );
  }

  notifyChange(label, force = false) {
    const html = this.getHTML();
    if (!force && html === this._lastNotifiedValue) return;
    this._lastNotifiedValue = html;
    if (typeof this.config.onChange === "function")
      this.invokeCallback("onChange", html, this);
    this.emit("change", { html, label });
    this.autosaveManager?.schedule();
  }

  commitMutation(
    label = "change",
    { nativeInput = false, notify = true } = {},
  ) {
    this.syncOriginal(this.getHTML(), { nativeInput });
    this.scheduleCountsUpdate();
    this.transactionHistory.commit(label);
    if (notify) this.notifyChange(label);
    return this;
  }

  createHistorySnapshot(label) {
    return {
      value: this.getHTML(),
      mode: this.isSource ? "source" : "editor",
      selection: this.selectionManager.capture(this.isSource),
      label,
      timestamp: Date.now(),
    };
  }

  restoreHistorySnapshot(entry, action) {
    this.editor.innerHTML = entry.value;
    this.source.value = entry.value;
    this.syncOriginal(entry.value);
    this.flushCountsUpdate();
    this.scheduleSourceRefresh(true);
    const surface = this.activeSurface();
    if (this.wrapper.contains(this.document.activeElement)) surface.focus();
    this.selectionManager.restore(entry.selection, this.isSource);
    this.notifyChange(action, true);
  }

  pushHistory(label = "change") {
    this.transactionHistory.commit(label);
    return this;
  }

  updateHistory(label = "change") {
    return this.pushHistory(label);
  }

  undo() {
    this.transactionHistory.undo();
    return this;
  }

  redo() {
    this.transactionHistory.redo();
    return this;
  }

  flushHistory() {
    this.transactionHistory.flush();
    return this;
  }

  insertLink(url, text) {
    if (this.isMutationBlocked()) return false;
    if (typeof url === "string") return this.applyLink(url, text);

    this.saveSelection();
    const selection = this.window.getSelection?.();
    const anchor = this.selectedAnchor();
    const selectedText = selection?.toString?.().trim() || "";
    const current = anchor?.getAttribute("href") || "";
    const prefill =
      current ||
      (/^[\w.-]+\.[a-z]{2,}(?:\/\S*)?$/i.test(selectedText)
        ? `https://${selectedText}`
        : "https://");
    return this.dialogs.open({
      title: anchor ? this.t("link.editTitle") : this.t("link.insertTitle"),
      confirmLabel: anchor ? this.t("common.update") : this.t("common.insert"),
      initialField: "url",
      fields: [
        {
          name: "url",
          label: this.t("link.url"),
          type: "url",
          value: prefill,
          required: !anchor,
          autocomplete: "url",
        },
        ...(!selectedText && !anchor
          ? [{ name: "text", label: this.t("link.text"), value: "" }]
          : []),
      ],
      onConfirm: ({ url: enteredUrl, text: enteredText }) => {
        this.restoreSelection();
        if (anchor && !String(enteredUrl).trim()) {
          this.commandManager.execute("unlink", null, { label: "link:remove" });
          return true;
        }
        if (!this.applyLink(enteredUrl, enteredText, anchor))
          throw new Error(
            this.t("link.safeError"),
          );
        return true;
      },
    });
  }

  selectedAnchor() {
    const selection = this.window.getSelection?.();
    if (!selection?.rangeCount) return null;
    return closestElement(
      selection.anchorNode || selection.focusNode,
      "a",
      this.editor,
    );
  }

  insertMarkup(markup, label) {
    if (this.isSource) {
      this.source.setRangeText(
        markup,
        this.source.selectionStart,
        this.source.selectionEnd,
        "end",
      );
      replaceElementHTML(
        this.editor,
        this.renderSourceToHTML(this.source.value),
        { document: this.document },
      );
      this.sourceMutated(label);
      return true;
    }
    return this.commandManager.execute("insertHTML", markup, { label });
  }

  applyLink(value, text, existingAnchor = null) {
    const safe = normalizeUserLink(value);
    if (!safe) return false;
    if (this.isSource) {
      const selected = this.source.value.slice(
        this.source.selectionStart,
        this.source.selectionEnd,
      );
      const label = String(selected || text || safe);
      this.insertMarkup(
        `<a href="${escapeHTML(safe)}" target="_blank" rel="noopener noreferrer">${escapeHTML(label)}</a>`,
        "link:insert-source",
      );
      return this;
    }
    if (existingAnchor?.isConnected) {
      existingAnchor.setAttribute("href", safe);
      existingAnchor.setAttribute("target", "_blank");
      existingAnchor.setAttribute("rel", "noopener noreferrer");
      this.commitMutation("link:update", { nativeInput: true });
      return this;
    }

    const selection = this.window.getSelection?.();
    const selectedText = selection?.toString?.() || "";
    if (selectedText) {
      this.commandManager.execute("createLink", safe, {
        label: "link:create",
        record: false,
      });
      const anchor =
        this.selectedAnchor() ||
        [...this.editor.querySelectorAll("a")].find(
          (candidate) => candidate.getAttribute("href") === safe,
        );
      if (anchor) {
        anchor.target = "_blank";
        anchor.rel = "noopener noreferrer";
      }
      this.commitMutation("link:secure", { nativeInput: true });
    } else {
      const label = String(text || safe);
      const markup = `<a href="${escapeHTML(safe)}" target="_blank" rel="noopener noreferrer">${escapeHTML(label)}</a>`;
      this.insertMarkup(markup, "link:insert");
    }
    return this;
  }

  insertImage(url, alt = "") {
    if (this.isMutationBlocked()) return false;
    if (typeof url === "string") return this.applyImage(url, alt);
    this.saveSelection();
    const fields = [
      {
        name: "url",
        label: this.t("image.url"),
        type: "url",
        value: "https://",
        required: typeof this.config.imageUpload !== "function",
        autocomplete: "url",
      },
      { name: "alt", label: this.t("image.alt"), value: "" },
    ];
    if (typeof this.config.imageUpload === "function")
      fields.push({
        name: "file",
        label: this.t("image.upload"),
        type: "file",
        accept: "image/*",
        description: this.t("image.uploadDescription"),
      });
    return this.dialogs.open({
      title: this.t("image.insertTitle"),
      confirmLabel: this.t("common.insert"),
      fields,
      initialField: "url",
      onConfirm: async (values) => {
        this.restoreSelection();
        if (values.file) {
          await this.uploadImage(values.file, values.alt);
          return true;
        }
        if (!this.applyImage(values.url, values.alt))
          throw new Error(this.t("image.safeError"));
        return true;
      },
    });
  }

  applyImage(value, alt = "") {
    const safe = normalizeSafeUrl(value, { kind: "image" });
    if (!safe) return false;
    const markup = `<img src="${escapeHTML(safe)}" alt="${escapeHTML(alt)}">`;
    this.insertMarkup(markup, "image:insert");
    return this;
  }

  async uploadImage(file, alt = "") {
    if (this.isMutationBlocked()) return false;
    if (typeof this.config.imageUpload !== "function")
      throw new Error(this.t("image.uploadMissing"));
    if (!this.isSource) this.saveSelection();
    this.wrapper.classList.add("feather-loading");
    try {
      const result = await this.config.imageUpload(file, this);
      const url = typeof result === "string" ? result : result?.url;
      const resolvedAlt =
        typeof result === "object" && result?.alt != null ? result.alt : alt;
      if (!this.isSource) this.restoreSelection();
      if (!this.applyImage(url, resolvedAlt))
        throw new Error(
          this.t("image.uploadUnsafe"),
        );
      this.emit("imageupload", { file, url, alt: resolvedAlt });
      return this;
    } catch (error) {
      this.selectionManager.clearSaved();
      throw error;
    } finally {
      this.wrapper.classList.remove("feather-loading");
    }
  }

  insertVideo(url) {
    if (this.isMutationBlocked()) return false;
    if (typeof url === "string") return this.applyVideo(url);
    this.saveSelection();
    return this.dialogs.open({
      title: this.t("video.insertTitle"),
      confirmLabel: "Insert",
      initialField: "url",
      fields: [
        {
          name: "url",
          label: this.t("video.url"),
          type: "url",
          value: "",
          required: true,
          autocomplete: "url",
        },
      ],
      onConfirm: ({ url: enteredUrl }) => {
        this.restoreSelection();
        if (!this.applyVideo(enteredUrl))
          throw new Error(this.t("video.safeError"));
        return true;
      },
    });
  }

  applyVideo(value) {
    const embedUrl = toSafeVideoEmbedUrl(value);
    if (!embedUrl) return false;
    const iframe = `<iframe src="${escapeHTML(embedUrl)}" width="560" height="315" title="Embedded video" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>`;
    this.insertMarkup(iframe, "video:insert");
    return this;
  }

  insertTable(rows, columns) {
    if (this.isMutationBlocked()) return false;
    if (rows != null || columns != null) return this.applyTable(rows, columns);
    this.saveSelection();
    return this.dialogs.open({
      title: this.t("table.insertTitle"),
      confirmLabel: "Insert",
      initialField: "rows",
      fields: [
        {
          name: "rows",
          label: this.t("table.rows"),
          type: "number",
          value: 3,
          min: 1,
          max: this.config.tableMaxRows,
          required: true,
        },
        {
          name: "columns",
          label: this.t("table.columns"),
          type: "number",
          value: 3,
          min: 1,
          max: this.config.tableMaxColumns,
          required: true,
        },
      ],
      onConfirm: ({ rows: rowCount, columns: columnCount }) => {
        this.restoreSelection();
        if (!this.applyTable(rowCount, columnCount))
          throw new Error(
            this.t("table.dimensionError", {
              rows: this.config.tableMaxRows,
              columns: this.config.tableMaxColumns,
            }),
          );
        return true;
      },
    });
  }

  applyTable(rows, columns) {
    const rowCount = Number.parseInt(rows, 10);
    const columnCount = Number.parseInt(columns, 10);
    if (
      !Number.isFinite(rowCount) ||
      !Number.isFinite(columnCount) ||
      rowCount < 1 ||
      columnCount < 1 ||
      rowCount > this.config.tableMaxRows ||
      columnCount > this.config.tableMaxColumns
    )
      return false;
    let table = "<table><tbody>";
    for (let row = 0; row < rowCount; row += 1) {
      table += "<tr>";
      for (let column = 0; column < columnCount; column += 1)
        table += "<td><br></td>";
      table += "</tr>";
    }
    table += "</tbody></table><p><br></p>";
    this.insertMarkup(table, "table:insert");
    return this;
  }

  selectedTableCell() {
    const selection = this.window.getSelection?.();
    return closestElement(selection?.anchorNode, "td, th", this.editor);
  }

  placeCaretIn(element) {
    if (!element?.isConnected) return false;
    const selection = this.window.getSelection?.();
    if (!selection) return false;
    const range = this.document.createRange();
    range.selectNodeContents(element);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);
    return true;
  }

  addTableRow(position = "after") {
    if (this.isMutationBlocked()) return false;
    const cell = this.selectedTableCell();
    const row = cell?.closest("tr");
    const table = row?.closest("table");
    if (!row || !table || table.rows.length >= this.config.tableMaxRows)
      return false;
    const clone = row.cloneNode(false);
    const count = row.cells.length || 1;
    for (let index = 0; index < count; index += 1) {
      const nextCell = this.document.createElement(
        row.cells[index]?.tagName?.toLowerCase() === "th" ? "th" : "td",
      );
      nextCell.appendChild(this.document.createElement("br"));
      clone.appendChild(nextCell);
    }
    if (position === "before") row.before(clone);
    else row.after(clone);
    this.commitMutation("table:add-row", { nativeInput: true });
    return this;
  }

  deleteTableRow() {
    if (this.isMutationBlocked()) return false;
    const row = this.selectedTableCell()?.closest("tr");
    const table = row?.closest("table");
    if (!row || !table) return false;
    const survivingRow = row.nextElementSibling || row.previousElementSibling;
    if (table.rows.length <= 1) table.remove();
    else {
      row.remove();
      this.placeCaretIn(survivingRow?.cells?.[0]);
    }
    this.commitMutation("table:delete-row", { nativeInput: true });
    return this;
  }

  addTableColumn(position = "after") {
    if (this.isMutationBlocked()) return false;
    const selected = this.selectedTableCell();
    const table = selected?.closest("table");
    if (!selected || !table) return false;
    const selectedIndex = selected.cellIndex;
    const maximum = Math.max(...[...table.rows].map((row) => row.cells.length));
    if (maximum >= this.config.tableMaxColumns) return false;
    for (const row of table.rows) {
      const reference =
        row.cells[Math.min(selectedIndex, row.cells.length - 1)];
      const cell = this.document.createElement(
        reference?.tagName?.toLowerCase() === "th" ? "th" : "td",
      );
      cell.appendChild(this.document.createElement("br"));
      if (!reference) row.appendChild(cell);
      else if (position === "before") reference.before(cell);
      else reference.after(cell);
    }
    this.commitMutation("table:add-column", { nativeInput: true });
    return this;
  }

  deleteTableColumn() {
    if (this.isMutationBlocked()) return false;
    const selected = this.selectedTableCell();
    const table = selected?.closest("table");
    if (!selected || !table) return false;
    const index = selected.cellIndex;
    const survivingCell =
      selected.nextElementSibling || selected.previousElementSibling;
    for (const row of table.rows) row.cells[index]?.remove();
    if (![...table.rows].some((row) => row.cells.length)) table.remove();
    else this.placeCaretIn(survivingCell);
    this.commitMutation("table:delete-column", { nativeInput: true });
    return this;
  }

  deleteTable() {
    if (this.isMutationBlocked()) return false;
    const table = this.selectedTableCell()?.closest("table");
    if (!table) return false;
    table.remove();
    this.commitMutation("table:delete", { nativeInput: true });
    return this;
  }

  insertCode() {
    if (this.isMutationBlocked()) return false;
    if (this.isSource) {
      const selected = this.source.value.slice(
        this.source.selectionStart,
        this.source.selectionEnd,
      );
      this.insertMarkup(
        `<code>${escapeHTML(selected || "code")}</code>`,
        "code:insert-source",
      );
      return this;
    }
    const selection = this.window.getSelection?.();
    if (!selection?.rangeCount) return false;
    const range = selection.getRangeAt(0);
    if (!this.selectionManager.contains(range.commonAncestorContainer))
      return false;
    const code = this.document.createElement("code");
    code.textContent = selection.toString() || "code";
    range.deleteContents();
    range.insertNode(code);
    const nextRange = this.document.createRange();
    nextRange.selectNodeContents(code);
    selection.removeAllRanges();
    selection.addRange(nextRange);
    this.commitMutation("code:insert", { nativeInput: true });
    return this;
  }

  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
    this.wrapper.classList.toggle("feather-fullscreen", this.isFullscreen);
    this.emit("fullscreen", { active: this.isFullscreen });
    return this;
  }

  toggleSource() {
    return this.setSourceMode(!this.isSource);
  }

  setSourceMode(enabled, options = {}) {
    const next = !!enabled;
    if (next === this.isSource) return this;
    this.transactionHistory?.flush();
    if (next) {
      this.source.value = this.editor.innerHTML;
      this.editor.classList.add("feather-hidden");
      this.sourceWrap.classList.remove("feather-hidden");
      this.source.style.minHeight = `${this.editor.offsetHeight || 0}px`;
      this.isSource = true;
      this.applySourcePreferences();
      this.renderGutter(true);
      this.highlightSource();
    } else {
      const applied = replaceElementHTML(
        this.editor,
        this.renderSourceToHTML(this.source.value),
        { document: this.document },
      );
      this.source.value = applied;
      this.sourceWrap.classList.add("feather-hidden");
      this.editor.classList.remove("feather-hidden");
      this.isSource = false;
      this.syncOriginal(applied);
      this.flushCountsUpdate();
      if (options.history !== false)
        this.transactionHistory?.commit("source:apply");
    }
    this.updateSourceControlsState();
    this.autosaveManager?.schedule();
    if (options.focus !== false && !this.config.disabled)
      this.activeSurface().focus();
    this.emit("sourcechange", { active: this.isSource });
    return this;
  }

  renderSourceToHTML(sourceText) {
    return typeof sourceText === "string" ? sourceText : "";
  }

  handleSourceKeydown(event) {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f") {
      event.preventDefault();
      this.openFindReplace();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "z") {
      event.preventDefault();
      if (event.shiftKey) this.redo();
      else this.undo();
      return;
    }
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "y") {
      event.preventDefault();
      this.redo();
      return;
    }
    if (this.isMutationBlocked()) return;
    if (event.ctrlKey && event.key.toLowerCase() === "m") {
      event.preventDefault();
      this.selectBracketPair();
      return;
    }
    if (event.key === "Tab") {
      event.preventDefault();
      this.handleSourceTab(event.shiftKey);
      return;
    }
    if (event.key === "Enter") {
      event.preventDefault();
      this.handleSourceEnter();
      return;
    }
    if (
      !this.config.sourceAutoClose ||
      event.metaKey ||
      event.ctrlKey ||
      event.altKey
    )
      return;
    if (event.key === ">") {
      if (this.handleSourceTagClose()) event.preventDefault();
    } else if (event.key.length === 1) this.handleSourcePair(event);
  }

  sourceMutated(label) {
    this.syncOriginal(this.source.value, { nativeInput: true });
    this.scheduleSourceRefresh(true);
    this.scheduleCountsUpdate();
    this.transactionHistory.commit(label);
    this.notifyChange(label);
  }

  handleSourcePair(event) {
    const pairs = { '"': '"', "'": "'", "`": "`", ...SOURCE_BRACKET_PAIRS };
    const close = pairs[event.key];
    if (!close || this.source.selectionStart !== this.source.selectionEnd)
      return false;
    const next = this.source.value[this.source.selectionStart] || "";
    if (next && /[\w>]/.test(next) && ['"', "'", "`"].includes(event.key))
      return false;
    event.preventDefault();
    const start = this.source.selectionStart;
    this.source.setRangeText(
      event.key + close,
      start,
      this.source.selectionEnd,
      "end",
    );
    this.source.setSelectionRange(start + 1, start + 1);
    this.sourceMutated("source:pair");
    return true;
  }

  handleSourceTab(outdent) {
    const textarea = this.source;
    const indentUnit = this.getSourceIndentUnit();
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const lineEnd = value.indexOf("\n", end);
    const sliceEnd = lineEnd === -1 ? value.length : lineEnd;
    const block = value.slice(lineStart, sliceEnd);
    if (!outdent && start === end) {
      textarea.setRangeText(indentUnit, start, end, "end");
      this.sourceMutated("source:indent");
      return;
    }
    const changed = block
      .split("\n")
      .map((line) => {
        if (!outdent) return indentUnit + line;
        if (line.startsWith(indentUnit)) return line.slice(indentUnit.length);
        if (line.startsWith("\t")) return line.slice(1);
        return line.replace(/^ {1,4}/, "");
      })
      .join("\n");
    textarea.setRangeText(changed, lineStart, sliceEnd, "select");
    const delta = changed.length - block.length;
    if (start === end) {
      const next = outdent
        ? Math.max(lineStart, start - indentUnit.length)
        : start + indentUnit.length;
      textarea.setSelectionRange(next, next);
    } else
      textarea.setSelectionRange(
        start + (outdent ? 0 : indentUnit.length),
        end + delta,
      );
    this.sourceMutated(outdent ? "source:outdent" : "source:indent");
  }

  handleSourceEnter() {
    const textarea = this.source;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const value = textarea.value;
    const lineStart = value.lastIndexOf("\n", start - 1) + 1;
    const currentLine = value.slice(lineStart, start);
    const baseIndent = currentLine.match(/^[\t ]*/)?.[0] || "";
    const indentUnit = this.config.sourceSmartTabs
      ? this.getSourceIndentUnit()
      : "";
    const before = value.slice(0, start);
    const after = value.slice(end);
    const open = before.match(/<([a-zA-Z][\w:-]*)(?:(?!<).)*?>$/);
    const close = after.match(/^<\/([a-zA-Z][\w:-]*)>/);
    const matchingTags = !!(
      open &&
      close &&
      open[1] === close[1] &&
      !VOID_TAGS.has(open[1].toLowerCase())
    );
    const extra = /[\[{(]\s*$/.test(before) || matchingTags;
    const nextIndent = baseIndent + (extra ? indentUnit : "");
    const trailing = matchingTags ? `\n${baseIndent}` : "";
    textarea.setRangeText(`\n${nextIndent}${trailing}`, start, end, "end");
    const caret = start + 1 + nextIndent.length;
    textarea.setSelectionRange(caret, caret);
    this.sourceMutated("source:newline");
  }

  handleSourceTagClose() {
    const textarea = this.source;
    if (textarea.selectionStart !== textarea.selectionEnd) return false;
    const before = textarea.value.slice(0, textarea.selectionStart);
    const match = before.match(/<([a-zA-Z][\w:-]*)([^<>]*)$/);
    if (!match) return false;
    const tagName = match[1];
    if (
      VOID_TAGS.has(tagName.toLowerCase()) ||
      /\/$/.test((match[2] || "").trim())
    )
      return false;
    const start = textarea.selectionStart;
    const closing = `></${tagName}>`;
    textarea.setRangeText(closing, start, textarea.selectionEnd, "end");
    textarea.setSelectionRange(start + 1, start + 1);
    this.sourceMutated("source:close-tag");
    return true;
  }

  getSourceIndentUnit() {
    if (
      typeof this.config.sourceIndentUnit === "string" &&
      this.config.sourceIndentUnit.length
    )
      return this.config.sourceIndentUnit;
    const match = this.source?.value.match(/^(\t+| {2,8})\S/m);
    return match ? match[1] : "  ";
  }

  applySourcePreferences() {
    if (!this.source) return;
    const indentUnit = this.getSourceIndentUnit();
    this.source.setAttribute(
      "wrap",
      this.config.sourceWrapLines ? "soft" : "off",
    );
    this.source.dataset.wrapMode = this.config.sourceWrapLines ? "soft" : "off";
    this.sourceWrap.classList.toggle(
      "feather-source-wrapped",
      !!this.config.sourceWrapLines,
    );
    this.sourceWrap.style.setProperty(
      "--feather-source-indent",
      indentUnit.replace(/ /g, "\u00a0"),
    );
    this.wrapper.style.setProperty(
      "--feather-source-tab-size",
      String(this.config.sourceTabSize || 4),
    );
    for (const [control, active] of [
      [this.sourceWrapToggle, this.config.sourceWrapLines],
      [this.sourceSmartTabsToggle, this.config.sourceSmartTabs],
      [this.sourceAutoCloseToggle, this.config.sourceAutoClose],
    ]) {
      if (!control) continue;
      control.classList.toggle("is-active", !!active);
      control.setAttribute("aria-pressed", active ? "true" : "false");
    }
  }

  toggleSourceSetting(setting) {
    if (
      !["sourceWrapLines", "sourceSmartTabs", "sourceAutoClose"].includes(
        setting,
      )
    )
      return this;
    this.config[setting] = !this.config[setting];
    this.applySourcePreferences();
    this.scheduleSourceRefresh(true);
    this.emit("configchange", { changed: [setting], config: this.getConfig() });
    return this;
  }

  updateSourceControlsState() {
    if (this.sourceHeader)
      this.sourceHeader.style.display = this.isSource ? "flex" : "none";
  }

  scheduleSourceRefresh(forceGutter = false) {
    if (forceGutter) this._forceSourceGutterRefresh = true;
    if (this._sourceRefreshHandle) return;
    this._sourceRefreshHandle = this._scheduleFrame(() => {
      this._sourceRefreshHandle = null;
      this.renderGutter(this._forceSourceGutterRefresh);
      this._forceSourceGutterRefresh = false;
      this.highlightSource();
    });
  }

  syncSourceScroll() {
    if (this.sourceGutter) this.sourceGutter.scrollTop = this.source.scrollTop;
    if (this.codeOverlay) {
      this.codeOverlay.scrollTop = this.source.scrollTop;
      this.codeOverlay.scrollLeft = this.source.scrollLeft;
    }
  }

  renderGutter(force = false) {
    if (!this.sourceGutter) return;
    const lines = (this.source.value.match(/\n/g)?.length || 0) + 1;
    if (!force && this._sourceLineCount === lines) {
      this.syncSourceScroll();
      return;
    }
    this._sourceLineCount = lines;
    const fragment = this.document.createDocumentFragment();
    for (let line = 1; line <= lines; line += 1) {
      const span = this.document.createElement("span");
      span.textContent = String(line);
      fragment.appendChild(span);
    }
    this.sourceGutter.replaceChildren(fragment);
    this.syncSourceScroll();
  }

  escapeHTML(value) {
    return escapeHTML(value)
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
  }

  highlightHTML(source) {
    let output = this.escapeHTML(source);
    output = output.replace(
      /(&lt;!--[\s\S]*?--&gt;)/g,
      '<span class="tok-com">$1</span>',
    );
    output = output.replace(
      /&lt;(\/)?([a-zA-Z][\w:-]*)([^>]*?)&gt;/g,
      (_match, slash, name, rest) => {
        const attributes = rest
          .replace(
            /([a-zA-Z_:][\w:.-]*)(=)/g,
            '<span class="tok-attr">$1</span>$2',
          )
          .replace(/("[^"]*"|'[^']*')/g, '<span class="tok-str">$1</span>')
          .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="tok-num">$1</span>');
        return `&lt;${slash ? "/" : ""}<span class="tok-tag">${name}</span>${attributes}&gt;`;
      },
    );
    return output;
  }

  highlightCSS(source) {
    let output = this.escapeHTML(source);
    output = output.replace(
      /\/\*[\s\S]*?\*\//g,
      (match) => `<span class="tok-com">${match}</span>`,
    );
    output = output.replace(/(@[a-zA-Z-]+)/g, '<span class="tok-kw">$1</span>');
    output = output.replace(
      /([a-zA-Z-]+)(\s*:\s*)/g,
      '<span class="tok-attr">$1</span>$2',
    );
    output = output.replace(
      /\b(\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw)?)\b/g,
      '<span class="tok-num">$1</span>',
    );
    return output;
  }

  highlightJS(source) {
    let output = this.escapeHTML(source);
    output = output.replace(
      /\/\/.*$/gm,
      (match) => `<span class="tok-com">${match}</span>`,
    );
    output = output.replace(
      /\/\*[\s\S]*?\*\//g,
      (match) => `<span class="tok-com">${match}</span>`,
    );
    output = output.replace(
      /`([^`\\]|\\.)*`|"([^"\\]|\\.)*"|'([^'\\]|\\.)*'/g,
      (match) => `<span class="tok-str">${match}</span>`,
    );
    output = output.replace(
      /\b(0x[\da-fA-F]+|\d+(?:\.\d+)?(?:e[+-]?\d+)?)\b/g,
      '<span class="tok-num">$1</span>',
    );
    const keywords =
      /\b(abstract|arguments|await|boolean|break|byte|case|catch|char|class|const|continue|debugger|default|delete|do|double|else|enum|export|extends|false|final|finally|float|for|function|goto|if|implements|import|in|instanceof|int|interface|let|long|native|new|null|package|private|protected|public|return|short|static|super|switch|synchronized|this|throw|throws|transient|true|try|typeof|var|void|volatile|while|with|yield)\b/g;
    return output.replace(keywords, '<span class="tok-kw">$1</span>');
  }

  highlightJSON(source) {
    let output = this.escapeHTML(source);
    output = output.replace(
      /"([^"\\]|\\.)*"(?=\s*:)/g,
      '<span class="tok-attr">$&</span>',
    );
    output = output.replace(
      /"([^"\\]|\\.)*"/g,
      '<span class="tok-str">$&</span>',
    );
    output = output.replace(
      /\b(true|false|null)\b/g,
      '<span class="tok-kw">$1</span>',
    );
    return output.replace(
      /\b(\d+(?:\.\d+)?(?:e[+-]?\d+)?)\b/g,
      '<span class="tok-num">$1</span>',
    );
  }

  highlightSource() {
    if (!this.codeOverlay) return;
    const text = this.source?.value || "";
    const threshold = Math.max(
      0,
      Number(this.config.sourceHighlightThreshold) || 0,
    );
    if (threshold && text.length > threshold) {
      this.codeOverlay.textContent = text;
      this.sourceWrap.dataset.highlight = "plain";
      this.syncSourceScroll();
      return;
    }
    const language = (this.sourceLanguage || "html").toLowerCase();
    let markup;
    if (language === "html" || language === "xml")
      markup = this.highlightHTML(text);
    else if (language === "css") markup = this.highlightCSS(text);
    else if (language === "javascript" || language === "js")
      markup = this.highlightJS(text);
    else if (language === "json") markup = this.highlightJSON(text);
    else markup = this.escapeHTML(text);
    this.codeOverlay.innerHTML = markup;
    this.sourceWrap.dataset.highlight = "syntax";
    this.syncSourceScroll();
  }

  selectBracketPair() {
    const textarea = this.source;
    const text = textarea.value;
    let position = textarea.selectionStart;
    const brackets = "()[]{}<>";
    if (
      position > 0 &&
      !brackets.includes(text[position]) &&
      brackets.includes(text[position - 1])
    )
      position -= 1;
    const character = text[position];
    const pairs = { "<": ">", ...SOURCE_BRACKET_PAIRS };
    const reverse = { ")": "(", "]": "[", "}": "{", ">": "<" };
    if (pairs[character]) {
      let depth = 0;
      for (let index = position; index < text.length; index += 1) {
        if (text[index] === character) depth += 1;
        else if (text[index] === pairs[character] && --depth === 0) {
          textarea.setSelectionRange(position + 1, index);
          return true;
        }
      }
    } else if (reverse[character]) {
      let depth = 0;
      for (let index = position; index >= 0; index -= 1) {
        if (text[index] === character) depth += 1;
        else if (text[index] === reverse[character] && --depth === 0) {
          textarea.setSelectionRange(index + 1, position);
          return true;
        }
      }
    }
    return false;
  }

  updateCounts() {
    if (!this.statusBar) return;
    let text;
    if (this.isSource) {
      text = htmlToText(this.source.value, { document: this.document });
    } else text = this.getText();
    if (this.wordCountEl)
      this.wordCountEl.textContent = String(
        text.trim().split(/\s+/).filter(Boolean).length,
      );
    if (this.charCountEl) this.charCountEl.textContent = String(text.length);
  }

  scheduleCountsUpdate() {
    if (!this.statusBar) return;
    if (!this.config.countDebounceMs) {
      this.updateCounts();
      return;
    }
    if (this._countDebounceTimer) clearTimeout(this._countDebounceTimer);
    this._countDebounceTimer = setTimeout(() => {
      this._countDebounceTimer = null;
      this.updateCounts();
    }, this.config.countDebounceMs);
  }

  flushCountsUpdate() {
    if (this._countDebounceTimer) clearTimeout(this._countDebounceTimer);
    this._countDebounceTimer = null;
    this.updateCounts();
  }

  saveSelection() {
    return this.selectionManager?.save() || false;
  }

  restoreSelection() {
    return this.selectionManager?.restoreSaved() || false;
  }

  isNodeWithinEditor(node) {
    return this.selectionManager?.contains(node) || false;
  }

  updateToolbarState() {
    const mapping = [
      ["bold", "bold"],
      ["italic", "italic"],
      ["underline", "underline"],
      ["strikeThrough", "strikethrough"],
    ];
    for (const [command, name] of mapping) {
      const active = this.commandManager.queryState(command);
      const control = this.toolbar?.querySelector(`[data-command="${name}"]`);
      if (control) {
        control.classList.toggle("is-active", active);
        control.setAttribute("aria-pressed", active ? "true" : "false");
      }
    }
  }

  applyInlineStyle(property, value) {
    if (this.isMutationBlocked()) return false;
    const selection = this.window.getSelection?.();
    if (!selection?.rangeCount) return false;
    const range = selection.getRangeAt(0);
    if (!this.selectionManager.contains(range.commonAncestorContainer))
      return false;
    if (range.collapsed) {
      const span = this.document.createElement("span");
      span.style[property] = value;
      const marker = this.document.createTextNode("\u200B");
      span.appendChild(marker);
      range.insertNode(span);
      const nextRange = this.document.createRange();
      nextRange.setStart(marker, 1);
      nextRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(nextRange);
      return true;
    }
    const span = this.document.createElement("span");
    span.style[property] = value;
    try {
      range.surroundContents(span);
    } catch {
      span.appendChild(range.extractContents());
      range.insertNode(span);
    }
    const nextRange = this.document.createRange();
    nextRange.selectNodeContents(span);
    selection.removeAllRanges();
    selection.addRange(nextRange);
    this.mergeSimilarSpans(span.parentElement || this.editor);
    return true;
  }

  mergeSimilarSpans(root) {
    if (!root) return;
    const equal = (left, right) =>
      left?.tagName === "SPAN" &&
      right?.tagName === "SPAN" &&
      (left.getAttribute("style") || "") ===
        (right.getAttribute("style") || "");
    let changed = true;
    while (changed) {
      changed = false;
      for (const span of [...root.querySelectorAll("span")]) {
        if (equal(span, span.parentElement)) {
          while (span.firstChild)
            span.parentElement.insertBefore(span.firstChild, span);
          span.remove();
          changed = true;
          break;
        }
        if (equal(span, span.nextSibling)) {
          const next = span.nextSibling;
          while (next.firstChild) span.appendChild(next.firstChild);
          next.remove();
          changed = true;
          break;
        }
      }
    }
  }

  clearColor(kind) {
    const property = kind === "fore" ? "color" : "backgroundColor";
    const selection = this.window.getSelection?.();
    if (!selection?.rangeCount) return false;
    const range = selection.getRangeAt(0);
    const container =
      range.commonAncestorContainer.nodeType === 1
        ? range.commonAncestorContainer
        : range.commonAncestorContainer.parentElement;
    const walker = this.document.createTreeWalker(
      container,
      this.window.NodeFilter.SHOW_ELEMENT,
    );
    const elements = [];
    while (walker.nextNode())
      if (range.intersectsNode(walker.currentNode))
        elements.push(walker.currentNode);
    for (const element of elements) {
      if (element.style?.[property]) {
        element.style[property] = "";
        if (!element.getAttribute("style")) element.removeAttribute("style");
      }
    }
    return true;
  }

  clearFormatting() {
    if (this.isMutationBlocked()) return false;
    this.commandManager.execute("removeFormat", null, {
      label: "format:clear",
    });
    return this;
  }

  async copyAction() {
    if (this.isSource) {
      const selection =
        this.source.value.slice(
          this.source.selectionStart,
          this.source.selectionEnd,
        ) || this.source.value;
      try {
        await this.window.navigator?.clipboard?.writeText(selection);
      } catch (error) {
        this.reportError("clipboard:copy", error);
      }
      return this;
    }
    const copied = this.commandManager.execute("copy", null, {
      mutating: false,
    });
    if (!copied && this.window.navigator?.clipboard?.writeText) {
      const text = this.window.getSelection?.().toString() || this.getText();
      try {
        await this.window.navigator.clipboard.writeText(text);
      } catch (error) {
        this.reportError("clipboard:copy", error);
      }
    }
    return this;
  }

  async pasteAction() {
    if (this.isMutationBlocked()) return false;
    try {
      const text = await this.window.navigator?.clipboard?.readText?.();
      if (!text) return this;
      if (this.isSource) {
        this.source.setRangeText(
          text,
          this.source.selectionStart,
          this.source.selectionEnd,
          "end",
        );
        this.sourceMutated("paste:source");
      } else if (this.config.sanitizePaste)
        this.commandManager.execute("insertText", text, {
          label: "paste:clipboard",
        });
      else {
        const markup = escapeHTML(text).replace(/\r?\n/g, "<br>");
        this.commandManager.execute("insertHTML", markup, {
          label: "paste:clipboard",
        });
      }
      return this;
    } catch (error) {
      this.reportError("clipboard:paste", error);
      return false;
    }
  }

  handleToolbarKeydown(event) {
    const target = event.target;
    if (!target || target.tagName === "SELECT") return;
    const container = target.closest?.(
      ".feather-toolbar, .feather-source-toolbar",
    );
    if (
      !container ||
      !["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)
    )
      return;
    const focusable = [
      ...container.querySelectorAll(
        "button:not([disabled]), select:not([disabled])",
      ),
    ];
    const index = focusable.indexOf(target);
    if (index < 0 || !focusable.length) return;
    event.preventDefault();
    if (event.key === "Home") focusable[0].focus();
    else if (event.key === "End") focusable.at(-1).focus();
    else {
      const direction = event.key === "ArrowRight" ? 1 : -1;
      focusable[
        (index + direction + focusable.length) % focusable.length
      ].focus();
    }
  }

  getTooltipTarget(target) {
    const host = target?.closest?.("[data-feather-tooltip]");
    if (
      !host ||
      host === this.editor ||
      host === this.source ||
      host.closest(".feather-editor, .feather-source")
    )
      return null;
    return host;
  }

  ensureTooltip() {
    if (this.tooltipEl) return this.tooltipEl;
    const tooltip = this.document.createElement("div");
    tooltip.className = "feather-tooltip";
    tooltip.setAttribute("role", "tooltip");
    tooltip.hidden = true;
    (this.document.body || this.wrapper).appendChild(tooltip);
    this.tooltipEl = tooltip;
    this.syncTooltipTheme();
    return tooltip;
  }

  syncTooltipTheme() {
    if (!this.tooltipEl) return;
    this.themeController?.copyTo(this.tooltipEl);
    this.tooltipEl.classList.toggle("feather-fancy", !!this.config.fancy);
  }

  handleTooltipPointer(event, entering) {
    const target = this.getTooltipTarget(event.target);
    if (entering) {
      if (target) this.showTooltip(target);
    } else if (
      target &&
      target === this.tooltipAnchor &&
      !(event.relatedTarget && target.contains(event.relatedTarget))
    )
      this.hideTooltip();
  }

  handleTooltipFocus(target, entering, relatedTarget) {
    const host = this.getTooltipTarget(target);
    if (!host) return;
    if (entering) this.showTooltip(host);
    else if (
      !(relatedTarget && host.contains(relatedTarget)) &&
      host === this.tooltipAnchor
    )
      this.hideTooltip();
  }

  showTooltip(target) {
    const text = target?.dataset?.featherTooltip;
    if (!text) return;
    const tooltip = this.ensureTooltip();
    this.tooltipAnchor = target;
    tooltip.textContent = text;
    tooltip.hidden = false;
    tooltip.classList.add("is-visible");
    this.positionTooltip();
  }

  positionTooltip() {
    if (!this.tooltipEl || !this.tooltipAnchor || this.tooltipEl.hidden) return;
    if (this.tooltipFrame) this._cancelFrame(this.tooltipFrame);
    this.tooltipFrame = this._scheduleFrame(() => {
      this.tooltipFrame = null;
      if (!this.tooltipEl || !this.tooltipAnchor) return;
      const anchor = this.tooltipAnchor.getBoundingClientRect();
      const tooltip = this.tooltipEl.getBoundingClientRect();
      const offset = Number(this.config.tooltipOffset) || 14;
      const width = this.window.innerWidth || 1024;
      const height = this.window.innerHeight || 768;
      const left = Math.min(
        Math.max(8, anchor.left + anchor.width / 2 - tooltip.width / 2),
        Math.max(8, width - tooltip.width - 8),
      );
      const fitsAbove = anchor.top >= tooltip.height + offset + 8;
      const fitsBelow = height - anchor.bottom >= tooltip.height + offset + 8;
      const side = fitsAbove || !fitsBelow ? "top" : "bottom";
      let top =
        side === "top"
          ? anchor.top - tooltip.height - offset
          : anchor.bottom + offset;
      top = Math.min(
        Math.max(8, top),
        Math.max(8, height - tooltip.height - 8),
      );
      this.tooltipEl.style.left = `${left}px`;
      this.tooltipEl.style.top = `${top}px`;
      this.tooltipEl.dataset.side = side;
    });
  }

  hideTooltip() {
    if (!this.tooltipEl) return;
    this.tooltipAnchor = null;
    this.tooltipEl.hidden = true;
    this.tooltipEl.classList.remove("is-visible");
  }

  disposeTooltip() {
    this.tooltipEl?.remove();
    this.tooltipEl = null;
    this.tooltipAnchor = null;
  }

  activeSurface() {
    return this.isSource ? this.source : this.editor;
  }

  isMutationBlocked() {
    return !!(this.config.disabled || this.config.readOnly);
  }

  applyInteractiveState() {
    if (!this.editor) return;
    const blocked = this.isMutationBlocked();
    this.editor.contentEditable = blocked ? "false" : "true";
    this.editor.setAttribute("contenteditable", blocked ? "false" : "true");
    this.editor.setAttribute("aria-readonly", blocked ? "true" : "false");
    this.source.readOnly = !!this.config.readOnly;
    this.source.disabled = !!this.config.disabled;
    this.wrapper.classList.toggle("feather-readonly", !!this.config.readOnly);
    this.wrapper.classList.toggle("feather-disabled", !!this.config.disabled);
    this.wrapper.setAttribute(
      "aria-disabled",
      this.config.disabled ? "true" : "false",
    );
    for (const control of this.toolbar.querySelectorAll(
      "button, select, input",
    )) {
      const command = control.closest?.("[data-command]")?.dataset.command;
      const allowedReadOnly = ["copy", "fullscreen", "source"].includes(
        command,
      );
      control.disabled =
        !!this.config.disabled || (!!this.config.readOnly && !allowedReadOnly);
    }
    for (const control of this.sourceHeader.querySelectorAll("button, select"))
      control.disabled = !!this.config.disabled || !!this.config.readOnly;
    if ("disabled" in this.element)
      this.element.disabled = !!this.config.disabled;
    if ("readOnly" in this.element)
      this.element.readOnly = !!this.config.readOnly;
  }

  getHTML() {
    return this.isSource ? this.source.value : this.editor.innerHTML;
  }

  setContent(value, { history = true, notify = true } = {}) {
    const html = value == null ? "" : String(value);
    const applied = replaceElementHTML(
      this.editor,
      this.renderSourceToHTML(html),
      { document: this.document },
    );
    this.source.value = applied;
    this.syncOriginal(applied);
    this.flushCountsUpdate();
    this.scheduleSourceRefresh(true);
    if (history && this.transactionHistory)
      this.transactionHistory.commit("api:setHTML");
    if (notify) this.notifyChange("api:setHTML");
    return this;
  }

  setHTML(html) {
    return this.setContent(html);
  }

  setUntrustedHTML(html) {
    return this.setContent(
      sanitizeUntrustedHTML(html, { document: this.document }),
    );
  }

  pasteIntoSource(sourceText) {
    if (this.isMutationBlocked()) return false;
    const value = String(sourceText ?? "");
    if (!value) return this;
    const start = this.source.selectionStart ?? this.source.value.length;
    const end = this.source.selectionEnd ?? start;
    const insertStart =
      start === 0 && end === 0 && this.source.value.length
        ? this.source.value.length
        : start;
    const insertEnd =
      start === 0 && end === 0 && this.source.value.length
        ? this.source.value.length
        : end;
    this.source.setRangeText(value, insertStart, insertEnd, "end");
    replaceElementHTML(
      this.editor,
      this.renderSourceToHTML(this.source.value),
      { document: this.document },
    );
    this.sourceMutated("api:paste-source");
    return this;
  }

  getText() {
    return this.editor.innerText ?? this.editor.textContent ?? "";
  }

  clear() {
    return this.setHTML("");
  }

  focus() {
    if (!this.config.disabled) this.activeSurface().focus();
    return this;
  }

  disable() {
    return this.setDisabled(true);
  }

  enable() {
    return this.setDisabled(false);
  }

  setDisabled(disabled) {
    return this.setConfig({ disabled: !!disabled });
  }

  setReadOnly(readOnly) {
    return this.setConfig({ readOnly: !!readOnly });
  }

  setTheme(theme) {
    return this.setConfig({ theme });
  }

  setLanguage(language) {
    return this.setConfig({ language });
  }

  applyTheme(theme) {
    this.themeController?.set(theme);
    this.syncTooltipTheme();
    return this;
  }

  resolveThemeName(theme) {
    return this.themeController?.resolve(theme).name || "dark";
  }

  setToolbar(toolbar) {
    return this.setConfig({ toolbar });
  }

  setPlaceholder(placeholder) {
    return this.setConfig({ placeholder });
  }

  setHeight(height) {
    return this.setConfig({ height });
  }

  setFancy(enabled) {
    return this.setConfig({ fancy: !!enabled });
  }

  applyPresentationOptions() {
    if (!this.wrapper) return this;
    this.wrapper.classList.toggle("feather-fancy", !!this.config.fancy);
    this.wrapper.classList.toggle(
      "feather-theme-transitions",
      !!this.config.themeTransitions,
    );
    this.syncTooltipTheme();
    return this;
  }

  applyLanguage() {
    if (!this.wrapper) return this;
    this.wrapper.lang = this.config.language;
    this.toolbar?.setAttribute("aria-label", this.t("toolbar.label"));
    this.sourceHeader?.setAttribute("aria-label", this.t("source.label"));
    this.sourceLanguageSelect?.setAttribute(
      "aria-label",
      this.t("source.syntaxMode"),
    );
    const syntaxWrapper = this.sourceLanguageSelect?.closest?.(".feather-select");
    if (syntaxWrapper)
      syntaxWrapper.dataset.featherTooltip = this.t("source.chooseSyntax");
    const settingKeys = {
      sourceWrapLines: "source.wrapLines",
      sourceSmartTabs: "source.smartTabs",
      sourceAutoClose: "source.autoCloseTags",
    };
    for (const [setting, key] of Object.entries(settingKeys)) {
      const control = this.sourceHeader?.querySelector(`[data-setting="${setting}"]`);
      if (!control) continue;
      const label = this.t(key);
      control.setAttribute("aria-label", label);
      control.dataset.featherTooltip = label;
    }
    this.editor?.setAttribute(
      "placeholder",
      this.localizedConfigText("placeholder", "editor.placeholder"),
    );
    this.editor?.setAttribute(
      "aria-label",
      this.localizedConfigText("ariaLabel", "editor.ariaLabel"),
    );
    this.source?.setAttribute(
      "aria-label",
      this.localizedConfigText("sourceAriaLabel", "editor.sourceAriaLabel"),
    );
    this.autosaveManager?.refreshStatus();
    return this;
  }

  setAttribution() {
    return this.setConfig({ attribution: true, supportLink: true });
  }

  openFindReplace() {
    return this.findReplaceManager.open();
  }

  closeFindReplace() {
    return this.findReplaceManager.close();
  }

  find(term, options) {
    return this.findReplaceManager.find(term, options);
  }

  findNext(term, options) {
    return this.findReplaceManager.findNext(term, options);
  }

  findPrevious(term, options) {
    return this.findReplaceManager.findPrevious(term, options);
  }

  replace(replacement) {
    return this.findReplaceManager.replaceCurrent(replacement);
  }

  replaceCurrent(replacement) {
    return this.findReplaceManager.replaceCurrent(replacement);
  }

  replaceAll(term, replacement, options) {
    return this.findReplaceManager.replaceAll(term, replacement, options);
  }

  getConfig() {
    return copyConfig(this.config);
  }

  setConfig(changes = {}) {
    if (!changes || typeof changes !== "object") return this;
    const previous = this.config;
    const next = createConfig(changes, previous);
    const changed = Object.keys(changes).filter((key) =>
      valuesDiffer(previous[key], next[key]),
    );
    if (!changed.length) return this;

    const active = this.document.activeElement;
    const hadFocus = this.wrapper.contains(active);
    const focusMode =
      active === this.source
        ? "source"
        : active === this.editor
          ? "editor"
          : "wrapper";
    const selection = this.selectionManager.capture(this.isSource);
    this.transactionHistory.flush();
    this.config = next;

    if (changed.includes("theme")) this.applyTheme(this.config.theme);
    if (changed.includes("fancy") || changed.includes("themeTransitions"))
      this.applyPresentationOptions();
    if (changed.includes("language")) this.applyLanguage();
    if (changed.some((key) => STATEFUL_TOOLBAR_KEYS.has(key)))
      this.rebuildToolbar();
    if (changed.some((key) => STATUS_KEYS.has(key))) this.rebuildStatus();
    if (
      changed.some((key) =>
        ["height", "minHeight", "maxHeight", "sourceTabSize"].includes(key),
      )
    )
      this.applyDimensions();
    if (changed.includes("placeholder") || changed.includes("language"))
      this.editor.setAttribute(
        "placeholder",
        this.localizedConfigText("placeholder", "editor.placeholder"),
      );
    if (changed.includes("ariaLabel") || changed.includes("language"))
      this.editor.setAttribute(
        "aria-label",
        this.localizedConfigText("ariaLabel", "editor.ariaLabel"),
      );
    if (changed.includes("sourceAriaLabel") || changed.includes("language"))
      this.source.setAttribute(
        "aria-label",
        this.localizedConfigText("sourceAriaLabel", "editor.sourceAriaLabel"),
      );
    if (changed.includes("sourceRows"))
      this.source.rows = clampInteger(this.config.sourceRows, 1, 1000, 10);
    if (
      changed.some((key) =>
        [
          "sourceWrapLines",
          "sourceSmartTabs",
          "sourceAutoClose",
          "sourceIndentUnit",
          "sourceTabSize",
        ].includes(key),
      )
    )
      this.applySourcePreferences();
    if (changed.includes("sourceHighlightThreshold")) this.highlightSource();
    if (changed.includes("historyLimit"))
      this.transactionHistory.setLimit(this.config.historyLimit);
    if (changed.includes("historyDebounceMs"))
      this.transactionHistory.setDelay(this.config.historyDebounceMs);
    if (changed.includes("autosave") || changed.includes("autosaveInterval")) {
      this.autosaveManager
        .configure(this.config.autosave, this.config.autosaveInterval)
        .start();
      this.autosaveManager.refreshStatus();
    }
    if (changed.includes("plugins")) {
      this.destroyPlugins();
      this.installConfiguredPlugins();
    }
    this.applyInteractiveState();
    this.flushCountsUpdate();

    if (hadFocus && !this.config.disabled) {
      if (focusMode === "source" && this.isSource) this.source.focus();
      else this.activeSurface().focus();
      this.selectionManager.restore(selection, this.isSource);
    }
    this.emit("configchange", { changed, config: this.getConfig() });
    return this;
  }

  startAutosave(options = this.config.autosave) {
    if (!isAutosaveEnabled(options)) options = true;
    const needsStatus = !isAutosaveEnabled(this.config.autosave);
    this.config.autosave = options;
    if (needsStatus) this.rebuildStatus();
    this.autosaveManager
      .configure(options, this.config.autosaveInterval)
      .start();
    this.autosaveManager.refreshStatus();
    return this;
  }

  stopAutosave() {
    this.autosaveManager.stop();
    this.autosaveManager.setState("disabled", "Draft autosave off");
    return this;
  }

  clearSavedDraft() {
    this.autosaveManager.clear();
    return this;
  }

  addButton(name, definition = {}) {
    buttons[name] = {
      ...definition,
      icon: definition.icon || iconMarkup.code,
      tip: definition.tip || definition.tooltip || name,
    };
    if (!this.config.toolbar.includes(name)) this.config.toolbar.push(name);
    this.rebuildToolbar();
    return this;
  }

  removeButton(name) {
    this.toolbar.querySelector(`[data-command="${name}"]`)?.remove();
    return this;
  }

  showButton(name) {
    const control = this.toolbar.querySelector(`[data-command="${name}"]`);
    if (control) control.style.display = "";
    return this;
  }

  hideButton(name) {
    const control = this.toolbar.querySelector(`[data-command="${name}"]`);
    if (control) control.style.display = "none";
    return this;
  }

  on(type, handler) {
    if (typeof handler !== "function") return this;
    if (!this._eventListeners.has(type))
      this._eventListeners.set(type, new Set());
    this._eventListeners.get(type).add(handler);
    return this;
  }

  off(type, handler) {
    if (!handler) this._eventListeners.delete(type);
    else this._eventListeners.get(type)?.delete(handler);
    return this;
  }

  emit(type, detail = {}) {
    const payload = { editor: this, ...detail };
    for (const handler of this._eventListeners.get(type) || []) {
      try {
        handler(payload);
      } catch (error) {
        this.reportError(`event:${type}`, error);
      }
    }
    const CustomEventConstructor =
      this.window?.CustomEvent || globalThis.CustomEvent;
    if (this.wrapper?.isConnected && CustomEventConstructor) {
      this.wrapper.dispatchEvent(
        new CustomEventConstructor(`feathertext:${type}`, {
          detail: payload,
          bubbles: true,
        }),
      );
    }
    return this;
  }

  use(plugin, options) {
    let resolved = plugin;
    if (typeof plugin === "string") resolved = pluginRegistry.get(plugin);
    if (!resolved)
      throw new Error(`FeatherText: Unknown plugin ${String(plugin)}`);
    const name =
      resolved.name ||
      (typeof plugin === "string"
        ? plugin
        : `plugin-${this._plugins.length + 1}`);
    let cleanup = null;
    if (typeof resolved === "function") cleanup = resolved(this, options);
    else if (typeof resolved.init === "function")
      cleanup = resolved.init(this, options);
    this._plugins.push({ name, plugin: resolved, cleanup });
    this.emit("plugin", { action: "init", name });
    return this;
  }

  installConfiguredPlugins() {
    for (const item of this.config.plugins || []) {
      try {
        if (Array.isArray(item)) this.use(item[0], item[1]);
        else this.use(item);
      } catch (error) {
        this.reportError("plugin:init", error);
      }
    }
  }

  destroyPlugins() {
    for (const entry of [...this._plugins].reverse()) {
      try {
        if (typeof entry.cleanup === "function") entry.cleanup(this);
        else if (entry.cleanup?.destroy) entry.cleanup.destroy(this);
        else if (typeof entry.plugin?.destroy === "function")
          entry.plugin.destroy(this);
      } catch (error) {
        this.reportError(`plugin:destroy:${entry.name}`, error);
      }
    }
    this._plugins = [];
  }

  invokeCallback(name, ...args) {
    try {
      return this.config[name](...args);
    } catch (error) {
      this.reportError(name, error);
      return undefined;
    }
  }

  reportError(context, error) {
    if (this.config.logErrors && error && globalThis.console?.warn)
      console.warn(`[FeatherText] ${context}`, error);
    this.emit("error", { context, error });
  }

  cancelDeferredWork() {
    if (this._countDebounceTimer) clearTimeout(this._countDebounceTimer);
    if (this._sourceRefreshHandle) this._cancelFrame(this._sourceRefreshHandle);
    if (this.tooltipFrame) this._cancelFrame(this.tooltipFrame);
    if (this._resetTimer) clearTimeout(this._resetTimer);
    this._countDebounceTimer = null;
    this._sourceRefreshHandle = null;
    this.tooltipFrame = null;
    this._resetTimer = null;
  }

  destroy() {
    if (this._destroyed) return this;
    this._destroyed = true;
    this.transactionHistory.flush();
    this.syncOriginal(this.getHTML());
    this.emit("destroy", {});
    this.autosaveManager.destroy();
    this.findReplaceManager.destroy();
    this.cancelDeferredWork();
    this.dialogs.destroy();
    this.disposeTooltip();
    this.removeManagedListeners();
    this.destroyPlugins();
    this.transactionHistory.destroy();
    this.themeController.destroy();
    this.wrapper.remove();
    this.element.style.display = this._originalDisplay;
    this._isFocusedWithin = false;
    this._eventListeners.clear();
    return this;
  }

  static init(selector, config) {
    const nodes = globalThis.document?.querySelectorAll(selector) || [];
    return [...nodes].map((node) => new FeatherText(node, config));
  }

  static registerPlugin(name, plugin) {
    if (!name || !plugin)
      throw new Error(
        "FeatherText: A plugin name and implementation are required",
      );
    pluginRegistry.set(name, plugin);
    return FeatherText;
  }

  static unregisterPlugin(name) {
    pluginRegistry.delete(name);
    return FeatherText;
  }

  static sanitizeUntrustedHTML(html, options) {
    return sanitizeUntrustedHTML(html, options);
  }
}

export {
  buttons,
  defaultConfig,
  iconMarkup,
  isSafeUrl,
  normalizeSafeUrl,
  PROJECT_URL,
  sanitizeUntrustedHTML,
  SUPPORT_URL,
  themes,
  toSafeVideoEmbedUrl,
};
export const version =
  typeof __FEATHER_VERSION__ !== "undefined"
    ? __FEATHER_VERSION__
    : "0.0.0-dev";

FeatherText.themes = themes;
FeatherText.buttons = buttons;
FeatherText.version = version;
FeatherText.sanitizeUntrustedHTML = sanitizeUntrustedHTML;
FeatherText.normalizeSafeUrl = normalizeSafeUrl;
FeatherText.isSafeUrl = isSafeUrl;
