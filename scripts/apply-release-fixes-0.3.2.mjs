import fs from "node:fs";

const VERSION = "0.3.2";
const PACKAGE = "@misztersoul/feathertext";

function read(path) {
  return fs.readFileSync(path, "utf8");
}

function write(path, content) {
  fs.mkdirSync(path.split("/").slice(0, -1).join("/") || ".", { recursive: true });
  fs.writeFileSync(path, content.endsWith("\n") ? content : `${content}\n`, "utf8");
}

function replaceOnce(path, from, to) {
  const source = read(path);
  if (!source.includes(from)) {
    throw new Error(`Expected text was not found in ${path}: ${from.slice(0, 120)}`);
  }
  write(path, source.replace(from, to));
}

function replaceRegex(path, pattern, replacement) {
  const source = read(path);
  pattern.lastIndex = 0;
  if (!pattern.test(source)) {
    throw new Error(`Expected pattern was not found in ${path}: ${pattern}`);
  }
  pattern.lastIndex = 0;
  write(path, source.replace(pattern, replacement));
}

const pkg = JSON.parse(read("package.json"));
pkg.name = PACKAGE;
pkg.version = VERSION;
pkg.publishConfig = {
  access: "public",
  provenance: true,
  registry: "https://registry.npmjs.org/",
};
write("package.json", `${JSON.stringify(pkg, null, 2)}\n`);

const lock = JSON.parse(read("package-lock.json"));
lock.name = PACKAGE;
lock.version = VERSION;
lock.packages[""].name = PACKAGE;
lock.packages[""].version = VERSION;
write("package-lock.json", `${JSON.stringify(lock, null, 2)}\n`);
write(".release-please-manifest.json", `${JSON.stringify({ ".": VERSION }, null, 2)}\n`);

write(
  "README.md",
  `# FeatherText

A lightweight, dependency-free rich-text editor for browser applications.

[Live demo](https://misztersoul.github.io/FeatherText/) · [Documentation](docs/index.md) · [GitHub](https://github.com/MiszterSoul/FeatherText) · [Buy Me a Coffee](https://buymeacoffee.com/devpeter) · [Security](SECURITY.md) · [MIT license](LICENSE)

Current release: \`${VERSION}\`. <!-- x-release-please-version -->

## Install

\`\`\`bash
npm install ${PACKAGE}
\`\`\`

\`\`\`js
import FeatherText from "${PACKAGE}";
import "${PACKAGE}/css";

const editor = new FeatherText("#editor", {
  theme: "auto",
  language: "en",
  toolbar: ["bold", "italic", "link", "undo", "redo", "source"],
});
\`\`\`

Hungarian interface:

\`\`\`js
const editor = new FeatherText("#editor", {
  language: "hu",
});
\`\`\`

The language can also be changed at runtime:

\`\`\`js
editor.setLanguage("hu");
editor.setLanguage("en");
\`\`\`

Browser bundle:

\`\`\`html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/${PACKAGE}@${VERSION}/dist/feathertext.min.css"> <!-- x-release-please-version -->
<script src="https://cdn.jsdelivr.net/npm/${PACKAGE}@${VERSION}/dist/feathertext.min.js"></script> <!-- x-release-please-version -->
<script>
  const editor = new FeatherText("#editor", { language: "hu", theme: "auto" });
</script>
\`\`\`

## Permanent footer

The footer is always rendered and cannot be hidden or redirected through configuration. It contains:

- word count;
- character count;
- a GitHub icon linking to the canonical repository;
- a Buy Me a Coffee icon linking to the canonical support page.

The two links are icon-only. Their accessible names and hover tooltips provide the text labels.

## Core API

\`\`\`js
editor.getHTML();
editor.getText();
editor.setHTML(trustedHtml);
editor.setUntrustedHTML(untrustedHtml);
editor.setTheme("dark");
editor.setLanguage("hu");
editor.setReadOnly(true);
editor.setDisabled(true);
editor.destroy();
\`\`\`

\`setHTML()\`, initial textarea content, and source mode are trusted-author APIs. Use \`setUntrustedHTML()\` for external HTML and still apply server-side validation, output encoding, and an appropriate Content Security Policy.

## Configuration highlights

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| \`language\` | \`"en" \\| "hu"\` | \`"en"\` | Interface language |
| \`theme\` | built-in name, \`"auto"\`, or token object | \`"dark"\` | Visual theme |
| \`toolbar\` | \`string[]\` | full toolbar | Toolbar controls |
| \`autosave\` | boolean, number, or options object | \`false\` | Local draft autosave |
| \`readOnly\` | boolean | \`false\` | Prevent mutations while allowing selection and copy |
| \`disabled\` | boolean | \`false\` | Disable editor interaction |

The legacy footer-related options remain accepted for compatibility but cannot disable or redirect the permanent footer.

## Documentation

- [API reference](docs/api.md)
- [Localization](docs/localization.md)
- [Security model](docs/security.md)
- [Browser support](docs/browser-support.md)
- [Release process](docs/releasing.md)

## Development

\`\`\`bash
npm ci
npm run check
\`\`\`

## Support

- Bugs and feature requests: https://github.com/MiszterSoul/FeatherText/issues
- Security reports: https://github.com/MiszterSoul/FeatherText/security/advisories/new
- Project support: https://buymeacoffee.com/devpeter
`,
);

