import test from "node:test";
import assert from "node:assert/strict";

import FeatherText from "../src/feathertext.js";
import { installDom } from "./helpers.mjs";

function dispatchInput(window, element) {
  element.dispatchEvent(new window.Event("input", { bubbles: true }));
}

test("Ctrl/Cmd+F opens a labelled local find/replace dialog with all required actions", () => {
  const fixture = installDom();
  try {
    const editor = new FeatherText("#editor");
    editor.setHTML("<p>alpha beta alpha</p>").focus();
    const shortcut = new fixture.window.KeyboardEvent("keydown", {
      key: "f",
      ctrlKey: true,
      bubbles: true,
      cancelable: true,
    });
    editor.editor.dispatchEvent(shortcut);

    assert.equal(shortcut.defaultPrevented, true);
    const active = editor.findReplaceManager.active;
    assert.ok(active);
    assert.equal(active.dialog.getAttribute("role"), "dialog");
    assert.equal(active.dialog.getAttribute("aria-modal"), "true");
    assert.equal(
      active.dialog.querySelector("h2").textContent,
      "Find and replace",
    );
    assert.equal(
      active.dialog.querySelector('label[for="' + active.term.id + '"]')
        .textContent,
      "Find",
    );
    assert.equal(
      active.dialog.querySelector('label[for="' + active.replacement.id + '"]')
        .textContent,
      "Replace with",
    );
    assert.ok(active.dialog.querySelector(".feather-find-match-case"));
    assert.ok(active.dialog.querySelector(".feather-find-whole-word"));
    assert.equal(active.count.getAttribute("aria-live"), "polite");
    assert.deepEqual(
      [...active.dialog.querySelectorAll("button")].map(
        (button) => button.textContent,
      ),
      ["Previous", "Next", "Replace", "Replace all", "Close"],
    );
    assert.equal(fixture.document.activeElement, active.term);

    active.dialog.dispatchEvent(
      new fixture.window.KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
      }),
    );
    assert.equal(editor.findReplaceManager.active, null);
    assert.equal(fixture.document.activeElement, editor.editor);
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("dialog tracks current/total and next, previous, replace, replace-all actions", () => {
  const fixture = installDom();
  try {
    const editor = new FeatherText("#editor", { historyDebounceMs: 0 });
    editor.setHTML("alpha beta alpha").openFindReplace();
    const active = editor.findReplaceManager.active;
    active.term.value = "alpha";
    dispatchInput(fixture.window, active.term);
    assert.equal(active.count.textContent, "1 / 2");
    assert.equal(fixture.window.getSelection().toString(), "alpha");

    active.dialog.querySelector('[data-action="next"]').click();
    assert.equal(active.count.textContent, "2 / 2");
    active.dialog.querySelector('[data-action="previous"]').click();
    assert.equal(active.count.textContent, "1 / 2");

    active.replacement.value = "one";
    dispatchInput(fixture.window, active.replacement);
    active.dialog.querySelector('[data-action="replace"]').click();
    assert.equal(editor.getText(), "one beta alpha");
    assert.equal(active.count.textContent, "1 / 1");
    active.dialog.querySelector('[data-action="replace-all"]').click();
    assert.equal(editor.getText(), "one beta one");
    assert.equal(active.count.textContent, "0 / 0");
    active.dialog.querySelector('[data-action="close"]').click();
    assert.equal(editor.findReplaceManager.active, null);
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("find options support case-sensitive and whole-word matching with cyclic navigation", () => {
  const fixture = installDom();
  try {
    const editor = new FeatherText("#editor");
    editor.setHTML("Cat cat scatter cat.");
    assert.deepEqual(editor.find("cat"), { term: "cat", current: 1, total: 4 });
    assert.equal(editor.findNext().current, 2);
    assert.equal(editor.findPrevious().current, 1);
    assert.equal(
      editor.findPrevious().current,
      4,
      "previous wraps to the final result",
    );
    assert.equal(editor.find("cat", { wholeWord: true }).total, 3);
    assert.equal(
      editor.find("cat", { matchCase: true, wholeWord: true }).total,
      2,
    );
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("replacement preserves unaffected DOM and formatting and is one undoable transaction", () => {
  const fixture = installDom(
    '<textarea id="editor"><p data-stable="yes">Hello <strong>world</strong> and <em>world</em>.</p></textarea>',
  );
  try {
    const editor = new FeatherText("#editor", { historyDebounceMs: 0 });
    const paragraph = editor.editor.querySelector("p");
    const strong = editor.editor.querySelector("strong");
    const emphasis = editor.editor.querySelector("em");
    assert.equal(editor.find("world").total, 2);
    assert.equal(editor.replace("earth"), true);
    assert.equal(editor.editor.querySelector("p"), paragraph);
    assert.equal(editor.editor.querySelector("strong"), strong);
    assert.equal(editor.editor.querySelector("em"), emphasis);
    assert.equal(strong.textContent, "earth");
    assert.equal(emphasis.textContent, "world");
    assert.equal(paragraph.dataset.stable, "yes");
    assert.equal(editor.history.length, 2);
    assert.equal(editor.editor.querySelector(".feather-find-highlight"), null);

    editor.undo();
    assert.equal(
      editor.getHTML(),
      '<p data-stable="yes">Hello <strong>world</strong> and <em>world</em>.</p>',
    );
    assert.equal(editor.find("world").total, 2);
    assert.equal(editor.replaceAll("world", "planet"), 2);
    assert.equal(
      editor.getHTML(),
      '<p data-stable="yes">Hello <strong>planet</strong> and <em>planet</em>.</p>',
    );
    assert.equal(
      editor.history.length,
      2,
      "redo branch is replaced by one replace-all transaction",
    );
    editor.undo();
    assert.match(editor.getHTML(), /<strong>world<\/strong>/);
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("cross-node replacement preserves inline wrappers and does not cross visual boundaries", () => {
  const fixture = installDom(
    '<textarea id="editor"><p><strong>he</strong><span data-stable="yes">ll</span><em>o</em> <u>untouched</u></p></textarea>',
  );
  try {
    const editor = new FeatherText("#editor", { historyDebounceMs: 0 });
    const strong = editor.editor.querySelector("strong");
    const middle = editor.editor.querySelector("span");
    const emphasis = editor.editor.querySelector("em");
    const unaffected = editor.editor.querySelector("u");

    assert.equal(editor.find("hello").total, 1);
    assert.equal(editor.replace("hi"), true);
    assert.equal(editor.editor.querySelector("strong"), strong);
    assert.equal(editor.editor.querySelector("span"), middle);
    assert.equal(editor.editor.querySelector("em"), emphasis);
    assert.equal(editor.editor.querySelector("u"), unaffected);
    assert.equal(strong.textContent, "hi");
    assert.equal(middle.textContent, "");
    assert.equal(emphasis.textContent, "");
    assert.equal(middle.dataset.stable, "yes");
    assert.equal(unaffected.textContent, "untouched");
    assert.equal(editor.getText(), "hi untouched");

    editor.setHTML(
      '<p>alpha</p><p>beta</p><p>locked <span contenteditable="false">gap</span> text</p>',
    );
    assert.equal(editor.find("alphabeta").total, 0);
    assert.equal(editor.find("locked gap text").total, 0);
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("source-mode find/replace keeps source, visual content, history, and shortcut behavior consistent", () => {
  const fixture = installDom('<textarea id="editor"><p>one one</p></textarea>');
  try {
    const editor = new FeatherText("#editor", { historyDebounceMs: 0 });
    editor.toggleSource();
    const shortcut = new fixture.window.KeyboardEvent("keydown", {
      key: "f",
      metaKey: true,
      bubbles: true,
      cancelable: true,
    });
    editor.source.dispatchEvent(shortcut);
    assert.equal(shortcut.defaultPrevented, true);
    editor.closeFindReplace();
    assert.equal(fixture.document.activeElement, editor.source);

    assert.equal(editor.find("one").total, 2);
    assert.equal(editor.replaceAll("one", "two"), 2);
    assert.equal(editor.source.value, "<p>two two</p>");
    assert.equal(editor.editor.innerHTML, "<p>two two</p>");
    assert.equal(
      fixture.document.getElementById("editor").value,
      "<p>two two</p>",
    );
    editor.undo();
    assert.equal(editor.source.value, "<p>one one</p>");
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("read-only editors allow finding but disable replacement", () => {
  const fixture = installDom('<textarea id="editor">find me</textarea>');
  try {
    const editor = new FeatherText("#editor", { readOnly: true });
    assert.equal(editor.find("find").total, 1);
    assert.equal(editor.replace("change"), false);
    editor.openFindReplace();
    assert.equal(editor.findReplaceManager.active.replace.disabled, true);
    assert.equal(editor.getText(), "find me");
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});
