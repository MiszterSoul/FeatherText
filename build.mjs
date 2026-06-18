import { build } from "esbuild";
import fs from "node:fs";

const pkgJson = JSON.parse(fs.readFileSync("package.json", "utf8"));
const define = { __FEATHER_VERSION__: JSON.stringify(pkgJson.version) };
const baseConfig = {
  bundle: true,
  target: ["es2020"],
  legalComments: "none",
  define,
};

fs.mkdirSync("dist", { recursive: true });

await build({
  ...baseConfig,
  entryPoints: ["src/feathertext.js"],
  format: "esm",
  outfile: "dist/feathertext.esm.js",
  sourcemap: true,
});

await build({
  ...baseConfig,
  entryPoints: ["src/feathertext.js"],
  format: "cjs",
  outfile: "dist/feathertext.cjs",
  sourcemap: true,
});

await build({
  ...baseConfig,
  entryPoints: ["src/feathertext.global.js"],
  format: "iife",
  outfile: "feathertext.js",
  sourcemap: true,
});

await build({
  ...baseConfig,
  entryPoints: ["src/feathertext.global.js"],
  format: "iife",
  outfile: "dist/feathertext.min.js",
  minify: true,
  sourcemap: false,
});

fs.copyFileSync("dist/feathertext.min.js", "feathertext.min.js");

if (fs.existsSync("src/feathertext.css")) {
  fs.copyFileSync("src/feathertext.css", "dist/feathertext.css");
  fs.copyFileSync("src/feathertext.css", "feathertext.css");
}
