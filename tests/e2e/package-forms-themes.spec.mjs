import { expect, test } from "@playwright/test";

import {
  editorWrapper,
  initializeEditors,
  loadBuiltFixture,
} from "../helpers/editor-fixture.mjs";

test.describe("built package, forms, and themes", () => {
  test("the generated site initializes the built browser-global package", async ({
    page,
  }) => {
    const builtScriptResponse = page.waitForResponse(
      (response) =>
        new URL(response.url()).pathname === "/dist/feathertext.min.js",
    );

    const documentResponse = await page.goto("/", { waitUntil: "load" });
    expect(documentResponse?.ok()).toBe(true);
    expect((await builtScriptResponse).ok()).toBe(true);

    await expect(page.locator("#demo-state")).toContainText(
      "Live editor ready",
    );
    await expect(
      page.getByRole("textbox", {
        name: "FeatherText live demo editor",
        exact: true,
      }),
    ).toBeVisible();
    await expect(page.locator(".demo-card .feather")).toHaveCount(1);
    await expect(page.locator("#demo-editor")).toBeHidden();
    await expect(page.getByRole("link", { name: /Image upload/ })).toHaveAttribute(
      "href",
      /README\.md#uploading-images-from-the-image-dialog$/,
    );

    const announcement = page.getByRole("button", {
      name: "An announcement",
    });
    await announcement.click();
    await expect(announcement).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator("#demo-editor")).toHaveValue(
      /Something good is coming/,
    );
    await page.getByRole("button", { name: "Reset content" }).click();
    await expect(page.locator("#demo-editor")).toHaveValue(
      /Something good is coming/,
    );

    const browserGlobal = await page.evaluate(() => ({
      constructor: typeof globalThis.FeatherText,
      init: typeof globalThis.FeatherText?.init,
      version: globalThis.FeatherText?.version,
    }));
    expect(browserGlobal.constructor).toBe("function");
    expect(browserGlobal.init).toBe("function");
    expect(browserGlobal.version).toEqual(expect.any(String));
  });

  test("typing synchronizes the backing textarea and native form reset restores the initial value", async ({
    page,
  }) => {
    await loadBuiltFixture(page, {
      body: `
        <main>
          <form data-testid="editor-form">
            <label for="editor">Article body</label>
            <textarea id="editor" name="content">Start</textarea>
            <button type="reset">Reset form</button>
          </form>
        </main>
      `,
    });
    expect(
      await initializeEditors(page, "#editor", {
        ariaLabel: "Article editor",
        historyDebounceMs: 0,
        toolbar: ["undo", "redo", "source"],
        wordCount: false,
        charCount: false,
        attribution: false,
      }),
    ).toBe(1);

    await page.evaluate(() => {
      globalThis.__backingInputEvents = 0;
      document.getElementById("editor").addEventListener("input", () => {
        globalThis.__backingInputEvents += 1;
      });
    });

    const surface = page.getByRole("textbox", {
      name: "Article editor",
      exact: true,
    });
    await surface.click();
    await surface.press("End");
    await page.keyboard.type(" typed");

    await expect(surface).toHaveText("Start typed");
    await expect(page.locator("#editor")).toHaveValue("Start typed");
    expect(
      await page.evaluate(() =>
        new FormData(document.querySelector("form")).get("content"),
      ),
    ).toBe("Start typed");
    expect(
      await page.evaluate(() => globalThis.__backingInputEvents),
    ).toBeGreaterThan(0);

    await page.getByRole("button", { name: "Reset form", exact: true }).click();
    await expect(surface).toHaveText("Start");
    await expect(page.locator("#editor")).toHaveValue("Start");
    await expect
      .poll(() =>
        page.evaluate(() => globalThis.__featherTextTest.editors[0].history),
      )
      .toEqual(["Start"]);
  });

  test("multiple editors keep independent themes and never mutate documentElement", async ({
    page,
  }) => {
    await loadBuiltFixture(page, {
      body: `
        <main>
          <section data-testid="dark-host">
            <label for="dark-editor">Dark editor</label>
            <textarea id="dark-editor"></textarea>
          </section>
          <section data-testid="light-host">
            <label for="light-editor">Light editor</label>
            <textarea id="light-editor"></textarea>
          </section>
        </main>
      `,
    });

    const initialState = await page.evaluate(() => {
      document.documentElement.dataset.theme = "host-theme";
      document.documentElement.style.setProperty("--feather-bg", "host-value");
      const editors = [
        new globalThis.FeatherText("#dark-editor", {
          ariaLabel: "Dark editor",
          theme: "dark",
          wordCount: false,
          charCount: false,
          attribution: false,
        }),
        new globalThis.FeatherText("#light-editor", {
          ariaLabel: "Light editor",
          theme: "light",
          wordCount: false,
          charCount: false,
          attribution: false,
        }),
      ];
      globalThis.__featherTextTest = { editors };
      return {
        rootTheme: document.documentElement.dataset.theme,
        rootBackground:
          document.documentElement.style.getPropertyValue("--feather-bg"),
        wrapperBackgrounds: editors.map((editor) =>
          editor.wrapper.style.getPropertyValue("--feather-bg"),
        ),
      };
    });

    const darkWrapper = page.getByTestId("dark-host").locator(".feather");
    const lightWrapper = page.getByTestId("light-host").locator(".feather");
    await expect(darkWrapper).toHaveAttribute("data-theme", "dark");
    await expect(lightWrapper).toHaveAttribute("data-theme", "light");
    expect(initialState.wrapperBackgrounds).toEqual(["#0f1115", "#ffffff"]);
    expect(initialState.rootTheme).toBe("host-theme");
    expect(initialState.rootBackground).toBe("host-value");

    await page.evaluate(() => {
      const [first, second] = globalThis.__featherTextTest.editors;
      first.setTheme("ocean");
      second.setTheme("dawn");
    });
    await expect(darkWrapper).toHaveAttribute("data-theme", "ocean");
    await expect(lightWrapper).toHaveAttribute("data-theme", "dawn");

    expect(
      await page.evaluate(() => ({
        rootTheme: document.documentElement.dataset.theme,
        rootBackground:
          document.documentElement.style.getPropertyValue("--feather-bg"),
      })),
    ).toMatchObject({
      rootTheme: "host-theme",
      rootBackground: "host-value",
    });
    await expect(editorWrapper(page, 0)).toHaveAttribute("data-theme", "ocean");
    await expect(editorWrapper(page, 1)).toHaveAttribute("data-theme", "dawn");
  });
});

test("demo customization and fullscreen preserve a usable writing surface", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("#demo-state")).toContainText("Live editor ready");
  await page.getByText("Customize editor", { exact: true }).click();
  await page.locator("#demo-theme").selectOption("dark");
  await expect(page.locator(".demo-card .feather")).toHaveAttribute("data-theme", "dark");
  const fullscreen = page.locator('.demo-card [data-command="fullscreen"]');
  await fullscreen.click();
  const wrapper = page.locator(".demo-card .feather");
  await expect(wrapper).toHaveClass(/feather-fullscreen/);
  const bounds = await wrapper.locator(".feather-status").boundingBox();
  expect(bounds.y + bounds.height).toBeLessThanOrEqual(page.viewportSize().height + 1);
  await page.locator(".demo-card .feather-editor").press("Escape");
  await expect(wrapper).not.toHaveClass(/feather-fullscreen/);
  await expect(page.locator(".demo-card .feather-editor")).toBeFocused();
});
