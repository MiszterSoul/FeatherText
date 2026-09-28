import { Buffer } from "node:buffer";

import { expect, test } from "@playwright/test";

test("image example demonstrates the picker without uploading a file", async ({
  page,
}) => {
  const requests = [];
  page.on("request", (request) => {
    if (request.method() === "POST") requests.push(request.url());
  });

  const response = await page.goto("/examples/upload.html", {
    waitUntil: "load",
  });
  expect(response?.ok()).toBe(true);
  await expect(page.locator("#upload-status")).toContainText("Editor ready");
  await page.getByRole("button", { name: "Insert Image" }).click();
  const dialog = page.getByRole("dialog", { name: "Insert image" });
  await dialog.getByLabel("Upload image").setInputFiles({
    name: "example.png",
    mimeType: "image/png",
    buffer: Buffer.from("sample image"),
  });
  await dialog.getByRole("button", { name: "Insert" }).click();

  await expect(page.locator("#upload-status")).toContainText(
    "no file was uploaded",
  );
  await expect(page.locator(".feather-editor img")).toHaveAttribute(
    "src",
    "../assets/favicon.svg",
  );
  await expect(page.locator("#upload-editor")).toHaveValue(
    /alt="Sample preview for example\.png"/,
  );
  expect(requests).toEqual([]);
});
