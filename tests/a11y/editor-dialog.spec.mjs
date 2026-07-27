import { expect, test } from "@playwright/test";

import {
  analyzeDocument,
  formatAxeViolations,
  loadAxeBuilder,
} from "../helpers/axe.mjs";
import {
  initializeEditors,
  loadBuiltFixture,
} from "../helpers/editor-fixture.mjs";

const PROFILES = [
  {
    name: "desktop",
    viewport: { width: 1280, height: 900 },
    command: "image",
    buttonName: "Insert Image",
    dialogName: "Insert image",
  },
  {
    name: "mobile 320px",
    viewport: { width: 320, height: 800 },
    command: "table",
    buttonName: "Insert Table",
    dialogName: "Insert table",
  },
];

async function requireAxe() {
  const AxeBuilder = await loadAxeBuilder();
  test.skip(
    !AxeBuilder,
    "@axe-core/playwright is not installed in this checkout",
  );
  return AxeBuilder;
}

async function expectNoDocumentViolations(page, AxeBuilder) {
  const results = await analyzeDocument(page, AxeBuilder);
  expect(
    results.violations,
    formatAxeViolations(results.violations),
  ).toEqual([]);
}

async function mountAccessibleEditor(page, viewport, toolbar) {
  await page.setViewportSize(viewport);
  await loadBuiltFixture(page, {
    body: `
      <main>
        <h1>Editor accessibility fixture</h1>
        <label for="a11y-editor">Article content</label>
        <textarea id="a11y-editor"><p>Accessible editor content</p></textarea>
      </main>
    `,
  });
  await initializeEditors(page, "#a11y-editor", {
    ariaLabel: "Accessible article editor",
    sourceAriaLabel: "Accessible article source",
    toolbar,
    wordCount: true,
    charCount: true,
    attribution: true,
    supportLink: true,
  });
}

for (const profile of PROFILES) {
  test(`standalone editor has no axe violations at ${profile.name}`, async ({
    page,
  }) => {
    const AxeBuilder = await requireAxe();
    await mountAccessibleEditor(page, profile.viewport, [
      "format",
      "bold",
      "italic",
      "link",
      "image",
      "table",
      "undo",
      "redo",
      "source",
    ]);
    await expect(
      page.getByRole("textbox", {
        name: "Accessible article editor",
        exact: true,
      }),
    ).toBeVisible();
    await expectNoDocumentViolations(page, AxeBuilder);
  });

  test(`${profile.dialogName} dialog has no axe violations at ${profile.name}`, async ({
    page,
  }) => {
    const AxeBuilder = await requireAxe();
    await mountAccessibleEditor(page, profile.viewport, [profile.command]);

    const surface = page.getByRole("textbox", {
      name: "Accessible article editor",
      exact: true,
    });
    await surface.click();
    await page
      .getByRole("button", { name: profile.buttonName, exact: true })
      .click();
    await expect(
      page.getByRole("dialog", {
        name: profile.dialogName,
        exact: true,
      }),
    ).toBeVisible();
    await expectNoDocumentViolations(page, AxeBuilder);
  });
}
