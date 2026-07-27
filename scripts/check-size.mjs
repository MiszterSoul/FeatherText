#!/usr/bin/env node

/**
 * Distribution size budgets (compressed with gzip level 9):
 *   - Browser JavaScript: dist/feathertext.min.js <= 35 KiB gzip
 *   - Stylesheet:         dist/feathertext.min.css <= 20 KiB gzip
 *
 * The report's raw column is the readable development artifact, min is the
 * minified release artifact, and gzip is the minified artifact after gzip.
 */

import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { constants as zlibConstants, gzipSync } from "node:zlib";

const ROOT_DIR = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DIST_DIR = path.join(ROOT_DIR, "dist");
const KIB = 1024;

export const SIZE_BUDGETS = Object.freeze({
  javascript: 35 * KIB,
  css: 20 * KIB,
});

const targets = Object.freeze([
  {
    budget: SIZE_BUDGETS.javascript,
    key: "javascript",
    label: "JavaScript",
    minified: "feathertext.min.js",
    raw: "feathertext.js",
  },
  {
    budget: SIZE_BUDGETS.css,
    key: "css",
    label: "CSS",
    minified: "feathertext.min.css",
    raw: "feathertext.css",
  },
]);

const options = parseArguments(process.argv.slice(2));
if (options.help) {
  console.log("Usage: node scripts/check-size.mjs [--build] [--json]");
  console.log("  --build  Rebuild dist before measuring it.");
  console.log("  --json   Emit a machine-readable report.");
  process.exit(0);
}

try {
  if (options.build) await runBuild(options.json);

  const results = await Promise.all(targets.map(measureTarget));
  const failed = results.filter((result) => !result.withinBudget);

  if (options.json) {
    console.log(`${JSON.stringify({ budgets: SIZE_BUDGETS, results, passed: failed.length === 0 }, null, 2)}\n`);
  } else {
    printHumanReport(results);
  }

  if (failed.length > 0) process.exitCode = 1;
} catch (error) {
  console.error(`Size check failed: ${error.message}`);
  process.exitCode = 1;
}

function parseArguments(args) {
  const known = new Set(["--build", "--help", "--json"]);
  const unknown = args.filter((argument) => !known.has(argument));
  if (unknown.length > 0) throw new Error(`Unknown option: ${unknown.join(", ")}`);
  return {
    build: args.includes("--build"),
    help: args.includes("--help"),
    json: args.includes("--json"),
  };
}

async function runBuild(quiet) {
  await new Promise((resolve, reject) => {
    const child = spawn(process.execPath, [path.join(ROOT_DIR, "build.mjs")], {
      cwd: ROOT_DIR,
      stdio: quiet ? ["ignore", "ignore", "inherit"] : "inherit",
    });
    child.once("error", reject);
    child.once("exit", (code, signal) => {
      if (code === 0) resolve();
      else reject(new Error(`build.mjs exited with ${signal ? `signal ${signal}` : `code ${code}`}`));
    });
  });
}

async function measureTarget(target) {
  let rawContents;
  let minifiedContents;
  try {
    [rawContents, minifiedContents] = await Promise.all([
      readFile(path.join(DIST_DIR, target.raw)),
      readFile(path.join(DIST_DIR, target.minified)),
    ]);
  } catch (error) {
    if (error && error.code === "ENOENT") {
      throw new Error(`Missing dist artifact; run node build.mjs first (${error.path})`);
    }
    throw error;
  }

  const gzipBytes = gzipSync(minifiedContents, {
    level: zlibConstants.Z_BEST_COMPRESSION,
  }).byteLength;

  return {
    key: target.key,
    label: target.label,
    files: {
      raw: `dist/${target.raw}`,
      minified: `dist/${target.minified}`,
    },
    bytes: {
      raw: rawContents.byteLength,
      minified: minifiedContents.byteLength,
      gzip: gzipBytes,
      budget: target.budget,
      remaining: target.budget - gzipBytes,
    },
    withinBudget: gzipBytes <= target.budget,
  };
}

function printHumanReport(results) {
  const rows = results.map((result) => ({
    asset: result.label,
    raw: formatBytes(result.bytes.raw),
    min: formatBytes(result.bytes.minified),
    gzip: formatBytes(result.bytes.gzip),
    budget: formatBytes(result.bytes.budget),
    status: result.withinBudget ? "PASS" : "FAIL",
  }));
  const headings = {
    asset: "Asset",
    raw: "Raw",
    min: "Min",
    gzip: "Gzip",
    budget: "Budget",
    status: "Status",
  };
  const keys = Object.keys(headings);
  const widths = Object.fromEntries(
    keys.map((key) => [
      key,
      Math.max(headings[key].length, ...rows.map((row) => row[key].length)),
    ]),
  );
  const line = (row) => keys.map((key) => row[key].padEnd(widths[key])).join("  ");

  console.log("FeatherText distribution sizes (gzip level 9)");
  console.log(line(headings));
  console.log(keys.map((key) => "-".repeat(widths[key])).join("  "));
  for (const row of rows) console.log(line(row));

  const failures = results.filter((result) => !result.withinBudget);
  if (failures.length === 0) {
    console.log("\nAll size budgets passed.");
  } else {
    console.error("\nSize budget exceeded:");
    for (const result of failures) {
      console.error(
        `  ${result.label}: ${formatBytes(result.bytes.gzip)} gzip is ${formatBytes(-result.bytes.remaining)} over ${formatBytes(result.bytes.budget)}`,
      );
    }
  }
}

function formatBytes(bytes) {
  if (bytes < KIB) return `${bytes} B`;
  return `${(bytes / KIB).toFixed(2)} KiB`;
}
