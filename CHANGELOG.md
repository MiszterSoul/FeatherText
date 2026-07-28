# Changelog

All notable changes are documented here. Versions follow Semantic Versioning.

## [0.4.0](https://github.com/MiszterSoul/FeatherText/compare/v0.3.2...v0.4.0) (2026-07-28)


### Features

* expand themes and stabilize embedded tooltips ([2bcaa16](https://github.com/MiszterSoul/FeatherText/commit/2bcaa164bdc645ca093dab849d52c7da39a2d36f))


### Bug Fixes

* **ci:** advance Release Please baseline to v0.3.0 ([3cbdf68](https://github.com/MiszterSoul/FeatherText/commit/3cbdf6851132a67a7ae86da06e9964034fcc6d22))
* **ci:** apply verified maintenance script from staged parts ([c7afb79](https://github.com/MiszterSoul/FeatherText/commit/c7afb79b565d3fa7f5ae35a161c46323e210c693))
* **ci:** execute staged maintenance script after syntax check ([68ed36f](https://github.com/MiszterSoul/FeatherText/commit/68ed36f20a1ca68f4adc379948480c8d999e0b04))
* **ci:** pass dependency review for release metadata PRs ([9ea30af](https://github.com/MiszterSoul/FeatherText/commit/9ea30afd0612f1b414a6ea2fffbaa66229086566))
* **ci:** preserve split string across maintenance parts ([815c489](https://github.com/MiszterSoul/FeatherText/commit/815c4890ba0958b2acae2ccc99b3ac420e5fa66b))
* **ci:** push verified non-workflow release changes ([bd6fb7a](https://github.com/MiszterSoul/FeatherText/commit/bd6fb7a6fb79b09556ec0c0bf315085f4c0e8285))
* **ci:** repair staged correction script before execution ([055ddf8](https://github.com/MiszterSoul/FeatherText/commit/055ddf8241bbd1acead6a37664787f31c56cb1e9))
* **ci:** rerun maintenance with autosave footer coverage ([fff4359](https://github.com/MiszterSoul/FeatherText/commit/fff4359b2464a805e0074619dba76fab96065fcb))
* **ci:** retire Release Please bootstrap boundary ([06b897f](https://github.com/MiszterSoul/FeatherText/commit/06b897f147f367390e1cb3317377bff85611e329))
* **ci:** retry verified security release maintenance ([e1dbe90](https://github.com/MiszterSoul/FeatherText/commit/e1dbe90f767193951d59da127922868b50216eac))
* **ci:** run corrected security release maintenance ([1196673](https://github.com/MiszterSoul/FeatherText/commit/11966739d4027099bb7326e00d102a16da4e435f))
* **ci:** run v3 failure diagnostic ([db15569](https://github.com/MiszterSoul/FeatherText/commit/db1556999c02ca70d6cadcce051e80daf83b63fb))
* prepare FeatherText 0.3.2 ([1143186](https://github.com/MiszterSoul/FeatherText/commit/1143186ecb363d63b0acfa21078c4ab650a3e824))
* **release:** configure annotated tag identity ([764e48c](https://github.com/MiszterSoul/FeatherText/commit/764e48c7fd2c70f369a0c23a6474c54326e0725f))
* **release:** publish scoped package to npm ([0ee3ebd](https://github.com/MiszterSoul/FeatherText/commit/0ee3ebd4c358bf5013782a825a3ba002ce79e868))
* **release:** tag workflow-free release target ([f6ec66e](https://github.com/MiszterSoul/FeatherText/commit/f6ec66e5a302a759a96bb539c67079309eeeabbb))
* **test:** keep permanent footer assertion in autosave coverage ([c7c5875](https://github.com/MiszterSoul/FeatherText/commit/c7c5875824c678d4221558eb423c01f64bd302c2))

## [0.3.2](https://github.com/MiszterSoul/FeatherText/compare/v0.3.1...v0.3.2) - 2026-07-28

### Added

- Hungarian interface language selectable with `language: "hu"` and `setLanguage("hu")`.
- English and Hungarian labels for toolbar controls, source controls, dialogs, find/replace, autosave state, counters, and footer links.

### Fixed

- Prevented tooltip mouseout handling from dereferencing a null target.
- Changed footer attribution links to icon-only controls with accessible labels and hover tooltips.
- Restored the correct patch-version sequence after `0.3.1`.
- Kept README release references synchronized through Release Please markers.

### Security

- Retained the conservative untrusted-HTML path and the previously applied CodeQL remediations.

## [0.3.1](https://github.com/MiszterSoul/FeatherText/compare/v0.3.0...v0.3.1) (2026-07-28)

### Bug Fixes

- **ci:** advance Release Please baseline to v0.3.0 ([3cbdf68](https://github.com/MiszterSoul/FeatherText/commit/3cbdf6851132a67a7ae86da06e9964034fcc6d22))
- **ci:** pass dependency review for release metadata PRs ([9ea30af](https://github.com/MiszterSoul/FeatherText/commit/9ea30afd0612f1b414a6ea2fffbaa66229086566))
- **ci:** retire Release Please bootstrap boundary ([06b897f](https://github.com/MiszterSoul/FeatherText/commit/06b897f147f367390e1cb3317377bff85611e329))

## [0.3.0](https://github.com/MiszterSoul/FeatherText/compare/v0.2.0...v0.3.0) (2026-07-27)

### Features

- Modernize editor and release pipeline ([5d1b311](https://github.com/MiszterSoul/FeatherText/commit/5d1b311489d1c7a0c5eaf1c6b723e9e7f12c3cb5))

### Bug Fixes

- **ci:** Bootstrap Release Please from v0.2.0 baseline ([054e896](https://github.com/MiszterSoul/FeatherText/commit/054e896064ecdd3d4b9767c1c39556959ca53522))
- **ci:** Skip dependency review for release metadata PRs ([e90967a](https://github.com/MiszterSoul/FeatherText/commit/e90967a04d0b454e2c1620ab400cf1731f89f6ec))


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
