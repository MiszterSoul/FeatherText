import { themes } from "./config.js";

const THEME_KEYS = [
  "bg",
  "panel",
  "border",
  "accent",
  "text",
  "muted",
  "hover",
  "shadow",
];

function listen(query, handler) {
  if (!query) return () => {};
  if (typeof query.addEventListener === "function") {
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }
  if (typeof query.addListener === "function") {
    query.addListener(handler);
    return () => query.removeListener(handler);
  }
  return () => {};
}

export class ThemeController {
  constructor(wrapper) {
    this.wrapper = wrapper;
    this.mode = null;
    this.queries = [];
    this.cleanups = [];
  }

  resolve(theme) {
    if (theme && typeof theme === "object")
      return { name: "custom", values: { ...themes.dark, ...theme } };
    if (theme === "auto") {
      if (!this.queries.length) return { name: "dark", values: themes.dark };
      const contrast = this.queries[1]?.matches || this.queries[2]?.matches;
      if (contrast)
        return { name: "high-contrast", values: themes["high-contrast"] };
      const name = this.queries[0]?.matches ? "dark" : "light";
      return { name, values: themes[name] };
    }
    const name = Object.hasOwn(themes, theme) ? theme : "dark";
    return { name, values: themes[name] };
  }

  set(theme) {
    this.destroyListeners();
    this.mode = theme;
    if (theme === "auto") this.attachAutoListeners();
    this.apply(this.resolve(theme));
  }

  attachAutoListeners() {
    const view = this.wrapper.ownerDocument.defaultView;
    if (!view || typeof view.matchMedia !== "function") return;
    this.queries = [
      view.matchMedia("(prefers-color-scheme: dark)"),
      view.matchMedia("(forced-colors: active)"),
      view.matchMedia("(prefers-contrast: more)"),
    ];
    const update = () => this.apply(this.resolve("auto"));
    this.cleanups = this.queries.map((query) => listen(query, update));
  }

  apply({ name, values }) {
    if (!this.wrapper) return;
    this.wrapper.setAttribute("data-theme", name);
    this.wrapper.setAttribute("data-feather-theme", name);
    for (const key of THEME_KEYS) {
      const fallback = themes.dark[key];
      const value =
        typeof values[key] === "string" && values[key].trim()
          ? values[key]
          : fallback;
      this.wrapper.style.setProperty(`--feather-${key}`, value);
    }
  }

  copyTo(element) {
    if (!this.wrapper || !element) return;
    const themeName = this.wrapper.getAttribute("data-feather-theme") || "dark";
    element.setAttribute("data-theme", themeName);
    element.setAttribute("data-feather-theme", themeName);
    for (const key of THEME_KEYS) {
      element.style.setProperty(
        `--feather-${key}`,
        this.wrapper.style.getPropertyValue(`--feather-${key}`) ||
          themes.dark[key],
      );
    }
  }

  destroyListeners() {
    for (const cleanup of this.cleanups) cleanup();
    this.cleanups = [];
    this.queries = [];
  }

  destroy() {
    this.destroyListeners();
    this.wrapper = null;
  }
}
