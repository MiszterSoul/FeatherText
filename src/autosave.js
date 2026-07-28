const defaultAutosaveKeys = new WeakMap();
let autosaveKeySequence = 0;

function defaultAutosaveKey(editor) {
  if (!defaultAutosaveKeys.has(editor)) {
    autosaveKeySequence += 1;
    defaultAutosaveKeys.set(
      editor,
      `feathertext:draft:${editor.id}:${autosaveKeySequence}`,
    );
  }
  return defaultAutosaveKeys.get(editor);
}

export function isAutosaveEnabled(value) {
  if (typeof value === "number") return value >= 0;
  if (value && typeof value === "object") return value.enabled !== false;
  return value === true;
}

export function normalizeAutosaveOptions(editor, value, legacyInterval) {
  const structured = value && typeof value === "object" ? value : {};
  const enabled = isAutosaveEnabled(value);
  const numericLegacy = typeof value === "number" ? value : legacyInterval;
  const debounceValue =
    structured.debounce ?? structured.interval ?? numericLegacy ?? 30000;
  return {
    enabled,
    key: String(structured.key || defaultAutosaveKey(editor)),
    debounce: Math.max(0, Number(debounceValue) || 0),
    storage: structured.storage || null,
    restore: structured.restore === true,
  };
}

function parseDraft(value) {
  if (typeof value !== "string" || !value) return null;
  try {
    const parsed = JSON.parse(value);
    if (parsed && typeof parsed.html === "string") {
      return {
        html: parsed.html,
        mode: parsed.mode === "source" ? "source" : "editor",
        updatedAt: Number(parsed.updatedAt) || 0,
      };
    }
  } catch {
    return { html: value, mode: "editor", updatedAt: 0 };
  }
  return null;
}

export class AutosaveManager {
  constructor(editor) {
    this.editor = editor;
    this.options = normalizeAutosaveOptions(editor, false, 30000);
    this.storage = null;
    this.timer = null;
    this.destroyed = false;
    this.running = false;
    this.schedulingSuspended = false;
    this.lastSavedValue = null;
    this.lastSavedMode = null;
    this.state = "disabled";
    this.messageKey = "autosave.off";
    this.message = this.editor.t(this.messageKey);
    this.promptDialog = null;
  }

  configure(value, legacyInterval) {
    this.stop();
    this.dismissRestorePrompt();
    this.options = normalizeAutosaveOptions(this.editor, value, legacyInterval);
    this.editor.autosaveKey = this.options.key;
    this.storage = null;
    this.lastSavedValue = null;
    this.lastSavedMode = null;
    return this;
  }

  resolveStorage() {
    if (this.storage) return this.storage;
    try {
      const storage = this.options.storage || this.editor.window?.localStorage;
      if (
        !storage ||
        typeof storage.getItem !== "function" ||
        typeof storage.setItem !== "function" ||
        typeof storage.removeItem !== "function"
      ) {
        throw new Error(this.editor.t("autosave.storageUnavailable"));
      }
      this.storage = storage;
      return storage;
    } catch (error) {
      this.fail("access", error);
      return null;
    }
  }

  start({ offerRestore = true } = {}) {
    this.destroyed = false;
    this.running = false;
    if (!this.options.enabled) {
      this.setState("disabled", "autosave.off");
      return this;
    }
    if (!this.resolveStorage()) return this;
    this.running = true;
    this.setState("idle", "autosave.on");
    if (offerRestore && this.options.restore) this.offerRestore();
    return this;
  }

  schedule() {
    if (
      !this.options.enabled ||
      !this.running ||
      this.destroyed ||
      this.schedulingSuspended
    )
      return false;
    this.cancelTimer();
    this.setState("pending", "autosave.pending");
    if (!this.options.debounce) return this.save();
    this.timer = setTimeout(() => {
      this.timer = null;
      this.editor.autosaveTimer = null;
      this.save();
    }, this.options.debounce);
    this.editor.autosaveTimer = this.timer;
    return true;
  }

