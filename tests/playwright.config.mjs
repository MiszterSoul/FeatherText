import path from "node:path";
import { fileURLToPath } from "node:url";

import baseConfig from "../playwright.config.mjs";

const TESTS_DIR = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(TESTS_DIR, "..");

// The root config intentionally targets the Node suites in test/. This adapter
// preserves its projects, browser options, and generated-site web server while
// allowing explicit tests/e2e and tests/a11y CLI paths.
export default {
  ...baseConfig,
  testDir: TESTS_DIR,
  testMatch: "**/*.spec.mjs",
  testIgnore: [],
  outputDir: path.resolve(ROOT_DIR, "dist/playwright-results"),
  webServer: {
    ...baseConfig.webServer,
    cwd: ROOT_DIR,
  },
};
