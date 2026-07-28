# Migration within the 0.3 series

## Status

This guide describes the current `0.3` repository implementation. `package.json`, the root package metadata in `package-lock.json`, and `.release-please-manifest.json` declare `0.3.2`.

Repository metadata is not publication evidence. The source is configured for `@misztersoul/feathertext`; verify an exact registry version and its release notes before consumer migration. This guide records implementation differences within the current 0.3 line.

## Current implementation changes to account for

| Area                 | Older/stale assumption                                     | Current repository implementation                                                                                      | Migration action                                                             |
| -------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Themes               | Tokens mutate `document.documentElement`; last editor wins | Attributes/tokens are scoped to each wrapper; instances can use independent themes                                     | Remove host-root workarounds; target `.feather`/theme tokens intentionally   |
| `setConfig()`        | Destroys/rebuilds the editor and loses state               | Applies focused diffs; wrapper/editor/source nodes, content, modes, history, and focus are preserved                   | Use `setConfig()`/focused setters; retest toolbar/status subtree assumptions |
| Prompts              | Link/media/table actions use browser prompts               | Labelled local dialogs handle link, image, video, table, draft restore, and find/replace                               | Remove `window.prompt` stubs; update dialog/focus tests                      |
| Paste callback       | Variable arguments or duplicate fallback calls             | One `(event, payload, editor)` shape                                                                                   | Remove rest-argument compatibility adapters                                  |
| HTML paste           | HTML may be inserted directly                              | HTML clipboard/filter payloads pass through the conservative baseline                                                  | Expect unsupported elements/styles/attributes to be removed                  |
| Untrusted HTML       | No built-in helper                                         | `setUntrustedHTML()` and `sanitizeUntrustedHTML()` apply a limited allowlist                                           | Use only as a baseline; keep authoritative application sanitization          |
| Source mode          | Often described alongside sanitizer behavior               | Explicit trusted-author path; raw source applies directly to HTML                                                      | Restrict source access/content and preserve server sanitization              |
| URLs                 | No central scheme policy                                   | Link/image/video/upload/attribution paths use purpose-specific checks                                                  | Handle false/rejected results and add product host policies                  |
| Autosave             | Timer only repeats textarea synchronization                | Opt-in local draft persistence with storage adapter, key, debounce, mode, restore dialog, events, and clear/start/stop | Choose stable keys, privacy/retention policy, and failure UX                 |
| `maxLength`          | Declared but unused                                        | Blocks some overflowing visual `beforeinput` text insertion                                                            | Still enforce server/API/source/IME limits; test intended unit               |
| Find/replace         | Absent                                                     | Visual/source dialog and API with case/whole-word, navigation, replace, replace-all                                    | Reserve Ctrl/Cmd+F behavior and integrate events/read-only rules             |
| Plugins/events       | No extension lifecycle                                     | Named/direct plugins, cleanup, instance events, and bubbling DOM events                                                | Prefer lifecycle cleanup over unmanaged global listeners                     |
| Image upload         | No adapter                                                 | Optional `imageUpload(file, editor)` hook with validated returned URL                                                  | Implement authorization/validation/storage outside FeatherText               |
| Forms/state          | Basic value copying                                        | Input/change sync, `FormData`, reset/history restoration, inherited/mirrored read-only/disabled                        | Remove duplicate sync timers and test reset/state semantics                  |
| Footer identity      | Attribution could be hidden or redirected                  | Counters and canonical GitHub/Buy Me a Coffee icon links are permanent; labels appear through accessibility text and hover tooltips | Remove hide/redirect assumptions and preserve the canonical footer           |
| Presentation         | Theme only                                                 | `fancy` and `themeTransitions` are opt-in wrapper classes                                                              | Respect reduced motion and retest custom CSS                                 |
| Localization         | English-only built-in UI                                   | `language: "en" | "hu"` and `setLanguage()` localize built-in controls, dialogs, counters, and status text           | Select a language in configuration and preserve application-provided strings |
| Types                | Incomplete/absent                                          | `index.d.ts` declares configuration, localization, APIs, plugins, autosave, find, security, and exports                | Remove local ambient shims and compile against package types                 |
| Browser/a11y harness | Absent                                                     | 74 Node/JSDOM tests, 90 Playwright E2E executions, and 12 axe checks                                                   | Cite exact evidence only; do not claim latest-two/manual AT/Lighthouse       |

