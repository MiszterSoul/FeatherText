import test from "node:test";
import assert from "node:assert/strict";

import PublicFeatherText from "../src/feathertext.performance-entry.js";
import FeatherText from "../src/feathertext.js";
import { installDom, wait } from "./helpers.mjs";

test("original form control stays synchronized and native form reset restores initial content/history", async () => {
  const fixture = installDom(
    '<form id="form"><textarea id="editor"><p>initial</p></textarea></form>',
  );
  try {
    const original = fixture.document.getElementById("editor");
    const editor = new FeatherText(original, { historyDebounceMs: 0 });
    editor.toggleSource();
    editor.source.value = "<p>changed in source</p>";
    editor.source.dispatchEvent(
      new fixture.window.Event("input", { bubbles: true }),
    );
    assert.equal(original.value, "<p>changed in source</p>");
    assert.equal(editor.history.length, 2);

    fixture.document.getElementById("form").reset();
    await wait(5);
    assert.equal(
      editor.isSource,
      true,
      "form reset does not force a mode switch",
    );
    assert.equal(editor.source.value, "<p>initial</p>");
    assert.equal(editor.editor.innerHTML, "<p>initial</p>");
    assert.equal(original.value, "<p>initial</p>");
    assert.deepEqual(editor.history, ["<p>initial</p>"]);
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("user mutations dispatch input on the original control", () => {
  const fixture = installDom('<textarea id="editor">text</textarea>');
  try {
    const original = fixture.document.getElementById("editor");
    const editor = new FeatherText(original, { historyDebounceMs: 0 });
    let inputs = 0;
    original.addEventListener("input", () => {
      inputs += 1;
    });
    editor.editor.innerHTML = "typed";
    editor.editor.dispatchEvent(
      new fixture.window.Event("input", { bubbles: true }),
    );
    editor.exec("bold");
    assert.ok(inputs >= 2);
    assert.equal(original.value, editor.getHTML());
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("maxLength null allows native typing while a numeric limit blocks overflow", () => {
  const fixture = installDom('<textarea id="editor">x</textarea>');
  try {
    const editor = new FeatherText("#editor");
    const allowed = new fixture.window.InputEvent("beforeinput", {
      bubbles: true,
      cancelable: true,
      data: "y",
      inputType: "insertText",
    });
    editor.editor.dispatchEvent(allowed);
    assert.equal(allowed.defaultPrevented, false);

    editor.setConfig({ maxLength: 1 });
    const blocked = new fixture.window.InputEvent("beforeinput", {
      bubbles: true,
      cancelable: true,
      data: "y",
      inputType: "insertText",
    });
    editor.editor.dispatchEvent(blocked);
    assert.equal(blocked.defaultPrevented, true);
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("readOnly and disabled states block mutation and mirror semantic control state", () => {
  const fixture = installDom();
  try {
    const original = fixture.document.getElementById("editor");
    const editor = new FeatherText(original);
    const bold = editor.toolbar.querySelector('[data-command="bold"]');
    const source = editor.toolbar.querySelector('[data-command="source"]');

    editor.setReadOnly(true);
    assert.equal(editor.editor.contentEditable, "false");
    assert.equal(editor.editor.getAttribute("aria-readonly"), "true");
    assert.equal(editor.source.readOnly, true);
    assert.equal(bold.disabled, true);
    assert.equal(
      source.disabled,
      false,
      "source viewing remains available while read-only",
    );
    const commandCount = fixture.commands.length;
    assert.equal(editor.insertImage("https://example.com/image.png"), false);
    assert.equal(fixture.commands.length, commandCount);

    editor.setReadOnly(false).disable();
    assert.equal(original.disabled, true);
    assert.equal(editor.wrapper.getAttribute("aria-disabled"), "true");
    assert.equal(source.disabled, true);
    assert.equal(editor.enable(), editor);
    assert.equal(original.disabled, false);
    assert.equal(editor.editor.contentEditable, "true");
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("disabled/readOnly state is inherited from the original textarea", () => {
  const fixture = installDom(
    '<textarea id="editor" disabled readonly></textarea>',
  );
  try {
    const editor = new FeatherText("#editor");
    assert.equal(editor.config.disabled, true);
    assert.equal(editor.config.readOnly, true);
    assert.equal(editor.editor.contentEditable, "false");
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("instance events, DOM custom events, and plugin lifecycle form a minimal extension skeleton", () => {
  const fixture = installDom();
  try {
    const lifecycle = [];
    FeatherText.registerPlugin("test-plugin", (editor, options) => {
      lifecycle.push(["init", editor, options]);
      editor.on("change", options.handler);
      return () => lifecycle.push(["destroy", editor]);
    });
    const handlerEvents = [];
    const domEvents = [];
    const editor = new FeatherText("#editor", {
      plugins: [
        [
          "test-plugin",
          { handler: (detail) => handlerEvents.push(detail.html) },
        ],
      ],
    });
    editor.wrapper.addEventListener("feathertext:change", (event) =>
      domEvents.push(event.detail.html),
    );
    const directEvents = [];
    const direct = (detail) => directEvents.push(detail.html);
    editor.on("change", direct);

    editor.setHTML("<p>event</p>");
    assert.deepEqual(handlerEvents, ["<p>event</p>"]);
    assert.deepEqual(directEvents, ["<p>event</p>"]);
    assert.deepEqual(domEvents, ["<p>event</p>"]);
    assert.equal(editor.off("change", direct), editor);
    editor.setHTML("<p>second</p>");
    assert.deepEqual(directEvents, ["<p>event</p>"]);

    editor.destroy();
    assert.equal(lifecycle[0][0], "init");
    assert.equal(lifecycle.at(-1)[0], "destroy");
    FeatherText.unregisterPlugin("test-plugin");
  } finally {
    fixture.cleanup();
  }
});

test("large source buffers fall back to escaped plain overlay text at the configured threshold", () => {
  const fixture = installDom();
  try {
    const editor = new FeatherText("#editor", { sourceHighlightThreshold: 10 });
    const large = "<p>0123456789012345</p>";
    editor.setHTML(large).toggleSource();
    assert.equal(editor.sourceWrap.dataset.highlight, "plain");
    assert.equal(editor.codeOverlay.textContent, large);
    assert.equal(editor.codeOverlay.querySelector(".tok-tag"), null);

    editor.source.value = "<p>x</p>";
    editor.highlightSource();
    assert.equal(editor.sourceWrap.dataset.highlight, "syntax");
    assert.ok(editor.codeOverlay.querySelector(".tok-tag"));
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("global entry continues to expose the same constructor", async () => {
  const fixture = installDom();
  const previous = globalThis.FeatherText;
  try {
    delete globalThis.FeatherText;
    await import(`../src/feathertext.global.js?test=${Date.now()}`);
    assert.equal(globalThis.FeatherText, PublicFeatherText);
    const editor = new globalThis.FeatherText("#editor");
    assert.equal(editor instanceof PublicFeatherText, true);
    assert.equal(editor instanceof FeatherText, true);
    editor.destroy();
  } finally {
    if (previous === undefined) delete globalThis.FeatherText;
    else globalThis.FeatherText = previous;
    fixture.cleanup();
  }
});
