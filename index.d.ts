export type BuiltInThemeName =
  | "dark"
  | "light"
  | "ocean"
  | "forest"
  | "dark-b"
  | "aurora"
  | "dawn"
  | "rose"
  | "graphite"
  | "canyon"
  | "midnight"
  | "solarized"
  | "lavender"
  | "mint"
  | "ember"
  | "high-contrast"
  | "auto";

export interface ThemeTokens {
  bg?: string;
  panel?: string;
  border?: string;
  accent?: string;
  text?: string;
  muted?: string;
  hover?: string;
  shadow?: string;
}

export type Theme = BuiltInThemeName | ThemeTokens;
export type PasteMode = "auto" | "text" | "html";
export type PasteContent = { type: "text" | "html"; content: string };

export interface PastePayload {
  text: string;
  html: string;
  files: File[];
}

export interface ImageUploadResult {
  url: string;
  alt?: string;
}

export interface SafeUrlOptions {
  kind?: "link" | "image" | "video" | "external";
  allowRelative?: boolean;
  baseUrl?: string;
}

export interface SanitizeOptions {
  document?: Document;
}

export type AutosaveMode = "editor" | "source";
export type AutosaveState =
  | "disabled"
  | "idle"
  | "pending"
  | "saving"
  | "saved"
  | "available"
  | "restored"
  | "cleared"
  | "error";

export interface AutosaveDraft {
  version: 1;
  html: string;
  mode: AutosaveMode;
  updatedAt: number;
}

export interface AutosaveStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface AutosaveOptions {
  enabled?: boolean;
  key?: string;
  debounce?: number;
  /** @deprecated Use `debounce` instead. */
  interval?: number;
  storage?: AutosaveStorage;
  restore?: boolean;
}

export interface FindOptions {
  matchCase?: boolean;
  wholeWord?: boolean;
}

export interface FindResult {
  term: string;
  current: number;
  total: number;
}

export interface FeatherTextEventDetail {
  editor: FeatherText;
  [key: string]: unknown;
}

export type FeatherTextEventHandler = (detail: FeatherTextEventDetail) => void;

export interface FeatherTextPlugin {
  name?: string;
  init?(
    editor: FeatherText,
    options?: unknown,
  ): void | (() => void) | { destroy(editor: FeatherText): void };
  destroy?(editor: FeatherText): void;
}

export type FeatherTextPluginFactory = (
  editor: FeatherText,
  options?: unknown,
) => void | (() => void) | { destroy(editor: FeatherText): void };
export type FeatherTextPluginReference =
  string | FeatherTextPlugin | FeatherTextPluginFactory;
export type ConfiguredPlugin =
  FeatherTextPluginReference | [FeatherTextPluginReference, unknown];

export interface PasteFilter {
  (
    payload: PastePayload,
    event: ClipboardEvent,
    editor: FeatherText,
  ): PasteContent | string | false | null | undefined;
}

export interface FeatherTextConfig {
  theme?: Theme;
  toolbar?: string[];
  headings?: string[];
  sanitizePaste?: boolean;
  placeholder?: string;
  autosave?: boolean | number | AutosaveOptions;
  autosaveInterval?: number;
  wordCount?: boolean;
  charCount?: boolean;
  maxLength?: number | null;
  height?: number | string;
  minHeight?: number | string;
  maxHeight?: number | string | null;
  fonts?: string[];
  fontSizes?: string[];
  startInSource?: boolean;
  ariaLabel?: string;
  sourceAriaLabel?: string;
  historyLimit?: number;
  historyDebounceMs?: number;
  countDebounceMs?: number;
  pasteMode?: PasteMode;
  pasteFilter?: PasteFilter | null;
  sourceTabSize?: number;
  sourceRows?: number;
  sourceWrapLines?: boolean;
  sourceSmartTabs?: boolean;
  sourceAutoClose?: boolean;
  sourceIndentUnit?: string | null;
  sourceHighlightThreshold?: number;
  tooltipOffset?: number;
  logErrors?: boolean;
  fancy?: boolean;
  themeTransitions?: boolean;
  readOnly?: boolean;
  disabled?: boolean;
  attribution?: boolean;
  supportLink?: boolean;
  projectUrl?: string;
  supportUrl?: string;
  imageUpload?:
    | ((
        file: File,
        editor: FeatherText,
      ) => Promise<string | ImageUploadResult> | string | ImageUploadResult)
    | null;
  tableMaxRows?: number;
  tableMaxColumns?: number;
  plugins?: ConfiguredPlugin[];
  onReady?: ((editor: FeatherText) => void) | null;
  onChange?: ((html: string, editor: FeatherText) => void) | null;
  onFocus?: ((editor: FeatherText) => void) | null;
  onBlur?: ((editor: FeatherText) => void) | null;
  onPaste?:
    | ((
        event: ClipboardEvent,
        payload: PastePayload,
        editor: FeatherText,
      ) => void)
    | null;
  onKeydown?: ((event: KeyboardEvent, editor: FeatherText) => void) | null;
  [key: string]: unknown;
}

export interface ButtonDefinition {
  icon?: string;
  tip?: string;
  tooltip?: string;
  cmd?: string;
  value?: string | null;
  handler?: keyof FeatherText | string;
  exec?: (editor: FeatherText) => unknown;
}

export declare const themes: Readonly<
  Record<Exclude<BuiltInThemeName, "auto">, Readonly<Required<ThemeTokens>>>
