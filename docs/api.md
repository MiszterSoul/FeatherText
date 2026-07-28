# API reference

Status: current repository source and `index.d.ts`, package metadata `0.3.1`, reconciled 2026-07-28. No GitHub tags or releases exist yet, and the public npm registry returned `404 Not Found` for `feathertext` on 2026-07-28. FeatherText is pre-1.0; pin an exact commit/build and retest before production adoption.

**A lightweight, free, framework-independent rich-text editor focused on speed, clarity, and practical customization.**

## Package entry points

A successful build creates the package-facing outputs configured in `package.json`:

| Entry/output                             | Purpose                    |
| ---------------------------------------- | -------------------------- |
| package default import                   | `dist/feathertext.esm.js`  |
| package `require`                        | `dist/feathertext.cjs`     |
| `feathertext/browser` / browser metadata | `dist/feathertext.min.js`  |
| `feathertext/feathertext.css`            | `dist/feathertext.css`     |
| `feathertext/feathertext.min.css`        | `dist/feathertext.min.css` |
| package types                            | `index.d.ts`               |

The browser bundle exposes `globalThis.FeatherText`. Because the public npm registry returned `404 Not Found` for `feathertext` on 2026-07-28, build locally until an exact registry release and its provenance are verified.

### ESM

```js
import FeatherText, {
  PROJECT_URL,
  SUPPORT_URL,
  buttons,
  defaultConfig,
  iconMarkup,
  isSafeUrl,
  normalizeSafeUrl,
  sanitizeUntrustedHTML,
  themes,
  toSafeVideoEmbedUrl,
  version,
} from "./dist/feathertext.esm.js";
```

### Browser global

```html
<link rel="stylesheet" href="./dist/feathertext.css" />
<script src="./dist/feathertext.min.js"></script>
<script>
  const editor = new FeatherText("#editor");
</script>
```

The constructor also exposes:

```js
FeatherText.themes;
FeatherText.buttons;
FeatherText.version;
FeatherText.sanitizeUntrustedHTML;
FeatherText.normalizeSafeUrl;
FeatherText.isSafeUrl;
```

## TypeScript

`index.d.ts` declares the default class and named types/exports. No separate `@types` package is required when using the configured package entry.

```ts
import FeatherText, {
  type AutosaveOptions,
  type FeatherTextConfig,
  type FeatherTextPlugin,
  type FindResult,
  type Theme,
} from "feathertext";

const config: FeatherTextConfig = {
  theme: "auto",
  fancy: true,
  autosave: {
    enabled: true,
    key: "article:42:draft",
    debounce: 800,
    restore: true,
  },
};

const editor = new FeatherText("#editor", config);
const result: FindResult = editor.find("draft");
```

Declared types cover built-in/custom themes, paste payload/filter results, image uploads, URL/sanitizer options, autosave storage/drafts/state, find results/options, callbacks/events, buttons, and plugins.

## Construction

### `new FeatherText(element, config?)`

```js
const editor = new FeatherText("#article-body", {
  ariaLabel: "Article body editor",
});
```

`element` may be a selector string or an `HTMLElement`. A selector is resolved with `document.querySelector`. Construction throws:

- `Error("FeatherText: Element not found")` when no element resolves;
- `Error("FeatherText: Element must be attached to the document")` when it has no parent.

A `<textarea>` is the intended host because its value, `name`, form association, reset behavior, `disabled`, and `readOnly` semantics are preserved. Compatible value-bearing controls can work, while generic `contenteditable` hosts are not the documented integration contract.

### `FeatherText.init(selector, config?)`

```js
const editors = FeatherText.init("textarea[data-editor]", {
  toolbar: ["bold", "italic", "source"],
});
```

Uses `document.querySelectorAll`, constructs one editor per match, and returns `FeatherText[]` in document order. No match returns `[]`.

### Multiple instances

Each instance owns its wrapper, content/source surfaces, dialogs, theme controller/tokens, history, autosave manager/default key, listeners, and configured plugin cleanup. Wrapper-scoped themes can differ simultaneously:

```js
const [left, right] = FeatherText.init("textarea.editor");
left.setTheme("ocean");
right.setTheme("dawn");
```

This does not mutate `document.documentElement`. The named plugin registry and exported/custom `buttons` definitions are shared module-level extension state.

## Configuration semantics

Configuration is created from `defaultConfig` plus overrides. Built-in array options are copied; theme/autosave objects are shallow-copied; functions and nested storage/plugin references retain identity.

Prefer `setConfig()` or focused setters at runtime. Directly mutating `editor.config` may not apply required DOM/manager updates.

