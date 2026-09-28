(() => {
  "use strict";

  const status = document.getElementById("upload-status");
  const demo = document.getElementById("upload-demo");
  if (!window.FeatherText) {
    status.textContent =
      "Generated bundle unavailable. Run npm run build, then serve the repository.";
    return;
  }

  const [editor] = window.FeatherText.init("#upload-editor", {
    theme: "auto",
    ariaLabel: "Image example editor",
    toolbar: ["format", "bold", "link", "image", "|", "undo", "redo", "source"],
    async imageUpload(file) {
      status.textContent = `Preparing ${file.name}…`;
      await new Promise((resolve) => window.setTimeout(resolve, 250));
      return {
        url: demo.dataset.sampleSrc,
        alt: `Sample preview for ${file.name}`,
      };
    },
  });

  editor.on("imageupload", ({ file }) => {
    status.textContent = `${file.name} selected. The demo inserted a sample image; no file was uploaded.`;
  });
  status.textContent = "Editor ready. Choose Insert Image, paste, or drop an image.";
  status.classList.add("is-ready");

  window.addEventListener("pagehide", () => editor.destroy(), { once: true });
})();
