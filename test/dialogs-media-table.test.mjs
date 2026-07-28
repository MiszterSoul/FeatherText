import test from "node:test";
import assert from "node:assert/strict";

import FeatherText from "../src/feathertext.js";
import { installDom, selectText, wait } from "./helpers.mjs";

function field(editor, name) {
  return editor.dialogs.active.dialog.querySelector(`[name="${name}"]`);
}

async function submit(editor) {
  editor.dialogs.active.confirm.click();
  await wait(0);
}

test("link dialog is local, labelled, keyboard-cancellable, and restores focus", async () => {
  const fixture = installDom();
  try {
    const editor = new FeatherText("#editor");
    editor.setHTML("hello").focus();
    selectText(fixture.window, editor.editor.firstChild, 0, 5);
    const result = editor.insertLink();
    const dialog = editor.dialogs.active.dialog;
    assert.equal(dialog.getAttribute("role"), "dialog");
    assert.equal(dialog.getAttribute("aria-modal"), "true");
    assert.equal(dialog.parentElement.parentElement, editor.wrapper);
    const url = field(editor, "url");
    assert.equal(
      dialog.querySelector(`label[for="${url.id}"]`).textContent,
      "Link URL",
    );
    assert.equal(fixture.document.activeElement, url);

    dialog.dispatchEvent(
      new fixture.window.KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
      }),
    );
    assert.equal(await result, false);
    assert.equal(editor.dialogs.active, null);
    assert.equal(fixture.document.activeElement, editor.editor);
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("link dialog confirms a safe URL and applies secure new-window attributes", async () => {
  const fixture = installDom();
  try {
    const editor = new FeatherText("#editor", { historyDebounceMs: 0 });
    editor.setHTML("hello").focus();
    selectText(fixture.window, editor.editor.firstChild, 0, 5);
    const result = editor.insertLink();
    field(editor, "url").value = "https://example.com/docs";
    await submit(editor);
    assert.equal(await result, true);
    const anchor = editor.editor.querySelector("a");
    assert.equal(anchor.getAttribute("href"), "https://example.com/docs");
    assert.equal(anchor.target, "_blank");
    assert.equal(anchor.rel, "noopener noreferrer");
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("invalid dialog URLs show a local alert and do not insert content", async () => {
  const fixture = installDom();
  try {
    const editor = new FeatherText("#editor").focus();
    const result = editor.insertImage();
    field(editor, "url").value = "javascript:alert(1)";
    await submit(editor);
    const error = editor.dialogs.active.error;
    assert.equal(error.hidden, false);
    assert.match(error.textContent, /safe HTTP/);
    assert.equal(
      fixture.commands.some(({ command }) => command === "insertHTML"),
      false,
    );
    editor.dialogs.active.cancel.click();
    assert.equal(await result, false);
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("image, video, and table dialogs expose labels and insert bounded markup", async () => {
  const fixture = installDom();
  try {
    const editor = new FeatherText("#editor", {
      tableMaxRows: 4,
      tableMaxColumns: 5,
    });

    const imageResult = editor.insertImage();
    field(editor, "url").value = "https://example.com/image.png";
    field(editor, "alt").value = "A useful description";
    await submit(editor);
    assert.equal(await imageResult, true);
    assert.match(fixture.commands.at(-1).value, /alt="A useful description"/);

    const videoResult = editor.insertVideo();
    field(editor, "url").value = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
    await submit(editor);
    assert.equal(await videoResult, true);
    assert.equal(
      fixture.commands.at(-1).value,
      '<iframe src="https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ" width="560" height="315" title="Embedded video" loading="lazy" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>',
    );

    const tableResult = editor.insertTable();
    assert.equal(field(editor, "rows").max, "4");
    assert.equal(field(editor, "columns").max, "5");
    field(editor, "rows").value = "2";
    field(editor, "columns").value = "3";
    await submit(editor);
    assert.equal(await tableResult, true);
    const table = editor.editor.querySelector("table");
    assert.equal(table.rows.length, 2);
    assert.equal(table.rows[0].cells.length, 3);
    assert.equal(editor.insertTable(5, 1), false);
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("imageUpload hook is asynchronous, validated, and available from the image dialog", async () => {
  const fixture = installDom();
  try {
    const seen = [];
    const editor = new FeatherText("#editor", {
      async imageUpload(file, instance) {
        await wait(1);
        seen.push([file.name, instance]);
        return { url: "https://cdn.example/uploaded.png", alt: "Hook alt" };
      },
    });
    const file = new fixture.window.File(["image"], "photo.png", {
      type: "image/png",
    });
    assert.equal(await editor.uploadImage(file), editor);
    assert.deepEqual(seen, [["photo.png", editor]]);
    assert.match(
      fixture.commands.at(-1).value,
      /src="https:\/\/cdn\.example\/uploaded\.png"/,
    );
    assert.match(fixture.commands.at(-1).value, /alt="Hook alt"/);

    const dialogResult = editor.insertImage();
    assert.equal(field(editor, "file").accept, "image/*");
    editor.dialogs.active.cancel.click();
    assert.equal(await dialogResult, false);
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("async image upload restores the captured insertion selection", async () => {
  const fixture = installDom();
  try {
    const editor = new FeatherText("#editor", {
      async imageUpload() {
        await wait(5);
        return "https://cdn.example/selection.png";
      },
    });
    editor.setHTML("beforeafter").focus();
    selectText(fixture.window, editor.editor.firstChild, 6, 6);
    const upload = editor.uploadImage(
      new fixture.window.File(["x"], "x.png", { type: "image/png" }),
    );
    fixture.window.getSelection().removeAllRanges();
    await upload;
    assert.equal(
      editor.editor.innerHTML,
      'before<img src="https://cdn.example/selection.png" alt="">after',
    );
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("safe insertion APIs write markup directly into the active source transaction", () => {
  const fixture = installDom();
  try {
    const editor = new FeatherText("#editor", { historyDebounceMs: 0 });
    editor.setHTML("caption").toggleSource();
    editor.source.setSelectionRange(0, 7);
    const commandCount = fixture.commands.length;
    assert.equal(editor.insertLink("https://example.com"), editor);
    assert.match(editor.source.value, /^<a href="https:\/\/example\.com"/);
    editor.source.setSelectionRange(
      editor.source.value.length,
      editor.source.value.length,
    );
    assert.equal(editor.insertImage("/source.png", "Source"), editor);
    assert.match(
      editor.source.value,
      /<img src="\/source\.png" alt="Source">$/,
    );
    assert.equal(fixture.commands.length, commandCount);
    assert.equal(
      fixture.document.getElementById("editor").value,
      editor.source.value,
    );
    editor.undo();
    assert.equal(editor.source.value.includes("source.png"), false);
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("semantic table context operations are bounded and undoable", () => {
  const fixture = installDom();
  try {
    const editor = new FeatherText("#editor", {
      tableMaxRows: 2,
      tableMaxColumns: 3,
      historyDebounceMs: 0,
    });
    editor
      .setHTML(
        "<table><tbody><tr><td>one</td><td>two</td></tr></tbody></table>",
      )
      .focus();
    selectText(
      fixture.window,
      editor.editor.querySelector("td").firstChild,
      0,
      0,
    );

    assert.equal(editor.addTableRow(), editor);
    assert.equal(editor.editor.querySelector("table").rows.length, 2);
    assert.equal(editor.addTableRow(), false, "row bound is enforced");
    assert.equal(editor.addTableColumn("before"), editor);
    assert.equal(editor.editor.querySelector("table").rows[0].cells.length, 3);
    assert.equal(editor.addTableColumn(), false, "column bound is enforced");
    assert.equal(editor.deleteTableColumn(), editor);
    assert.equal(editor.editor.querySelector("table").rows[0].cells.length, 2);
    assert.equal(editor.deleteTableRow(), editor);
    assert.equal(editor.editor.querySelector("table").rows.length, 1);
    editor.undo();
    assert.equal(editor.editor.querySelector("table").rows.length, 2);
    assert.equal(editor.deleteTable(), editor);
    assert.equal(editor.editor.querySelector("table"), null);
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});
