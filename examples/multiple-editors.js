(() => {
  "use strict";

  const status = document.getElementById("multiple-status");
  const firstTheme = document.getElementById("first-theme");
  const secondTheme = document.getElementById("second-theme");
  const secondLanguage = document.getElementById("second-language");
  let firstEditor = null;
  let secondEditor = null;

  function show(message) {
    if (status) status.textContent = message;
  }

  if (!window.FeatherText) {
    show("Generated bundle unavailable. Run npm run build, then serve the repository.");
    return;
  }

  const toolbar = [
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
  ];

  firstEditor = new window.FeatherText("#first-editor", {
    theme: firstTheme?.value || "ocean",
    language: "en",
    fancy: false,
    minHeight: 220,
    toolbar,
  });

  secondEditor = new window.FeatherText("#second-editor", {
    theme: secondTheme?.value || "dawn",
    language: secondLanguage?.value || "hu",
    fancy: false,
    minHeight: 220,
    toolbar,
  });

  show("Two independent editor instances are ready.");
  status?.classList.add("is-ready");

  firstTheme?.addEventListener("change", () => {
    firstEditor.setTheme(firstTheme.value);
    show(`First editor theme: ${firstTheme.value}.`);
  });

  secondTheme?.addEventListener("change", () => {
    secondEditor.setTheme(secondTheme.value);
    show(`Second editor theme: ${secondTheme.value}.`);
  });

  secondLanguage?.addEventListener("change", () => {
    secondEditor.setLanguage(secondLanguage.value);
    show(
      `Second editor language: ${secondLanguage.value === "hu" ? "Hungarian" : "English"}.`,
    );
  });

  window.addEventListener(
    "pagehide",
    () => {
      firstEditor?.destroy();
      secondEditor?.destroy();
    },
    { once: true },
  );
})();
