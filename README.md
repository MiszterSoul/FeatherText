# FeatherText

FeatherText turns a normal HTML `<textarea>` into a complete rich-text editor while keeping the original field synchronized for forms and application code.

It includes a configurable toolbar, visual and HTML source modes, themes, English and Hungarian interfaces, local draft autosave, find and replace, dialogs, history, counters, and a direct JavaScript API—with no runtime dependencies.

[Live editor](https://misztersoul.github.io/FeatherText/) · [Examples](https://misztersoul.github.io/FeatherText/examples/) · [npm](https://www.npmjs.com/package/@misztersoul/feathertext) · [Documentation](docs/index.md) · [Security](SECURITY.md) · [MIT license](LICENSE)

Current release: `0.3.2`. <!-- x-release-please-version -->

## Install

```bash
npm install @misztersoul/feathertext
```

```js
import FeatherText from "@misztersoul/feathertext";
import "@misztersoul/feathertext/css";
```

## Basic textarea integration

```html
<form method="post">
  <label for="article-body">Article body</label>
  <textarea id="article-body" name="articleBody">
    <h2>Hello</h2><p>Edit this content with FeatherText.</p>
  </textarea>
  <button type="submit">Save</button>
</form>
```

```js
const editor = new FeatherText("#article-body", {
  theme: "auto",
  language: "en",
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
});
```

The original textarea remains the form field. FeatherText synchronizes its HTML value as the user edits, switches modes, or changes content through the API.

## Browser bundle

```html
<link
  rel="stylesheet"
  href="https://cdn.jsdelivr.net/npm/@misztersoul/feathertext@0.3.2/dist/feathertext.min.css"
/> <!-- x-release-please-version -->
<textarea id="editor" name="content"></textarea>
<script src="https://cdn.jsdelivr.net/npm/@misztersoul/feathertext@0.3.2/dist/feathertext.min.js"></script> <!-- x-release-please-version -->
<script>
  const editor = new FeatherText("#editor", {
    theme: "dark",
    language: "en",
  });
</script>
```

## What the editor provides

- Textarea-backed form integration
- Rich-text formatting toolbar
- Headings, fonts, sizes, colors, alignment, lists, links, media, tables, code, and blockquotes
- Visual editing and HTML source editing
- Undo and redo history
- Find and replace
- Fullscreen mode
- Sixteen built-in themes plus automatic theme selection and custom theme tokens
- English and Hungarian built-in interface text
- Local draft autosave and restore
- Read-only and disabled states
- Multiple independent editor instances on one page
- ESM, CommonJS, browser-global, CSS, and TypeScript declaration outputs
- No runtime dependencies

## Configuration example

```js
const editor = new FeatherText("#editor", {
  theme: "ocean",
  language: "hu",
  minHeight: 280,
  maxHeight: 600,
  sanitizePaste: true,
  autosave: {
    enabled: true,
    key: "article:42:draft",
    debounce: 1000,
    restore: true,
  },
  toolbar: [
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
    "image",
    "table",
    "|",
    "ul",
    "ol",
    "|",
    "alignleft",
    "aligncenter",
    "alignright",
    "|",
    "undo",
    "redo",
    "fullscreen",
    "source",
  ],
  onChange(html) {
    console.log(html);
  },
});
```

## Common API methods

```js
editor.getHTML();
editor.getText();
editor.setHTML("<p>Trusted application HTML</p>");
editor.setUntrustedHTML(externalHtml);
editor.clear();
editor.focus();

editor.setTheme("forest");
editor.setLanguage("hu");
editor.setToolbar(["bold", "italic", "link", "source"]);
editor.setReadOnly(true);
editor.setDisabled(true);

editor.openFindReplace();
editor.startAutosave({ key: "draft", debounce: 1000, restore: true });
editor.clearSavedDraft();
editor.destroy();
```

## Localization

```js
const editor = new FeatherText("#editor", {
  language: "hu",
});

editor.setLanguage("en");
editor.setLanguage("hu");
```

Supported built-in languages:

- `en` — English
- `hu` — Hungarian

Hungarian locale variants such as `hu-HU` resolve to Hungarian. Unsupported values fall back to English.

## Multiple editors

```js
const titleEditor = new FeatherText("#title-notes", {
  theme: "light",
  language: "en",
});

const articleEditor = new FeatherText("#article-body", {
  theme: "ocean",
  language: "hu",
});
```

Each instance keeps its own content, selection, history, theme, language, source mode, and configuration.

## Status footer

Every editor displays:

- word count;
- character count;
- a GitHub icon;
- a Buy Me a Coffee icon.

The links are icon-only and expose their text through accessible labels and hover tooltips.

## Examples

- [Basic textarea and form](https://misztersoul.github.io/FeatherText/examples/basic.html)
- [Runtime API](https://misztersoul.github.io/FeatherText/examples/api.html)
- [English and Hungarian localization](https://misztersoul.github.io/FeatherText/examples/localization.html)
- [Local draft autosave](https://misztersoul.github.io/FeatherText/examples/autosave.html)
- [Multiple independent editors](https://misztersoul.github.io/FeatherText/examples/multiple-editors.html)

## HTML and security

Initial textarea HTML, `setHTML()`, and source mode are trusted-author paths. Use `setUntrustedHTML()` for external HTML, and keep authoritative sanitization, validation, output encoding, authorization, and Content Security Policy in the application.

See [Security](docs/security.md) for the complete trust-boundary documentation.

## Documentation

- [API reference](docs/api.md)
- [Localization](docs/localization.md)
- [Architecture](docs/architecture.md)
- [Security](docs/security.md)
- [Browser support](docs/browser-support.md)
- [Accessibility](docs/accessibility.md)
- [Release process](docs/releasing.md)

## Development

```bash
npm ci
npm run check
```

Build the package and Pages site:

```bash
npm run build
npm run build:site
```

## Support

- Bugs and feature requests: https://github.com/MiszterSoul/FeatherText/issues
- Security reports: https://github.com/MiszterSoul/FeatherText/security/advisories/new
- Support development: https://buymeacoffee.com/devpeter
