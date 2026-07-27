import { iconMarkup } from "./icons.js";

const button = (iconName, tip, action) => ({
  icon: iconMarkup[iconName],
  tip,
  ...action,
});

export const buttons = {
  bold: button("bold", "Bold (Ctrl+B)", { cmd: "bold" }),
  italic: button("italic", "Italic (Ctrl+I)", { cmd: "italic" }),
  underline: button("underline", "Underline (Ctrl+U)", { cmd: "underline" }),
  strikethrough: button("strikethrough", "Strikethrough", {
    cmd: "strikethrough",
  }),
  link: button("link", "Insert Link (Ctrl+K)", { handler: "insertLink" }),
  unlink: button("unlink", "Remove Link", { cmd: "unlink" }),
  image: button("image", "Insert Image", { handler: "insertImage" }),
  video: button("video", "Insert Video", { handler: "insertVideo" }),
  table: button("table", "Insert Table", { handler: "insertTable" }),
  ul: button("ul", "Bullet List", { cmd: "insertUnorderedList" }),
  ol: button("ol", "Numbered List", { cmd: "insertOrderedList" }),
  indent: button("indent", "Increase Indent", { cmd: "indent" }),
  outdent: button("outdent", "Decrease Indent", { cmd: "outdent" }),
  alignleft: button("alignleft", "Align Left", { cmd: "justifyLeft" }),
  aligncenter: button("aligncenter", "Align Center", { cmd: "justifyCenter" }),
  alignright: button("alignright", "Align Right", { cmd: "justifyRight" }),
  alignjustify: button("alignjustify", "Justify", { cmd: "justifyFull" }),
  blockquote: button("blockquote", "Blockquote", {
    cmd: "formatBlock",
    value: "blockquote",
  }),
  code: button("code", "Code", { handler: "insertCode" }),
  hr: button("hr", "Horizontal Line", { cmd: "insertHorizontalRule" }),
  undo: button("undo", "Undo (Ctrl+Z)", { handler: "undo" }),
  redo: button("redo", "Redo (Ctrl+Y)", { handler: "redo" }),
  fullscreen: button("fullscreen", "Fullscreen", {
    handler: "toggleFullscreen",
  }),
  source: button("source", "View Source", { handler: "toggleSource" }),
  copy: button("copy", "Copy", { handler: "copyAction" }),
  paste: button("paste", "Paste", { handler: "pasteAction" }),
  clearformat: button("clearformat", "Clear Formatting", {
    handler: "clearFormatting",
  }),
};

export class CommandManager {
  constructor(editor, adapter) {
    this.editor = editor;
    this.adapter = adapter;
  }

  execute(command, value = null, options = {}) {
    if (this.editor.isMutationBlocked() && options.mutating !== false)
      return false;
    const result = this.adapter.execute(command, value);
    if (options.mutating !== false && options.record !== false) {
      this.editor.commitMutation(options.label || `command:${command}`, {
        nativeInput: options.nativeInput !== false,
      });
    }
    return result;
  }

  queryState(command) {
    return this.adapter.queryState(command);
  }

  run(name, definition = buttons[name]) {
    if (!definition) return false;
    if (definition.handler) return this.editor[definition.handler]();
    if (typeof definition.exec === "function") {
      if (this.editor.isMutationBlocked()) return false;
      const result = definition.exec(this.editor);
      this.editor.commitMutation(`command:${name}`, { nativeInput: true });
      return result;
    }
    if (definition.cmd)
      return this.execute(definition.cmd, definition.value ?? null, {
        label: `command:${name}`,
      });
    return false;
  }
}
