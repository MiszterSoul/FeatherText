# Security and safe integration

This document describes the current implementation boundary. For private vulnerability reporting, see [`../SECURITY.md`](../SECURITY.md).

## Executive boundary

FeatherText is a client-side HTML editor with conservative guardrails. It is **not** a sandbox, complete sanitizer, authorization system, upload service, encrypted storage layer, or server-side validator.

The most important distinction is:

- use `setHTML()` and source mode only for **trusted** HTML/authors;
- use `setUntrustedHTML()` only as a conservative baseline before your application’s authoritative sanitizer and policy;
- never treat source-mode output or restored source drafts as sanitized.

## Trust-path matrix

| Input/path                        | Current handling                                                   | Required application stance                                          |
| --------------------------------- | ------------------------------------------------------------------ | -------------------------------------------------------------------- |
| Initial textarea value            | Assigned through the trusted content path                          | Sanitize before placing untrusted stored content in the host         |
| `setHTML(html)`                   | Direct trusted HTML assignment                                     | Caller must trust/sanitize first                                     |
| `setUntrustedHTML(html)`          | Conservative built-in allowlist                                    | Useful baseline, not a complete security boundary                    |
| `sanitizeUntrustedHTML(html)`     | Returns baseline-cleaned HTML                                      | Apply/verify the application’s own schema and server policy          |
| Source mode / `pasteIntoSource()` | Raw source is applied directly as HTML                             | Trusted authors/content only                                         |
| Source find/replace               | Edits raw source; no baseline sanitizer                            | Trusted authors/content only                                         |
| Clipboard text                    | Inserted as text                                                   | Still enforce size/business rules                                    |
| Clipboard HTML                    | Always baseline-cleaned before insertion                           | Re-sanitize at the authoritative boundary                            |
| HTML returned by `pasteFilter`    | Baseline-cleaned before insertion                                  | Hook code and resulting policy remain application responsibilities   |
| Link/image URLs                   | Purpose-specific scheme checks                                     | Add product host/privacy policies                                    |
| Video URLs                        | Normalized only to fixed HTTPS YouTube No-Cookie/Vimeo player URLs | Decide whether remote frames are permitted at all                    |
| `imageUpload` result              | URL policy check before insertion                                  | Validate/authenticate/host file in application code                  |
| Autosave draft                    | Stores/restores current HTML and mode                              | Same trust level as source content; apply retention/privacy controls |
| Plugins/custom buttons            | Application JavaScript with editor access                          | Fully trusted extension code                                         |
| `projectUrl`/`supportUrl`         | Absolute HTTP(S) external-link policy; unsafe links omitted        | Supply trusted destinations                                          |

## Conservative untrusted-HTML baseline

`sanitizeUntrustedHTML()` parses into a `<template>`, recursively cleans it, and serializes the result.

### Allowed elements

The baseline allows a small formatting/document set: links, common inline emphasis, headings, paragraphs/divisions, blockquotes, code/pre, figures/captions, images, lists, horizontal rules, and table structures.

Active/form/embedded structures—including `script`, `style`, `iframe`, `object`, `embed`, `svg`, `math`, `form`, inputs/selects/textareas/buttons, templates, metadata, and links—are removed. Unsupported non-forbidden wrappers are unwrapped so their text/allowed descendants can remain. Comments are removed.

### Attributes

The baseline:

- removes event-handler attributes, `srcdoc`, `style`, `id`, and `class`;
- keeps only a small global/element-specific set plus `aria-*`;
- validates link and image URLs;
- bounds width/height, row/column span values;
- permits only `_blank` as a retained target;
- forces `rel="noopener noreferrer"` on `_blank` links;
- removes images without a safe `src`.

This policy deliberately discards styling and many application-specific semantics. It may be too strict for one product and still insufficient for another. A maintained sanitizer configured for the application’s exact schema remains required.

## Paste behavior

`sanitizePaste` is historical naming for automatic mode selection:

- `pasteMode: "auto"` plus `sanitizePaste: true` chooses clipboard plain text;
- `pasteMode: "auto"` plus `sanitizePaste: false` chooses clipboard HTML when available;
- explicit `pasteMode: "text"` or `"html"` overrides that choice.

Whichever option selects HTML, `handlePaste()` still passes the HTML through `sanitizeUntrustedHTML()` before `insertHTML`. A `pasteFilter` may return text, an HTML payload, a string (treated as text), `false` to block, or a falsy value to continue; HTML filter output is also baseline-cleaned.

This only governs clipboard handling. It does not sanitize initial content, trusted `setHTML()`, source mode, restored drafts, or direct plugin DOM writes.

## Source mode is trusted

Source mode is intentionally an HTML authoring surface, not a safe preview or sandbox.

- Entering source mode copies current visual `innerHTML` into the source textarea.
- Source typing synchronizes the original form control.
- Leaving source mode assigns the source string directly to visual `innerHTML`.
- `pasteIntoSource()` and source find/replace directly update source HTML.
- Lightweight source highlighting escapes the overlay for display, but that overlay escaping does **not** sanitize the value later applied to the editor.

Do not offer source mode to untrusted users unless the complete resulting value is passed through an authoritative sanitizer before any DOM rendering/storage and the product accepts that sanitization may alter source.

## URL and media policy

`normalizeSafeUrl()` rejects control characters and active/local schemes including `javascript:`, `data:`, `vbscript:`, and `file:`.

Current purpose policies are:

- links: HTTP(S), `mailto:`, `tel:`, and relative paths;
- images: HTTP(S) and relative paths;
- external attribution/support links: absolute HTTP(S) only;
- videos: input HTTP(S), then fixed normalized embeds for supported YouTube/YouTube No-Cookie or Vimeo URL shapes.

