# Localization

FeatherText includes English and Hungarian interface text.

## Configuration

```js
const english = new FeatherText("#editor-en", { language: "en" });
const hungarian = new FeatherText("#editor-hu", { language: "hu" });
```

Supported values:

- `en` — English, the default;
- `hu` — Hungarian.

Locale variants beginning with `hu`, such as `hu-HU`, resolve to Hungarian. Other values fall back to English.

## Runtime changes

```js
editor.setLanguage("hu");
editor.setConfig({ language: "en" });
```

Changing the language rebuilds localized toolbar and footer controls while preserving editor content, history, source mode, fullscreen state, and selection where possible.

## Localized surfaces

The built-in dictionaries cover toolbar tooltips and accessible names, source-mode controls, paragraph and color controls, link/image/video/table dialogs, find and replace, autosave messages, word and character counters, and footer link tooltips.

Application-provided text such as a custom `placeholder`, `ariaLabel`, `sourceAriaLabel`, custom toolbar button tooltip, or plugin UI remains unchanged.
