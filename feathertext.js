(() => {
  // src/feathertext.js
  var icon = (...nodes) => `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${nodes.join("")}</svg>`;
  var pathNode = (d) => `<path d="${d}"></path>`;
  var lineNode = (x1, y1, x2, y2) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}"></line>`;
  var rectNode = (x, y, width, height, rx) => `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${rx}" ry="${rx}"></rect>`;
  var circleNode = (cx, cy, r) => `<circle cx="${cx}" cy="${cy}" r="${r}"></circle>`;
  var polylineNode = (points) => `<polyline points="${points}"></polyline>`;
  var iconMarkup = Object.freeze({
    bold: icon(pathNode("M7 5h6a4 4 0 1 1 0 8H7z"), pathNode("M7 13h8a4 4 0 1 1 0 8H7z")),
    italic: icon(lineNode(19, 4, 10, 4), lineNode(14, 20, 5, 20), lineNode(15, 4, 9, 20)),
    underline: icon(pathNode("M6 4v7a6 6 0 0 0 12 0V4"), lineNode(4, 20, 20, 20)),
    strikethrough: icon(pathNode("M16 5H9a3 3 0 0 0 0 6h6a3 3 0 0 1 0 6H6"), lineNode(4, 12, 20, 12)),
    link: icon(pathNode("M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07L12 9"), pathNode("M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07L12 15")),
    unlink: icon(pathNode("M10 13a5 5 0 0 0 7.54.54l2.46-2.46"), pathNode("M14 11a5 5 0 0 0-7.54-.54L4 13a5 5 0 0 0 7.07 7.07"), lineNode(3, 3, 21, 21)),
    image: icon(rectNode(3, 4, 18, 16, 2), circleNode(8.5, 9, 1.5), pathNode("m21 15-5-5L5 21")),
    video: icon(rectNode(3, 5, 14, 14, 2), polylineNode("17 10 22 7 22 17 17 14")),
    table: icon(rectNode(3, 4, 18, 16, 2), lineNode(3, 10, 21, 10), lineNode(3, 16, 21, 16), lineNode(9, 4, 9, 20), lineNode(15, 4, 15, 20)),
    ul: icon(circleNode(4, 7, 1), circleNode(4, 12, 1), circleNode(4, 17, 1), lineNode(8, 7, 20, 7), lineNode(8, 12, 20, 12), lineNode(8, 17, 20, 17)),
    ol: icon(pathNode("M4 7h1v4"), lineNode(3, 11, 5, 11), pathNode("M3 15h2l-2 4h2"), lineNode(8, 7, 20, 7), lineNode(8, 12, 20, 12), lineNode(8, 17, 20, 17)),
    indent: icon(lineNode(4, 6, 20, 6), lineNode(10, 12, 20, 12), lineNode(10, 18, 20, 18), polylineNode("4 12 8 16 8 8 4 12")),
    outdent: icon(lineNode(4, 6, 20, 6), lineNode(4, 12, 14, 12), lineNode(4, 18, 20, 18), polylineNode("8 8 12 12 8 16")),
    alignleft: icon(lineNode(4, 6, 20, 6), lineNode(4, 10, 14, 10), lineNode(4, 14, 20, 14), lineNode(4, 18, 12, 18)),
    aligncenter: icon(lineNode(4, 6, 20, 6), lineNode(7, 10, 17, 10), lineNode(4, 14, 20, 14), lineNode(8, 18, 16, 18)),
    alignright: icon(lineNode(4, 6, 20, 6), lineNode(10, 10, 20, 10), lineNode(4, 14, 20, 14), lineNode(12, 18, 20, 18)),
    alignjustify: icon(lineNode(4, 6, 20, 6), lineNode(4, 10, 20, 10), lineNode(4, 14, 20, 14), lineNode(4, 18, 20, 18)),
    blockquote: icon(pathNode("M7 8h4v5H7l2 4"), pathNode("M15 8h4v5h-4l2 4")),
    code: icon(polylineNode("9 18 3 12 9 6"), polylineNode("15 6 21 12 15 18"), lineNode(14, 4, 10, 20)),
    hr: icon(lineNode(4, 12, 20, 12)),
    undo: icon(pathNode("M9 7H4v5"), pathNode("M4 12a8 8 0 1 1 2.34 5.66")),
    redo: icon(pathNode("M15 7h5v5"), pathNode("M20 12a8 8 0 1 0-2.34 5.66")),
    fullscreen: icon(polylineNode("8 3 3 3 3 8"), lineNode(3, 3, 9, 9), polylineNode("16 3 21 3 21 8"), lineNode(15, 9, 21, 3), polylineNode("3 16 3 21 8 21"), lineNode(3, 21, 9, 15), polylineNode("16 21 21 21 21 16"), lineNode(15, 15, 21, 21)),
    source: icon(polylineNode("8 18 2 12 8 6"), polylineNode("16 6 22 12 16 18"), lineNode(14, 4, 10, 20)),
    copy: icon(rectNode(9, 9, 11, 11, 2), pathNode("M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1")),
    paste: icon(pathNode("M8 4h8"), rectNode(6, 3, 12, 18, 2), rectNode(9, 1, 6, 4, 1), lineNode(9, 11, 15, 11), lineNode(9, 15, 15, 15)),
    clearformat: icon(pathNode("M5 5h14"), pathNode("M7 5l5 14"), lineNode(16, 13, 20, 17), lineNode(20, 13, 16, 17)),
    wrap: icon(lineNode(4, 6, 20, 6), lineNode(4, 12, 16, 12), polylineNode("13 9 16 12 13 15"), lineNode(4, 18, 10, 18)),
    braces: icon(polylineNode("10 5 6 12 10 19"), polylineNode("14 5 18 12 14 19")),
    palette: icon(pathNode("M12 3a9 9 0 1 0 0 18c1.1 0 2-.9 2-2 0-.63-.29-1.23-.78-1.62A2.25 2.25 0 0 1 15 13.75h1.75A4.25 4.25 0 0 0 21 9.5C21 5.91 16.97 3 12 3z"), circleNode(7.5, 10.5, 0.8), circleNode(10.5, 7.5, 0.8), circleNode(15.5, 7.5, 0.8)),
    theme: icon(circleNode(12, 12, 4), pathNode("M12 2v2"), pathNode("M12 20v2"), pathNode("m4.93 4.93 1.41 1.41"), pathNode("m17.66 17.66 1.41 1.41"), pathNode("M2 12h2"), pathNode("M20 12h2"), pathNode("m4.93 19.07 1.41-1.41"), pathNode("m17.66 6.34 1.41-1.41"))
  });
  var VOID_TAGS = /* @__PURE__ */ new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"]);
  var SOURCE_BRACKET_PAIRS = Object.freeze({ "(": ")", "[": "]", "{": "}" });
  var themes = {
    dark: { bg: "#0f1115", panel: "#151922", border: "#222938", accent: "#6ea8fe", text: "#e6e9ef", muted: "#98a2b3", hover: "#1a2030" },
    light: { bg: "#ffffff", panel: "#f8f9fa", border: "#dee2e6", accent: "#0d6efd", text: "#212529", muted: "#6c757d", hover: "#e9ecef" },
    ocean: { bg: "#0a192f", panel: "#112240", border: "#233554", accent: "#64ffda", text: "#ccd6f6", muted: "#8892b0", hover: "#172a45" },
    forest: { bg: "#0d1117", panel: "#161b22", border: "#30363d", accent: "#58a6ff", text: "#c9d1d9", muted: "#8b949e", hover: "#1f2428" },
    "dark-b": { bg: "#0c0f14", panel: "#111624", border: "#1e2636", accent: "#8ab4ff", text: "#eff3ff", muted: "#a6b1c2", hover: "#182137" },
    aurora: { bg: "#08131b", panel: "#102330", border: "#1f4350", accent: "#58f0d0", text: "#dcfbff", muted: "#8ec8cf", hover: "#173545" },
    dawn: { bg: "#fff7ee", panel: "#fffdf8", border: "#eedbc6", accent: "#c76b32", text: "#412514", muted: "#8f6c58", hover: "#fbe7d4" },
    rose: { bg: "#1d1118", panel: "#271620", border: "#4c2d3f", accent: "#ff79b3", text: "#fde8f4", muted: "#ca9db5", hover: "#341d2a" },
    graphite: { bg: "#13161b", panel: "#1b2027", border: "#303844", accent: "#d4ff5a", text: "#f6f8fb", muted: "#9fa8b8", hover: "#242b34" },
    canyon: { bg: "#20140f", panel: "#2b1d16", border: "#5b3a2b", accent: "#ffb067", text: "#fff1e6", muted: "#d5ab90", hover: "#38261e" }
  };
  var button = (iconName, tip, action) => Object.assign({ icon: iconMarkup[iconName], tip }, action);
  var buttons = {
    bold: button("bold", "Bold (Ctrl+B)", { cmd: "bold" }),
    italic: button("italic", "Italic (Ctrl+I)", { cmd: "italic" }),
    underline: button("underline", "Underline (Ctrl+U)", { cmd: "underline" }),
    strikethrough: button("strikethrough", "Strikethrough", { cmd: "strikethrough" }),
    link: button("link", "Insert Link (Ctrl+K)", { handler: "insertLink" }),
    unlink: button("unlink", "Remove Link", { cmd: "unlink" }),
    image: button("image", "Insert Image", { handler: "insertImage" }),
    video: button("video", "Insert Video", { handler: "insertVideo" }),
    table: button("table", "Insert Table", { handler: "insertTable" }),
    ul: button("ul", "Bullet List", { cmd: "insertUnorderedList" }),
    ol: button("ol", "Numbered List", { cmd: "insertOrderedList" }),
    indent: button("indent", "Increase Indent", { cmd: "indent" }),
    outdent: button("outdent", "Decrease Indent", { cmd: "outdent" }),
    alignleft: button("alignleft", "Align Left", { cmd: "justifyLeft" }),
    aligncenter: button("aligncenter", "Align Center", { cmd: "justifyCenter" }),
    alignright: button("alignright", "Align Right", { cmd: "justifyRight" }),
    alignjustify: button("alignjustify", "Justify", { cmd: "justifyFull" }),
    blockquote: button("blockquote", "Blockquote", { cmd: "formatBlock", value: "blockquote" }),
    code: button("code", "Code", { handler: "insertCode" }),
    hr: button("hr", "Horizontal Line", { cmd: "insertHorizontalRule" }),
    undo: button("undo", "Undo (Ctrl+Z)", { handler: "undo" }),
    redo: button("redo", "Redo (Ctrl+Y)", { handler: "redo" }),
    fullscreen: button("fullscreen", "Fullscreen", { handler: "toggleFullscreen" }),
    source: button("source", "View Source", { handler: "toggleSource" }),
    copy: button("copy", "Copy", { handler: "copyAction" }),
    paste: button("paste", "Paste", { handler: "pasteAction" }),
    clearformat: button("clearformat", "Clear Formatting", { handler: "clearFormatting" })
  };
  var defaultConfig = {
    theme: "dark",
    toolbar: [
      "format",
      "fontname",
      "fontsize",
      "|",
      "bold",
      "italic",
      "underline",
      "strikethrough",
      "|",
      "link",
      "unlink",
      "image",
      "video",
      "table",
      "|",
      "ul",
      "ol",
      "indent",
      "outdent",
      "|",
      "alignleft",
      "aligncenter",
      "alignright",
      "alignjustify",
      "|",
      "blockquote",
      "code",
      "clearformat",
      "hr",
      "|",
      "forecolor",
      "backcolor",
      "|",
      "undo",
      "redo",
      "|",
      "fullscreen",
      "source",
      "copy",
      "paste"
    ],
    headings: ["P", "H1", "H2", "H3", "H4", "H5", "H6"],
    sanitizePaste: true,
    placeholder: "Start typing...",
    autosave: false,
    autosaveInterval: 3e4,
    wordCount: true,
    charCount: true,
    maxLength: null,
    height: "auto",
    minHeight: 220,
    maxHeight: 600,
    fonts: ["Arial", "Georgia", "Impact", "Tahoma", "Times New Roman", "Verdana", "Courier New", "Comic Sans MS"],
    fontSizes: ["10px", "12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "36px"],
    onReady: null,
    onChange: null,
    onFocus: null,
    onBlur: null,
    onPaste: null,
    onKeydown: null,
    startInSource: false,
    ariaLabel: "Rich text editor",
    sourceAriaLabel: "HTML source editor",
    historyLimit: 50,
    countDebounceMs: 200,
    pasteMode: "auto",
    pasteFilter: null,
    sourceTabSize: 4,
    sourceWrapLines: false,
    sourceSmartTabs: true,
    sourceAutoClose: true,
    sourceIndentUnit: null,
    tooltipOffset: 14,
    logErrors: true
  };
  var FeatherText = class _FeatherText {
    constructor(element, config) {
      this.element = typeof element === "string" ? document.querySelector(element) : element;
      if (!this.element) throw new Error("FeatherText: Element not found");
      this.config = Object.assign({}, defaultConfig, config || {});
      this.id = "feather_" + Math.random().toString(36).slice(2, 10);
      this.isFullscreen = false;
      this.isSource = false;
      this.history = [];
      this.historyIndex = -1;
      this.autosaveTimer = null;
      this._savedRange = null;
      this.sourceLanguage = "html";
      this._managedListeners = [];
      this._isFocusedWithin = false;
      this._countDebounceTimer = null;
      this._sourceRefreshHandle = null;
      this._sourceLineCount = 0;
      this._forceSourceGutterRefresh = false;
      this.sourcePane = null;
      this.sourceGutter = null;
      this.sourceLanguageSelect = null;
      this.sourceWrapToggle = null;
      this.sourceSmartTabsToggle = null;
      this.sourceAutoCloseToggle = null;
      this.wordCountEl = null;
      this.charCountEl = null;
      this.tooltipEl = null;
      this.tooltipAnchor = null;
      this.tooltipText = "";
      this.tooltipFrame = null;
      this._scheduleFrame = typeof window !== "undefined" && typeof window.requestAnimationFrame === "function" ? window.requestAnimationFrame.bind(window) : function(callback) {
        return setTimeout(callback, 16);
      };
      this._cancelFrame = typeof window !== "undefined" && typeof window.cancelAnimationFrame === "function" ? window.cancelAnimationFrame.bind(window) : clearTimeout;
      this.applyTheme(this.config.theme);
      this.buildEditor();
      this.setupEvents();
      if (this.config.autosave) this.startAutosave();
      if (this.element.value) this.setHTML(this.element.value);
      if (this.config.startInSource) this.toggleSource();
      if (this.config.onReady) this.config.onReady(this);
    }
    // ----- Theme -----
    applyTheme(themeName) {
      const theme = typeof themeName === "object" ? themeName : themes[themeName] || themes.dark;
      const root = document.documentElement;
      if (typeof themeName === "string" && themes[themeName]) root.setAttribute("data-theme", themeName);
      else root.removeAttribute("data-theme");
      Object.entries(theme).forEach(([k, v]) => root.style.setProperty(`--feather-${k}`, v));
    }
    // ----- DOM -----
    buildEditor() {
      this.wrapper = document.createElement("div");
      this.wrapper.className = "feather";
      this.wrapper.id = this.id;
      this.wrapper.style.setProperty("--feather-source-tab-size", String(this.config.sourceTabSize || 4));
      this.wrapper.style.setProperty("--feather-min-height", this.resolveDimension(this.config.minHeight, "220px"));
      this.wrapper.style.setProperty("--feather-max-height", this.resolveDimension(this.config.maxHeight, "600px"));
      this.wrapper.classList.toggle("feather-fixed-height", this.config.height !== "auto");
      this.wrapper.classList.toggle("feather-scrollable", !!this.config.maxHeight);
      if (this.config.height !== "auto") this.wrapper.style.setProperty("--feather-height", this.resolveDimension(this.config.height, "auto"));
      else this.wrapper.style.removeProperty("--feather-height");
      this.toolbar = this.buildToolbar();
      this.wrapper.appendChild(this.toolbar);
      this.editor = document.createElement("div");
      this.editor.className = "feather-editor";
      this.editor.contentEditable = true;
      this.editor.setAttribute("placeholder", this.config.placeholder);
      this.editor.setAttribute("role", "textbox");
      this.editor.setAttribute("aria-multiline", "true");
      this.editor.setAttribute("aria-label", this.config.ariaLabel);
      this.editor.dataset.featherTooltip = "Rich text editor";
      this.wrapper.appendChild(this.editor);
      this.sourceWrap = document.createElement("div");
      this.sourceWrap.className = "feather-source-wrap feather-hidden";
      this.sourceHeader = this.buildSourceToolbar();
      this.sourceWrap.appendChild(this.sourceHeader);
      const pane = document.createElement("div");
      pane.className = "feather-source-pane";
      this.sourcePane = pane;
      const gutter = document.createElement("div");
      gutter.className = "feather-gutter";
      this.sourceGutter = gutter;
      this.codeOverlay = document.createElement("pre");
      this.codeOverlay.className = "feather-code";
      this.source = document.createElement("textarea");
      this.source.className = "feather-source";
      this.source.setAttribute("wrap", this.config.sourceWrapLines ? "soft" : "off");
      this.source.setAttribute("aria-label", this.config.sourceAriaLabel);
      this.source.dataset.featherTooltip = "Smart source editor";
      pane.appendChild(gutter);
      pane.appendChild(this.codeOverlay);
      pane.appendChild(this.source);
      this.sourceWrap.appendChild(pane);
      this.wrapper.appendChild(this.sourceWrap);
      if (this.config.wordCount || this.config.charCount) {
        this.statusBar = this.buildStatus();
        this.wrapper.appendChild(this.statusBar);
      }
      this.element.style.display = "none";
      this.element.parentNode.insertBefore(this.wrapper, this.element);
      this.applySourcePreferences();
    }
    buildToolbar() {
      const bar = document.createElement("div");
      bar.className = "feather-toolbar";
      bar.setAttribute("role", "toolbar");
      bar.setAttribute("aria-label", "Formatting options");
      let group = null;
      let awaiting = { fore: false, back: false };
      const ensure = () => {
        if (!group) {
          group = document.createElement("div");
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
      this.config.toolbar.forEach((item) => {
        if (item === "|") {
          flush();
          group = null;
          return;
        }
        if (item === "format") {
          flush();
          ensure();
          group.appendChild(this.createHeadingDropdown());
          return;
        }
        if (item === "fontname") {
          flush();
          ensure();
          group.appendChild(this.createFontDropdown());
          return;
        }
        if (item === "fontsize") {
          flush();
          ensure();
          group.appendChild(this.createFontSizeDropdown());
          return;
        }
        if (item === "forecolor") {
          awaiting.fore = true;
          return;
        }
        if (item === "backcolor") {
          awaiting.back = true;
          return;
        }
        const def = buttons[item];
        if (def) {
          flush();
          ensure();
          const btn = this.createToolbarButton(item);
          if (btn) group.appendChild(btn);
        }
      });
      flush();
      return bar;
    }
    buildSourceToolbar() {
      const bar = document.createElement("div");
      bar.className = "feather-source-toolbar";
      bar.id = `${this.id}_srcbar`;
      bar.setAttribute("role", "toolbar");
      bar.setAttribute("aria-label", "Source mode tools");
      const selWrap = document.createElement("div");
      selWrap.className = "feather-select";
      const sel = document.createElement("select");
      sel.id = `${this.id}_lang`;
      sel.title = "Syntax mode";
      sel.setAttribute("aria-label", "Source syntax mode");
      ["html", "css", "javascript", "xml", "json"].forEach((t) => {
        const o = document.createElement("option");
        o.value = t;
        o.textContent = t.toUpperCase();
        sel.appendChild(o);
      });
      sel.value = this.sourceLanguage;
      this.sourceLanguageSelect = sel;
      selWrap.dataset.featherTooltip = "Choose source syntax";
      selWrap.appendChild(sel);
      bar.appendChild(selWrap);
      const wrapToggle = this.createToolbarToggleButton("wrap", "Wrap lines", this.config.sourceWrapLines);
      wrapToggle.dataset.setting = "sourceWrapLines";
      this.sourceWrapToggle = wrapToggle;
      bar.appendChild(wrapToggle);
      const smartTabsToggle = this.createToolbarToggleButton("braces", "Smart tabs", this.config.sourceSmartTabs);
      smartTabsToggle.dataset.setting = "sourceSmartTabs";
      this.sourceSmartTabsToggle = smartTabsToggle;
      bar.appendChild(smartTabsToggle);
      const autoCloseToggle = this.createToolbarToggleButton("code", "Auto close tags", this.config.sourceAutoClose);
      autoCloseToggle.dataset.setting = "sourceAutoClose";
      this.sourceAutoCloseToggle = autoCloseToggle;
      bar.appendChild(autoCloseToggle);
      return bar;
    }
    createToolbarButton(name) {
      const def = buttons[name];
      if (!def) return null;
      const b = document.createElement("button");
      b.className = "feather-btn";
      b.type = "button";
      b.innerHTML = def.icon;
      b.dataset.featherTooltip = def.tip;
      b.setAttribute("aria-label", def.tip);
      b.dataset.command = name;
      b.addEventListener("mousedown", (e) => e.preventDefault());
      b.addEventListener("click", (e) => {
        e.preventDefault();
        this.exec(name, def);
      });
      return b;
    }
    createToolbarToggleButton(iconName, label, pressed) {
      const buttonEl = document.createElement("button");
      buttonEl.type = "button";
      buttonEl.className = "feather-btn feather-toggle-btn";
      buttonEl.innerHTML = iconMarkup[iconName] || iconMarkup.code;
      buttonEl.setAttribute("aria-label", label);
      buttonEl.dataset.featherTooltip = label;
      buttonEl.setAttribute("aria-pressed", pressed ? "true" : "false");
      buttonEl.classList.toggle("is-active", !!pressed);
      buttonEl.addEventListener("mousedown", (e) => e.preventDefault());
      return buttonEl;
    }
    createHeadingDropdown() {
      const wrapper = document.createElement("div");
      wrapper.className = "feather-select";
      wrapper.dataset.featherTooltip = "Paragraph format";
      const select = document.createElement("select");
      select.setAttribute("aria-label", "Paragraph format");
      this.config.headings.forEach((heading) => {
        const option = document.createElement("option");
        option.value = heading.toLowerCase();
        option.textContent = heading === "P" ? "Paragraph" : `Heading ${heading.substring(1)}`;
        select.appendChild(option);
      });
      select.addEventListener("change", () => {
        const value = select.value === "p" ? "div" : select.value;
        document.execCommand("formatBlock", false, value);
        this.updateHistory();
      });
      wrapper.appendChild(select);
      return wrapper;
    }
    createFontDropdown() {
      const wrapper = document.createElement("div");
      wrapper.className = "feather-select feather-fontname";
      wrapper.dataset.featherTooltip = "Font family";
      const select = document.createElement("select");
      select.setAttribute("aria-label", "Font family");
      this.config.fonts.forEach((font) => {
        const option = document.createElement("option");
        option.value = font;
        option.textContent = font;
        option.style.fontFamily = font;
        select.appendChild(option);
      });
      select.addEventListener("change", () => {
        this.applyInlineStyle("fontFamily", select.value);
        this.updateHistory();
      });
      wrapper.appendChild(select);
      return wrapper;
    }
    createFontSizeDropdown() {
      const wrapper = document.createElement("div");
      wrapper.className = "feather-select feather-fontsize";
      wrapper.dataset.featherTooltip = "Font size";
      const select = document.createElement("select");
      select.setAttribute("aria-label", "Font size");
      this.config.fontSizes.forEach((size) => {
        const option = document.createElement("option");
        option.value = size;
        option.textContent = size;
        select.appendChild(option);
      });
      select.addEventListener("change", () => {
        this.applyInlineStyle("fontSize", select.value);
        this.updateHistory();
      });
      wrapper.appendChild(select);
      return wrapper;
    }
    createColorPicker(kind) {
      const wrapper = document.createElement("div");
      wrapper.className = "feather-color";
      wrapper.dataset.featherTooltip = kind === "fore" ? "Text color" : "Background color";
      const input = document.createElement("input");
      input.type = "color";
      input.value = kind === "fore" ? "#000000" : "#ffff00";
      input.tabIndex = -1;
      input.setAttribute("aria-hidden", "true");
      const trigger = document.createElement("button");
      trigger.type = "button";
      trigger.className = "feather-color-trigger";
      trigger.setAttribute("aria-label", kind === "fore" ? "Text color" : "Background color");
      trigger.setAttribute("aria-haspopup", "dialog");
      trigger.addEventListener("pointerdown", () => this.saveSelection());
      trigger.addEventListener("mousedown", () => this.saveSelection());
      trigger.addEventListener("click", (e) => {
        e.preventDefault();
        input.click();
      });
      const swatch = document.createElement("span");
      swatch.className = "feather-swatch";
      const swatchInner = document.createElement("span");
      swatchInner.className = "feather-swatch-i";
      swatch.appendChild(swatchInner);
      const applySwatch = () => {
        try {
          swatchInner.style.background = input.value;
        } catch {
        }
      };
      applySwatch();
      input.addEventListener("pointerdown", () => this.saveSelection());
      input.addEventListener("mousedown", () => this.saveSelection());
      input.addEventListener("change", () => {
        this.restoreSelection();
        this.applyInlineStyle(kind === "fore" ? "color" : "backgroundColor", input.value);
        this.updateHistory();
        this.editor.focus();
        applySwatch();
      });
      trigger.appendChild(swatch);
      wrapper.appendChild(input);
      wrapper.appendChild(trigger);
      const clearBtn = document.createElement("button");
      clearBtn.type = "button";
      clearBtn.className = "feather-clear-color";
      clearBtn.dataset.featherTooltip = "Clear color";
      clearBtn.setAttribute("aria-label", kind === "fore" ? "Clear text color" : "Clear background color");
      clearBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
      clearBtn.addEventListener("click", (e) => {
        e.preventDefault();
        this.restoreSelection();
        this.clearColor(kind);
        this.updateHistory();
        this.editor.focus();
      });
      wrapper.appendChild(clearBtn);
      return wrapper;
    }
    buildStatus() {
      const statusBar = document.createElement("div");
      statusBar.className = "feather-status";
      const left = document.createElement("div");
      if (this.config.wordCount) {
        const wordCount = document.createElement("span");
        wordCount.className = "feather-badge";
        this.wordCountEl = document.createElement("span");
        this.wordCountEl.className = "feather-word-count";
        this.wordCountEl.textContent = "0";
        wordCount.appendChild(this.wordCountEl);
        wordCount.appendChild(document.createTextNode(" words"));
        left.appendChild(wordCount);
      }
      if (this.config.charCount) {
        const charCount = document.createElement("span");
        charCount.className = "feather-badge";
        this.charCountEl = document.createElement("span");
        this.charCountEl.className = "feather-char-count";
        this.charCountEl.textContent = "0";
        charCount.appendChild(this.charCountEl);
        charCount.appendChild(document.createTextNode(" chars"));
        left.appendChild(charCount);
      }
      statusBar.appendChild(left);
      const right = document.createElement("div");
      right.innerHTML = "<span>Powered by FeatherText</span>";
      statusBar.appendChild(right);
      return statusBar;
    }
    exec(name, def) {
      if (def) {
        if (def.handler) {
          this[def.handler]();
        } else if (def.exec) {
          def.exec(this);
        } else if (def.cmd) {
          this.execCommand(def.cmd, def.value || null);
          this.pushHistory();
        }
      }
      this.updateToolbarState();
      this.editor.focus();
    }
    insertLink() {
      const sel = window.getSelection();
      const getSelectedAnchor = () => {
        if (!sel || sel.rangeCount === 0) return null;
        let node = sel.anchorNode || sel.focusNode;
        if (!node) return null;
        if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
        return node ? node.closest("a") : null;
      };
      const isLikelyURL = (text) => {
        if (!text) return false;
        const t = text.trim();
        if (/^https?:\/\//i.test(t)) return true;
        return /^[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(t);
      };
      const currentAnchor = getSelectedAnchor();
      if (currentAnchor) {
        const current = currentAnchor.getAttribute("href") || "";
        const edited = prompt("Edit link URL (leave empty to remove):", current);
        if (edited === null) return;
        if (edited.trim() === "") {
          document.execCommand("unlink");
        } else {
          currentAnchor.setAttribute("href", edited.trim());
        }
        this.updateHistory();
        return;
      }
      const selectedText = sel && sel.toString ? sel.toString().trim() : "";
      const prefill = isLikelyURL(selectedText) ? selectedText.startsWith("http") ? selectedText : "https://" + selectedText : "https://";
      const url = prompt("Enter URL:", prefill);
      if (!url) return;
      if (selectedText.length === 0) {
        document.execCommand("insertHTML", false, `<a href="${url}" target="_blank" rel="noopener">${url}</a>`);
      } else {
        document.execCommand("createLink", false, url);
      }
      this.updateHistory();
    }
    insertImage() {
      const url = prompt("Enter image URL:", "https://");
      if (url) {
        document.execCommand("insertImage", false, url);
        this.updateHistory();
      }
    }
    insertVideo() {
      const url = prompt("Enter video URL (YouTube/Vimeo):", "");
      if (url) {
        let embedUrl = url;
        if (url.includes("youtube.com/watch?v=")) {
          const videoId = url.split("v=")[1].split("&")[0];
          embedUrl = `https://www.youtube.com/embed/${videoId}`;
        } else if (url.includes("vimeo.com/")) {
          const videoId = url.split("/").pop();
          embedUrl = `https://player.vimeo.com/video/${videoId}`;
        }
        const iframe = `<iframe src="${embedUrl}" width="560" height="315" frameborder="0" allowfullscreen></iframe>`;
        document.execCommand("insertHTML", false, iframe);
        this.updateHistory();
      }
    }
    insertTable() {
      const rows = prompt("Number of rows:", "3");
      const cols = prompt("Number of columns:", "3");
      if (rows && cols) {
        let table = '<table border="1" style="border-collapse: collapse; width: 100%;">';
        for (let i = 0; i < parseInt(rows); i++) {
          table += "<tr>";
          for (let j = 0; j < parseInt(cols); j++) {
            table += '<td style="padding: 8px; border: 1px solid #ddd;">&nbsp;</td>';
          }
          table += "</tr>";
        }
        table += "</table>";
        document.execCommand("insertHTML", false, table);
        this.updateHistory();
      }
    }
    insertCode() {
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const code = document.createElement("code");
        code.textContent = selection.toString() || "code";
        range.deleteContents();
        range.insertNode(code);
        this.updateHistory();
      }
    }
    toggleFullscreen() {
      this.isFullscreen = !this.isFullscreen;
      this.wrapper.classList.toggle("feather-fullscreen", this.isFullscreen);
    }
    toggleSource() {
      this.isSource = !this.isSource;
      if (this.isSource) {
        this.source.value = this.editor.innerHTML;
        this.editor.classList.add("feather-hidden");
        this.sourceWrap.classList.remove("feather-hidden");
        this.source.style.minHeight = this.editor.offsetHeight + "px";
        this.applySourcePreferences();
        this.renderGutter(true);
        this.highlightSource();
        this.source.focus();
      } else {
        this.editor.innerHTML = this.source.value;
        this.sourceWrap.classList.add("feather-hidden");
        this.editor.classList.remove("feather-hidden");
        this.flushCountsUpdate();
        this.editor.focus();
        this.pushHistory();
      }
      this.updateSourceControlsState();
    }
    setupEvents() {
      this.addManagedListener(this.wrapper, "focusin", (e) => {
        if (this.wrapper.contains(e.target)) this._isFocusedWithin = true;
        this.handleTooltipFocus(e.target, true);
      });
      this.addManagedListener(this.wrapper, "focusout", (e) => {
        this._isFocusedWithin = !!(e.relatedTarget && this.wrapper.contains(e.relatedTarget));
        this.handleTooltipFocus(e.target, false, e.relatedTarget);
      });
      this.addManagedListener(this.wrapper, "keydown", (e) => this.handleToolbarKeydown(e));
      this.addManagedListener(this.wrapper, "pointerover", (e) => this.handleTooltipPointer(e, true));
      this.addManagedListener(this.wrapper, "pointerout", (e) => this.handleTooltipPointer(e, false));
      this.addManagedListener(typeof window !== "undefined" ? window : globalThis, "scroll", () => this.positionTooltip(), true);
      this.addManagedListener(typeof window !== "undefined" ? window : globalThis, "resize", () => this.positionTooltip());
      this.addManagedListener(this.editor, "input", () => {
        this.scheduleCountsUpdate();
        this.element.value = this.getHTML();
        if (this.config.onChange) this.config.onChange(this.getHTML(), this);
      });
      this.addManagedListener(this.editor, "focus", () => {
        this._isFocusedWithin = true;
        if (this.config.onFocus) this.config.onFocus(this);
      });
      this.addManagedListener(this.editor, "blur", () => {
        this.flushCountsUpdate();
        if (this.config.onBlur) this.config.onBlur(this);
      });
      this.addManagedListener(this.editor, "paste", (e) => {
        if (this.handlePaste(e)) return;
        if (this.config.onPaste) this.config.onPaste(e, this);
      });
      this.addManagedListener(this.editor, "keydown", (e) => {
        if (e.ctrlKey || e.metaKey) {
          switch (e.key.toLowerCase()) {
            case "b":
              e.preventDefault();
              this.execCommand("bold");
              break;
            case "i":
              e.preventDefault();
              this.execCommand("italic");
              break;
            case "u":
              e.preventDefault();
              this.execCommand("underline");
              break;
            case "k":
              e.preventDefault();
              this.insertLink();
              break;
            case "z":
              e.preventDefault();
              this.undo();
              break;
            case "y":
              e.preventDefault();
              this.redo();
              break;
          }
        }
        if (this.config.onKeydown) this.config.onKeydown(e, this);
      });
      this.addManagedListener(document, "selectionchange", () => {
        if (!this.editor || this.isSource || !this._isFocusedWithin) return;
        if (this.isNodeWithinEditor(window.getSelection && window.getSelection().anchorNode)) this.updateToolbarState();
      });
      this.addManagedListener(this.source, "input", () => {
        this.element.value = this.source.value;
        this.scheduleSourceRefresh(true);
        if (this.config.onChange) this.config.onChange(this.source.value, this);
      });
      this.addManagedListener(this.source, "scroll", () => this.syncSourceScroll());
      this.addManagedListener(this.source, "keydown", (e) => this.handleSourceKeydown(e));
      if (this.sourceHeader) {
        this.addManagedListener(this.sourceHeader, "click", (e) => {
          const buttonEl = e.target.closest("button[data-setting]");
          if (!buttonEl) return;
          e.preventDefault();
          this.toggleSourceSetting(buttonEl.dataset.setting);
        });
      }
      if (this.sourceLanguageSelect) {
        this.addManagedListener(this.sourceLanguageSelect, "change", () => {
          this.sourceLanguage = this.sourceLanguageSelect.value;
          this.highlightSource();
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
      this._managedListeners.forEach(({ target, type, handler, options }) => {
        target.removeEventListener(type, handler, options);
      });
      this._managedListeners = [];
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
      if (this._countDebounceTimer) {
        clearTimeout(this._countDebounceTimer);
        this._countDebounceTimer = null;
      }
      this.updateCounts();
    }
    scheduleSourceRefresh(forceGutter) {
      if (forceGutter) this._forceSourceGutterRefresh = true;
      if (this._sourceRefreshHandle) return;
      this._sourceRefreshHandle = this._scheduleFrame(() => {
        this._sourceRefreshHandle = null;
        this.renderGutter(this._forceSourceGutterRefresh);
        this._forceSourceGutterRefresh = false;
        this.highlightSource();
      });
    }
    cancelDeferredWork() {
      if (this._countDebounceTimer) {
        clearTimeout(this._countDebounceTimer);
        this._countDebounceTimer = null;
      }
      if (this._sourceRefreshHandle) {
        this._cancelFrame(this._sourceRefreshHandle);
        this._sourceRefreshHandle = null;
      }
      this._forceSourceGutterRefresh = false;
      if (this.tooltipFrame) {
        this._cancelFrame(this.tooltipFrame);
        this.tooltipFrame = null;
      }
    }
    applySourcePreferences() {
      if (!this.source || !this.sourceWrap || !this.codeOverlay) return;
      const indentUnit = this.getSourceIndentUnit();
      this.source.setAttribute("wrap", this.config.sourceWrapLines ? "soft" : "off");
      this.source.dataset.wrapMode = this.config.sourceWrapLines ? "soft" : "off";
      this.sourceWrap.classList.toggle("feather-source-wrapped", !!this.config.sourceWrapLines);
      this.sourceWrap.style.setProperty("--feather-source-indent", indentUnit.replace(/ /g, "\xA0"));
      if (this.sourceWrapToggle) {
        this.sourceWrapToggle.classList.toggle("is-active", !!this.config.sourceWrapLines);
        this.sourceWrapToggle.setAttribute("aria-pressed", this.config.sourceWrapLines ? "true" : "false");
      }
      if (this.sourceSmartTabsToggle) {
        this.sourceSmartTabsToggle.classList.toggle("is-active", !!this.config.sourceSmartTabs);
        this.sourceSmartTabsToggle.setAttribute("aria-pressed", this.config.sourceSmartTabs ? "true" : "false");
      }
      if (this.sourceAutoCloseToggle) {
        this.sourceAutoCloseToggle.classList.toggle("is-active", !!this.config.sourceAutoClose);
        this.sourceAutoCloseToggle.setAttribute("aria-pressed", this.config.sourceAutoClose ? "true" : "false");
      }
    }
    toggleSourceSetting(setting) {
      if (!(setting in this.config)) return;
      this.config[setting] = !this.config[setting];
      this.applySourcePreferences();
      this.scheduleSourceRefresh(true);
    }
    resolveDimension(value, fallback) {
      if (value === null || value === void 0 || value === "") return fallback;
      if (typeof value === "number") return `${value}px`;
      if (typeof value === "string") return /^\d+$/.test(value) ? `${value}px` : value;
      return fallback;
    }
    isNodeWithinEditor(node) {
      for (let current = node; current; current = current.parentNode) {
        if (current === this.editor) return true;
      }
      return false;
    }
    handleToolbarKeydown(e) {
      const target = e.target;
      if (!target || target.tagName === "SELECT") return;
      const container = target.closest(".feather-toolbar, .feather-source-toolbar");
      if (!container) return;
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) return;
      const focusables = Array.from(container.querySelectorAll('button:not([disabled]), [role="button"], select:not([disabled])')).filter((el) => el.offsetParent !== null);
      const index = focusables.indexOf(target);
      if (index === -1 || focusables.length === 0) return;
      e.preventDefault();
      if (e.key === "Home") {
        focusables[0].focus();
        return;
      }
      if (e.key === "End") {
        focusables[focusables.length - 1].focus();
        return;
      }
      const direction = e.key === "ArrowRight" ? 1 : -1;
      focusables[(index + direction + focusables.length) % focusables.length].focus();
    }
    getTooltipTarget(target) {
      return target && target.closest ? target.closest("[data-feather-tooltip]") : null;
    }
    ensureTooltip() {
      if (this.tooltipEl || !document || !document.body) return this.tooltipEl;
      const tooltip = document.createElement("div");
      tooltip.className = "feather-tooltip";
      tooltip.setAttribute("role", "tooltip");
      tooltip.hidden = true;
      document.body.appendChild(tooltip);
      this.tooltipEl = tooltip;
      return tooltip;
    }
    handleTooltipPointer(e, entering) {
      const target = this.getTooltipTarget(e.target);
      if (entering) {
        if (!target) return;
        this.showTooltip(target);
        return;
      }
      if (!this.tooltipAnchor) return;
      if (e.relatedTarget && this.tooltipAnchor.contains && this.tooltipAnchor.contains(e.relatedTarget)) return;
      if (target === this.tooltipAnchor) this.hideTooltip();
    }
    handleTooltipFocus(target, entering, relatedTarget) {
      const tooltipTarget = this.getTooltipTarget(target);
      if (!tooltipTarget) return;
      if (entering) {
        this.showTooltip(tooltipTarget);
        return;
      }
      if (relatedTarget && tooltipTarget.contains && tooltipTarget.contains(relatedTarget)) return;
      if (tooltipTarget === this.tooltipAnchor) this.hideTooltip();
    }
    showTooltip(target) {
      const text = target && target.dataset ? target.dataset.featherTooltip : "";
      if (!text) return;
      const tooltip = this.ensureTooltip();
      if (!tooltip) return;
      this.tooltipAnchor = target;
      this.tooltipText = text;
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
        const anchorBox = this.tooltipAnchor.getBoundingClientRect();
        const tooltipBox = this.tooltipEl.getBoundingClientRect();
        const offset = Number(this.config.tooltipOffset) || 14;
        const maxLeft = Math.max(8, window.innerWidth - tooltipBox.width - 8);
        const left = Math.min(maxLeft, Math.max(8, anchorBox.left + anchorBox.width / 2 - tooltipBox.width / 2));
        let top = anchorBox.top - tooltipBox.height - offset;
        let below = false;
        if (top < 8) {
          top = anchorBox.bottom + offset;
          below = true;
        }
        this.tooltipEl.style.left = `${left + window.scrollX}px`;
        this.tooltipEl.style.top = `${top + window.scrollY}px`;
        this.tooltipEl.dataset.side = below ? "bottom" : "top";
      });
    }
    hideTooltip() {
      if (!this.tooltipEl) return;
      this.tooltipAnchor = null;
      this.tooltipText = "";
      this.tooltipEl.hidden = true;
      this.tooltipEl.classList.remove("is-visible");
    }
    disposeTooltip() {
      this.hideTooltip();
      if (this.tooltipEl) this.tooltipEl.remove();
      this.tooltipEl = null;
    }
    reportError(context, error) {
      if (!this.config.logErrors || !error || typeof console === "undefined" || typeof console.warn !== "function") return;
      console.warn(`[FeatherText] ${context}`, error);
    }
    execCommand(command, value) {
      try {
        return document.execCommand(command, false, value || null);
      } catch (error) {
        this.reportError(`execCommand:${command}`, error);
        return false;
      }
    }
    handlePaste(e) {
      const clipboard = e.clipboardData || window.clipboardData;
      const payload = {
        text: clipboard && clipboard.getData ? clipboard.getData("text/plain") : "",
        html: clipboard && clipboard.getData ? clipboard.getData("text/html") : "",
        files: clipboard && clipboard.files ? Array.from(clipboard.files) : []
      };
      let pasteContent = null;
      if (typeof this.config.pasteFilter === "function") {
        try {
          pasteContent = this.config.pasteFilter(payload, e, this);
        } catch (error) {
          this.reportError("pasteFilter", error);
        }
      }
      if (pasteContent === false) {
        e.preventDefault();
        if (this.config.onPaste) this.config.onPaste(e, payload, this);
        return true;
      }
      if (!pasteContent) {
        const mode = this.config.pasteMode === "auto" ? this.config.sanitizePaste ? "text" : "html" : this.config.pasteMode;
        if (mode === "text") pasteContent = { type: "text", content: payload.text };
        else if (mode === "html") pasteContent = { type: payload.html ? "html" : "text", content: payload.html || payload.text };
      }
      if (!pasteContent || !pasteContent.content) {
        if (this.config.onPaste) this.config.onPaste(e, payload, this);
        return false;
      }
      e.preventDefault();
      if (pasteContent.type === "html") this.execCommand("insertHTML", pasteContent.content);
      else this.execCommand("insertText", pasteContent.content);
      if (this.config.onPaste) this.config.onPaste(e, payload, this);
      return true;
    }
    handleSourceKeydown(e) {
      if (e.ctrlKey && (e.key === "m" || e.key === "M")) {
        e.preventDefault();
        this.selectBracketPair();
        return;
      }
      if (e.key === "Tab") {
        e.preventDefault();
        this.handleSourceTab(e.shiftKey);
        return;
      }
      if (e.key === "Enter") {
        e.preventDefault();
        this.handleSourceEnter();
        return;
      }
      if (!this.config.sourceAutoClose || e.metaKey || e.ctrlKey || e.altKey) return;
      if (e.key === ">") {
        if (this.handleSourceTagClose()) e.preventDefault();
        return;
      }
      if (e.key.length === 1) this.handleSourcePair(e);
    }
    handleSourcePair(e) {
      const pairs = Object.assign({ '"': '"', "'": "'", "`": "`" }, SOURCE_BRACKET_PAIRS);
      const close = pairs[e.key];
      if (!close || !this.source) return;
      const ta = this.source;
      if (ta.selectionStart !== ta.selectionEnd) return;
      const next = ta.value[ta.selectionStart] || "";
      if (next && /[\w>]/.test(next) && (e.key === '"' || e.key === "'" || e.key === "`")) return;
      e.preventDefault();
      const start = ta.selectionStart;
      ta.setRangeText(e.key + close, start, ta.selectionEnd, "end");
      ta.setSelectionRange(start + 1, start + 1);
      this.scheduleSourceRefresh(true);
    }
    handleSourceTab(outdent) {
      if (!this.source) return;
      const ta = this.source;
      const indentUnit = this.getSourceIndentUnit();
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const value = ta.value;
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const lineEnd = value.indexOf("\n", end);
      const sliceEnd = lineEnd === -1 ? value.length : lineEnd;
      const block = value.slice(lineStart, sliceEnd);
      if (!outdent && start === end) {
        ta.setRangeText(indentUnit, start, end, "end");
        this.scheduleSourceRefresh(true);
        return;
      }
      const lines = block.split("\n");
      const changedLines = lines.map((line) => {
        if (!outdent) return indentUnit + line;
        if (line.startsWith(indentUnit)) return line.slice(indentUnit.length);
        if (line.startsWith("	")) return line.slice(1);
        const spaces = indentUnit.replace(/\t/g, "");
        if (spaces && line.startsWith(spaces)) return line.slice(spaces.length);
        return line.replace(/^ {1,4}/, "");
      });
      const updated = changedLines.join("\n");
      ta.setRangeText(updated, lineStart, sliceEnd, "select");
      const delta = updated.length - block.length;
      if (start === end) {
        const next = outdent ? Math.max(lineStart, start - indentUnit.length) : start + indentUnit.length;
        ta.setSelectionRange(next, next);
      } else {
        ta.setSelectionRange(start + (outdent ? 0 : indentUnit.length), end + delta);
      }
      this.scheduleSourceRefresh(true);
    }
    handleSourceEnter() {
      if (!this.source) return;
      const ta = this.source;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const value = ta.value;
      const lineStart = value.lastIndexOf("\n", start - 1) + 1;
      const currentLine = value.slice(lineStart, start);
      const indentMatch = currentLine.match(/^[\t ]*/);
      const baseIndent = indentMatch ? indentMatch[0] : "";
      const indentUnit = this.config.sourceSmartTabs ? this.getSourceIndentUnit() : "";
      const before = value.slice(0, start);
      const after = value.slice(end);
      const openTagMatch = before.match(/<([a-zA-Z][\w:-]*)(?:(?!<).)*?>$/);
      const closeTagMatch = after.match(/^<\/([a-zA-Z][\w:-]*)>/);
      const betweenMatchingTags = !!(openTagMatch && closeTagMatch && openTagMatch[1] === closeTagMatch[1] && !VOID_TAGS.has(openTagMatch[1].toLowerCase()));
      const needsExtraIndent = /[\[{(]\s*$/.test(before) || betweenMatchingTags;
      const nextIndent = baseIndent + (needsExtraIndent ? indentUnit : "");
      const trailingIndent = betweenMatchingTags ? `
${baseIndent}` : "";
      const insert = `
${nextIndent}${trailingIndent}`;
      ta.setRangeText(insert, start, end, "end");
      const caret = start + 1 + nextIndent.length;
      ta.setSelectionRange(caret, caret);
      this.scheduleSourceRefresh(true);
    }
    handleSourceTagClose() {
      if (!this.source) return false;
      const ta = this.source;
      if (ta.selectionStart !== ta.selectionEnd) return false;
      const before = ta.value.slice(0, ta.selectionStart);
      const match = before.match(/<([a-zA-Z][\w:-]*)([^<>]*)$/);
      if (!match) return false;
      const tagName = match[1];
      const attrText = match[2] || "";
      if (VOID_TAGS.has(tagName.toLowerCase()) || /\/$/.test(attrText.trim())) return false;
      const closeTag = `></${tagName}>`;
      ta.setRangeText(closeTag, ta.selectionStart, ta.selectionEnd, "end");
      const caret = ta.selectionStart - closeTag.length + 1;
      ta.setSelectionRange(caret, caret);
      this.scheduleSourceRefresh(true);
      return true;
    }
    getSourceIndentUnit() {
      if (typeof this.config.sourceIndentUnit === "string" && this.config.sourceIndentUnit.length) return this.config.sourceIndentUnit;
      if (!this.source) return "  ";
      const match = this.source.value.match(/^(\t+| {2,8})\S/m);
      return match ? match[1] : "  ";
    }
    // ----- Status/hist -----
    updateCounts() {
      if (!this.statusBar) return;
      const text = this.editor.innerText || "";
      if (this.config.wordCount) {
        const words = text.trim().split(/\s+/).filter((w) => w.length > 0).length;
        if (this.wordCountEl) this.wordCountEl.textContent = words;
      }
      if (this.config.charCount) {
        const chars = text.length;
        if (this.charCountEl) this.charCountEl.textContent = chars;
      }
    }
    // Back-compat: some call sites still use updateHistory
    updateHistory() {
      this.pushHistory();
    }
    pushHistory() {
      const html = this.editor.innerHTML;
      this.history = this.history.slice(0, this.historyIndex + 1);
      this.history.push(html);
      this.historyIndex++;
      if (this.history.length > this.config.historyLimit) {
        this.history.shift();
        this.historyIndex--;
      }
    }
    updateSourceControlsState() {
      if (this.sourceHeader) this.sourceHeader.style.display = this.isSource ? "flex" : "none";
    }
    startAutosave() {
      if (this.autosaveTimer) clearInterval(this.autosaveTimer);
      this.autosaveTimer = setInterval(() => {
        this.element.value = this.getHTML();
      }, this.config.autosaveInterval);
    }
    // ----- Selection helpers -----
    saveSelection() {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) this._savedRange = sel.getRangeAt(0).cloneRange();
    }
    restoreSelection() {
      if (!this._savedRange) return;
      const sel = window.getSelection();
      if (!sel) return;
      sel.removeAllRanges();
      sel.addRange(this._savedRange);
      this._savedRange = null;
    }
    // ----- Source helpers -----
    syncSourceScroll() {
      if (!this.source) return;
      if (this.sourceGutter) this.sourceGutter.scrollTop = this.source.scrollTop;
      if (this.codeOverlay) {
        this.codeOverlay.scrollTop = this.source.scrollTop;
        this.codeOverlay.scrollLeft = this.source.scrollLeft;
      }
    }
    renderGutter(force) {
      if (!this.sourceGutter) return;
      const lines = this.source.value.split(/\n/).length || 1;
      if (!force && this._sourceLineCount === lines) {
        this.syncSourceScroll();
        return;
      }
      this._sourceLineCount = lines;
      let html = "";
      for (let i = 1; i <= lines; i++) html += "<span>" + i + "</span>\n";
      this.sourceGutter.innerHTML = html;
      this.syncSourceScroll();
    }
    // ----- Syntax highlighting -----
    escapeHTML(s) {
      return (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
    }
    highlightHTML(src) {
      let s = this.escapeHTML(src);
      s = s.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="tok-com">$1</span>');
      s = s.replace(/&lt;(\/)?([a-zA-Z][\w:-]*)([^>]*)&gt;/g, (m, slash, name, rest) => {
        let r = rest.replace(/([a-zA-Z_:][\w:.-]*)(=)/g, '<span class="tok-attr">$1</span>$2').replace(/(\"[^\"]*\"|'[^']*')/g, '<span class="tok-str">$1</span>').replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="tok-num">$1</span>');
        return `&lt;${slash ? "/" : ""}<span class="tok-tag">${name}</span>${r}&gt;`;
      });
      return s;
    }
    highlightCSS(src) {
      let s = this.escapeHTML(src);
      s = s.replace(/\/\*[\s\S]*?\*\//g, (m) => `<span class="tok-com">${m}</span>`);
      s = s.replace(/(@[a-zA-Z-]+)/g, '<span class="tok-kw">$1</span>');
      s = s.replace(/(:\s*)([^;}{]+)/g, (m, p, val) => p + val.replace(/(\"[^\"]*\"|'[^']*')/g, '<span class="tok-str">$1</span>').replace(/\b(\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw)?)\b/g, '<span class="tok-num">$1</span>'));
      s = s.replace(/([a-zA-Z-]+)(\s*:\s*)/g, '<span class="tok-attr">$1</span>$2');
      return s;
    }
    highlightJS(src) {
      let s = this.escapeHTML(src);
      s = s.replace(/\/\/.*$/gm, (m) => `<span class="tok-com">${m}</span>`);
      s = s.replace(/\/\*[\s\S]*?\*\//g, (m) => `<span class="tok-com">${m}</span>`);
      s = s.replace(/`([^`\\]|\\.)*`/g, (m) => `<span class="tok-str">${m}</span>`);
      s = s.replace(/"([^"\\]|\\.)*"/g, (m) => `<span class="tok-str">${m}</span>`);
      s = s.replace(/'([^'\\]|\\.)*'/g, (m) => `<span class="tok-str">${m}</span>`);
      s = s.replace(/\b(0x[\da-fA-F]+|\d+(?:\.\d+)?(?:e[+-]?\d+)?)\b/g, '<span class="tok-num">$1</span>');
      const kw = "\\b(abstract|arguments|await|boolean|break|byte|case|catch|char|class|const|continue|debugger|default|delete|do|double|else|enum|export|extends|false|final|finally|float|for|function|goto|if|implements|import|in|instanceof|int|interface|let|long|native|new|null|package|private|protected|public|return|short|static|super|switch|synchronized|this|throw|throws|transient|true|try|typeof|var|void|volatile|while|with|yield)\\b";
      s = s.replace(new RegExp(kw, "g"), '<span class="tok-kw">$1</span>');
      return s;
    }
    highlightJSON(src) {
      let s = this.escapeHTML(src);
      s = s.replace(/\"([^\"\\]|\\.)*\"(?=\s*:)/g, '<span class="tok-attr">$&</span>');
      s = s.replace(/\"([^\"\\]|\\.)*\"/g, '<span class="tok-str">$&</span>');
      s = s.replace(/\b(true|false|null)\b/g, '<span class="tok-kw">$1</span>');
      s = s.replace(/\b(\d+(?:\.\d+)?(?:e[+-]?\d+)?)\b/g, '<span class="tok-num">$1</span>');
      return s;
    }
    highlightSource() {
      if (!this.codeOverlay) return;
      const text = this.source ? this.source.value : "";
      const lang = (this.sourceLanguage || "html").toLowerCase();
      let html = "";
      if (lang === "html" || lang === "xml") html = this.highlightHTML(text);
      else if (lang === "css") html = this.highlightCSS(text);
      else if (lang === "javascript" || lang === "js") html = this.highlightJS(text);
      else if (lang === "json") html = this.highlightJSON(text);
      else html = this.escapeHTML(text);
      this.codeOverlay.innerHTML = html;
      this.syncSourceScroll();
    }
    selectBracketPair() {
      const ta = this.source;
      if (!ta) return;
      const text = ta.value;
      let pos = ta.selectionStart;
      const br = "()[]{}<>";
      if (pos > 0 && !br.includes(text[pos]) && br.includes(text[pos - 1])) pos = pos - 1;
      const ch = text[pos];
      const pairs = Object.assign({ "<": ">" }, SOURCE_BRACKET_PAIRS);
      const rev = { ")": "(", "]": "[", "}": "{", ">": "<" };
      if (pairs[ch]) {
        const open = ch, close = pairs[ch];
        let d = 0;
        for (let i = pos; i < text.length; i++) {
          const c = text[i];
          if (c === open) d++;
          else if (c === close) {
            d--;
            if (d === 0) {
              ta.setSelectionRange(pos + 1, i);
              return;
            }
          }
        }
      } else if (rev[ch]) {
        const close = ch, open = rev[ch];
        let d = 0;
        for (let i = pos; i >= 0; i--) {
          const c = text[i];
          if (c === close) d++;
          else if (c === open) {
            d--;
            if (d === 0) {
              ta.setSelectionRange(i + 1, pos);
              return;
            }
          }
        }
      }
    }
    setToolbar(arr) {
      this.config.toolbar = [...arr];
      if (this.toolbar && this.toolbar.parentNode) this.toolbar.parentNode.removeChild(this.toolbar);
      this.toolbar = this.buildToolbar();
      this.wrapper.insertBefore(this.toolbar, this.wrapper.firstChild);
    }
    // History
    undo() {
      if (this.historyIndex > 0) {
        this.historyIndex--;
        const html = this.history[this.historyIndex] || "";
        this.editor.innerHTML = html;
        this.element.value = html;
        this.flushCountsUpdate();
      }
    }
    redo() {
      if (this.historyIndex < this.history.length - 1) {
        this.historyIndex++;
        const html = this.history[this.historyIndex] || "";
        this.editor.innerHTML = html;
        this.element.value = html;
        this.flushCountsUpdate();
      }
    }
    // ----- API -----
    getHTML() {
      return this.isSource ? this.source.value : this.editor.innerHTML;
    }
    setHTML(html) {
      this.editor.innerHTML = html;
      this.element.value = html;
      this.flushCountsUpdate();
      this.pushHistory();
    }
    getText() {
      return this.editor.innerText || "";
    }
    clear() {
      this.setHTML("");
    }
    focus() {
      (this.isSource ? this.source : this.editor).focus();
    }
    disable() {
      this.editor.contentEditable = false;
      this.toolbar.style.opacity = "0.5";
      this.toolbar.style.pointerEvents = "none";
    }
    enable() {
      this.editor.contentEditable = true;
      this.toolbar.style.opacity = "1";
      this.toolbar.style.pointerEvents = "";
    }
    destroy() {
      if (this.autosaveTimer) clearInterval(this.autosaveTimer);
      this.cancelDeferredWork();
      this.disposeTooltip();
      this.removeManagedListeners();
      if (this.wrapper) this.wrapper.remove();
      this.element.style.display = "";
      this._isFocusedWithin = false;
    }
    addButton(name, def) {
      buttons[name] = Object.assign({}, def, { icon: def && def.icon ? def.icon : iconMarkup.code, tip: def && (def.tip || def.tooltip || name) });
      const btn = this.createToolbarButton(name);
      if (btn) {
        const groups = this.toolbar.querySelectorAll(".feather-group");
        const last = groups[groups.length - 1];
        if (last) last.appendChild(btn);
      }
    }
    removeButton(name) {
      const btn = this.toolbar.querySelector(`[data-command="${name}"]`);
      if (btn) btn.remove();
    }
    showButton(name) {
      const btn = this.toolbar.querySelector(`[data-command="${name}"]`);
      if (btn) btn.style.display = "";
    }
    hideButton(name) {
      const btn = this.toolbar.querySelector(`[data-command="${name}"]`);
      if (btn) btn.style.display = "none";
    }
    setTheme(themeName) {
      this.applyTheme(themeName);
    }
    getConfig() {
      return Object.assign({}, this.config);
    }
    setConfig(cfg) {
      this.config = Object.assign({}, this.config, cfg || {});
      this.destroy();
      this.applyTheme(this.config.theme);
      this.buildEditor();
      this.setupEvents();
    }
    // removed duplicate startAutosave (kept single definition above)
    // ----- Clipboard + formatting helpers -----
    updateToolbarState() {
      const mapping = [
        { cmd: "bold", name: "bold" },
        { cmd: "italic", name: "italic" },
        { cmd: "underline", name: "underline" },
        { cmd: "strikeThrough", name: "strikethrough" }
      ];
      mapping.forEach(({ cmd, name }) => {
        try {
          const active = document.queryCommandState(cmd);
          const btn = this.toolbar && this.toolbar.querySelector(`[data-command="${name}"]`);
          if (btn) {
            btn.classList.toggle("is-active", !!active);
            btn.setAttribute("aria-pressed", active ? "true" : "false");
          }
        } catch {
        }
      });
    }
    applyInlineStyle(cssProp, value) {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      if (range.collapsed) {
        const span2 = document.createElement("span");
        try {
          span2.style[cssProp] = value;
        } catch {
        }
        const zwsp = document.createTextNode("\u200B");
        span2.appendChild(zwsp);
        range.insertNode(span2);
        sel.removeAllRanges();
        const newRange = document.createRange();
        newRange.setStart(zwsp, 1);
        newRange.collapse(true);
        sel.addRange(newRange);
        return;
      }
      let node = range.commonAncestorContainer;
      if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
      const rangesEqual = (r1, r2) => r1.startContainer === r2.startContainer && r1.startOffset === r2.startOffset && r1.endContainer === r2.endContainer && r1.endOffset === r2.endOffset;
      for (let el = node; el && el !== this.editor; el = el.parentElement) {
        if (el.nodeType === 1 && el.tagName === "SPAN" && el.style && el.style[cssProp]) {
          const full = document.createRange();
          full.selectNodeContents(el);
          if (rangesEqual(range, full)) {
            try {
              el.style[cssProp] = value;
            } catch {
            }
            this.mergeSimilarSpans(el.parentElement || this.editor);
            return;
          }
          break;
        }
      }
      const span = document.createElement("span");
      try {
        span.style[cssProp] = value;
      } catch {
      }
      try {
        range.surroundContents(span);
      } catch (e) {
        const frag = range.extractContents();
        span.appendChild(frag);
        range.insertNode(span);
        sel.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        sel.addRange(newRange);
      }
      this.mergeSimilarSpans(span.parentElement || this.editor);
    }
    mergeSimilarSpans(root) {
      if (!root) return;
      const areEqualStyles = (a, b) => a.tagName === "SPAN" && b.tagName === "SPAN" && (a.getAttribute("style") || "") === (b.getAttribute("style") || "");
      let changed = true;
      while (changed) {
        changed = false;
        const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT, null);
        while (walker.nextNode()) {
          const el = walker.currentNode;
          if (el.tagName === "SPAN" && el.parentElement && el.parentElement.tagName === "SPAN" && areEqualStyles(el, el.parentElement)) {
            while (el.firstChild) el.parentElement.insertBefore(el.firstChild, el);
            el.remove();
            changed = true;
            break;
          }
        }
        const all = Array.from(root.querySelectorAll("span"));
        for (const s of all) {
          const next = s.nextSibling;
          if (next && next.nodeType === 1 && next.tagName === "SPAN" && areEqualStyles(s, next)) {
            while (next.firstChild) s.appendChild(next.firstChild);
            next.remove();
            changed = true;
            break;
          }
        }
      }
    }
    async copyAction() {
      if (this.isSource) {
        const ta = this.source;
        const selection = ta.value.substring(ta.selectionStart, ta.selectionEnd) || ta.value;
        try {
          await navigator.clipboard.writeText(selection);
        } catch {
        }
        return;
      }
      try {
        const ok = document.execCommand("copy");
        if (!ok && navigator.clipboard) {
          const text = window.getSelection ? window.getSelection().toString() || this.getText() : this.getText();
          await navigator.clipboard.writeText(text);
        }
      } catch {
      }
    }
    async pasteAction() {
      try {
        const text = await (navigator.clipboard && navigator.clipboard.readText ? navigator.clipboard.readText() : Promise.resolve(""));
        if (!text) return;
        if (this.isSource) {
          const ta = this.source;
          const s = ta.selectionStart, e2 = ta.selectionEnd;
          ta.setRangeText(text, s, e2, "end");
          this.scheduleSourceRefresh(true);
        } else {
          if (this.config.sanitizePaste) this.execCommand("insertText", text);
          else this.execCommand("insertHTML", text.replace(/\n/g, "<br>"));
          this.updateHistory();
        }
      } catch {
      }
    }
    clearFormatting() {
      this.execCommand("removeFormat");
      this.updateHistory();
    }
    clearColor(kind) {
      const cssProp = kind === "fore" ? "color" : "backgroundColor";
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      const container = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE ? range.commonAncestorContainer : range.commonAncestorContainer.parentElement;
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, null);
      const list = [];
      while (walker.nextNode()) {
        const el = walker.currentNode;
        if (range.intersectsNode(el)) list.push(el);
      }
      list.forEach((el) => {
        try {
          if (el.style && el.style[cssProp]) {
            el.style[cssProp] = "";
            if (!el.getAttribute("style")) el.removeAttribute("style");
          }
        } catch {
        }
      });
    }
    static init(selector, cfg) {
      const nodes = document.querySelectorAll(selector);
      const arr = [];
      nodes.forEach((n) => arr.push(new _FeatherText(n, cfg)));
      return arr;
    }
  };
  var version = true ? "0.1.0" : "0.0.0-dev";
  FeatherText.themes = themes;
  FeatherText.version = version;

  // src/feathertext.global.js
  FeatherText.themes = themes;
  FeatherText.version = version;
  if (typeof globalThis !== "undefined") {
    globalThis.FeatherText = FeatherText;
  }
})();
//# sourceMappingURL=feathertext.js.map
