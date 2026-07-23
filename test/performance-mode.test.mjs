import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";

import FeatherText from "../src/feathertext.performance-entry.js";

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

  const document = window.document;
  document.execCommand = () => true;
  document.queryCommandState = () => false;
  window.requestAnimationFrame = window.requestAnimationFrame || ((callback) => setTimeout(() => callback(Date.now()), 0));
  window.cancelAnimationFrame = window.cancelAnimationFrame || ((handle) => clearTimeout(handle));

  globalThis.window = window;
  globalThis.document = document;
  globalThis.navigator = window.navigator;
  globalThis.Node = window.Node;
  globalThis.NodeFilter = window.NodeFilter;
  globalThis.HTMLElement = window.HTMLElement;
  globalThis.Event = window.Event;
  globalThis.CustomEvent = window.CustomEvent;
  globalThis.getSelection = window.getSelection.bind(window);

  return {
    document,
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

test("fancy effects are disabled by default", () => {
  const { document, cleanup } = installDom();
  try {
    const editor = new FeatherText(document.getElementById("editor"));
    const tooltip = editor.ensureTooltip();

    assert.equal(editor.config.fancy, false);
    assert.equal(editor.wrapper.classList.contains("feather-fancy"), false);
    assert.equal(tooltip.classList.contains("feather-fancy"), false);
  } finally {
    cleanup();
  }
});

test("fancy effects can be enabled at construction or runtime", () => {
  const { cleanup } = installDom();
  try {
    const [editor] = FeatherText.init("#editor", { fancy: true });
    const tooltip = editor.ensureTooltip();

    assert.equal(editor instanceof FeatherText, true);
    assert.equal(editor.config.fancy, true);
    assert.equal(editor.wrapper.classList.contains("feather-fancy"), true);
    assert.equal(tooltip.classList.contains("feather-fancy"), true);

    assert.equal(editor.setFancy(false), editor);
    assert.equal(editor.config.fancy, false);
    assert.equal(editor.wrapper.classList.contains("feather-fancy"), false);
    assert.equal(tooltip.classList.contains("feather-fancy"), false);
  } finally {
    cleanup();
  }
});

test("setConfig preserves or explicitly changes fancy mode after rebuilding", () => {
  const { cleanup } = installDom();
  try {
    const [editor] = FeatherText.init("#editor", { fancy: true });

    assert.equal(editor.setConfig({ theme: "light" }), editor);
    assert.equal(editor.config.fancy, true);
    assert.equal(editor.wrapper.classList.contains("feather-fancy"), true);

    editor.setConfig({ fancy: false });
    assert.equal(editor.config.fancy, false);
    assert.equal(editor.wrapper.classList.contains("feather-fancy"), false);
  } finally {
    cleanup();
  }
});

test("encoded source tags decode without altering encoded text inside real markup", () => {
  const { cleanup } = installDom();
  try {
    const [editor] = FeatherText.init("#editor");

    assert.equal(editor.renderSourceToHTML("&lt;p&gt;Hello&lt;/p&gt;"), "<p>Hello</p>");
    assert.equal(editor.renderSourceToHTML("&#60;p&#62;Hello&#60;/p&#62;"), "<p>Hello</p>");
    assert.equal(editor.renderSourceToHTML("<p>&lt;code&gt;</p>"), "<p>&lt;code&gt;</p>");
    assert.equal(editor.renderSourceToHTML("Fish &amp; Chips"), "Fish &amp; Chips");
  } finally {
    cleanup();
  }
});
