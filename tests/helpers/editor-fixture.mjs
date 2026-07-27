const BUILT_STYLESHEET = "/dist/feathertext.css";
const BUILT_SCRIPT = "/dist/feathertext.min.js";

function escapeAttribute(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function fixtureDocument({ body, dir, lang, title }) {
  return `<!doctype html>
<html lang="${escapeAttribute(lang)}" dir="${escapeAttribute(dir)}">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>${escapeAttribute(title)}</title>
    <link rel="stylesheet" href="${BUILT_STYLESHEET}">
    <style>
      html, body { margin: 0; min-width: 0; }
      body { padding: 16px; font-family: system-ui, sans-serif; }
      main, section { min-width: 0; }
    </style>
  </head>
  <body>
    ${body}
    <script>delete globalThis.FeatherText;</script>
    <script src="${BUILT_SCRIPT}"></script>
  </body>
</html>`;
}

export async function loadBuiltFixture(
  page,
  {
    body = '<main><textarea id="editor"></textarea></main>',
    dir = "ltr",
    lang = "en",
    title = "FeatherText Playwright fixture",
  } = {},
) {
  // Establish the configured server origin and wait for its generated build once
  // before replacing the document with an isolated host fixture.
  await page.goto("/", { waitUntil: "load" });
  await page.waitForFunction(() => typeof globalThis.FeatherText === "function");
  await page.setContent(fixtureDocument({ body, dir, lang, title }), {
    waitUntil: "load",
  });
  await page.waitForFunction(() => typeof globalThis.FeatherText === "function");
  await page.waitForFunction(
    (stylesheet) =>
      [...document.styleSheets].some(
        (sheet) => new URL(sheet.href || "", document.baseURI).pathname === stylesheet,
      ),
    BUILT_STYLESHEET,
  );
}

export async function initializeEditors(page, selector, config = {}) {
  return page.evaluate(
    ({ config: editorConfig, selector: editorSelector }) => {
      const editors = globalThis.FeatherText.init(editorSelector, editorConfig);
      globalThis.__featherTextTest = { editors };
      return editors.length;
    },
    { config, selector },
  );
}

export function editorWrapper(page, index = 0) {
  return page.locator(".feather").nth(index);
}
