const FORBIDDEN_ELEMENTS = new Set([
  "base",
  "button",
  "embed",
  "form",
  "iframe",
  "input",
  "link",
  "math",
  "meta",
  "object",
  "option",
  "script",
  "select",
  "style",
  "svg",
  "template",
  "textarea",
]);

const ALLOWED_ELEMENTS = new Set([
  "a",
  "b",
  "blockquote",
  "br",
  "code",
  "del",
  "div",
  "em",
  "figcaption",
  "figure",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "i",
  "img",
  "li",
  "ol",
  "p",
  "pre",
  "s",
  "span",
  "strike",
  "strong",
  "sub",
  "sup",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "tr",
  "u",
  "ul",
]);

const GLOBAL_ATTRIBUTES = new Set(["dir", "lang", "title"]);
const ELEMENT_ATTRIBUTES = Object.freeze({
  a: new Set(["href", "rel", "target"]),
  img: new Set(["alt", "height", "src", "width"]),
  ol: new Set(["reversed", "start", "type"]),
  td: new Set(["colspan", "rowspan"]),
  th: new Set(["colspan", "rowspan", "scope"]),
});

const ALLOWED_PROTOCOLS = Object.freeze({
  link: new Set(["http:", "https:", "mailto:", "tel:"]),
  image: new Set(["http:", "https:"]),
  video: new Set(["http:", "https:"]),
  external: new Set(["http:", "https:"]),
});

export function escapeHTML(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function normalizeSafeUrl(value, options = {}) {
  const kind = options.kind || "link";
  const allowRelative =
    options.allowRelative !== false && kind !== "external" && kind !== "video";
  const raw = String(value ?? "").trim();
  if (!raw || /[\u0000-\u001F\u007F]/.test(raw)) return null;

  const colon = raw.indexOf(":");
  if (colon >= 0) {
    const compactScheme = raw
      .slice(0, colon + 1)
      .replace(/\s+/g, "")
      .toLowerCase();
    if (["javascript:", "data:", "vbscript:", "file:"].includes(compactScheme))
      return null;
  }

  const explicitScheme = /^[a-z][a-z\d+.-]*:/i.test(raw);
  const protocolRelative = raw.startsWith("//");
  if (!explicitScheme && !protocolRelative) return allowRelative ? raw : null;

  try {
    const parsed = new URL(
      raw,
      options.baseUrl || "https://feathertext.invalid/",
    );
    const allowed = ALLOWED_PROTOCOLS[kind] || ALLOWED_PROTOCOLS.link;
    return allowed.has(parsed.protocol.toLowerCase()) ? raw : null;
  } catch {
    return null;
  }
}

export function isSafeUrl(value, options = {}) {
  return normalizeSafeUrl(value, options) !== null;
}

export function normalizeUserLink(value) {
  const raw = String(value ?? "").trim();
  if (/^[\w.-]+\.[a-z]{2,}(?:[/:?#]|$)/i.test(raw))
    return normalizeSafeUrl(`https://${raw}`, { kind: "link" });
  return normalizeSafeUrl(raw, { kind: "link" });
}

export function toSafeVideoEmbedUrl(value) {
  const raw = normalizeSafeUrl(value, { kind: "video", allowRelative: false });
  if (!raw) return null;

  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase().replace(/^www\./, "");
    let id = "";
    if (host === "youtu.be")
      id = url.pathname.split("/").filter(Boolean)[0] || "";
    else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (url.pathname === "/watch") id = url.searchParams.get("v") || "";
      else {
        const match = url.pathname.match(/^\/(?:embed|shorts)\/([\w-]+)$/);
        id = match ? match[1] : "";
      }
    }
    if (/^[\w-]{6,20}$/.test(id))
      return `https://www.youtube-nocookie.com/embed/${id}`;

    if (host === "vimeo.com" || host === "player.vimeo.com") {
      const match = url.pathname.match(/(?:\/video)?\/(\d+)(?:\/|$)/);
      if (match) return `https://player.vimeo.com/video/${match[1]}`;
    }
  } catch {
    return null;
  }
  return null;
}

function numericAttribute(value, minimum, maximum) {
  const number = Number.parseInt(value, 10);
  return Number.isFinite(number) && number >= minimum && number <= maximum
    ? String(number)
    : null;
}

function sanitizeAttributes(element) {
  const tag = element.tagName.toLowerCase();
  const allowedForElement = ELEMENT_ATTRIBUTES[tag] || new Set();
  for (const attribute of [...element.attributes]) {
    const name = attribute.name.toLowerCase();
    if (
      name.startsWith("on") ||
      name === "srcdoc" ||
      name === "style" ||
      name === "id" ||
      name === "class"
    ) {
      element.removeAttribute(attribute.name);
      continue;
    }
    if (
      !GLOBAL_ATTRIBUTES.has(name) &&
      !allowedForElement.has(name) &&
      !name.startsWith("aria-")
    ) {
      element.removeAttribute(attribute.name);
      continue;
    }
    if (name === "href") {
      const safe = normalizeSafeUrl(attribute.value, { kind: "link" });
      if (safe) element.setAttribute("href", safe);
      else element.removeAttribute(attribute.name);
    } else if (name === "src") {
      const safe = normalizeSafeUrl(attribute.value, { kind: "image" });
      if (safe) element.setAttribute("src", safe);
      else element.removeAttribute(attribute.name);
    } else if (name === "width" || name === "height") {
      const safe = numericAttribute(attribute.value, 1, 10000);
      if (safe) element.setAttribute(name, safe);
      else element.removeAttribute(attribute.name);
    } else if (name === "colspan" || name === "rowspan") {
      const safe = numericAttribute(attribute.value, 1, 100);
      if (safe) element.setAttribute(name, safe);
      else element.removeAttribute(attribute.name);
    } else if (name === "target" && attribute.value !== "_blank") {
      element.removeAttribute(attribute.name);
    } else if (
      name === "scope" &&
      !["row", "col", "rowgroup", "colgroup"].includes(
        attribute.value.toLowerCase(),
      )
    ) {
      element.removeAttribute(attribute.name);
    }
  }

  if (tag === "a" && element.getAttribute("target") === "_blank")
    element.setAttribute("rel", "noopener noreferrer");
  if (tag === "img" && !element.hasAttribute("src")) element.remove();
}

function cleanTree(root, documentRef) {
  for (const node of [...root.childNodes]) {
    if (node.nodeType === 8) {
      node.remove();
      continue;
    }
    if (node.nodeType !== 1) continue;

    const tag = node.tagName.toLowerCase();
    if (FORBIDDEN_ELEMENTS.has(tag)) {
      node.remove();
      continue;
    }

    cleanTree(node, documentRef);
    if (!ALLOWED_ELEMENTS.has(tag)) {
      const fragment = documentRef.createDocumentFragment();
      while (node.firstChild) fragment.appendChild(node.firstChild);
      node.replaceWith(fragment);
      continue;
    }
    sanitizeAttributes(node);
  }
}

/**
 * Applies a deliberately conservative built-in baseline policy for untrusted HTML.
 * This small allowlist is not a complete sanitizer or a replacement for a reviewed,
 * application-specific security boundary (for example, a maintained sanitizer plus CSP).
 */
export function sanitizeUntrustedHTML(html, options = {}) {
  const documentRef = options.document || globalThis.document;
  if (!documentRef || typeof documentRef.createElement !== "function")
    return escapeHTML(html);
  const template = documentRef.createElement("template");
  template.innerHTML = String(html ?? "");
  cleanTree(template.content, documentRef);
  return template.innerHTML;
}
