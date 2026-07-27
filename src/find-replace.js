let findDialogSequence = 0;

const WORD_CHARACTER = /[\p{L}\p{N}_]/u;
const TEXT_BOUNDARY = "\u0000";
const BLOCK_ELEMENTS = new Set([
  "ADDRESS",
  "ARTICLE",
  "ASIDE",
  "BLOCKQUOTE",
  "DD",
  "DIV",
  "DL",
  "DT",
  "FIELDSET",
  "FIGCAPTION",
  "FIGURE",
  "FOOTER",
  "FORM",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "HEADER",
  "HR",
  "LI",
  "MAIN",
  "NAV",
  "OL",
  "P",
  "PRE",
  "SECTION",
  "TABLE",
  "TBODY",
  "TD",
  "TFOOT",
  "TH",
  "THEAD",
  "TR",
  "UL",
]);

function isWholeWord(text, start, end) {
  const before = start > 0 ? text[start - 1] : "";
  const after = end < text.length ? text[end] : "";
  return (
    (!before || !WORD_CHARACTER.test(before)) &&
    (!after || !WORD_CHARACTER.test(after))
  );
}

function findOffsets(
  text,
  term,
  { matchCase = false, wholeWord = false } = {},
) {
  const query = String(term ?? "");
  if (!query) return [];
  const haystack = matchCase ? text : text.toLocaleLowerCase();
  const needle = matchCase ? query : query.toLocaleLowerCase();
  const matches = [];
  let offset = 0;
  while (offset <= haystack.length - needle.length) {
    const start = haystack.indexOf(needle, offset);
    if (start < 0) break;
    const end = start + needle.length;
    if (!wholeWord || isWholeWord(text, start, end))
      matches.push({ start, end });
    offset = Math.max(start + 1, end);
  }
  return matches;
}

function textModel(editor) {
  const nodes = [];
  let text = "";
  const appendBoundary = () => {
    if (text && !text.endsWith(TEXT_BOUNDARY)) text += TEXT_BOUNDARY;
  };
  const visit = (node, root = false) => {
    if (node.nodeType === 3) {
      if (!node.data) return;
      const start = text.length;
      text += node.data;
      nodes.push({ node, start, end: text.length });
      return;
    }
    if (node.nodeType !== 1) return;
    if (!root && node.matches?.('script, style, [contenteditable="false"]')) {
      appendBoundary();
      return;
    }
    if (node.tagName === "BR") {
      appendBoundary();
      return;
    }
    const block = !root && BLOCK_ELEMENTS.has(node.tagName);
    if (block) appendBoundary();
    for (const child of node.childNodes) visit(child);
    if (block) appendBoundary();
  };
  visit(editor.editor, true);
  return { text, nodes };
}

function pointAt(model, offset, endPoint = false) {
  if (!model.nodes.length) return null;
  for (const entry of model.nodes) {
    if (offset < entry.end || (endPoint && offset === entry.end)) {
      return { node: entry.node, offset: Math.max(0, offset - entry.start) };
    }
  }
  const last = model.nodes.at(-1);
  return { node: last.node, offset: last.node.data.length };
}

function rangeFor(editor, match, model = textModel(editor)) {
  const start = pointAt(model, match.start, false);
  const end = pointAt(model, match.end, true);
  if (!start || !end) return null;
  const range = editor.document.createRange();
  range.setStart(start.node, Math.min(start.offset, start.node.data.length));
  range.setEnd(end.node, Math.min(end.offset, end.node.data.length));
  return range;
}

function replaceMatch(editor, match, replacement) {
  const model = textModel(editor);
  if (!rangeFor(editor, match, model)) return null;
  const affected = model.nodes.filter(
    (entry) => entry.start < match.end && entry.end > match.start,
  );
  if (!affected.length) return null;

  const first = affected[0];
  const last = affected.at(-1);
  const startOffset = Math.max(0, match.start - first.start);
  const endOffset = Math.min(last.node.data.length, match.end - last.start);
  if (first === last) {
    first.node.data =
      first.node.data.slice(0, startOffset) +
      replacement +
      first.node.data.slice(endOffset);
  } else {
    first.node.data = first.node.data.slice(0, startOffset) + replacement;
    for (const entry of affected.slice(1, -1)) entry.node.data = "";
    last.node.data = last.node.data.slice(endOffset);
  }

  const range = editor.document.createRange();
  range.setStart(first.node, startOffset);
  range.setEnd(first.node, startOffset + replacement.length);
  return range;
}