Inserted links open in a new context with `rel="noopener noreferrer"`. Video insertion emits an iframe only for `https://www.youtube-nocookie.com/embed/...` or `https://player.vimeo.com/video/...`.

These checks prevent several common active schemes; they do not provide product-specific host reputation, redirects, signed URL validation, content-type verification, privacy consent, or download policy. Remote media discloses a viewer’s IP address and request metadata.

## Upload adapter

FeatherText has no upload backend. `imageUpload(file, editor)` is application code and may return a URL string or `{ url, alt }`. The returned URL is checked by the image URL policy before insertion.

The application must enforce:

- authorization and ownership;
- type detection from file contents, not only MIME/name;
- size, dimension, decompression, and metadata limits;
- malware/content policy;
- safe filenames/storage keys;
- private/public serving rules, response headers, and expiry;
- deletion/retention and abuse handling.

Pasted image files use the same hook when configured.

## Autosave and local data

Enabled autosave stores `{ version: 1, html, mode, updatedAt }` in a storage-shaped adapter, defaulting to `window.localStorage`. It does not send network requests, encrypt data, resolve conflicts, or sanitize drafts.

Security/privacy considerations:

- use an explicit stable, namespaced key for intended reload recovery;
- avoid putting secrets/user identifiers in keys;
- consider shared-browser profiles and local access by other scripts on the same origin;
- define retention/clear behavior;
- handle quota, disabled storage, and private-browsing differences;
- treat restored source-mode drafts as trusted raw HTML;
- do not use local autosave as the authoritative record.

## Forms, read-only, and disabled state

The hidden original textarea remains the form value. Read-only/disabled state blocks editor mutation and mirrors compatible host properties, but UI state is not authorization. A user can still call application JavaScript, alter requests, or submit different values. Enforce authorization and validation on the server.

`maxLength` blocks a subset of overflowing visual text insertion through `beforeinput`. It does not cover every source/API/IME/programmatic path and is not a resource or server-side limit.

## Plugins and custom controls

Plugins, callbacks, `pasteFilter`, `imageUpload`, and custom button handlers run with page/editor authority. They can bypass built-in content and URL paths by manipulating DOM directly. Load only trusted extension code, pin its supply chain, and include it in security review.

The named plugin and button registries are module-level shared state. Avoid allowing untrusted configuration to select arbitrary registered code.

## Content Security Policy

The editor uses inline style properties for wrapper theme/dimensions, toolbar color/style operations, source presentation, tooltip positions, and formatting. A policy that blocks style attributes can prevent behavior.

A starting policy for a self-hosted integration, adjusted to actual product media/network requirements, is:

```text
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' data: https:;
frame-src https://www.youtube-nocookie.com https://player.vimeo.com;
font-src 'self';
connect-src 'self';
media-src 'self' https:;
object-src 'none';
base-uri 'none';
form-action 'self';
frame-ancestors 'self';
upgrade-insecure-requests
```

Why `'unsafe-inline'` appears only in `style-src`: current code writes style attributes. Do not add `'unsafe-inline'` to `script-src` for FeatherText. Tighten `img-src`, `frame-src`, `connect-src`, and `media-src` when those features are absent. CSP is defense in depth, not sanitization.

The framework-free project site itself loads local scripts, styles, generated editor assets, and SVGs only. It includes no remote widget, script, font, or analytics integration. User-triggered editor media can still request permitted remote hosts.

## Trusted Types

Current code assigns strings to `innerHTML` and does not accept or create a Trusted Types policy. Applications enforcing `require-trusted-types-for 'script'` should treat FeatherText as incompatible until all sinks and an application-controlled policy contract are implemented and tested. Do not disable Trusted Types globally without a deliberate review.

## Resource and denial-of-service controls

Apply server and application limits for:

- total HTML/text length and nesting depth;
- pasted content and files;
- table dimensions (the editor defaults to 20×20, but server policy must agree);
- image/media count and dimensions;
- autosave frequency/storage quota;
- source highlighting and very large documents;
- plugin-generated content.

`sourceHighlightThreshold` reduces token-node work above its threshold; it does not make arbitrary document sizes safe.

## Supply chain and release

The package declares no runtime dependencies. Development uses esbuild, ESLint, JSDOM, Playwright, and axe integration plus their transitive dependencies. Audit the current lockfile rather than relying on historical reports.

For release:

1. install from the lockfile in a clean runner;
2. run core, E2E, and accessibility checks;
3. inspect package contents and generated manifests;
4. publish through the reviewed short-lived credential/provenance path;
5. verify registry provenance, hashes, ESM/CJS/global/type entry points, and clean-install smoke tests;
6. retain a rollback/deprecation plan.

See [`releasing.md`](releasing.md).

## Consumer checklist

- [ ] Trusted and untrusted HTML/source paths are explicitly separated.
- [ ] Untrusted HTML is sanitized at the authoritative boundary with an application policy.
- [ ] Source mode is limited to trusted authors/content or sanitized before rendering.
- [ ] Link, image, video, and attribution hosts match product policy.
- [ ] Uploads are validated, authorized, scanned, stored, and served by application code.
- [ ] Autosave key, privacy, retention, quota, and restore trust are reviewed.
- [ ] Server-side content/resource/authorization limits exist.
- [ ] Plugins, filters, callbacks, and custom buttons are trusted and reviewed.
- [ ] CSP and any Trusted Types requirements are tested with the actual configuration.
- [ ] Stored content is encoded for every non-HTML context.
- [ ] Security fixes can be deployed from a pinned version without a floating CDN tag.
