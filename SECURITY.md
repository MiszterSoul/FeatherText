# Security Policy

FeatherText edits and returns HTML. Integrating applications remain responsible for classifying content, enforcing authorization, sanitizing at the authoritative boundary, validating uploads and URLs, and rendering output safely.

## Supported versions

`package.json` currently declares `0.3.1`. The public npm registry returned `404 Not Found` for `feathertext` on 2026-07-28, and no GitHub tags or releases exist yet. Because no public release line is verified, security fixes currently target the default branch on a best-effort basis.

| Version                          | Security support                                                  |
| -------------------------------- | ----------------------------------------------------------------- |
| Default branch                   | Best effort                                                       |
| Unpublished repository snapshots | Best effort; update to a commit containing the fix                |
| Future releases                  | This table will be replaced with explicit supported release lines |

No acknowledgement or remediation SLA is currently offered.

## Reporting a vulnerability

Prefer GitHub’s private vulnerability-reporting form:

<https://github.com/MiszterSoul/FeatherText/security/advisories/new>

Repository settings control whether that form is available. If it is unavailable, contact the repository owner through a private method listed at <https://github.com/MiszterSoul> and request a private security channel. Do not include exploit details, sensitive editor content, or personal data in a public issue.

Include:

- affected commit or version;
- a minimal reproduction or proof of concept;
- realistic impact and attack prerequisites;
- whether attacker-controlled HTML, source text, URLs, clipboard data, files, storage, plugin code, or configuration is required;
- browser, operating system, and relevant policy settings;
- suggested mitigation, if known;
- whether disclosure is already public.

The maintainer will investigate, coordinate a fix/advisory where warranted, and credit reporters who request credit. Timing depends on severity and maintainer availability.

## Security boundary

FeatherText provides useful guardrails, but it is not a sandbox or complete sanitizer.

### Trusted HTML paths

The following paths can apply HTML directly and must receive trusted, application-controlled content:

- initial textarea/form-control content;
- `setHTML()`;
- source-mode editing and leaving source mode;
- `pasteIntoSource()`;
- source-mode find/replace;
- restored autosave drafts containing previously trusted/source content;
- plugin or custom-button code that writes DOM/HTML directly.

**Source mode is explicitly a trusted-author feature.** Source text is assigned directly to the visual editor when source mode is left. Do not expose source mode to attacker-controlled content or treat its output as sanitized.

### Untrusted HTML baseline

`setUntrustedHTML()` and `sanitizeUntrustedHTML()` apply a deliberately conservative allowlist. The implementation removes forbidden/unsupported active elements, comments, style/class/id/event/srcdoc attributes, unsafe URL schemes, unsafe image sources, and invalid bounded numeric attributes. New-window links are normalized to `rel="noopener noreferrer"`.

HTML clipboard input—including HTML returned by `pasteFilter`—passes through the same baseline before insertion. `sanitizePaste: true` is only the `pasteMode: "auto"` choice to prefer plain text; it is not itself the sanitizer.

The baseline is intentionally small and is **not a complete sanitizer or application security boundary**. Use a maintained, application-reviewed sanitizer and server-side controls appropriate to your allowed schema.

### URL and media policy

Purpose-specific URL helpers currently:

- allow HTTP(S), `mailto:`, `tel:`, and relative links where appropriate;
- allow HTTP(S) and relative image sources;
- reject active schemes such as `javascript:`, `data:`, `vbscript:`, and `file:`;
- restrict video insertion to normalized HTTPS YouTube No-Cookie or Vimeo player embeds;
- require absolute HTTP(S) URLs for external attribution/support links;
- omit unsafe custom `projectUrl` and `supportUrl` links.

These checks do not replace application host allowlists, privacy review, download/upload controls, or server validation. Remote images and frames disclose request metadata to third parties.

### Upload and autosave adapters

`imageUpload` is application code. FeatherText validates only the returned URL shape before insertion; the application must validate file content, size, dimensions, authorization, malware policy, storage location, and serving headers.

Autosave defaults to browser `localStorage` when enabled, or a caller-provided storage-shaped adapter. Draft HTML is not encrypted or reclassified. Choose keys carefully, consider shared-device privacy, handle quota/availability, and clear drafts according to product retention policy.

## Required application controls

Before storing or rendering editor output:

1. classify every input path as trusted or untrusted;
2. apply an allowlist sanitizer at the authoritative trust boundary;
3. validate URL schemes and hosts for the product’s policy;
4. validate and authorize uploads outside the editor;
5. enforce server-side content-size and resource limits;
6. encode output for every non-HTML context;
7. deploy and test a restrictive Content Security Policy as defense in depth;
8. re-sanitize stored content when policy changes require it.

`maxLength` limits some visual typing through `beforeinput`; it is not a server limit and does not cover every API/source/IME path.

See [`docs/security.md`](docs/security.md) for integration details, CSP/Trusted Types notes, and a consumer checklist.

## Dependency and release security

The package declares no runtime dependencies. Build and test dependencies still require routine lockfile review and auditing. Do not infer a current audit result from historical repository documents.

The intended release process uses short-lived OIDC/Trusted Publishing and provenance rather than embedding long-lived secrets in source. Verify the actual workflow, package contents, provenance, hashes, and clean-install smoke tests for every release; see [`docs/releasing.md`](docs/releasing.md).