### Editing, layout, and state

| Option            | Type                       | Default             | Behavior                                                                                              |
| ----------------- | -------------------------- | ------------------- | ----------------------------------------------------------------------------------------------------- |
| `placeholder`     | `string`                   | `"Start typing..."` | Visual surface placeholder attribute                                                                  |
| `height`          | `number \| string`         | `"auto"`            | Fixed wrapper height unless `"auto"`; numbers/numeric strings become pixels                           |
| `minHeight`       | `number \| string`         | `220`               | `--feather-min-height`                                                                                |
| `maxHeight`       | `number \| string \| null` | `600`               | `--feather-max-height`; truthy value enables scrollable class                                         |
| `wordCount`       | `boolean`                  | `true`              | Word counter in status row                                                                            |
| `charCount`       | `boolean`                  | `true`              | Character counter in status row                                                                       |
| `countDebounceMs` | `number`                   | `200`               | Counter update delay; `0` is immediate                                                                |
| `maxLength`       | `number \| null`           | `null`              | Blocks visual `beforeinput` text that would exceed current selected-text-adjusted length              |
| `readOnly`        | `boolean`                  | `false`             | Blocks mutation, leaves source viewing/copy/fullscreen available, mirrors host/source read-only state |
| `disabled`        | `boolean`                  | `false`             | Blocks editing and all toolbar/source controls, mirrors host disabled state                           |

`maxLength` is not an authoritative limit. It does not cover every source, API, programmatic, IME, paste, or server path; enforce product limits separately.

When `disabled`/`readOnly` are not explicitly supplied, compatible original-control properties are inherited.

### History

| Option              | Type     | Default | Behavior                                                                 |
| ------------------- | -------- | ------- | ------------------------------------------------------------------------ |
| `historyLimit`      | `number` | `50`    | Maximum bounded in-memory transaction entries; minimum normalized to one |
| `historyDebounceMs` | `number` | `400`   | Delay for grouping typing; explicit operations commit immediately        |

History entries capture active HTML/source value, mode, selection, label, and timestamp internally. Public `history` returns only value strings.

### Toolbar and table limits

| Option            | Type       | Default                   | Behavior                           |
| ----------------- | ---------- | ------------------------- | ---------------------------------- |
| `toolbar`         | `string[]` | full built-in list        | Item names; `"                     | "` starts a new group |
| `headings`        | `string[]` | `P`, `H1`…`H6`            | Format select entries              |
| `fonts`           | `string[]` | eight common system fonts | Font-family choices                |
| `fontSizes`       | `string[]` | `10px`…`36px`             | Font-size choices                  |
| `tooltipOffset`   | `number`   | `14`                      | Local tooltip offset in pixels     |
| `tableMaxRows`    | `number`   | `20`                      | Bounds insertion and row growth    |
| `tableMaxColumns` | `number`   | `20`                      | Bounds insertion and column growth |

Unknown toolbar names are ignored unless a matching custom definition exists in `buttons`. The `P` format option maps to `formatBlock` with `div` in the current command implementation.

### Themes and presentation

| Option             | Type                                     | Default  | Behavior                                                                  |
| ------------------ | ---------------------------------------- | -------- | ------------------------------------------------------------------------- |
| `theme`            | built-in name, `"auto"`, or token object | `"dark"` | Applies wrapper-scoped attributes and eight CSS variables                 |
| `fancy`            | `boolean`                                | `false`  | Adds shadows, pressed-button motion, enhanced tooltip/dialog presentation |
| `themeTransitions` | `boolean`                                | `false`  | Adds short color/background/border theme transitions                      |

Built-in fixed names (16 total; `auto` is separate):

```text
dark light ocean forest dark-b aurora dawn rose graphite canyon midnight solarized lavender mint ember high-contrast
```

Custom token keys:

```ts
interface ThemeTokens {
  bg?: string;
  panel?: string;
  border?: string;
  accent?: string;
  text?: string;
  muted?: string;
  hover?: string;
  shadow?: string;
}
```

Missing/empty custom values fall back to dark tokens. Unknown theme strings resolve to dark.

`auto` listens for `prefers-color-scheme`, `forced-colors`, and `prefers-contrast` changes. Forced/increased contrast resolves to `high-contrast`; otherwise it selects dark or light. Theme state is applied to `editor.wrapper`, never `document.documentElement`.

### Paste and upload

