# FeatherText launch kit

## Audited launch facts

Use this section as the source of truth when adapting any copy below.

| Requirement                        | Approved fact or status                                                                                                                                                                                                                     |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| One-sentence pitch                 | FeatherText is a lightweight, dependency-free rich-text editor for plain JavaScript projects that enhances textareas with a ready-made visual and source-editing interface.                                                                 |
| Tagline (46 characters)            | `Rich-text editing without runtime dependencies`                                                                                                                                                                                            |
| Short description (233 characters) | `FeatherText is a lightweight, dependency-free rich-text editor for plain JavaScript projects. It enhances textareas with a configurable toolbar, 16 built-in themes, visual and source modes, counters, history, and an HTML-focused API.` |
| Runtime dependencies               | None declared in `package.json`; do not imply that build or development tooling has no dependencies.                                                                                                                                        |
| Current build size                 | 27.90 KiB JavaScript gzip and 4.57 KiB CSS gzip. State both assets and compression explicitly; do not combine them into a single package-size number.                                                                                       |
| Current automated evidence         | 71 Node/JSDOM unit tests; 18 E2E cases in each of five Playwright projects (90 executions); 12 axe checks.                                                                                                                                  |
| Validated package artifact         | Exact 159,373-byte npm tarball containing 11 files; this local artifact is not evidence of npm publication.                                                                                                                                 |
| License/status                     | MIT; pre-1.0; package metadata version `0.3.1`.                                                                                                                                                                                             |
| Release/registry status            | No GitHub tags or releases exist yet; the public npm registry returned `404 Not Found` for `feathertext` on 2026-07-28. Do not claim publication.                                                                                           |
| Live site                          | <https://misztersoul.github.io/FeatherText/>                                                                                                                                                                                                |
| Source                             | <https://github.com/MiszterSoul/FeatherText>                                                                                                                                                                                                |
| Bug reports                        | <https://github.com/MiszterSoul/FeatherText/issues>                                                                                                                                                                                         |
| Support development                | <https://buymeacoffee.com/devpeter>                                                                                                                                                                                                         |
| Security boundary                  | <https://github.com/MiszterSoul/FeatherText/blob/main/docs/security.md>                                                                                                                                                                     |

The short description above is 233 characters including spaces. The tagline is 46 characters including spaces. Recount if either is edited for a platform.

## Mandatory owner preflight

> **Immediately before every post or submission, re-check that community’s current rules, self-promotion limits, required title/flair, creator-disclosure requirements, link rules, account requirements, and allowed posting frequency. Rules change; this kit supplies draft copy, not permission to post.**

Do not automate cross-posting, evade moderation, reuse identical promotional copy where that is discouraged, ask for votes/upvotes, or conceal that the poster is the creator. Participate in each discussion and answer technical questions directly.

Before launch:

- [ ] Confirm the live demo and repository URLs resolve anonymously.
- [ ] Run the current tests, build, size check, and package smoke check from the intended release commit.
- [ ] Confirm the displayed version, release tag, Pages deployment, and downloadable source agree.
- [ ] Reproduce the current build sizes before posting them; approved copy is **27.90 KiB JS gzip and 4.57 KiB CSS gzip**.
- [ ] Check site canonical, Open Graph, GitHub, bug-report, and support links.
- [ ] Verify the live textarea demo in the exact browsers actually represented in launch-day evidence.
- [ ] Keep pre-1.0, security, privacy, and compatibility limitations visible.
- [ ] Make no npm availability or publication claim; the latest recorded check returned `404 Not Found` for `feathertext` on 2026-07-28.
- [ ] Make no Lighthouse, assistive-technology, WCAG-conformance, physical-device, or latest-two-browser claim.
- [ ] Capture real release-artifact screenshots using the plan below; do not imply that screenshots or GIFs already exist.
- [ ] Re-check each target community’s current rules immediately before posting.

## Positioning and claim guardrails

### Safe, verified themes