## Pre-migration inventory

Before replacing assets, record:

- pinned commit/version and hashes;
- global, ESM, or CommonJS entry point;
- CSS and script paths loaded together;
- complete config, callbacks, custom toolbar definitions, and direct exports used;
- any `documentElement` theme CSS/workarounds;
- any `window.prompt` interception or prompt-dependent automation;
- assumptions about `onPaste`, HTML paste preservation, `setConfig()`, autosave, and `maxLength`;
- custom `buttons` registry and plugin/global listener behavior;
- original textarea/form/reset/read-only/disabled handling;
- HTML sanitizer, source-mode access, URL/host, upload, CSP, and local-storage policies;
- browser and assistive-technology requirements;
- persisted HTML and draft fixtures.

Keep rollback copies of the old JavaScript and CSS together.

## Themes and multiple instances

Theme data now belongs to each `.feather` wrapper:

```js
const [primary, secondary] = FeatherText.init("textarea[data-editor]");
primary.setTheme("ocean");
secondary.setTheme("dawn");
```

Do not read the active editor theme from `document.documentElement`. Read `editor.wrapper.dataset.theme` or application state. Remove global `--feather-*` overrides that assumed runtime tokens were written to the root; scope intended overrides to a wrapper/container.

Custom token objects support `bg`, `panel`, `border`, `accent`, `text`, `muted`, `hover`, and `shadow`. `auto` can select `high-contrast` in forced/increased-contrast environments.

## Runtime reconfiguration

The old destroy/recreate workaround is no longer required for supported config changes:

```js
const wrapper = editor.wrapper;
const surface = editor.editor;

editor.setConfig({
  theme: "light",
  toolbar: ["bold", "italic", "source"],
  fancy: true,
  wordCount: false,
});

console.assert(editor.wrapper === wrapper);
console.assert(editor.editor === surface);
```

Toolbar and status subtrees can be rebuilt when their options change, so do not retain direct references/listeners to generated toolbar/status descendants. Use plugins, editor events, or re-query after configuration changes. `startInSource` remains construction-only; call `setSourceMode()` at runtime.

## Paste callback migration

Use the current stable callback shape:

```js
function onPaste(event, payload, editor) {
  console.log(payload.text, payload.html, payload.files, editor);
}
```

Remove adapters that guessed whether the second argument was an editor. Keep callback code idempotent for application reasons, but the core callback is no longer intentionally duplicated.

If your integration expected arbitrary HTML paste to survive, add fixtures. HTML mode now uses the conservative allowlist, which removes styles/classes/ids, active/unsupported elements, event handlers, unsafe URLs, and many attributes.

## Trusted and untrusted HTML migration

```js
editor.setHTML(trustedTemplateHTML);
editor.setUntrustedHTML(userSuppliedHTML);
```

`setHTML()` remains trusted and direct. The initial textarea value is also loaded through that trusted path.

`setUntrustedHTML()` is deliberately conservative and incomplete. Keep a maintained authoritative sanitizer at the application/server boundary.

**Source mode remains trusted.** Leaving source mode assigns raw source directly to the visual editor; `pasteIntoSource()` and source find/replace do not invoke the baseline. Do not migrate untrusted content into source mode under the assumption that the new helper protects it.

## Autosave migration

Boolean/numeric legacy forms still work, but new integrations should use structured options:

```js
const editor = new FeatherText("#editor", {
  autosave: {
    enabled: true,
    key: "article:42:draft",
    debounce: 750,
    restore: true,
    // storage: customStorage,
  },
});
```

Migration decisions:

