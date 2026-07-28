(() => {
  "use strict";

  const status = document.getElementById("autosave-status");
  const output = document.getElementById("autosave-output");
  const clearButton = document.getElementById("autosave-clear");
  const reloadButton = document.getElementById("autosave-reload");
  let editor = null;

  function show(message) {
    if (status) status.textContent = message;
  }

  function updateOutput() {
    if (!output || !editor) return;
    output.textContent = JSON.stringify(
      {
        key: editor.autosaveKey,
        state: editor.autosaveState,
        html: editor.getHTML(),
      },
      null,
      2,
    );
  }

  if (!window.FeatherText) {
    show("Generated bundle unavailable. Run npm run build, then serve the repository.");
    return;
  }

  editor = new window.FeatherText("#autosave-editor", {
    theme: "forest",
    fancy: false,
    minHeight: 250,
    toolbar: [
      "format",
      "bold",
      "italic",
      "link",
      "|",
      "ul",
      "ol",
      "|",
      "undo",
      "redo",
      "source",
    ],
    autosave: {
      enabled: true,
      key: "feathertext:examples:autosave",
      debounce: 750,
      restore: true,
    },
    onChange() {
      updateOutput();
    },
  });

  updateOutput();
  show("Autosave is active. Edit the document, wait briefly, then reload the page.");
  status?.classList.add("is-ready");

  clearButton?.addEventListener("click", () => {
    editor.clearSavedDraft();
    updateOutput();
    show("Saved draft cleared from this browser.");
  });

  reloadButton?.addEventListener("click", () => window.location.reload());

  window.addEventListener("pagehide", () => editor?.destroy(), { once: true });
})();