- lightweight, dependency-free rich-text editing for plain JavaScript, where “dependency-free” means no declared runtime dependencies;
- textarea enhancement with synchronized form values;
- configurable toolbar and 16 current built-in themes; `auto` is a separate adaptive choice;
- visual and source editing with an HTML-focused API;
- browser-global, ESM, CommonJS, CSS, and TypeScript declaration build outputs;
- 27.90 KiB minified JavaScript gzip and 4.57 KiB minified CSS gzip from the current build;
- MIT licensed, pre-1.0, and open to technical feedback.

### Current limitations that must not be hidden

- FeatherText is an HTML-string editor, not a schema-backed document model.
- Its conservative untrusted-HTML helper is not a complete sanitizer or security boundary. Applications remain responsible for authoritative sanitization, validation, output encoding, and CSP.
- Source mode is a trusted-author path and can place raw HTML into the editing DOM.
- Several formatting operations still use deprecated `document.execCommand()` behavior through a compatibility adapter.
- FeatherText is not a collaboration service, file host, upload service, sandbox, or authorization system. Applications may provide an upload callback, but FeatherText does not host files.
- Local draft autosave is opt-in, local, and does not encrypt or sanitize saved HTML.
- Exact-version automated browser and axe checks are bounded engineering evidence only. They do not establish latest-two-browser support, manual assistive-technology compatibility, WCAG conformance, physical-device coverage, or Lighthouse results.
- The project is pre-1.0, so APIs and behavior may change before 1.0.

### Prohibited launch claims

Do not claim or imply:

- public npm availability, completed npm publication, registry provenance, or an npm install path;
- “secure HTML,” “fully sanitized,” or that FeatherText replaces application security controls;
- Lighthouse scores or a Lighthouse pass;
- manual screen-reader or other assistive-technology validation;
- WCAG compliance/conformance;
- latest-two-browser, universal browser, or physical-device support;
- “fastest,” “smallest,” “instant,” “production-proven,” or superiority over another editor;
- collaboration, hosted uploads, Markdown, official framework wrappers, or dated roadmap commitments.

## Hacker News

