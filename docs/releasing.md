# Releasing FeatherText

This runbook describes the release automation committed in this repository and the owner-managed settings it depends on. `package.json`, the root package metadata in `package-lock.json`, and `.release-please-manifest.json` currently agree on the `0.3.1` baseline. No GitHub tags or releases existed, and the public npm registry returned `404 Not Found` for `feathertext` when checked on 2026-07-28. At that same observation point, bot-created Release Please PR #6 was open and proposed `0.3.2`; Release Please can update that proposal when later Conventional Commits reach `main`, so review its current head and version rather than relying on this historical observation. The metadata baseline and release PR tell Release Please what to propose; neither proves a GitHub or npm release.

This documentation update does not publish a package. Account-side configuration still requires owner verification before publication, although the successful retry that created PR #6 is direct evidence that this repository can now create the Release Please pull request.

> [!IMPORTANT]
> For the reported Release Please pull-request creation error, open **Settings > Actions > General > Workflow permissions** and enable **Allow GitHub Actions to create and approve pull requests**. The current retry successfully created PR #6, so this repository permission is now working. Human review remains required; enabling the setting does not approve the PR or prove any npm configuration.

## Current release model

FeatherText uses a stable-only, manifest-driven Release Please flow:

1. Changes merge to protected `main` using Conventional Commits.
2. `.github/workflows/release-please.yml` maintains a Release Please pull request using the `node` strategy in `release-please-config.json`.
3. Because changes made with `GITHUB_TOKEN` do not emit ordinary `pull_request` workflow runs, the Release Please workflow validates the canonical release PR and explicitly dispatches `ci.yml` at its exact in-repository branch.
4. A maintainer reviews and merges the release PR.
5. Release Please creates an exact `vX.Y.Z` tag and a published GitHub Release named `vX.Y.Z` from `main`.
6. The workflow explicitly dispatches `.github/workflows/publish.yml` at that tag. This is necessary because a release created with `GITHUB_TOKEN` does not trigger another workflow automatically. A normal `release.published` event is also supported for an authorized manually published release.
7. `publish.yml` verifies, tests, builds, and packages without write permission.
8. The `Publish to npm` job waits for approval in the protected `npm` environment and publishes through npm Trusted Publishing (OIDC).
9. A separate `contents: write` job uploads the already verified tarball, distribution ZIP, and checksums to the same GitHub Release.

`release-please-config.json` uses the Node strategy and updates the README as a generic extra file: the two current values adjacent to `<!-- x-release-please-version -->` are managed through those generic markers. The same config sets `force-tag-creation: true`, which forces the Git tag to be created immediately with the release rather than relying on GitHub's lazy tag creation. These settings describe intended automation; no tag or GitHub Release exists yet.

The publish workflow does not run on `pull_request`, `pull_request_target`, `workflow_run`, or repository dispatch events. Fork jobs are rejected, manual runs must execute from the exact requested tag ref, and only a published stable release in `MiszterSoul/FeatherText` is eligible.

## Automation inventory

| Workflow                | Purpose                                                                                  | Effective permissions                                                                         |
| ----------------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| `ci.yml`                | Node 22/24 lint, unit tests, build; Node 24 E2E, accessibility, size, and package checks | `contents: read`                                                                              |
| `dependency-review.yml` | Reject moderate-or-higher dependency changes on pull requests                            | `contents: read`                                                                              |
| `codeql.yml`            | JavaScript/TypeScript security analysis                                                  | `contents: read`; `security-events: write` only in the analysis job                           |
| `pages.yml`             | Build `_site`, upload the generated Pages artifact, then deploy it                       | build: `contents: read`, `pages: read`; deploy: `pages: write`, `id-token: write`             |
| `release-please.yml`    | Maintain/release the Node package, dispatch release-PR CI, and dispatch publishing       | writes are isolated to the jobs that need PR/release or Actions dispatch access               |
| `publish.yml`           | Verify and package; publish through npm OIDC; upload GitHub Release assets               | verify: `contents: read`; npm: `contents: read`, `id-token: write`; assets: `contents: write` |

