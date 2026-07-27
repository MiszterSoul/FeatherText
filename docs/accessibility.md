# Accessibility

## Conformance status

FeatherText has automated accessibility coverage, but it has **not** completed a WCAG conformance assessment. No repository evidence records a manual screen-reader, voice-control, speech-input, switch-input, magnifier, physical-device, or full zoom/forced-colors protocol. No Lighthouse accessibility result is claimed.

Do not represent FeatherText as WCAG 2.1/2.2 A, AA, or AAA conformant from the current evidence.

## Automated evidence

The current accessibility command runs **12 full-document axe checks**:

- six scenarios in Chromium 151;
- the same six scenarios in the Mobile Chrome profile.

The six scenarios per project are:

1. generated site/demo at a desktop viewport;
2. generated site/demo at 320px;
3. standalone editor at a desktop viewport;
4. local image dialog at a desktop viewport;
5. standalone editor at 320px;
6. local table dialog at 320px.

The axe helper scans the complete document without rule disables or element exclusions. These checks are in addition to the 85 Playwright E2E executions described in [`browser-support.md`](browser-support.md), including automated toolbar keyboard navigation, 320px overflow, reduced motion, forms, dialogs/focus restoration, read-only/disabled behavior, and RTL/emoji round trips.

An axe pass catches a useful subset of machine-detectable issues. It does not prove usability, correct announcements, complete keyboard operation, content quality, WCAG conformance, or compatibility with assistive technology.

## Implemented semantics and behavior

Current source includes:

- `role="toolbar"` and accessible names for main/source toolbars;
- a configurable visual editing name with `role="textbox"`, `aria-multiline="true"`, and `aria-readonly` state;
- a native source `<textarea>` with configurable `sourceAriaLabel`;
- native buttons, inputs, checkboxes, number fields, file fields, and selects with programmatic labels;
- active-state `aria-pressed` on source settings and common formatting buttons;
- visible `:focus-visible` outlines;
- Arrow Left/Right with wraparound plus Home/End toolbar navigation;
- Ctrl/Cmd shortcuts for find, bold, italic, underline, link, undo, and redo;
- local tooltips with `role="tooltip"`;
- local standard and find/replace dialogs with `role="dialog"`, `aria-modal="true"`, labelled titles, Escape cancellation, focus containment, and focus restoration;
- dialog errors with `role="alert"` and async `aria-busy` state;
- find-result and autosave state messages with polite live/status behavior;
- image alternative-text input in the image dialog;
- secure project/support attribution links with accessible labels and titles;
- semantic read-only/disabled state mirrored to compatible original controls;
- an `aria-hidden` source gutter/highlight overlay so the native textarea remains the exposed source control;
- an automatic high-contrast theme choice when forced colors or increased contrast is reported.

The implementation uses local dialogs; browser `prompt()` is absent.

## Known risks and unverified areas

- `contenteditable` and deprecated `execCommand()` behavior varies across browser/assistive-technology combinations.
- Toolbar controls remain individually tabbable; Arrow/Home/End support is automated, but no manual ARIA-pattern assessment is recorded.
- Active formatting state is announced only for a subset of commands.
- Native color-input behavior inside the custom control has not been manually verified with screen readers or voice control.
- Source highlighting overlays transparent visual text. Caret, selection, magnification, forced-colors, and speech-input behavior need manual review.
- Fullscreen is a layout class, not the browser Fullscreen API or a modal focus scope.
- The image dialog requests alternative text but cannot determine whether supplied text is meaningful.
- Inserted tables do not provide a caption/header/scope authoring workflow.
- Custom themes can create insufficient contrast; built-ins still need a documented contrast measurement and manual high-contrast review.
- `fancy` and theme transitions are optional; reduced-motion site behavior has an automated smoke test, but editor motion preference handling is not a complete audit.
- Find/replace, draft restore, and media/table dialogs need manual announcement/error-recovery tests.
- The hidden original textarea’s visible `<label>` does not automatically label the generated surface; applications must provide an accurate `ariaLabel`.
- Axe scenarios do not cover every toolbar composition, custom button, plugin, application validation message, or inserted-content structure.

## Integration responsibilities

Applications should:

1. provide a visible `<label>` for the original textarea and a matching, accurate `ariaLabel`/`sourceAriaLabel` for generated surfaces;
2. explain purpose, constraints, required state, and validation outside placeholder text;
3. provide accessible save/cancel/error/success status around the editor;
4. sanitize untrusted HTML without indiscriminately removing accessibility semantics;
5. keep source mode restricted to trusted users/content and explain its HTML-oriented behavior;
6. require meaningful image alternatives and provide table caption/header workflows when those features are enabled;
7. avoid color-only meaning and validate custom-theme contrast;
8. preserve keyboard access and focus restoration around application dialogs/routing;
9. account for local-draft status, restoration, retention, and errors;
10. test the complete application, including plugins/custom buttons, not only the editor fixture.

## Manual release-candidate protocol

Record exact browser, OS, assistive technology, version, input method, viewport/device, configuration, content fixture, and result for:

- keyboard-only traversal and operation;
- VoiceOver with Safari on macOS and iOS;
- NVDA with Firefox and/or Chrome on Windows;
- one additional pairing justified by project users, such as JAWS/Chrome or TalkBack/Chrome;
- 200% and 400% zoom/reflow;
- Windows High Contrast or another forced-colors environment;
- reduced motion and light/dark/contrast preferences;
- speech input/voice control for toolbar labels and editor focus;
- touch and virtual-keyboard operation on physical mobile hardware;
- automated checks with named versions, followed by manual review.

Minimum task script:

1. find and enter the visual editor and understand its label/state;
2. enter multilingual text and create a heading, emphasis, link, and list;
3. discover and operate toolbar controls by Tab and Arrow/Home/End;
4. open/cancel/submit link, image, table, and find/replace dialogs; recover from errors;
5. undo/redo and verify state announcements/focus;
6. enter, edit, find, and leave source mode;
7. test read-only and disabled states;
8. save/restore/clear a local draft and hear host-application save feedback;
9. submit and reset the host form;
10. destroy/navigate away without lost data or stranded focus.

Publish failures and limitations with passing results. A passing axe scan alone is never a conformance claim.

## Reporting accessibility bugs

Open a [GitHub issue](https://github.com/MiszterSoul/FeatherText/issues) with the assistive technology/browser/OS versions, input method, exact configuration, minimal content, steps, expected behavior, actual behavior, and impact. Do not include personal or sensitive editor content.
