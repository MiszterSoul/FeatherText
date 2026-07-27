import { createHash } from "node:crypto";
import {
  chmod,
  mkdir,
  readFile,
  readdir,
  rm,
  stat,
  writeFile,
} from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { build } from "esbuild";

const ROOT_DIR = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(ROOT_DIR, "dist");
const packageJson = JSON.parse(
  await readFile(path.join(ROOT_DIR, "package.json"), "utf8"),
);
const define = { __FEATHER_VERSION__: JSON.stringify(packageJson.version) };

const javascriptBase = {
  absWorkingDir: ROOT_DIR,
  bundle: true,
  charset: "utf8",
  define,
  legalComments: "none",
  logLevel: "warning",
  target: ["es2020"],
  treeShaking: true,
};
const developmentSourceMap = {
  sourcemap: "external",
  sourcesContent: true,
};
const packageEntry = "src/feathertext.performance-entry.js";

await rm(DIST_DIR, { force: true, recursive: true });
await mkdir(DIST_DIR, { recursive: true });

await Promise.all([
  build({
    ...javascriptBase,
    ...developmentSourceMap,
    entryPoints: [packageEntry],
    format: "esm",
    outfile: "dist/feathertext.esm.js",
    platform: "neutral",
  }),
  build({
    ...javascriptBase,
    ...developmentSourceMap,
    entryPoints: [packageEntry],
    format: "cjs",
    outfile: "dist/feathertext.cjs",
    platform: "neutral",
  }),
  build({
    ...javascriptBase,
    ...developmentSourceMap,
    entryPoints: ["src/feathertext.global.js"],
    format: "iife",
    outfile: "dist/feathertext.js",
    platform: "browser",
  }),
  build({
    ...javascriptBase,
    entryPoints: ["src/feathertext.global.js"],
    format: "iife",
    minify: true,
    outfile: "dist/feathertext.min.js",
    platform: "browser",
    sourcemap: false,
  }),
  build({
    absWorkingDir: ROOT_DIR,
    bundle: true,
    charset: "utf8",
    entryPoints: ["src/feathertext.css"],
    legalComments: "none",
    logLevel: "warning",
    outfile: "dist/feathertext.css",
    ...developmentSourceMap,
  }),
  build({
    absWorkingDir: ROOT_DIR,
    bundle: true,
    charset: "utf8",
    entryPoints: ["src/feathertext.css"],
    legalComments: "none",
    logLevel: "warning",
    minify: true,
    outfile: "dist/feathertext.min.css",
    sourcemap: false,
  }),
]);

const npmFiles = Object.freeze([
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
const releaseZipFiles = Object.freeze([
  "README.md",
  "LICENSE",
  "index.d.ts",
  "dist/feathertext.cjs",
  "dist/feathertext.esm.js",
  "dist/feathertext.js",
  "dist/feathertext.min.js",
  "dist/feathertext.css",
  "dist/feathertext.min.css",
]);
const developmentSourceMapFiles = Object.freeze([
  "dist/feathertext.cjs.map",
  "dist/feathertext.esm.js.map",
  "dist/feathertext.js.map",
  "dist/feathertext.css.map",
]);

async function describeFile(fileName) {
  const contents = await readFile(path.join(DIST_DIR, fileName));
  return {
    bytes: contents.byteLength,
    sha256: createHash("sha256").update(contents).digest("hex"),
  };
}

const compareFileNames = (left, right) =>
  left < right ? -1 : left > right ? 1 : 0;
const artifactNames = (await readdir(DIST_DIR)).sort(compareFileNames);
const artifacts = Object.fromEntries(
  await Promise.all(
    artifactNames.map(async (fileName) => [
      fileName,
      await describeFile(fileName),
    ]),
  ),
);
const buildManifest = {
  name: packageJson.name,
  version: packageJson.version,
  fileListBase: "project-root",
  files: artifacts,
  npmFiles,
  releaseZipFiles,
  developmentSourceMapFiles,
};
await writeFile(
  path.join(DIST_DIR, "build-manifest.json"),
  `${JSON.stringify(buildManifest, null, 2)}\n`,
  "utf8",
);

for (const fileName of await readdir(DIST_DIR)) {
  const filePath = path.join(DIST_DIR, fileName);
  if ((await stat(filePath)).isFile()) await chmod(filePath, 0o644);
}

const finalNames = (await readdir(DIST_DIR)).sort(compareFileNames);
console.log(`Built ${finalNames.length} deterministic artifacts in dist/`);
for (const fileName of finalNames) console.log(`  ${fileName}`);
