#!/usr/bin/env node

import { spawn } from "node:child_process";
import {
  copyFile,
  cp,
  mkdir,
  readFile,
  readdir,
  rename,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIR = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DIST_DIR = path.join(ROOT_DIR, "dist");
const DEFAULT_SITE_DIR = path.join(ROOT_DIR, "site");
const EXAMPLES_DIR = path.join(ROOT_DIR, "examples");
const DEFAULT_PAGES_DIR = path.join(ROOT_DIR, "_site");
const REQUIRED_PAGE_FILES = Object.freeze([
  "index.html",
  "dist/feathertext.css",
  "dist/feathertext.min.js",
  "examples/index.html",
  "examples/basic.html",
  "examples/api.html",
]);

const options = parseArguments(process.argv.slice(2));
if (options.help) {
  console.log(
    "Usage: node scripts/build-site.mjs [--skip-build] [--site DIR] [--out DIR]",
  );
  console.log(
    "  --skip-build  Stage the existing dist instead of rebuilding it.",
  );
  console.log("  --site DIR    Site source directory (default: site/).");
  console.log("  --out DIR     Generated Pages directory (default: _site/).");
  process.exit(0);
}

await main().catch((error) => {
  console.error(`Site build failed: ${error.message}`);
  process.exitCode = 1;
});

async function main() {
  if (!options.skipBuild) await runBuild();

  const pagesDirectory = resolveProjectPath(options.out || DEFAULT_PAGES_DIR);
  const requestedSiteDirectory = options.site
    ? resolveProjectPath(options.site)
    : DEFAULT_SITE_DIR;
  if (!(await isDirectory(requestedSiteDirectory))) {
    throw new Error(
      `Site source directory does not exist: ${relativeProjectPath(requestedSiteDirectory)}`,
    );
  }
  if (!(await isFile(path.join(requestedSiteDirectory, "index.html")))) {
    throw new Error(
      `Site entry point is missing: ${relativeProjectPath(path.join(requestedSiteDirectory, "index.html"))}`,
    );
  }

  assertSafeOutputDirectory(pagesDirectory, requestedSiteDirectory);
  const stagingDirectory = `${pagesDirectory}.tmp`;
  await Promise.all([
    rm(pagesDirectory, { force: true, recursive: true }),
    rm(stagingDirectory, { force: true, recursive: true }),
  ]);
  await mkdir(path.dirname(stagingDirectory), { recursive: true });

  let stagedArtifacts;
  let validation;
  try {
    await cp(requestedSiteDirectory, stagingDirectory, { recursive: true });
    await stageExamples(stagingDirectory);
    const distributionDirectory = path.join(stagingDirectory, "dist");
    await mkdir(distributionDirectory, { recursive: true });
    stagedArtifacts = await copyDistribution(distributionDirectory);
    validation = await validatePagesDirectory(stagingDirectory);
    await rename(stagingDirectory, pagesDirectory);
  } catch (error) {
    await rm(stagingDirectory, { force: true, recursive: true });
    throw error;
  }

  console.log(
    `Built Pages staging directory: ${relativeProjectPath(pagesDirectory)}`,
  );
  console.log(`  site input: ${relativeProjectPath(requestedSiteDirectory)}`);
  console.log(`  dist artifacts: ${stagedArtifacts} files`);
  console.log(
    `  validation: ${validation.htmlFiles} HTML files, ${validation.references} local references`,
  );
}

function parseArguments(args) {
  const parsed = { help: false, out: null, site: null, skipBuild: false };
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--help") parsed.help = true;
    else if (argument === "--skip-build") parsed.skipBuild = true;
    else if (argument === "--out" || argument === "--site") {
      const value = args[index + 1];
      if (!value || value.startsWith("--"))
        throw new Error(`${argument} requires a directory`);
      parsed[argument.slice(2)] = value;
      index += 1;
    } else {
      throw new Error(`Unknown option: ${argument}`);
    }
  }
  return parsed;
}

function resolveProjectPath(value) {
  return path.resolve(ROOT_DIR, value);
}

function assertSafeOutputDirectory(output, siteDirectory) {
  const relative = path.relative(ROOT_DIR, output);
  if (!relative || relative.startsWith("..") || path.isAbsolute(relative)) {
    throw new Error("Pages output must be a directory inside the project root");
  }
  const forbidden = [ROOT_DIR, DIST_DIR, path.join(ROOT_DIR, "src")];
  if (forbidden.includes(output))
    throw new Error(`Unsafe Pages output directory: ${relative}`);
  if (pathsOverlap(output, siteDirectory)) {
    throw new Error("Pages output must not overlap the site source directory");
  }
}

