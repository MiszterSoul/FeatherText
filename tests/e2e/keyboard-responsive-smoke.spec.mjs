import { expect, test } from "@playwright/test";

import {
  editorWrapper,
  initializeEditors,
  loadBuiltFixture,
} from "../helpers/editor-fixture.mjs";

test.describe("keyboard, responsive, and internationalization smoke", () => {
  test("toolbar buttons support arrow, Home, End, and wraparound navigation", async ({
    page,
  }) => {
    await loadBuiltFixture(page, {
      body: `
        <main>
          <label for="keyboard-editor">Keyboard editor</label>
          <textarea id="keyboard-editor">Keyboard content</textarea>
        </main>
      `,
    });
    await initializeEditors(page, "#keyboard-editor", {
      ariaLabel: "Keyboard editor",
      toolbar: ["bold", "italic", "underline", "source"],
      wordCount: false,
      charCount: false,
      attribution: false,
    });

    const bold = page.getByRole("button", {
      name: "Bold (Ctrl+B)",
      exact: true,
    });
    const italic = page.getByRole("button", {
      name: "Italic (Ctrl+I)",
      exact: true,
    });
    const source = page.getByRole("button", {
      name: "View Source",
      exact: true,
    });

    await bold.focus();
    await bold.press("ArrowRight");
    await expect(italic).toBeFocused();
    await italic.press("End");
    await expect(source).toBeFocused();
    await source.press("ArrowRight");
    await expect(bold).toBeFocused();
    await bold.press("ArrowLeft");
    await expect(source).toBeFocused();
    await source.press("Home");
    await expect(bold).toBeFocused();
  });

  test("toolbar tooltip stays anchored to View Source inside transformed hosts", async ({
    page,
  }) => {
    await loadBuiltFixture(page, {
      body: `
        <main style="margin-top: 180px; transform: translateZ(0); overflow: hidden">
          <label for="tooltip-editor">Tooltip editor</label>
          <textarea id="tooltip-editor">Tooltip content</textarea>
        </main>
      `,
    });
    await initializeEditors(page, "#tooltip-editor", {
      ariaLabel: "Tooltip editor",
      theme: "lavender",
      toolbar: ["bold", "source"],
      wordCount: false,
      charCount: false,
      attribution: false,
    });

    const source = page.getByRole("button", {
      name: "View Source",
      exact: true,
    });
    const tooltip = page.locator("body > .feather-tooltip");
    await source.hover();
    await expect(tooltip).toBeVisible();
    await expect(tooltip).toHaveText("View Source");

    const geometry = await page.evaluate(() => {
      const button = document.querySelector('[data-command="source"]');
      const tip = document.querySelector("body > .feather-tooltip");
      const buttonRect = button.getBoundingClientRect();
      const tooltipRect = tip.getBoundingClientRect();
      const gap =
        tooltipRect.bottom <= buttonRect.top
          ? buttonRect.top - tooltipRect.bottom
          : tooltipRect.top - buttonRect.bottom;
      return {
        gap,
        parent: tip.parentElement.tagName,
        theme: tip.dataset.featherTheme,
      };
    });

    expect(geometry.parent).toBe("BODY");
    expect(geometry.theme).toBe("lavender");
    expect(geometry.gap).toBeGreaterThanOrEqual(0);
    expect(geometry.gap).toBeLessThanOrEqual(24);
  });

  test("the generated demo has no page-level horizontal overflow at 320px", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto("/", { waitUntil: "load" });
    await expect(page.locator("#demo-state")).toContainText(
      "Live editor ready",
    );

    const overflow = await page.evaluate(() => {
      const viewportWidth = globalThis.innerWidth;
      const scrollWidth = Math.max(
        document.documentElement.scrollWidth,
        document.body.scrollWidth,
      );
      const offenders = [...document.body.querySelectorAll("*")]
        .filter((element) => {
          const rect = element.getBoundingClientRect();
          const style = getComputedStyle(element);
          return (
            style.position !== "fixed" &&
            rect.width > 0 &&
            (rect.left < -1 || rect.right > viewportWidth + 1)
          );
        })
        .slice(0, 12)
        .map((element) => ({
          className: String(element.className || ""),
          tag: element.tagName.toLowerCase(),
          width: Math.round(element.getBoundingClientRect().width),
        }));
      return { offenders, scrollWidth, viewportWidth };
    });

    expect(overflow.viewportWidth).toBe(320);
    expect(
      overflow.scrollWidth,
      `Elements extending beyond the viewport: ${JSON.stringify(overflow.offenders)}`,
    ).toBeLessThanOrEqual(overflow.viewportWidth + 1);
  });

  test("the generated demo initializes with reduced motion enabled", async ({
    page,
  }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/", { waitUntil: "load" });
    await expect(page.locator("#demo-state")).toContainText(
      "Live editor ready",
    );

    expect(
      await page.evaluate(() => ({
        editorReady: Boolean(document.querySelector(".demo-card .feather")),
        reducedMotion: matchMedia("(prefers-reduced-motion: reduce)").matches,
        rootScrollBehavior: getComputedStyle(document.documentElement)
          .scrollBehavior,
      })),
    ).toEqual({
      editorReady: true,
      reducedMotion: true,
      rootScrollBehavior: "auto",
    });
  });

  test("RTL Arabic and emoji content survives visual/source round trips", async ({
    page,
  }) => {
    await loadBuiltFixture(page, {
      dir: "rtl",
      lang: "ar",
      body: `
        <main>
          <label for="rtl-editor">محتوى المحرر</label>
          <textarea id="rtl-editor"></textarea>
        </main>
      `,
    });
    await initializeEditors(page, "#rtl-editor", {
      ariaLabel: "محرر النص",
      sourceAriaLabel: "مصدر النص",
      toolbar: ["source"],
      wordCount: false,
      charCount: false,
      attribution: false,
    });

    const content = "مرحبا بالعالم 👩🏽‍💻 ✨";
    const surface = page.getByRole("textbox", {
      name: "محرر النص",
      exact: true,
    });
    await surface.fill(content);
    await expect(page.locator("#rtl-editor")).toHaveValue(content);
    expect(
      await page.evaluate(() => ({
        documentDirection: document.documentElement.dir,
        wrapperDirection: getComputedStyle(
          globalThis.__featherTextTest.editors[0].wrapper,
        ).direction,
      })),
    ).toEqual({ documentDirection: "rtl", wrapperDirection: "rtl" });

    const sourceButton = page.getByRole("button", {
      name: "View Source",
      exact: true,
    });
    await sourceButton.click();
    await expect(
      page.getByRole("textbox", { name: "مصدر النص", exact: true }),
    ).toHaveValue(content);
    await sourceButton.click();
    await expect(surface).toHaveText(content);
    await expect(editorWrapper(page)).toBeVisible();
  });
});
