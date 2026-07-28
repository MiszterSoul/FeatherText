# Factual editor comparison

Snapshot date: **2026-07-28**. This page compares documented architecture, setup, extension model, and license using project-controlled sources. It does not rank products or infer quality from popularity.

Licenses, product terms, versions, and hosted offerings can change. Verify the exact artifact and terms you intend to ship, with legal review where appropriate.

## FeatherText positioning

**A lightweight, free, framework-independent rich-text editor focused on speed, clarity, and practical customization.**

That positioning describes project intent, not a measured claim that FeatherText is the smallest, fastest, safest, or most accessible option.

## Documented facts

| Project                                   | Documented architecture and UI                                                                                                                                               | Framework-free / plain JavaScript path                                                   | Documented extension/customization model                                                                                                                   | Open-source license statement                                                                                 | Authoritative sources                                                                                                                                                                                                       |
| ----------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| FeatherText (`0.3.2` repository metadata) | Direct DOM/HTML textarea enhancement with generated toolbar, visual/source surfaces, local dialogs, status, and form synchronization                                         | Yes; browser-global IIFE plus generated ESM/CJS and CSS                                  | Typed config, wrapper-scoped fixed/auto/custom themes, focused runtime config, custom buttons, plugins/events, paste/upload/storage adapters, find/replace | MIT (`LICENSE`)                                                                                               | Local [`src/`](../src), [`index.d.ts`](../index.d.ts), [`package.json`](../package.json), [`LICENSE`](../LICENSE), audited 2026-07-28                                                                                       |
| Quill (official docs show v2.0.3)         | Editor core augmented by modules; Parchment represents content/formats; Snow and Bubble themes provide UI                                                                    | Yes; official quickstart uses CSS, a container, and a script                             | Configuration, themes/CSS, modules, registries/Parchment                                                                                                   | BSD, described by official docs as permissive                                                                 | [Quickstart](https://quilljs.com/docs/quickstart), [Customization](https://quilljs.com/docs/customization), accessed 2026-07-27                                                                                             |
| TinyMCE (current docs v8)                 | Ready-made HTML editor; official examples initialize a textarea and generate HTML; UI/functionality are plugin/config driven                                                 | Yes; cloud, package-manager/self-hosted, and ZIP/direct-download paths are documented    | Plugins, configuration, UI customization, exposed APIs                                                                                                     | Official repository states GPL version 2 or later; commercial/cloud offerings and support have separate terms | [Introduction](https://www.tiny.cloud/docs/tinymce/latest/introduction-to-tinymce/), [official repository](https://github.com/tinymce/tinymce), accessed 2026-07-27                                                         |
| CKEditor 5                                | Editing framework with MVC architecture, custom data model, conversion, and virtual DOM; provides ready editor types/builders                                                | Yes; official docs include Vanilla JS through CDN, npm/ZIP, and builder paths            | Plugins, model/schema/conversion, commands, UI framework                                                                                                   | Dual-licensed under GPL 2+ or commercial terms; premium/LTS terms vary                                        | [Getting started](https://ckeditor.com/docs/ckeditor5/latest/getting-started/index.html), [license terms](https://ckeditor.com/docs/ckeditor5/latest/getting-started/licensing/license-and-legal.html), accessed 2026-07-27 |
| Tiptap (official docs show 3.x)           | Headless, framework-agnostic editor built on ProseMirror; no required bundled UI                                                                                             | Yes; official docs list plain JavaScript alongside framework integrations                | Extensions, nodes, commands, events; optional templates/components and paid extensions/services                                                            | Open-source editor is MIT; official docs describe paid Pro/Cloud offerings                                    | [Editor overview](https://tiptap.dev/docs/editor/getting-started/overview), [official repository](https://github.com/ueberdosis/tiptap), accessed 2026-07-27                                                                |
| Lexical                                   | Extensible editor framework attached to `contentEditable`, with immutable serializable EditorState, commands, transforms, and DOM reconciliation; core is framework-agnostic | Yes at core level; a complete UI is application-built or assembled from bindings/plugins | Nodes, plugins, commands, transforms, listeners, framework bindings                                                                                        | MIT                                                                                                           | [Introduction](https://lexical.dev/docs/intro), [official repository](https://github.com/facebook/lexical), accessed 2026-07-27                                                                                             |

Only FeatherText’s local repository was inspected directly for this document. Other entries summarize their official documentation and were not independently tested.

## FeatherText evidence available

Current local evidence includes:

- 74 Node/JSDOM unit/regression tests;
- 18 Playwright E2E cases each on Chromium 151, Firefox 153, WebKit 26.5, Mobile Chrome profile, and Tablet WebKit profile (90 executions);
- 12 full-document axe checks across Chromium and the Mobile Chrome profile;
- current artifact measurements of 27.90 KiB JavaScript gzip and 4.57 KiB CSS gzip;
- a validated 159,373-byte npm tarball containing exactly 11 files;
- historical FeatherText-only size/JSDOM measurements in [`baseline.md`](baseline.md) and [`performance.md`](performance.md).

The Playwright/axe evidence is useful for FeatherText’s tested paths. It does not certify latest-two browsers, manual assistive technology, WCAG, Lighthouse, physical devices, or competitor equivalence.

## Measurement availability

No matched benchmark or usability/security/accessibility protocol was run across these projects.

| Question                                                    | Available evidence                                                                                                                                                                                      |
| ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Which bundle is smallest for the same required feature set? | **Unavailable.** No identical version/build/minification/compression/feature configuration was measured.                                                                                                |
| Which initializes, types, or formats fastest in browsers?   | **Unavailable comparatively.** Current FeatherText E2E tests are functional, not a matched competitor performance benchmark; historical local JSDOM timings are not browser results.                    |
| Which handles large documents best?                         | **Unavailable comparatively.** No shared corpus, device, operation script, memory trace, or failure threshold was measured.                                                                             |
| Which has the best Lighthouse score?                        | **Unavailable.** No current FeatherText Lighthouse result or common cross-project site/app run exists.                                                                                                  |
| Which is most accessible?                                   | **Unavailable as a ranking.** FeatherText has axe automation but no completed manual AT/WCAG protocol, and competitors were not run through the same tasks.                                             |
| Which browser support is best?                              | **Unavailable as a common result.** FeatherText has exact automated engine/profile evidence, not latest-two/manual certification; competitor matrices were not independently reproduced.                |
| Which is safest with untrusted HTML?                        | **Unavailable as a ranking.** Sanitizer, source mode, URL, upload, storage, plugin, CSP, and rendering boundaries differ. FeatherText’s baseline is deliberately incomplete and source mode is trusted. |
| Which is cheapest to operate?                               | **Unavailable.** Integration, support, hosting, premium features, staffing, and license obligations were not modeled.                                                                                   |

Vendor-reported sizes, downloads, stars, customer counts, and marketing superlatives are intentionally omitted because they are volatile and not apples-to-apples product measurements.

## Structural differences without ranking

- FeatherText, Quill themes, TinyMCE, and CKEditor document ready-to-use editing UI paths.
- Tiptap and Lexical document framework/core approaches in which teams compose more UI and behavior.
- FeatherText and TinyMCE center HTML interchange; Quill, CKEditor, Tiptap/ProseMirror, and Lexical document richer internal state/model abstractions.
- FeatherText deliberately uses browser editing commands behind a compatibility adapter for several operations; model-driven editors make different complexity/consistency tradeoffs.
- FeatherText has no runtime dependencies and a small direct API, but that alone does not establish lower total integration or maintenance cost.
- FeatherText provides a conservative untrusted-HTML helper, URL policies, and trusted source mode; these must be evaluated as one application boundary rather than advertised as complete sanitization.
- TinyMCE and CKEditor document commercial products/services alongside open-source licenses. Tiptap documents optional paid Pro/Cloud features. Verify each exact version and use case.

## How to run a defensible evaluation

1. Freeze exact editor/package versions, license terms, and hosted-service assumptions.
2. Define one required feature set, toolbar, content schema/output, trust model, and fixture corpus.
3. Implement equivalent form, upload, storage, sanitization, error, and accessibility behavior—not only a blank editor.
4. Build production artifacts with each project’s documented method.
5. Record raw/gzip/Brotli sizes using identical tooling and clearly state included features/assets.
6. Test the same physical desktop/mobile devices, operating systems, and exact browser versions.
7. Measure initialization, typing, formatting, paste, large-document, memory, autosave/storage, and destroy paths with preserved raw traces.
8. Run identical keyboard, screen-reader, voice-control, zoom, forced-colors, and automated accessibility tasks.
9. Threat-model the same untrusted HTML, source, URL, upload, plugin, storage, and rendering scenarios.
10. Compare implementation effort, maintenance, support, license obligations, and migration risk separately from runtime measurements.
11. Publish failures, exclusions, and unavailable data—not only best-case values.