Every `uses:` reference in the current workflows is pinned to a full 40-character commit SHA with a release-version comment. Keep both the SHA and comment aligned when updating a pin; verify the release tag and commit in the action's upstream repository before merging. Never replace a pin with a mutable branch or tag.

## `GITHUB_TOKEN` and npm OIDC architecture

GitHub creates a short-lived, repository-scoped `GITHUB_TOKEN` for each workflow job. The workflows start from `permissions: {}` or read-only permissions and grant writes only to the jobs that need them:

- Release Please receives `contents: write`, `issues: write`, and `pull-requests: write` to maintain the release PR and create the tag/GitHub Release.
- The two dispatcher jobs receive `actions: write` plus read permissions. They explicitly dispatch release-PR CI and `publish.yml` because events created with `GITHUB_TOKEN` do not recursively start the ordinary downstream workflows.
- Publish verification receives `contents: read`; the npm job receives `contents: read` and `id-token: write`; the final release-assets job alone receives `contents: write`.
- `GH_TOKEN: ${{ secrets.GITHUB_TOKEN }}` authenticates `gh` calls to GitHub. It is not an npm credential and cannot authenticate `npm publish`.
- The npm job's `id-token: write` permission lets npm exchange GitHub's job identity for a short-lived Trusted Publishing credential. The workflow does not read or set a long-lived npm publish token.

The permissions are job-scoped; a write permission in one job is not inherited by another. OIDC publication also depends on the exact npm Trusted Publisher identity and the protected `npm` environment described below.

## Owner-managed configuration

These are one-time owner settings followed by release-time verification. Most cannot be proven by repository files alone and remain required preflight checks. The exception currently evidenced by repository activity is pull-request creation permission: the successful retry created PR #6.

### GitHub Actions and repository policy

Verify in repository and, where applicable, organization settings:

- Actions is allowed to use the pinned actions in `.github/workflows/`.
- The repository policy permits the job-scoped `GITHUB_TOKEN` writes requested by `release-please.yml` and `publish.yml`.
- In **Settings > Actions > General > Workflow permissions**, enable **Allow GitHub Actions to create and approve pull requests** so Release Please can create/update its PR. The successful retry created PR #6, confirming this repository permission now works. Human review must still be required; the automation does not approve its own PR.
- Default workflow permissions are kept as restrictive as practical. The workflows declare their required permissions explicitly.
- Revoke obsolete npm automation tokens in npm and remove any obsolete copies from GitHub repository, organization, and environment secret scopes. The current `publish.yml` does not consume such a token, but repository files cannot prove revocation or secret deletion.
- Actions from forks require approval as appropriate for the project, but no fork run receives a path to npm publication.

### Protect `main`

Use a branch ruleset or branch protection rule that includes, at minimum:

- pull requests rather than direct pushes;
- at least one independent approving review;
- dismissal of stale approvals after release-sensitive changes;
- required conversation resolution;
- required status checks from both Node versions (`Node 22` and `Node 24`), plus the dependency/security checks selected by the owners;
- the branch being up to date before merge, if that policy works with the chosen merge method;
- no force pushes and no branch deletion;
- restricted bypass, ideally with no routine administrator bypass;
- code-owner review for `.github/workflows/`, `release-please-config.json`, `.release-please-manifest.json`, and package metadata if the repository has a suitable `CODEOWNERS` policy.

Confirm the exact status-check names from a real pull request before making them required. In particular, verify that the explicitly dispatched CI run on `release-please--branches--main--components--feathertext` is recognized for the release PR head SHA.

Use a merge method that preserves a valid Conventional Commit in `main`. With squash merging, the squash commit title is the important message.

### Protect release tags

Create a tag ruleset covering `v*` and configure it so that:

- only the authorized release path can create a new release tag;
- existing release tags cannot be updated, force-pushed, or deleted in routine operation;
- bypass is narrowly limited and audited;
- Release Please can create a new tag after the reviewed release PR merges.

