# Releasing FeatherText

This runbook applies to the current `0.3.x` release line.

Current source metadata:

- package: `@misztersoul/feathertext`;
- version: `0.3.2`;
- public access: enabled in `publishConfig`;
- canonical branch: `main`;
- release tags: stable `vX.Y.Z` tags only.

Repository metadata is not proof of npm publication. Verify the registry after every publish.

## Version policy

FeatherText follows Semantic Versioning while it is pre-1.0:

- patch: fixes and compatible improvements, for example `0.3.1` → `0.3.2`;
- minor: intentional compatible feature line, for example `0.3.x` → `0.4.0`;
- major: reserved for the stable `1.0.0` contract or later breaking releases.

Do not skip from `0.3.1` to `0.4.0` for a patch release. The package version, lockfile root metadata, Release Please manifest, changelog entry, README version marker, tag, and npm version must agree.

## Required verification

Run from a clean checkout of `main`:

```bash
npm ci
npm run check
npm run package:check
npm pack --dry-run
```

`npm run check` includes linting, unit tests, the production build, size checks, package checks, Playwright browser tests, and accessibility checks.

Before creating a release, also verify:

- no unexpected open release pull request;
- no unresolved release-blocking issue;
- CodeQL has no open high or critical alert on `main`;
- `package.json`, `package-lock.json`, and `.release-please-manifest.json` contain the same version;
- the README CDN examples contain the same version;
- the target npm version does not already exist.

## Release preparation

Release Please is intentionally manual. Run `.github/workflows/release-please.yml` with **Run workflow** on `main` only when a release is intended.

The generated release pull request must be reviewed like normal source changes. Confirm its proposed version, changelog, package metadata, and README markers before merging. Do not merge a generated version that is larger than the actual change requires.

The managed README marker is:

```html
<!-- x-release-please-version -->
```

Keep the marker adjacent to the visible version value. Do not duplicate it or move it away from the value Release Please updates.

## Publishing

The permanent publish workflow is `.github/workflows/publish.yml`.

1. Create or approve the exact stable tag and GitHub release for the reviewed commit.
2. Run the publish workflow from that exact tag ref and provide the same tag in its `tag` input.
3. The workflow validates the tag, package name, package version, lockfile metadata, public access, tests, build, size, and package contents.
4. It publishes `@misztersoul/feathertext` with public access and provenance.
5. It verifies that npm returns the exact published version.

The workflow currently reads `NPM_TOKEN`. Configure it as a repository or protected-environment secret with only the permissions needed to publish this package. Prefer npm Trusted Publishing when the package and account are configured for it, then remove the long-lived token path rather than keeping both mechanisms active.

## npm package settings

Use these exact package values:

| Setting | Value |
| --- | --- |
| Package | `@misztersoul/feathertext` |
| Access | Public |
| Registry | `https://registry.npmjs.org/` |
| Repository | `https://github.com/MiszterSoul/FeatherText.git` |
| License | MIT |

Require strong account authentication, keep the owner list minimal, and revoke obsolete automation tokens.

## Failed release handling

Do not move or reuse a published tag or npm version.

- Before npm publication: delete an erroneous unpublished GitHub release/tag, correct the source, and rerun verification.
- After npm publication: publish a new patch version. npm versions are immutable.
- If generated release metadata proposes the wrong version: close the release PR, remove its branch, correct the manifest/changelog inputs, and rerun Release Please manually.

## Post-release verification

Confirm all of the following:

```bash
npm view @misztersoul/feathertext@X.Y.Z version
npm view @misztersoul/feathertext@X.Y.Z dist.tarball
```

Then verify:

- the GitHub release tag resolves to the intended `main` commit;
- the npm package page displays the canonical repository and MIT license;
- ESM, CommonJS, browser bundle, CSS, and TypeScript declarations install correctly;
- the README and changelog show the released version;
- no temporary release workflow, diagnostic issue, release branch, or stale pull request remains.
