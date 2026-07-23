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
const packageEntry = "src/feathertext.performance-entry.js";

fs.mkdirSync("dist", { recursive: true });

await build({
  ...baseConfig,
  entryPoints: [packageEntry],
  format: "esm",
  outfile: "dist/feathertext.esm.js",
  sourcemap: true,
});

await build({
  ...baseConfig,
  entryPoints: [packageEntry],
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

const cssSources = [
  "src/feathertext.css",
  "src/feathertext.performance.css",
].filter((file) => fs.existsSync(file));

if (cssSources.length > 0) {
  const css = cssSources.map((file) => fs.readFileSync(file, "utf8").trimEnd()).join("\n\n") + "\n";
  fs.writeFileSync("dist/feathertext.css", css);
  fs.writeFileSync("feathertext.css", css);
}
