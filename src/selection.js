function nodePath(root, node) {
  const path = [];
  for (let current = node; current && current !== root; current = current.parentNode) {
    const parent = current.parentNode;
    if (!parent) return null;
    path.unshift(Array.prototype.indexOf.call(parent.childNodes, current));
  }
  return node === root || path.length ? path : null;
}

function resolvePath(root, path) {
  let node = root;
  for (const index of path || []) {
    if (!node || !node.childNodes || !node.childNodes[index]) return null;
    node = node.childNodes[index];
  }
  return node;
}

function maxOffset(node) {
  if (!node) return 0;
  return node.nodeType === 3 ? node.data.length : node.childNodes.length;
}

export class SelectionManager {
  constructor(root, source) {
    this.root = root;
    this.source = source;
    this.savedRange = null;
  }

  contains(node) {
    return !!node && (node === this.root || this.root.contains(node.nodeType === 1 ? node : node.parentNode));
  }

  save() {
    const selection = this.root.ownerDocument.defaultView.getSelection();
    if (!selection || !selection.rangeCount) return false;
    const range = selection.getRangeAt(0);
    if (!this.contains(range.commonAncestorContainer)) return false;
    this.savedRange = range.cloneRange();
    return true;
  }

  restoreSaved() {
    if (!this.savedRange) return false;
    const range = this.savedRange;
    this.savedRange = null;
    if (!range.startContainer?.isConnected || !this.contains(range.commonAncestorContainer)) return false;
    const selection = this.root.ownerDocument.defaultView.getSelection();
    if (!selection) return false;
    selection.removeAllRanges();
    selection.addRange(range);
    return true;
  }

  clearSaved() {
    this.savedRange = null;
  }

  capture(sourceMode = false) {
    if (sourceMode && this.source) {
      return {
        type: "source",
        start: this.source.selectionStart || 0,
        end: this.source.selectionEnd || 0,
        direction: this.source.selectionDirection || "none",
      };
    }

    const selection = this.root.ownerDocument.defaultView.getSelection();
    if (!selection || !selection.rangeCount || !this.contains(selection.anchorNode) || !this.contains(selection.focusNode)) return null;
    const anchorPath = nodePath(this.root, selection.anchorNode);
    const focusPath = nodePath(this.root, selection.focusNode);
    if (!anchorPath || !focusPath) return null;
    return {
      type: "editor",
      anchorPath,
      anchorOffset: selection.anchorOffset,
      focusPath,
      focusOffset: selection.focusOffset,
    };
  }

  restore(snapshot, sourceMode = false) {
    if (!snapshot) return false;
    if (sourceMode && snapshot.type === "source" && this.source) {
      const length = this.source.value.length;
      const start = Math.min(snapshot.start, length);
      const end = Math.min(snapshot.end, length);
      this.source.setSelectionRange(start, end, snapshot.direction || "none");
      return true;
    }
    if (sourceMode || snapshot.type !== "editor") return false;

    const anchor = resolvePath(this.root, snapshot.anchorPath);
    const focus = resolvePath(this.root, snapshot.focusPath);
    if (!anchor || !focus) return false;
    const selection = this.root.ownerDocument.defaultView.getSelection();
    if (!selection) return false;
    const anchorOffset = Math.min(snapshot.anchorOffset, maxOffset(anchor));
    const focusOffset = Math.min(snapshot.focusOffset, maxOffset(focus));
    selection.removeAllRanges();
    if (typeof selection.setBaseAndExtent === "function") {
      selection.setBaseAndExtent(anchor, anchorOffset, focus, focusOffset);
    } else {
      const range = this.root.ownerDocument.createRange();
      range.setStart(anchor, anchorOffset);
      range.setEnd(focus, focusOffset);
      selection.addRange(range);
    }
    return true;
  }
}