  save() {
    if (!this.options.enabled || !this.running || this.destroyed) return false;
    const storage = this.resolveStorage();
    if (!storage) return false;
    const html = this.editor.getHTML();
    const mode = this.editor.isSource ? "source" : "editor";
    if (html === this.lastSavedValue && mode === this.lastSavedMode) {
      this.setState("saved", "autosave.saved");
      return true;
    }
    this.setState("saving", "autosave.saving");
    try {
      storage.setItem(
        this.options.key,
        JSON.stringify({
          version: 1,
          html,
          mode,
          updatedAt: Date.now(),
        }),
      );
      this.lastSavedValue = html;
      this.lastSavedMode = mode;
      this.setState("saved", "autosave.saved");
      this.editor.emit("autosave", { key: this.options.key, html, mode });
      return true;
    } catch (error) {
      this.fail("save", error);
      return false;
    }
  }

  read() {
    const storage = this.resolveStorage();
    if (!storage) return null;
    try {
      return parseDraft(storage.getItem(this.options.key));
    } catch (error) {
      this.fail("restore", error);
      return null;
    }
  }

  offerRestore() {
    const draft = this.read();
    if (!draft || draft.html === this.editor.getHTML()) {
      if (draft) {
        this.lastSavedValue = draft.html;
        this.lastSavedMode = draft.mode;
      }
      return false;
    }
    this.setState("available", "autosave.available");
    const promise = this.editor.dialogs.open({
      title: this.editor.t("autosave.restoreTitle"),
      description: this.editor.t("autosave.restoreDescription"),
      confirmLabel: this.editor.t("autosave.restore"),
      cancelLabel: this.editor.t("autosave.notNow"),
      fields: [],
      onConfirm: () => {
        this.restore(draft);
        return true;
      },
    });
    const promptDialog = promise.dialog;
    this.promptDialog = promptDialog;
    void promise.then(() => {
      if (this.promptDialog === promptDialog) this.promptDialog = null;
      if (!this.destroyed && this.state === "available")
        this.setState("available", "autosave.available");
    });
    return true;
  }

  restore(draft) {
    if (!draft || this.destroyed) return false;
    this.schedulingSuspended = true;
    this.lastSavedValue = draft.html;
    this.lastSavedMode = draft.mode;
    try {
      this.editor.setContent(draft.html, { history: true, notify: true });
      this.editor.setSourceMode(draft.mode === "source", {
        focus: false,
        history: false,
      });
    } finally {
      this.schedulingSuspended = false;
    }
    this.setState("restored", "autosave.restored");
    this.editor.emit("autosaverestore", {
      key: this.options.key,
      html: draft.html,
      mode: draft.mode,
    });
    return true;
  }

  clear() {
    this.cancelTimer();
    const storage = this.resolveStorage();
    if (!storage) return false;
    try {
      storage.removeItem(this.options.key);
      this.lastSavedValue = null;
      this.lastSavedMode = null;
      this.setState("cleared", "autosave.cleared");
      this.editor.emit("autosaveclear", { key: this.options.key });
      return true;
    } catch (error) {
      this.fail("clear", error);
      return false;
    }
  }

  setState(state, messageKey) {
    this.state = state;
    this.messageKey = messageKey;
    this.message = this.editor.t(messageKey);
    this.editor.autosaveState = state;
    if (this.editor.saveStateEl) {
      this.editor.saveStateEl.dataset.state = state;
      this.editor.saveStateEl.textContent = this.message;
    }
    this.editor.emit("autosavestate", {
      state,
      message: this.message,
      key: this.options.key,
    });
  }

  refreshStatus() {
    if (!this.editor) return;
    this.message = this.editor.t(this.messageKey);
    if (this.editor.saveStateEl) {
      this.editor.saveStateEl.dataset.state = this.state;
      this.editor.saveStateEl.textContent = this.message;
    }
  }

  fail(operation, error) {
    this.stop();
    this.setState("error", "autosave.unavailable");
    this.editor.emit("autosaveerror", {
      operation,
      error,
      key: this.options.key,
    });
    this.editor.reportError?.(`autosave:${operation}`, error);
  }

  cancelTimer() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    if (this.editor) this.editor.autosaveTimer = null;
  }

  dismissRestorePrompt() {
    if (
      this.promptDialog &&
      this.editor?.dialogs.active?.dialog === this.promptDialog
    ) {
      this.editor.dialogs.close(false);
    }
    this.promptDialog = null;
  }

  stop() {
    this.running = false;
    this.cancelTimer();
    return this;
  }

  destroy() {
    this.destroyed = true;
    this.stop();
    this.dismissRestorePrompt();
    this.editor = null;
    this.storage = null;
  }
}