The workflow independently accepts only `^v(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)\.(0|[1-9][0-9]*)$`, resolves the tag back to the workflow SHA at each privileged boundary, and requires that commit to be in canonical `main` history. Never move a tag after a GitHub or npm release.

### Protect the `npm` environment

Create the `npm` environment explicitly before publishing. An environment created implicitly by a job has no useful protection rules.

Recommended settings:

- one or more required reviewers who understand the release evidence;
- **Prevent self-review** where the repository plan supports it;
- no routine administrator bypass;
- deployment branches/tags restricted to the protected stable release tags (for example, a `v*` tag rule, with the workflow enforcing exact stable SemVer);
- no release credential stored in the environment; OIDC is obtained at job runtime;
- an optional wait timer for normal releases;
- environment administrators restricted to package/repository owners.

The reviewer should approve only after the `Verify, test, and package` job has passed and the tag, commit, version, package, and GitHub Release all match.

### Protect the `github-pages` environment

Configure Pages to deploy from **GitHub Actions**, restrict the `github-pages` environment to `main`, and review its protection/bypass policy. `pages.yml` also refuses a manual run from any ref other than `refs/heads/main` and uploads `_site` as a generated Pages artifact instead of deploying the source tree directly.

### npm account and package

Before routine publishing:

- require strong 2FA/passkeys for every package owner;
- keep the owner list minimal and review it before releases;
- store recovery material offline and test account recovery;
- verify the package's public name is exactly `feathertext`;
- verify npm displays the canonical repository from `package.json` as `https://github.com/MiszterSoul/FeatherText.git`;
- after Trusted Publishing is proven, set package publishing access to **Require two-factor authentication and disallow tokens**;
- revoke obsolete automation tokens and audit active sessions.

## Exact npm Trusted Publisher identity

Configure the package's Trusted Publisher with these case-sensitive values:

| npm field                  | Exact value      |
| -------------------------- | ---------------- |
| Publisher type             | `GitHub Actions` |
| Organization or user/owner | `MiszterSoul`    |
| Repository                 | `FeatherText`    |
| Workflow filename          | `publish.yml`    |
| Environment name           | `npm`            |
| Allowed action             | `npm publish`    |

Enter only `publish.yml`, not `.github/workflows/publish.yml`. A rename, case change, different environment, reusable-workflow caller, or different repository owner changes the OIDC identity and can make publication fail.

The npm job:

- requests the `ubuntu-latest` runner label; before approval, verify the actual run used an npm Trusted Publishing-eligible GitHub-hosted runner rather than inferring that from YAML alone;
- uses Node 24 and rejects Node older than 22.14.0 or npm older than 11.5.1;
- disables the setup-node package-manager cache for the release job;
- has only `contents: read` and `id-token: write`;
- references the `npm` environment;
- passes a verified tarball directly to `npm publish` through OIDC.

For an eligible public package published from an eligible GitHub-hosted runner, npm Trusted Publishing can generate provenance. The workflow requires `publishConfig.provenance: true` and invokes `npm publish ... --provenance`, but those inputs alone do not prove that npm accepted a publication or attached valid provenance; verify the registry result after publishing.

## First-publication bootstrap

The public npm registry returned `404 Not Found` for `feathertext` on 2026-07-28, so the unscoped package was not publicly visible at that observation point and could not be treated as an existing package. Recheck immediately before release because package-name availability can change. If `feathertext` still does not exist, npm owner `@misztersoul` must perform one authenticated first publish that creates it; npm exposes package-scoped Trusted Publisher settings only after that bootstrap. This bootstrap has not occurred, and this runbook does not claim publication.

The bootstrap version is the single no-provenance exception. It is published interactively from a trusted owner machine rather than from a supported cloud CI provenance environment. Its immutable version cannot be republished or reused to add provenance later. Every subsequent version must use the normal `publish.yml` Trusted Publishing OIDC path and carry verifiable provenance.

Use this one-time sequence:

