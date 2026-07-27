(() => {
  "use strict";

  const status = document.getElementById("api-status");
  const output = document.getElementById("api-output");
  const theme = document.getElementById("api-theme");
  let editor = null;

  const minimalToolbar = [
    "format",
    "bold",
    "italic",
    "|",
    "ul",
    "ol",
    "|",
    "undo",
    "redo",
    "source",
  ];
  const fullToolbar = [
    "format",
    "fontname",
    "fontsize",
    "|",
    "bold",
    "italic",
    "underline",
    "strikethrough",
    "|",
    "link",
    "unlink",
    "image",
    "video",
    "table",
    "|",
    "ul",
    "ol",
    "indent",
    "outdent",
    "|",
    "alignleft",
    "aligncenter",
    "alignright",
    "alignjustify",
    "|",
    "blockquote",
    "code",
    "clearformat",
    "hr",
    "|",
    "forecolor",
    "backcolor",
    "|",
    "undo",
    "redo",
    "|",
    "fullscreen",
    "source",
    "copy",
    "paste",
  ];

  function show(message) {
    if (status) status.textContent = message;
  }

  function updateOutput(html) {
    if (output) output.textContent = html;
  }

  function createEditor(html) {
    [editor] = window.FeatherText.init("#api-editor", {
      theme: theme ? theme.value : "dark-b",
      fancy: false,
      ariaLabel: "Runtime API rich text editor",
      sourceAriaLabel: "Runtime API HTML source editor",
      sanitizePaste: true,
      toolbar: minimalToolbar,
      onChange(nextHTML) {
        updateOutput(nextHTML);
      },
    });
    if (html !== undefined) editor.setHTML(html);
    updateOutput(editor.getHTML());
  }

  if (!window.FeatherText) {
    show(
      "Generated bundle unavailable. Run npm run build, then serve the repository.",
    );
    return;
  }

  createEditor();
  show(`Editor ready · ${window.FeatherText.version || "development build"}`);
  if (status) status.classList.add("is-ready");

  theme?.addEventListener("change", () => {
    editor.setTheme(theme.value);
    show(`Theme set to ${theme.value}.`);
  });

  document.getElementById("api-minimal")?.addEventListener("click", () => {
    editor.setToolbar(minimalToolbar);
    show("Minimal toolbar applied.");
  });

  document.getElementById("api-full")?.addEventListener("click", () => {
    editor.setToolbar(fullToolbar);
    show("Full toolbar applied.");
  });

  document.getElementById("api-content")?.addEventListener("click", () => {
    editor.setHTML(
      "<h2>Replaced through setHTML()</h2><p>The original textarea value is updated too.</p>",
    );
    updateOutput(editor.getHTML());
    show("HTML replaced.");
  });

  document.getElementById("api-source")?.addEventListener("click", () => {
    editor.pasteIntoSource(
      "<blockquote><strong>Inserted through pasteIntoSource()</strong></blockquote>",
    );
    updateOutput(editor.getHTML());
    show("Source inserted and visual content updated.");
  });

  document.getElementById("api-fancy")?.addEventListener("click", (event) => {
    const enabled = !editor.getConfig().fancy;
    editor.setFancy(enabled);
    event.currentTarget.textContent = enabled
      ? "Disable fancy effects"
      : "Enable fancy effects";
    show(`Fancy effects ${enabled ? "enabled" : "disabled"}.`);
  });

  document.getElementById("api-disable")?.addEventListener("click", () => {
    editor.disable();
    show("Visual editor disabled.");
  });

  document.getElementById("api-enable")?.addEventListener("click", () => {
    editor.enable();
    editor.focus();
    show("Visual editor enabled.");
  });

  document.getElementById("api-recreate")?.addEventListener("click", () => {
    const html = editor.getHTML();
    editor.destroy();
    createEditor(html);
    show("Instance destroyed and recreated with content restored explicitly.");
  });

  window.addEventListener("pagehide", () => editor?.destroy(), { once: true });
})();