| Option          | Type                         | Default  | Behavior                                                                 |
| --------------- | ---------------------------- | -------- | ------------------------------------------------------------------------ |
| `sanitizePaste` | `boolean`                    | `true`   | In `pasteMode: "auto"`, selects plain text when true and HTML when false |
| `pasteMode`     | `"auto" \| "text" \| "html"` | `"auto"` | Built-in clipboard content choice                                        |
| `pasteFilter`   | function or `null`           | `null`   | Transforms/blocks payload before built-in choice                         |
| `imageUpload`   | function or `null`           | `null`   | Application upload adapter used by image dialog and pasted image files   |

`pasteFilter(payload, event, editor)` receives:

```js
{
  text: "clipboard text",
  html: "<p>clipboard HTML</p>",
  files: [/* File */],
}
```

It may return:

- `{ type: "text", content }`;
- `{ type: "html", content }`;
- a string, treated as text;
- `false` to block insertion;
- `null`/`undefined`/another falsy value to use configured selection.

HTML selected by any paste path is passed through `sanitizeUntrustedHTML()` before insertion. `sanitizePaste` is the mode switch, not the sanitizer itself.

`imageUpload(file, editor)` may return synchronously or asynchronously:

```js
"https://cdn.example/image.png"
// or
{ url: "https://cdn.example/image.png", alt: "Description" }
```

The returned image URL must pass the image policy. FeatherText does not validate, authorize, store, scan, or serve uploaded files.

### Source mode

| Option                     | Type             | Default                | Behavior                                                    |
| -------------------------- | ---------------- | ---------------------- | ----------------------------------------------------------- |
| `startInSource`            | `boolean`        | `false`                | Construction-time initial mode                              |
| `sourceAriaLabel`          | `string`         | `"HTML source editor"` | Native source textarea name                                 |
| `sourceRows`               | `number`         | `10`                   | Clamped to 1…1000                                           |
| `sourceTabSize`            | `number`         | `4`                    | Wrapper CSS tab size                                        |
| `sourceWrapLines`          | `boolean`        | `false`                | Soft wrap and source wrapper class                          |
| `sourceSmartTabs`          | `boolean`        | `true`                 | Indentation helpers                                         |
| `sourceAutoClose`          | `boolean`        | `true`                 | Quote/bracket pair and HTML tag closing                     |
| `sourceIndentUnit`         | `string \| null` | `null`                 | Explicit unit, inferred whitespace, or two-space fallback   |
| `sourceHighlightThreshold` | `number`         | `100000`               | Above threshold, escaped plain overlay replaces token spans |

The source language selector changes lightweight display tokenization among HTML, CSS, JavaScript, XML, and JSON. It does not validate, lint, format, execute, or sanitize source.

> **Trust limitation:** source mode is a trusted-author path. Leaving source mode assigns raw source directly to visual `innerHTML`. `pasteIntoSource()` and source-mode find/replace also bypass the untrusted-HTML baseline. Do not place attacker-controlled HTML in source mode or treat source output as sanitized.

`startInSource` is read at construction. Use `setSourceMode()` for runtime switching.

### Autosave

`autosave` accepts:

- `false` (default): disabled;
- `true`: enabled using `autosaveInterval` as debounce;
- a non-negative number: enabled with that debounce in milliseconds;
- structured options.

```ts
interface AutosaveOptions {
  enabled?: boolean;
  key?: string;
  debounce?: number;
  /** deprecated alias */
  interval?: number;
  storage?: AutosaveStorage;
  restore?: boolean;
}
```

| Option                | Default                           | Behavior                                                    |
| --------------------- | --------------------------------- | ----------------------------------------------------------- |
| `autosave`            | `false`                           | Local draft persistence when enabled                        |
| `autosaveInterval`    | `30000`                           | Legacy fallback debounce                                    |
| structured `enabled`  | enabled unless explicitly `false` | Controls manager start                                      |
| structured `key`      | generated per instance            | Storage key; provide a stable key for reload recovery       |
| structured `debounce` | legacy/numeric value or `30000`   | Delay after change; `0` saves immediately                   |
| structured `storage`  | `window.localStorage`             | Any object with `getItem`, `setItem`, `removeItem`          |
| structured `restore`  | `false`                           | Offers a local restore dialog when a different draft exists |

Draft shape:

```ts
{
  version: 1;
  html: string;
  mode: "editor" | "source";
  updatedAt: number;
}
```

Generated default keys isolate current instances but include random/per-instance identity; they are not stable identifiers for a newly constructed editor. Autosave sends no network request and does not encrypt or sanitize HTML. Restored source drafts retain the source-mode trust limitation.

### Attribution and support

