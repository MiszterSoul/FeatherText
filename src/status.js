import { iconMarkup } from "./icons.js";
import { normalizeSafeUrl } from "./security.js";
import { isAutosaveEnabled } from "./autosave.js";

function externalLink(documentRef, className, url, label, icon, text = "") {
  const safeUrl = normalizeSafeUrl(url, {
    kind: "external",
    allowRelative: false,
  });
  if (!safeUrl) return null;
  const link = documentRef.createElement("a");
  link.className = className;
  link.href = safeUrl;
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.setAttribute("aria-label", label);
  link.title = label;
  link.innerHTML = icon;
  if (text) {
    const span = documentRef.createElement("span");
    span.textContent = text;
    link.appendChild(span);
  }
  return link;
}

export function shouldBuildStatus(config) {
  return !!(
    config.wordCount ||
    config.charCount ||
    config.attribution ||
    isAutosaveEnabled(config.autosave)
  );
}

export function buildStatus(editor) {
  const documentRef = editor.element.ownerDocument;
  const status = documentRef.createElement("div");
  status.className = "feather-status";
  status.setAttribute("role", "status");

  const counters = documentRef.createElement("div");
  counters.className = "feather-counters";
  if (editor.config.wordCount) {
    const badge = documentRef.createElement("span");
    badge.className = "feather-badge";
    editor.wordCountEl = documentRef.createElement("span");
    editor.wordCountEl.className = "feather-word-count";
    editor.wordCountEl.textContent = "0";
    badge.append(editor.wordCountEl, documentRef.createTextNode(" words"));
    counters.appendChild(badge);
  }
  if (editor.config.charCount) {
    const badge = documentRef.createElement("span");
    badge.className = "feather-badge";
    editor.charCountEl = documentRef.createElement("span");
    editor.charCountEl.className = "feather-char-count";
    editor.charCountEl.textContent = "0";
    badge.append(editor.charCountEl, documentRef.createTextNode(" chars"));
    counters.appendChild(badge);
  }
  if (isAutosaveEnabled(editor.config.autosave)) {
    editor.saveStateEl = documentRef.createElement("span");
    editor.saveStateEl.className = "feather-save-state";
    editor.saveStateEl.setAttribute("role", "status");
    editor.saveStateEl.setAttribute("aria-live", "polite");
    editor.saveStateEl.textContent = "Draft autosave on";
    counters.appendChild(editor.saveStateEl);
  }
  status.appendChild(counters);

  const attribution = documentRef.createElement("div");
  attribution.className = "feather-attribution";
  if (editor.config.attribution) {
    const project = externalLink(
      documentRef,
      "feather-attribution-project",
      editor.config.projectUrl,
      "FeatherText on GitHub",
      iconMarkup.github,
      "FeatherText",
    );
    if (project) attribution.appendChild(project);
    if (editor.config.supportLink) {
      const support = externalLink(
        documentRef,
        "feather-attribution-support",
        editor.config.supportUrl,
        "Support FeatherText on Buy Me a Coffee",
        iconMarkup.coffee,
      );
      if (support) attribution.appendChild(support);
    }
  }
  status.appendChild(attribution);
  return status;
}
