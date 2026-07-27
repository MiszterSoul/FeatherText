import test from "node:test";
import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";

import FeatherText, {
  buttons,
  defaultConfig,
  iconMarkup,
  isSafeUrl,
  normalizeSafeUrl,
  sanitizeUntrustedHTML,
  themes,
  version,
} from "../src/feathertext.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDirectory = path.join(root, "src");

async function sourceFiles() {
  return (await readdir(sourceDirectory)).filter((name) =>
    name.endsWith(".js"),
  );
}

test("core responsibilities are split into explicit ES modules", async () => {
  const names = new Set(await sourceFiles());
  for (const required of [
    "config.js",
    "icons.js",
    "security.js",
    "command-adapter.js",
    "commands.js",
    "selection.js",
    "history.js",
    "dialogs.js",
    "status.js",
    "theme.js",
    "find-replace.js",
    "autosave.js",
    "feathertext.js",
  ])
    assert.equal(names.has(required), true, `${required} exists`);
});

test("deprecated editing command APIs are quarantined in one compatibility adapter and prompt is absent", async () => {
  const names = await sourceFiles();
  for (const name of names) {
    const source = await readFile(path.join(sourceDirectory, name), "utf8");
    assert.equal(
      /\bprompt\s*\(/.test(source),
      false,
      `${name} does not call prompt`,
    );
    if (name !== "command-adapter.js") {
      assert.equal(
        /\.execCommand\s*\(/.test(source),
        false,
        `${name} does not call the deprecated command API directly`,
      );
      assert.equal(
        /\.queryCommandState\s*\(/.test(source),
        false,
        `${name} does not query deprecated command state directly`,
      );
    }
  }
  const adapter = await readFile(
    path.join(sourceDirectory, "command-adapter.js"),
    "utf8",
  );
  assert.match(adapter, /\.execCommand\s*\(/);
  assert.match(adapter, /\.queryCommandState\s*\(/);
});

test("theme CSS is wrapper-scoped and contains no remote asset URL", async () => {
  const css = await readFile(
    path.join(sourceDirectory, "feathertext.css"),
    "utf8",
  );
  assert.equal(/(^|[\s,{]):root\b/m.test(css), false);
  for (const match of css.matchAll(/(^|\n)([^\n{]+\[data-theme=[^\n{]+)\{/g)) {
    assert.match(match[2], /\.feather\[data-theme=/);
  }
  const urls = [...css.matchAll(/url\(([^)]+)\)/g)].map((match) =>
    match[1].trim().replace(/^['"]|['"]$/g, ""),
  );
  assert.equal(
    urls.every((url) => url.startsWith("data:")),
    true,
  );
});

test("untrusted sanitizer API explicitly documents its conservative limitation", async () => {
  const source = await readFile(
    path.join(sourceDirectory, "security.js"),
    "utf8",
  );
  const declarations = await readFile(path.join(root, "index.d.ts"), "utf8");
  assert.match(source, /not a complete sanitizer/i);
  assert.match(declarations, /not a complete sanitizer/i);
  assert.match(declarations, /setUntrustedHTML/);
});

test("ESM surface preserves legacy exports and adds policy/config exports", () => {
  assert.equal(typeof FeatherText, "function");
  assert.equal(FeatherText.themes, themes);
  assert.equal(FeatherText.buttons, buttons);
  assert.equal(FeatherText.version, version);
  assert.equal(FeatherText.sanitizeUntrustedHTML, sanitizeUntrustedHTML);
  assert.equal(FeatherText.normalizeSafeUrl, normalizeSafeUrl);
  assert.equal(FeatherText.isSafeUrl, isSafeUrl);
  assert.equal(typeof iconMarkup.bold, "string");
  assert.equal(defaultConfig.attribution, true);
  assert.equal(defaultConfig.supportLink, true);
});
