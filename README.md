# FeatherText

**A lightweight, free, framework-independent rich-text editor focused on speed, clarity, and practical customization.**

[Live site](https://misztersoul.github.io/FeatherText/) · [Documentation](docs/index.md) · [API](docs/api.md) · [Bug reports](https://github.com/MiszterSoul/FeatherText/issues) · [Support development](https://buymeacoffee.com/devpeter) · [Security](SECURITY.md) · [MIT License](LICENSE)

> [!IMPORTANT]
> FeatherText is pre-1.0, and the current package metadata is `0.2.0`. npm publication is not verified by repository evidence, so this documentation does not claim that `0.2.0` is available from the registry. Build from a checkout until an exact registry release and its provenance have been verified.

## Status

| Area                    | Current evidence                                                                                                                              |
| ----------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Package metadata        | `0.2.0`; ESM, CommonJS, browser-global, CSS, and TypeScript declaration entries                                                               |
| License                 | MIT                                                                                                                                           |
| Runtime dependencies    | None declared                                                                                                                                 |
| Runtime/build floor     | Node `>=20.19.0`; esbuild target ES2020                                                                                                       |
| Unit tests              | 70 Node/JSDOM tests under `test/`                                                                                                             |
| Browser automation      | 17 Playwright E2E tests on each of Chromium 151, Firefox 153, WebKit 26.5, Mobile Chrome profile, and Tablet WebKit profile: 85 total         |
| Automated accessibility | 12 full-document axe checks across Chromium and the Mobile Chrome profile                                                                     |
| Not claimed             | Latest-two-browser certification, manual assistive-technology results, WCAG conformance, Lighthouse results, or physical-device certification |

The browser numbers are exact-version automated evidence, not a blanket compatibility promise. See [browser support](docs/browser-support.md) and [accessibility](docs/accessibility.md).

## Current capabilities

- Enhances one or many `<textarea>` controls while keeping their values synchronized for form submission and reset.
- Configurable toolbar with formatting, links, images, application-provided image upload, safe YouTube/Vimeo embeds, bounded tables, lists, alignment, colors, history, fullscreen, source mode, copy, and paste actions.
- Eleven built-in themes, `auto`, custom token objects, optional `fancy` presentation, and independently themed instances. Theme state is scoped to each editor wrapper and does not mutate `document.documentElement`.
- Visual and source editing with line numbers, lightweight syntax coloring, wrapping, smart indentation, bracket pairs, and tag closing.
- Local, labelled dialogs for links, images, videos, tables, autosave restore, and find/replace. The implementation does not use browser `prompt()`.
- Find/replace in visual and source modes, including next/previous navigation, case matching, whole-word matching, replace-current, and replace-all.
- Opt-in local draft autosave with configurable key, debounce, storage adapter, restore dialog, status, and lifecycle methods.
- Focused runtime reconfiguration through `setConfig()` without rebuilding the wrapper or content-bearing editor/source surfaces.
- Read-only and disabled states, in-memory transaction history, counters, callbacks, instance events, bubbling DOM events, plugins, and custom toolbar buttons.
- Conservative APIs for untrusted HTML and URL normalization, with an explicit limited-security boundary.
- Browser-global, ESM, and CommonJS builds plus bundled TypeScript declarations.

FeatherText deliberately remains an HTML-string editor. It is not a schema engine, collaboration service, sandbox, complete sanitizer, file host, or authorization boundary. Several formatting operations are isolated behind a compatibility adapter that still uses deprecated `document.execCommand()` behavior.

## Installation

### From the current checkout

```bash
npm ci
npm run build
```

`npm run build` generates the ignored `dist/` directory; distribution files are build outputs, not hand-edited or committed source. Generated package assets include:

- `dist/feathertext.esm.js`
- `dist/feathertext.cjs`
- `dist/feathertext.min.js`
- `dist/feathertext.css`
- `dist/feathertext.min.css`

### From npm after a verified publish

```bash
npm install feathertext
```

Do not use a floating CDN URL until the package exists. After publication, pin an exact version and verify its provenance and file list.

## Quick start: browser global

```html
<link rel="stylesheet" href="./dist/feathertext.css" />

<label for="editor">Article body</label>
<textarea id="editor" name="content">
<p>Hello <strong>FeatherText</strong>.</p></textarea>

<script src="./dist/feathertext.min.js"></script>
<script>
  const [editor] = FeatherText.init("#editor", {
    theme: "auto",
    fancy: false,
    ariaLabel: "Article body editor",
    sourceAriaLabel: "Article body HTML source",
    toolbar: [
      "format",
      "bold",
      "italic",
      "link",
      "|",
      "ul",
      "ol",
      "|",
      "undo",
      "redo",
      "source",
    ],
  });

  console.log(editor.getHTML());
</script>
```

`fancy` defaults to `false`, keeping decorative shadows, gradients, transitions, backdrop filters, and press transforms off the default rendering path. Enable it explicitly with `fancy: true` or `editor.setFancy(true)` when those effects are desired. Reduced-motion preferences continue to suppress motion effects.

`FeatherText.init(selector, config)` returns an array in document order. A selector with no matches returns `[]`; `new FeatherText(elementOrSelector, config)` throws if it cannot resolve an attached element.

## ES modules, CommonJS, and types

```js
import FeatherText, {
  PROJECT_URL,
  SUPPORT_URL,
  sanitizeUntrustedHTML,
  themes,
  version,
} from "./dist/feathertext.esm.js";

const editor = new FeatherText("#editor", { theme: "ocean" });
console.log(PROJECT_URL, SUPPORT_URL, themes, version);
```

After publication, the package metadata is configured for `import FeatherText from "feathertext"` and `require("feathertext")`. `index.d.ts` supplies `FeatherTextConfig`, theme, paste, autosave, find/replace, plugin, event, upload, and security utility types through the package `types` and `exports` entries.

## Multiple instances

```js
const editors = FeatherText.init("textarea[data-feathertext]", {
  toolbar: ["bold", "italic", "source"],
});

editors[0]?.setTheme("ocean");
editors[1]?.setTheme("dawn");
```

Every instance owns its wrapper, content surfaces, theme tokens, history, listeners, dialogs, and default autosave key. Themes can differ on the same page without changing host-page root styles. The named plugin registry and `buttons` registry are shared module-level extension points, so register shared extensions deliberately.

## Configuration overview

The complete typed reference is in [`docs/api.md`](docs/api.md). Important defaults and behavior are summarized here.

| Option                                | Default                                      | Current behavior                                                                                                                |
| ------------------------------------- | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| `theme`                               | `"dark"`                                     | Built-in name, `"auto"`, or custom `{ bg, panel, border, accent, text, muted, hover, shadow }` tokens                           |
| `fancy`                               | `false`                                      | Adds wrapper shadows, pressed-button motion, and enhanced dialog/tooltip presentation                                           |
| `themeTransitions`                    | `false`                                      | Opts into short theme color transitions                                                                                         |
| `toolbar`                             | full toolbar                                 | Item-name array; `"                                                                                                             | "` starts a new group |
| `headings`                            | `P`, `H1`…`H6`                               | Paragraph-format choices                                                                                                        |
| `fonts` / `fontSizes`                 | system choices                               | Font-family and font-size controls                                                                                              |
| `placeholder`                         | `"Start typing..."`                          | Visual editor placeholder                                                                                                       |
| `height`                              | `"auto"`                                     | Fixed editor height when not `"auto"`                                                                                           |
| `minHeight` / `maxHeight`             | `220` / `600`                                | Numbers become pixels; CSS strings are accepted                                                                                 |
| `wordCount` / `charCount`             | `true` / `true`                              | Status counters                                                                                                                 |
| `maxLength`                           | `null`                                       | Blocks overflowing visual `beforeinput` text insertion; still enforce authoritative limits server-side and for API/source edits |
| `historyLimit`                        | `50`                                         | Maximum in-memory transactions                                                                                                  |
| `historyDebounceMs`                   | `400`                                        | Typing transaction debounce                                                                                                     |
| `countDebounceMs`                     | `200`                                        | Counter update debounce                                                                                                         |
| `pasteMode`                           | `"auto"`                                     | `"auto"`, `"text"`, or `"html"`                                                                                                 |
| `sanitizePaste`                       | `true`                                       | In `auto`, selects plain-text rather than HTML paste; it is not the sanitizer itself                                            |
| `pasteFilter`                         | `null`                                       | Application transform/block hook; HTML results still pass through the baseline cleaner                                          |
| `imageUpload`                         | `null`                                       | Application callback returning a safe URL or `{ url, alt }`; FeatherText does not host files                                    |
| `tableMaxRows` / `tableMaxColumns`    | `20` / `20`                                  | Bounds insertion and table growth                                                                                               |
| `startInSource`                       | `false`                                      | Initial mode only; use `setSourceMode()` at runtime                                                                             |
| `sourceRows` / `sourceTabSize`        | `10` / `4`                                   | Source textarea rows and tab width                                                                                              |
| `sourceWrapLines`                     | `false`                                      | Initial source wrapping                                                                                                         |
| `sourceSmartTabs` / `sourceAutoClose` | `true` / `true`                              | Source indentation and pair/tag helpers                                                                                         |
| `sourceIndentUnit`                    | `null`                                       | Explicit indentation or inferred/default two spaces                                                                             |
| `sourceHighlightThreshold`            | `100000`                                     | Above this length, the overlay uses escaped plain text instead of token spans                                                   |
| `readOnly` / `disabled`               | `false` / `false`                            | Mutation blocking and semantic state mirrored to the original control                                                           |
| `autosave`                            | `false`                                      | Boolean, debounce number, or structured local-draft options                                                                     |
| `autosaveInterval`                    | `30000`                                      | Legacy fallback debounce for boolean/numeric autosave configuration                                                             |
| `attribution`                         | `true`                                       | Shows the FeatherText project attribution when a status row exists                                                              |
| `supportLink`                         | `true`                                       | Adds the support action when attribution is enabled                                                                             |
| `projectUrl`                          | `https://github.com/MiszterSoul/FeatherText` | Configurable safe HTTP(S) project destination                                                                                   |
| `supportUrl`                          | `https://buymeacoffee.com/devpeter`          | Configurable safe HTTP(S) support destination                                                                                   |
| `plugins`                             | `[]`                                         | Plugin references or `[plugin, options]` tuples                                                                                 |
| `ariaLabel` / `sourceAriaLabel`       | editor labels                                | Accessible names for visual and source surfaces                                                                                 |
| `logErrors`                           | `true`                                       | Logs caught extension/clipboard errors and emits `error` events                                                                 |

Attribution links are created with `target="_blank"` and `rel="noopener noreferrer"`. Unsafe custom attribution URLs are omitted.

## Toolbar items

Special controls: `format`, `fontname`, `fontsize`, `forecolor`, `backcolor`, and separator `|`.

```text
bold italic underline strikethrough
link unlink image video table
ul ol indent outdent
alignleft aligncenter alignright alignjustify
blockquote code clearformat hr
undo redo fullscreen source copy paste
```

Link, image, video, and table actions use local modal dialogs. The image dialog requests alternative text and exposes a file input only when `imageUpload` is configured. Clipboard APIs still depend on browser permission, secure-context, and user-activation rules.

## Themes and presentation

Built-in themes are `dark`, `light`, `ocean`, `forest`, `dark-b`, `aurora`, `dawn`, `rose`, `graphite`, `canyon`, and `high-contrast`.

`theme: "auto"` follows color-scheme preferences and chooses `high-contrast` when forced colors or increased contrast is reported. Custom objects merge over the dark token set. Theme attributes and `--feather-*` variables are applied to the instance wrapper only.

```js
editor.setConfig({
  theme: { bg: "#10151f", accent: "#79ffe1" },
  fancy: true,
  themeTransitions: true,
});
```

`setConfig()` applies focused diffs. It may rebuild the toolbar or status row when those options change, but it retains the wrapper, visual editor, source textarea, content, source/fullscreen mode, history, and relevant focus/selection state.

## Content trust: trusted and untrusted HTML

```js
editor.setHTML(trustedApplicationHTML);
editor.setUntrustedHTML(untrustedHTML);

const cleaned = FeatherText.sanitizeUntrustedHTML(untrustedHTML);
```

- `setHTML()` and initial textarea content are **trusted-input APIs**. They assign HTML directly.
- `setUntrustedHTML()` and `sanitizeUntrustedHTML()` apply a deliberately conservative built-in allowlist that removes unsupported/active elements, event/style/class/id attributes, unsafe URLs, and unsafe image sources.
- The built-in allowlist is a baseline helper, **not a complete sanitizer** and not a replacement for an application-reviewed sanitizer, server-side validation, output encoding, and CSP.
- HTML clipboard content—including HTML returned by `pasteFilter`—passes through that baseline helper before insertion.
- Link, image, video, upload-result, and attribution URLs pass through purpose-specific URL checks.

> [!WARNING]
> Source mode is a trusted-author workflow. Source text, `pasteIntoSource()`, and source-mode find/replace are applied directly to editor HTML without the untrusted-HTML baseline when source mode is left. Never load attacker-controlled HTML into source mode or treat source-mode output as sanitized.

See [`docs/security.md`](docs/security.md) for the complete boundary.

## Forms and lifecycle

FeatherText hides the original textarea and inserts its generated wrapper before it. User mutations and API content changes synchronize the original value; user mutations dispatch native `input`, and blur dispatches `change`. Normal `FormData`/submission therefore reads the current HTML.

Native form reset restores the control’s initial value into visual/source state, resets transaction history, and preserves the current mode. `disabled` and `readOnly` are inherited from and mirrored back to compatible original controls. `destroy()` writes the latest HTML, removes generated UI/listeners/plugins/deferred work, and reveals the original control.

## Local draft autosave

Autosave is opt-in persistence, not network saving:

```js
const editor = new FeatherText("#editor", {
  autosave: {
    enabled: true,
    key: "article:42:draft",
    debounce: 800,
    restore: true,
    // storage: customStorage, // defaults to window.localStorage
  },
});

editor.stopAutosave();
editor.startAutosave();
editor.clearSavedDraft();
```

Draft records contain `{ version: 1, html, mode, updatedAt }`. Use an explicit stable `key` for reload restoration; generated default keys isolate instances but are not stable identifiers for a newly constructed editor. `restore: true` offers a local FeatherText dialog when a different draft is present. Storage failures emit `autosaveerror`/`error` events and place autosave in an error state.

Autosaved HTML has the same trust classification as the content supplied to the editor. Restoring a draft does not sanitize source-mode HTML.

## Find and replace

Ctrl/Cmd+F opens the local find/replace dialog in either visual or source mode.

```js
editor.openFindReplace();
editor.find("draft", { matchCase: false, wholeWord: true });
editor.findNext();
editor.findPrevious();
editor.replaceCurrent("final");
const count = editor.replaceAll("draft", "final");
editor.closeFindReplace();
```

Visual replacement preserves unaffected inline DOM where possible and records undoable transactions. Source replacement edits the raw source string. Finding remains available in read-only mode; replacement is blocked in read-only or disabled editors.

## Plugins, events, and custom buttons

```js
FeatherText.registerPlugin("change-log", (editor, options) => {
  const handler = ({ html }) => options.write(html);
  editor.on("change", handler);
  return () => editor.off("change", handler);
});

const editor = new FeatherText("#editor", {
  plugins: [["change-log", { write: console.log }]],
});
```

A plugin can be a registered name, factory, or object with `init`/`destroy`. Cleanup may be a function, an object with `destroy`, or the plugin’s own `destroy` method. Plugins are cleaned up in reverse order when reconfigured or destroyed.

`editor.on(type, handler)` receives `{ editor, ...detail }`. The same payload is dispatched as a bubbling `CustomEvent` named `feathertext:${type}` from the wrapper. Current events include `ready`, `change`, `focus`, `blur`, `paste`, `transaction`, `sourcechange`, `fullscreen`, `configchange`, `find`, `replace`, dialog events, autosave events, `imageupload`, `plugin`, `reset`, `error`, and `destroy`.

Custom buttons can be registered through `addButton(name, definition)` or the exported shared `buttons` registry. `addButton()` affects the shared definition registry and rebuilds that instance’s toolbar; use globally unique names.

## Main instance API

All state-changing convenience methods are chainable unless their documented failure path returns `false`; async dialog/upload/clipboard methods return promises where applicable.

| Area             | Methods                                                                                                                        |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Content          | `getHTML`, `getText`, `setHTML`, `setUntrustedHTML`, `pasteIntoSource`, `clear`                                                |
| State            | `focus`, `disable`, `enable`, `setDisabled`, `setReadOnly`, `destroy`                                                          |
| Configuration    | `getConfig`, `setConfig`, `setTheme`, `setToolbar`, `setPlaceholder`, `setHeight`, `setFancy`, `setAttribution`                |
| Modes/history    | `toggleSource`, `setSourceMode`, `toggleSourceSetting`, `toggleFullscreen`, `undo`, `redo`, `pushHistory`, `flushHistory`      |
| Find/replace     | `openFindReplace`, `closeFindReplace`, `find`, `findNext`, `findPrevious`, `replace`, `replaceCurrent`, `replaceAll`           |
| Autosave         | `startAutosave`, `stopAutosave`, `clearSavedDraft`                                                                             |
| Insertions       | `insertLink`, `insertImage`, `uploadImage`, `insertVideo`, `insertTable`, `insertCode`                                         |
| Tables           | `addTableRow`, `deleteTableRow`, `addTableColumn`, `deleteTableColumn`, `deleteTable`                                          |
| Commands/buttons | `exec`, `execCommand`, `clearFormatting`, `copyAction`, `pasteAction`, `addButton`, `removeButton`, `showButton`, `hideButton` |
| Extensions       | `on`, `off`, `emit`, `use`                                                                                                     |

See [`docs/api.md`](docs/api.md) for signatures, return values, callbacks, exports, and constraints.

## Browser and accessibility evidence

The repository Playwright configuration defines five automated projects. The current suite has 17 E2E tests per project:

- Chromium 151 — 17
- Firefox 153 — 17
- WebKit 26.5 — 17
- Mobile Chrome profile — 17
- Tablet WebKit profile — 17

That is 85 E2E executions. A separate accessibility command runs six full-document axe scenarios on Chromium and six on the Mobile Chrome profile, for 12 axe checks. The axe helper has no rule disables or element exclusions.

Coverage includes the built global package/site, forms/reset, multiple themes, URL/HTML policy, local dialogs, attribution, `setConfig`, history, source preservation, read-only/disabled behavior, uploads, tables, lifecycle, keyboard toolbar navigation, 320px overflow, reduced motion, and RTL/emoji round trips.

This evidence does **not** imply latest-two certification, exhaustive editing equivalence, manual keyboard completion, screen-reader/voice-control testing, WCAG conformance, physical mobile/tablet testing, or Lighthouse results.

## Development

Use Node `>=20.19.0`:

```bash
npm ci
npm run check:core
npm run test:e2e
npm run test:a11y
```

Or run the aggregate command:

```bash
npm run check
```

Useful commands:

```bash
npm test              # Node/JSDOM suites
npm run build         # ESM, CJS, browser-global, CSS, declarations/package assets
npm run build:site    # build and stage the framework-free site
npm run lint
npm run size
npm run package:check
npm run dev
```

Playwright browser installation may require:

```bash
npx playwright install --with-deps chromium firefox webkit
```

## Examples and documentation

- [`examples/basic.html`](examples/basic.html) — textarea/form integration.
- [`examples/api.html`](examples/api.html) — runtime content, theme, toolbar, find/replace, trust, reconfiguration, and lifecycle controls.
- [`site/index.html`](site/index.html) — framework-free site and live editor.
- [`docs/api.md`](docs/api.md) — full API reference.
- [`docs/architecture.md`](docs/architecture.md) — modules, state, lifecycle, and extension boundaries.
- [`docs/security.md`](docs/security.md) — trusted/untrusted HTML and deployment controls.
- [`docs/browser-support.md`](docs/browser-support.md) — exact automated matrix and policy limits.
- [`docs/accessibility.md`](docs/accessibility.md) — implemented semantics, axe evidence, and manual work still required.

## Contributing, support, and license

Read [`CONTRIBUTING.md`](CONTRIBUTING.md), [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md), and [`SECURITY.md`](SECURITY.md) before opening a change or private report.

- Bugs and feature proposals: <https://github.com/MiszterSoul/FeatherText/issues>
- Support development: <https://buymeacoffee.com/devpeter>
- License: [MIT](LICENSE)
