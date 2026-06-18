import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

import FeatherText from "../src/feathertext.js";

function installDom(markup = '<textarea id="editor"></textarea>') {
  const dom = new JSDOM(`<!doctype html><html><body>${markup}</body></html>`, {
    pretendToBeVisual: true,
    url: "http://localhost/",
  });

  const { window } = dom;
  const previous = {
    window: globalThis.window,
    document: globalThis.document,
    navigator: globalThis.navigator,
    Node: globalThis.Node,
    NodeFilter: globalThis.NodeFilter,
    HTMLElement: globalThis.HTMLElement,
    Event: globalThis.Event,
    CustomEvent: globalThis.CustomEvent,
    getSelection: globalThis.getSelection,
  };

  const commands = [];
  const document = window.document;
  const navigator = window.navigator;

  window.requestAnimationFrame = window.requestAnimationFrame || ((callback) => setTimeout(() => callback(Date.now()), 0));
  window.cancelAnimationFrame = window.cancelAnimationFrame || ((handle) => clearTimeout(handle));

  document.execCommand = (command, _showUi, value) => {
    commands.push({ command, value });
    const editor = document.querySelector(".feather-editor");
    if (command === "insertText" && editor) {
      editor.textContent += value || "";
      return true;
    }
    if (command === "insertHTML" && editor) {
      editor.innerHTML += value || "";
      return true;
    }
    return true;
  };
  document.queryCommandState = () => false;

  Object.defineProperty(window, "navigator", { value: navigator, configurable: true });
  Object.defineProperty(navigator, "clipboard", {
    configurable: true,
    value: {
      writeText: async () => { },
      readText: async () => "clipboard text",
    },
  });

  globalThis.window = window;
  globalThis.document = document;
  globalThis.navigator = navigator;
  globalThis.Node = window.Node;
  globalThis.NodeFilter = window.NodeFilter;
  globalThis.HTMLElement = window.HTMLElement;
  globalThis.Event = window.Event;
  globalThis.CustomEvent = window.CustomEvent;
  globalThis.getSelection = window.getSelection.bind(window);

  return {
    window,
    document,
    commands,
    cleanup() {
      dom.window.close();
      globalThis.window = previous.window;
      globalThis.document = previous.document;
      globalThis.navigator = previous.navigator;
      globalThis.Node = previous.Node;
      globalThis.NodeFilter = previous.NodeFilter;
      globalThis.HTMLElement = previous.HTMLElement;
      globalThis.Event = previous.Event;
      globalThis.CustomEvent = previous.CustomEvent;
      globalThis.getSelection = previous.getSelection;
    },
  };
}

function createPasteEvent(text, html = "") {
  return {
    defaultPrevented: false,
    clipboardData: {
      getData(type) {
        if (type === "text/plain") return text;
        if (type === "text/html") return html;
        return "";
      },
      files: [],
    },
    preventDefault() {
      this.defaultPrevented = true;
    },
  };
}

test("pasteFilter can override pasted content", () => {
  const { document, commands, cleanup } = installDom();
  try {
    const [editor] = FeatherText.init("#editor", {
      pasteFilter(payload) {
        return { type: "html", content: `<p>${payload.text.toUpperCase()}</p>` };
      },
    });

    const handled = editor.handlePaste(createPasteEvent("hello", "<b>hello</b>"));

    assert.equal(handled, true);
    assert.deepEqual(commands.at(-1), { command: "insertHTML", value: "<p>HELLO</p>" });
    assert.equal(document.getElementById("editor")?.style.display, "none");
  } finally {
    cleanup();
  }
});

test("source mode toggles and smart editor helpers update the source textarea", () => {
  const { cleanup } = installDom();
  try {
    const [editor] = FeatherText.init("#editor", {
      sourceWrapLines: false,
      sourceSmartTabs: true,
      sourceAutoClose: true,
    });

    editor.setHTML("<section><p>Hello</p></section>");
    editor.toggleSource();

    assert.equal(editor.isSource, true);
    assert.equal(editor.sourceHeader.style.display, "flex");

    editor.source.value = "<section";
    editor.source.setSelectionRange(editor.source.value.length, editor.source.value.length);
    editor.handleSourceKeydown({
      key: ">",
      metaKey: false,
      ctrlKey: false,
      altKey: false,
      preventDefault() { },
    });
    assert.equal(editor.source.value, "<section></section>");

    editor.source.value = "";
    editor.source.setSelectionRange(0, 0);
    editor.handleSourceKeydown({
      key: "Tab",
      shiftKey: false,
      preventDefault() { },
    });
    assert.equal(editor.source.value, "  ");

    editor.toggleSourceSetting("sourceWrapLines");
    assert.equal(editor.source.getAttribute("wrap"), "soft");
    assert.equal(editor.sourceWrap.classList.contains("feather-source-wrapped"), true);
  } finally {
    cleanup();
  }
});

test("auto theme follows the system color scheme", () => {
  const { window, document, cleanup } = installDom();
  try {
    let darkMode = true;
    const mediaQuery = {
      matches: darkMode,
      media: "(prefers-color-scheme: dark)",
      _handler: null,
      addEventListener(_event, handler) { this._handler = handler; },
      removeEventListener(_event, handler) { if (this._handler === handler) this._handler = null; },
      addListener(handler) { this._handler = handler; },
      removeListener(handler) { if (this._handler === handler) this._handler = null; },
      dispatch(next) { this.matches = next; if (this._handler) this._handler({ matches: next, media: this.media }); },
    };

    window.matchMedia = () => mediaQuery;

    const [editor] = FeatherText.init("#editor", { theme: "auto" });

    assert.equal(document.documentElement.getAttribute("data-theme"), "dark");

    mediaQuery.dispatch(false);
    assert.equal(document.documentElement.getAttribute("data-theme"), "light");

    editor.destroy();
    mediaQuery.dispatch(true);
    assert.equal(document.documentElement.getAttribute("data-theme"), "light");
  } finally {
    cleanup();
  }
});

test("destroy removes managed listeners and detaches tooltip state", () => {
  const { window, document, cleanup } = installDom();
  try {
    const [editor] = FeatherText.init("#editor", {});
    const button = editor.toolbar.querySelector(".feather-btn");
    let toolbarStateUpdated = false;

    editor.showTooltip(button);
    editor.updateToolbarState = () => {
      toolbarStateUpdated = true;
    };
    window.getSelection = () => ({ anchorNode: editor.editor });

    editor.destroy();
    editor._isFocusedWithin = true;
    document.dispatchEvent(new window.Event("selectionchange"));

    assert.equal(toolbarStateUpdated, false);
    assert.equal(editor._managedListeners.length, 0);
    assert.equal(document.querySelector(".feather"), null);
    assert.equal(document.querySelector(".feather-tooltip"), null);
    assert.equal(document.getElementById("editor").style.display, "");
  } finally {
    cleanup();
  }
});