import FeatherText, { themes, version } from "./feathertext.performance-entry.js";

FeatherText.themes = themes;
FeatherText.version = version;

if (typeof globalThis !== "undefined") {
  globalThis.FeatherText = FeatherText;
}
