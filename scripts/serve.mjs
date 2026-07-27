#!/usr/bin/env node

import { createReadStream } from "node:fs";
import { realpath, stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT_DIR = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const DEFAULT_MAX_RUNTIME_MS = 10 * 60 * 1000;
const MIME_TYPES = Object.freeze({
  ".cjs": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".d.ts": "text/plain; charset=utf-8",
  ".gif": "image/gif",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".map": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".txt": "text/plain; charset=utf-8",
  ".webp": "image/webp",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
});

const options = parseArguments(process.argv.slice(2));
if (options.help) {
  console.log("Usage: node scripts/serve.mjs [--root DIR] [--host HOST] [--port PORT] [--max-runtime MS]");
  console.log("  --root         Static root (default: dist/pages)");
  console.log("  --host         Listen address (default: 127.0.0.1)");
  console.log("  --port         Listen port (default: PORT or 4173)");
  console.log("  --max-runtime  Stop after this many milliseconds; 0 disables (default: 600000)");
  process.exit(0);
}

await main().catch((error) => {
  console.error(`Static server failed: ${error.message}`);
  process.exitCode = 1;
});

async function main() {
  const requestedRoot = path.resolve(ROOT_DIR, options.root);
  let staticRoot;
  try {
    staticRoot = await realpath(requestedRoot);
  } catch (error) {
    if (error && error.code === "ENOENT") {
      throw new Error(`static root does not exist: ${relativeProjectPath(requestedRoot)}`);
    }
    throw error;
  }
  if (!(await stat(staticRoot)).isDirectory()) throw new Error("static root must be a directory");

  const server = http.createServer((request, response) => {
    serveRequest(request, response, staticRoot).catch((error) => {
      console.error(`Request failed: ${error.message}`);
      if (!response.headersSent) sendText(response, 500, "Internal Server Error\n");
      else response.destroy(error);
    });
  });
  server.requestTimeout = 30_000;
  server.headersTimeout = 35_000;
  server.keepAliveTimeout = 5_000;

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(options.port, options.host, () => {
      server.off("error", reject);
      resolve();
    });
  });

  const address = server.address();
  const actualPort = typeof address === "object" && address ? address.port : options.port;
  console.log(`Serving ${relativeProjectPath(staticRoot)} at http://${options.host}:${actualPort}/`);
  if (options.maxRuntime > 0) console.log(`Server will stop after ${options.maxRuntime} ms.`);

  let shutdownStarted = false;
  let forceCloseTimer;
  const shutdown = (reason) => {
    if (shutdownStarted) return;
    shutdownStarted = true;
    if (lifetimeTimer) clearTimeout(lifetimeTimer);
    console.log(`Stopping static server (${reason}).`);
    server.close();
    forceCloseTimer = setTimeout(() => server.closeAllConnections(), 1_000);
    forceCloseTimer.unref();
  };

  const lifetimeTimer = options.maxRuntime > 0
    ? setTimeout(() => shutdown("maximum runtime reached"), options.maxRuntime)
    : null;
  process.once("SIGINT", () => shutdown("SIGINT"));
  process.once("SIGTERM", () => shutdown("SIGTERM"));
  server.once("close", () => {
    if (forceCloseTimer) clearTimeout(forceCloseTimer);
  });
}

async function serveRequest(request, response, staticRoot) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    response.setHeader("Allow", "GET, HEAD");
    sendText(response, 405, "Method Not Allowed\n", request.method === "HEAD");
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url || "/", "http://local.invalid").pathname);
  } catch {
    sendText(response, 400, "Bad Request\n", request.method === "HEAD");
    return;
  }
  if (pathname.includes("\0")) {
    sendText(response, 400, "Bad Request\n", request.method === "HEAD");
    return;
  }

  const relativeName = pathname.replace(/^\/+/, "");
  let candidate = path.resolve(staticRoot, relativeName || ".");
  if (!isWithin(staticRoot, candidate)) {
    sendText(response, 403, "Forbidden\n", request.method === "HEAD");
    return;
  }

  let candidateStats = await statIfPresent(candidate);
  if (candidateStats?.isDirectory()) {
    candidate = path.join(candidate, "index.html");
    candidateStats = await statIfPresent(candidate);
  } else if (!candidateStats && !path.extname(candidate)) {
    const htmlCandidate = `${candidate}.html`;
    const htmlStats = await statIfPresent(htmlCandidate);
    if (htmlStats?.isFile()) {
      candidate = htmlCandidate;
      candidateStats = htmlStats;
    }
  }

  if (!candidateStats?.isFile()) {
    sendText(response, 404, "Not Found\n", request.method === "HEAD");
    return;
  }

  const realCandidate = await realpath(candidate);
  if (!isWithin(staticRoot, realCandidate)) {
    sendText(response, 403, "Forbidden\n", request.method === "HEAD");
    return;
  }

  response.statusCode = 200;
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Content-Length", String(candidateStats.size));
  response.setHeader("Content-Type", MIME_TYPES[path.extname(realCandidate).toLowerCase()] || "application/octet-stream");
  response.setHeader("X-Content-Type-Options", "nosniff");
  if (request.method === "HEAD") {
    response.end();
    return;
  }

  await new Promise((resolve, reject) => {
    const stream = createReadStream(realCandidate);
    stream.once("error", reject);
    response.once("close", resolve);
    response.once("finish", resolve);
    stream.pipe(response);
  });
}

function parseArguments(args) {
  const parsed = {
    help: false,
    host: "127.0.0.1",
    maxRuntime: DEFAULT_MAX_RUNTIME_MS,
    port: process.env.PORT || "4173",
    root: "dist/pages",
  };

  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--help") {
      parsed.help = true;
      continue;
    }
    if (!["--host", "--max-runtime", "--port", "--root"].includes(argument)) {
      throw new Error(`Unknown option: ${argument}`);
    }
    const value = args[index + 1];
    if (value === undefined || value.startsWith("--")) throw new Error(`${argument} requires a value`);
    parsed[argument.slice(2).replace("-runtime", "Runtime")] = value;
    index += 1;
  }

  parsed.port = parseInteger(parsed.port, "port", 0, 65_535);
  parsed.maxRuntime = parseInteger(parsed.maxRuntime, "max-runtime", 0, 86_400_000);
  if (!parsed.host) throw new Error("host must not be empty");
  if (!parsed.root) throw new Error("root must not be empty");
  return parsed;
}

function parseInteger(value, label, minimum, maximum) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(`${label} must be an integer from ${minimum} to ${maximum}`);
  }
  return parsed;
}

async function statIfPresent(fileName) {
  try {
    return await stat(fileName);
  } catch (error) {
    if (error && (error.code === "ENOENT" || error.code === "ENOTDIR")) return null;
    throw error;
  }
}

function isWithin(root, candidate) {
  const relative = path.relative(root, candidate);
  return relative === "" || (!relative.startsWith("..") && !path.isAbsolute(relative));
}

function sendText(response, status, body, headOnly = false) {
  response.statusCode = status;
  response.setHeader("Cache-Control", "no-store");
  response.setHeader("Content-Type", "text/plain; charset=utf-8");
  response.setHeader("X-Content-Type-Options", "nosniff");
  response.end(headOnly ? undefined : body);
}

function relativeProjectPath(fileName) {
  const relative = path.relative(ROOT_DIR, fileName).split(path.sep).join("/");
  return relative && !relative.startsWith("..") ? relative : fileName;
}
