(() => {
  "use strict";

  const status = document.getElementById("example-status");

  if (!window.FeatherText) {
    if (status)
      status.textContent =
        "Generated bundle unavailable. Run npm run build, then serve the repository.";
    return;
  }

  const [editor] = window.FeatherText.init("#article-body", {
    theme: "auto",
    fancy: false,
    ariaLabel: "Article body rich text editor",
    sourceAriaLabel: "Article body HTML source editor",
    sanitizePaste: true,
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
  });

  if (status) {
    status.textContent = `Editor ready · ${window.FeatherText.version || "development build"}`;
    status.classList.add("is-ready");
  }

  window.addEventListener("pagehide", () => editor.destroy(), { once: true });
})();