function pathsOverlap(left, right) {
  const normalizedLeft = path.resolve(left);
  const normalizedRight = path.resolve(right);
  return (
    normalizedLeft === normalizedRight ||
    normalizedLeft.startsWith(`${normalizedRight}${path.sep}`) ||
    normalizedRight.startsWith(`${normalizedLeft}${path.sep}`)
  );
}

async function runBuild() {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(ROOT_DIR, "build.mjs")], {
      cwd: ROOT_DIR,
      stdio: "inherit",
    });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) resolve();
      else
        reject(
          new Error(
            `build.mjs exited with ${signal ? `signal ${signal}` : `code ${code}`}`,
          ),
        );
    });
  });
}

async function stageExamples(stagingDirectory) {
  if (!(await isDirectory(EXAMPLES_DIR))) {
    throw new Error("Examples source directory does not exist: examples");
  }

  const destination = path.join(stagingDirectory, "examples");
  await cp(EXAMPLES_DIR, destination, { recursive: true });

  const siteIndex = path.join(stagingDirectory, "index.html");
  const siteContents = await readFile(siteIndex, "utf8");
  await writeFile(
    siteIndex,
    siteContents.replaceAll("../examples/", "./examples/"),
  );

  for (const fileName of await walkFiles(destination)) {
    if (!fileName.endsWith(".html")) continue;
    const contents = await readFile(fileName, "utf8");
    await writeFile(
      fileName,
      contents
        .replaceAll("../site/assets/", "../assets/")
        .replaceAll("../site/", "../"),
    );
  }
}

async function copyDistribution(destination) {
  let manifest;
  try {
    manifest = JSON.parse(
      await readFile(path.join(DIST_DIR, "build-manifest.json"), "utf8"),
    );
  } catch (error) {
    if (error && error.code === "ENOENT") {
      throw new Error(
        "dist/build-manifest.json is missing; run node build.mjs first",
      );
    }
    throw error;
  }

  const artifactNames = [
    ...Object.keys(manifest.files || {}),
    "build-manifest.json",
  ].sort((left, right) => left.localeCompare(right));
  if (artifactNames.length <= 1)
    throw new Error("dist/build-manifest.json contains no artifacts");

  for (const fileName of artifactNames) {
    if (path.basename(fileName) !== fileName)
      throw new Error(`Unsafe dist artifact name: ${fileName}`);
    const source = path.join(DIST_DIR, fileName);
    if (!(await isFile(source)))
      throw new Error(`Missing dist artifact: ${fileName}`);
    await copyFile(source, path.join(destination, fileName));
  }
  return artifactNames.length;
}

async function validatePagesDirectory(pagesDirectory) {
  for (const required of REQUIRED_PAGE_FILES) {
    if (!(await isFile(path.join(pagesDirectory, ...required.split("/"))))) {
      throw new Error(`Required Pages asset is missing: ${required}`);
    }
  }

  const files = await walkFiles(pagesDirectory);
  const htmlFiles = files.filter((fileName) => fileName.endsWith(".html"));
  const cssFiles = files.filter((fileName) => fileName.endsWith(".css"));
  if (htmlFiles.length === 0)
    throw new Error("Pages staging directory contains no HTML files");

  const failures = [];
  let referenceCount = 0;
  const idCache = new Map();

  for (const htmlFile of htmlFiles) {
    const contents = await readFile(htmlFile, "utf8");
    for (const reference of extractHtmlReferences(contents)) {
      if (!isLocalReference(reference)) continue;
      referenceCount += 1;
      const failure = await validateReference(
        reference,
        htmlFile,
        pagesDirectory,
        idCache,
      );
      if (failure) failures.push(failure);
    }
  }

  for (const cssFile of cssFiles) {
    const contents = await readFile(cssFile, "utf8");
    for (const reference of extractCssReferences(contents)) {
      if (!isLocalReference(reference)) continue;
      referenceCount += 1;
      const failure = await validateReference(
        reference,
        cssFile,
        pagesDirectory,
        idCache,
      );
      if (failure) failures.push(failure);
    }
  }

  if (failures.length > 0) {
    const details = failures
      .map(
        ({ file, reason, reference }) =>
          `  ${relativeTo(pagesDirectory, file)} -> ${reference} (${reason})`,
      )
      .join("\n");
    throw new Error(`broken local links/assets:\n${details}`);
  }

  return { htmlFiles: htmlFiles.length, references: referenceCount };
}