1. Before merging the release PR, create and protect the GitHub `npm` environment with required reviewers and stable-tag restrictions. This ensures the `Publish to npm` job waits for approval after the verification job instead of attempting publication before bootstrap is complete. Do not store an npm credential in the environment.
2. `@misztersoul` confirms control of the unscoped name, strong 2FA/passkeys, the exact unused version, the reviewed immutable `vX.Y.Z` tag, and a fresh `E404` result for both `feathertext` and `feathertext@X.Y.Z` from the public registry.
3. Merge the reviewed Release Please PR. Let Release Please create the exact stable tag and published GitHub Release, and let `publish.yml` finish `Verify, test, and package`. Keep the `Publish to npm` environment job waiting; do not approve it.
4. Download the one-day `release-assets-vX.Y.Z` workflow artifact. Confirm that it contains exactly `feathertext-X.Y.Z.tgz`, `feathertext-X.Y.Z-dist.zip`, and `SHA256SUMS.txt`; run `sha256sum --check SHA256SUMS.txt` and verify both archive allowlists documented below.
5. On a trusted owner machine, authenticate interactively to `https://registry.npmjs.org/`, confirm `npm whoami` returns the intended owner, and publish the verified tarball exactly once:

   ```bash
   npm publish ./feathertext-X.Y.Z.tgz \
     --access public \
     --registry=https://registry.npmjs.org/ \
     --provenance=false \
     --ignore-scripts
   ```

   The explicit `--provenance=false` overrides the tarball's routine-release `publishConfig.provenance: true`. Local owner-machine publication cannot generate the supported workflow provenance required for routine releases. Let npm prompt for interactive authentication or 2FA; do not place a token or one-time code in the command, repository, workflow, or shell history.

6. Verify the exact registry version, dist-tag, integrity, bytes, repository metadata, and 11-file package allowlist. Record that this first version used the documented owner-authenticated no-provenance bootstrap. Never republish it or reuse its version to add provenance retroactively.
7. Immediately configure the package Trusted Publisher with owner `MiszterSoul`, repository `FeatherText`, workflow `publish.yml`, environment `npm`, and allowed action `npm publish` (the exact table above). Then apply **Require two-factor authentication and disallow tokens**, revoke obsolete bootstrap or automation tokens, and audit active owners and sessions.
8. Cancel or reject the still-waiting `Publish to npm` environment job for the bootstrap version. Do not approve or rerun it: the version now exists, and the workflow's unpublished-version guard must prevent a second publication. Because the dependent release-assets job will not run, upload only the same verified files to the existing GitHub Release without clobbering or rebuilding them:

   ```bash
   gh release upload vX.Y.Z \
     feathertext-X.Y.Z.tgz \
     feathertext-X.Y.Z-dist.zip \
     SHA256SUMS.txt \
     --repo MiszterSoul/FeatherText
   ```

   Verify the three uploaded assets against `SHA256SUMS.txt` and preserve the workflow run, owner-authentication record, and checksum evidence.

9. Publish the next new version through `publish.yml` with the protected `npm` environment and the configured Trusted Publisher. Verify that npm accepted OIDC, attached provenance for the exact repository/workflow/tag/commit, and required no long-lived publish credential. Use this OIDC path for every later publication; do not perform another routine interactive publish.

This is a narrowly scoped owner-operated exception for creating the package. No first publish, npm package creation, Trusted Publisher configuration, or OIDC publication is claimed here.

## Conventional Commits and version selection

Release Please reads commits after the manifest baseline (`0.3.1`) on `main` and updates `package.json`, `package-lock.json`, `CHANGELOG.md`, `.release-please-manifest.json`, and the README values identified by the generic `<!-- x-release-please-version -->` markers. As observed on 2026-07-28, open PR #6 proposed `0.3.2`, but that proposal can change when Release Please processes later commits. Normal development does not manually bump those files: merge Conventional Commits, review the generated release PR's current head, and let that PR carry the next version, changelog, and marker updates.

Use messages such as:

```text
fix: preserve selection when reopening the link dialog
feat: add configurable toolbar groups
perf: avoid duplicate selection snapshots
fix!: remove the legacy toolbar option
```

