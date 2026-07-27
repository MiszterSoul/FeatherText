function cloneSelection(selection) {
  if (!selection) return null;
  return {
    ...selection,
    anchorPath: selection.anchorPath ? [...selection.anchorPath] : undefined,
    focusPath: selection.focusPath ? [...selection.focusPath] : undefined,
  };
}

function cloneEntry(entry) {
  return { ...entry, selection: cloneSelection(entry.selection) };
}

export class TransactionHistory {
  constructor({ limit = 50, delay = 400, snapshot, restore, onChange }) {
    this.limit = Math.max(1, Number.parseInt(limit, 10) || 50);
    this.delay = Math.max(0, Number(delay) || 0);
    this.snapshot = snapshot;
    this.restore = restore;
    this.onChange = onChange;
    this.entries = [];
    this.index = -1;
    this.timer = null;
    this.pendingLabel = null;
    this.restoring = false;
  }

  reset(label = "initial") {
    this.cancelPending();
    const entry = this.snapshot(label);
    this.entries = [cloneEntry(entry)];
    this.index = 0;
    this.notify("reset", entry);
  }

  schedule(label = "typing") {
    if (this.restoring) return false;
    this.pendingLabel = label;
    if (!this.delay) return this.commit(label);
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.timer = null;
      const pending = this.pendingLabel || label;
      this.pendingLabel = null;
      this.commit(pending);
    }, this.delay);
    return true;
  }

  flush() {
    if (!this.timer && !this.pendingLabel) return false;
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    const label = this.pendingLabel || "typing";
    this.pendingLabel = null;
    return this.commit(label);
  }

  cancelPending() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.pendingLabel = null;
  }

  commit(label = "change") {
    if (this.restoring) return false;
    this.cancelPending();
    const entry = cloneEntry(this.snapshot(label));
    const current = this.entries[this.index];
    if (current && current.value === entry.value) {
      current.selection = entry.selection;
      current.mode = entry.mode;
      return false;
    }

    this.entries = this.entries.slice(0, this.index + 1);
    this.entries.push(entry);
    if (this.entries.length > this.limit) this.entries.splice(0, this.entries.length - this.limit);
    this.index = this.entries.length - 1;
    this.notify("commit", entry);
    return true;
  }

  undo() {
    this.flush();
    if (this.index <= 0) return false;
    this.index -= 1;
    this.apply("undo");
    return true;
  }

  redo() {
    this.flush();
    if (this.index >= this.entries.length - 1) return false;
    this.index += 1;
    this.apply("redo");
    return true;
  }

  apply(action) {
    const entry = cloneEntry(this.entries[this.index]);
    this.restoring = true;
    try {
      this.restore(entry, action);
    } finally {
      this.restoring = false;
    }
    this.notify(action, entry);
  }

  setLimit(limit) {
    this.limit = Math.max(1, Number.parseInt(limit, 10) || 50);
    if (this.entries.length > this.limit) {
      const remove = this.entries.length - this.limit;
      this.entries.splice(0, remove);
      this.index = Math.max(0, this.index - remove);
    }
  }

  setDelay(delay) {
    this.flush();
    this.delay = Math.max(0, Number(delay) || 0);
  }

  notify(action, entry) {
    if (typeof this.onChange === "function") {
      this.onChange({ action, entry: cloneEntry(entry), index: this.index, length: this.entries.length });
    }
  }

  destroy() {
    this.cancelPending();
    this.entries = [];
    this.index = -1;
  }
}
