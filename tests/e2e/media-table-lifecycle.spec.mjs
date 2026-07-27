import { Buffer } from "node:buffer";

import { expect, test } from "@playwright/test";

import {
  editorWrapper,
  initializeEditors,
  loadBuiltFixture,
} from "../helpers/editor-fixture.mjs";

test.describe("media, tables, and lifecycle", () => {
  test("the image upload hook inserts its safe data-free URL result", async ({
    page,
  }) => {
    await loadBuiltFixture(page, {
      body: `
        <main>
          <label for="upload-editor">Upload editor</label>
          <textarea id="upload-editor"></textarea>
        </main>
      `,
    });
    await page.evaluate(() => {
      globalThis.__uploadObservation = null;
      const editor = new globalThis.FeatherText("#upload-editor", {
        ariaLabel: "Upload editor",
        toolbar: ["image"],
        wordCount: false,
        charCount: false,
        attribution: false,
        async imageUpload(file, instance) {
          await Promise.resolve();
          globalThis.__uploadObservation = {
            instanceMatches: instance === editor,
            name: file.name,
            size: file.size,
            type: file.type,
          };
          return {
            url: "/assets/favicon.svg",
            alt: "Uploaded safely",
          };
        },
      });
      globalThis.__featherTextTest = { editors: [editor] };
    });

    const surface = page.getByRole("textbox", {
      name: "Upload editor",
      exact: true,
    });
    await surface.click();
    await page
      .getByRole("button", { name: "Insert Image", exact: true })
      .click();
    const dialog = page.getByRole("dialog", {
      name: "Insert image",
      exact: true,
    });
    const file = dialog.getByLabel("Upload image", { exact: true });
    await expect(file).toHaveAttribute("accept", "image/*");
    await file.setInputFiles({
      name: "photo.png",
      mimeType: "image/png",
      buffer: Buffer.from("playwright image fixture"),
    });
    await dialog.getByRole("button", { name: "Insert", exact: true }).click();
    await expect(dialog).toHaveCount(0);

    const image = page.locator(".feather-editor img");
    await expect(image).toHaveAttribute("src", "/assets/favicon.svg");
    await expect(image).toHaveAttribute("alt", "Uploaded safely");
    const result = await page.evaluate(() => {
      const editor = globalThis.__featherTextTest.editors[0];
      const src = editor.editor.querySelector("img")?.getAttribute("src") || "";
      return {
        backingValue: editor.element.value,
        html: editor.getHTML(),
        observation: globalThis.__uploadObservation,
        src,
      };
    });
    expect(result.src.startsWith("data:")).toBe(false);
    expect(result.html).not.toContain("data:");
    expect(result.backingValue).toBe(result.html);
    expect(result.observation).toEqual({
      instanceMatches: true,
      name: "photo.png",
      size: Buffer.byteLength("playwright image fixture"),
      type: "image/png",
    });
  });

  test("the table dialog inserts the requested bounded dimensions", async ({
    page,
  }) => {
    await loadBuiltFixture(page, {
      body: `
        <main>
          <label for="table-editor">Table editor</label>
          <textarea id="table-editor"><p>Before table</p></textarea>
        </main>
      `,
    });
    await initializeEditors(page, "#table-editor", {
      ariaLabel: "Table editor",
      historyDebounceMs: 0,
      toolbar: ["table", "undo"],
      tableMaxRows: 5,
      tableMaxColumns: 5,
      wordCount: false,
      charCount: false,
      attribution: false,
    });

    const surface = page.getByRole("textbox", {
      name: "Table editor",
      exact: true,
    });
    await surface.click();
    await surface.press("End");
    await page
      .getByRole("button", { name: "Insert Table", exact: true })
      .click();
    const dialog = page.getByRole("dialog", {
      name: "Insert table",
      exact: true,
    });
    await dialog.getByLabel("Rows", { exact: true }).fill("2");
    await dialog.getByLabel("Columns", { exact: true }).fill("3");
    await dialog.getByRole("button", { name: "Insert", exact: true }).click();
    await expect(dialog).toHaveCount(0);

    const table = page.locator(".feather-editor table");
    await expect(table).toHaveCount(1);
    await expect(table.locator("tr")).toHaveCount(2);
    expect(
      await table
        .locator("tr")
        .evaluateAll((rows) =>
          rows.map((row) => row.querySelectorAll("td, th").length),
        ),
    ).toEqual([3, 3]);
    await expect(page.locator("#table-editor")).toHaveValue(/<table>/);
    expect(
      await page.evaluate(() =>
        globalThis.__featherTextTest.editors[0].history.some((entry) =>
          entry.includes("<table>"),
        ),
      ),
    ).toBe(true);
  });

  test("destroy restores the textarea and the preserved value can be reinitialized", async ({
    page,
  }) => {
    await loadBuiltFixture(page, {
      body: `
        <main>
          <label for="lifecycle-editor">Lifecycle editor</label>
          <textarea id="lifecycle-editor"><p>Initial</p></textarea>
        </main>
      `,
    });
    await initializeEditors(page, "#lifecycle-editor", {
      ariaLabel: "Lifecycle editor",
      historyDebounceMs: 0,
      toolbar: ["bold"],
      wordCount: false,
      charCount: false,
      attribution: false,
    });

    const surface = page.getByRole("textbox", {
      name: "Lifecycle editor",
      exact: true,
    });
    await surface.fill("Preserved 😀");
    const preservedHTML = await page.evaluate(() => {
      const oldEditor = globalThis.__featherTextTest.editors[0];
      const html = oldEditor.getHTML();
      globalThis.__destroyedEditor = oldEditor;
      oldEditor.destroy();
      return html;
    });

    await expect(editorWrapper(page)).toHaveCount(0);
    await expect(page.locator("#lifecycle-editor")).toBeVisible();
    await expect(page.locator("#lifecycle-editor")).toHaveValue(preservedHTML);

    const reinitialized = await page.evaluate(() => {
      const nextEditor = new globalThis.FeatherText("#lifecycle-editor", {
        ariaLabel: "Lifecycle editor",
        toolbar: ["bold"],
        wordCount: false,
        charCount: false,
        attribution: false,
      });
      globalThis.__featherTextTest = { editors: [nextEditor] };
      return {
        differentInstance: nextEditor !== globalThis.__destroyedEditor,
        html: nextEditor.getHTML(),
      };
    });
    expect(reinitialized).toEqual({
      differentInstance: true,
      html: preservedHTML,
    });
    await expect(editorWrapper(page)).toHaveCount(1);
    await expect(page.locator("#lifecycle-editor")).toBeHidden();
    await expect(surface).toHaveText("Preserved 😀");

    await surface.click();
    await surface.press("End");
    await page.keyboard.type(" again");
    await expect(page.locator("#lifecycle-editor")).toHaveValue(
      /Preserved 😀 again/,
    );
  });
});
