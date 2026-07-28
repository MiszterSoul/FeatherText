export const PROJECT_URL = "https://github.com/MiszterSoul/FeatherText";
export const SUPPORT_URL = "https://buymeacoffee.com/devpeter";

export const themes = Object.freeze({
  dark: Object.freeze({
    bg: "#0f1115",
    panel: "#151922",
    border: "#222938",
    accent: "#6ea8fe",
    text: "#e6e9ef",
    muted: "#98a2b3",
    hover: "#1a2030",
    shadow: "0 6px 24px rgba(0, 0, 0, 0.25)",
  }),
  light: Object.freeze({
    bg: "#ffffff",
    panel: "#f8f9fa",
    border: "#dee2e6",
    accent: "#0d6efd",
    text: "#212529",
    muted: "#6c757d",
    hover: "#e9ecef",
    shadow: "0 6px 24px rgba(0, 0, 0, 0.08)",
  }),
  ocean: Object.freeze({
    bg: "#0a192f",
    panel: "#112240",
    border: "#233554",
    accent: "#64ffda",
    text: "#ccd6f6",
    muted: "#8892b0",
    hover: "#172a45",
    shadow: "0 6px 24px rgba(0, 0, 0, 0.3)",
  }),
  forest: Object.freeze({
    bg: "#0d1117",
    panel: "#161b22",
    border: "#30363d",
    accent: "#58a6ff",
    text: "#c9d1d9",
    muted: "#8b949e",
    hover: "#1f2428",
    shadow: "0 10px 40px rgba(0, 0, 0, 0.3)",
  }),
  "dark-b": Object.freeze({
    bg: "#0c0f14",
    panel: "#111624",
    border: "#1e2636",
    accent: "#8ab4ff",
    text: "#eff3ff",
    muted: "#a6b1c2",
    hover: "#182137",
    shadow: "0 10px 40px rgba(0, 0, 0, 0.35)",
  }),
  aurora: Object.freeze({
    bg: "#08131b",
    panel: "#102330",
    border: "#1f4350",
    accent: "#58f0d0",
    text: "#dcfbff",
    muted: "#8ec8cf",
    hover: "#173545",
    shadow: "0 12px 34px rgba(2, 10, 14, 0.38)",
  }),
  dawn: Object.freeze({
    bg: "#fff7ee",
    panel: "#fffdf8",
    border: "#eedbc6",
    accent: "#c76b32",
    text: "#412514",
    muted: "#8f6c58",
    hover: "#fbe7d4",
    shadow: "0 12px 32px rgba(141, 97, 67, 0.18)",
  }),
  rose: Object.freeze({
    bg: "#1d1118",
    panel: "#271620",
    border: "#4c2d3f",
    accent: "#ff79b3",
    text: "#fde8f4",
    muted: "#ca9db5",
    hover: "#341d2a",
    shadow: "0 12px 34px rgba(27, 11, 20, 0.42)",
  }),
  graphite: Object.freeze({
    bg: "#13161b",
    panel: "#1b2027",
    border: "#303844",
    accent: "#d4ff5a",
    text: "#f6f8fb",
    muted: "#9fa8b8",
    hover: "#242b34",
    shadow: "0 12px 32px rgba(6, 7, 10, 0.36)",
  }),
  canyon: Object.freeze({
    bg: "#20140f",
    panel: "#2b1d16",
    border: "#5b3a2b",
    accent: "#ffb067",
    text: "#fff1e6",
    muted: "#d5ab90",
    hover: "#38261e",
    shadow: "0 14px 36px rgba(20, 9, 5, 0.42)",
  }),
  midnight: Object.freeze({
    bg: "#0b1020",
    panel: "#131a2e",
    border: "#2b3760",
    accent: "#9d8cff",
    text: "#f1efff",
    muted: "#a9b1cf",
    hover: "#1c2642",
    shadow: "0 14px 38px rgba(4, 7, 18, 0.46)",
  }),
  solarized: Object.freeze({
    bg: "#002b36",
    panel: "#073642",
    border: "#586e75",
    accent: "#d6a900",
    text: "#eee8d5",
    muted: "#a7b7b7",
    hover: "#0d4653",
    shadow: "0 14px 36px rgba(0, 23, 29, 0.42)",
  }),
  lavender: Object.freeze({
    bg: "#f6f2ff",
    panel: "#ffffff",
    border: "#d9ccef",
    accent: "#6941c6",
    text: "#2d2440",
    muted: "#6f6282",
    hover: "#eee7fb",
    shadow: "0 12px 30px rgba(85, 61, 128, 0.16)",
  }),
  mint: Object.freeze({
    bg: "#effaf5",
    panel: "#ffffff",
    border: "#b8decf",
    accent: "#087a55",
    text: "#153d30",
    muted: "#56766b",
    hover: "#dcf3e9",
    shadow: "0 12px 30px rgba(29, 103, 77, 0.16)",
  }),
  ember: Object.freeze({
    bg: "#21120e",
    panel: "#2d1812",
    border: "#5e3327",
    accent: "#ff9a62",
    text: "#fff0e8",
    muted: "#d3a18f",
    hover: "#3b2119",
    shadow: "0 14px 38px rgba(22, 8, 4, 0.46)",
  }),
  "high-contrast": Object.freeze({
    bg: "#000000",
    panel: "#000000",
    border: "#ffffff",
    accent: "#00ffff",
    text: "#ffffff",
    muted: "#e6e6e6",
    hover: "#262626",
    shadow: "0 0 0 2px currentColor",
  }),
});

