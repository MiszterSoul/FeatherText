# Changelog

All notable changes to FeatherText are documented here.

This project follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and uses [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- Placeholder section for changes that have not been released.

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
