(() => {
  "use strict";

  if (window.__featherTextSiteLoaded) return;
  window.__featherTextSiteLoaded = true;

  const PACKAGE_NAME = "@misztersoul/feathertext";
  const PACKAGE_URL = "https://www.npmjs.com/package/@misztersoul/feathertext";
  const initialDemoHTML =
    "<h2>A focused editing surface</h2><p>Select text, try the toolbar, or open <strong>source mode</strong>.</p><blockquote>Current capabilities are labelled separately from roadmap work.</blockquote>";
  const copyStatus = document.getElementById("copy-status");
  const demoState = document.getElementById("demo-state");
  const demoOutput = document.getElementById("demo-html-output");
  const themeSelect = document.getElementById("demo-theme");
  const fancyButton = document.getElementById("demo-fancy");
  const resetButton = document.getElementById("demo-reset");
  const installCommand = document.getElementById("install-command");
  const installBlock = document.querySelector(".install-block");
  const footerVersion = document.querySelector(
    ".site-footer .footer-bottom span:first-child",
  );
  const proofNote = document.querySelector(".proof-note");
  let demoEditor = null;

  function setCopyStatus(message) {
    if (!copyStatus) return;
    copyStatus.textContent = message;
    window.setTimeout(() => {
      if (copyStatus.textContent === message) copyStatus.textContent = "";
    }, 2400);
  }

  function selectAndCopy(element) {
    const selection = window.getSelection();
    if (!selection) return false;
    const range = document.createRange();
    range.selectNodeContents(element);
    selection.removeAllRanges();
    selection.addRange(range);
    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }
    selection.removeAllRanges();
    return copied;
  }

  document.querySelectorAll("[data-copy-target]").forEach((button) => {
    button.addEventListener("click", async () => {
      const target = document.getElementById(button.dataset.copyTarget || "");
      if (!target) return;
      const text = target.textContent || "";
      try {
        if (!navigator.clipboard || !navigator.clipboard.writeText)
          throw new Error("Clipboard API unavailable");
        await navigator.clipboard.writeText(text);
        setCopyStatus("Install command copied.");
      } catch {
        setCopyStatus(
          selectAndCopy(target)
            ? "Install command copied."
            : "Select and copy the command manually.",
        );
      }
    });
  });

  function sourcePreview(html) {
    if (demoOutput) demoOutput.textContent = html;
  }

  function usesRepositorySitePath() {
    const parts = window.location.pathname.split("/").filter(Boolean);
    const last = parts.at(-1) || "";
    const previous = parts.at(-2) || "";
    return last === "site" || (last === "index.html" && previous === "site");
  }

  function updateReleasePresentation(version) {
    const stableVersion =
      version && version !== "0.0.0-dev" ? String(version) : "";

    if (installCommand) {
      installCommand.textContent = `npm install ${PACKAGE_NAME}`;
    }

    const installLabel = installBlock?.querySelector(
      ".install-label span:last-child",
    );
    if (installLabel) installLabel.textContent = "available on npm";

    const installMicrocopy = installBlock?.querySelector(".microcopy");
    if (installMicrocopy) {
      const npmLink = document.createElement("a");
      npmLink.href = PACKAGE_URL;
      npmLink.rel = "noreferrer";
      npmLink.textContent = stableVersion
        ? `${PACKAGE_NAME}@${stableVersion}`
        : PACKAGE_NAME;
      installMicrocopy.replaceChildren("Published as ", npmLink, ".");
    }

    document
      .querySelectorAll(
        'a[href="https://www.npmjs.com/package/feathertext"], a[href="https://www.npmjs.com/package/@misztersoul/feathertext"]',
      )
      .forEach((link) => {
        link.href = PACKAGE_URL;
        if (link.textContent?.trim() === "npm status") link.textContent = "npm";
      });

    const examplesLink = Array.from(
      document.querySelectorAll(".site-nav a"),
    ).find((link) => link.textContent?.trim() === "Examples");
    if (examplesLink) {
      examplesLink.href = usesRepositorySitePath()
        ? "../examples/index.html"
        : "./examples/index.html";
    }

    if (footerVersion) {
      footerVersion.textContent = stableVersion
        ? `FeatherText · v${stableVersion}`
        : "FeatherText · current build";
    }

    const proofValues = document.querySelectorAll(".proof-grid strong");
    const currentValues = ["0", "74", "90", "12"];
    proofValues.forEach((element, index) => {
      if (currentValues[index]) element.textContent = currentValues[index];
    });

    if (proofNote) {
      proofNote.textContent = stableVersion
        ? `Repository and browser evidence for the v${stableVersion} Pages build; exact test scope is documented separately.`
        : "Repository and browser evidence for the current Pages build; exact test scope is documented separately.";
    }
  }

  function loadStylesheet(url) {
    return new Promise((resolve, reject) => {
      const existing = Array.from(document.styleSheets).find(
        (sheet) => sheet.href === url.href,
      );
      if (existing) {
        resolve();
        return;
      }
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = url.href;
      link.addEventListener("load", resolve, { once: true });
      link.addEventListener(
        "error",
        () => reject(new Error(`Unable to load ${url.href}`)),
        { once: true },
      );
      document.head.appendChild(link);
    });
  }

  function loadScript(url) {
    if (window.FeatherText) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = url.href;
      script.addEventListener("load", resolve, { once: true });
      script.addEventListener(
        "error",
        () => reject(new Error(`Unable to load ${url.href}`)),
        { once: true },
      );
      document.head.appendChild(script);
    });
  }

  function initializeDemo() {
    if (!window.FeatherText)
      throw new Error(
        "FeatherText global was not created by the generated bundle.",
      );

    [demoEditor] = window.FeatherText.init("#demo-editor", {
      theme: themeSelect ? themeSelect.value : "dark",
      fancy: false,
      ariaLabel: "FeatherText live demo editor",
      sourceAriaLabel: "FeatherText live demo source editor",
      sanitizePaste: true,
      minHeight: 250,
      maxHeight: 420,
      toolbar: [
        "format",
        "bold",
        "italic",
        "underline",
        "|",
        "link",
        "blockquote",
        "code",
        "|",
        "ul",
        "ol",
        "|",
        "undo",
        "redo",
        "|",
        "source",
      ],
      onChange(html) {
        sourcePreview(html);
      },
    });

    sourcePreview(demoEditor.getHTML());
    const rawVersion = window.FeatherText.version || "";
    updateReleasePresentation(rawVersion);
    if (demoState) {
      const version =
        rawVersion && rawVersion !== "0.0.0-dev"
          ? `v${rawVersion}`
          : "development build";
      demoState.textContent = `Live editor ready · ${version}`;
      demoState.classList.add("is-ready");
    }

    if (themeSelect) {
      themeSelect.addEventListener("change", () =>
        demoEditor.setTheme(themeSelect.value),
      );
    }

    if (fancyButton) {
      fancyButton.addEventListener("click", () => {
        const enabled = !demoEditor.getConfig().fancy;
        demoEditor.setFancy(enabled);
        fancyButton.textContent = enabled
          ? "Disable fancy effects"
          : "Enable fancy effects";
      });
    }

    if (resetButton) {
      resetButton.addEventListener("click", () => {
        demoEditor.setHTML(initialDemoHTML);
        sourcePreview(demoEditor.getHTML());
        demoEditor.focus();
      });
    }
  }

  updateReleasePresentation("");

  const distBase = usesRepositorySitePath() ? "../dist/" : "./dist/";
  const styleURL = new URL(`${distBase}feathertext.css`, window.location.href);
  const scriptURL = new URL(
    `${distBase}feathertext.min.js`,
    window.location.href,
  );

  Promise.all([loadStylesheet(styleURL), loadScript(scriptURL)])
    .then(initializeDemo)
    .catch((error) => {
      if (demoState) {
        demoState.textContent =
          "Demo unavailable: build the generated dist assets and serve the site over HTTP.";
        demoState.classList.add("is-error");
      }
      console.error("[FeatherText site]", error);
    });
})();