Version intent:

- `fix:` normally proposes a patch;
- `feat:` normally proposes a minor;
- `!` after the type or a `BREAKING CHANGE:` footer proposes a major under the current configuration;
- other recognized Conventional Commit types may still produce a patch proposal even when hidden from the changelog;
- `Release-As: X.Y.Z` can force a reviewed exact version, but should be reserved for recovery or an intentional emergency version and must be valid SemVer.

Review the generated version rather than assuming the prefix had the intended effect. For squash merges, make the final squash title/body conventional. Do not manually edit the manifest during normal releases; it records Release Please's version baseline. In this repository, the current `0.3.1` manifest value is not proof of a corresponding tag, GitHub Release, or npm publication.

## Standard stable release

### 1. Prepare and merge changes

- Keep each merged commit conventional.
- Update user-facing documentation and migration/deprecation guidance in the same reviewed work when behavior changes.
- Ensure the ordinary pull request has current CI results.
- Resolve audit, browser, accessibility, packaging, or size failures rather than bypassing them.

### 2. Review the Release Please PR

Release Please keeps one root-package PR current with `main`. Verify that it changes the expected version files and changelog, and that:

- `package.json`, both root version locations in `package-lock.json`, and `.release-please-manifest.json` agree;
- the proposed tag will be exactly `vX.Y.Z`;
- the release name will be exactly `vX.Y.Z`;
- changelog entries and breaking-change notes are complete;
- the explicitly dispatched Node 22/24 CI checks pass on the release PR head;
- required review and branch rules are satisfied.

Do not create the tag manually. Merge the release PR once the desired release is ready.

### 3. Inspect the release and verification job

After merge, Release Please creates the tag/release and dispatches `publish.yml` at that exact tag. Before environment approval, confirm the verification job proves:

- canonical repository `MiszterSoul/FeatherText`, not a fork;
- exact stable tag/ref, published non-draft/non-prerelease release, and matching release name;
- tag commit equals the workflow SHA, is still immutable, and belongs to `main` history;
- the release has no pre-existing custom assets;
- clean checkout before and after verification;
- package name `feathertext`, exact tag/package/lockfile version equality, public registry/access, and canonical repository metadata;
- lint, unit, build, E2E, accessibility, size, and package checks pass;
- archives contain only the exact allowlists below;
- checksums verify and the artifact contains exactly three regular files.

### 4. Approve npm publication

An authorized reviewer approves the `npm` environment only when all evidence is consistent. The npm job redownloads and reverifies the immutable artifact, release, tag, package metadata, archive lists, checksums, Node/npm minimums, and public registry. It refuses an already published version, then runs direct `npm publish` through OIDC.

### 5. Upload and verify release assets

Only after npm is visible does the separate `contents: write` job upload the three files. It confirms that the GitHub Release had no prior custom assets, rechecks the tag/release and checksums, uploads without clobbering, and verifies the final custom asset names, states, sizes, and available GitHub SHA-256 digests.

## Exact release artifacts

`build.mjs`, package metadata, package checks, and `publish.yml` agree on these allowlists. Any intended change requires a reviewed update to all relevant sources; the release workflow deliberately fails on drift.

### npm tarball: 11 files

The tar archive has a `package/` prefix and exactly:

```text
README.md
CHANGELOG.md
LICENSE
index.d.ts
package.json
dist/feathertext.cjs
dist/feathertext.esm.js
dist/feathertext.js
dist/feathertext.min.js
dist/feathertext.css
dist/feathertext.min.css
```

It excludes source maps, source code, tests, site files, `dist/build-manifest.json`, and the ZIP-only copies staged under `dist/`.

### Distribution ZIP: nine flat files

`feathertext-X.Y.Z-dist.zip` contains no directory prefix and exactly:

```text
README.md
LICENSE
index.d.ts
feathertext.cjs
feathertext.esm.js
feathertext.js
feathertext.min.js
feathertext.css
feathertext.min.css
```

