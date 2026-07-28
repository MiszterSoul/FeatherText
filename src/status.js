import { iconMarkup } from "./icons.js";
import { normalizeSafeUrl } from "./security.js";
import { isAutosaveEnabled } from "./autosave.js";

function externalLink(documentRef, className, url, label, icon) {
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
  link.dataset.featherTooltip = label;
  link.innerHTML = icon;
  return link;
}

export function shouldBuildStatus() {
  return true;
}

export function buildStatus(editor) {
  const documentRef = editor.element.ownerDocument;
  const status = documentRef.createElement("div");
  status.className = "feather-status";
  status.setAttribute("role", "status");

  const counters = documentRef.createElement("div");
  counters.className = "feather-counters";

  const wordBadge = documentRef.createElement("span");
  wordBadge.className = "feather-badge";
  editor.wordCountEl = documentRef.createElement("span");
  editor.wordCountEl.className = "feather-word-count";
  editor.wordCountEl.textContent = "0";
  wordBadge.append(
    editor.wordCountEl,
    documentRef.createTextNode(" " + editor.t("status.words")),
  );
  counters.appendChild(wordBadge);

  const charBadge = documentRef.createElement("span");
  charBadge.className = "feather-badge";
  editor.charCountEl = documentRef.createElement("span");
  editor.charCountEl.className = "feather-char-count";
  editor.charCountEl.textContent = "0";
  charBadge.append(
    editor.charCountEl,
    documentRef.createTextNode(" " + editor.t("status.characters")),
  );
  counters.appendChild(charBadge);

  if (isAutosaveEnabled(editor.config.autosave)) {
    editor.saveStateEl = documentRef.createElement("span");
    editor.saveStateEl.className = "feather-save-state";
    editor.saveStateEl.setAttribute("role", "status");
    editor.saveStateEl.setAttribute("aria-live", "polite");
    editor.saveStateEl.textContent = editor.t("autosave.on");
    counters.appendChild(editor.saveStateEl);
  }
  status.appendChild(counters);

  const attribution = documentRef.createElement("div");
  attribution.className = "feather-attribution";
  attribution.append(
    externalLink(
      documentRef,
      "feather-attribution-project",
      editor.config.projectUrl,
      editor.t("status.github"),
      iconMarkup.github,
    ),
    externalLink(
      documentRef,
      "feather-attribution-support",
      editor.config.supportUrl,
      editor.t("status.support"),
      iconMarkup.coffee,
    ),
  );
  status.appendChild(attribution);
  return status;
}
