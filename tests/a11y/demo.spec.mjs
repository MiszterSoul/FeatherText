import { expect, test } from "@playwright/test";

import {
  analyzeDocument,
  formatAxeViolations,
  loadAxeBuilder,
} from "../helpers/axe.mjs";

const VIEWPORTS = [
  { name: "desktop", width: 1280, height: 900 },
  { name: "mobile 320px", width: 320, height: 800 },
];

for (const viewport of VIEWPORTS) {
  test(`generated demo has no axe violations at ${viewport.name}`, async ({
    page,
  }) => {
    const AxeBuilder = await loadAxeBuilder();
    test.skip(
      !AxeBuilder,
      "@axe-core/playwright is not installed in this checkout",
    );

    await page.setViewportSize({
      width: viewport.width,
      height: viewport.height,
    });
    await page.goto("/", { waitUntil: "load" });
    await expect(page.locator("#demo-state")).toContainText("Live editor ready");
    await expect(
      page.getByRole("textbox", {
        name: "FeatherText live demo editor",
        exact: true,
      }),
    ).toBeVisible();

    const results = await analyzeDocument(page, AxeBuilder);
    expect(
      results.violations,
      formatAxeViolations(results.violations),
    ).toEqual([]);
  });
}
