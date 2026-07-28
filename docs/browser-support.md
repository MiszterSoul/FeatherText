# Browser support policy

## Current automated evidence

The repository has an executed Playwright harness. Its current E2E inventory is **18 tests each on Chromium 151, Firefox 153, WebKit 26.5, Mobile Chrome profile, and Tablet WebKit profile (90 total), plus 12 axe checks**.

| Playwright project | Engine/profile evidence                                   | E2E executions |
| ------------------ | --------------------------------------------------------- | -------------: |
| `chromium`         | Chromium 151                                              |             18 |
| `firefox`          | Firefox 153                                               |             18 |
| `webkit`           | WebKit 26.5                                               |             18 |
| `mobile`           | Mobile Chrome / Pixel 5 device profile on Chromium 151    |             18 |
| `tablet`           | Tablet WebKit / iPad Pro 11 device profile on WebKit 26.5 |             18 |
| **Total**          | Five configured projects                                  |         **90** |

The separate accessibility command runs six full-document axe scenarios under `chromium` and the Mobile Chrome profile, for **12 axe checks**. See [`accessibility.md`](accessibility.md) for their scope.

This table is exact-version automated evidence. It is **not**:

- certification of the latest two releases of any browser;
- an independent Microsoft Edge run;
- a physical Android, iPhone, or iPad run;
- a manual editing/exploratory compatibility matrix;
- a screen-reader, voice-control, or other assistive-technology result;
- a Lighthouse result or performance claim.

## Automated scenario scope

The 18 E2E cases cover:

- generated site and browser-global package initialization;
- original-textarea synchronization, `FormData`, input events, and native form reset;
- multiple independently themed editors without `documentElement` mutation;
- URL rejection and conservative untrusted-HTML handling;
- labelled local link/image/table dialogs and the absence of browser prompts;
- project/support attribution links and runtime toggles;
- focused `setConfig()` preservation of content, surface identity, source/fullscreen mode, focus, and history;
- typing history/undo/redo branching;
- encoded and large source-buffer preservation;
- read-only and disabled interaction blocking;
- asynchronous image-upload adapter behavior;
- bounded table insertion;
- destroy/reinitialize lifecycle and value retention;
- toolbar Arrow/Home/End navigation;
- generated-site horizontal overflow at 320px;
- reduced-motion initialization;
- RTL Arabic and emoji visual/source round trips.

Passing these scenarios does not imply every formatting command, clipboard permission state, IME, selection shape, content fixture, zoom level, OS accessibility setting, or browser policy was exercised.

## Platform requirements

The build target is ES2020. Runtime behavior also depends on:

- `contenteditable`;
- Selection and Range APIs;
- deprecated `document.execCommand()` and `document.queryCommandState()` behind the compatibility adapter;
- templates, `innerHTML`, `CustomEvent`, `classList`, `closest`, and form-control APIs;
- Clipboard API where available;
- `matchMedia` for color scheme/contrast automation;
- `requestAnimationFrame` with a timer fallback;
- `localStorage` or an application storage adapter when autosave is enabled;
- CSS custom properties, masks, `:focus-visible`, sticky positioning, and `color-mix()`.

Optional visual CSS can degrade without data loss, but editing-command differences remain important because `execCommand()` is deprecated and browser-defined.

## Support language

A release may cite the exact automated matrix that actually ran. It must not collapse that evidence into “all modern browsers,” “latest two versions,” or “mobile certified.”

Before promising a browser/version to downstream users:

1. pin the release candidate and exact generated assets;
2. run the complete automated suite on exact engines/profiles;
3. manually exercise the product’s required editing/clipboard/form/source workflows on actual target browsers and operating systems;
4. test physical devices where mobile/tablet support is promised;
5. complete the accessibility protocol with named assistive technologies;
6. document limitations and retest after browser or editor changes.

## Recommended manual matrix

For every browser/device combination an application intends to support, verify:

1. initialize one and multiple textarea-backed editors;
2. type/select/format, create links/lists/media/tables, and undo/redo;
3. use keyboard shortcuts and toolbar keyboard navigation;
4. paste text, HTML, and files under applicable permissions/modes;
5. enter, edit, find/replace, and leave source mode with encoded and untrusted fixtures;
6. switch fixed, custom, and automatic themes without affecting host-page root styles;
7. update configuration without losing content, focus, modes, or history;
8. submit and reset forms; inherit/toggle read-only and disabled state;
9. save, restore, clear, and fail local drafts with a stable key/storage policy;
10. destroy/reinitialize without leaked UI/listeners or value loss;
11. test 200%/400% zoom, reflow, virtual keyboard, forced colors, contrast, and reduced motion;
12. test clipboard denial, offline behavior, storage denial/quota, and restrictive CSP;
13. run the required screen-reader/voice-control workflows from [`accessibility.md`](accessibility.md).

## Decision rules

- Data loss, value/form divergence, focus traps, inaccessible controls, unsafe active-content acceptance, or broken read-only/disabled behavior are release blockers.
- A passing engine profile is evidence for that engine/profile and commit, not every branded browser/device that shares it.
- Automated checks complement rather than replace manual browser and assistive-technology work.
- “Best effort” limitations should name the exact environment, behavior, and workaround.

## Reporting compatibility bugs

Open a [GitHub issue](https://github.com/MiszterSoul/FeatherText/issues) and include:

- FeatherText version/commit and asset entry point;
- full browser/engine version and OS/device;
- whether the environment is physical, emulated, or a Playwright profile;
- minimal HTML/configuration/content fixture;
- exact steps, expected result, and actual result;
- permission, CSP, extension, translation, and enterprise-policy state;
- a reduced recording only when it contains no sensitive editor content.