function extractHtmlReferences(contents) {
  const references = [];
  const attributePattern =
    /\b(?:action|href|poster|src)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+))/gi;
  for (const match of contents.matchAll(attributePattern)) {
    references.push(match[1] ?? match[2] ?? match[3] ?? "");
  }
  const srcsetPattern = /\bsrcset\s*=\s*(?:"([^"]*)"|'([^']*)')/gi;
  for (const match of contents.matchAll(srcsetPattern)) {
    const value = match[1] ?? match[2] ?? "";
    for (const candidate of value.split(",")) {
      const [reference] = candidate.trim().split(/\s+/, 1);
      if (reference) references.push(reference);
    }
  }
  return references;
}

function extractCssReferences(contents) {
  const references = [];
  const urlPattern = /url\(\s*(?:"([^"]*)"|'([^']*)'|([^)'"\s]+))\s*\)/gi;
  for (const match of contents.matchAll(urlPattern)) {
    references.push(match[1] ?? match[2] ?? match[3] ?? "");
  }
  const importPattern = /@import\s+(?:url\(\s*)?(?:"([^"]*)"|'([^']*)')/gi;
  for (const match of contents.matchAll(importPattern)) {
    references.push(match[1] ?? match[2] ?? "");
  }
  return references;
}

function isLocalReference(reference) {
  const value = reference.trim();
  if (!value) return false;
  if (value.startsWith("//")) return false;
  return !/^[A-Za-z][A-Za-z\d+.-]*:/.test(value);
}

async function validateReference(
  reference,
  sourceFile,
  pagesDirectory,
  idCache,
) {
  const hashIndex = reference.indexOf("#");
  const queryIndex = reference.indexOf("?");
  const pathEndCandidates = [hashIndex, queryIndex].filter(
    (index) => index !== -1,
  );
  const pathEnd =
    pathEndCandidates.length > 0
      ? Math.min(...pathEndCandidates)
      : reference.length;
  const encodedPath = reference.slice(0, pathEnd);
  const encodedFragment =
    hashIndex === -1 ? "" : reference.slice(hashIndex + 1);

  let referencePath;
  let fragment;
  try {
    referencePath = decodeURIComponent(encodedPath);
    fragment = decodeURIComponent(encodedFragment);
  } catch {
    return { file: sourceFile, reason: "invalid URL encoding", reference };
  }

  let target = referencePath
    ? referencePath.startsWith("/")
      ? path.resolve(pagesDirectory, `.${referencePath}`)
      : path.resolve(path.dirname(sourceFile), referencePath)
    : sourceFile;

  const relativeTarget = path.relative(pagesDirectory, target);
  if (relativeTarget.startsWith("..") || path.isAbsolute(relativeTarget)) {
    return { file: sourceFile, reason: "escapes Pages directory", reference };
  }

  if (await isDirectory(target)) target = path.join(target, "index.html");
  if (!(await isFile(target)))
    return { file: sourceFile, reason: "missing", reference };

  if (
    fragment &&
    !fragment.startsWith(":~:text=") &&
    target.endsWith(".html")
  ) {
    const ids = await readDocumentIds(target, idCache);
    if (!ids.has(fragment))
      return {
        file: sourceFile,
        reason: `missing fragment #${fragment}`,
        reference,
      };
  }
  return null;
}

async function readDocumentIds(fileName, cache) {
  if (cache.has(fileName)) return cache.get(fileName);
  const contents = await readFile(fileName, "utf8");
  const ids = new Set();
  const idPattern =
    /\b(?:id|name)\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s"'=<>`]+))/gi;
  for (const match of contents.matchAll(idPattern))
    ids.add(match[1] ?? match[2] ?? match[3]);
  cache.set(fileName, ids);
  return ids;
}

async function walkFiles(directory) {
  const files = [];
  const entries = await readdir(directory, { withFileTypes: true });
  entries.sort((left, right) => left.name.localeCompare(right.name));
  for (const entry of entries) {
    const entryPath = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...(await walkFiles(entryPath)));
    else if (entry.isFile()) files.push(entryPath);
  }
  return files;
}

async function isDirectory(fileName) {
  try {
    return (await stat(fileName)).isDirectory();
  } catch (error) {
    if (error && error.code === "ENOENT") return false;
    throw error;
  }
}

async function isFile(fileName) {
  try {
    return (await stat(fileName)).isFile();
  } catch (error) {
    if (error && error.code === "ENOENT") return false;
    throw error;
  }
}

function relativeProjectPath(fileName) {
  return relativeTo(ROOT_DIR, fileName);
}

function relativeTo(directory, fileName) {
  return path.relative(directory, fileName).split(path.sep).join("/") || ".";
}