The ZIP intentionally excludes `CHANGELOG.md`, `package.json`, source maps, and `build-manifest.json`.

### GitHub Release custom assets

The exact three custom assets are:

```text
feathertext-X.Y.Z.tgz
feathertext-X.Y.Z-dist.zip
SHA256SUMS.txt
```

`SHA256SUMS.txt` contains exactly one lowercase SHA-256 entry for the npm tarball and one for the distribution ZIP, using the two-space `sha256sum` filename format. The workflow runs `sha256sum --check` before publication and before upload. GitHub's automatically generated “Source code” archives are platform-generated links and are separate from these three custom assets.

## Package smoke tests

`npm run package:check` tests a locally built release candidate, not the copy returned by npm after publication. It performs `npm pack --ignore-scripts`, requires the exact 11-file tarball, verifies metadata/exports and non-empty entrypoints, compares packed bytes to the build outputs, checks README/changelog/license/type-declaration markers, and runs these consumer tests against the packed package:

- ESM default and named import, `FeatherText.init`, themes, and version;
- CommonJS `require`, `FeatherText.init`, themes, and version;
- the minified browser global in JSDOM, including editor initialization and destruction.

CSS files, CSS export targets, and `index.d.ts` are checked for presence, non-empty content, exact packed bytes, and expected metadata/declaration markers; the script does not run a browser rendering test or a TypeScript compiler. The E2E and accessibility suites exercise the built project separately.

After npm publication, repeat smoke testing against `feathertext@X.Y.Z` downloaded from the public registry in a clean temporary consumer. At minimum, install the exact version with scripts disabled, repeat ESM and CommonJS loads, load the browser bundle and CSS in a real browser smoke page, and compile a minimal TypeScript consumer against the exported declarations. Do not substitute the workspace checkout or the pre-publish artifact for this registry test. Compare the registry tarball's 11-file list and bytes/integrity with the approved candidate before announcement.

## Manual dispatch and retries

Routine releases should arrive through Release Please. `workflow_dispatch` exists for recovery and accepts a required `tag` input.

For a manual publish dispatch:

1. choose the existing exact `vX.Y.Z` tag as the workflow ref;
2. enter that same `vX.Y.Z` value in `tag`;
3. confirm the GitHub Release is already published, stable, named exactly like the tag, has no custom assets, and points to a commit in `main`;
4. obtain the normal `npm` environment approval.

The workflow rejects a branch ref, mismatched input/ref, loose SemVer, draft, prerelease, fork, moved tag, non-`main` commit, pre-populated release, wrong package/repository, dirty checkout, or existing npm version.

If verification fails before npm publication, fix the root cause and dispatch the same still-unpublished tag only if changing no tagged bytes is required. If tagged bytes must change, create a new version and tag.

If only the final asset job fails, use GitHub's **re-run failed jobs** so the successful npm job is not repeated. If an upload partially created an asset, inspect and remove only the incomplete custom asset with owner approval before retrying; the workflow intentionally does not clobber assets.

If npm accepted the package but the workflow timed out before recognizing it, do not rerun a full publish: the existing-version guard will stop it. Verify the registry bytes and provenance, then use an owner-approved recovery to attach the already verified workflow artifact and document the partial automation failure.

## Emergency patch

The current automation supports stable releases from `main` only. It does not support arbitrary maintenance branches or backports.

For an urgent patch from current `main`:

1. use a private security advisory when disclosure must be coordinated;
2. prepare the smallest root-cause fix and regression test;
3. merge through protected review with a `fix:` commit;
4. if version forcing is necessary, use a reviewed `Release-As: X.Y.Z` footer and confirm it is the next unused patch;
5. review and merge the generated Release Please PR;
6. run every release gate and require normal `npm` environment approval;
7. verify npm, provenance, GitHub assets, Pages, and advisory/upgrade guidance before announcement.

If `main` contains unreleased changes that cannot ship, or an older supported line needs a backport, do not point the existing workflow at an ad hoc branch. First merge a reviewed automation design for a protected maintenance branch, including Release Please targeting, CI, tag ancestry rules, environment tag restrictions, and documentation. Do not bypass OIDC or introduce a long-lived npm token for speed.

