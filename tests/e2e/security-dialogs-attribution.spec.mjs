import { expect, test } from "@playwright/test";

import {
  editorWrapper,
  initializeEditors,
  loadBuiltFixture,
} from "../helpers/editor-fixture.mjs";

async function expectExternalLink(locator, { href, label }) {
  await expect(locator).toHaveAttribute("href", href);
  await expect(locator).toHaveAttribute("aria-label", label);
  await expect(locator).toHaveAttribute("title", label);
  await expect(locator).toHaveAttribute("target", "_blank");
  await expect(locator).toHaveAttribute("rel", "noopener noreferrer");
}

test.describe("security, dialogs, and attribution", () => {
  test("unsafe URLs are rejected and setUntrustedHTML removes active content", async ({
    page,
  }) => {
    await loadBuiltFixture(page, {
      body: `
        <main>
          <label for="security-editor">Security editor</label>
          <textarea id="security-editor">seed</textarea>
        </main>
      `,
    });
    await initializeEditors(page, "#security-editor", {
      ariaLabel: "Security editor",
      historyDebounceMs: 0,
      toolbar: ["link", "image", "video"],
      wordCount: false,
      charCount: false,
      attribution: false,
    });

    const result = await page.evaluate(() => {
      const editor = globalThis.__featherTextTest.editors[0];
      const unsafeResults = {
        image: editor.insertImage("data:image/png;base64,AAAA"),
        link: editor.insertLink("javascript:alert(1)"),
        video: editor.insertVideo("https://evil.example/video"),
      };
      const htmlAfterUnsafeCalls = editor.getHTML();
      editor.setUntrustedHTML(
        [
          '<p class="remote" style="color:red" onclick="attack()">Safe text ',
          '<a href="javascript:alert(1)" target="_blank" srcdoc="bad">bad link</a>',
          '<a href="https://example.com" target="_blank" rel="opener">safe link</a>',
          '<img src="data:image/png;base64,AAAA" onerror="attack()">',
          '<img src="/assets/favicon.svg" alt="safe image" onload="attack()">',
          '<script>attack()</script><svg onload="attack()"><circle></circle></svg>',
          '<iframe src="https://example.com" srcdoc="bad"></iframe>',
          "<custom-element><strong>kept text</strong></custom-element></p>",
        ].join(""),
      );

      const safeLink = editor.editor.querySelector(
        'a[href="https://example.com"]',
      );
      return {
        backingValue: editor.element.value,
        hasActiveElement: Boolean(
          editor.editor.querySelector("script, svg, iframe, custom-element"),
        ),
        hasDataImage: Boolean(editor.editor.querySelector('img[src^="data:"]')),
        hasEventOrSrcdocAttribute: [
          ...editor.editor.querySelectorAll("*"),
        ].some((element) =>
          [...element.attributes].some(
            (attribute) =>
              attribute.name.startsWith("on") || attribute.name === "srcdoc",
          ),
        ),
        hasUnsafeLink: Boolean(
          editor.editor.querySelector('a[href^="javascript:"]'),
        ),
        html: editor.getHTML(),
        htmlAfterUnsafeCalls,
        safeImageAlt: editor.editor
          .querySelector('img[src="/assets/favicon.svg"]')
          ?.getAttribute("alt"),
        safeLinkRel: safeLink?.getAttribute("rel"),
        text: editor.editor.textContent,
        unsafeResults,
      };
    });

    expect(result.unsafeResults).toEqual({
      image: false,
      link: false,
      video: false,
    });
    expect(result.htmlAfterUnsafeCalls).toBe("seed");
    expect(result.hasActiveElement).toBe(false);
    expect(result.hasDataImage).toBe(false);
    expect(result.hasEventOrSrcdocAttribute).toBe(false);
    expect(result.hasUnsafeLink).toBe(false);
    expect(result.safeImageAlt).toBe("safe image");
    expect(result.safeLinkRel).toBe("noopener noreferrer");
    expect(result.text).toContain("kept text");
    expect(result.backingValue).toBe(result.html);
  });

  test("link, image, and table commands use labelled local dialogs instead of prompts", async ({
    page,
  }) => {
    await loadBuiltFixture(page, {
      body: `
        <main>
          <label for="dialog-editor">Dialog editor</label>
          <textarea id="dialog-editor">Select or insert content</textarea>
        </main>
      `,
    });
    await initializeEditors(page, "#dialog-editor", {
      ariaLabel: "Dialog editor",
      toolbar: ["link", "image", "table"],
      tableMaxRows: 8,
      tableMaxColumns: 6,
      wordCount: false,
      charCount: false,
      attribution: false,
    });
    await page.evaluate(() => {
      globalThis.__promptCalls = 0;
      globalThis.prompt = () => {
        globalThis.__promptCalls += 1;
        return null;
      };
    });
    const nativeDialogs = [];
    page.on("dialog", async (dialog) => {
      nativeDialogs.push(dialog.type());
      await dialog.dismiss();
    });

    const surface = page.getByRole("textbox", {
      name: "Dialog editor",
      exact: true,
    });
    await surface.click();

    await page
      .getByRole("button", { name: "Insert Link (Ctrl+K)", exact: true })
      .click();
    let dialog = page.getByRole("dialog", {
      name: "Insert link",
      exact: true,
    });
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute("aria-modal", "true");
    await expect(dialog.getByLabel("Link URL", { exact: true })).toBeFocused();
    await expect(dialog.getByLabel("Link text", { exact: true })).toBeVisible();
    expect(
      await dialog.evaluate((element) => element.closest(".feather") != null),
    ).toBe(true);
    await dialog.getByLabel("Link URL", { exact: true }).press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(surface).toBeFocused();

    await page
      .getByRole("button", { name: "Insert Image", exact: true })
      .click();
    dialog = page.getByRole("dialog", {
      name: "Insert image",
      exact: true,
    });
    await expect(dialog.getByLabel("Image URL", { exact: true })).toBeFocused();
    await expect(
      dialog.getByLabel("Alternative text", { exact: true }),
    ).toBeVisible();
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();
    await expect(dialog).toHaveCount(0);

    await page
      .getByRole("button", { name: "Insert Table", exact: true })
      .click();
    dialog = page.getByRole("dialog", {
      name: "Insert table",
      exact: true,
    });
    const rows = dialog.getByLabel("Rows", { exact: true });
    const columns = dialog.getByLabel("Columns", { exact: true });
    await expect(rows).toBeFocused();
    await expect(rows).toHaveAttribute("min", "1");
    await expect(rows).toHaveAttribute("max", "8");
    await expect(columns).toHaveAttribute("min", "1");
    await expect(columns).toHaveAttribute("max", "6");
    await dialog.getByRole("button", { name: "Cancel", exact: true }).click();

    expect(await page.evaluate(() => globalThis.__promptCalls)).toBe(0);
    expect(nativeDialogs).toEqual([]);
  });

  test("footer always exposes counters and canonical support links", async ({
    page,
  }) => {
    await loadBuiltFixture(page, {
      body: `
        <main>
          <label for="attribution-editor">Attribution editor</label>
          <textarea id="attribution-editor"></textarea>
        </main>
      `,
    });
    await initializeEditors(page, "#attribution-editor", {
      ariaLabel: "Attribution editor",
      toolbar: ["bold"],
      wordCount: false,
      charCount: false,
      attribution: true,
      supportLink: true,
    });

    const wrapper = editorWrapper(page);
    const project = wrapper.getByRole("link", {
      name: "FeatherText on GitHub",
      exact: true,
    });
    const support = wrapper.getByRole("link", {
      name: "Support FeatherText on Buy Me a Coffee",
      exact: true,
    });
    await expectExternalLink(project, {
      href: "https://github.com/MiszterSoul/FeatherText",
      label: "FeatherText on GitHub",
    });
    await expect(project).toHaveText("FeatherText");
    await expectExternalLink(support, {
      href: "https://buymeacoffee.com/devpeter",
      label: "Support FeatherText on Buy Me a Coffee",
    });

    await page.evaluate(() => {
      const editor = globalThis.__featherTextTest.editors[0];
      editor.setConfig({
        attribution: false,
        charCount: false,
        projectUrl: "https://example.com/project",
        supportLink: false,
        supportUrl: "https://example.com/support",
        wordCount: false,
      });
      editor.setAttribution(false, false);
    });
    await expect(wrapper.locator(".feather-word-count")).toBeVisible();
    await expect(wrapper.locator(".feather-char-count")).toBeVisible();
    await expectExternalLink(project, {
      href: "https://github.com/MiszterSoul/FeatherText",
      label: "FeatherText on GitHub",
    });
    await expectExternalLink(support, {
      href: "https://buymeacoffee.com/devpeter",
      label: "Support FeatherText on Buy Me a Coffee",
    });
  });
});