function labelledCheckbox(documentRef, id, className, labelText) {
  const label = documentRef.createElement("label");
  label.className = "feather-find-option";
  const input = documentRef.createElement("input");
  input.id = id;
  input.type = "checkbox";
  input.className = className;
  label.append(input, documentRef.createTextNode(labelText));
  return { label, input };
}

function actionButton(documentRef, action, text) {
  const button = documentRef.createElement("button");
  button.type = "button";
  button.dataset.action = action;
  button.textContent = text;
  return button;
}

export class FindReplaceManager {
  constructor(editor) {
    this.editor = editor;
    this.active = null;
    this.term = "";
    this.replacement = "";
    this.options = { matchCase: false, wholeWord: false };
    this.matches = [];
    this.index = -1;
  }

  getText() {
    return this.editor.isSource
      ? this.editor.source.value
      : textModel(this.editor).text;
  }

  result() {
    return {
      term: this.term,
      current: this.index >= 0 && this.matches.length ? this.index + 1 : 0,
      total: this.matches.length,
    };
  }

  find(term, options = {}) {
    this.term = String(term ?? "");
    this.options = {
      matchCase: !!options.matchCase,
      wholeWord: !!options.wholeWord,
    };
    this.matches = findOffsets(this.getText(), this.term, this.options);
    this.index = this.matches.length ? 0 : -1;
    this.highlightCurrent();
    this.syncDialog();
    this.editor.emit("find", this.result());
    return this.result();
  }

  findNext(term, options) {
    if (term !== undefined) return this.find(term, options || this.options);
    this.refreshMatches(true);
    if (this.matches.length)
      this.index = (this.index + 1 + this.matches.length) % this.matches.length;
    this.highlightCurrent();
    this.syncDialog();
    this.editor.emit("find", this.result());
    return this.result();
  }

  findPrevious(term, options) {
    if (term !== undefined) {
      this.find(term, options || this.options);
      if (this.matches.length) this.index = this.matches.length - 1;
    } else {
      this.refreshMatches(true);
      if (this.matches.length)
        this.index =
          (this.index - 1 + this.matches.length) % this.matches.length;
    }
    this.highlightCurrent();
    this.syncDialog();
    this.editor.emit("find", this.result());
    return this.result();
  }

  refreshMatches(preserveIndex = false) {
    const previousIndex = this.index;
    this.matches = findOffsets(this.getText(), this.term, this.options);
    if (!this.matches.length) this.index = -1;
    else if (preserveIndex)
      this.index = Math.min(
        Math.max(previousIndex, 0),
        this.matches.length - 1,
      );
    else this.index = 0;
  }

  highlightCurrent() {
    if (this.index < 0 || !this.matches[this.index]) return false;
    const match = this.matches[this.index];
    if (this.editor.isSource) {
      this.editor.source.setSelectionRange(match.start, match.end);
      return true;
    }
    const range = rangeFor(this.editor, match);
    const selection = this.editor.window.getSelection?.();
    if (!range || !selection) return false;
    selection.removeAllRanges();
    selection.addRange(range);
    return true;
  }

  replace(replacement = this.replacement) {
    return this.replaceCurrent(replacement);
  }

  replaceCurrent(replacement = this.replacement) {
    if (
      this.editor.isMutationBlocked() ||
      this.index < 0 ||
      !this.matches[this.index]
    )
      return false;
    this.replacement = String(replacement ?? "");
    const match = this.matches[this.index];
    if (this.editor.isSource) {
      this.editor.source.setRangeText(
        this.replacement,
        match.start,
        match.end,
        "end",
      );
      this.editor.editor.innerHTML = this.editor.source.value;
      this.editor.sourceMutated("replace:current");
    } else {
      const range = replaceMatch(this.editor, match, this.replacement);
      if (!range) return false;
      const selection = this.editor.window.getSelection?.();
      selection?.removeAllRanges();
      selection?.addRange(range);
      this.editor.commitMutation("replace:current", { nativeInput: true });
    }
    this.refreshMatches(false);
    if (this.matches.length) {
      const next = this.matches.findIndex(
        (candidate) => candidate.start >= match.start,
      );
      this.index = next >= 0 ? next : 0;
    }
    this.highlightCurrent();
    this.syncDialog();
    this.editor.emit("replace", { count: 1, ...this.result() });
    return true;
  }

