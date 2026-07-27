import { JSDOM } from "jsdom";

function rangeInside(editor, range) {
  return !!range && (range.commonAncestorContainer === editor || editor.contains(range.commonAncestorContainer));
}

function insertFragment(document, editor, markup, asText = false) {
  const selection = document.defaultView.getSelection();
  if (selection?.rangeCount) {
    const range = selection.getRangeAt(0);
    if (rangeInside(editor, range)) {
      range.deleteContents();
      const node = asText ? document.createTextNode(markup) : range.createContextualFragment(markup);
      const last = node.lastChild;
      range.insertNode(node);
      if (last) {
        range.setStartAfter(last);
        range.collapse(true);
        selection.removeAllRanges();
        selection.addRange(range);
      }
      return;
    }
  }
  if (asText) editor.appendChild(document.createTextNode(markup));
  else editor.insertAdjacentHTML("beforeend", markup);
}

export function installDom(markup = '<textarea id="editor"></textarea>', options = {}) {
  const dom = new JSDOM(`<!doctype html><html><body>${markup}</body></html>`, {
    pretendToBeVisual: true,
    url: options.url || "http://localhost/",
  });
  const { window } = dom;
  const { document } = window;
  const previous = new Map();
  const globals = [
    "window", "document", "navigator", "Node", "NodeFilter", "HTMLElement", "HTMLTextAreaElement",
    "Event", "CustomEvent", "KeyboardEvent", "MouseEvent", "File", "getSelection",
  ];
  for (const key of globals) previous.set(key, globalThis[key]);

  window.requestAnimationFrame ||= (callback) => setTimeout(() => callback(Date.now()), 0);
  window.cancelAnimationFrame ||= (handle) => clearTimeout(handle);

  const commands = [];
  const commandStates = new Map();
  document.execCommand = (command, _showUi, value) => {
    commands.push({ command, value });
    const editor = document.querySelector(".feather-editor");
    if (!editor) return false;
    if (command === "insertText") insertFragment(document, editor, value || "", true);
    else if (command === "insertHTML") insertFragment(document, editor, value || "");
    else if (command === "insertImage") insertFragment(document, editor, `<img src="${String(value || "")}">`);
    else if (command === "bold" || command === "italic" || command === "underline" || command === "strikethrough") {
      const tag = { bold: "b", italic: "i", underline: "u", strikethrough: "s" }[command];
      const selection = window.getSelection();
      if (selection?.rangeCount && !selection.getRangeAt(0).collapsed && rangeInside(editor, selection.getRangeAt(0))) {
        const wrapper = document.createElement(tag);
        try { selection.getRangeAt(0).surroundContents(wrapper); } catch { editor.innerHTML = `<${tag}>${editor.innerHTML}</${tag}>`; }
      } else editor.innerHTML = `<${tag}>${editor.innerHTML}</${tag}>`;
      commandStates.set(command, !commandStates.get(command));
    } else if (command === "createLink") {
      const selection = window.getSelection();
      if (selection?.rangeCount && !selection.getRangeAt(0).collapsed) {
        const anchor = document.createElement("a");
        anchor.href = value;
        selection.getRangeAt(0).surroundContents(anchor);
      }
    } else if (command === "unlink") {
      const selection = window.getSelection();
      let node = selection?.anchorNode;
      if (node?.nodeType === 3) node = node.parentElement;
      const anchor = node?.closest?.("a");
      if (anchor) anchor.replaceWith(...anchor.childNodes);
    } else if (command === "removeFormat") {
      editor.replaceChildren(document.createTextNode(editor.textContent || ""));
    } else if (command === "formatBlock") {
      editor.innerHTML = `<${value}>${editor.textContent || ""}</${value}>`;
    }
    return true;
  };
  document.queryCommandState = (command) => !!commandStates.get(command);

  Object.defineProperty(window.navigator, "clipboard", {
    configurable: true,
    value: {
      writeText: async () => {},
      readText: async () => "clipboard text",
    },
  });

  globalThis.window = window;
  globalThis.document = document;
  globalThis.navigator = window.navigator;
  globalThis.Node = window.Node;
  globalThis.NodeFilter = window.NodeFilter;
  globalThis.HTMLElement = window.HTMLElement;
  globalThis.HTMLTextAreaElement = window.HTMLTextAreaElement;
  globalThis.Event = window.Event;
  globalThis.CustomEvent = window.CustomEvent;
  globalThis.KeyboardEvent = window.KeyboardEvent;
  globalThis.MouseEvent = window.MouseEvent;
  globalThis.File = window.File;
  globalThis.getSelection = window.getSelection.bind(window);

  return {
    dom,
    window,
    document,
    commands,
    commandStates,
    cleanup() {
      dom.window.close();
      for (const [key, value] of previous) {
        if (value === undefined) delete globalThis[key];
        else globalThis[key] = value;
      }
    },
  };
}

export function createPasteEvent(text, html = "", files = []) {
  return {
    defaultPrevented: false,
    clipboardData: {
      getData(type) {
        if (type === "text/plain") return text;
        if (type === "text/html") return html;
        return "";
      },
      files,
    },
    preventDefault() { this.defaultPrevented = true; },
  };
}

export function selectText(window, node, start = 0, end = node.data?.length ?? node.childNodes.length) {
  const range = window.document.createRange();
  range.setStart(node, start);
  range.setEnd(node, end);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  return range;
}

export function installMatchMedia(window, initial = {}) {
  const queries = new Map();
  window.matchMedia = (media) => {
    if (queries.has(media)) return queries.get(media);
    const query = {
      media,
      matches: !!initial[media],
      listeners: new Set(),
      addEventListener(type, handler) { if (type === "change") this.listeners.add(handler); },
      removeEventListener(type, handler) { if (type === "change") this.listeners.delete(handler); },
      addListener(handler) { this.listeners.add(handler); },
      removeListener(handler) { this.listeners.delete(handler); },
      dispatch(matches) {
        this.matches = matches;
        for (const handler of this.listeners) handler({ matches, media: this.media });
      },
    };
    queries.set(media, query);
    return query;
  };
  return queries;
}

export const wait = (milliseconds = 0) => new Promise((resolve) => setTimeout(resolve, milliseconds));
