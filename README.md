FeatherText – Lightweight Rich Text Editor
=========================================

FeatherText is a small, dependency‑free WYSIWYG rich text editor that you can drop into any HTML page. It ships as a single CSS + JS pair, supports multiple themes, a flexible toolbar, and a clean, well‑documented API for runtime control.

Live site (GitHub Pages):
- https://misztersoul.github.io/FeatherText/


## Features

- Zero dependencies; just include one CSS and one JS file
- Built‑in themes: dark, light, ocean, forest, dark-b
- Configurable toolbar (groups, separators, color pickers, dropdowns)
- Clean API: get/set HTML, dynamic toolbar/theme changes, add/remove buttons
- Paste sanitization, autosave, word/char counters, max length
- Keyboard shortcuts for common actions (Ctrl/Cmd + B, I, U, K, Z, Y)


## Quick start

1) Include the assets on your page (from dist/):

```html
<link rel="stylesheet" href="dist/feathertext.css">
<script src="dist/feathertext.min.js"></script>
```

2) Add a textarea and initialize:

```html
<textarea id="editor" data-placeholder="Write something…"><p>Hello <b>world</b>!</p></textarea>
<script>
	// Optional: set initial theme on the root element
	document.documentElement.setAttribute('data-theme', 'dark');

	// Create one or more editors (returns an array of instances)
	const [editor] = FeatherText.init('#editor', {
		theme: 'dark',
		sanitizePaste: true,
		headings: ['P','H1','H2','H3'],
		toolbar: [
			'format','bold','italic','underline','|',
			'link','image','|','ul','ol','|',
			'alignleft','aligncenter','alignright','|',
			'forecolor','backcolor','|','undo','redo','|','source'
		]
	});

	// Example API call
	console.log(editor.getHTML());
	// editor.setHTML('<p>New content</p>');
</script>
```

Open the HTML file directly in your browser, or serve the folder locally.

Local demo:

```powershell
1) Build once: npm run build
2) Serve demo: npm run dev
3) Open http://localhost:5173/demo/
```
 - Sticky source header with language selector (HTML/CSS/JS/XML/JSON)
 - Always-visible Copy/Paste buttons in toolbar
 - Clear Formatting button and color pickers with a Clear color action
```

- selector: CSS selector for one or more textareas to transform
- config: optional configuration object (see below)
- returns: array of editor instances (in the same order as matched elements)


## Configuration options

- theme: string | object
	- One of: 'dark' | 'light' | 'ocean' | 'forest' | 'dark-b', or a custom object with color tokens
- toolbar: array of items, groups separated by '|'
	- Items: 'format','fontname','fontsize','bold','italic','underline','strikethrough','link','unlink','image','video','table','ul','ol','indent','outdent','alignleft','aligncenter','alignright','alignjustify','blockquote','code','hr','forecolor','backcolor','undo','redo','fullscreen','source'
- headings: array of heading tags to offer in the Format dropdown
	- Default: ['P','H1','H2','H3','H4','H5','H6']
- sanitizePaste: boolean (default true) – paste as plain text when enabled
- placeholder: string – placeholder text
- autosave: boolean – enable localStorage autosave
- autosaveInterval: number (ms, default 30000)
- wordCount: boolean (default true)
- charCount: boolean (default true)
- maxLength: number | null – hard cap on characters
- height: number | 'auto' – fixed editor height; when 'auto', it grows
- minHeight: number (px)
- maxHeight: number (px)
- fonts: string[] – choices for the Font Family dropdown
- fontSizes: string[] – CSS sizes for Font Size dropdown (e.g. '12px','14px',...)
- colors: string[] – palette used by color pickers
		toolbar: ['format','bold','italic','underline','|','link','image','|','ul','ol','|','forecolor','backcolor','|','undo','redo','|','clearformat','source','copy','paste'],
		startInSource: false

Callbacks:

- onReady(editor)
- onChange(html, editor)
- onFocus(editor)
- onBlur(editor)
- onPaste(event, editor)
- onKeydown(event, editor)

## Instance API
Given `const [editor] = FeatherText.init('#editor', config)`:
  - Also available: 'clearformat' (remove formatting), 'copy', 'paste'

- setHTML(html: string): void – replace entire content
 - startInSource: boolean – if true, editor opens in Source mode by default
- undo(): void – step back in history
- redo(): void – step forward in history
- toggleFullscreen(): void – enter/exit fullscreen mode
- toggleSource(): void – toggle HTML source editing textarea

 - copyAction(): void – copy current selection (WYSIWYG or source)
 - pasteAction(): void – paste plain text (respects sanitizePaste)
 - clearFormatting(): void – remove formatting from selected text
```js
editor.setTheme({
	bg: '#121212', panel: '#1e1e1e', border: '#333',
	accent: '#8ab4ff', text: '#e6e9ef', muted: '#98a2b3', hover: '#222'
});
```

The editor sets CSS variables on :root with prefix --feather- (bg, panel, border, accent, text, muted, hover). You can customize styling in your own CSS using these variables.


## Examples in this repo

- example.html – smallest setup using dark theme
- example-basic.html – light theme with minimal toolbar
- example-ocean.html – ocean theme with extended toolbar
- example-api.html – buttons demonstrating runtime API control
- config-generator.html – interactive snippet generator with live preview


## Tips & notes

### GitHub Pages first-time setup

If the Pages deploy job fails with a 404 on first run, enable Pages once:

- Repo Settings → Pages → Build and deployment → Source: GitHub Actions
- Repo Settings → Actions → General → Workflow permissions: Read and write permissions

This repo's `pages.yml` includes `actions/configure-pages@v5`, `upload-pages-artifact`, and `deploy-pages@v4`. After enabling the settings above, re-run the failed job or push a new commit to deploy the site.

### Release & publish workflow

When you bump the version in `package.json` and create a matching Git tag, CI takes care of everything:

1) Bump version (choose one):
	- `npm version patch` (or `minor` / `major`) – creates a commit and tag like `v0.1.1`
	- Or manually edit `package.json` and create the tag yourself: `git tag v0.1.1`

2) Push commits and tags:
	- `git push && git push --tags`

3) GitHub Actions (release.yml) will:
	- Install deps and build `dist/` (minified IIFE, ESM, CJS, CSS)
	- Verify the tag matches `package.json` version
	- Create a GitHub Release and attach the built files
	- Publish the package to npm (requires `NPM_TOKEN` secret)

CDN usage (after npm publish):

- jsDelivr: `https://cdn.jsdelivr.net/npm/feathertext@latest/dist/feathertext.min.js`
- unpkg:   `https://unpkg.com/feathertext@latest/dist/feathertext.min.js`

Pin to a specific version by replacing `latest` with the version number (e.g., `@0.1.0`).

## License
## Toolbar reference