Re-check the current [Hacker News guidelines](https://news.ycombinator.com/newsguidelines.html) and Show HN expectations immediately before posting. Link to the working demo so readers can try it without signing up.

### Exact title

```text
Show HN: FeatherText – a lightweight, dependency-free rich-text editor
```

### Body

```text
Hi HN — I built FeatherText, a lightweight, dependency-free rich-text editor for plain JavaScript projects.

It enhances a textarea and keeps its value synchronized for forms. The current pre-1.0 build includes a configurable toolbar, 16 built-in themes, visual and source modes, history, counters, local draft autosave, and an HTML-focused API. package.json declares no runtime dependencies. The current minified build measures 27.90 KiB for JavaScript gzip and 4.57 KiB for CSS gzip.

Demo: https://misztersoul.github.io/FeatherText/
Source: https://github.com/MiszterSoul/FeatherText

The boundaries are intentional and documented: FeatherText stores HTML strings rather than a schema-backed document model, is not a complete sanitizer or collaboration service, and still uses document.execCommand behind a compatibility adapter for several formatting actions.

I would especially value feedback on the API boundary, source-mode workflow, browser/IME edge cases, and what evidence or behavior you would require before adopting a small editor like this.
```

## Product Hunt

Re-check Product Hunt’s current launch, maker, media, scheduling, comment, and solicitation rules before creating or scheduling the listing. Do not ask for upvotes.

### Listing fields

**Name**

```text
FeatherText
```

**Tagline — 46 characters**

```text
Rich-text editing without runtime dependencies
```

**Short description — 233 characters**

```text
FeatherText is a lightweight, dependency-free rich-text editor for plain JavaScript projects. It enhances textareas with a configurable toolbar, 16 built-in themes, visual and source modes, counters, history, and an HTML-focused API.
```

**Topics — confirm the current taxonomy before submission**

```text
Developer Tools · Open Source · Writing · Productivity
```

### Long description

```text
FeatherText gives plain JavaScript projects a ready-made rich-text editing surface without requiring a UI framework or declared runtime dependencies.

It enhances an existing textarea, keeps the textarea synchronized for forms and application code, and adds a configurable toolbar, 16 built-in themes, visual and source editing, history, counters, find/replace, opt-in local draft autosave, and an HTML-focused runtime API. Build outputs cover browser-global, ESM, CommonJS, CSS, and TypeScript declarations. The current minified build measures 27.90 KiB for JavaScript gzip and 4.57 KiB for CSS gzip.

FeatherText is MIT licensed and pre-1.0. It deliberately remains an HTML-string editor rather than a schema or collaboration platform. Its untrusted-HTML helper is a conservative baseline, not a complete sanitizer, and several formatting operations still use document.execCommand through a compatibility adapter. Integrating applications remain responsible for sanitization, storage, authorization, upload handling, output encoding, and end-to-end accessibility validation.

Try the live demo, inspect the source, and share the browser, input-method, API, or integration cases that should shape the path to 1.0.
```

### Maker comment

```text
Hi Product Hunt — I’m Peter, the maker of FeatherText. I built it for plain JavaScript projects that need a ready-made HTML editor without adopting a UI framework.

The current pre-1.0 build enhances a textarea and includes a configurable toolbar, 16 built-in themes, visual and source modes, counters, history, find/replace, opt-in local drafts, and methods for reading or updating HTML. package.json declares no runtime dependencies, and the project is MIT licensed. The current minified build is 27.90 KiB JavaScript gzip plus 4.57 KiB CSS gzip.

I’m launching with the boundaries visible: FeatherText is not a complete HTML sanitizer, collaboration system, or file host, and some formatting commands remain behind a document.execCommand compatibility adapter.

I’d value feedback on the API, source-mode workflow, and the browser/input cases that matter to your projects.

Demo: https://misztersoul.github.io/FeatherText/
Source and bug reports: https://github.com/MiszterSoul/FeatherText
Support development: https://buymeacoffee.com/devpeter
```

### FAQ

**What problem does FeatherText solve?**

```text
It adds a ready-made visual and source HTML editor to a textarea in a plain JavaScript project, while preserving the textarea value for normal forms and application code.
```

**Is it really dependency-free?**

```text
package.json declares no runtime dependencies. The repository does use development and build tooling, so “dependency-free” describes the shipped runtime rather than the contributor toolchain.
```

**How large is it?**

```text
The current minified build measures 27.90 KiB for JavaScript gzip and 4.57 KiB for CSS gzip. Those are separate compressed assets; the validated npm tarball is exactly 159,373 bytes and 11 files, not a network-transfer benchmark or evidence of publication.
```

**Does it sanitize HTML?**

```text
Not completely. FeatherText includes a conservative helper for untrusted HTML, but applications must apply their own reviewed sanitization, URL policy, server validation, output encoding, and CSP at the appropriate trust boundaries.
```

**Does it support collaboration or uploads?**

```text
It does not provide collaboration or host files. An application can supply an image-upload callback and remains responsible for upload security, storage, authorization, and returned URLs.
```

**What is the project status?**

```text
FeatherText is MIT licensed and pre-1.0. The current package metadata version is 0.3.1. No GitHub tags or releases exist yet, and the public npm registry returned 404 for feathertext on 2026-07-28; no publication claim is being made.
```

**Where can I get help or report a bug?**

```text
Report bugs at https://github.com/MiszterSoul/FeatherText/issues. Support development at https://buymeacoffee.com/devpeter.
```

### Prepared Product Hunt responses

**“Why not use another editor?”**

```text
Established editors may be a better fit when a project needs a schema-backed document model, collaboration, framework integrations, or a mature plugin ecosystem. FeatherText targets a narrower case: a ready-made, textarea-backed HTML editor for plain JavaScript with no declared runtime dependencies.
```

**“Is it production ready?”**

```text
I would not make a blanket production-readiness claim. It is pre-1.0, and adoption should follow an application’s own browser, accessibility, security, and content-validation requirements. The known boundaries are documented so teams can evaluate them directly.
```

**“Is it accessible?”**

```text
The project has semantic controls, keyboard behavior, focus styles, and bounded automated axe coverage, but that is not WCAG conformance or manual assistive-technology validation. Applications should perform end-to-end testing with their own configuration and users.
```

**“Which browsers do you support?”**

```text
The repository records bounded exact-version automation, not a latest-two or universal support promise. Check the current browser-support document and test the release in the exact environments your project requires.
```

**“Where is the npm package?”**

```text
I’m not claiming public npm availability in this launch. The public registry returned 404 for feathertext on 2026-07-28; the demo and source are available now, and the repository documents how to build the project from a checkout.
```

**“Can I support the project?”**

```text
Yes—technical feedback and focused bug reports are valuable. Financial support is available at https://buymeacoffee.com/devpeter.
```

### Gallery captions

Use these only after the corresponding real capture exists:

1. `A real FeatherText instance running on the project’s launch page.`
2. `The configurable toolbar and textarea-backed visual editing surface.`
3. `Source mode with line numbers, syntax coloring, wrapping, and indentation controls.`
4. `Independent theme selection using FeatherText’s built-in themes.`

Do not describe the SVG launch artwork as a screenshot or place it in a fake browser/device frame.

## Reddit variants

For every subreddit: re-check current rules and moderator guidance immediately before posting; confirm whether project showcases and direct links are allowed; use required flair/title formats; follow self-promotion ratios; and retain the explicit creator disclosure. Do not assume these drafts are currently permitted.

### `r/javascript` — implementation-focused variant

**Possible title, only if current rules permit this format**

```text
I built a dependency-free, textarea-backed rich-text editor in plain JavaScript
```

**Body**

```text
Creator disclosure: I built FeatherText.

It is a pre-1.0 rich-text editor for plain JavaScript projects. It enhances a textarea, keeps the value synchronized for forms, and provides browser-global, ESM, and CommonJS build outputs. The current UI includes a configurable toolbar, 16 built-in themes, visual/source modes, history, counters, find/replace, and local draft autosave. package.json declares no runtime dependencies.

Current minified build: 27.90 KiB JS gzip and 4.57 KiB CSS gzip.

Demo: https://misztersoul.github.io/FeatherText/
Source: https://github.com/MiszterSoul/FeatherText

Important boundaries: it is an HTML-string editor rather than a schema model, its HTML cleaner is not a complete sanitizer, and several formatting actions still use document.execCommand through an adapter.

I’d value code-level feedback on the API boundaries, selection/history handling, source-mode design, and browser or IME cases worth testing next.
```

### `r/webdev` — integration-focused variant

**Possible title, only if current rules permit showcases**

```text
I made a lightweight rich-text editor for plain JavaScript forms
```

**Body**

```text
Creator disclosure: I’m the maker of FeatherText.

I wanted a ready-made rich-text surface that could enhance an ordinary textarea without requiring a UI framework. FeatherText keeps the textarea synchronized, adds a configurable toolbar, 16 built-in themes, visual/source editing, counters, history, and an HTML-focused API, and declares no runtime dependencies.

Demo: https://misztersoul.github.io/FeatherText/
Code: https://github.com/MiszterSoul/FeatherText

It is MIT licensed and pre-1.0. It is not a complete sanitizer, collaboration platform, or file host; applications still own content security, persistence, authorization, uploads, and end-to-end accessibility testing.

If you integrate editors into forms, I’d appreciate feedback on the textarea lifecycle, source-editing workflow, and the minimum documentation you expect from a small editor library.
```

### `r/opensource` — contributor-focused variant

**Possible title, only if current rules permit project introductions**

```text
FeatherText: an MIT-licensed rich-text editor seeking focused technical feedback
```

**Body**

```text
Creator disclosure: I maintain FeatherText.

FeatherText is a pre-1.0, MIT-licensed rich-text editor for plain JavaScript. It has no declared runtime dependencies and enhances textareas with a configurable visual/source editing interface.

Repository: https://github.com/MiszterSoul/FeatherText
Live demo: https://misztersoul.github.io/FeatherText/
Bug reports: https://github.com/MiszterSoul/FeatherText/issues

I’m especially interested in reproducible reports around browser/input behavior, API lifecycle edges, documentation gaps, and narrowly scoped fixes. The project is not a complete sanitizer, schema engine, collaboration service, or file host, and several commands still use a documented document.execCommand compatibility boundary.

Please check the repository guidance before opening a change; issue discussion before a large PR is welcome.
```

## X

Re-check X’s current post length, link-card, media, disclosure, and automation rules before posting.

### Single post

```text
I built FeatherText: a lightweight, dependency-free rich-text editor for plain JavaScript.

Textarea-backed, 16 built-in themes, visual/source modes, MIT, and pre-1.0. Current build: 27.90 KiB JS gzip + 4.57 KiB CSS gzip.

https://misztersoul.github.io/FeatherText/
```

### Thread

```text
1/5 I built FeatherText for plain JavaScript projects that need a ready-made rich-text editor without adopting a UI framework.

Demo: https://misztersoul.github.io/FeatherText/
Source: https://github.com/MiszterSoul/FeatherText
```

```text
2/5 It enhances a textarea and keeps its value synchronized for forms. The current UI includes a configurable toolbar, 16 built-in themes, visual/source modes, counters, history, find/replace, and opt-in local drafts.
```

```text
3/5 package.json declares no runtime dependencies. The current minified build measures 27.90 KiB for JavaScript gzip and 4.57 KiB for CSS gzip.
```

```text
4/5 Honest boundaries: pre-1.0, HTML-string rather than schema-based, not a complete sanitizer or collaboration service, and several formatting operations still sit behind a document.execCommand compatibility adapter.
```

```text
5/5 I’m looking for feedback on the API, source-mode workflow, and browser/IME edge cases that matter in real projects.

Bugs: https://github.com/MiszterSoul/FeatherText/issues
Support: https://buymeacoffee.com/devpeter
```

## Technical article outline

Suggested destinations: a project blog, DEV Community, Hashnode, or another technical venue whose current rules have been checked. Use the venue’s canonical-link feature when reposting.

### Working title

```text
Building FeatherText: a textarea-backed rich-text editor with an honest pre-1.0 contract
```

### Thesis

A small editor can offer a useful ready-made interface without pretending to be a schema engine, security boundary, collaboration platform, or universally validated browser component.

### Outline

1. **The narrow problem**
   - Plain JavaScript projects sometimes need formatted HTML input without a framework runtime or hosted editor.
   - One-sentence positioning and the intended audience.
2. **Why enhance a textarea**
   - Preserve normal form submission and reset behavior.
   - Synchronize user and API mutations back to the original control.
   - Explain the generated wrapper/contenteditable tradeoff.
3. **The current architecture**
   - Browser-global, ESM, CommonJS, CSS, and TypeScript declaration outputs.
   - Configurable commands, independently themed instances, visual/source surfaces, dialogs, history, and plugins.
   - No declared runtime dependencies versus development/build dependencies.
4. **Source mode and the HTML contract**
   - HTML strings as state and interchange format.
   - Line numbers, syntax coloring, wrapping, indentation, and pairs.
   - Why source mode is a trusted-author path.
5. **Security boundaries**
   - Conservative untrusted-HTML helper versus a complete sanitizer.
   - Application ownership of sanitization, URL policy, validation, output encoding, CSP, storage, and authorization.
   - Upload callbacks do not make FeatherText a file host.
6. **Compatibility debt made explicit**
   - Isolating deprecated `document.execCommand()` behavior behind an adapter.
   - Why containment helps testing but does not erase browser differences.
7. **Size, with a reproducible definition**
   - Current minified artifacts: 27.90 KiB JS gzip and 4.57 KiB CSS gzip.
   - Keep JS and CSS separate; document gzip settings and commit when publishing measurements.
   - Avoid speed, competitor, network, or package-size conclusions from asset bytes.
8. **Evidence without overclaiming**
   - Distinguish bounded exact-version automation and axe checks from product-wide certification.
   - Explicitly avoid latest-two-browser, Lighthouse, WCAG, assistive-technology, and physical-device claims.
9. **Current limitations and pre-1.0 decisions**
   - HTML-string model, no collaboration/file hosting, incomplete sanitizer, local unencrypted drafts, compatibility adapter, and evolving API.
10. **What feedback would be most useful**
    - API/lifecycle clarity, source workflow, browser/IME cases, security-documentation gaps, and adoption criteria.
11. **Try and inspect**
    - Demo, repository, bug-report URL, and exact support URL.

### Article fact box

```text
License: MIT
Status: pre-1.0
Runtime dependencies: none declared
Current minified assets: 27.90 KiB JavaScript gzip; 4.57 KiB CSS gzip
Demo: https://misztersoul.github.io/FeatherText/
Source: https://github.com/MiszterSoul/FeatherText
Bugs: https://github.com/MiszterSoul/FeatherText/issues
Support development: https://buymeacoffee.com/devpeter
```

## Directory copy

Re-check each directory’s current eligibility, licensing, backlink, screenshot, duplicate-listing, AI-content, and promotional-language rules before submitting.

### One-line listing

```text
A dependency-free, textarea-backed rich-text editor for plain JavaScript projects.
```

### Short listing

```text
FeatherText is an MIT-licensed, pre-1.0 rich-text editor for plain JavaScript. It enhances textareas with a configurable toolbar, 16 built-in themes, visual and source modes, counters, history, and an HTML-focused API, with no declared runtime dependencies.
```

### Long listing

```text
FeatherText is a lightweight, dependency-free rich-text editor for plain JavaScript projects. It enhances a textarea while keeping its value synchronized for normal forms and application code. The pre-1.0 editor includes a configurable toolbar, 16 built-in themes, visual and source modes, counters, history, find/replace, opt-in local drafts, and an HTML-focused runtime API. Current build outputs cover browser-global, ESM, CommonJS, CSS, and TypeScript declarations; the minified assets measure 27.90 KiB JavaScript gzip and 4.57 KiB CSS gzip. FeatherText is MIT licensed. It is an HTML-string editor, not a complete sanitizer, schema engine, collaboration service, or file host.
```

### Structured fields

| Field                | Approved entry                                                            |
| -------------------- | ------------------------------------------------------------------------- |
| Category             | Developer tool / rich-text editor / open source                           |
| License              | MIT                                                                       |
| Status               | Pre-1.0                                                                   |
| Price                | Open-source library; no hosted paid service is offered by this repository |
| Platforms            | Web; do not state latest-two or universal browser support                 |
| Frameworks           | Plain JavaScript core; no official framework wrappers claimed             |
| Runtime dependencies | None declared                                                             |
| Size                 | 27.90 KiB minified JavaScript gzip; 4.57 KiB minified CSS gzip            |
| Repository           | `https://github.com/MiszterSoul/FeatherText`                              |
| Demo                 | `https://misztersoul.github.io/FeatherText/`                              |
| Bug reports          | `https://github.com/MiszterSoul/FeatherText/issues`                       |
| Support development  | `https://buymeacoffee.com/devpeter`                                       |
| npm                  | Omit; make no availability or publication claim                           |

Suggested search terms, only where directory rules allow them: `rich text editor`, `WYSIWYG`, `JavaScript`, `textarea`, `HTML editor`, `open source`, `MIT`, `dependency-free`.

### Directory submission checklist

- [ ] Re-check the directory’s current submission and self-promotion rules.
- [ ] Confirm the project is eligible by license, age, platform, pricing, and category.
- [ ] Search for an existing FeatherText listing to avoid a duplicate.
- [ ] Use the canonical site and repository URLs exactly as listed above.
- [ ] Label GitHub Issues as bug reports and `https://buymeacoffee.com/devpeter` as support development.
- [ ] Omit npm fields and install copy.
- [ ] Use only the approved size wording and remeasure it from the release commit.
- [ ] Do not select badges for Lighthouse, accessibility conformance, assistive technology, or latest-two browsers.
- [ ] Confirm whether backlinks, tracking parameters, or affiliate links are required or prohibited.
- [ ] Confirm image dimensions, formats, file-size limits, and screenshot requirements.
- [ ] Upload exported artwork as artwork; upload real captures as screenshots. Never swap those labels.
- [ ] Keep creator/maintainer disclosure where required.
- [ ] Save the submitted copy, date, listing URL, owner account, and moderation status.
- [ ] Re-check the published listing for altered claims, broken links, and stale cached media.

## Asset inventory and capture plan

### Existing launch artwork

| Asset                           | Verified native dimensions | Intended use                                        |
| ------------------------------- | -------------------------: | --------------------------------------------------- |
| `site/assets/launch-social.svg` |                   1200×630 | Source artwork for a landscape social/OG export     |
| `site/assets/launch-square.svg` |                  1200×1200 | Source artwork for a square directory/social export |

These SVG files are launch artwork, not product screenshots or animated GIFs. No real screenshot, PNG export, or GIF is claimed to exist by this kit.

### 1. Build and identify the release candidate

- Start from the exact intended release commit and record its SHA and dirty-tree status.
- Run `npm ci`, the current test suite, build, size check, and package smoke check.
- Serve the same `site/` and `dist/` layout intended for the live deployment.
- Record browser, OS, viewport, device-pixel ratio, and capture time.

### 2. Export the existing artwork

With a reviewed local Inkscape installation:

```bash
inkscape site/assets/launch-social.svg --export-type=png --export-filename=site/assets/launch-social.png --export-width=1200 --export-height=630
inkscape site/assets/launch-square.svg --export-type=png --export-filename=site/assets/launch-square.png --export-width=1200 --export-height=1200
```

Inspect each export at 100%, verify metadata and dimensions, and optimize losslessly. Use another exporter only after checking that it preserves dimensions, text, gradients, and transparency.

### 3. Capture the real product

Capture the verified release artifact with no DevTools panels, extensions, private data, or fabricated UI:

- desktop landing page plus live editor at 1440×900 CSS pixels;
- desktop source mode at 1440×900 CSS pixels;
- mobile layout at 390×844, labeled as a real device or emulator accurately;
- optional theme contact sheet assembled from separate real captures rather than recolored mockups;
- optional short GIF/video showing a real visual-to-source workflow, only after recording it from the release artifact.

Use deterministic sample content. Do not remove genuine browser behavior in post-production. If focus indicators are featured, describe what input produced them.

### 4. Produce platform-specific crops

- Product Hunt gallery: follow the dimensions and file rules current on launch day.
- Article hero: retain readable text and meaningful real UI.
- Directory thumbnail: use square launch artwork or a real square crop according to current rules.
- Social card: export the existing 1200×630 launch artwork.
- Add concise alt text that describes only what is actually visible.

### 5. Verify files and previews

- Confirm each asset’s MIME type, pixel dimensions, file size, and anonymous public URL.
- Test the canonical Pages URL in the target platforms’ current preview tools.
- Use a verified PNG for platforms that do not reliably render SVG card images.
- Refresh stale card caches using each platform’s current process.
- Check light and dark browser chrome around transparent edges.
- Confirm every real screenshot/GIF matches the released version and is labeled accurately.

## General response kit

### Security

```text
FeatherText is not a complete HTML sanitizer. Its conservative untrusted-HTML helper reduces some risk, but source and trusted-HTML paths can place HTML directly into the editing DOM. Applications must own authoritative sanitization, URL policy, validation, output encoding, and CSP: https://github.com/MiszterSoul/FeatherText/blob/main/docs/security.md
```

### Size

```text
The current minified build measures 27.90 KiB for JavaScript gzip and 4.57 KiB for CSS gzip. These are separate compressed asset measurements, not a package, load-time, or competitor-performance claim.
```

### Accessibility and browsers

```text
The repository has bounded exact-version browser automation and automated axe checks. Those results do not establish latest-two-browser support, WCAG conformance, manual assistive-technology compatibility, physical-device coverage, or a Lighthouse result. Integrators should test their exact configuration and required environments.
```

### Availability

```text
The live demo and source repository are available now. The public npm registry returned 404 for feathertext on 2026-07-28, so this launch makes no public npm availability or publication claim.
```

### Support versus bugs

```text
Please report reproducible bugs at https://github.com/MiszterSoul/FeatherText/issues. To support development, use https://buymeacoffee.com/devpeter.
```

## Post-launch operations

- Monitor GitHub Issues for reproducible bugs and use the repository’s private security-reporting process for vulnerabilities.
- Answer in each community rather than dropping links and leaving.
- Log recurring setup, browser, accessibility, and security questions into documentation.
- Correct inaccurate size, support, compatibility, accessibility, or availability statements promptly and publicly.
- Do not promise roadmap dates under launch pressure.
- Collect or preserve launch metrics only where collection and privacy terms are understood and disclosed.
- Re-run the current-rules check before every follow-up post, not only on launch day.