If repository, workflow, tag, npm account, or credential integrity is in doubt, pause publication. Audit Actions runs/settings, environment approvals, tag history, npm owners/sessions/tokens, and Trusted Publisher identity before re-establishing trust.

## Prereleases

Prereleases are **not supported by the current automation**:

- `release-please-config.json` sets `prerelease: false`;
- `publish.yml` accepts only `vX.Y.Z`;
- GitHub prereleases are rejected;
- no non-`latest` npm dist-tag mapping is implemented.

Do not disguise an alpha, beta, or release candidate as a stable release and do not manually dispatch a `vX.Y.Z-beta.N` tag.

Before introducing prereleases, merge and review an explicit design that:

- uses protected prerelease branch/tag rules and a Release Please prerelease strategy;
- accepts exact SemVer prerelease identifiers while still binding input, ref, release, package version, and commit;
- requires the GitHub Release to be marked prerelease;
- maps `alpha`, `beta`, and `rc` to an approved non-default npm dist-tag (for example `alpha`, `beta`, or `next`);
- invokes `npm publish --tag <non-latest-tag>` through the same `publish.yml` Trusted Publisher and `npm` environment;
- applies the same tests, package allowlists, checksums, provenance, approval, and post-publish verification;
- prevents any prerelease from changing `latest`.

Promote by publishing a new immutable stable version; never relabel prerelease bytes as another version.

## Rollback, deprecation, and compromised releases

npm versions are immutable. Never overwrite or reuse one, and never move its Git tag.

For a bad but non-malicious release:

1. stop announcements and assess impact;
2. move `latest` back to the last known-good version if appropriate;
3. deprecate the bad version with an exact reason and replacement;
4. publish a fixed new version through the normal workflow;
5. add a prominent warning to the GitHub Release body while preserving its tag and evidence;
6. preserve logs/artifacts and add a regression test.

Example owner-operated commands (replace versions deliberately):

```bash
npm dist-tag add feathertext@0.2.4 latest
npm deprecate feathertext@0.3.0 "Known regression; use 0.3.1 or later."
```

Administrative npm commands are not part of the Trusted Publisher's allowed `npm publish` action and require an authenticated owner with 2FA. Prefer deprecation over unpublish. Unpublishing has strict npm policy/time/dependency constraints, can break consumers, and still does not make a version reusable.

For a malicious or supply-chain-compromised release, additionally:

- remove affected dist-tags and deprecate with security guidance;
- revoke sessions/tokens and review owner membership;
- disable or remove the Trusted Publisher until its identity is revalidated;
- inspect tag/ruleset changes, workflow history, environment approvals, and provenance claims;
- coordinate a new clean version and security advisory;
- preserve evidence for incident response.

API deprecations should state the replacement, reason, first deprecated version, and earliest removal version in release notes and migration documentation. Avoid removing an API in the same routine release that first announces its deprecation unless security requires it.

## Post-publish verification

Never treat a green workflow alone as release success. Replace `X.Y.Z` below with the exact version. Run the install and signature audit in a new temporary consumer project, not in the FeatherText workspace:

```bash
npm view feathertext@X.Y.Z name version dist-tags dist.integrity dist.shasum dist.tarball repository --json
npm pack feathertext@X.Y.Z --json
npm install --ignore-scripts --save-exact feathertext@X.Y.Z
npm audit signatures
gh release view vX.Y.Z --repo MiszterSoul/FeatherText
```

Verify npm for every publication:

- package name/version and intended dist-tag are exact;
- repository links to `MiszterSoul/FeatherText`;
- the registry tarball matches the recorded release candidate integrity/bytes and exact 11-file allowlist;
- clean ESM import, CJS require, browser-global, CSS, and types smoke tests pass from the registry package;
- in a clean project where the exact package version is installed, `npm audit signatures` validates the registry signatures and any expected attestations without an unexplained failure.

