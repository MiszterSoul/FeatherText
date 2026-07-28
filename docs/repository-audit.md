# Repository audit

Audit date: **2026-07-28**.

## Current state

The repository is organized around the canonical tracked directories `src/`, `site/`, `examples/`, `test/`, `tests/`, `benchmark/`, `scripts/`, `docs/`, and `.github/`.

Release metadata agrees on:

- package: `@misztersoul/feathertext`;
- version: `0.3.2`;
- default branch: `main`;
- license: MIT;
- runtime dependencies: none.

The erroneous `0.4.0` release attempt, its temporary workflows, its tag, its release branch, and its release pull request were removed or closed. No open issue or pull request remained at the end of cleanup. Closed history is retained as normal GitHub history.

## Release-readiness result

The current source includes:

- a null-safe tooltip pointer handler;
- a permanent status footer with word and character counts;
- icon-only canonical GitHub and Buy Me a Coffee links with accessible labels and hover tooltips;
- English and Hungarian interface dictionaries;
- `language: "en" | "hu"` configuration and runtime `setLanguage()` support;
- updated TypeScript declarations, README, changelog, localization documentation, and regression coverage.

The complete project check passed after these changes. That check includes linting, unit tests, production builds, size checks, exact package checks, Playwright browser tests, and accessibility tests.

This audit does not claim npm publication. Registry publication must be verified independently after the publish workflow completes.

## Canonical root inventory

| Path | Purpose | Policy |
| --- | --- | --- |
| `.github/` | Workflows and community metadata | Keep only permanent reviewed workflows and templates |
| `.gitignore` | Generated/local-file policy | Keep dependencies, builds, reports, secrets, caches, and editor state ignored |
| `.release-please-manifest.json` | Release baseline | Must match package and lockfile version |
| `CHANGELOG.md` | Version history | Keep current patch sequence and release notes accurate |
| `README.md` | Package landing page | Keep install/CDN examples synchronized with the release version |
| `build.mjs` | Distribution build | Sole producer of package bundles under `dist/` |
| `docs/` | Maintainer and user documentation | Update with every public API, release, security, or workflow change |
| `examples/` | Maintained runnable examples | Keep one canonical example surface |
| `index.d.ts` | Public TypeScript contract | Keep synchronized with runtime configuration and methods |
| `package.json` | Package contract | Authoritative package name, version, exports, files, scripts, and publish settings |
| `package-lock.json` | Reproducible dependency graph | Root name/version must match `package.json` |
| `scripts/` | Project automation | Keep only maintained build/check/serve scripts |
| `site/` | GitHub Pages source | Build into ignored `_site/` |
| `src/` | Runtime source | Sole implementation source of truth |
| `test/` | Node/JSDOM tests | Fast unit and regression coverage |
| `tests/` | Browser/accessibility tests | Chromium, Firefox, WebKit, responsive, and axe coverage |

## Generated and local-only paths

The following are not source and must remain untracked:

- `node_modules/`;
- `dist/`;
- `_site/`;
- coverage and Playwright reports;
- benchmark results;
- caches and temporary files;
- logs, archives, checksums, environment files, and private keys;
- IDE, editor, and agent state.

`dist/` and `_site/` are reproducible outputs. Delete and regenerate them rather than committing them.

## Permanent workflow inventory

The release-ready workflow set is:

| Workflow | Purpose |
| --- | --- |
| `ci.yml` | Lint, unit, build, browser, accessibility, size, and package verification |
| `codeql.yml` | JavaScript/TypeScript security analysis |
| `dependency-review.yml` | Dependency-change review on pull requests |
| `pages.yml` | Build and deploy the generated documentation site |
| `publish.yml` | Verify and publish the exact public scoped package from a stable tag |
| `release-please.yml` | Manually prepare or create a reviewed stable release |

Release Please is manual by design. This prevents routine pushes from creating unwanted release branches and pull requests.

All temporary maintenance, diagnostic, cleanup, and one-off release workflows were deleted after use.

## Branch, issue, and pull-request hygiene

Release-ready policy:

- keep `main` as the only long-lived branch;
- close stale generated release pull requests;
- delete their remote branches after closure;
- close resolved diagnostic issues;
- do not delete historical closed issues or merged/closed pull-request records, because GitHub retains those records as project history;
- do not leave temporary workflow files in `.github/workflows/`.

At the completion of this audit, searches returned no open issue and no open pull request, and the stale Release Please branch no longer resolved.

## Package surface

The package exports:

- ESM: `dist/feathertext.esm.js`;
- CommonJS: `dist/feathertext.cjs`;
- browser global: `dist/feathertext.min.js`;
- CSS: `@misztersoul/feathertext/css` and the documented CSS subpaths;
- TypeScript declarations: `index.d.ts`.

The exact npm file allowlist contains generated distribution files plus `index.d.ts`, `README.md`, `CHANGELOG.md`, and `LICENSE`.

## Ongoing checks

Before every release:

```bash
npm ci
npm run check
npm run package:check
npm pack --dry-run
```

Also confirm that package, lockfile, manifest, README markers, changelog, tag, and intended npm version all agree. A failed or incorrect release must be corrected with a new verified patch version rather than by moving an already published version.
