(() => {
  "use strict";

  const languageSelect = document.getElementById("localization-language");
  const status = document.getElementById("localization-status");
  const output = document.getElementById("localization-output");
  let editor = null;

  function show(message) {
    if (status) status.textContent = message;
  }

  function updateOutput() {
    if (!output || !editor) return;
    output.textContent = JSON.stringify(
      {
        language: editor.getConfig().language,
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

  editor = new window.FeatherText("#localization-editor", {
    language: languageSelect?.value || "en",
    theme: "dawn",
    fancy: false,
    minHeight: 240,
    toolbar: [
      "format",
      "bold",
      "italic",
      "underline",
      "|",
      "link",
      "blockquote",
      "|",
      "ul",
      "ol",
      "|",
      "undo",
      "redo",
      "source",
    ],
    onChange() {
      updateOutput();
    },
  });

  updateOutput();
  show(`Editor ready in ${editor.getConfig().language === "hu" ? "Hungarian" : "English"}.`);
  status?.classList.add("is-ready");

  languageSelect?.addEventListener("change", () => {
    editor.setLanguage(languageSelect.value);
    updateOutput();
    show(`Interface changed to ${languageSelect.value === "hu" ? "Hungarian" : "English"}.`);
  });

  window.addEventListener("pagehide", () => editor?.destroy(), { once: true });
})();
