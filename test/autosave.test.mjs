import test from "node:test";
import assert from "node:assert/strict";

import FeatherText from "../src/feathertext.js";
import { installDom, wait } from "./helpers.mjs";

function memoryStorage(initial = {}) {
  const values = new Map(Object.entries(initial));
  const calls = { get: 0, set: 0, remove: 0 };
  return {
    calls,
    values,
    getItem(key) {
      calls.get += 1;
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      calls.set += 1;
      values.set(key, value);
    },
    removeItem(key) {
      calls.remove += 1;
      values.delete(key);
    },
  };
}

function draft(html, mode = "editor") {
  return JSON.stringify({ version: 1, html, mode, updatedAt: Date.now() });
}

test("autosave is opt-in and legacy boolean/interval mode uses isolated per-instance keys", () => {
  const fixture = installDom(
    '<textarea id="one"></textarea><textarea id="two"></textarea><textarea id="off"></textarea>',
  );
  try {
    const disabled = new FeatherText("#off", {
      wordCount: false,
      charCount: false,
      attribution: false,
    });
    disabled.setHTML("not persisted");
    assert.equal(fixture.window.localStorage.length, 0);
    assert.ok(disabled.statusBar);

    const first = new FeatherText("#one", {
      autosave: true,
      autosaveInterval: 0,
      wordCount: false,
      charCount: false,
      attribution: false,
    });
    const second = new FeatherText("#two", {
      autosave: true,
      autosaveInterval: 0,
      wordCount: false,
      charCount: false,
      attribution: false,
    });
    first.setHTML("first draft");
    second.setHTML("second draft");

    assert.notEqual(first.autosaveKey, second.autosaveKey);
    assert.equal(
      JSON.parse(fixture.window.localStorage.getItem(first.autosaveKey)).html,
      "first draft",
    );
    assert.equal(
      JSON.parse(fixture.window.localStorage.getItem(second.autosaveKey)).html,
      "second draft",
    );
    assert.ok(first.statusBar, "save state keeps status visible");
    assert.equal(first.saveStateEl.getAttribute("aria-live"), "polite");
    assert.equal(first.saveStateEl.textContent, "Draft saved");
    assert.equal(
      first.history.length,
      2,
      "saving does not create history entries",
    );
    disabled.destroy();
    first.destroy();
    second.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("structured autosave uses its adapter/key/debounce and stores source mode consistently", async () => {
  const fixture = installDom();
  try {
    const storage = memoryStorage();
    const editor = new FeatherText("#editor", {
      autosave: {
        enabled: true,
        key: "draft:structured",
        debounce: 10,
        storage,
        restore: false,
      },
    });
    editor.setHTML("<p>visual</p>").toggleSource();
    editor.source.value = "<p>source draft</p>";
    editor.source.dispatchEvent(
      new fixture.window.Event("input", { bubbles: true }),
    );
    assert.equal(editor.autosaveState, "pending");
    await wait(20);

    const saved = JSON.parse(storage.values.get("draft:structured"));
    assert.equal(saved.html, "<p>source draft</p>");
    assert.equal(saved.mode, "source");
    assert.equal(
      storage.calls.set,
      1,
      "rapid visual/source changes collapse into one debounced write",
    );
    editor.flushHistory();
    assert.equal(editor.history.length, 3);
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("restore option offers a local dialog and restores one coherent source transaction", async () => {
  const fixture = installDom('<textarea id="editor"><p>initial</p></textarea>');
  try {
    const storage = memoryStorage({
      "draft:restore": draft("<p>restored source</p>", "source"),
    });
    const editor = new FeatherText("#editor", {
      historyDebounceMs: 0,
      autosave: {
        enabled: true,
        key: "draft:restore",
        debounce: 50,
        storage,
        restore: true,
      },
    });

    const dialog = editor.dialogs.active?.dialog;
    assert.ok(dialog);
    assert.equal(dialog.querySelector("h2").textContent, "Restore saved draft");
    assert.equal(
      dialog.querySelector(".feather-dialog-description").textContent,
      "A saved local draft is available. Restore it?",
    );
    assert.deepEqual(
      [...dialog.querySelectorAll("button")].map(
        (button) => button.textContent,
      ),
      ["Not now", "Restore"],
    );
    dialog.querySelector(".feather-dialog-confirm").click();
    await wait(0);

    assert.equal(editor.dialogs.active, null);
    assert.equal(editor.isSource, true);
    assert.equal(editor.source.value, "<p>restored source</p>");
    assert.equal(editor.editor.innerHTML, "<p>restored source</p>");
    assert.equal(
      fixture.document.getElementById("editor").value,
      "<p>restored source</p>",
    );
    assert.equal(editor.history.length, 2);
    assert.equal(editor.autosaveState, "restored");
    assert.equal(fixture.document.activeElement, editor.source);
    assert.equal(storage.calls.set, 0, "restore does not write the draft back");
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("clearSavedDraft removes only the configured draft and remains chainable", () => {
  const fixture = installDom();
  try {
    const storage = memoryStorage({ untouched: "value" });
    const editor = new FeatherText("#editor", {
      autosave: { enabled: true, key: "draft:clear", debounce: 0, storage },
    });
    editor.setHTML("saved");
    assert.equal(storage.values.has("draft:clear"), true);
    assert.equal(editor.clearSavedDraft(), editor);
    assert.equal(storage.values.has("draft:clear"), false);
    assert.equal(storage.values.get("untouched"), "value");
    assert.equal(editor.autosaveState, "cleared");
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("storage quota/unavailable failures emit autosave errors without escaping", () => {
  const fixture = installDom();
  try {
    const quota = new Error("quota exceeded");
    const storage = {
      getItem() {
        return null;
      },
      setItem() {
        throw quota;
      },
      removeItem() {
        throw new Error("remove unavailable");
      },
    };
    const editor = new FeatherText("#editor", {
      autosave: { enabled: true, key: "draft:error", debounce: 0, storage },
      logErrors: false,
    });
    const errors = [];
    const reported = [];
    editor.on("autosaveerror", (detail) => errors.push(detail));
    editor.on("error", (detail) => reported.push(detail));
    assert.doesNotThrow(() => editor.setHTML("cannot save"));
    assert.equal(errors[0].operation, "save");
    assert.equal(errors[0].error, quota);
    assert.equal(reported[0].context, "autosave:save");
    assert.equal(reported[0].error, quota);
    assert.equal(editor.autosaveState, "error");
    assert.equal(editor.saveStateEl.textContent, "Draft unavailable");
    editor.setHTML("still cannot save");
    assert.equal(
      errors.length,
      1,
      "automatic retries do not flood error events",
    );
    assert.equal(reported.length, 1);
    assert.doesNotThrow(() => editor.clearSavedDraft());
    assert.equal(errors.at(-1).operation, "clear");
    editor.destroy();

    assert.doesNotThrow(() => {
      const unavailable = new FeatherText("#editor", {
        autosave: { enabled: true, storage: {} },
        logErrors: false,
      });
      assert.equal(unavailable.autosaveState, "error");
      unavailable.destroy();
    });
  } finally {
    fixture.cleanup();
  }
});

test("destroy cancels pending autosave work and performs no delayed write", async () => {
  const fixture = installDom();
  try {
    const storage = memoryStorage();
    const editor = new FeatherText("#editor", {
      autosave: { enabled: true, key: "draft:destroy", debounce: 25, storage },
    });
    editor.setHTML("pending");
    assert.equal(editor.autosaveState, "pending");
    editor.destroy();
    await wait(40);
    assert.equal(storage.calls.set, 0);
    assert.equal(storage.values.has("draft:destroy"), false);
  } finally {
    fixture.cleanup();
  }
});

test("stopAutosave cancels pending work and remains stopped until restarted", async () => {
  const fixture = installDom();
  try {
    const storage = memoryStorage();
    const editor = new FeatherText("#editor", {
      autosave: {
        enabled: true,
        key: "draft:stop",
        debounce: 15,
        storage,
      },
    });
    editor.setHTML("pending");
    editor.stopAutosave();
    editor.setHTML("changed while stopped");
    await wait(25);
    assert.equal(storage.calls.set, 0);
    assert.equal(editor.autosaveState, "disabled");

    editor.startAutosave();
    editor.setHTML("saving resumed");
    await wait(25);
    assert.equal(storage.calls.set, 1);
    assert.equal(
      JSON.parse(storage.values.get("draft:stop")).html,
      "saving resumed",
    );
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("clearing a draft cancels pending write-back until another edit", async () => {
  const fixture = installDom();
  try {
    const storage = memoryStorage({ "draft:pending-clear": draft("old") });
    const editor = new FeatherText("#editor", {
      autosave: {
        enabled: true,
        key: "draft:pending-clear",
        debounce: 15,
        storage,
      },
    });
    editor.setHTML("pending replacement");
    editor.clearSavedDraft();
    await wait(25);
    assert.equal(storage.calls.set, 0);
    assert.equal(storage.values.has("draft:pending-clear"), false);
    assert.equal(editor.autosaveState, "cleared");
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("autosave persists a source-mode-only change without adding history", () => {
  const fixture = installDom();
  try {
    const storage = memoryStorage();
    const editor = new FeatherText("#editor", {
      historyDebounceMs: 0,
      autosave: {
        enabled: true,
        key: "draft:mode",
        debounce: 0,
        storage,
      },
    });
    editor.setHTML("<p>same content</p>");
    const historyLength = editor.history.length;
    assert.equal(JSON.parse(storage.values.get("draft:mode")).mode, "editor");

    editor.toggleSource();
    const saved = JSON.parse(storage.values.get("draft:mode"));
    assert.equal(saved.html, "<p>same content</p>");
    assert.equal(saved.mode, "source");
    assert.equal(editor.source.value, editor.editor.innerHTML);
    assert.equal(editor.history.length, historyLength);
    assert.equal(storage.calls.set, 2);
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("destroy removes an active restore prompt and reconfiguration dismisses stale prompts", async () => {
  const fixture = installDom('<textarea id="editor">initial</textarea>');
  try {
    const storage = memoryStorage({
      "draft:prompt-cleanup": draft("restored"),
    });
    const editor = new FeatherText("#editor", {
      autosave: {
        enabled: true,
        key: "draft:prompt-cleanup",
        debounce: 20,
        storage,
        restore: true,
      },
    });
    const firstDialog = editor.dialogs.active?.dialog;
    assert.ok(firstDialog?.isConnected);

    editor.setConfig({ autosave: false });
    await wait(0);
    assert.equal(firstDialog.isConnected, false);
    assert.equal(editor.dialogs.active, null);
    assert.equal(editor.autosaveState, "disabled");

    editor.setConfig({
      autosave: {
        enabled: true,
        key: "draft:prompt-cleanup",
        debounce: 20,
        storage,
        restore: true,
      },
    });
    const secondDialog = editor.dialogs.active?.dialog;
    assert.ok(secondDialog?.isConnected);
    editor.destroy();
    await wait(0);
    assert.equal(secondDialog.isConnected, false);
    assert.equal(
      fixture.document.querySelector(".feather-dialog-backdrop"),
      null,
    );
  } finally {
    fixture.cleanup();
  }
});

test("startAutosave modernizes manual legacy startup without requiring setConfig", () => {
  const fixture = installDom();
  try {
    const storage = memoryStorage();
    const editor = new FeatherText("#editor", {
      wordCount: false,
      charCount: false,
      attribution: false,
    });
    assert.equal(
      editor.startAutosave({
        enabled: true,
        key: "draft:manual",
        debounce: 0,
        storage,
      }),
      editor,
    );
    editor.setHTML("manual");
    assert.equal(JSON.parse(storage.values.get("draft:manual")).html, "manual");
    assert.ok(editor.statusBar);
    editor.stopAutosave();
    assert.equal(editor.autosaveState, "disabled");
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});
