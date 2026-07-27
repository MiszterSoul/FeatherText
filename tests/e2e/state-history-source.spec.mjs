import { expect, test } from "@playwright/test";

import {
  editorWrapper,
  initializeEditors,
  loadBuiltFixture,
} from "../helpers/editor-fixture.mjs";

test.describe("state, history, source mode, and interaction blocking", () => {
  test("setConfig preserves content, source/fullscreen modes, surface identity, focus, and history", async ({
    page,
  }) => {
    await loadBuiltFixture(page, {
      body: `
        <main>
          <label for="config-editor">Configuration editor</label>
          <textarea id="config-editor"></textarea>
        </main>
      `,
    });
    await initializeEditors(page, "#config-editor", {
      ariaLabel: "Configuration editor",
      sourceAriaLabel: "Configuration source",
      historyDebounceMs: 0,
      toolbar: ["bold", "italic", "source", "fullscreen"],
      wordCount: true,
      charCount: true,
      attribution: false,
    });

    await page.evaluate(() => {
      const editor = globalThis.__featherTextTest.editors[0];
      editor.setHTML("<p>before</p>").toggleSource().toggleFullscreen();
    });
    const source = page.getByRole("textbox", {
      name: "Configuration source",
      exact: true,
    });
    await source.fill("<p>source edit 😀</p>");
    await source.focus();

    const historyBefore = await page.evaluate(() => {
      const editor = globalThis.__featherTextTest.editors[0];
      globalThis.__configSurfaceReferences = {
        editor: editor.editor,
        source: editor.source,
        wrapper: editor.wrapper,
      };
      return editor.history;
    });

    const state = await page.evaluate(() => {
      const editor = globalThis.__featherTextTest.editors[0];
      editor.setConfig({
        theme: "light",
        toolbar: ["bold", "source", "fullscreen"],
        placeholder: "Changed placeholder",
        wordCount: false,
        charCount: false,
        attribution: true,
        minHeight: 300,
        sourceRows: 18,
      });
      const references = globalThis.__configSurfaceReferences;
      return {
        activeIsSource: document.activeElement === editor.source,
        content: editor.getHTML(),
        fullscreen: editor.isFullscreen,
        history: editor.history,
        nodesPreserved:
          editor.wrapper === references.wrapper &&
          editor.editor === references.editor &&
          editor.source === references.source,
        placeholder: editor.editor.getAttribute("placeholder"),
        sourceMode: editor.isSource,
        sourceRows: editor.source.rows,
        theme: editor.wrapper.dataset.theme,
        wrapperFullscreenClass:
          editor.wrapper.classList.contains("feather-fullscreen"),
      };
    });

    expect(state).toMatchObject({
      activeIsSource: true,
      content: "<p>source edit 😀</p>",
      fullscreen: true,
      nodesPreserved: true,
      placeholder: "Changed placeholder",
      sourceMode: true,
      sourceRows: 18,
      theme: "light",
      wrapperFullscreenClass: true,
    });
    expect(state.history).toEqual(historyBefore);
    await expect(editorWrapper(page)).toHaveClass(/feather-fullscreen/);
    await expect(source).toHaveValue("<p>source edit 😀</p>");
  });

  test("typing supports undo/redo and a new typing branch invalidates redo", async ({
    page,
  }) => {
    await loadBuiltFixture(page, {
      body: `
        <main>
          <label for="history-editor">History editor</label>
          <textarea id="history-editor">start</textarea>
        </main>
      `,
    });
    await initializeEditors(page, "#history-editor", {
      ariaLabel: "History editor",
      historyDebounceMs: 0,
      toolbar: ["undo", "redo"],
      wordCount: false,
      charCount: false,
      attribution: false,
    });

    const surface = page.getByRole("textbox", {
      name: "History editor",
      exact: true,
    });
    const undo = page.getByRole("button", { name: /^Undo \(Ctrl\+Z\)$/ });
    const redo = page.getByRole("button", { name: /^Redo \(Ctrl\+Y\)$/ });

    await surface.fill("typed value");
    await expect(page.locator("#history-editor")).toHaveValue("typed value");
    await undo.click();
    await expect(surface).toHaveText("start");
    await redo.click();
    await expect(surface).toHaveText("typed value");

    await undo.click();
    await surface.fill("branch value");
    const branchedState = await page.evaluate(() => {
      const editor = globalThis.__featherTextTest.editors[0];
      return { history: editor.history, index: editor.historyIndex };
    });
    await redo.click();

    await expect(surface).toHaveText("branch value");
    await expect(page.locator("#history-editor")).toHaveValue("branch value");
    expect(
      await page.evaluate(() => {
        const editor = globalThis.__featherTextTest.editors[0];
        return { history: editor.history, index: editor.historyIndex };
      }),
    ).toEqual(branchedState);
    expect(branchedState.history).toEqual(["start", "branch value"]);
  });

  test("source mode renders encoded standalone tags and preserves large buffers", async ({
    page,
  }) => {
    await loadBuiltFixture(page, {
      body: `
        <main>
          <label for="source-editor">Source preservation editor</label>
          <textarea id="source-editor"></textarea>
        </main>
      `,
    });
    await initializeEditors(page, "#source-editor", {
      ariaLabel: "Source preservation editor",
      sourceAriaLabel: "Source preservation buffer",
      sourceHighlightThreshold: 64,
      toolbar: ["source"],
      wordCount: false,
      charCount: false,
      attribution: false,
    });

    const encoded = "&lt;p&gt;Hello 😀&lt;/p&gt;";
    await page.evaluate((html) => {
      globalThis.__featherTextTest.editors[0].setHTML(html);
    }, encoded);

    const sourceButton = page.getByRole("button", {
      name: "View Source",
      exact: true,
    });
    const source = page.getByRole("textbox", {
      name: "Source preservation buffer",
      exact: true,
    });
    await sourceButton.click();
    await expect(source).toHaveValue("<p>Hello 😀</p>");
    await sourceButton.click();

    expect(
      await page.evaluate(() => {
        const editor = globalThis.__featherTextTest.editors[0];
        return {
          html: editor.editor.innerHTML,
          text: editor.editor.textContent,
        };
      }),
    ).toEqual({
      html: "<p>Hello 😀</p>",
      text: "Hello 😀",
    });

    const large = `<p>${"large 😀 payload ".repeat(40)}</p>`;
    await page.evaluate((html) => {
      globalThis.__featherTextTest.editors[0].setHTML(html);
    }, large);
    await sourceButton.click();
    await expect(source).toHaveValue(large);
    await expect(page.locator(".feather-source-wrap")).toHaveAttribute(
      "data-highlight",
      "plain",
    );
    expect(
      await page.locator(".feather-code").evaluate((overlay) => ({
        hasSyntaxToken: Boolean(overlay.querySelector(".tok-tag")),
        text: overlay.textContent,
      })),
    ).toEqual({ hasSyntaxToken: false, text: large });

    await sourceButton.click();
    await sourceButton.click();
    await expect(source).toHaveValue(large);
    await expect(page.locator("#source-editor")).toHaveValue(large);
  });

  test("readOnly permits viewing source while disabled blocks every control", async ({
    page,
  }) => {
    await loadBuiltFixture(page, {
      body: `
        <main>
          <label for="blocked-editor">Blocked-state editor</label>
          <textarea id="blocked-editor"><p>locked</p></textarea>
        </main>
      `,
    });
    await initializeEditors(page, "#blocked-editor", {
      ariaLabel: "Blocked-state editor",
      sourceAriaLabel: "Blocked-state source",
      toolbar: ["bold", "source"],
      wordCount: false,
      charCount: false,
      attribution: false,
    });

    await page.evaluate(() => {
      globalThis.__featherTextTest.editors[0].setReadOnly(true);
    });
    const surface = page.getByRole("textbox", {
      name: "Blocked-state editor",
      exact: true,
    });
    const bold = page.getByRole("button", { name: /^Bold \(Ctrl\+B\)$/ });
    const sourceButton = page.getByRole("button", {
      name: "View Source",
      exact: true,
    });

    await expect(surface).toHaveAttribute("contenteditable", "false");
    await expect(surface).toHaveAttribute("aria-readonly", "true");
    await expect(bold).toBeDisabled();
    await expect(sourceButton).toBeEnabled();
    expect(
      await page.evaluate(() => {
        const editor = globalThis.__featherTextTest.editors[0];
        return {
          insertion: editor.insertImage("/assets/favicon.svg"),
          originalReadOnly: editor.element.readOnly,
          sourceReadOnly: editor.source.readOnly,
        };
      }),
    ).toEqual({
      insertion: false,
      originalReadOnly: true,
      sourceReadOnly: true,
    });

    await sourceButton.click();
    await expect(
      page.getByRole("textbox", {
        name: "Blocked-state source",
        exact: true,
      }),
    ).toHaveAttribute("readonly", "");

    await page.evaluate(() => {
      globalThis.__featherTextTest.editors[0].setReadOnly(false);
    });
    await sourceButton.click();
    await page.evaluate(() => {
      globalThis.__featherTextTest.editors[0].setDisabled(true);
    });

    await expect(editorWrapper(page)).toHaveAttribute("aria-disabled", "true");
    await expect(surface).toHaveAttribute("contenteditable", "false");
    await expect(bold).toBeDisabled();
    await expect(sourceButton).toBeDisabled();
    expect(
      await page.evaluate(() => {
        const editor = globalThis.__featherTextTest.editors[0];
        return {
          html: editor.getHTML(),
          insertion: editor.insertImage("/assets/favicon.svg"),
          originalDisabled: editor.element.disabled,
        };
      }),
    ).toEqual({
      html: "<p>locked</p>",
      insertion: false,
      originalDisabled: true,
    });

    await page.evaluate(() => {
      globalThis.__featherTextTest.editors[0].enable();
    });
    await expect(editorWrapper(page)).toHaveAttribute("aria-disabled", "false");
    await expect(surface).toHaveAttribute("contenteditable", "true");
    await expect(sourceButton).toBeEnabled();
  });
});
