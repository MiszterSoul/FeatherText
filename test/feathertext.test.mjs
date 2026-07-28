import test from "node:test";
import assert from "node:assert/strict";

import FeatherText from "../src/feathertext.performance-entry.js";
import { createPasteEvent, installDom, installMatchMedia } from "./helpers.mjs";

test("pasteFilter can override pasted content", () => {
  const fixture = installDom();
  try {
    const [editor] = FeatherText.init("#editor", {
      pasteFilter(payload) {
        return {
          type: "html",
          content: `<p>${payload.text.toUpperCase()}</p>`,
        };
      },
    });
    const handled = editor.handlePaste(
      createPasteEvent("hello", "<b>hello</b>"),
    );
    assert.equal(handled, true);
    assert.deepEqual(fixture.commands.at(-1), {
      command: "insertHTML",
      value: "<p>HELLO</p>",
    });
    assert.equal(
      fixture.document.getElementById("editor").style.display,
      "none",
    );
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("source mode and smart source helpers update the source buffer", () => {
  const fixture = installDom();
  try {
    const editor = new FeatherText("#editor", {
      sourceWrapLines: false,
      sourceSmartTabs: true,
      sourceAutoClose: true,
    });
    editor.setHTML("<section><p>Hello</p></section>").toggleSource();
    assert.equal(editor.isSource, true);
    assert.equal(editor.sourceHeader.style.display, "flex");
    assert.equal(editor.source.rows, 10);

    editor.source.value = "<section";
    editor.source.setSelectionRange(
      editor.source.value.length,
      editor.source.value.length,
    );
    editor.handleSourceKeydown({
      key: ">",
      metaKey: false,
      ctrlKey: false,
      altKey: false,
      preventDefault() {},
    });
    assert.equal(editor.source.value, "<section></section>");

    editor.source.value = "";
    editor.source.setSelectionRange(0, 0);
    editor.handleSourceKeydown({
      key: "Tab",
      shiftKey: false,
      preventDefault() {},
    });
    assert.equal(editor.source.value, "  ");

    editor.toggleSourceSetting("sourceWrapLines");
    assert.equal(editor.source.getAttribute("wrap"), "soft");
    assert.equal(
      editor.sourceWrap.classList.contains("feather-source-wrapped"),
      true,
    );
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("public source mode decodes standalone encoded tags when returning to visual mode", () => {
  const fixture = installDom();
  try {
    const editor = new FeatherText("#editor");
    editor.setHTML("&lt;p&gt;Hello&lt;/p&gt;").toggleSource();
    assert.equal(editor.source.value, "<p>Hello</p>");
    editor.toggleSource();
    assert.equal(editor.editor.innerHTML, "<p>Hello</p>");
    assert.equal(editor.editor.textContent, "Hello");
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("auto theme follows media state on the wrapper without mutating documentElement", () => {
  const fixture = installDom();
  try {
    const queries = installMatchMedia(fixture.window, {
      "(prefers-color-scheme: dark)": true,
    });
    fixture.document.documentElement.setAttribute("data-theme", "host-theme");
    const editor = new FeatherText("#editor", { theme: "auto" });

    assert.equal(editor.wrapper.getAttribute("data-theme"), "dark");
    assert.equal(
      fixture.document.documentElement.getAttribute("data-theme"),
      "host-theme",
    );
    queries.get("(prefers-color-scheme: dark)").dispatch(false);
    assert.equal(editor.wrapper.getAttribute("data-theme"), "light");
    queries.get("(prefers-contrast: more)").dispatch(true);
    assert.equal(editor.wrapper.getAttribute("data-theme"), "high-contrast");

    editor.destroy();
    queries.get("(prefers-contrast: more)").dispatch(false);
    assert.equal(
      fixture.document.documentElement.getAttribute("data-theme"),
      "host-theme",
    );
  } finally {
    fixture.cleanup();
  }
});

test("toolbar controls expose local tooltips while editor surfaces do not", () => {
  const fixture = installDom();
  try {
    const editor = new FeatherText("#editor");
    const button = editor.toolbar.querySelector('[data-command="bold"]');
    assert.equal(editor.getTooltipTarget(editor.editor), null);
    assert.equal(editor.getTooltipTarget(button), button);
    editor.showTooltip(button);
    assert.equal(editor.tooltipEl.parentElement, fixture.document.body);
    assert.equal(editor.tooltipEl.dataset.featherTheme, "dark");
    assert.equal(
      editor.tooltipEl.style.getPropertyValue("--feather-panel"),
      editor.wrapper.style.getPropertyValue("--feather-panel"),
    );
    editor.setTheme("lavender");
    assert.equal(editor.tooltipEl.dataset.featherTheme, "lavender");
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("pasteIntoSource updates source, preview, original control, and returns the instance", () => {
  const fixture = installDom();
  try {
    const editor = new FeatherText("#editor");
    assert.equal(editor.pasteIntoSource("<p>Inserted via API</p>"), editor);
    assert.equal(editor.source.value, "<p>Inserted via API</p>");
    assert.equal(editor.editor.innerHTML, "<p>Inserted via API</p>");
    assert.equal(
      fixture.document.getElementById("editor").value,
      "<p>Inserted via API</p>",
    );
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("destroy removes managed listeners and instance-owned transient DOM", () => {
  const fixture = installDom();
  try {
    const editor = new FeatherText("#editor");
    const button = editor.toolbar.querySelector(".feather-btn");
    let toolbarStateUpdated = false;
    editor.showTooltip(button);
    editor.updateToolbarState = () => {
      toolbarStateUpdated = true;
    };
    fixture.window.getSelection = () => ({ anchorNode: editor.editor });

    editor.destroy();
    editor._isFocusedWithin = true;
    fixture.document.dispatchEvent(new fixture.window.Event("selectionchange"));
    assert.equal(toolbarStateUpdated, false);
    assert.equal(editor._managedListeners.length, 0);
    assert.equal(fixture.document.querySelector(".feather"), null);
    assert.equal(fixture.document.querySelector(".feather-tooltip"), null);
    assert.equal(fixture.document.getElementById("editor").style.display, "");
  } finally {
    fixture.cleanup();
  }
});
