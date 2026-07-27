#!/usr/bin/env node

import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import {
  access,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { gunzipSync } from "node:zlib";

const ROOT_DIR = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const EXPECTED_NAME = "feathertext";
const EXPECTED_LICENSE = "MIT";
const EXPECTED_REPOSITORY = Object.freeze({
  type: "git",
  url: "git+https://github.com/MiszterSoul/FeatherText.git",
});
const EXPECTED_HOMEPAGE = "https://misztersoul.github.io/FeatherText/";
const EXPECTED_BUGS = Object.freeze({
  url: "https://github.com/MiszterSoul/FeatherText/issues",
});
const EXPECTED_PUBLISH_CONFIG = Object.freeze({
  access: "public",
  provenance: true,
  registry: "https://registry.npmjs.org/",
});
const EXPECTED_NPM_FILES = Object.freeze([
  "README.md",
  "CHANGELOG.md",
  "LICENSE",
  "index.d.ts",
  "package.json",
  "dist/feathertext.cjs",
  "dist/feathertext.esm.js",
  "dist/feathertext.js",
  "dist/feathertext.min.js",
  "dist/feathertext.css",
  "dist/feathertext.min.css",
]);
const EXPECTED_PACKAGE_JSON_FILES = Object.freeze(
  EXPECTED_NPM_FILES.filter((fileName) => fileName !== "package.json"),
);
const RELEASE_ZIP_ONLY_FILES = Object.freeze([
  "README.md",
  "LICENSE",
  "index.d.ts",
]);
const EXPECTED_RELEASE_ZIP_FILES = Object.freeze([
  ...RELEASE_ZIP_ONLY_FILES,
  "dist/feathertext.cjs",
  "dist/feathertext.esm.js",
  "dist/feathertext.js",
  "dist/feathertext.min.js",
  "dist/feathertext.css",
  "dist/feathertext.min.css",
]);
const EXPECTED_DEVELOPMENT_MAPS = Object.freeze([
  "dist/feathertext.cjs.map",
  "dist/feathertext.esm.js.map",
  "dist/feathertext.js.map",
  "dist/feathertext.css.map",
]);
const EXPECTED_EXPORTS = Object.freeze({
  ".": {
    types: "./index.d.ts",
    import: "./dist/feathertext.esm.js",
    require: "./dist/feathertext.cjs",
  },
  "./css": "./dist/feathertext.css",
  "./dist/feathertext.css": "./dist/feathertext.css",
  "./feathertext.css": "./dist/feathertext.css",
  "./feathertext.min.css": "./dist/feathertext.min.css",
  "./browser": "./dist/feathertext.min.js",
  "./package.json": "./package.json",
});

await main().catch((error) => {
  console.error(`Package verification failed: ${error.message}`);
  if (process.env.DEBUG_PACKAGE_CHECK === "1" && error.stack) {
    console.error(error.stack);
  }
  process.exitCode = 1;
});

async function main() {
  const rootPackage = JSON.parse(
    await readFile(path.join(ROOT_DIR, "package.json"), "utf8"),
  );
  assertCanonicalMetadata(rootPackage);
  assertPackageEntrypoints(rootPackage);
  assert.deepEqual(
    [...rootPackage.files].sort(compareStrings),
    [...EXPECTED_PACKAGE_JSON_FILES].sort(compareStrings),
    "package.json files allowlist changed",
  );

  const buildResult = await runProcess(
    process.execPath,
    [path.join(ROOT_DIR, "build.mjs")],
    { cwd: ROOT_DIR },
  );
  if (buildResult.stderr.trim()) process.stderr.write(buildResult.stderr);
  await validateBuildManifest(rootPackage);

  const temporaryRoot = await mkdtemp(
    path.join(tmpdir(), "feathertext-package-"),
  );
  try {
    const packDirectory = path.join(temporaryRoot, "tarballs");
    const consumerDirectory = path.join(temporaryRoot, "consumer");
    const installedPackageDirectory = path.join(
      consumerDirectory,
      "node_modules",
      EXPECTED_NAME,
    );
    await Promise.all([
      mkdir(packDirectory, { recursive: true }),
      mkdir(installedPackageDirectory, { recursive: true }),
    ]);

    const npm = await resolveNpmInvocation();
    const packResult = await runNpmPack(npm, packDirectory, temporaryRoot);
    const archivePath = path.join(packDirectory, packResult.filename);
    await access(archivePath);

    assert.equal(
      packResult.name,
      EXPECTED_NAME,
      "npm pack reported the wrong package name",
    );
    assert.equal(
      packResult.version,
      rootPackage.version,
      "npm pack reported the wrong package version",
    );
    assert.equal(
      packResult.id,
      `${EXPECTED_NAME}@${rootPackage.version}`,
      "npm pack reported the wrong package identity",
    );
    assert.equal(
      packResult.filename,
      `${EXPECTED_NAME}-${rootPackage.version}.tgz`,
      "npm pack produced an unexpected archive name",
    );

    const npmReportedFiles = (packResult.files || [])
      .map(({ path: filePath }) => stripPackagePrefix(filePath))
      .sort(compareStrings);
    assert.equal(
      npmReportedFiles.length,
      11,
      "npm pack must report exactly 11 files",
    );
    assert.deepEqual(
      npmReportedFiles,
      [...EXPECTED_NPM_FILES].sort(compareStrings),
      "npm pack file allowlist changed",
    );

    const archiveEntries = parseTarArchive(await readFile(archivePath));
    const archiveFiles = archiveEntries
      .filter((entry) => entry.type === "file")
      .map((entry) => stripPackagePrefix(entry.path))
      .sort(compareStrings);
    assert.equal(
      archiveFiles.length,
      11,
      "consumer tarball must contain exactly 11 files",
    );
    assert.deepEqual(
      archiveFiles,
      [...EXPECTED_NPM_FILES].sort(compareStrings),
      "tarball contains non-allowlisted files",
    );
    assert.equal(
      archiveFiles.some((fileName) => fileName.endsWith(".map")),
      false,
      "consumer tarball must not contain source maps",
    );
    assert.equal(
      archiveFiles.some((fileName) =>
        [
          "dist/build-manifest.json",
          "dist/package.json",
          "dist/README.md",
          "dist/LICENSE",
          "dist/index.d.ts",
        ].includes(fileName),
      ),
      false,
      "consumer tarball contains internal dist/release metadata",
    );

    await extractPackage(archiveEntries, installedPackageDirectory);
    await writeFile(
      path.join(consumerDirectory, "package.json"),
      `${JSON.stringify({ name: "feathertext-consumer-check", private: true, type: "module" }, null, 2)}\n`,
      "utf8",
    );

    const packedPackage = JSON.parse(
      await readFile(
        path.join(installedPackageDirectory, "package.json"),
        "utf8",
      ),
    );
    assertCanonicalMetadata(packedPackage);
    assertPackageEntrypoints(packedPackage);
    assert.deepEqual(
      [...packedPackage.files].sort(compareStrings),
      [...EXPECTED_PACKAGE_JSON_FILES].sort(compareStrings),
      "packed package files allowlist changed",
    );
    await validatePackedEntrypoints(installedPackageDirectory, packedPackage);
    await validatePackedContents(installedPackageDirectory);

    await verifyEsmConsumer(consumerDirectory, rootPackage.version);
    await verifyCjsConsumer(consumerDirectory, rootPackage.version);
    await verifyBrowserConsumer(installedPackageDirectory, rootPackage.version);

    console.log(`Package verification passed for ${packResult.id}`);
    console.log(
      `  npm pack --json (repository root): ${packResult.filename} (${packResult.size} bytes)`,
    );
    console.log(
      `  exact allowlist: ${archiveFiles.length} files, no maps or internal dist metadata`,
    );
    console.log(
      "  metadata and entrypoints: repository, license, README, changelog, types, exports verified",
    );
    console.log(
      "  consumers: ESM import, CJS require, and browser global verified",
    );
  } finally {
    await rm(temporaryRoot, { force: true, recursive: true });
  }
}

function assertCanonicalMetadata(packageJson) {
  assert.equal(packageJson.name, EXPECTED_NAME, "unexpected package name");
  assert.match(
    packageJson.version,
    /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/,
    "invalid package version",
  );
  assert.equal(
    typeof packageJson.description,
    "string",
    "package description is missing",
  );
  assert.ok(packageJson.description.trim(), "package description is empty");
  assert.equal(packageJson.type, "module", "package type must be module");
  assert.deepEqual(
    packageJson.repository,
    EXPECTED_REPOSITORY,
    "repository metadata changed",
  );
  assert.equal(
    packageJson.homepage,
    EXPECTED_HOMEPAGE,
    "homepage metadata changed",
  );
  assert.deepEqual(packageJson.bugs, EXPECTED_BUGS, "bugs metadata changed");
  assert.equal(
    packageJson.license,
    EXPECTED_LICENSE,
    "license metadata changed",
  );
  assert.deepEqual(
    packageJson.publishConfig,
    EXPECTED_PUBLISH_CONFIG,
    "publishConfig metadata changed",
  );
  assert.notEqual(packageJson.private, true, "package must not be private");
  assert.equal(
    packageJson.dependencies,
    undefined,
    "runtime dependencies are not expected",
  );
}

function assertPackageEntrypoints(packageJson) {
  assert.equal(
    packageJson.main,
    "./dist/feathertext.cjs",
    "main entrypoint changed",
  );
  assert.equal(
    packageJson.module,
    "./dist/feathertext.esm.js",
    "module entrypoint changed",
  );
  assert.equal(
    packageJson.browser,
    "./dist/feathertext.min.js",
    "browser entrypoint changed",
  );
  assert.equal(
    packageJson.unpkg,
    "./dist/feathertext.min.js",
    "unpkg entrypoint changed",
  );
  assert.equal(
    packageJson.jsdelivr,
    "./dist/feathertext.min.js",
    "jsdelivr entrypoint changed",
  );
  assert.equal(
    packageJson.style,
    "./dist/feathertext.min.css",
    "style entrypoint changed",
  );
  assert.equal(packageJson.types, "./index.d.ts", "types entrypoint changed");
  assert.deepEqual(
    packageJson.exports,
    EXPECTED_EXPORTS,
    "exports map changed",
  );
}

async function validateBuildManifest(rootPackage) {
  const manifestPath = path.join(ROOT_DIR, "dist", "build-manifest.json");
  const serializedManifest = await readFile(manifestPath, "utf8");
  const manifest = JSON.parse(serializedManifest);
  assert.equal(
    serializedManifest,
    `${JSON.stringify(manifest, null, 2)}\n`,
    "build manifest serialization is not canonical",
  );
  assert.equal(manifest.name, rootPackage.name, "build manifest name changed");
  assert.equal(
    manifest.version,
    rootPackage.version,
    "build manifest version changed",
  );
  assert.equal(
    manifest.fileListBase,
    "project-root",
    "build manifest file lists must be project-root-relative",
  );
  assert.deepEqual(
    manifest.npmFiles,
    EXPECTED_NPM_FILES,
    "build manifest npmFiles changed",
  );
  assert.equal(
    Object.hasOwn(manifest, "npmPackageFiles"),
    false,
    "build manifest must use npmFiles, not npmPackageFiles",
  );
  assert.deepEqual(
    manifest.releaseZipFiles,
    EXPECTED_RELEASE_ZIP_FILES,
    "build manifest releaseZipFiles changed",
  );
  assert.deepEqual(
    manifest.developmentSourceMapFiles,
    EXPECTED_DEVELOPMENT_MAPS,
    "build manifest developmentSourceMapFiles changed",
  );

  const expectedArtifactNames = [
    ...EXPECTED_RELEASE_ZIP_FILES.filter((fileName) =>
      fileName.startsWith("dist/"),
    ),
    ...EXPECTED_DEVELOPMENT_MAPS,
  ]
    .map((fileName) => fileName.slice("dist/".length))
    .sort(compareStrings);
  assert.deepEqual(
    Object.keys(manifest.files || {}),
    expectedArtifactNames,
    "build manifest artifact allowlist changed",
  );
  for (const fileName of expectedArtifactNames) {
    const contents = await readFile(path.join(ROOT_DIR, "dist", fileName));
    const metadata = manifest.files[fileName];
    assert.ok(contents.byteLength > 0, `dist/${fileName} is empty`);
    assert.equal(
      metadata.bytes,
      contents.byteLength,
      `build manifest byte count changed for dist/${fileName}`,
    );
    assert.equal(
      metadata.sha256,
      createHash("sha256").update(contents).digest("hex"),
      `build manifest digest changed for dist/${fileName}`,
    );
  }

  for (const fileName of RELEASE_ZIP_ONLY_FILES) {
    const source = await readFile(path.join(ROOT_DIR, fileName));
    assert.ok(source.byteLength > 0, `${fileName} is empty`);
    await assert.rejects(
      access(path.join(ROOT_DIR, "dist", fileName)),
      (error) => error?.code === "ENOENT",
      `build must not duplicate ${fileName} under dist/`,
    );
  }
  await assert.rejects(
    access(path.join(ROOT_DIR, "dist", "package.json")),
    (error) => error?.code === "ENOENT",
    "build must not generate dist/package.json",
  );
}

async function validatePackedEntrypoints(
  installedPackageDirectory,
  packageJson,
) {
  const targets = new Set();
  const collect = (value) => {
    if (typeof value === "string" && value.startsWith("./")) {
      targets.add(value.slice(2));
    } else if (value && typeof value === "object") {
      for (const nested of Object.values(value)) collect(nested);
    }
  };
  for (const value of [
    packageJson.main,
    packageJson.module,
    packageJson.browser,
    packageJson.unpkg,
    packageJson.jsdelivr,
    packageJson.style,
    packageJson.types,
    packageJson.exports,
  ]) {
    collect(value);
  }

  for (const target of targets) {
    assert.ok(
      EXPECTED_NPM_FILES.includes(target),
      `entrypoint is not allowlisted: ${target}`,
    );
    const contents = await readFile(
      path.join(installedPackageDirectory, target),
    );
    assert.ok(contents.byteLength > 0, `entrypoint is empty: ${target}`);
  }
}

async function validatePackedContents(installedPackageDirectory) {
  for (const fileName of EXPECTED_NPM_FILES) {
    if (fileName === "package.json") continue;
    const [packed, source] = await Promise.all([
      readFile(path.join(installedPackageDirectory, ...fileName.split("/"))),
      readFile(path.join(ROOT_DIR, ...fileName.split("/"))),
    ]);
    assert.deepEqual(packed, source, `packed content differs from ${fileName}`);
  }

  const [readme, changelog, license, declarations] = await Promise.all([
    readFile(path.join(installedPackageDirectory, "README.md"), "utf8"),
    readFile(path.join(installedPackageDirectory, "CHANGELOG.md"), "utf8"),
    readFile(path.join(installedPackageDirectory, "LICENSE"), "utf8"),
    readFile(path.join(installedPackageDirectory, "index.d.ts"), "utf8"),
  ]);
  assert.match(
    readme,
    /^# FeatherText\n/,
    "package README has the wrong identity",
  );
  assert.match(
    readme,
    /npm install feathertext/,
    "package README is missing installation guidance",
  );
  assert.match(
    changelog,
    /^# Changelog\n/,
    "package changelog has the wrong identity",
  );
  assert.match(
    license,
    /^MIT License\n/,
    "package license is not the canonical MIT license",
  );
  assert.match(
    license,
    /Permission is hereby granted, free of charge/,
    "package license is missing the MIT grant",
  );
  assert.match(
    declarations,
    /export default class FeatherText/,
    "type declarations do not expose FeatherText",
  );
  assert.match(
    declarations,
    /static init\(/,
    "type declarations do not expose FeatherText.init",
  );
}

async function runNpmPack(npm, packDirectory, temporaryRoot) {
  const result = await runProcess(
    npm.command,
    [
      ...npm.prefixArguments,
      "pack",
      ".",
      "--json",
      "--ignore-scripts",
      "--pack-destination",
      packDirectory,
    ],
    {
      cwd: ROOT_DIR,
      env: {
        ...process.env,
        NO_UPDATE_NOTIFIER: "1",
        npm_config_audit: "false",
        npm_config_cache: path.join(temporaryRoot, "npm-cache"),
        npm_config_fund: "false",
        npm_config_ignore_scripts: "true",
        npm_config_loglevel: "error",
        npm_config_update_notifier: "false",
      },
    },
  );

  let report;
  try {
    report = JSON.parse(result.stdout.trim());
  } catch {
    throw new Error(
      `npm pack --json returned invalid JSON: ${result.stdout.trim() || "<empty>"}`,
    );
  }
  assert.equal(
    Array.isArray(report),
    true,
    "npm pack --json must return an array",
  );
  assert.equal(
    report.length,
    1,
    "npm pack --json must return exactly one package",
  );
  return report[0];
}

async function resolveNpmInvocation() {
  const candidates = [
    process.env.npm_execpath,
    path.resolve(
      path.dirname(process.execPath),
      "../lib/node_modules/npm/bin/npm-cli.js",
    ),
    path.resolve(
      path.dirname(process.execPath),
      "node_modules/npm/bin/npm-cli.js",
    ),
  ].filter(Boolean);

  for (const candidate of candidates) {
    try {
      await access(candidate);
      return { command: process.execPath, prefixArguments: [candidate] };
    } catch {
      // Try the next known npm CLI location.
    }
  }

  return {
    command: process.platform === "win32" ? "npm.cmd" : "npm",
    prefixArguments: [],
  };
}

async function verifyEsmConsumer(consumerDirectory, version) {
  const checkPath = path.join(consumerDirectory, "check-esm.mjs");
  await writeFile(
    checkPath,
    `import assert from "node:assert/strict";
import FeatherText, { themes, version } from "feathertext";
assert.equal(typeof FeatherText, "function");
assert.equal(typeof FeatherText.init, "function");
assert.equal(typeof themes.dark, "object");
assert.equal(version, ${JSON.stringify(version)});
assert.equal(FeatherText.version, version);
`,
    "utf8",
  );
  await runProcess(process.execPath, [checkPath], { cwd: consumerDirectory });
}

async function verifyCjsConsumer(consumerDirectory, version) {
  const checkPath = path.join(consumerDirectory, "check-cjs.cjs");
  await writeFile(
    checkPath,
    `const assert = require("node:assert/strict");
const loaded = require("feathertext");
const FeatherText = loaded.default || loaded;
assert.equal(typeof FeatherText, "function");
assert.equal(typeof FeatherText.init, "function");
assert.equal(typeof loaded.themes.dark, "object");
assert.equal(loaded.version, ${JSON.stringify(version)});
assert.equal(FeatherText.version, loaded.version);
`,
    "utf8",
  );
  await runProcess(process.execPath, [checkPath], { cwd: consumerDirectory });
}

async function verifyBrowserConsumer(installedPackageDirectory, version) {
  let JSDOM;
  try {
    ({ JSDOM } = await import("jsdom"));
  } catch (error) {
    throw new Error(
      `jsdom is required for the browser consumer check: ${error.message}`,
    );
  }

  const browserBundle = await readFile(
    path.join(installedPackageDirectory, "dist", "feathertext.min.js"),
    "utf8",
  );
  const dom = new JSDOM(
    "<!doctype html><html><body><textarea id=editor></textarea></body></html>",
    {
      pretendToBeVisual: true,
      runScripts: "outside-only",
      url: "https://consumer.invalid/",
    },
  );

  try {
    dom.window.document.execCommand = () => true;
    dom.window.document.queryCommandState = () => false;
    dom.window.eval(`${browserBundle}\n//# sourceURL=feathertext.min.js`);
    assert.equal(
      typeof dom.window.FeatherText,
      "function",
      "browser bundle did not expose FeatherText",
    );
    assert.equal(
      dom.window.FeatherText.version,
      version,
      "browser bundle exposed the wrong version",
    );
    const [editor] = dom.window.FeatherText.init("#editor", {
      attribution: false,
      charCount: false,
      toolbar: [],
      wordCount: false,
    });
    assert.equal(
      editor.wrapper.classList.contains("feather"),
      true,
      "browser global could not initialize",
    );
    editor.destroy();
  } finally {
    dom.window.close();
  }
}

function parseTarArchive(archive) {
  const tar = gunzipSync(archive);
  const entries = [];
  let offset = 0;
  let pendingPax = {};

  while (offset + 512 <= tar.length) {
    const header = tar.subarray(offset, offset + 512);
    if (header.every((byte) => byte === 0)) break;

    const name = readTarString(header, 0, 100);
    const prefix = readTarString(header, 345, 155);
    const headerPath = prefix ? `${prefix}/${name}` : name;
    const size = readTarNumber(header, 124, 12);
    const typeFlag = String.fromCharCode(header[156] || 48);
    const dataStart = offset + 512;
    const dataEnd = dataStart + size;
    assert.ok(dataEnd <= tar.length, `truncated tar entry: ${headerPath}`);
    const data = tar.subarray(dataStart, dataEnd);

    if (typeFlag === "x" || typeFlag === "g") {
      pendingPax = { ...pendingPax, ...parsePax(data) };
    } else {
      const entryPath = pendingPax.path || headerPath;
      if (typeFlag === "0" || typeFlag === "\0" || typeFlag === "7") {
        entries.push({
          data: Buffer.from(data),
          path: entryPath,
          type: "file",
        });
      } else if (typeFlag === "5") {
        entries.push({
          data: Buffer.alloc(0),
          path: entryPath,
          type: "directory",
        });
      } else {
        throw new Error(
          `unsupported tar entry type ${JSON.stringify(typeFlag)} for ${entryPath}`,
        );
      }
      pendingPax = {};
    }

    offset = dataStart + Math.ceil(size / 512) * 512;
  }

  return entries;
}

function parsePax(data) {
  const records = {};
  let offset = 0;
  while (offset < data.length) {
    const space = data.indexOf(0x20, offset);
    if (space === -1) break;
    const length = Number(data.toString("ascii", offset, space));
    if (
      !Number.isInteger(length) ||
      length <= 0 ||
      offset + length > data.length
    ) {
      break;
    }
    const record = data.toString("utf8", space + 1, offset + length - 1);
    const equals = record.indexOf("=");
    if (equals !== -1) {
      records[record.slice(0, equals)] = record.slice(equals + 1);
    }
    offset += length;
  }
  return records;
}

function readTarString(buffer, offset, length) {
  const end = buffer.indexOf(0, offset);
  const boundedEnd =
    end === -1 || end > offset + length ? offset + length : end;
  return buffer.toString("utf8", offset, boundedEnd).trim();
}

function readTarNumber(buffer, offset, length) {
  if ((buffer[offset] & 0x80) !== 0) {
    let value = BigInt(buffer[offset] & 0x7f);
    for (let index = offset + 1; index < offset + length; index += 1) {
      value = (value << 8n) | BigInt(buffer[index]);
    }
    return Number(value);
  }
  const value = readTarString(buffer, offset, length).replace(/\s/g, "");
  return value ? Number.parseInt(value, 8) : 0;
}

async function extractPackage(entries, destinationRoot) {
  const safeRoot = `${path.resolve(destinationRoot)}${path.sep}`;
  for (const entry of entries) {
    const normalized = path.posix.normalize(entry.path);
    const components = normalized.split("/").filter(Boolean);
    assert.equal(
      components.shift(),
      "package",
      `tar entry is outside package/: ${entry.path}`,
    );
    assert.equal(
      components.includes(".."),
      false,
      `unsafe tar entry: ${entry.path}`,
    );
    if (components.length === 0) continue;

    const destination = path.resolve(destinationRoot, ...components);
    assert.ok(
      destination.startsWith(safeRoot),
      `unsafe extraction path: ${entry.path}`,
    );
    if (entry.type === "directory") {
      await mkdir(destination, { recursive: true });
    } else {
      await mkdir(path.dirname(destination), { recursive: true });
      await writeFile(destination, entry.data, { mode: 0o644 });
    }
  }
}

function stripPackagePrefix(filePath) {
  return filePath.replace(/^package\//, "");
}

function compareStrings(left, right) {
  return left < right ? -1 : left > right ? 1 : 0;
}

function runProcess(command, args, options) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd: options.cwd,
      env: options.env || process.env,
      stdio: ["ignore", "pipe", "pipe"],
    });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk;
    });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) {
        resolve({ stderr, stdout });
        return;
      }
      const detail = stderr.trim() || stdout.trim() || "no output";
      reject(
        new Error(
          `${path.basename(command)} exited with ${signal ? `signal ${signal}` : `code ${code}`}: ${detail}`,
        ),
      );
    });
  });
}
