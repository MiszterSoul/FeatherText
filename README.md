# FeatherText

A lightweight, dependency-free rich-text editor for browser applications.

[Live demo](https://misztersoul.github.io/FeatherText/) · [GitHub](https://github.com/MiszterSoul/FeatherText) · [Buy Me a Coffee](https://buymeacoffee.com/devpeter) · [Security policy](SECURITY.md) · [MIT license](LICENSE)

## Install

```bash
npm install @misztersoul/feathertext
```

```js
import FeatherText from "@misztersoul/feathertext";
import "@misztersoul/feathertext/css";

const editor = new FeatherText("#editor", {
  theme: "auto",
  toolbar: ["bold", "italic", "link", "undo", "redo", "source"],
});

console.log(editor.getHTML());
```

Browser bundle:

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@misztersoul/feathertext@0.4.0/dist/feathertext.min.css">
<script src="https://cdn.jsdelivr.net/npm/@misztersoul/feathertext@0.4.0/dist/feathertext.min.js"></script>
<script>
  const editor = new FeatherText("#editor", { theme: "auto" });
</script>
```

## Release 0.4.0

- Package: `@misztersoul/feathertext`
- Public registry: npm
- Module formats: ESM, CommonJS, and browser global
- Type declarations: included
- Runtime dependencies: none
- Node.js build/test floor: `>=20.19.0`
- License: MIT

The editor footer is part of the product identity and cannot be hidden or redirected. It always displays word count, character count, the canonical GitHub link, and the canonical Buy Me a Coffee link.

## Core API

```js
editor.getHTML();
editor.getText();
editor.setHTML(trustedHtml);
editor.setUntrustedHTML(untrustedHtml);
editor.setTheme("dark");
editor.setReadOnly(true);
editor.setDisabled(true);
editor.destroy();
```

`setHTML()`, initial textarea content, and source mode are trusted-author APIs. Use `setUntrustedHTML()` for external HTML and still apply server-side validation, output encoding, and a suitable Content Security Policy.

## Development

```bash
npm ci
npm run check
```

The release workflow runs linting, unit tests, browser tests, accessibility checks, size checks, package verification, npm provenance publication, and GitHub release asset verification.

## Support

- Bugs and feature requests: https://github.com/MiszterSoul/FeatherText/issues
- Security reports: https://github.com/MiszterSoul/FeatherText/security/advisories/new
- Project support: https://buymeacoffee.com/devpeter
