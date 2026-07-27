# Contributing to FeatherText

Thank you for helping improve FeatherText.

**A lightweight, free, framework-independent rich-text editor focused on speed, clarity, and practical customization.**

FeatherText is pre-1.0, so focused changes, regression coverage, and explicit compatibility/security notes are especially valuable.

## Before opening work

- Search [existing issues](https://github.com/MiszterSoul/FeatherText/issues).
- Use GitHub issues for reproducible bugs and concrete feature proposals.
- Do **not** disclose vulnerabilities in a public issue; follow [`SECURITY.md`](SECURITY.md).
- Keep pull requests narrow. Separate behavior, generated artifacts, documentation, and repository maintenance when that makes review safer.
- Avoid adding runtime dependencies without a clear need and an explicit size/security review.

If you want to support ongoing development rather than report a bug, use <https://buymeacoffee.com/devpeter>.

## Development setup

`package.json` requires Node `>=20.19.0`. Development is driven by the checked-in package scripts; the removed `.tools/` and `.vscode/` directories are not part of setup. Install dependencies from the lockfile, then run the narrowest checks relevant to your change:

```bash
npm ci
npm run check:core
```

For the complete automated suite:

```bash
npm run check
```

Playwright may need its browser engines and system dependencies installed first:

```bash
npx playwright install --with-deps chromium firefox webkit
```

To preview the framework-free site and examples:

```bash
npm run build
npm run dev
```

Then open `http://127.0.0.1:5173/site/` or a page under `http://127.0.0.1:5173/examples/`.

## Test layers

| Command                 | Scope                                                              |
| ----------------------- | ------------------------------------------------------------------ |
| `npm run lint`          | ESLint across the repository                                       |
| `npm test`              | Node/JSDOM unit and regression suites in `test/`                   |
| `npm run build`         | Distribution artifacts                                             |
| `npm run size`          | Package size budgets                                               |
| `npm run package:check` | Package/export smoke checks                                        |
| `npm run test:e2e`      | Playwright E2E suite across all configured projects                |
| `npm run test:a11y`     | Full-document axe checks on Chromium and the Mobile Chrome profile |
| `npm run check:core`    | lint, unit tests, build, size, and package checks                  |
| `npm run check`         | core checks, E2E, and accessibility automation                     |

The current unit inventory contains 70 Node/JSDOM tests. The Playwright inventory contains 17 E2E tests on each of Chromium 151, Firefox 153, WebKit 26.5, Mobile Chrome profile, and Tablet WebKit profile: 85 total. The accessibility inventory adds 12 axe checks. Treat those as exact automated evidence, not a permanent count or broad certification.

## Expectations by change type

### Source behavior

1. Add or update the narrowest Node/JSDOM regression.
2. Add or update Playwright coverage when behavior depends on layout, focus, browser editing, forms, generated package assets, or responsive state.
3. Run the relevant focused checks, then broader checks as practical.
4. Report exact commands and outcomes. Do not say a check passed unless it ran.

### Accessibility

- Preserve native elements, labels, focus order, visible focus, dialog focus restoration, keyboard access, and live/status messaging.
- Run the relevant axe checks, but do not treat an axe pass as WCAG conformance.
- When manual assistive-technology work is performed, report the exact OS, browser, assistive technology and version, input method, viewport, task, and outcome.
- If no manual assistive-technology test was run, say so explicitly.

### Browser compatibility

- Record exact engine/browser versions and configured device profiles.
- Do not convert one Playwright engine run into “all Chrome/Safari/mobile versions are supported.”
- Formatting still crosses a quarantined `document.execCommand()` compatibility adapter, so selection and editing changes deserve browser-level regression coverage.

### Security-sensitive changes

Review all affected trust paths:

- initial form-control content and `setHTML()`;
- `setUntrustedHTML()` and `sanitizeUntrustedHTML()`;
- source mode and `pasteIntoSource()`;
- HTML/text paste and `pasteFilter`;
- link, image, video, upload-result, project, and support URLs;
- autosave storage/restore;
- plugin and custom-button code.

Keep the source-mode limitation explicit: source text is applied directly as HTML and must be treated as trusted input.

## Documentation standards

- Distinguish **implemented**, **automatically tested**, **manually tested**, **planned**, and **not measured**.
- Keep browser evidence tied to exact versions; never imply latest-two certification from the current matrix.
- Do not claim manual assistive-technology, WCAG, Lighthouse, physical-device, or performance results unless reproducible evidence exists.
- Describe `sanitizePaste` accurately: in `pasteMode: "auto"` it selects text versus HTML; HTML paste separately passes through the conservative baseline cleaner.
- Describe `sanitizeUntrustedHTML()` accurately: it is deliberately limited and not a complete sanitizer.
- Preserve the source-mode trust warning in API/security documentation.
- Keep the canonical positioning sentence exact: “A lightweight, free, framework-independent rich-text editor focused on speed, clarity, and practical customization.”
- Use <https://buymeacoffee.com/devpeter> for support/donation actions. Keep GitHub issues labelled as bug reports or feature proposals, not donations.
- Do not advertise npm/CDN installation as available until an exact package can be fetched and verified.

## Code style and architecture

Match nearby code and keep responsibilities in their existing modules. Prefer root-cause fixes over compatibility shims spread across the class. In particular:

- keep deprecated editing APIs isolated in `src/command-adapter.js`;
- keep theme state wrapper-scoped;
- preserve original-control/form synchronization and reset behavior;
- preserve focused `setConfig()` updates rather than rebuilding content-bearing surfaces;
- clean up plugin, dialog, autosave, media-query, listener, timer, and animation-frame state on destroy;
- do not weaken URL or untrusted-HTML policies silently.

## Generated files

`npm run build` writes the ignored `dist/` directory. Distribution artifacts are generated outputs: do not hand-edit or commit them, and do not mix unrelated generated changes into a pull request. State which build command ran and review the resulting package/export behavior.

`npm run build:site` stages the framework-free site and current distribution. Keep `site/` free of remote widgets, scripts, fonts, and analytics.

## Pull request checklist

- [ ] The change solves one clearly described problem.
- [ ] Relevant unit and/or browser regressions were added or updated.
- [ ] Exact validation commands and results are reported.
- [ ] Browser/manual environments are named exactly, or marked “not run.”
- [ ] Manual assistive-technology and Lighthouse status are not implied.
- [ ] Trusted versus untrusted HTML and source-mode implications were reviewed.
- [ ] Forms, multiple instances, themes, runtime reconfiguration, and cleanup were considered where relevant.
- [ ] Public API, types, docs, examples, and site copy were updated together when behavior changed.
- [ ] No unrelated generated or contributor-authored changes were overwritten.

By participating, you agree to follow [`CODE_OF_CONDUCT.md`](CODE_OF_CONDUCT.md). Contributions are accepted under the repository’s [MIT License](LICENSE).