  replaceAll(
    term = this.term,
    replacement = this.replacement,
    options = this.options,
  ) {
    if (this.editor.isMutationBlocked()) return 0;
    this.term = String(term ?? "");
    this.replacement = String(replacement ?? "");
    this.options = {
      matchCase: !!options.matchCase,
      wholeWord: !!options.wholeWord,
    };
    const matches = findOffsets(this.getText(), this.term, this.options);
    if (!matches.length) {
      this.refreshMatches(false);
      this.syncDialog();
      return 0;
    }

    let replacementCount = matches.length;
    if (this.editor.isSource) {
      let value = this.editor.source.value;
      for (const match of [...matches].reverse()) {
        value =
          value.slice(0, match.start) +
          this.replacement +
          value.slice(match.end);
      }
      this.editor.source.value = value;
      this.editor.editor.innerHTML = value;
      this.editor.sourceMutated("replace:all");
    } else {
      let replaced = 0;
      for (const match of [...matches].reverse()) {
        if (replaceMatch(this.editor, match, this.replacement)) replaced += 1;
      }
      if (!replaced) return 0;
      this.editor.commitMutation("replace:all", { nativeInput: true });
      replacementCount = replaced;
    }
    this.refreshMatches(false);
    this.highlightCurrent();
    this.syncDialog();
    this.editor.emit("replace", { count: replacementCount, ...this.result() });
    return replacementCount;
  }

