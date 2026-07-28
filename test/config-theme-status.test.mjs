import test from "node:test";
import assert from "node:assert/strict";

import FeatherText from "../src/feathertext.js";
import { PROJECT_URL, SUPPORT_URL, themes } from "../src/config.js";
import { installDom, installMatchMedia } from "./helpers.mjs";

test("themes are isolated per wrapper and never mutate host documentElement state", () => {
  const fixture = installDom(
    '<textarea id="dark"></textarea><textarea id="light"></textarea>',
  );
  try {
    fixture.document.documentElement.style.setProperty(
      "--feather-bg",
      "host-value",
    );
    fixture.document.documentElement.setAttribute("data-theme", "host-theme");
    const dark = new FeatherText("#dark", { theme: "dark" });
    const light = new FeatherText("#light", { theme: "light" });

    assert.equal(dark.wrapper.dataset.theme, "dark");
    assert.equal(light.wrapper.dataset.theme, "light");
    assert.equal(
      dark.wrapper.style.getPropertyValue("--feather-bg"),
      "#0f1115",
    );
    assert.equal(
      light.wrapper.style.getPropertyValue("--feather-bg"),
      "#ffffff",
    );
    assert.equal(fixture.document.documentElement.dataset.theme, "host-theme");
    assert.equal(
      fixture.document.documentElement.style.getPropertyValue("--feather-bg"),
      "host-value",
    );
    dark.destroy();
    light.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("built-in themes expose complete tokens including the expanded palettes", () => {
  const expected = [
    "dark",
    "light",
    "ocean",
    "forest",
    "dark-b",
    "aurora",
    "dawn",
    "rose",
    "graphite",
    "canyon",
    "midnight",
    "solarized",
    "lavender",
    "mint",
    "ember",
    "high-contrast",
  ];
  const tokenKeys = [
    "bg",
    "panel",
    "border",
    "accent",
    "text",
    "muted",
    "hover",
    "shadow",
  ];

  assert.deepEqual(Object.keys(themes), expected);
  for (const [name, tokens] of Object.entries(themes)) {
    assert.deepEqual(Object.keys(tokens), tokenKeys, `${name} tokens changed`);
    for (const token of Object.values(tokens)) assert.ok(token.trim());
  }
});

test("auto theme responds to color-scheme and contrast while fixed instances stay fixed", () => {
  const fixture = installDom(
    '<textarea id="auto"></textarea><textarea id="fixed"></textarea>',
  );
  try {
    const queries = installMatchMedia(fixture.window, {
      "(prefers-color-scheme: dark)": false,
    });
    const automatic = new FeatherText("#auto", { theme: "auto" });
    const fixed = new FeatherText("#fixed", { theme: "ocean" });
    assert.equal(automatic.wrapper.dataset.theme, "light");
    assert.equal(fixed.wrapper.dataset.theme, "ocean");

    queries.get("(prefers-color-scheme: dark)").dispatch(true);
    assert.equal(automatic.wrapper.dataset.theme, "dark");
    assert.equal(fixed.wrapper.dataset.theme, "ocean");
    queries.get("(forced-colors: active)").dispatch(true);
    assert.equal(automatic.wrapper.dataset.theme, "high-contrast");
    automatic.destroy();
    fixed.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("custom and unknown themes use complete, predictable fallbacks", () => {
  const fixture = installDom(
    '<textarea id="custom"></textarea><textarea id="unknown"></textarea>',
  );
  try {
    const custom = new FeatherText("#custom", { theme: { bg: "#123456" } });
    const unknown = new FeatherText("#unknown", { theme: "not-a-theme" });
    assert.equal(custom.wrapper.dataset.theme, "custom");
    assert.equal(
      custom.wrapper.style.getPropertyValue("--feather-bg"),
      "#123456",
    );
    assert.equal(
      custom.wrapper.style.getPropertyValue("--feather-panel"),
      "#151922",
    );
    assert.equal(unknown.wrapper.dataset.theme, "dark");
    custom.destroy();
    unknown.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("setConfig applies focused diffs without rebuilding content-bearing surfaces", () => {
  const fixture = installDom();
  try {
    const editor = new FeatherText("#editor", {
      historyDebounceMs: 0,
      wordCount: true,
      charCount: true,
    });
    editor.setHTML("<p>before</p>").toggleSource().toggleFullscreen();
    editor.source.value = "<p>source edit</p>";
    editor.source.dispatchEvent(
      new fixture.window.Event("input", { bubbles: true }),
    );
    editor.source.focus();

    const wrapper = editor.wrapper;
    const surface = editor.editor;
    const source = editor.source;
    const history = [...editor.history];
    editor.setConfig({
      theme: "light",
      toolbar: ["bold", "|", "source"],
      placeholder: "Changed",
      wordCount: false,
      charCount: false,
      attribution: true,
      minHeight: 300,
      sourceRows: 18,
    });

    assert.equal(editor.wrapper, wrapper);
    assert.equal(editor.editor, surface);
    assert.equal(editor.source, source);
    assert.equal(editor.getHTML(), "<p>source edit</p>");
    assert.deepEqual(editor.history, history);
    assert.equal(editor.isSource, true);
    assert.equal(editor.isFullscreen, true);
    assert.equal(editor.wrapper.classList.contains("feather-fullscreen"), true);
    assert.equal(fixture.document.activeElement, editor.source);
    assert.equal(editor.wrapper.dataset.theme, "light");
    assert.equal(editor.editor.getAttribute("placeholder"), "Changed");
    assert.equal(editor.source.rows, 18);
    assert.ok(
      editor.statusBar,
      "attribution keeps status present when counters are disabled",
    );
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("focused mutators are chainable", () => {
  const fixture = installDom();
  try {
    const editor = new FeatherText("#editor", {
      wordCount: false,
      charCount: false,
    });
    assert.equal(editor.setHTML("x"), editor);
    assert.equal(editor.setTheme("dawn"), editor);
    assert.equal(editor.setToolbar(["bold"]), editor);
    assert.equal(editor.setPlaceholder("Write"), editor);
    assert.equal(editor.wrapper.classList.contains("feather-fancy"), false);
    assert.equal(editor.setHeight(320), editor);
    assert.equal(editor.setFancy(true), editor);
    assert.equal(editor.wrapper.classList.contains("feather-fancy"), true);
    assert.equal(editor.setConfig({ themeTransitions: true }), editor);
    assert.equal(
      editor.wrapper.classList.contains("feather-theme-transitions"),
      true,
    );
    assert.equal(editor.setReadOnly(true), editor);
    assert.equal(editor.setReadOnly(false), editor);
    assert.equal(editor.setDisabled(true), editor);
    assert.equal(editor.setDisabled(false), editor);
    assert.equal(editor.setAttribution(false), editor);
    assert.equal(editor.clear(), editor);
    assert.equal(editor.focus(), editor);
    assert.ok(editor.statusBar);
    assert.equal(editor.wordCountEl.textContent, "0");
    assert.equal(editor.charCountEl.textContent, "0");
    assert.ok(editor.statusBar.querySelector(".feather-attribution-project"));
    assert.ok(editor.statusBar.querySelector(".feather-attribution-support"));
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("status footer always exposes canonical counters and external links", () => {
  const fixture = installDom();
  try {
    const editor = new FeatherText("#editor", {
      wordCount: false,
      charCount: false,
      attribution: true,
      supportLink: true,
    });
    assert.ok(editor.statusBar);
    const project = editor.statusBar.querySelector(
      ".feather-attribution-project",
    );
    const support = editor.statusBar.querySelector(
      ".feather-attribution-support",
    );
    assert.equal(project.getAttribute("href"), PROJECT_URL);
    assert.equal(support.getAttribute("href"), SUPPORT_URL);
    assert.equal(SUPPORT_URL, "https://buymeacoffee.com/devpeter");
    assert.equal(project.getAttribute("aria-label"), "FeatherText on GitHub");
    assert.equal(project.title, "FeatherText on GitHub");
    assert.equal(
      support.getAttribute("aria-label"),
      "Support FeatherText on Buy Me a Coffee",
    );
    assert.equal(support.title, "Support FeatherText on Buy Me a Coffee");
    for (const link of [project, support]) {
      assert.equal(link.target, "_blank");
      assert.equal(link.rel, "noopener noreferrer");
      assert.ok(link.querySelector("svg"));
    }
    assert.equal(
      project.querySelector("svg").getAttribute("fill"),
      "currentColor",
    );
    assert.equal(
      support.querySelector("svg").getAttribute("stroke"),
      "currentColor",
    );
    assert.equal(
      editor.statusBar.querySelector("img"),
      null,
      "attribution has no remote image assets",
    );

    editor.setConfig({
      attribution: false,
      charCount: false,
      projectUrl: "https://example.com/project",
      supportLink: false,
      supportUrl: "https://example.com/support",
      wordCount: false,
    });
    assert.ok(editor.statusBar);
    assert.ok(editor.wordCountEl);
    assert.ok(editor.charCountEl);
    assert.equal(
      editor.statusBar.querySelector(".feather-attribution-project").href,
      PROJECT_URL,
    );
    assert.equal(
      editor.statusBar.querySelector(".feather-attribution-support").href,
      SUPPORT_URL,
    );
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("custom attribution URLs are ignored in favor of canonical links", () => {
  const fixture = installDom();
  try {
    const editor = new FeatherText("#editor", {
      wordCount: false,
      charCount: false,
      attribution: true,
      projectUrl: "javascript:alert(1)",
      supportUrl: "data:text/html,bad",
    });
    assert.ok(editor.statusBar);
    assert.equal(
      editor.statusBar.querySelector(".feather-attribution-project").href,
      PROJECT_URL,
    );
    assert.equal(
      editor.statusBar.querySelector(".feather-attribution-support").href,
      SUPPORT_URL,
    );
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});
