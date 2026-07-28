import test from "node:test";
import assert from "node:assert/strict";

import FeatherText from "../src/feathertext.js";
import { PROJECT_URL, SUPPORT_URL } from "../src/config.js";
import { installDom } from "./helpers.mjs";

test("tooltip mouseout ignores non-tooltip targets", () => {
  const fixture = installDom();
  try {
    const editor = new FeatherText("#editor");
    assert.doesNotThrow(() =>
      editor.handleTooltipPointer(
        { target: editor.wrapper, relatedTarget: null },
        false,
      ),
    );
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("permanent footer uses localized icon-only canonical links", () => {
  const fixture = installDom();
  try {
    const editor = new FeatherText("#editor", {
      language: "hu",
      wordCount: false,
      charCount: false,
      attribution: false,
      supportLink: false,
      projectUrl: "https://example.com/project",
      supportUrl: "https://example.com/support",
    });
    assert.ok(editor.statusBar);
    assert.ok(editor.wordCountEl);
    assert.ok(editor.charCountEl);
    const project = editor.statusBar.querySelector(".feather-attribution-project");
    const support = editor.statusBar.querySelector(".feather-attribution-support");
    assert.equal(project.href, PROJECT_URL);
    assert.equal(support.href, SUPPORT_URL);
    assert.equal(project.textContent, "");
    assert.equal(support.textContent, "");
    assert.equal(project.getAttribute("aria-label"), "FeatherText a GitHubon");
    assert.equal(project.dataset.featherTooltip, "FeatherText a GitHubon");
    assert.equal(
      support.getAttribute("aria-label"),
      "FeatherText támogatása a Buy Me a Coffee oldalon",
    );
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("language config and setLanguage localize built-in controls", () => {
  const fixture = installDom();
  try {
    const editor = new FeatherText("#editor", {
      language: "hu-HU",
      toolbar: ["bold", "link", "source"],
    });
    assert.equal(editor.config.language, "hu");
    assert.equal(
      editor.toolbar.querySelector('[data-command="bold"]').getAttribute("aria-label"),
      "Félkövér (Ctrl+B)",
    );
    assert.equal(editor.editor.getAttribute("placeholder"), "Kezdj el írni...");
    assert.match(editor.statusBar.textContent, /szó/);
    assert.match(editor.statusBar.textContent, /karakter/);

    editor.setLanguage("en");
    assert.equal(editor.config.language, "en");
    assert.equal(
      editor.toolbar.querySelector('[data-command="bold"]').getAttribute("aria-label"),
      "Bold (Ctrl+B)",
    );
    assert.equal(editor.editor.getAttribute("placeholder"), "Start typing...");
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});