const defaultToolbar = [
  "format",
  "fontname",
  "fontsize",
  "|",
  "bold",
  "italic",
  "underline",
  "strikethrough",
  "|",
  "link",
  "unlink",
  "image",
  "video",
  "table",
  "|",
  "ul",
  "ol",
  "indent",
  "outdent",
  "|",
  "alignleft",
  "aligncenter",
  "alignright",
  "alignjustify",
  "|",
  "blockquote",
  "code",
  "clearformat",
  "hr",
  "|",
  "forecolor",
  "backcolor",
  "|",
  "undo",
  "redo",
  "|",
  "fullscreen",
  "source",
  "copy",
  "paste",
];

export const defaultConfig = Object.freeze({
  theme: "dark",
  toolbar: Object.freeze(defaultToolbar),
  headings: Object.freeze(["P", "H1", "H2", "H3", "H4", "H5", "H6"]),
  sanitizePaste: true,
  placeholder: "Start typing...",
  autosave: false,
  autosaveInterval: 30000,
  wordCount: true,
  charCount: true,
  maxLength: null,
  height: "auto",
  minHeight: 220,
  maxHeight: 600,
  fonts: Object.freeze([
    "Arial",
    "Georgia",
    "Impact",
    "Tahoma",
    "Times New Roman",
    "Verdana",
    "Courier New",
    "Comic Sans MS",
  ]),
  fontSizes: Object.freeze([
    "10px",
    "12px",
    "14px",
    "16px",
    "18px",
    "20px",
    "24px",
    "28px",
    "32px",
    "36px",
  ]),
  onReady: null,
  onChange: null,
  onFocus: null,
  onBlur: null,
  onPaste: null,
  onKeydown: null,
  startInSource: false,
  ariaLabel: "Rich text editor",
  sourceAriaLabel: "HTML source editor",
  historyLimit: 50,
  historyDebounceMs: 400,
  countDebounceMs: 200,
  pasteMode: "auto",
  pasteFilter: null,
  sourceTabSize: 4,
  sourceRows: 10,
  sourceWrapLines: false,
  sourceSmartTabs: true,
  sourceAutoClose: true,
  sourceIndentUnit: null,
  sourceHighlightThreshold: 100000,
  tooltipOffset: 14,
  logErrors: true,
  fancy: false,
  themeTransitions: false,
  readOnly: false,
  disabled: false,
  attribution: true,
  supportLink: true,
  projectUrl: PROJECT_URL,
  supportUrl: SUPPORT_URL,
  imageUpload: null,
  tableMaxRows: 20,
  tableMaxColumns: 20,
  plugins: Object.freeze([]),
});

const ARRAY_KEYS = new Set([
  "toolbar",
  "headings",
  "fonts",
  "fontSizes",
  "plugins",
]);

function cloneConfigValue(key, value) {
  if (ARRAY_KEYS.has(key)) return Array.isArray(value) ? [...value] : [];
  if (
    (key === "theme" || key === "autosave") &&
    value &&
    typeof value === "object"
  )
    return { ...value };
  return value;
}

export function createConfig(overrides = {}, base = defaultConfig) {
  const result = {};
  for (const [key, value] of Object.entries(base))
    result[key] = cloneConfigValue(key, value);
  if (overrides && typeof overrides === "object") {
    for (const [key, value] of Object.entries(overrides))
      result[key] = cloneConfigValue(key, value);
  }
  result.wordCount = true;
  result.charCount = true;
  result.attribution = true;
  result.supportLink = true;
  result.projectUrl = PROJECT_URL;
  result.supportUrl = SUPPORT_URL;
  return result;
}

export function copyConfig(config) {
  return createConfig(config, {});
}