For the one-time first-publication bootstrap, verify and record that owner authentication was used and that provenance is absent by design; do not republish that immutable version to change this result. For every subsequent routine publication, additionally verify that npm displays a provenance attestation for the exact version, inspect its source repository, workflow path `.github/workflows/publish.yml`, tag/commit, and run identity, and ensure they match the approved run in `MiszterSoul/FeatherText`. Confirm that the approved npm job obtained OIDC through `id-token: write` and did not consume a long-lived npm publish credential.

Verify the GitHub Release:

- tag and release name are exactly `vX.Y.Z`;
- tag still resolves to the reviewed `main` commit;
- it is published, stable, and has the expected notes/migration warnings;
- the three custom assets are exact, non-empty, and match `SHA256SUMS.txt`;
- the tarball and ZIP lists match the allowlists above;
- for the one-time bootstrap, the verification job passed, the waiting npm job was canceled or rejected, and the same verified assets were uploaded manually; for every later routine release, the publish run shows environment approval before OIDC `npm publish` and a separate asset-write job after registry verification.

Verify Pages:

- the `Pages` workflow for the release commit succeeded and deployed a generated `_site` artifact;
- `https://misztersoul.github.io/FeatherText/` loads over HTTPS;
- editor JavaScript and CSS load without console or network errors;
- key demo, keyboard, and accessibility interactions work;
- canonical, repository, npm, support, and security links resolve.

Pages tracks `main`, so the live site may be newer than an older release tag. Record the Pages workflow SHA used for release verification rather than assuming the current site always represents that historical package version.

Treat any unexplained mismatch in identity, tag, bytes, checksums, or provenance as a supply-chain incident until resolved.

## Release checklist

- [ ] Conventional commits and proposed SemVer reviewed.
- [ ] Release Please PR versions/changelog agree and required checks pass.
- [ ] GitHub Actions, branch/tag rulesets, and `npm`/`github-pages` environments verified by an owner.
- [ ] Package owners, 2FA/passkeys, recovery, and token/session inventory reviewed.
- [ ] Exact protected tag and published stable GitHub Release point to reviewed `main` commit.
- [ ] Verify job passes lint, unit, build, E2E, accessibility, size, package, clean-tree, and archive checks.
- [ ] For the one-time bootstrap only: owner-authenticated publication used the exact verified tarball with `--provenance=false --ignore-scripts`; absence of provenance was recorded; the immutable version was not republished; the waiting npm job was canceled; and the same verified assets were uploaded manually.
- [ ] After bootstrap: exact npm Trusted Publisher identity verified, obsolete npm automation tokens revoked and removed, and publishing access configured to require 2FA and disallow tokens.
- [ ] For every version after bootstrap: `npm` environment approval recorded before direct OIDC `npm publish`, no long-lived publish credential used, and exact provenance verified.
- [ ] npm version, dist-tag, registry tarball, ESM/CJS/browser/CSS/types smoke tests, and signatures verified for every publication.
- [ ] GitHub Release has exactly the three custom assets with valid checksums.
- [ ] Pages generated-artifact deployment and live site verified.
- [ ] Announcement occurs only after all post-publish checks pass.

## Authoritative references

Reviewed 2026-07-27:

- npm, [Trusted publishing for npm packages](https://docs.npmjs.com/trusted-publishers/)
- npm, [Generating provenance statements](https://docs.npmjs.com/generating-provenance-statements/)
- npm, [Deprecating and undeprecating packages or package versions](https://docs.npmjs.com/deprecating-and-undeprecating-packages-or-package-versions/)
- npm, [Unpublish Policy](https://docs.npmjs.com/policies/unpublish)
- GitHub, [Managing environments for deployment](https://docs.github.com/en/actions/how-tos/deploy/configure-and-manage-deployments/manage-environments)
- GitHub, [Managing rulesets](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets)
- Release Please, [Release Please Action](https://github.com/googleapis/release-please-action)
- Release Please, [Manifest-driven releases](https://github.com/googleapis/release-please/blob/main/docs/manifest-releaser.md)