const changelog = read("CHANGELOG.md");
const historyStart = changelog.indexOf("## [0.3.1]");
if (historyStart < 0) throw new Error("Could not find the 0.3.1 changelog section.");
let history = changelog.slice(historyStart);
history = history.replace(/\n## \[Unreleased\][\s\S]*?(?=\n## \[0\.2\.0\])/, "\n");
write(
  "CHANGELOG.md",
  `# Changelog

All notable changes are documented here. Versions follow Semantic Versioning.

## [0.3.2](https://github.com/MiszterSoul/FeatherText/compare/v0.3.1...v0.3.2) - 2026-07-28

### Added

- Hungarian interface language selectable with \`language: "hu"\` and \`setLanguage("hu")\`.
- English and Hungarian labels for toolbar controls, source controls, dialogs, find/replace, autosave state, counters, and footer links.

### Fixed

- Prevented tooltip mouseout handling from dereferencing a null target.
- Changed footer attribution links to icon-only controls with accessible labels and hover tooltips.
- Restored the correct patch-version sequence after \`0.3.1\`.
- Kept README release references synchronized through Release Please markers.

### Security

- Retained the conservative untrusted-HTML path and the previously applied CodeQL remediations.

${history}`,
);

write(
  "src/i18n.js",
  `const en = Object.freeze({
  "editor.placeholder": "Start typing...",
  "editor.ariaLabel": "Rich text editor",
  "editor.sourceAriaLabel": "HTML source editor",
  "toolbar.label": "Formatting options",
  "toolbar.bold": "Bold (Ctrl+B)",
  "toolbar.italic": "Italic (Ctrl+I)",
  "toolbar.underline": "Underline (Ctrl+U)",
  "toolbar.strikethrough": "Strikethrough",
  "toolbar.link": "Insert Link (Ctrl+K)",
  "toolbar.unlink": "Remove Link",
  "toolbar.image": "Insert Image",
  "toolbar.video": "Insert Video",
  "toolbar.table": "Insert Table",
  "toolbar.ul": "Bullet List",
  "toolbar.ol": "Numbered List",
  "toolbar.indent": "Increase Indent",
  "toolbar.outdent": "Decrease Indent",
  "toolbar.alignleft": "Align Left",
  "toolbar.aligncenter": "Align Center",
  "toolbar.alignright": "Align Right",
  "toolbar.alignjustify": "Justify",
  "toolbar.blockquote": "Blockquote",
  "toolbar.code": "Code",
  "toolbar.hr": "Horizontal Line",
  "toolbar.undo": "Undo (Ctrl+Z)",
  "toolbar.redo": "Redo (Ctrl+Y)",
  "toolbar.fullscreen": "Fullscreen",
  "toolbar.source": "View Source",
  "toolbar.copy": "Copy",
  "toolbar.paste": "Paste",
  "toolbar.clearformat": "Clear Formatting",
  "source.label": "Source mode tools",
  "source.syntaxMode": "Source syntax mode",
  "source.chooseSyntax": "Choose source syntax",
  "source.wrapLines": "Wrap lines",
  "source.smartTabs": "Smart tabs",
  "source.autoCloseTags": "Auto close tags",
  "format.paragraphFormat": "Paragraph format",
  "format.paragraph": "Paragraph",
  "format.heading": "Heading {level}",
  "format.fontFamily": "Font family",
  "format.fontSize": "Font size",
  "format.textColor": "Text color",
  "format.backgroundColor": "Background color",
  "format.clearColor": "Clear color",
  "format.clearTextColor": "Clear text color",
  "format.clearBackgroundColor": "Clear background color",
  "common.cancel": "Cancel",
  "common.insert": "Insert",
  "common.update": "Update",
  "common.close": "Close",
  "common.invalidValues": "Please check the entered values.",
  "link.insertTitle": "Insert link",
  "link.editTitle": "Edit link",
  "link.url": "Link URL",
  "link.text": "Link text",
  "link.safeError": "Enter a safe HTTP(S), mail, telephone, or relative URL.",
  "image.insertTitle": "Insert image",
  "image.url": "Image URL",
  "image.alt": "Alternative text",
  "image.upload": "Upload image",
  "image.uploadDescription": "Choose a local image or enter a URL above.",
  "image.safeError": "Enter a safe HTTP(S) or relative image URL.",
  "image.uploadMissing": "No imageUpload hook is configured.",
  "image.uploadUnsafe": "The imageUpload hook returned an unsafe or empty URL.",
  "video.insertTitle": "Insert video",
  "video.url": "YouTube or Vimeo URL",
  "video.safeError": "Enter a valid YouTube or Vimeo video URL.",
  "table.insertTitle": "Insert table",
  "table.rows": "Rows",
  "table.columns": "Columns",
  "table.dimensionError": "Table dimensions must be between 1×1 and {rows}×{columns}.",
  "find.title": "Find and replace",
  "find.find": "Find",
  "find.replaceWith": "Replace with",
  "find.matchCase": "Match case",
  "find.wholeWord": "Whole word",
  "find.previous": "Previous",
  "find.next": "Next",
  "find.replace": "Replace",
  "find.replaceAll": "Replace all",
  "status.words": "words",
  "status.characters": "chars",
  "status.github": "FeatherText on GitHub",
  "status.support": "Support FeatherText on Buy Me a Coffee",
  "autosave.storageUnavailable": "Autosave storage is unavailable.",
  "autosave.off": "Draft autosave off",
  "autosave.on": "Draft autosave on",
  "autosave.pending": "Draft not saved",
  "autosave.saved": "Draft saved",
  "autosave.saving": "Saving draft…",
  "autosave.available": "Saved draft available",
  "autosave.restored": "Draft restored",
  "autosave.cleared": "Saved draft cleared",
  "autosave.unavailable": "Draft unavailable",
  "autosave.restoreTitle": "Restore saved draft",
  "autosave.restoreDescription": "A saved local draft is available. Restore it?",
  "autosave.restore": "Restore",
  "autosave.notNow": "Not now"
});

const hu = Object.freeze({
  "editor.placeholder": "Kezdj el írni...",
  "editor.ariaLabel": "Formázott szövegszerkesztő",
  "editor.sourceAriaLabel": "HTML-forrás szerkesztő",
  "toolbar.label": "Formázási lehetőségek",
  "toolbar.bold": "Félkövér (Ctrl+B)",
  "toolbar.italic": "Dőlt (Ctrl+I)",
  "toolbar.underline": "Aláhúzott (Ctrl+U)",
  "toolbar.strikethrough": "Áthúzott",
  "toolbar.link": "Hivatkozás beszúrása (Ctrl+K)",
  "toolbar.unlink": "Hivatkozás eltávolítása",
  "toolbar.image": "Kép beszúrása",
  "toolbar.video": "Videó beszúrása",
  "toolbar.table": "Táblázat beszúrása",
  "toolbar.ul": "Felsorolás",
  "toolbar.ol": "Számozott lista",
  "toolbar.indent": "Behúzás növelése",
  "toolbar.outdent": "Behúzás csökkentése",
  "toolbar.alignleft": "Balra igazítás",
  "toolbar.aligncenter": "Középre igazítás",
  "toolbar.alignright": "Jobbra igazítás",
  "toolbar.alignjustify": "Sorkizárt igazítás",
  "toolbar.blockquote": "Idézetblokk",
  "toolbar.code": "Kód",
  "toolbar.hr": "Vízszintes vonal",
  "toolbar.undo": "Visszavonás (Ctrl+Z)",
  "toolbar.redo": "Újra (Ctrl+Y)",
  "toolbar.fullscreen": "Teljes képernyő",
  "toolbar.source": "Forráskód nézet",
  "toolbar.copy": "Másolás",
  "toolbar.paste": "Beillesztés",
  "toolbar.clearformat": "Formázás törlése",
  "source.label": "Forráskód mód eszközei",
  "source.syntaxMode": "Forráskód szintaxisa",
  "source.chooseSyntax": "Forráskód szintaxisának kiválasztása",
  "source.wrapLines": "Sorok tördelése",
  "source.smartTabs": "Intelligens tabulátor",
  "source.autoCloseTags": "Címkék automatikus lezárása",
  "format.paragraphFormat": "Bekezdés formátuma",
  "format.paragraph": "Bekezdés",
  "format.heading": "{level}. szintű címsor",
  "format.fontFamily": "Betűcsalád",
  "format.fontSize": "Betűméret",
  "format.textColor": "Szövegszín",
  "format.backgroundColor": "Háttérszín",
  "format.clearColor": "Szín törlése",
  "format.clearTextColor": "Szövegszín törlése",
  "format.clearBackgroundColor": "Háttérszín törlése",
  "common.cancel": "Mégse",
  "common.insert": "Beszúrás",
  "common.update": "Frissítés",
  "common.close": "Bezárás",
  "common.invalidValues": "Ellenőrizd a megadott értékeket.",
  "link.insertTitle": "Hivatkozás beszúrása",
  "link.editTitle": "Hivatkozás szerkesztése",
  "link.url": "Hivatkozás URL-je",
  "link.text": "Hivatkozás szövege",
  "link.safeError": "Adj meg biztonságos HTTP(S), e-mail-, telefon- vagy relatív URL-t.",
  "image.insertTitle": "Kép beszúrása",
  "image.url": "Kép URL-je",
  "image.alt": "Helyettesítő szöveg",
  "image.upload": "Kép feltöltése",
  "image.uploadDescription": "Válassz helyi képet, vagy adj meg URL-t fent.",
  "image.safeError": "Adj meg biztonságos HTTP(S) vagy relatív kép-URL-t.",
  "image.uploadMissing": "Nincs beállítva imageUpload kezelő.",
  "image.uploadUnsafe": "Az imageUpload kezelő nem biztonságos vagy üres URL-t adott vissza.",
  "video.insertTitle": "Videó beszúrása",
  "video.url": "YouTube- vagy Vimeo-URL",
  "video.safeError": "Adj meg érvényes YouTube- vagy Vimeo-URL-t.",
  "table.insertTitle": "Táblázat beszúrása",
  "table.rows": "Sorok",
  "table.columns": "Oszlopok",
  "table.dimensionError": "A táblázat mérete 1×1 és {rows}×{columns} között lehet.",
  "find.title": "Keresés és csere",
  "find.find": "Keresés",
  "find.replaceWith": "Csere erre",
  "find.matchCase": "Kis- és nagybetű érzékeny",
  "find.wholeWord": "Csak teljes szó",
  "find.previous": "Előző",
  "find.next": "Következő",
  "find.replace": "Csere",
  "find.replaceAll": "Összes cseréje",
  "status.words": "szó",
  "status.characters": "karakter",
  "status.github": "FeatherText a GitHubon",
  "status.support": "FeatherText támogatása a Buy Me a Coffee oldalon",
  "autosave.storageUnavailable": "Az automatikus mentés tárhelye nem érhető el.",
  "autosave.off": "Piszkozat automatikus mentése kikapcsolva",
  "autosave.on": "Piszkozat automatikus mentése bekapcsolva",
  "autosave.pending": "A piszkozat nincs elmentve",
  "autosave.saved": "Piszkozat elmentve",
  "autosave.saving": "Piszkozat mentése…",
  "autosave.available": "Mentett piszkozat érhető el",
  "autosave.restored": "Piszkozat visszaállítva",
  "autosave.cleared": "Mentett piszkozat törölve",
  "autosave.unavailable": "A piszkozat nem érhető el",
  "autosave.restoreTitle": "Mentett piszkozat visszaállítása",
  "autosave.restoreDescription": "Helyi mentett piszkozat érhető el. Visszaállítod?",
  "autosave.restore": "Visszaállítás",
  "autosave.notNow": "Most nem"
});

export const translations = Object.freeze({ en, hu });

export function normalizeLanguage(value) {
  return String(value || "en").trim().toLowerCase().startsWith("hu") ? "hu" : "en";
}

export function translate(language, key, params = {}, fallback = key) {
  const code = normalizeLanguage(language);
  let value = translations[code]?.[key] ?? translations.en[key] ?? fallback;
  value = String(value);
  return value.replace(/\\{([a-zA-Z0-9_]+)\\}/g, (_match, name) =>
    Object.hasOwn(params, name) ? String(params[name]) : `{${name}}`,
  );
}
`,
);

replaceOnce(
  "src/config.js",
  'export const PROJECT_URL = "https://github.com/MiszterSoul/FeatherText";',
  'import { normalizeLanguage } from "./i18n.js";\n\nexport const PROJECT_URL = "https://github.com/MiszterSoul/FeatherText";',
);
replaceOnce(
  "src/config.js",
  'export const defaultConfig = Object.freeze({\n  theme: "dark",',
  'export const defaultConfig = Object.freeze({\n  theme: "dark",\n  language: "en",',
);
replaceOnce(
  "src/config.js",
  '  result.wordCount = true;\n  result.charCount = true;',
  '  result.language = normalizeLanguage(result.language);\n  result.wordCount = true;\n  result.charCount = true;',
);

replaceOnce(
  "src/feathertext.js",
  'import { iconMarkup } from "./icons.js";',
  'import { iconMarkup } from "./icons.js";\nimport { translate } from "./i18n.js";',
);
replaceOnce(
  "src/feathertext.js",
  '  "fontSizes",\n]);',
  '  "fontSizes",\n  "language",\n]);',
);
replaceOnce(
  "src/feathertext.js",
  '  "autosave",\n]);',
  '  "autosave",\n  "language",\n]);',
);
replaceOnce(
  "src/feathertext.js",
  '  get history() {',
  '  t(key, params = {}, fallback = key) {\n    return translate(this.config?.language, key, params, fallback);\n  }\n\n  localizedConfigText(configKey, translationKey) {\n    const configured = this.config?.[configKey];\n    const englishDefault = defaultConfig[configKey];\n    if (configured == null || configured === englishDefault)\n      return this.t(translationKey, {}, englishDefault || "");\n    return String(configured);\n  }\n\n  get history() {',
);
replaceOnce(
  "src/feathertext.js",
  '    this.wrapper.id = this.id;\n    this.applyPresentationOptions();',
  '    this.wrapper.id = this.id;\n    this.wrapper.lang = this.config.language;\n    this.applyPresentationOptions();',
);
replaceOnce(
  "src/feathertext.js",
  '    this.editor.setAttribute("placeholder", this.config.placeholder);',
  '    this.editor.setAttribute(\n      "placeholder",\n      this.localizedConfigText("placeholder", "editor.placeholder"),\n    );',
);
replaceOnce(
  "src/feathertext.js",
  '    this.editor.setAttribute("aria-label", this.config.ariaLabel);',
  '    this.editor.setAttribute(\n      "aria-label",\n      this.localizedConfigText("ariaLabel", "editor.ariaLabel"),\n    );',
);
replaceOnce(
  "src/feathertext.js",
  '    this.source.setAttribute("aria-label", this.config.sourceAriaLabel);',
  '    this.source.setAttribute(\n      "aria-label",\n      this.localizedConfigText("sourceAriaLabel", "editor.sourceAriaLabel"),\n    );',
);
replaceOnce(
  "src/feathertext.js",
  '    bar.setAttribute("aria-label", "Formatting options");',
  '    bar.setAttribute("aria-label", this.t("toolbar.label"));',
);
replaceOnce(
  "src/feathertext.js",
  '    bar.setAttribute("aria-label", "Source mode tools");',
  '    bar.setAttribute("aria-label", this.t("source.label"));',
);
replaceOnce(
  "src/feathertext.js",
  '    select.setAttribute("aria-label", "Source syntax mode");',
  '    select.setAttribute("aria-label", this.t("source.syntaxMode"));',
);
replaceOnce(
  "src/feathertext.js",
  '    selectWrapper.dataset.featherTooltip = "Choose source syntax";',
  '    selectWrapper.dataset.featherTooltip = this.t("source.chooseSyntax");',
);
replaceOnce(
  "src/feathertext.js",
  '      "Wrap lines",',
  '      this.t("source.wrapLines"),',
);
replaceOnce(
  "src/feathertext.js",
  '      "Smart tabs",',
  '      this.t("source.smartTabs"),',
);
replaceOnce(
  "src/feathertext.js",
  '      "Auto close tags",',
  '      this.t("source.autoCloseTags"),',
);
replaceOnce(
  "src/feathertext.js",
  '    control.innerHTML = definition.icon;\n    control.dataset.featherTooltip = definition.tip;\n    control.dataset.command = name;\n    control.setAttribute("aria-label", definition.tip);',
  '    control.innerHTML = definition.icon;\n    const tip = this.t(\n      `toolbar.${name}`,\n      {},\n      definition.tip || definition.tooltip || name,\n    );\n    control.dataset.featherTooltip = tip;\n    control.dataset.command = name;\n    control.setAttribute("aria-label", tip);',
);
replaceOnce(
  "src/feathertext.js",
  '    wrapper.dataset.featherTooltip = "Paragraph format";\n    const select = this.document.createElement("select");\n    select.setAttribute("aria-label", "Paragraph format");',
  '    wrapper.dataset.featherTooltip = this.t("format.paragraphFormat");\n    const select = this.document.createElement("select");\n    select.setAttribute("aria-label", this.t("format.paragraphFormat"));',
);
replaceOnce(
  "src/feathertext.js",
  '      option.textContent =\n        heading === "P" ? "Paragraph" : `Heading ${String(heading).slice(1)}`;',
  '      option.textContent =\n        heading === "P"\n          ? this.t("format.paragraph")\n          : this.t("format.heading", { level: String(heading).slice(1) });',
);
replaceOnce(
  "src/feathertext.js",
  '      "Font family",',
  '      this.t("format.fontFamily"),',
);
replaceOnce(
  "src/feathertext.js",
  '      "Font size",',
  '      this.t("format.fontSize"),',
);
replaceOnce(
  "src/feathertext.js",
  '    wrapper.dataset.featherTooltip =\n      kind === "fore" ? "Text color" : "Background color";',
  '    wrapper.dataset.featherTooltip =\n      kind === "fore"\n        ? this.t("format.textColor")\n        : this.t("format.backgroundColor");',
);
replaceOnce(
  "src/feathertext.js",
  '      kind === "fore" ? "Text color" : "Background color",',
  '      kind === "fore"\n        ? this.t("format.textColor")\n        : this.t("format.backgroundColor"),',
);
replaceOnce(
  "src/feathertext.js",
  '    clear.dataset.featherTooltip = "Clear color";',
  '    clear.dataset.featherTooltip = this.t("format.clearColor");',
);
replaceOnce(
  "src/feathertext.js",
  '      kind === "fore" ? "Clear text color" : "Clear background color",',
  '      kind === "fore"\n        ? this.t("format.clearTextColor")\n        : this.t("format.clearBackgroundColor"),',
);
replaceOnce(
  "src/feathertext.js",
  '    } else if (\n      target === this.tooltipAnchor &&\n      !(event.relatedTarget && target.contains(event.relatedTarget))\n    )',
  '    } else if (\n      target &&\n      target === this.tooltipAnchor &&\n      !(event.relatedTarget && target.contains(event.relatedTarget))\n    )',
);
replaceOnce(
  "src/feathertext.js",
  '      title: anchor ? "Edit link" : "Insert link",\n      confirmLabel: anchor ? "Update" : "Insert",',
  '      title: anchor ? this.t("link.editTitle") : this.t("link.insertTitle"),\n      confirmLabel: anchor ? this.t("common.update") : this.t("common.insert"),',
);
replaceOnce("src/feathertext.js", '          label: "Link URL",', '          label: this.t("link.url"),');
replaceOnce(
  "src/feathertext.js",
  '          ? [{ name: "text", label: "Link text", value: "" }]',
  '          ? [{ name: "text", label: this.t("link.text"), value: "" }]',
);
replaceOnce(
  "src/feathertext.js",
  '            "Enter a safe HTTP(S), mail, telephone, or relative URL.",',
  '            this.t("link.safeError"),',
);
replaceOnce("src/feathertext.js", '        label: "Image URL",', '        label: this.t("image.url"),');
replaceOnce(
  "src/feathertext.js",
  '      { name: "alt", label: "Alternative text", value: "" },',
  '      { name: "alt", label: this.t("image.alt"), value: "" },',
);
replaceOnce("src/feathertext.js", '        label: "Upload image",', '        label: this.t("image.upload"),');
replaceOnce(
  "src/feathertext.js",
  '        description: "Choose a local image or enter a URL above.",',
  '        description: this.t("image.uploadDescription"),',
);
replaceOnce("src/feathertext.js", '      title: "Insert image",', '      title: this.t("image.insertTitle"),');
replaceOnce("src/feathertext.js", '      confirmLabel: "Insert",', '      confirmLabel: this.t("common.insert"),');
replaceOnce(
  "src/feathertext.js",
  '          throw new Error("Enter a safe HTTP(S) or relative image URL.");',
  '          throw new Error(this.t("image.safeError"));',
);
replaceOnce(
  "src/feathertext.js",
  '      throw new Error("No imageUpload hook is configured.");',
  '      throw new Error(this.t("image.uploadMissing"));',
);
replaceOnce(
  "src/feathertext.js",
  '          "The imageUpload hook returned an unsafe or empty URL.",',
  '          this.t("image.uploadUnsafe"),',
);
replaceOnce("src/feathertext.js", '      title: "Insert video",', '      title: this.t("video.insertTitle"),');
replaceOnce("src/feathertext.js", '          label: "YouTube or Vimeo URL",', '          label: this.t("video.url"),');
replaceOnce(
  "src/feathertext.js",
  '          throw new Error("Enter a valid YouTube or Vimeo video URL.");',
  '          throw new Error(this.t("video.safeError"));',
);
replaceOnce("src/feathertext.js", '      title: "Insert table",', '      title: this.t("table.insertTitle"),');
replaceOnce("src/feathertext.js", '          label: "Rows",', '          label: this.t("table.rows"),');
replaceOnce("src/feathertext.js", '          label: "Columns",', '          label: this.t("table.columns"),');
replaceOnce(
  "src/feathertext.js",
  '            `Table dimensions must be between 1×1 and ${this.config.tableMaxRows}×${this.config.tableMaxColumns}.`,',
  '            this.t("table.dimensionError", {\n              rows: this.config.tableMaxRows,\n              columns: this.config.tableMaxColumns,\n            }),',
);
replaceOnce(
  "src/feathertext.js",
  '  setTheme(theme) {\n    return this.setConfig({ theme });\n  }',
  '  setTheme(theme) {\n    return this.setConfig({ theme });\n  }\n\n  setLanguage(language) {\n    return this.setConfig({ language });\n  }',
);
replaceOnce(
  "src/feathertext.js",
  '  setAttribution() {',
  '  applyLanguage() {\n    if (!this.wrapper) return this;\n    this.wrapper.lang = this.config.language;\n    this.toolbar?.setAttribute("aria-label", this.t("toolbar.label"));\n    this.sourceHeader?.setAttribute("aria-label", this.t("source.label"));\n    this.sourceLanguageSelect?.setAttribute(\n      "aria-label",\n      this.t("source.syntaxMode"),\n    );\n    const syntaxWrapper = this.sourceLanguageSelect?.closest?.(".feather-select");\n    if (syntaxWrapper)\n      syntaxWrapper.dataset.featherTooltip = this.t("source.chooseSyntax");\n    const settingKeys = {\n      sourceWrapLines: "source.wrapLines",\n      sourceSmartTabs: "source.smartTabs",\n      sourceAutoClose: "source.autoCloseTags",\n    };\n    for (const [setting, key] of Object.entries(settingKeys)) {\n      const control = this.sourceHeader?.querySelector(`[data-setting="${setting}"]`);\n      if (!control) continue;\n      const label = this.t(key);\n      control.setAttribute("aria-label", label);\n      control.dataset.featherTooltip = label;\n    }\n    this.editor?.setAttribute(\n      "placeholder",\n      this.localizedConfigText("placeholder", "editor.placeholder"),\n    );\n    this.editor?.setAttribute(\n      "aria-label",\n      this.localizedConfigText("ariaLabel", "editor.ariaLabel"),\n    );\n    this.source?.setAttribute(\n      "aria-label",\n      this.localizedConfigText("sourceAriaLabel", "editor.sourceAriaLabel"),\n    );\n    this.autosaveManager?.refreshStatus();\n    return this;\n  }\n\n  setAttribution() {',
);
replaceOnce(
  "src/feathertext.js",
  '    if (changed.includes("fancy") || changed.includes("themeTransitions"))\n      this.applyPresentationOptions();',
  '    if (changed.includes("fancy") || changed.includes("themeTransitions"))\n      this.applyPresentationOptions();\n    if (changed.includes("language")) this.applyLanguage();',
);
replaceOnce(
  "src/feathertext.js",
  '    if (changed.includes("placeholder"))\n      this.editor.setAttribute("placeholder", this.config.placeholder);',
  '    if (changed.includes("placeholder") || changed.includes("language"))\n      this.editor.setAttribute(\n        "placeholder",\n        this.localizedConfigText("placeholder", "editor.placeholder"),\n      );',
);
replaceOnce(
  "src/feathertext.js",
  '    if (changed.includes("ariaLabel"))\n      this.editor.setAttribute("aria-label", this.config.ariaLabel);',
  '    if (changed.includes("ariaLabel") || changed.includes("language"))\n      this.editor.setAttribute(\n        "aria-label",\n        this.localizedConfigText("ariaLabel", "editor.ariaLabel"),\n      );',
);
replaceOnce(
  "src/feathertext.js",
  '    if (changed.includes("sourceAriaLabel"))\n      this.source.setAttribute("aria-label", this.config.sourceAriaLabel);',
  '    if (changed.includes("sourceAriaLabel") || changed.includes("language"))\n      this.source.setAttribute(\n        "aria-label",\n        this.localizedConfigText("sourceAriaLabel", "editor.sourceAriaLabel"),\n      );',
);

write(
  "src/status.js",
  `import { iconMarkup } from "./icons.js";
import { normalizeSafeUrl } from "./security.js";
import { isAutosaveEnabled } from "./autosave.js";

function externalLink(documentRef, className, url, label, icon) {
  const safeUrl = normalizeSafeUrl(url, {
    kind: "external",
    allowRelative: false,
  });
  if (!safeUrl) return null;
  const link = documentRef.createElement("a");
  link.className = className;
  link.href = safeUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.setAttribute("aria-label", label);
  link.title = label;
  link.dataset.featherTooltip = label;
  link.innerHTML = icon;
  return link;
}

export function shouldBuildStatus() {
  return true;
}

export function buildStatus(editor) {
  const documentRef = editor.element.ownerDocument;
  const status = documentRef.createElement("div");
  status.className = "feather-status";
  status.setAttribute("role", "status");

  const counters = documentRef.createElement("div");
  counters.className = "feather-counters";

  const wordBadge = documentRef.createElement("span");
  wordBadge.className = "feather-badge";
  editor.wordCountEl = documentRef.createElement("span");
  editor.wordCountEl.className = "feather-word-count";
  editor.wordCountEl.textContent = "0";
  wordBadge.append(
    editor.wordCountEl,
    documentRef.createTextNode(` ${editor.t("status.words")}`),
  );
  counters.appendChild(wordBadge);

  const charBadge = documentRef.createElement("span");
  charBadge.className = "feather-badge";
  editor.charCountEl = documentRef.createElement("span");
  editor.charCountEl.className = "feather-char-count";
  editor.charCountEl.textContent = "0";
  charBadge.append(
    editor.charCountEl,
    documentRef.createTextNode(` ${editor.t("status.characters")}`),
  );
  counters.appendChild(charBadge);

  if (isAutosaveEnabled(editor.config.autosave)) {
    editor.saveStateEl = documentRef.createElement("span");
    editor.saveStateEl.className = "feather-save-state";
    editor.saveStateEl.setAttribute("role", "status");
    editor.saveStateEl.setAttribute("aria-live", "polite");
    editor.saveStateEl.textContent = editor.t("autosave.on");
    counters.appendChild(editor.saveStateEl);
  }
  status.appendChild(counters);

  const attribution = documentRef.createElement("div");
  attribution.className = "feather-attribution";
  attribution.append(
    externalLink(
      documentRef,
      "feather-attribution-project",
      editor.config.projectUrl,
      editor.t("status.github"),
      iconMarkup.github,
    ),
    externalLink(
      documentRef,
      "feather-attribution-support",
      editor.config.supportUrl,
      editor.t("status.support"),
      iconMarkup.coffee,
    ),
  );
  status.appendChild(attribution);
  return status;
}
`,
);

replaceOnce(
  "src/dialogs.js",
  '    cancel.textContent = options.cancelLabel || "Cancel";',
  '    cancel.textContent = options.cancelLabel || this.editor.t("common.cancel");',
);
replaceOnce(
  "src/dialogs.js",
  '    confirm.textContent = options.confirmLabel || "Insert";',
  '    confirm.textContent = options.confirmLabel || this.editor.t("common.insert");',
);
replaceOnce(
  "src/dialogs.js",
  '            options.invalidMessage || "Please check the entered values.",',
  '            options.invalidMessage || this.editor.t("common.invalidValues"),',
);

replaceOnce(
  "src/find-replace.js",
  '    title.textContent = "Find and replace";',
  '    title.textContent = this.editor.t("find.title");',
);
replaceOnce("src/find-replace.js", '    findLabel.textContent = "Find";', '    findLabel.textContent = this.editor.t("find.find");');
replaceOnce(
  "src/find-replace.js",
  '    replaceLabel.textContent = "Replace with";',
  '    replaceLabel.textContent = this.editor.t("find.replaceWith");',
);
replaceOnce("src/find-replace.js", '      "Match case",', '      this.editor.t("find.matchCase"),');
replaceOnce("src/find-replace.js", '      "Whole word",', '      this.editor.t("find.wholeWord"),');
replaceOnce(
  "src/find-replace.js",
  '    const previous = actionButton(documentRef, "previous", "Previous");\n    const next = actionButton(documentRef, "next", "Next");\n    const replace = actionButton(documentRef, "replace", "Replace");\n    const replaceAll = actionButton(documentRef, "replace-all", "Replace all");\n    const close = actionButton(documentRef, "close", "Close");',
  '    const previous = actionButton(\n      documentRef,\n      "previous",\n      this.editor.t("find.previous"),\n    );\n    const next = actionButton(documentRef, "next", this.editor.t("find.next"));\n    const replace = actionButton(\n      documentRef,\n      "replace",\n      this.editor.t("find.replace"),\n    );\n    const replaceAll = actionButton(\n      documentRef,\n      "replace-all",\n      this.editor.t("find.replaceAll"),\n    );\n    const close = actionButton(\n      documentRef,\n      "close",\n      this.editor.t("common.close"),\n    );',
);

replaceOnce(
  "src/autosave.js",
  '    this.state = "disabled";\n    this.message = "Draft autosave off";',
  '    this.state = "disabled";\n    this.messageKey = "autosave.off";\n    this.message = this.editor.t(this.messageKey);',
);
replaceOnce(
  "src/autosave.js",
  '        throw new Error("Autosave storage is unavailable.");',
  '        throw new Error(this.editor.t("autosave.storageUnavailable"));',
);
const autosaveStates = [
  ["disabled", "Draft autosave off", "autosave.off"],
  ["idle", "Draft autosave on", "autosave.on"],
  ["pending", "Draft not saved", "autosave.pending"],
  ["saved", "Draft saved", "autosave.saved"],
  ["saving", "Saving draft…", "autosave.saving"],
  ["available", "Saved draft available", "autosave.available"],
  ["restored", "Draft restored", "autosave.restored"],
  ["cleared", "Saved draft cleared", "autosave.cleared"],
  ["error", "Draft unavailable", "autosave.unavailable"],
];
for (const [state, message, key] of autosaveStates) {
  replaceRegex(
    "src/autosave.js",
    new RegExp(`this\\.setState\\("${state}", "${message.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}"\\)`, "g"),
    `this.setState("${state}", "${key}")`,
  );
}
replaceOnce(
  "src/autosave.js",
  '      title: "Restore saved draft",\n      description: "A saved local draft is available. Restore it?",\n      confirmLabel: "Restore",\n      cancelLabel: "Not now",',
  '      title: this.editor.t("autosave.restoreTitle"),\n      description: this.editor.t("autosave.restoreDescription"),\n      confirmLabel: this.editor.t("autosave.restore"),\n      cancelLabel: this.editor.t("autosave.notNow"),',
);
replaceOnce(
  "src/autosave.js",
  '  setState(state, message) {\n    this.state = state;\n    this.message = message;',
  '  setState(state, messageKey) {\n    this.state = state;\n    this.messageKey = messageKey;\n    this.message = this.editor.t(messageKey);',
);
replaceOnce(
  "src/autosave.js",
  '      this.editor.saveStateEl.textContent = message;',
  '      this.editor.saveStateEl.textContent = this.message;',
);
replaceOnce(
  "src/autosave.js",
  '      message,\n      key: this.options.key,',
  '      message: this.message,\n      key: this.options.key,',
);
replaceOnce(
  "src/autosave.js",
  '  refreshStatus() {\n    if (this.editor.saveStateEl) {',
  '  refreshStatus() {\n    if (!this.editor) return;\n    this.message = this.editor.t(this.messageKey);\n    if (this.editor.saveStateEl) {',
);

replaceOnce(
  "index.d.ts",
  'export type PasteMode = "auto" | "text" | "html";',
  'export type FeatherTextLanguage = "en" | "hu";\nexport type PasteMode = "auto" | "text" | "html";',
);
replaceOnce(
  "index.d.ts",
  'export interface FeatherTextConfig {\n  theme?: Theme;',
  'export interface FeatherTextConfig {\n  theme?: Theme;\n  language?: FeatherTextLanguage;',
);
replaceOnce(
  "index.d.ts",
  '  setTheme(theme: Theme): this;',
  '  setTheme(theme: Theme): this;\n  setLanguage(language: FeatherTextLanguage): this;',
);

write(
  "docs/localization.md",
  `# Localization

FeatherText includes English and Hungarian interface text.

## Configuration

\`\`\`js
const english = new FeatherText("#editor-en", { language: "en" });
const hungarian = new FeatherText("#editor-hu", { language: "hu" });
\`\`\`

Supported values:

- \`en\` — English, the default;
- \`hu\` — Hungarian.

Locale variants beginning with \`hu\`, such as \`hu-HU\`, resolve to Hungarian. Other values fall back to English.

## Runtime changes

\`\`\`js
editor.setLanguage("hu");
editor.setConfig({ language: "en" });
\`\`\`

Changing the language rebuilds localized toolbar and footer controls while preserving editor content, history, source mode, fullscreen state, and selection where possible.

## Localized surfaces

The built-in dictionaries cover toolbar tooltips and accessible names, source-mode controls, paragraph and color controls, link/image/video/table dialogs, find and replace, autosave messages, word and character counters, and footer link tooltips.

Application-provided text such as a custom \`placeholder\`, \`ariaLabel\`, \`sourceAriaLabel\`, custom toolbar button tooltip, or plugin UI remains unchanged.
`,
);

const docsIndex = read("docs/index.md");
if (!docsIndex.includes("localization.md")) {
  write(
    "docs/index.md",
    docsIndex.replace(
      "- [`api.md`](api.md) — detailed API contract and current caveats\n",
      "- [`api.md`](api.md) — detailed API contract and current caveats\n- [`localization.md`](localization.md) — English and Hungarian interface configuration\n",
    ),
  );
}

let api = read("docs/api.md");
api = api.replace(/package metadata `0\.4\.0`/g, `package metadata \`${VERSION}\``);
api = api.replace(/@misztersoul\/feathertext@0\.4\.0/g, `${PACKAGE}@${VERSION}`);
if (!api.includes("## Localization")) {
  api += `\n\n## Localization\n\nSet \`language: "en"\` or \`language: "hu"\`. Hungarian locale variants such as \`hu-HU\` are normalized to \`hu\`; unsupported values fall back to English. Use \`editor.setLanguage(language)\` or \`editor.setConfig({ language })\` at runtime. Built-in toolbar labels, source controls, dialogs, find/replace, autosave states, counters, and footer tooltips are localized. Application-provided strings remain unchanged.\n\nThe footer is permanent. Word and character counts are always present. GitHub and Buy Me a Coffee are icon-only links with accessible names and hover tooltips; legacy footer configuration cannot hide or redirect them.\n`;
}
write("docs/api.md", api);

write(
  "test/i18n-tooltip.test.mjs",
  `import test from "node:test";
import assert from "node:assert/strict";

import FeatherText from "../src/feathertext.js";
import { PROJECT_URL, SUPPORT_URL } from "../src/config.js";
import { installDom } from "./helpers.mjs";

test("tooltip mouseout ignores non-tooltip targets", () => {
  const fixture = installDom();
  try {
    const editor = new FeatherText("#editor");
    assert.doesNotThrow(() =>
      editor.handleTooltipPointer(
        { target: editor.wrapper, relatedTarget: null },
        false,
      ),
    );
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("permanent footer uses localized icon-only canonical links", () => {
  const fixture = installDom();
  try {
    const editor = new FeatherText("#editor", {
      language: "hu",
      wordCount: false,
      charCount: false,
      attribution: false,
      supportLink: false,
      projectUrl: "https://example.com/project",
      supportUrl: "https://example.com/support",
    });
    assert.ok(editor.statusBar);
    assert.ok(editor.wordCountEl);
    assert.ok(editor.charCountEl);
    const project = editor.statusBar.querySelector(".feather-attribution-project");
    const support = editor.statusBar.querySelector(".feather-attribution-support");
    assert.equal(project.href, PROJECT_URL);
    assert.equal(support.href, SUPPORT_URL);
    assert.equal(project.textContent, "");
    assert.equal(support.textContent, "");
    assert.equal(project.getAttribute("aria-label"), "FeatherText a GitHubon");
    assert.equal(project.dataset.featherTooltip, "FeatherText a GitHubon");
    assert.equal(
      support.getAttribute("aria-label"),
      "FeatherText támogatása a Buy Me a Coffee oldalon",
    );
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("language config and setLanguage localize built-in controls", () => {
  const fixture = installDom();
  try {
    const editor = new FeatherText("#editor", {
      language: "hu-HU",
      toolbar: ["bold", "link", "source"],
    });
    assert.equal(editor.config.language, "hu");
    assert.equal(
      editor.toolbar.querySelector('[data-command="bold"]').getAttribute("aria-label"),
      "Félkövér (Ctrl+B)",
    );
    assert.equal(editor.editor.getAttribute("placeholder"), "Kezdj el írni...");
    assert.match(editor.statusBar.textContent, /szó/);
    assert.match(editor.statusBar.textContent, /karakter/);

    editor.setLanguage("en");
    assert.equal(editor.config.language, "en");
    assert.equal(
      editor.toolbar.querySelector('[data-command="bold"]').getAttribute("aria-label"),
      "Bold (Ctrl+B)",
    );
    assert.equal(editor.editor.getAttribute("placeholder"), "Start typing...");
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});
`,
);

console.log(`Applied FeatherText ${VERSION} release corrections.`);
