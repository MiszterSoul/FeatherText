# Changelog

All notable project changes should be documented here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and release versions should follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0](https://github.com/MiszterSoul/FeatherText/compare/v0.2.0...v0.3.0) (2026-07-27)


### Features

* modernize editor and release pipeline ([5d1b311](https://github.com/MiszterSoul/FeatherText/commit/5d1b311489d1c7a0c5eaf1c6b723e9e7f12c3cb5))


### Bug Fixes

* **ci:** bootstrap Release Please from v0.2.0 baseline ([054e896](https://github.com/MiszterSoul/FeatherText/commit/054e896064ecdd3d4b9767c1c39556959ca53522))
* **ci:** skip dependency review for release metadata PRs ([e90967a](https://github.com/MiszterSoul/FeatherText/commit/e90967a04d0b454e2c1620ab400cf1731f89f6ec))

## [Unreleased]

### Added

- Typed public configuration, autosave, find/replace, plugin, event, upload, theme, paste, and security utility declarations in `index.d.ts`.
- Local labelled dialogs for links, images, videos, tables, draft restoration, and find/replace; browser `prompt()` is no longer used.
- Visual/source find and replace with case/whole-word options, cyclic navigation, replace-current, replace-all, and undoable transactions.
- Opt-in local draft autosave with stable custom keys, debounce, storage adapters, restore prompts, status/events, stop/start, and clear operations.
- Minimal plugin registry/lifecycle, instance event subscriptions, and bubbling `feathertext:*` DOM events.
- `setUntrustedHTML()`, `sanitizeUntrustedHTML()`, centralized safe-URL helpers, restricted video embed normalization, secure link attributes, and validated attribution URLs.
- Application-provided asynchronous `imageUpload` hooks and bounded table insertion/editing operations.
- Theme-transition, read-only, disabled, attribution, support-link, project URL, and support URL configuration, building on the performance-first `fancy: false` behavior released in 0.2.0.
- Framework-free site and examples using local scripts, styles, SVG assets, and generated distribution files.
- Playwright E2E projects for Chromium, Firefox, WebKit, Mobile Chrome, and Tablet WebKit, plus full-document axe checks.
- Governance and detailed API, architecture, browser, accessibility, security, comparison, and migration documentation.

### Changed

- Theme attributes and `--feather-*` tokens are scoped to each editor wrapper, allowing independent simultaneous themes without mutating `document.documentElement`.
- `theme: "auto"` responds to color scheme, forced colors, and increased-contrast media queries.
- `setConfig()` now applies focused diffs while preserving wrapper/editor/source identity, content, source/fullscreen mode, history, and relevant focus/selection state.
- HTML clipboard content and HTML returned by `pasteFilter` now pass through the conservative untrusted-HTML baseline.
- `onPaste` now uses one consistent `(event, payload, editor)` callback shape.
- `maxLength` now blocks overflowing visual `beforeinput` text insertion; applications must still enforce authoritative limits elsewhere.
- Original form controls now remain synchronized with native input/change behavior, inherited read-only/disabled semantics, and native form reset/history restoration.
- History uses bounded transactions shared by visual edits, source edits, API changes, media/table operations, and find/replace.
- Public documentation and site copy now use the current implementation, exact automated evidence, and the canonical positioning: “A lightweight, free, framework-independent rich-text editor focused on speed, clarity, and practical customization.”
- Support actions now use <https://buymeacoffee.com/devpeter>; GitHub issues remain available separately for bugs and feature proposals.

### Security

- Trusted `setHTML()`/source-mode paths are documented separately from the limited `setUntrustedHTML()` baseline.
- Source mode remains an explicit trusted-author path and does not sanitize raw source when applying it to the visual editor.
- Link, image, video, upload-result, project, and support URLs use purpose-specific validation; unsafe external attribution links are omitted.

The following sections preserve verified upstream repository release history. They do not assert npm publication: the current rebased `package.json` and Release Please manifest declare `0.2.0`, while the npm `latest` endpoint returned `404 Not Found` when checked on 2026-07-27.

## [0.2.0] - 2026-07-23

### Added

- Public `fancy` configuration option with a default value of `false`.
- Runtime `setFancy(enabled)` API.
- Reduced-motion handling for fancy mode.
- Regression coverage for default-off effects, runtime toggling, configuration rebuilds, and source rendering.
- Standardized GitHub Pages documentation site with a live playground, theme selector, settings reference, examples, and release history.
- Standardized examples overview, quick-start, basic toolbar, API controls, Ocean theme, and configuration generator pages.

### Changed

- Decorative shadows, backdrop filters, transitions, press transforms, tooltip animation, and source-pane gradients are now opt-in.
- ESM, CommonJS, and global builds use the performance-first public entry point.
- Existing tests now exercise the public package entry rather than the internal core class.
- GitHub build, Pages, and release workflows run tests before building.
- The legacy `/demo/` URL redirects to the maintained playground.
- README structure, installation guidance, configuration reference, examples, and release instructions were rewritten.

### Fixed

- Encoded HTML tags now render correctly when returning from source mode.
- `setConfig()` preserves or explicitly updates fancy mode after rebuilding the editor.
- Removed the broken standalone demo implementation that initialized FeatherText against an unsupported element structure.
- Updated the test environment for Node 24's getter-only global `navigator`.

## [0.1.0] - 2026-06-18

### Added

- Initial FeatherText package and browser builds.
- Theme system, configurable toolbar, source mode, paste handling, history, counters, callbacks, and runtime API.
- Initial examples, build workflow, release workflow, and GitHub Pages deployment.