| Option        | Type      | Default                                      | Behavior                                       |
| ------------- | --------- | -------------------------------------------- | ---------------------------------------------- |
| `attribution` | `boolean` | `true`                                       | Shows the project attribution area             |
| `supportLink` | `boolean` | `true`                                       | Shows support icon when attribution is enabled |
| `projectUrl`  | `string`  | `https://github.com/MiszterSoul/FeatherText` | Project destination                            |
| `supportUrl`  | `string`  | `https://buymeacoffee.com/devpeter`          | Support destination                            |

Only safe absolute HTTP(S) external URLs are rendered. Links use `target="_blank"`, `rel="noopener noreferrer"`, accessible labels/titles, and inline current-color SVGs. Unsafe custom destinations are omitted.

A status row is built when counters, attribution, or enabled autosave require it. `supportLink` does not display independently when `attribution` is false.

### Plugins

| Option    | Type                    | Default | Behavior                                                    |
| --------- | ----------------------- | ------- | ----------------------------------------------------------- |
| `plugins` | configured plugin array | `[]`    | Initialized after autosave/state setup and before `onReady` |

Each item is a plugin reference or `[reference, options]` tuple. A reference may be a registered name, plugin factory, or object. See [Plugins](#plugins) below.

### Labels, callbacks, and logging

| Option            | Default                | Invocation/behavior                                             |
| ----------------- | ---------------------- | --------------------------------------------------------------- |
| `ariaLabel`       | `"Rich text editor"`   | Generated visual surface name                                   |
| `sourceAriaLabel` | `"HTML source editor"` | Native source textarea name                                     |
| `onReady`         | `null`                 | `(editor)` after configured plugins install                     |
| `onChange`        | `null`                 | `(html, editor)` for a changed value                            |
| `onFocus`         | `null`                 | `(editor)` when visual/source surface focuses                   |
| `onBlur`          | `null`                 | `(editor)` after history/count flush and host `change` dispatch |
| `onPaste`         | `null`                 | `(event, payload, editor)`                                      |
| `onKeydown`       | `null`                 | `(event, editor)` for visual editor keydown                     |
| `logErrors`       | `true`                 | `console.warn` for caught errors plus `error` event             |

Callbacks are invoked through an error boundary. A thrown callback error is reported instead of escaping the core call path.

## Content trust and methods

### Trusted versus untrusted APIs

```js
editor.setHTML(trustedHTML);
editor.setUntrustedHTML(untrustedHTML);
```

- Initial host content and `setHTML()` are trusted/direct HTML paths.
- `setUntrustedHTML()` calls the conservative built-in baseline first.
- `sanitizeUntrustedHTML()` is deliberately incomplete and not a replacement for an application-reviewed sanitizer, server validation, output encoding, and CSP.
- Source mode remains direct trusted HTML even if content originally entered through a cleaned path.

See [`security.md`](security.md).

### `getHTML(): string`

Returns `source.value` while source mode is active; otherwise returns visual `innerHTML`.

### `getText(): string`

Returns visual `innerText` (or `textContent` fallback). During active source typing, the hidden visual surface can lag until source is applied; use `getHTML()` for the authoritative active value.

### `setHTML(html): this`

Stringifies non-null input (nullish becomes empty), updates visual/source/original values, updates counters/highlighting, records a transaction, notifies change, and schedules autosave. It does not sanitize.

### `setUntrustedHTML(html): this`

Applies `sanitizeUntrustedHTML(html, { document: editor.document })`, then follows `setHTML`-equivalent state/notification behavior.

### `pasteIntoSource(sourceText): this | false`

Returns `false` when read-only/disabled. Empty input is a no-op returning the instance. Otherwise inserts at the source selection (or appends when an untouched `0,0` selection sits before existing source), updates visual/original state, commits one source transaction, notifies change, and schedules autosave. It does **not** sanitize.

### `clear(): this`

Equivalent to `setHTML("")`.

## Forms and lifecycle

### Synchronization

The original host is hidden, not replaced. User mutations synchronize its current HTML. Visual/source user input dispatches bubbling native `input` on the original control; blur dispatches bubbling `change`. API setters update its value without fabricating native input unless they represent a user-style mutation path.

Normal `FormData` and submission therefore read the hidden named textarea value.

### Form reset

If the host belongs to a form, native `reset` is observed after the browser restores the control. FeatherText reloads that reset value into both surfaces, resets history, schedules autosave, emits `reset`, and preserves current source/visual mode.

### `focus(): this`

Focuses the active surface unless disabled.

### `disable(): this` / `enable(): this`

Aliases for `setDisabled(true/false)`.

### `setDisabled(disabled): this`

Applies via `setConfig`. Disabled state blocks visual/source mutation and all toolbar/source controls, marks the wrapper `aria-disabled`, and mirrors compatible original-control `disabled`.

### `setReadOnly(readOnly): this`

Applies via `setConfig`. Read-only blocks mutation and marks surfaces appropriately. Copy, fullscreen, and switching to view source remain available; source content itself is read-only. Compatible host `readOnly` is mirrored.

These UI states are not authorization controls.

### `destroy(): this`

Idempotently:

- flushes pending history and current HTML to the host;
- emits `destroy`;
- stops autosave and removes any restore dialog;
- closes find/standard dialogs;
- cancels counters/source/tooltip/form-reset deferred work;
- removes managed listeners and plugin cleanup in reverse order;
- destroys history and theme media-query listeners;
- removes generated wrapper/UI;
- restores the host’s original display style.

The current host value is retained for submission or reinitialization.

## Runtime configuration and presentation

### `getConfig(): FeatherTextConfig`

Returns a config copy. Built-in arrays and theme/autosave objects are copied; functions, storage adapters, plugin objects/options, and arbitrary nested values can retain references.

### `setConfig(changes): this`

Computes changed keys and applies focused updates. It does not destroy/recreate the editor.

Depending on keys, it updates theme/presentation, rebuilds toolbar/status subtrees, applies dimensions/labels/source preferences, updates history settings, reconfigures autosave, reinstalls configured plugins, and reapplies interactive state.

It preserves:

- wrapper, visual editor, and source textarea node identity;
- content;
- source/fullscreen mode;
- transaction history;
- relevant focus and captured selection.

A toolbar/status descendant reference can become stale when that subtree is intentionally rebuilt. Unknown/custom config keys are stored and reported in `configchange` but receive no automatic core behavior.

### Focused setters

```js
editor
  .setTheme("dawn")
  .setToolbar(["bold", "italic", "source"])
  .setPlaceholder("Write something")
  .setHeight(360)
  .setFancy(true)
  .setAttribution(true, true);
```

All return the instance:

- `setTheme(theme)`;
- `setToolbar(items)`;
- `setPlaceholder(text)`;
- `setHeight(value)`;
- `setFancy(enabled)`;
- `setAttribution(attribution, supportLink = currentValue)`.

## Modes and history

### `toggleSource(): this`

Calls `setSourceMode(!isSource)`.

### `setSourceMode(enabled, options?): this`

Options are `{ focus?: boolean, history?: boolean }`.

Entering source mode copies visual HTML to source, switches visibility, applies preferences, and renders gutter/highlighting. Leaving applies raw source directly to visual HTML, synchronizes the host/counters, and commits `source:apply` unless `history: false`.

Mode changes schedule autosave and emit `sourcechange`. `focus: false` suppresses focus. Disabled state suppresses focus but an explicit API call can still change display mode.

### `toggleSourceSetting(setting): this`

Supported settings:

- `sourceWrapLines`;
- `sourceSmartTabs`;
- `sourceAutoClose`.

Toggles config/UI, refreshes source presentation, and emits `configchange`.

### `toggleFullscreen(): this`

Toggles the wrapper `feather-fullscreen` class and `isFullscreen`, then emits `fullscreen`. This is not the browser Fullscreen API.

### `undo(): this` / `redo(): this`

Flush pending typing, move through internal transactions where possible, restore current value/selection, synchronize state, and emit transaction/change effects.

### `pushHistory(label?)`, `updateHistory(label?)`, `flushHistory()`

Chainable lower-level transaction controls. `updateHistory` aliases `pushHistory`; `flushHistory` commits pending debounced typing if present.

## Find and replace

Ctrl/Cmd+F on either editing surface opens the local dialog.

### `openFindReplace(): this` / `closeFindReplace(): this`

Open/focus or close the instance-local labelled modal and restore focus.

### `find(term, options?): FindResult`

```ts
interface FindOptions {
  matchCase?: boolean;
  wholeWord?: boolean;
}

interface FindResult {
  term: string;
  current: number;
  total: number;
}
```

Rebuilds matches, selects the first match, updates dialog count, emits `find`, and returns state. Visual matching traverses text nodes and inserts boundaries around block/BR/noneditable regions without adding highlight elements. Source matching uses the raw source string.

### `findNext(term?, options?): FindResult`

When `term` is provided, starts a new search. Otherwise refreshes matches and moves cyclically forward.

### `findPrevious(term?, options?): FindResult`

When `term` is provided, starts at the final matching result. Otherwise refreshes and moves cyclically backward.

### `replace(replacement?)` / `replaceCurrent(replacement?): boolean`

Aliases for current-match replacement. Returns `false` when blocked or no current match. Visual replacement changes affected text nodes while retaining unaffected wrappers where possible; source replacement edits the raw string. One successful operation records a transaction and emits `replace` with `count: 1`.

### `replaceAll(term?, replacement?, options?): number`

Returns the number replaced, or `0` when blocked/no matches. Replacements are one transaction. Source-mode replacement inherits the trusted source limitation.

Finding is allowed in read-only mode; replacement is disabled in read-only/disabled state.

## Autosave methods and events

### `startAutosave(options?): this`

Starts/reconfigures draft autosave. If the supplied/default option is not enabled, it modernizes the call to `true`. It ensures status visibility when needed, resolves storage, and optionally offers restore.

### `stopAutosave(): this`

Cancels pending writes, stops scheduling, and sets state/message to disabled. It does not delete the existing draft or clear the configured autosave value; call `startAutosave()` to resume.

### `clearSavedDraft(): this`

Cancels a pending write, removes only the configured key, clears cached draft state, and emits `autosaveclear`. Storage errors are reported rather than thrown through this chainable method.

### Autosave state/events

`autosaveState` can be:

```text
disabled idle pending saving saved available restored cleared error
```

Events include:

- `autosavestate`: `{ state, message, key }`;
- `autosave`: `{ key, html, mode }`;
- `autosaverestore`: `{ key, html, mode }`;
- `autosaveclear`: `{ key }`;
- `autosaveerror`: `{ operation, error, key }`.

Storage failures also flow through the general `error` event.

## Formatting, clipboard, and commands

### `exec(name, definition?): unknown`

Runs a built-in/custom button definition and updates toolbar state. Definitions may contain:

```ts
interface ButtonDefinition {
  icon?: string;
  tip?: string;
  tooltip?: string;
  cmd?: string;
  value?: string | null;
  handler?: keyof FeatherText | string;
  exec?: (editor: FeatherText) => unknown;
}
```

Mutating commands are blocked while read-only/disabled.

### `execCommand(command, value?): boolean`

Executes through the compatibility adapter, commits/synchronizes a mutation, and returns the browser result. The adapter is the only direct core call site for deprecated editing-command APIs.

### `clearFormatting(): this | false`

Uses the `removeFormat` compatibility command; returns `false` when mutation is blocked.

### `copyAction(): Promise<this>`

Source mode writes selected/all source text to Clipboard API. Visual mode tries compatibility copy, then Clipboard API with selected/current text. Errors emit/report but the method resolves with the instance.

### `pasteAction(): Promise<this | false>`

Reads plaintext through Clipboard API, inserts into source or visual mode, and returns `false` on blocked/error. Clipboard APIs normally require a secure context, permission, and user activation.

## Insertions and tables

Direct argument overloads return `this` on success or `false` when blocked/invalid. No-argument media/table methods open a local dialog and return its promise.

### Links

```js
editor.insertLink("https://example.com", "Example");
await editor.insertLink(); // local dialog
```

Accepted link policy includes HTTP(S), `mailto:`, `tel:`, and relative URLs; bare domains are normalized to HTTPS. New links use `_blank` and `noopener noreferrer`. The dialog can edit/remove an existing selected anchor.

### Images and upload

```js
editor.insertImage("/images/photo.png", "Description");
await editor.insertImage();
await editor.uploadImage(file, "Fallback alt");
```

Image URLs allow HTTP(S) and relative paths, not `data:`. The dialog always offers alternative text and adds a file field when `imageUpload` exists.

`uploadImage` throws if no hook is configured or the hook fails/returns an unsafe URL. It preserves insertion selection across async work, toggles a loading class, and emits `imageupload` on success.

### Videos

```js
editor.insertVideo("https://www.youtube.com/watch?v=dQw4w9WgXcQ");
await editor.insertVideo();
```

Only recognized YouTube/YouTube No-Cookie and Vimeo input shapes become fixed HTTPS embed hosts. Other hosts/schemes return `false` or produce dialog validation feedback.

### Tables

```js
editor.insertTable(3, 4);
await editor.insertTable();
```

Dimensions must be integers between 1 and configured maxima. Current insertion emits a `<table><tbody>` grid followed by an empty paragraph.

Context methods require a selected table cell and return `this` or `false`:

- `addTableRow(position = "after")`;
- `deleteTableRow()`;
- `addTableColumn(position = "after")`;
- `deleteTableColumn()`;
- `deleteTable()`.

`position` can be `"before"` or `"after"`. Maxima remain enforced; removing the last row/column removes the table. Operations are synchronized and undoable.

### Code

`insertCode(): this | false` wraps/inserts selected visual text or inserts escaped `<code>` markup in source mode. It is blocked in read-only/disabled state.

## Custom buttons

### `addButton(name, definition): this`

Adds/overwrites a definition in the shared `buttons` registry, fills missing icon/tip fallbacks, appends the name to this instance’s toolbar config if absent, and rebuilds this toolbar.

Because definitions are shared, later/current instances can observe registry changes. Use unique names and deterministic registration.

### `removeButton(name): this`

Removes the first rendered matching control from this toolbar. It does not delete the shared definition or config name.

### `showButton(name): this` / `hideButton(name): this`

Changes inline display on the first rendered matching control.

## Plugins

### Registration

```js
FeatherText.registerPlugin("metrics", plugin);
FeatherText.unregisterPlugin("metrics");
```

`registerPlugin(name, plugin)` throws if either is missing and returns the class for chaining. `unregisterPlugin(name)` removes the registry entry and returns the class; existing initialized instances are not retroactively destroyed/reconfigured.

### Plugin forms

A factory:

```js
function metricsPlugin(editor, options) {
  const handler = ({ html }) => options.record(html.length);
  editor.on("change", handler);
  return () => editor.off("change", handler);
}
```

An object:

```js
const plugin = {
  name: "metrics",
  init(editor, options) {
    // initialize
    return {
      destroy(instance) {
        /* cleanup */
      },
    };
  },
  destroy(editor) {
    // fallback cleanup when init did not return cleanup
  },
};
```

### `use(pluginReference, options?): this`

Resolves a name or uses a direct factory/object. Unknown names throw. It records the plugin, emits `plugin` with `{ action: "init", name }`, and returns the instance.

Cleanup precedence is:

1. cleanup function returned by init/factory;
2. returned object’s `destroy(editor)`;
3. plugin object’s `destroy(editor)`.

Cleanup runs in reverse initialization order when `plugins` is changed via `setConfig()` and during destroy. Configured plugin init errors are reported and do not abort construction.

## Events

### Instance events

```js
const handler = ({ editor, html, label }) => {
  console.log(editor, html, label);
};

editor.on("change", handler);
editor.off("change", handler);
editor.off("change"); // remove all handlers for type
editor.emit("custom", { value: 1 });
```

- `on(type, handler)` adds a function and returns the instance.
- `off(type, handler?)` removes one handler or the complete type and returns the instance.
- `emit(type, detail?)` sends `{ editor, ...detail }`, catches handler errors, dispatches the DOM event, and returns the instance.

### DOM events

When the wrapper is connected, each emission also dispatches a bubbling `CustomEvent` named `feathertext:${type}`:

```js
editor.wrapper.addEventListener("feathertext:change", (event) => {
  console.log(event.detail.html, event.detail.editor);
});
```

### Core event inventory

| Event                                | Selected detail                     |
| ------------------------------------ | ----------------------------------- |
| `ready`                              | editor in common payload            |
| `change`                             | `html`, `label`                     |
| `focus` / `blur`                     | `mode: "editor" \| "source"`        |
| `paste`                              | `event`, `payload`                  |
| `transaction`                        | action, entry, index, length        |
| `reset`                              | `html`                              |
| `sourcechange`                       | `active`                            |
| `fullscreen`                         | `active`                            |
| `configchange`                       | `changed`, copied `config`          |
| `find`                               | `term`, `current`, `total`          |
| `replace`                            | `count`, `term`, `current`, `total` |
| `finddialogopen` / `finddialogclose` | dialog on open                      |
| `dialogopen` / `dialogclose`         | title/dialog or confirmed state     |
| `imageupload`                        | `file`, `url`, `alt`                |
| `autosavestate`                      | `state`, `message`, `key`           |
| `autosave` / `autosaverestore`       | `key`, `html`, `mode`               |
| `autosaveclear`                      | `key`                               |
| `autosaveerror`                      | `operation`, `error`, `key`         |
| `plugin`                             | `action: "init"`, `name`            |
| `error`                              | `context`, `error`                  |
| `destroy`                            | editor in common payload            |

`destroy` is emitted before the wrapper/listeners are removed. The event-handler map is cleared at the end of destroy.

## Public properties

The declarations expose selected instance state and generated elements:

```text
element wrapper toolbar editor source sourceWrap statusBar
history historyIndex id autosaveKey autosaveState
config isSource isFullscreen sourceLanguage
```

Use methods rather than mutating generated nodes/config when lifecycle synchronization matters.

- `history` is a fresh array of HTML/source values.
- `historyIndex` is the active transaction index.
- `statusBar` is `null` when counters, attribution, and autosave do not require it.
- `autosaveKey`/`autosaveState` reflect current manager configuration/state.
- `sourceLanguage` controls display highlighting only.

## Named utilities and constants

### `PROJECT_URL`

```text
https://github.com/MiszterSoul/FeatherText
```

### `SUPPORT_URL`

```text
https://buymeacoffee.com/devpeter
```

### `normalizeSafeUrl(value, options?): string | null`

Options:

```ts
{
  kind?: "link" | "image" | "video" | "external";
  allowRelative?: boolean;
  baseUrl?: string;
}
```

Trims/rejects controls and active/local schemes, then applies purpose protocols/relative policy. Returns the original trimmed representation on success or `null`.

### `isSafeUrl(value, options?): boolean`

Boolean wrapper around `normalizeSafeUrl`.

### `toSafeVideoEmbedUrl(value): string | null`

Returns only a normalized YouTube No-Cookie or Vimeo HTTPS embed URL for recognized input, otherwise `null`.

### `sanitizeUntrustedHTML(html, options?): string`

Options can provide a `document`. Without a DOM document it returns HTML-escaped text. With a document, it applies the conservative allowlist described in [`security.md`](security.md).

This function is intentionally **not a complete sanitizer**.

### `themes`, `buttons`, `iconMarkup`, `defaultConfig`, `version`

- `themes`: frozen fixed theme records (excluding dynamic `auto` resolution);
- `buttons`: shared mutable button definitions;
- `iconMarkup`: frozen/shared inline SVG strings;
- `defaultConfig`: frozen top-level defaults with frozen default arrays;
- `version`: build-defined package version, or `0.0.0-dev` when importing unbuilt source directly.

## Keyboard behavior

### Visual editor

- Ctrl/Cmd+F: FeatherText find/replace.
- Ctrl/Cmd+B/I/U: bold/italic/underline.
- Ctrl/Cmd+K: link dialog.
- Ctrl/Cmd+Z: undo; Shift+Ctrl/Cmd+Z: redo.
- Ctrl/Cmd+Y: redo.

### Source editor

- Ctrl/Cmd+F: find/replace.
- Ctrl/Cmd+Z and Shift variant: undo/redo.
- Ctrl/Cmd+Y: redo.
- Ctrl+M: select bracket pair (the helper checks Control, not Command).
- Tab/Shift+Tab: indent/outdent.
- Enter: preserve/add indentation around matching tags/brackets.
- configured quote/bracket/tag auto-closing.

### Toolbars and dialogs

- Left/Right Arrow: previous/next enabled toolbar control with wraparound.
- Home/End: first/last enabled toolbar control.
- Escape: close standard/find dialogs.
- Tab/Shift+Tab: contained within an open local dialog.

The implementation does not use browser `prompt()`.

## Browser and accessibility evidence

Current automated evidence is 18 Playwright E2E tests each on Chromium 151, Firefox 153, WebKit 26.5, Mobile Chrome profile, and Tablet WebKit profile (90 total), plus 12 full-document axe checks.

That is bounded exact-version automation, not latest-two browser certification, manual assistive-technology evidence, WCAG conformance, physical-device certification, or a Lighthouse result. See [`browser-support.md`](browser-support.md) and [`accessibility.md`](accessibility.md).

## Important constraints

- Source mode and `setHTML()` are trusted HTML paths.
- The untrusted-HTML helper is a conservative baseline, not a complete sanitizer.
- Several formatting operations still depend on deprecated browser editing commands behind one adapter.
- Clipboard APIs depend on permissions, secure context, and user activation.
- Autosave is local storage/adapter persistence, not a network save or conflict system.
- `maxLength` is partial client input handling, not authoritative validation.
- Plugin and button registries are shared extension state; plugin/custom code is trusted.
- Fullscreen is CSS class state, not the browser Fullscreen API.
- The project is pre-1.0 and package publication is not yet verified.


## Localization

Set `language: "en"` or `language: "hu"`. Hungarian locale variants such as `hu-HU` are normalized to `hu`; unsupported values fall back to English. Use `editor.setLanguage(language)` or `editor.setConfig({ language })` at runtime. Built-in toolbar labels, source controls, dialogs, find/replace, autosave states, counters, and footer tooltips are localized. Application-provided strings remain unchanged.

The footer is permanent. Word and character counts are always present. GitHub and Buy Me a Coffee are icon-only links with accessible names and hover tooltips; legacy footer configuration cannot hide or redirect them.