- provide a stable key if drafts should survive reconstruction/reload;
- namespace keys by application, tenant/user, record, and environment without exposing secrets;
- decide whether local persistence is permitted on shared devices;
- define clear/retention behavior;
- surface `autosaveerror` and unavailable storage;
- remember that draft HTML/mode retains the editor’s trust classification and is not encrypted/sanitized on restore.

Remove separate timers that only copied the editor value into the original textarea; normal mutations already synchronize it.

## Find/replace and keyboard behavior

Ctrl/Cmd+F is handled by the editor/source surface and opens FeatherText’s local find/replace dialog. If the host application previously expected browser-page Find while focus was inside the editor, decide whether to preserve the new behavior or provide an application affordance outside the editor.

Replacement is blocked in read-only/disabled state. Source replacement edits raw HTML and therefore follows the source trust boundary.

## Plugins, events, and custom buttons

Prefer a plugin cleanup contract:

```js
FeatherText.registerPlugin("audit", (editor, options) => {
  const handler = ({ html }) => options.record(html);
  editor.on("change", handler);
  return () => editor.off("change", handler);
});
```

Plugins are reinstalled when the `plugins` config changes and cleaned up in reverse order on destroy. Audit older integrations for unmanaged document/window listeners.

The exported `buttons` registry and `addButton()` definitions remain shared module-level state. Use unique names and register deterministically before dependent instances.

## Attribution/support migration

Defaults are:

```js
{
  attribution: true,
  supportLink: true,
  projectUrl: "https://github.com/MiszterSoul/FeatherText",
  supportUrl: "https://buymeacoffee.com/devpeter"
}
```

External links are accepted only for safe absolute HTTP(S) URLs and are created with `target="_blank"` plus `rel="noopener noreferrer"`. `supportLink` is nested under attribution visibility: when `attribution` is false, neither link is rendered.

## Type migration

Use the package declarations instead of maintaining duplicate config/method interfaces:

```ts
import FeatherText, {
  type FeatherTextConfig,
  type FeatherTextPlugin,
} from "feathertext";

const config: FeatherTextConfig = {
  theme: "auto",
  fancy: true,
  autosave: { enabled: true, key: "draft:article", debounce: 500 },
};

const plugin: FeatherTextPlugin = {
  name: "example",
  init(editor) {
    return () => editor.clearSavedDraft();
  },
};
```

Compile against the exact candidate package because the project is still pre-1.0.

## Validation before adopting a candidate

1. Install or stage an exact build in a clean fixture.
2. Verify ESM, CommonJS, browser-global, CSS, and declaration entry points actually shipped.
3. Run application fixtures through trusted `setHTML()`, `setUntrustedHTML()`, paste, source, and autosave restore paths.
4. Test multiple independent themes and remove root mutation assumptions.
5. Reconfigure toolbar/status/theme/state while checking node references, focus, modes, history, and plugins.
6. Submit/reset real forms and test native framework listeners.
7. Exercise URLs, uploads, tables, find/replace, clipboard denial, storage denial/quota, and destroy.
8. Run exact target browser/device and manual accessibility protocols; do not substitute the repository matrix for product requirements.
9. Update JavaScript and CSS together and retain rollback artifacts.

## Release-note completion gate

Before the first published `0.3.x` release:

- [ ] Confirm every behavior above against the tagged source, tests, declarations, and package tarball.
- [ ] Add exact breaking/deprecation notes and before/after examples.
- [ ] Record registry provenance, hashes, and clean-install smoke tests.
- [ ] Record exact browser automation and any manual browser/assistive-technology evidence.
- [ ] State explicitly that no manual AT or Lighthouse result exists if still unrun.
- [ ] Update README, API, security, architecture, browser/accessibility docs, examples, site, changelog, and other launch/release material.
- [ ] Keep historical baseline documents historical rather than rewriting their old measurements.

Bug reports: <https://github.com/MiszterSoul/FeatherText/issues>

Support development: <https://buymeacoffee.com/devpeter>
