/*
 * FeatherText - Professional Rich Text Editor
 * Version: 2.0.0
 * License: MIT
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.FeatherText = factory();
  }
}(typeof globalThis !== 'undefined' ? globalThis : (typeof self !== 'undefined' ? self : this), function () {
  'use strict';

  // -------- Themes --------
  const themes = {
    dark: { bg: '#0f1115', panel: '#151922', border: '#222938', accent: '#6ea8fe', text: '#e6e9ef', muted: '#98a2b3', hover: '#1a2030' },
    light: { bg: '#ffffff', panel: '#f8f9fa', border: '#dee2e6', accent: '#0d6efd', text: '#212529', muted: '#6c757d', hover: '#e9ecef' },
    ocean: { bg: '#0a192f', panel: '#112240', border: '#233554', accent: '#64ffda', text: '#ccd6f6', muted: '#8892b0', hover: '#172a45' },
    forest: { bg: '#0d1117', panel: '#161b22', border: '#30363d', accent: '#58a6ff', text: '#c9d1d9', muted: '#8b949e', hover: '#1f2428' },
    'dark-b': { bg: '#0c0f14', panel: '#111624', border: '#1e2636', accent: '#8ab4ff', text: '#eff3ff', muted: '#a6b1c2', hover: '#182137' }
  };

  // -------- Buttons --------
  const buttons = {
    bold: { icon: '<svg viewBox="0 0 24 24"><path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/></svg>', tip: 'Bold (Ctrl+B)', cmd: 'bold' },
    italic: { icon: '<svg viewBox="0 0 24 24"><path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z"/></svg>', tip: 'Italic (Ctrl+I)', cmd: 'italic' },
    underline: { icon: '<svg viewBox="0 0 24 24"><path d="M12 17c3.31 0 6-2.69 6-6V3h-2.5v8c0 1.93-1.57 3.5-3.5 3.5S8.5 12.93 8.5 11V3H6v8c0 3.31 2.69 6 6 6zm-7 2v2h14v-2H5z"/></svg>', tip: 'Underline (Ctrl+U)', cmd: 'underline' },
    strikethrough: { icon: '<svg viewBox="0 0 24 24"><path d="M10 19h4v-3h-4v3zM5 4v3h5v3h4V7h5V4H5zM3 14h18v-2H3v2z"/></svg>', tip: 'Strikethrough', cmd: 'strikethrough' },
    link: { icon: '<svg viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>', tip: 'Insert Link (Ctrl+K)', handler: 'insertLink' },
    unlink: { icon: '<svg viewBox="0 0 24 24"><path d="M17 7h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1 0 1.43-.98 2.63-2.31 2.98l1.46 1.46C20.88 15.61 22 13.95 22 12c0-2.76-2.24-5-5-5zm-1 4h-2.19l2 2H16zM2 4.27l3.11 3.11C3.29 8.12 2 9.91 2 12c0 2.76 2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1 0-1.59 1.21-2.9 2.76-3.07L8.73 11H8v2h2.73L13 15.27V17h1.73l4.01 4L20 19.74 3.27 3 2 4.27z"/></svg>', tip: 'Remove Link', cmd: 'unlink' },
    image: { icon: '<svg viewBox="0 0 24 24"><path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/></svg>', tip: 'Insert Image', handler: 'insertImage' },
    video: { icon: '<svg viewBox="0 0 24 24"><path d="M17 10.5V7c0-.55-.45-1-1-1H4c-.55 0-1 .45-1 1v10c0 .55.45 1 1 1h12c.55 0 1-.45 1-1v-3.5l4 4v-11l-4 4z"/></svg>', tip: 'Insert Video', handler: 'insertVideo' },
    table: { icon: '<svg viewBox="0 0 24 24"><path d="M3 3v18h18V3H3zm8 16H5v-6h6v6zm0-8H5V5h6v6zm8 8h-6v-6h6v6zm0-8h-6V5h6v6z"/></svg>', tip: 'Insert Table', handler: 'insertTable' },
    ul: { icon: '<svg viewBox="0 0 24 24"><path d="M4 10.5c-.83 0-1.5.67-1.5 1.5s.67 1.5 1.5 1.5 1.5-.67 1.5-1.5-.67-1.5-1.5-1.5zm0-6c-.83 0-1.5.67-1.5 1.5S3.17 7.5 4 7.5 5.5 6.83 5.5 6 4.83 4.5 4 4.5zm0 12c-.83 0-1.5.68-1.5 1.5s.68 1.5 1.5 1.5 1.5-.68 1.5-1.5-.67-1.5-1.5-1.5zM7 19h14v-2H7v2zm0-6h14v-2H7v2zm0-8v2h14V5H7z"/></svg>', tip: 'Bullet List', cmd: 'insertUnorderedList' },
    ol: { icon: '<svg viewBox="0 0 24 24"><path d="M2 17h2v.5H3v1h1v.5H2v1h3v-4H2v1zm1-9h1V4H2v1h1v3zm-1 3h1.8L2 13.1v.9h3v-1H3.2L5 10.9V10H2v1zm5-6v2h14V5H7zm0 14h14v-2H7v2zm0-6h14v-2H7v2z"/></svg>', tip: 'Numbered List', cmd: 'insertOrderedList' },
    indent: { icon: '<svg viewBox="0 0 24 24"><path d="M3 21h18v-2H3v2zM3 8v8l4-4-4-4zm8 9h10v-2H11v2zM3 3v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2z"/></svg>', tip: 'Increase Indent', cmd: 'indent' },
    outdent: { icon: '<svg viewBox="0 0 24 24"><path d="M11 17h10v-2H11v2zm-8-5l4 4V8l-4 4zm0 9h18v-2H3v2zM3 3v2h18V3H3zm8 6h10V7H11v2zm0 4h10v-2H11v2z"/></svg>', tip: 'Decrease Indent', cmd: 'outdent' },
    alignleft: { icon: '<svg viewBox="0 0 24 24"><path d="M15 15H3v2h12v-2zm0-8H3v2h12V7zM3 13h18v-2H3v2zm0 8h18v-2H3v2zM3 3v2h18V3H3z"/></svg>', tip: 'Align Left', cmd: 'justifyLeft' },
    aligncenter: { icon: '<svg viewBox="0 0 24 24"><path d="M7 15v2h10v-2H7zm-4 6h18v-2H3v2zm0-8h18v-2H3v2zm4-6v2h10V7H7zM3 3v2h18V3H3z"/></svg>', tip: 'Align Center', cmd: 'justifyCenter' },
    alignright: { icon: '<svg viewBox="0 0 24 24"><path d="M3 21h18v-2H3v2zm6-4h12v-2H9v2zm-6-4h18v-2H3v2zm6-4h12V7H9v2zM3 3v2h18V3H3z"/></svg>', tip: 'Align Right', cmd: 'justifyRight' },
    alignjustify: { icon: '<svg viewBox="0 0 24 24"><path d="M3 21h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18v-2H3v2zm0-4h18V7H3v2zm0-6v2h18V3H3z"/></svg>', tip: 'Justify', cmd: 'justifyFull' },
    blockquote: { icon: '<svg viewBox="0 0 24 24"><path d="M6 17h3l2-4V7H5v6h3zm8 0h3l2-4V7h-6v6h3z"/></svg>', tip: 'Blockquote', exec: (ft)=>document.execCommand('formatBlock', false, 'blockquote') },
    code: { icon: '<svg viewBox="0 0 24 24"><path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/></svg>', tip: 'Code', handler: 'insertCode' },
    hr: { icon: '<svg viewBox="0 0 24 24"><path d="M3 11h18v2H3z"/></svg>', tip: 'Horizontal Line', cmd: 'insertHorizontalRule' },
    undo: { icon: '<svg viewBox="0 0 24 24"><path d="M12.5 8c-2.65 0-5.05.99-6.9 2.6L2 7v9h9l-3.62-3.62c1.39-1.16 3.16-1.88 5.12-1.88 3.54 0 6.55 2.31 7.6 5.5l2.37-.78C21.08 11.03 17.15 8 12.5 8z"/></svg>', tip: 'Undo (Ctrl+Z)', handler: 'undo' },
    redo: { icon: '<svg viewBox="0 0 24 24"><path d="M18.4 10.6C16.55 8.99 14.15 8 11.5 8c-4.65 0-8.58 3.03-9.96 7.22L3.9 16c1.05-3.19 4.05-5.5 7.6-5.5 1.95 0 3.73.72 5.12 1.88L13 16h9V7l-3.6 3.6z"/></svg>', tip: 'Redo (Ctrl+Y)', handler: 'redo' },
    fullscreen: { icon: '<svg viewBox="0 0 24 24"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>', tip: 'Fullscreen', handler: 'toggleFullscreen' },
      source: { icon: '<svg viewBox="0 0 24 24"><path d="M8.1 16.6L2.5 12l5.6-4.6L7 6 0 12l7 6 1.1-1.4zm7.8 0L21.5 12 15.9 7.4 17 6l7 6-7 6-1.1-1.4zM13.5 5l-3 14h2l3-14h-2z"/></svg>', tip: 'View Source', handler: 'toggleSource' },
      copy: { icon: '<svg viewBox="0 0 24 24"><path d="M16 1H4c-1.1 0-2 .9-2 2v12h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/></svg>', tip: 'Copy', handler: 'copyAction' },
      paste: { icon: '<svg viewBox="0 0 24 24"><path d="M19 2h-4.2c-.4-1.2-1.5-2-2.8-2s-2.4.8-2.8 2H5c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-7 0c.6 0 1 .4 1 1s-.4 1-1 1-1-.4-1-1 .4-1 1-1zm7 20H5V4h2v3h10V4h2v18zM8 11h8v2H8v-2z"/></svg>', tip: 'Paste', handler: 'pasteAction' },
      clearformat: { icon: '<svg viewBox="0 0 24 24"><path d="M3 6v2h8l-6 12h2l6-12h8V6H3z"/></svg>', tip: 'Clear Formatting', handler: 'clearFormatting' }
  };

  const defaultConfig = {
    theme: 'dark',
    toolbar: [
      'format','fontname','fontsize','|',
      'bold','italic','underline','strikethrough','|',
      'link','unlink','image','video','table','|',
      'ul','ol','indent','outdent','|',
      'alignleft','aligncenter','alignright','alignjustify','|',
        'blockquote','code','clearformat','hr','|',
      'forecolor','backcolor','|',
      'undo','redo','|',
        'fullscreen','source','copy','paste'
    ],
    headings: ['P','H1','H2','H3','H4','H5','H6'],
    sanitizePaste: true,
    placeholder: 'Start typing...',
    autosave: false,
    autosaveInterval: 30000,
    wordCount: true,
    charCount: true,
    maxLength: null,
    height: 'auto',
    minHeight: 220,
    maxHeight: 600,
    fonts: ['Arial','Georgia','Impact','Tahoma','Times New Roman','Verdana','Courier New','Comic Sans MS'],
    fontSizes: ['10px','12px','14px','16px','18px','20px','24px','28px','32px','36px'],
    onReady: null,
    onChange: null,
    onFocus: null,
    onBlur: null,
    onPaste: null,
    onKeydown: null,
    startInSource: false
  };

  class FeatherText {
    constructor(element, config) {
      this.element = typeof element === 'string' ? document.querySelector(element) : element;
      if (!this.element) throw new Error('FeatherText: Element not found');

      this.config = Object.assign({}, defaultConfig, config || {});
  this.id = 'feather_' + Math.random().toString(36).slice(2, 10);
      this.isFullscreen = false;
      this.isSource = false;
      this.history = [];
      this.historyIndex = -1;
      this.autosaveTimer = null;
      this._savedRange = null;
      this.sourceLanguage = 'html';

      this.applyTheme(this.config.theme);
      this.buildEditor();
      this.setupEvents();

      if (this.config.autosave) this.startAutosave();
      if (this.element.value) this.setHTML(this.element.value);
      if (this.config.startInSource) this.toggleSource();
      if (this.config.onReady) this.config.onReady(this);
    }

    // ----- Theme -----
    applyTheme(themeName) {
      const theme = typeof themeName === 'object' ? themeName : (themes[themeName] || themes.dark);
      const root = document.documentElement;
      if (typeof themeName === 'string' && themes[themeName]) root.setAttribute('data-theme', themeName);
      else root.removeAttribute('data-theme');
  Object.entries(theme).forEach(([k,v]) => root.style.setProperty(`--mrte-${k}`, v));
    }

    // ----- DOM -----
    buildEditor() {
  this.wrapper = document.createElement('div');
  this.wrapper.className = 'feather';
      this.wrapper.id = this.id;

      this.toolbar = this.buildToolbar();
      this.wrapper.appendChild(this.toolbar);

  this.editor = document.createElement('div');
  this.editor.className = 'feather-editor';
      this.editor.contentEditable = true;
      this.editor.setAttribute('placeholder', this.config.placeholder);
      if (this.config.height !== 'auto') this.editor.style.height = this.config.height + 'px';
      if (this.config.minHeight) this.editor.style.minHeight = this.config.minHeight + 'px';
      if (this.config.maxHeight) { this.editor.style.maxHeight = this.config.maxHeight + 'px'; this.editor.style.overflowY = 'auto'; }
      this.wrapper.appendChild(this.editor);

  // Source pane (gutter + code overlay + textarea)
  this.sourceWrap = document.createElement('div');
  this.sourceWrap.className = 'feather-source-wrap feather-hidden';
      // Add a header toolbar for source mode (sticky and visible while textarea scrolls)
      this.sourceHeader = this.buildSourceToolbar();
      this.sourceWrap.appendChild(this.sourceHeader);
  const pane = document.createElement('div');
  pane.className = 'feather-source-pane';
      const gutter = document.createElement('div');
  gutter.className = 'feather-gutter';
  // Syntax-highlight overlay (non-interactive)
  this.codeOverlay = document.createElement('pre');
  this.codeOverlay.className = 'feather-code';
  // Editable source textarea
  this.source = document.createElement('textarea');
  this.source.className = 'feather-source';
      this.source.setAttribute('wrap', 'off');
  pane.appendChild(gutter);
  pane.appendChild(this.codeOverlay);
  pane.appendChild(this.source);
      this.sourceWrap.appendChild(pane);
      this.wrapper.appendChild(this.sourceWrap);

      if (this.config.wordCount || this.config.charCount) {
  this.statusBar = this.buildStatus();
        this.wrapper.appendChild(this.statusBar);
      }

      this.element.style.display = 'none';
      this.element.parentNode.insertBefore(this.wrapper, this.element);
    }

    buildToolbar() {
  const bar = document.createElement('div');
  bar.className = 'feather-toolbar';

      let group = null;
      let awaiting = { fore: false, back: false };
  const ensure = () => { if (!group) { group = document.createElement('div'); group.className = 'feather-group'; bar.appendChild(group); } };
      const flush = () => {
        if (!awaiting.fore && !awaiting.back) return;
        ensure();
        if (awaiting.fore) group.appendChild(this.createColorPicker('fore'));
        if (awaiting.back) group.appendChild(this.createColorPicker('back'));
        awaiting = { fore: false, back: false };
      };

      this.config.toolbar.forEach(item => {
        if (item === '|') { flush(); group = null; return; }
  if (item === 'format') { flush(); ensure(); group.appendChild(this.createHeadingDropdown()); return; }
  if (item === 'fontname') { flush(); ensure(); group.appendChild(this.createFontDropdown()); return; }
  if (item === 'fontsize') { flush(); ensure(); group.appendChild(this.createFontSizeDropdown()); return; }
        if (item === 'forecolor') { awaiting.fore = true; return; }
        if (item === 'backcolor') { awaiting.back = true; return; }
        const def = buttons[item];
        if (def) {
          flush(); ensure();
          const btn = this.createToolbarButton(item);
          if (btn) group.appendChild(btn);
            // Source-specific controls are now shown inside the source pane header, not the main toolbar.
        }
      });
      flush();
      return bar;
    }

      buildSourceToolbar() {
  const bar = document.createElement('div');
  bar.className = 'feather-source-toolbar';
        bar.id = `${this.id}_srcbar`;

    // Language selector (source-only)
  const selWrap = document.createElement('div');
  selWrap.className = 'feather-select';
    const sel = document.createElement('select');
    sel.id = `${this.id}_lang`;
    sel.title = 'Syntax mode';
    ['html','css','javascript','xml','json'].forEach(t => { const o = document.createElement('option'); o.value = t; o.textContent = t.toUpperCase(); sel.appendChild(o); });
    sel.value = this.sourceLanguage;
    selWrap.appendChild(sel);
    bar.appendChild(selWrap);

        return bar;
      }

    createToolbarButton(name) {
      const def = buttons[name];
      if (!def) return null;
  const b = document.createElement('button');
  b.className = 'feather-btn';
      b.innerHTML = def.icon;
      b.title = def.tip;
      b.dataset.command = name;
      b.addEventListener('mousedown', e => e.preventDefault());
      b.addEventListener('click', e => { e.preventDefault(); this.exec(name, def); });
      return b;
    }

  createHeadingDropdown() {
              const wrapper = document.createElement('div');
              wrapper.className = 'feather-select';

              const select = document.createElement('select');
              select.title = 'Paragraph Format';

              this.config.headings.forEach(heading => {
                const option = document.createElement('option');
                option.value = heading.toLowerCase();
                option.textContent = heading === 'P' ? 'Paragraph' : `Heading ${heading.substring(1)}`;
                select.appendChild(option);
              });

              select.addEventListener('change', () => {
                const value = select.value === 'p' ? 'div' : select.value;
                document.execCommand('formatBlock', false, value);
                this.updateHistory();
              });

              wrapper.appendChild(select);
              return wrapper;
  }

  createFontDropdown() {
              const wrapper = document.createElement('div');
              wrapper.className = 'feather-select feather-fontname';

              const select = document.createElement('select');
              select.title = 'Font Family';

              this.config.fonts.forEach(font => {
                const option = document.createElement('option');
                option.value = font;
                option.textContent = font;
                option.style.fontFamily = font;
                select.appendChild(option);
              });

              select.addEventListener('change', () => {
                document.execCommand('fontName', false, select.value);
                this.updateHistory();
              });

              wrapper.appendChild(select);
              return wrapper;
  }

  createFontSizeDropdown() {
              const wrapper = document.createElement('div');
              wrapper.className = 'feather-select feather-fontsize';

              const select = document.createElement('select');
              select.title = 'Font Size';

              this.config.fontSizes.forEach(size => {
                const option = document.createElement('option');
                option.value = size;
                option.textContent = size;
                select.appendChild(option);
              });

              select.addEventListener('change', () => {
                const selection = window.getSelection();
                if (selection.rangeCount > 0) {
                  const range = selection.getRangeAt(0);
                  const span = document.createElement('span');
                  span.style.fontSize = select.value;
                  range.surroundContents(span);
                  this.updateHistory();
                }
              });

              wrapper.appendChild(select);
              return wrapper;
  }

  createColorPicker(kind) {
              const label = document.createElement('label');
              label.className = 'feather-color';
              label.title = kind === 'fore' ? 'Text Color' : 'Background Color';
              // Save selection if user presses the label area
              label.addEventListener('pointerdown', () => this.saveSelection());
              label.addEventListener('mousedown', () => this.saveSelection());

              const input = document.createElement('input');
              input.type = 'color';
              input.value = kind === 'fore' ? '#000000' : '#ffff00';
              // Visual swatch
              const swatch = document.createElement('span');
              swatch.className = 'feather-swatch';
              const swatchInner = document.createElement('span');
              swatchInner.className = 'feather-swatch-i';
              swatch.appendChild(swatchInner);
              const applySwatch = () => {
                try { swatchInner.style.background = input.value; } catch {}
              };
              applySwatch();
              // Save selection before the color input steals focus
              input.addEventListener('pointerdown', () => this.saveSelection());
              input.addEventListener('mousedown', () => this.saveSelection());
              input.addEventListener('change', () => {
                // Restore selection and apply color
                this.restoreSelection();
                if (kind === 'fore') {
                  document.execCommand('foreColor', false, input.value);
                } else {
                  try {
                    if (document.queryCommandSupported && document.queryCommandSupported('hiliteColor')) {
                      document.execCommand('hiliteColor', false, input.value);
                    } else {
                      document.execCommand('backColor', false, input.value);
                    }
                  } catch (e) {
                    document.execCommand('backColor', false, input.value);
                  }
                }
                this.updateHistory();
                this.editor.focus();
                applySwatch();
              });
              label.appendChild(input);
              label.appendChild(swatch);
              // Clear color button
              const clearBtn = document.createElement('button');
              clearBtn.type = 'button';
              clearBtn.className = 'feather-clear-color';
              clearBtn.title = 'Clear color';
              clearBtn.innerHTML = '<svg viewBox="0 0 24 24"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>';
              clearBtn.addEventListener('click', (e) => { e.preventDefault(); this.restoreSelection(); this.clearColor(kind); this.updateHistory(); this.editor.focus(); });
              label.appendChild(clearBtn);
      return label;
    }

  buildStatus() {
              const statusBar = document.createElement('div');
              statusBar.className = 'feather-status';

              const left = document.createElement('div');

              if (this.config.wordCount) {
                const wordCount = document.createElement('span');
                wordCount.className = 'feather-badge';
                wordCount.innerHTML = '<span class="feather-word-count">0</span> words';
                left.appendChild(wordCount);
              }

              if (this.config.charCount) {
                const charCount = document.createElement('span');
                charCount.className = 'feather-badge';
                charCount.innerHTML = '<span class="feather-char-count">0</span> chars';
                left.appendChild(charCount);
              }

              statusBar.appendChild(left);

              const right = document.createElement('div');
              right.innerHTML = '<span>Powered by FeatherText</span>';
              statusBar.appendChild(right);

      return statusBar;
    }

    exec(name, def) {
      if (def) {
        if (def.handler) { this[def.handler](); }
        else if (def.exec) { def.exec(this); }
        else if (def.cmd) { document.execCommand(def.cmd, false, def.value || null); this.pushHistory(); }
      }
      this.editor.focus();
    }

  insertLink() {
              const sel = window.getSelection();
              const getSelectedAnchor = () => {
                if (!sel || sel.rangeCount === 0) return null;
                let node = sel.anchorNode || sel.focusNode;
                if (!node) return null;
                if (node.nodeType === Node.TEXT_NODE) node = node.parentElement;
                return node ? node.closest('a') : null;
              };
              const isLikelyURL = (text) => {
                if (!text) return false;
                const t = text.trim();
                if (/^https?:\/\//i.test(t)) return true;
                return /^[\w.-]+\.[a-z]{2,}(\/\S*)?$/i.test(t);
              };

              const currentAnchor = getSelectedAnchor();
              if (currentAnchor) {
                const current = currentAnchor.getAttribute('href') || '';
                const edited = prompt('Edit link URL (leave empty to remove):', current);
                if (edited === null) return;
                if (edited.trim() === '') {
                  document.execCommand('unlink');
                } else {
                  currentAnchor.setAttribute('href', edited.trim());
                }
                this.updateHistory();
                return;
              }

              const selectedText = sel && sel.toString ? sel.toString().trim() : '';
              const prefill = isLikelyURL(selectedText)
                ? (selectedText.startsWith('http') ? selectedText : 'https://' + selectedText)
                : 'https://';
              const url = prompt('Enter URL:', prefill);
              if (!url) return;

              if (selectedText.length === 0) {
                document.execCommand('insertHTML', false, `<a href="${url}" target="_blank" rel="noopener">${url}</a>`);
              } else {
                document.execCommand('createLink', false, url);
              }
              this.updateHistory();
  }

  insertImage() {
              const url = prompt('Enter image URL:', 'https://');
              if (url) {
                document.execCommand('insertImage', false, url);
                this.updateHistory();
              }
  }

  insertVideo() {
              const url = prompt('Enter video URL (YouTube/Vimeo):', '');
              if (url) {
                let embedUrl = url;
                if (url.includes('youtube.com/watch?v=')) {
                  const videoId = url.split('v=')[1].split('&')[0];
                  embedUrl = `https://www.youtube.com/embed/${videoId}`;
                } else if (url.includes('vimeo.com/')) {
                  const videoId = url.split('/').pop();
                  embedUrl = `https://player.vimeo.com/video/${videoId}`;
                }

                const iframe = `<iframe src="${embedUrl}" width="560" height="315" frameborder="0" allowfullscreen></iframe>`;
                document.execCommand('insertHTML', false, iframe);
                this.updateHistory();
              }
  }

  insertTable() {
              const rows = prompt('Number of rows:', '3');
              const cols = prompt('Number of columns:', '3');

              if (rows && cols) {
                let table = '<table border="1" style="border-collapse: collapse; width: 100%;">';
                for (let i = 0; i < parseInt(rows); i++) {
                  table += '<tr>';
                  for (let j = 0; j < parseInt(cols); j++) {
                    table += '<td style="padding: 8px; border: 1px solid #ddd;">&nbsp;</td>';
                  }
                  table += '</tr>';
                }
                table += '</table>';

                document.execCommand('insertHTML', false, table);
                this.updateHistory();
              }
  }

  insertCode() {
              const selection = window.getSelection();
              if (selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const code = document.createElement('code');
                code.textContent = selection.toString() || 'code';
                range.deleteContents();
                range.insertNode(code);
                this.updateHistory();
              }
  }

  toggleFullscreen() {
              this.isFullscreen = !this.isFullscreen;
              this.wrapper.classList.toggle('feather-fullscreen', this.isFullscreen);
  }

    toggleSource() {
      this.isSource = !this.isSource;
      if (this.isSource) {
        this.source.value = this.editor.innerHTML;
  this.editor.classList.add('feather-hidden');
  this.sourceWrap.classList.remove('feather-hidden');
        this.source.style.minHeight = this.editor.offsetHeight + 'px';
        this.renderGutter();
        this.highlightSource();
        this.source.focus();
      } else {
        this.editor.innerHTML = this.source.value;
  this.sourceWrap.classList.add('feather-hidden');
  this.editor.classList.remove('feather-hidden');
        this.editor.focus();
        this.pushHistory();
      }
      this.updateSourceControlsState();
    }

  setupEvents() {
              // Editor events
              this.editor.addEventListener('input', () => {
                this.updateCounts();
                this.element.value = this.getHTML();
                if (this.config.onChange) {
                  this.config.onChange(this.getHTML(), this);
                }
              });

              this.editor.addEventListener('focus', () => {
                if (this.config.onFocus) this.config.onFocus(this);
              });

              this.editor.addEventListener('blur', () => {
                if (this.config.onBlur) this.config.onBlur(this);
              });

              this.editor.addEventListener('paste', (e) => {
                if (this.config.sanitizePaste) {
                  e.preventDefault();
                  const text = (e.clipboardData || window.clipboardData).getData('text/plain');
                  document.execCommand('insertText', false, text);
                }
                if (this.config.onPaste) this.config.onPaste(e, this);
              });

              this.editor.addEventListener('keydown', (e) => {
                if (e.ctrlKey || e.metaKey) {
                  switch (e.key) {
                    case 'b':
                      e.preventDefault();
                      document.execCommand('bold');
                      break;
                    case 'i':
                      e.preventDefault();
                      document.execCommand('italic');
                      break;
                    case 'u':
                      e.preventDefault();
                      document.execCommand('underline');
                      break;
                    case 'k':
                      e.preventDefault();
                      this.insertLink();
                      break;
                    case 'z':
                      e.preventDefault();
                      this.undo();
                      break;
                    case 'y':
                      e.preventDefault();
                      this.redo();
                      break;
                  }
                }
                if (this.config.onKeydown) this.config.onKeydown(e, this);
              });

      // source events
      this.source.addEventListener('input', () => {
        this.element.value = this.source.value;
        this.renderGutter();
        this.highlightSource();
        if (this.config.onChange) this.config.onChange(this.source.value, this);
      });
      this.source.addEventListener('scroll', () => this.syncSourceScroll());
      this.source.addEventListener('keydown', (e) => { if (e.ctrlKey && (e.key === 'm' || e.key === 'M')) { e.preventDefault(); this.selectBracketPair(); } });

  // source header language selector
  const lang = document.getElementById(`${this.id}_lang`);
  if (lang) lang.addEventListener('change', () => { this.sourceLanguage = lang.value; this.highlightSource(); });

      this.updateSourceControlsState();
    }

  // ----- Status/hist -----
  updateCounts() {
              if (!this.statusBar) return;

              const text = this.editor.innerText || '';

              if (this.config.wordCount) {
                const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
                const wordElement = this.statusBar.querySelector('.feather-word-count');
                if (wordElement) wordElement.textContent = words;
              }

              if (this.config.charCount) {
                const chars = text.length;
                const charElement = this.statusBar.querySelector('.feather-char-count');
                if (charElement) charElement.textContent = chars;
              }
  }

    // Back-compat: some call sites still use updateHistory
    updateHistory() { this.pushHistory(); }

    pushHistory() { const html = this.editor.innerHTML; this.history = this.history.slice(0, this.historyIndex + 1); this.history.push(html); this.historyIndex++; if (this.history.length > 50) { this.history.shift(); this.historyIndex--; } }

  updateSourceControlsState() { const bar = document.getElementById(`${this.id}_srcbar`); if (bar) bar.style.display = this.isSource ? 'flex' : 'none'; }

    startAutosave() { if (this.autosaveTimer) clearInterval(this.autosaveTimer); this.autosaveTimer = setInterval(() => { this.element.value = this.getHTML(); }, this.config.autosaveInterval); }

    // ----- Selection helpers -----
    saveSelection() { const sel = window.getSelection(); if (sel && sel.rangeCount > 0) this._savedRange = sel.getRangeAt(0).cloneRange(); }
    restoreSelection() { if (!this._savedRange) return; const sel = window.getSelection(); if (!sel) return; sel.removeAllRanges(); sel.addRange(this._savedRange); this._savedRange = null; }

  // ----- Source helpers -----
  syncSourceScroll() { const pane = this.sourceWrap && this.sourceWrap.querySelector('.feather-source-pane'); if (!pane) return; const gutter = pane.querySelector('.feather-gutter'); if (gutter) gutter.scrollTop = this.source.scrollTop; if (this.codeOverlay) this.codeOverlay.scrollTop = this.source.scrollTop; }
  renderGutter() { if (!this.sourceWrap) return; const pane = this.sourceWrap.querySelector('.feather-source-pane'); if (!pane) return; const gutter = pane.querySelector('.feather-gutter'); if (!gutter) return; const text = this.source.value; const lines = text.split(/\n/).length || 1; let html = ''; for (let i = 1; i <= lines; i++) html += '<span>' + i + '</span>\n'; gutter.innerHTML = html; this.syncSourceScroll(); }

  // ----- Syntax highlighting -----
  escapeHTML(s) { return (s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  highlightHTML(src) {
    let s = this.escapeHTML(src);
    // comments
    s = s.replace(/(&lt;!--[\s\S]*?--&gt;)/g, '<span class="tok-com">$1<\/span>');
    // tags and attributes
    s = s.replace(/&lt;(\/)?([a-zA-Z][\w:-]*)([^>]*)&gt;/g, (m, slash, name, rest) => {
      let r = rest
        .replace(/([a-zA-Z_:][\w:.-]*)(=)/g, '<span class="tok-attr">$1<\/span>$2')
        .replace(/(\"[^\"]*\"|'[^']*')/g, '<span class="tok-str">$1<\/span>')
        .replace(/\b(\d+(?:\.\d+)?)\b/g, '<span class="tok-num">$1<\/span>');
      return `&lt;${slash ? '/' : ''}<span class="tok-tag">${name}<\/span>${r}&gt;`;
    });
    return s;
  }

  highlightCSS(src) {
    let s = this.escapeHTML(src);
    s = s.replace(/\/\*[\s\S]*?\*\//g, m => `<span class="tok-com">${m}<\/span>`);
    s = s.replace(/(@[a-zA-Z-]+)/g, '<span class="tok-kw">$1<\/span>');
    s = s.replace(/(:\s*)([^;}{]+)/g, (m, p, val) => p + val
      .replace(/(\"[^\"]*\"|'[^']*')/g, '<span class="tok-str">$1<\/span>')
      .replace(/\b(\d+(?:\.\d+)?(?:px|em|rem|%|vh|vw)?)\b/g, '<span class="tok-num">$1<\/span>'));
    s = s.replace(/([a-zA-Z-]+)(\s*:\s*)/g, '<span class="tok-attr">$1<\/span>$2');
    return s;
  }

  highlightJS(src) {
    let s = this.escapeHTML(src);
    s = s.replace(/\/\/.*$/gm, m => `<span class="tok-com">${m}<\/span>`);
    s = s.replace(/\/\*[\s\S]*?\*\//g, m => `<span class="tok-com">${m}<\/span>`);
    s = s.replace(/`([^`\\]|\\.)*`/g, m => `<span class=\"tok-str\">${m}<\/span>`);
    s = s.replace(/"([^"\\]|\\.)*"/g, m => `<span class=\"tok-str\">${m}<\/span>`);
    s = s.replace(/'([^'\\]|\\.)*'/g, m => `<span class=\"tok-str\">${m}<\/span>`);
    s = s.replace(/\b(0x[\da-fA-F]+|\d+(?:\.\d+)?(?:e[+-]?\d+)?)\b/g, '<span class="tok-num">$1<\/span>');
    const kw = '\\b(abstract|arguments|await|boolean|break|byte|case|catch|char|class|const|continue|debugger|default|delete|do|double|else|enum|export|extends|false|final|finally|float|for|function|goto|if|implements|import|in|instanceof|int|interface|let|long|native|new|null|package|private|protected|public|return|short|static|super|switch|synchronized|this|throw|throws|transient|true|try|typeof|var|void|volatile|while|with|yield)\\b';
    s = s.replace(new RegExp(kw, 'g'), '<span class="tok-kw">$1<\/span>');
    return s;
  }

  highlightJSON(src) {
    let s = this.escapeHTML(src);
    s = s.replace(/\"([^\"\\]|\\.)*\"(?=\s*:)/g, '<span class="tok-attr">$&<\/span>');
    s = s.replace(/\"([^\"\\]|\\.)*\"/g, '<span class="tok-str">$&<\/span>');
    s = s.replace(/\b(true|false|null)\b/g, '<span class="tok-kw">$1<\/span>');
    s = s.replace(/\b(\d+(?:\.\d+)?(?:e[+-]?\d+)?)\b/g, '<span class="tok-num">$1<\/span>');
    return s;
  }

  highlightSource() {
    if (!this.codeOverlay) return;
    const text = this.source ? this.source.value : '';
    const lang = (this.sourceLanguage || 'html').toLowerCase();
    let html = '';
    if (lang === 'html' || lang === 'xml') html = this.highlightHTML(text);
    else if (lang === 'css') html = this.highlightCSS(text);
    else if (lang === 'javascript' || lang === 'js') html = this.highlightJS(text);
    else if (lang === 'json') html = this.highlightJSON(text);
    else html = this.escapeHTML(text);
    this.codeOverlay.innerHTML = html;
    this.syncSourceScroll();
  }
    selectBracketPair() { const ta = this.source; if (!ta) return; const text = ta.value; let pos = ta.selectionStart; const br = '()[]{}<>';
      if (pos > 0 && !br.includes(text[pos]) && br.includes(text[pos-1])) pos = pos-1; const ch = text[pos]; const pairs = { '(': ')', '[': ']', '{': '}', '<': '>' }; const rev = { ')': '(', ']': '[', '}': '{', '>': '<' };
      if (pairs[ch]) { const open = ch, close = pairs[ch]; let d = 0; for (let i=pos;i<text.length;i++){ const c=text[i]; if (c===open) d++; else if (c===close){ d--; if (d===0){ ta.setSelectionRange(pos+1,i); return; } } } }
      else if (rev[ch]) { const close = ch, open = rev[ch]; let d=0; for (let i=pos;i>=0;i--){ const c=text[i]; if (c===close) d++; else if (c===open){ d--; if (d===0){ ta.setSelectionRange(i+1,pos); return; } } } }
    }

    setToolbar(arr) { this.config.toolbar = [...arr]; if (this.toolbar && this.toolbar.parentNode) this.toolbar.parentNode.removeChild(this.toolbar); this.toolbar = this.buildToolbar(); this.wrapper.insertBefore(this.toolbar, this.wrapper.firstChild); }

    // History
    undo() { if (this.historyIndex > 0) { this.historyIndex--; const html = this.history[this.historyIndex] || ''; this.editor.innerHTML = html; this.element.value = html; this.updateCounts(); } }
    redo() { if (this.historyIndex < this.history.length - 1) { this.historyIndex++; const html = this.history[this.historyIndex] || ''; this.editor.innerHTML = html; this.element.value = html; this.updateCounts(); } }

    // ----- API -----
    getHTML() { return this.isSource ? this.source.value : this.editor.innerHTML; }
    setHTML(html) { this.editor.innerHTML = html; this.element.value = html; this.updateCounts(); this.pushHistory(); }
    getText() { return this.editor.innerText || ''; }
    clear() { this.setHTML(''); }
    focus() { (this.isSource ? this.source : this.editor).focus(); }
    disable() { this.editor.contentEditable = false; this.toolbar.style.opacity = '0.5'; this.toolbar.style.pointerEvents = 'none'; }
    enable() { this.editor.contentEditable = true; this.toolbar.style.opacity = '1'; this.toolbar.style.pointerEvents = ''; }
    destroy() { if (this.autosaveTimer) clearInterval(this.autosaveTimer); this.wrapper.remove(); this.element.style.display = ''; }

  addButton(name, def) { buttons[name] = def; const btn = this.createToolbarButton(name); if (btn) { const groups = this.toolbar.querySelectorAll('.feather-group'); const last = groups[groups.length-1]; if (last) last.appendChild(btn); } }
    removeButton(name) { const btn = this.toolbar.querySelector(`[data-command="${name}"]`); if (btn) btn.remove(); }
    showButton(name) { const btn = this.toolbar.querySelector(`[data-command="${name}"]`); if (btn) btn.style.display = ''; }
    hideButton(name) { const btn = this.toolbar.querySelector(`[data-command="${name}"]`); if (btn) btn.style.display = 'none'; }

    setTheme(themeName) { this.applyTheme(themeName); }
    getConfig() { return Object.assign({}, this.config); }
    setConfig(cfg) { this.config = Object.assign({}, this.config, cfg || {}); this.destroy(); this.applyTheme(this.config.theme); this.buildEditor(); this.setupEvents(); }

    startAutosave() { if (this.autosaveTimer) clearInterval(this.autosaveTimer); this.autosaveTimer = setInterval(() => { this.element.value = this.getHTML(); }, this.config.autosaveInterval); }

    // ----- Clipboard + formatting helpers -----
    async copyAction() {
      if (this.isSource) {
        const ta = this.source; const selection = ta.value.substring(ta.selectionStart, ta.selectionEnd) || ta.value;
        try { await navigator.clipboard.writeText(selection); } catch {}
        return;
      }
      try {
        const ok = document.execCommand('copy');
        if (!ok && navigator.clipboard) {
          const text = window.getSelection ? (window.getSelection().toString() || this.getText()) : this.getText();
          await navigator.clipboard.writeText(text);
        }
      } catch {}
    }

    async pasteAction() {
      try {
        const text = await (navigator.clipboard && navigator.clipboard.readText ? navigator.clipboard.readText() : Promise.resolve(''));
        if (!text) return;
        if (this.isSource) {
          const ta = this.source; const s = ta.selectionStart, e2 = ta.selectionEnd; ta.setRangeText(text, s, e2, 'end'); this.renderGutter();
        } else {
          if (this.config.sanitizePaste) document.execCommand('insertText', false, text);
          else document.execCommand('insertHTML', false, text.replace(/\n/g,'<br>'));
          this.updateHistory();
        }
      } catch {}
    }

    clearFormatting() { document.execCommand('removeFormat'); this.updateHistory(); }

    clearColor(kind) {
      const cssProp = kind === 'fore' ? 'color' : 'backgroundColor';
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0) return;
      const range = sel.getRangeAt(0);
      const container = range.commonAncestorContainer.nodeType === Node.ELEMENT_NODE ? range.commonAncestorContainer : range.commonAncestorContainer.parentElement;
      const walker = document.createTreeWalker(container, NodeFilter.SHOW_ELEMENT, null);
      const list = [];
      while (walker.nextNode()) { const el = walker.currentNode; if (range.intersectsNode(el)) list.push(el); }
      list.forEach(el => { try { if (el.style && el.style[cssProp]) { el.style[cssProp] = ''; if (!el.getAttribute('style')) el.removeAttribute('style'); } } catch {} });
    }
  }

  FeatherText.init = function(selector, cfg){ const nodes = document.querySelectorAll(selector); const arr = []; nodes.forEach(n => arr.push(new FeatherText(n, cfg))); return arr; };
  FeatherText.themes = themes;
  FeatherText.version = '2.0.0';

  return FeatherText;
}));
