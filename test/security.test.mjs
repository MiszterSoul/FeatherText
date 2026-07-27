import test from "node:test";
import assert from "node:assert/strict";

import FeatherText, {
  isSafeUrl,
  normalizeSafeUrl,
  sanitizeUntrustedHTML,
  toSafeVideoEmbedUrl,
} from "../src/feathertext.js";
import { createPasteEvent, installDom } from "./helpers.mjs";

test("central URL policy accepts intended schemes and rejects active-content schemes", () => {
  assert.equal(normalizeSafeUrl("https://example.com/path", { kind: "link" }), "https://example.com/path");
  assert.equal(normalizeSafeUrl("/relative/path", { kind: "image" }), "/relative/path");
  assert.equal(normalizeSafeUrl("mailto:hello@example.com", { kind: "link" }), "mailto:hello@example.com");
  assert.equal(normalizeSafeUrl("javascript:alert(1)", { kind: "link" }), null);
  assert.equal(normalizeSafeUrl("java\nscript:alert(1)", { kind: "link" }), null);
  assert.equal(normalizeSafeUrl("data:image/png;base64,AAAA", { kind: "image" }), null);
  assert.equal(normalizeSafeUrl("/relative", { kind: "external" }), null);
  assert.equal(isSafeUrl("https://example.com", { kind: "external" }), true);
  assert.equal(isSafeUrl("file:///tmp/private", { kind: "link" }), false);
});

test("video URL policy emits only fixed YouTube/Vimeo HTTPS embed hosts", () => {
  assert.equal(toSafeVideoEmbedUrl("https://www.youtube.com/watch?v=dQw4w9WgXcQ"), "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  assert.equal(toSafeVideoEmbedUrl("https://youtu.be/dQw4w9WgXcQ"), "https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  assert.equal(toSafeVideoEmbedUrl("https://vimeo.com/123456"), "https://player.vimeo.com/video/123456");
  assert.equal(toSafeVideoEmbedUrl("https://evil.example/embed/123456"), null);
  assert.equal(toSafeVideoEmbedUrl("javascript:alert(1)"), null);
});

test("conservative untrusted HTML policy removes active and unsupported content", () => {
  const fixture = installDom();
  try {
    const dirty = [
      '<p class="remote" style="color:red" onclick="attack()">Hello ',
      '<a href="javascript:alert(1)" target="_blank" srcdoc="bad">unsafe</a>',
      '<a href="https://example.com" target="_blank" rel="opener">safe</a>',
      '<img src="data:image/png;base64,AAAA" onerror="attack()">',
      '<img src="/safe.png" alt="safe" onload="attack()">',
      '<script>alert(1)</script><svg onload="attack()"><circle></circle></svg>',
      '<iframe src="https://example.com" srcdoc="<script>bad()</script>"></iframe>',
      '<custom-element title="kept"><strong>kept text</strong></custom-element></p>',
    ].join("");
    const clean = sanitizeUntrustedHTML(dirty, { document: fixture.document });
    const template = fixture.document.createElement("template");
    template.innerHTML = clean;

    assert.equal(template.content.querySelector("script, svg, iframe, custom-element"), null);
    assert.equal(template.content.querySelector('a[href^="javascript"]'), null);
    assert.equal(template.content.querySelector('img[src^="data:"]'), null);
    assert.equal(template.content.querySelector('img[src="/safe.png"]')?.getAttribute("alt"), "safe");
    assert.equal(template.content.querySelector('a[href="https://example.com"]')?.getAttribute("rel"), "noopener noreferrer");
    assert.equal(template.content.querySelector("p")?.hasAttribute("style"), false);
    assert.equal(template.content.querySelector("p")?.hasAttribute("class"), false);
    for (const element of template.content.querySelectorAll("*")) {
      assert.equal([...element.attributes].some((attribute) => attribute.name.startsWith("on") || attribute.name === "srcdoc"), false);
    }
    assert.match(template.content.textContent, /kept text/);
  } finally {
    fixture.cleanup();
  }
});

test("setHTML stays explicitly trusted while setUntrustedHTML applies the baseline policy", () => {
  const fixture = installDom();
  try {
    const editor = new FeatherText("#editor", { historyDebounceMs: 0 });
    assert.equal(editor.setHTML('<p onclick="x()">trusted</p><script>trustedHook()</script>'), editor);
    assert.ok(editor.editor.querySelector("script"));
    assert.ok(editor.editor.querySelector("[onclick]"));

    assert.equal(editor.setUntrustedHTML('<p onclick="x()">untrusted</p><script>removed()</script>'), editor);
    assert.equal(editor.editor.querySelector("script, [onclick]"), null);
    assert.equal(editor.getText(), "untrusted");
    assert.equal(FeatherText.sanitizeUntrustedHTML("<svg></svg>", { document: fixture.document }), "");
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("HTML clipboard payloads are sanitized before reaching the command adapter", () => {
  const fixture = installDom();
  try {
    const editor = new FeatherText("#editor", { pasteMode: "html", sanitizePaste: false, historyDebounceMs: 0 });
    const event = createPasteEvent("safe", '<p onclick="bad()">safe<script>bad()</script><img src="data:x"></p>');
    assert.equal(editor.handlePaste(event), true);
    const insertion = fixture.commands.at(-1);
    assert.equal(insertion.command, "insertHTML");
    assert.equal(insertion.value.includes("script"), false);
    assert.equal(insertion.value.includes("onclick"), false);
    assert.equal(insertion.value.includes("data:"), false);
    assert.equal(editor.editor.textContent, "safe");
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});

test("link, image, and video insertion all reject unsafe URLs centrally", () => {
  const fixture = installDom();
  try {
    const editor = new FeatherText("#editor");
    const before = fixture.commands.length;
    assert.equal(editor.insertLink("javascript:alert(1)"), false);
    assert.equal(editor.insertImage("data:image/png;base64,AAAA"), false);
    assert.equal(editor.insertVideo("https://evil.example/video"), false);
    assert.equal(fixture.commands.length, before);

    assert.equal(editor.insertLink("example.com", "Example"), editor);
    assert.match(fixture.commands.at(-1).value, /href="https:\/\/example\.com"/);
    assert.equal(editor.insertImage("/image.png", "Alt"), editor);
    assert.match(fixture.commands.at(-1).value, /src="\/image\.png"/);
    assert.equal(editor.insertVideo("https://vimeo.com/123456"), editor);
    assert.match(fixture.commands.at(-1).value, /^<iframe src="https:\/\/player\.vimeo\.com\/video\/123456"/);
    editor.destroy();
  } finally {
    fixture.cleanup();
  }
});
