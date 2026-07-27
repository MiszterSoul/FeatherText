import test from "node:test";
import assert from "node:assert/strict";

import FeatherText from "../src/feathertext.js";
import { createPasteEvent, installDom, selectText, wait } from "./helpers.mjs";

function input(window, target) {
  target.dispatchEvent(new window.Event("input", { bubbles: true }));
}

test("typing is captured per instance and supports undo/redo", () => {
  const fixture = installDom('<textarea id="editor"><p>start</p></textarea>');
  try {
    const editor = new FeatherText("#editor", { historyDebounceMs: 0, countDebounceMs: 0 });
    editor.editor.innerHTML = "<p>start typed</p>";
    input(fixture.window, editor.editor);
    assert.equal(editor.history.length, 2);
    assert.equal(fixture.document.getElementById("editor").value, "<p>start typed</p>");

    assert.equal(editor.undo(), editor);
    assert.equal(editor.getHTML(), "<p>start</p>");
    editor.redo();
    assert.equal(editor.getHTML(), "<p>start typed</p>");
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("typing transactions coalesce within the configured debounce window", async () => {
  const fixture = installDom();
  try {
    const editor = new FeatherText("#editor", { historyDebounceMs: 15 });
    editor.editor.textContent = "a";
    input(fixture.window, editor.editor);
    editor.editor.textContent = "ab";
    input(fixture.window, editor.editor);
    editor.editor.textContent = "abc";
    input(fixture.window, editor.editor);
    assert.equal(editor.history.length, 1);
    await wait(30);
    assert.equal(editor.history.length, 2);
    editor.undo();
    assert.equal(editor.getHTML(), "");
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("toolbar commands and paste each create undoable transactions", () => {
  const fixture = installDom('<textarea id="editor">hello</textarea>');
  try {
    const editor = new FeatherText("#editor", { historyDebounceMs: 0 });
    editor.focus();
    selectText(fixture.window, editor.editor.firstChild, 0, 5);
    editor.toolbar.querySelector('[data-command="bold"]').click();
    assert.equal(editor.getHTML(), "<b>hello</b>");
    assert.equal(editor.history.length, 2);

    editor.handlePaste(createPasteEvent(" pasted"));
    assert.match(editor.getText(), /pasted/);
    assert.equal(editor.history.length, 3);
    editor.undo();
    assert.equal(editor.getHTML(), "<b>hello</b>");
    editor.undo();
    assert.equal(editor.getHTML(), "hello");
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("source edits participate in the same transaction history", () => {
  const fixture = installDom('<textarea id="editor"><p>one</p></textarea>');
  try {
    const editor = new FeatherText("#editor", { historyDebounceMs: 0 });
    editor.toggleSource();
    editor.source.value = "<p>two</p>";
    input(fixture.window, editor.source);
    assert.equal(editor.getHTML(), "<p>two</p>");
    assert.equal(editor.history.length, 2);

    editor.undo();
    assert.equal(editor.source.value, "<p>one</p>");
    assert.equal(editor.editor.innerHTML, "<p>one</p>");
    editor.redo();
    assert.equal(editor.source.value, "<p>two</p>");
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("a new mutation after undo invalidates redo", () => {
  const fixture = installDom();
  try {
    const editor = new FeatherText("#editor", { historyDebounceMs: 0 });
    editor.setHTML("one").setHTML("two");
    editor.undo();
    assert.equal(editor.getHTML(), "one");
    editor.setHTML("branch");
    const index = editor.historyIndex;
    editor.redo();
    assert.equal(editor.historyIndex, index);
    assert.equal(editor.getHTML(), "branch");
    assert.deepEqual(editor.history, ["", "one", "branch"]);
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("historyLimit bounds retained snapshots without crossing instance boundaries", () => {
  const fixture = installDom('<textarea id="one"></textarea><textarea id="two"></textarea>');
  try {
    const first = new FeatherText("#one", { historyLimit: 3, historyDebounceMs: 0 });
    const second = new FeatherText("#two", { historyDebounceMs: 0 });
    first.setHTML("1").setHTML("2").setHTML("3").setHTML("4");
    second.setHTML("other");
    assert.deepEqual(first.history, ["2", "3", "4"]);
    assert.deepEqual(second.history, ["", "other"]);
    first.undo().undo();
    assert.equal(first.getHTML(), "2");
    assert.equal(second.getHTML(), "other");
    first.destroy();
    second.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("DOM selection is restored where practical with a history snapshot", () => {
  const fixture = installDom();
  try {
    const editor = new FeatherText("#editor", { historyDebounceMs: 0 });
    editor.setHTML("<p>one</p>").focus();
    const text = editor.editor.querySelector("p").firstChild;
    selectText(fixture.window, text, 2, 2);
    editor.pushHistory("selection");
    editor.setHTML("<p>two</p>");
    editor.undo();

    const selection = fixture.window.getSelection();
    assert.equal(selection.anchorNode.data, "one");
    assert.equal(selection.anchorOffset, 2);
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});
