# FeatherText

FeatherText is a dependency-free rich text editor for browser applications. It provides configurable toolbars, ten built-in themes, source editing, paste controls, counters, and a small runtime API.

**Current version:** `0.2.0`

- Live documentation and playground: https://misztersoul.github.io/FeatherText/
- Changelog: [CHANGELOG.md](CHANGELOG.md)
- License: MIT

## Why FeatherText

- **Performance-first defaults:** shadows, decorative gradients, transitions, press transforms, and backdrop filters are disabled unless `fancy: true` is enabled.
- **No runtime dependencies:** ship one CSS file and one JavaScript file.
- **Configurable UI:** select toolbar items, headings, fonts, sizes, themes, counters, source behavior, and dimensions.
- **Runtime controls:** update themes, toolbar contents, editor HTML, source content, and fancy mode without replacing the instance.
- **Accessible foundations:** labeled editing surfaces, keyboard navigation, focus-visible states, and reduced-motion handling.

## Install

```bash
npm install feathertext
```

```js
import FeatherText from "feathertext";
import "feathertext/css";

const editor = new FeatherText("#editor", {
  theme: "dark",
  fancy: false,
});
```

For a script-tag setup:

```html
<link rel="stylesheet" href="feathertext.css">
<script src="feathertext.js"></script>

<textarea id="editor"><p>Hello world.</p></textarea>
<script>
  const [editor] = FeatherText.init("#editor", {
    theme: "dark",
    fancy: false,
    sanitizePaste: true,
  });
</script>
```

## Performance mode and fancy mode

`fancy` defaults to `false`. This keeps decorative rendering work off the default path.

```js
const editor = new FeatherText("#editor");

editor.setFancy(true);  // enable decorative effects
editor.setFancy(false); // return to performance-first rendering
```

Fancy mode restores editor shadows, active-button inset effects, press transforms, source-pane gradients, tooltip transitions, and tooltip shadows. `prefers-reduced-motion` still disables transitions and transforms.

## Common configuration

```js
const [editor] = FeatherText.init("#editor", {
  theme: "auto",
  fancy: false,
  toolbar: [
    "format", "fontname", "fontsize", "|",
    "bold", "italic", "underline", "strikethrough", "|",
    "link", "image", "table", "|",
    "ul", "ol", "|",
    "undo", "redo", "|",
    "source",
  ],
  headings: ["P", "H1", "H2", "H3"],
  sanitizePaste: true,
  wordCount: true,
  charCount: true,
  minHeight: 220,
  maxHeight: 600,
  sourceWrapLines: false,
  sourceSmartTabs: true,
  sourceAutoClose: true,
});
```

### Core options

| Option | Default | Description |
| --- | --- | --- |
| `theme` | `"dark"` | Built-in theme name, `"auto"`, or a custom theme object. |
| `fancy` | `false` | Enables decorative visual effects. |
| `toolbar` | full toolbar | Ordered toolbar items; use `"|"` between groups. |
| `sanitizePaste` | `true` | Uses plain-text paste unless another paste mode/filter is configured. |
| `wordCount` | `true` | Displays a debounced word count. |
| `charCount` | `true` | Displays a debounced character count. |
| `height` | `"auto"` | Fixed height or automatic sizing. |
| `minHeight` | `220` | Minimum editor height in pixels. |
| `maxHeight` | `600` | Maximum editor height before scrolling. |
| `sourceWrapLines` | `false` | Soft-wraps source lines. |
| `sourceSmartTabs` | `true` | Applies indentation helpers in source mode. |
| `sourceAutoClose` | `true` | Auto-closes source tags and bracket pairs. |
| `startInSource` | `false` | Opens directly in source mode. |

The live [configuration generator](https://misztersoul.github.io/FeatherText/examples/config-generator.html) covers the most-used options and toolbar presets.

## Themes

Built-in themes:

`dark`, `light`, `ocean`, `forest`, `dark-b`, `aurora`, `dawn`, `rose`, `graphite`, `canyon`

```js
editor.setTheme("ocean");

editor.setTheme({
  bg: "#121212",
  panel: "#1e1e1e",
  border: "#333333",
  accent: "#8ab4ff",
  text: "#e6e9ef",
  muted: "#98a2b3",
  hover: "#222222",
});
```

## Instance API

```js
editor.getHTML();
editor.setHTML("<p>Updated content</p>");
editor.getText();
editor.clear();
editor.focus();
editor.disable();
editor.enable();
editor.setTheme("light");
editor.setFancy(true);
editor.setToolbar(["bold", "italic", "|", "undo", "redo"]);
editor.setConfig({ theme: "ocean", fancy: false });
editor.toggleSource();
editor.toggleFullscreen();
editor.pasteIntoSource("<p>Inserted from source</p>");
editor.undo();
editor.redo();
editor.destroy();
```

## Examples

- [Examples overview](https://misztersoul.github.io/FeatherText/examples/)
- [Quick start](https://misztersoul.github.io/FeatherText/examples/example.html)
- [Basic toolbar](https://misztersoul.github.io/FeatherText/examples/example-basic.html)
- [Runtime API](https://misztersoul.github.io/FeatherText/examples/example-api.html)
- [Ocean theme](https://misztersoul.github.io/FeatherText/examples/example-ocean.html)
- [Configuration generator](https://misztersoul.github.io/FeatherText/examples/config-generator.html)

## Development

```bash
npm ci
npm test
npm run build
npm run dev
```

Then open `http://localhost:5173/`.

The CI and GitHub Pages workflows run tests before building. Release tags must match the version in `package.json`.

## Release process

1. Update `package.json` and `CHANGELOG.md` together. Regenerate `package-lock.json` when dependency metadata changes.
2. Run `npm test` and `npm run build`.
3. Commit the release changes.
4. Create and push a matching tag, for example `v0.2.0`.
5. The release workflow verifies the tag, builds distributable assets, creates a GitHub Release, and publishes to npm when `NPM_TOKEN` is configured.

## License

MIT
