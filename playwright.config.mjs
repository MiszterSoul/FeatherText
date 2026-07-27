import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig, devices } from "@playwright/test";

const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));
const nodeExecutable = JSON.stringify(process.execPath);
const buildSiteScript = JSON.stringify(
  path.join(ROOT_DIR, "scripts", "build-site.mjs"),
);
const serveScript = JSON.stringify(path.join(ROOT_DIR, "scripts", "serve.mjs"));
const webServerCommand = [
  `${nodeExecutable} ${buildSiteScript}`,
  `${nodeExecutable} ${serveScript} --root _site --host 127.0.0.1 --port 4173 --max-runtime 900000`,
].join(" && ");

export default defineConfig({
  testDir: "./test",
  testIgnore: ["**/*.test.mjs"],
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  workers: 2,
  reporter: process.env.CI ? "github" : "list",
  outputDir: "dist/playwright-results",
  timeout: 30_000,
  expect: {
    timeout: 5_000,
  },
  use: {
    baseURL: "http://127.0.0.1:4173",
    screenshot: "only-on-failure",
    trace: "on-first-retry",
    video: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
    {
      name: "firefox",
      use: { ...devices["Desktop Firefox"] },
    },
    {
      name: "webkit",
      use: { ...devices["Desktop Safari"] },
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 5"] },
    },
    {
      name: "tablet",
      use: { ...devices["iPad Pro 11"] },
    },
  ],
  webServer: {
    command: webServerCommand,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    url: "http://127.0.0.1:4173",
  },
});
