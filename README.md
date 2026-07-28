# FeatherText

A lightweight, dependency-free rich-text editor for browser applications.

[Live demo](https://misztersoul.github.io/FeatherText/) · [Documentation](docs/index.md) · [GitHub](https://github.com/MiszterSoul/FeatherText) · [Buy Me a Coffee](https://buymeacoffee.com/devpeter) · [Security](SECURITY.md) · [MIT license](LICENSE)

Current release: `0.4.0`. <!-- x-release-please-version -->

## Install

```bash
npm install @misztersoul/feathertext
```

```js
import FeatherText from "@misztersoul/feathertext";
import "@misztersoul/feathertext/css";

const editor = new FeatherText("#editor", {
  theme: "auto",
  language: "en",
  toolbar: ["bold", "italic", "link", "undo", "redo", "source"],
});
```

Hungarian interface:

```js
const editor = new FeatherText("#editor", {
  language: "hu",
});
```

The language can also be changed at runtime:

```js
editor.setLanguage("hu");
editor.setLanguage("en");
```

Browser bundle:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@misztersoul/feathertext@0.4.0/dist/feathertext.min.css"> <!-- x-release-please-version -->
<script src="https://cdn.jsdelivr.net/npm/@misztersoul/feathertext@0.4.0/dist/feathertext.min.js"></script> <!-- x-release-please-version -->
<script>
  const editor = new FeatherText("#editor", { language: "hu", theme: "auto" });
</script>
```

## Permanent footer

The footer is always rendered and cannot be hidden or redirected through configuration. It contains:

- word count;
- character count;
- a GitHub icon linking to the canonical repository;
- a Buy Me a Coffee icon linking to the canonical support page.

The two links are icon-only. Their accessible names and hover tooltips provide the text labels.

## Core API

```js
editor.getHTML();
editor.getText();
editor.setHTML(trustedHtml);
editor.setUntrustedHTML(untrustedHtml);
editor.setTheme("dark");
editor.setLanguage("hu");
editor.setReadOnly(true);
editor.setDisabled(true);
editor.destroy();
```

`setHTML()`, initial textarea content, and source mode are trusted-author APIs. Use `setUntrustedHTML()` for external HTML and still apply server-side validation, output encoding, and an appropriate Content Security Policy.

## Configuration highlights

| Option | Type | Default | Description |
| --- | --- | --- | --- |
| `language` | `"en" \| "hu"` | `"en"` | Interface language |
| `theme` | built-in name, `"auto"`, or token object | `"dark"` | Visual theme |
| `toolbar` | `string[]` | full toolbar | Toolbar controls |
| `autosave` | boolean, number, or options object | `false` | Local draft autosave |
| `readOnly` | boolean | `false` | Prevent mutations while allowing selection and copy |
| `disabled` | boolean | `false` | Disable editor interaction |

The legacy footer-related options remain accepted for compatibility but cannot disable or redirect the permanent footer.

## Documentation

- [API reference](docs/api.md)
- [Localization](docs/localization.md)
- [Security model](docs/security.md)
- [Browser support](docs/browser-support.md)
- [Release process](docs/releasing.md)

## Development

```bash
npm ci
npm run check
```

## Support

- Bugs and feature requests: https://github.com/MiszterSoul/FeatherText/issues
- Security reports: https://github.com/MiszterSoul/FeatherText/security/advisories/new
- Project support: https://buymeacoffee.com/devpeter
