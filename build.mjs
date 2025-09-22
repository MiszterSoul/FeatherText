import { build } from "esbuild";
import fs from "node:fs";
const pkgJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const define = { __FEATHER_VERSION__: JSON.stringify(pkgJson.version) };

await build({
  entryPoints: ["src/feathertext.js"],
  bundle: true,
  format: "esm",
  outfile: "dist/feathertext.esm.js",
  sourcemap: true,
  define,
});

await build({
  entryPoints: ["src/feathertext.js"],
  bundle: true,
  format: "cjs",
  outfile: "dist/feathertext.cjs",
  sourcemap: true,
  define,
});

await build({
  entryPoints: ["src/feathertext.js"],
  bundle: true,
  format: "iife",
  // Use a different global name to avoid clobbering the UMD-assigned window.FeatherText
  globalName: "FeatherTextBundle",
  outfile: "dist/feathertext.min.js",
  minify: true,
  sourcemap: false,
  define,
});

// tiny CSS example (optional)
if (fs.existsSync("src/feathertext.css")) {
  fs.copyFileSync("src/feathertext.css", "dist/feathertext.css");
}