>;
export declare const iconMarkup: Readonly<Record<string, string>>;
export declare const buttons: Record<string, ButtonDefinition>;
export declare const defaultConfig: Readonly<FeatherTextConfig>;
export declare const PROJECT_URL: "https://github.com/MiszterSoul/FeatherText";
export declare const SUPPORT_URL: "https://buymeacoffee.com/devpeter";
export declare const version: string;

export declare function normalizeSafeUrl(
  value: unknown,
  options?: SafeUrlOptions,
): string | null;
export declare function isSafeUrl(
  value: unknown,
  options?: SafeUrlOptions,
): boolean;
export declare function toSafeVideoEmbedUrl(value: unknown): string | null;

/**
 * Applies FeatherText's deliberately conservative baseline allowlist to untrusted HTML.
 * This is not a complete sanitizer or a substitute for an application-reviewed sanitizer and CSP.
 */
export declare function sanitizeUntrustedHTML(
  html: unknown,
  options?: SanitizeOptions,
): string;

export default class FeatherText {
  constructor(element: string | HTMLElement, config?: FeatherTextConfig);

  static readonly themes: typeof themes;
  static readonly buttons: typeof buttons;
  static readonly version: string;
  static sanitizeUntrustedHTML: typeof sanitizeUntrustedHTML;
  static normalizeSafeUrl: typeof normalizeSafeUrl;
  static isSafeUrl: typeof isSafeUrl;
  static init(selector: string, config?: FeatherTextConfig): FeatherText[];
  static registerPlugin(
    name: string,
    plugin: FeatherTextPlugin | FeatherTextPluginFactory,
  ): typeof FeatherText;
  static unregisterPlugin(name: string): typeof FeatherText;

  readonly element: HTMLElement;
  readonly wrapper: HTMLDivElement;
  readonly toolbar: HTMLDivElement;
  readonly editor: HTMLDivElement;
  readonly source: HTMLTextAreaElement;
  readonly sourceWrap: HTMLDivElement;
  readonly statusBar: HTMLDivElement | null;
  readonly history: string[];
  readonly historyIndex: number;
  readonly id: string;
  readonly autosaveKey: string;
  readonly autosaveState: AutosaveState;
  config: FeatherTextConfig;
  isSource: boolean;
  isFullscreen: boolean;
  sourceLanguage: string;

  getHTML(): string;
  getText(): string;
  getConfig(): FeatherTextConfig;
  setHTML(html: string): this;
  /** Sets HTML after the conservative built-in baseline policy; see sanitizeUntrustedHTML. */
  setUntrustedHTML(html: string): this;
  pasteIntoSource(sourceText: string): this | false;
  clear(): this;
  focus(): this;
  disable(): this;
  enable(): this;
  setDisabled(disabled: boolean): this;
  setReadOnly(readOnly: boolean): this;
  setTheme(theme: Theme): this;
  setToolbar(toolbar: string[]): this;
  setPlaceholder(placeholder: string): this;
  setHeight(height: number | string): this;
  setFancy(enabled: boolean): this;
  setAttribution(attribution: boolean, supportLink?: boolean): this;
  openFindReplace(): this;
  closeFindReplace(): this;
  find(term: string, options?: FindOptions): FindResult;
  findNext(term?: string, options?: FindOptions): FindResult;
  findPrevious(term?: string, options?: FindOptions): FindResult;
  replace(replacement?: string): boolean;
  replaceCurrent(replacement?: string): boolean;
  replaceAll(
    term?: string,
    replacement?: string,
    options?: FindOptions,
  ): number;
  startAutosave(options?: boolean | number | AutosaveOptions): this;
  stopAutosave(): this;
  clearSavedDraft(): this;
  setConfig(config: Partial<FeatherTextConfig>): this;
  destroy(): this;

  exec(name: string, definition?: ButtonDefinition): unknown;
  execCommand(command: string, value?: string | null): boolean;
  clearFormatting(): this | false;
  copyAction(): Promise<this>;
  pasteAction(): Promise<this | false>;
  undo(): this;
  redo(): this;
  pushHistory(label?: string): this;
  updateHistory(label?: string): this;
  flushHistory(): this;

  toggleFullscreen(): this;
  toggleSource(): this;
  setSourceMode(
    enabled: boolean,
    options?: { focus?: boolean; history?: boolean },
  ): this;
  toggleSourceSetting(
    setting: "sourceWrapLines" | "sourceSmartTabs" | "sourceAutoClose",
  ): this;

  insertLink(): Promise<unknown>;
  insertLink(url: string, text?: string): this | false;
  insertImage(): Promise<unknown>;
  insertImage(url: string, alt?: string): this | false;
  uploadImage(file: File, alt?: string): Promise<this | false>;
  insertVideo(): Promise<unknown>;
  insertVideo(url: string): this | false;
  insertTable(): Promise<unknown>;
  insertTable(rows: number | string, columns: number | string): this | false;
  insertCode(): this | false;
  addTableRow(position?: "before" | "after"): this | false;
  deleteTableRow(): this | false;
  addTableColumn(position?: "before" | "after"): this | false;
  deleteTableColumn(): this | false;
  deleteTable(): this | false;

  addButton(name: string, definition: ButtonDefinition): this;
  removeButton(name: string): this;
  showButton(name: string): this;
  hideButton(name: string): this;

  on(type: string, handler: FeatherTextEventHandler): this;
  off(type: string, handler?: FeatherTextEventHandler): this;
  emit(type: string, detail?: Record<string, unknown>): this;
  use(plugin: FeatherTextPluginReference, options?: unknown): this;
}