  open() {
    if (this.active) {
      this.active.term.focus();
      this.active.term.select();
      return this.editor;
    }
    this.editor.dialogs?.close(false);
    const documentRef = this.editor.document;
    const focused = documentRef.activeElement;
    const previousFocus = this.editor.wrapper.contains(focused)
      ? focused
      : this.editor.activeSurface();
    const selected = this.editor.isSource
      ? this.editor.source.value.slice(
          this.editor.source.selectionStart,
          this.editor.source.selectionEnd,
        )
      : this.editor.window.getSelection?.().toString() || "";
    if (
      !this.term &&
      selected &&
      selected.length <= 200 &&
      !selected.includes("\n")
    )
      this.term = selected;

    const id = `feather_find_${++findDialogSequence}`;
    const backdrop = documentRef.createElement("div");
    backdrop.className = "feather-dialog-backdrop feather-find-backdrop";
    const dialog = documentRef.createElement("section");
    dialog.className = "feather-dialog feather-find-dialog";
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.setAttribute("aria-labelledby", `${id}_title`);
    const title = documentRef.createElement("h2");
    title.id = `${id}_title`;
    title.textContent = "Find and replace";

    const form = documentRef.createElement("form");
    const findField = documentRef.createElement("div");
    findField.className = "feather-dialog-field";
    const findLabel = documentRef.createElement("label");
    findLabel.htmlFor = `${id}_term`;
    findLabel.textContent = "Find";
    const termInput = documentRef.createElement("input");
    termInput.id = findLabel.htmlFor;
    termInput.className = "feather-find-term";
    termInput.type = "text";
    termInput.value = this.term;
    findField.append(findLabel, termInput);

    const replaceField = documentRef.createElement("div");
    replaceField.className = "feather-dialog-field";
    const replaceLabel = documentRef.createElement("label");
    replaceLabel.htmlFor = `${id}_replacement`;
    replaceLabel.textContent = "Replace with";
    const replacementInput = documentRef.createElement("input");
    replacementInput.id = replaceLabel.htmlFor;
    replacementInput.className = "feather-replace-term";
    replacementInput.type = "text";
    replacementInput.value = this.replacement;
    replaceField.append(replaceLabel, replacementInput);

    const options = documentRef.createElement("div");
    options.className = "feather-find-options";
    const matchCase = labelledCheckbox(
      documentRef,
      `${id}_case`,
      "feather-find-match-case",
      "Match case",
    );
    matchCase.input.checked = this.options.matchCase;
    const wholeWord = labelledCheckbox(
      documentRef,
      `${id}_word`,
      "feather-find-whole-word",
      "Whole word",
    );
    wholeWord.input.checked = this.options.wholeWord;
    options.append(matchCase.label, wholeWord.label);

    const summary = documentRef.createElement("div");
    summary.className = "feather-find-summary";
    const count = documentRef.createElement("span");
    count.className = "feather-find-count";
    count.setAttribute("role", "status");
    count.setAttribute("aria-live", "polite");
    summary.appendChild(count);

    const actions = documentRef.createElement("div");
    actions.className = "feather-dialog-actions feather-find-actions";
    const previous = actionButton(documentRef, "previous", "Previous");
    const next = actionButton(documentRef, "next", "Next");
    const replace = actionButton(documentRef, "replace", "Replace");
    const replaceAll = actionButton(documentRef, "replace-all", "Replace all");
    const close = actionButton(documentRef, "close", "Close");
    actions.append(previous, next, replace, replaceAll, close);
    form.append(findField, replaceField, options, summary, actions);
    dialog.append(title, form);
    backdrop.appendChild(dialog);
    this.editor.wrapper.appendChild(backdrop);

    this.active = {
      backdrop,
      dialog,
      form,
      term: termInput,
      replacement: replacementInput,
      matchCase: matchCase.input,
      wholeWord: wholeWord.input,
      count,
      previousFocus,
      replace,
      replaceAll,
    };

    const update = () => {
      this.replacement = replacementInput.value;
      this.find(termInput.value, {
        matchCase: matchCase.input.checked,
        wholeWord: wholeWord.input.checked,
      });
    };
    termInput.addEventListener("input", update);
    replacementInput.addEventListener("input", () => {
      this.replacement = replacementInput.value;
    });
    matchCase.input.addEventListener("change", update);
    wholeWord.input.addEventListener("change", update);
    form.addEventListener("submit", (event) => {
      event.preventDefault();
      this.findNext();
    });
    previous.addEventListener("click", () => this.findPrevious());
    next.addEventListener("click", () => this.findNext());
    replace.addEventListener("click", () =>
      this.replaceCurrent(replacementInput.value),
    );
    replaceAll.addEventListener("click", () =>
      this.replaceAll(termInput.value, replacementInput.value, {
        matchCase: matchCase.input.checked,
        wholeWord: wholeWord.input.checked,
      }),
    );
    close.addEventListener("click", () => this.close());
    backdrop.addEventListener("mousedown", (event) => {
      if (event.target === backdrop) this.close();
    });
    dialog.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        this.close();
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "f") {
        event.preventDefault();
        termInput.focus();
        termInput.select();
        return;
      }
      if (event.key !== "Tab") return;
      const focusable = [
        ...dialog.querySelectorAll(
          "input:not([disabled]), button:not([disabled])",
        ),
      ];
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable.at(-1);
      if (event.shiftKey && documentRef.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && documentRef.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    this.refreshMatches(false);
    this.highlightCurrent();
    this.syncDialog();
    termInput.focus();
    termInput.select();
    this.editor.emit("finddialogopen", { dialog });
    return this.editor;
  }

  syncDialog() {
    if (!this.active) return;
    const result = this.result();
    this.active.count.textContent = `${result.current} / ${result.total}`;
    const blocked = this.editor.isMutationBlocked() || !result.total;
    this.active.replace.disabled = blocked;
    this.active.replaceAll.disabled =
      this.editor.isMutationBlocked() || !this.term;
  }

  close() {
    if (!this.active) return this.editor;
    const { backdrop, previousFocus } = this.active;
    this.active = null;
    backdrop.remove();
    const previousFocusUsable =
      previousFocus?.isConnected &&
      !previousFocus.closest?.(".feather-hidden") &&
      !previousFocus.disabled;
    const target = previousFocusUsable
      ? previousFocus
      : this.editor.activeSurface();
    target?.focus?.();
    this.editor.emit("finddialogclose", {});
    return this.editor;
  }

  destroy() {
    this.close();
    this.matches = [];
    this.editor = null;
  }
}
