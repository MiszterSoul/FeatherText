import FeatherTextCore, { buttons, iconMarkup, themes, version } from "./feathertext.js";
import { containsHTMLTag, decodeHTMLEntities } from "./security.js";

function normalizeConfig(config) {
  const normalized = config && typeof config === "object" ? { ...config } : {};
  normalized.fancy = normalized.fancy === true;
  return normalized;
}

function decodeEncodedMarkup(sourceText) {
  const nextValue = typeof sourceText === "string" ? sourceText : "";
  if (!nextValue || containsHTMLTag(nextValue)) return nextValue;
  const decoded = decodeHTMLEntities(nextValue);
  return containsHTMLTag(decoded) ? decoded : nextValue;
}

export default class FeatherText extends FeatherTextCore {
  constructor(element, config) {
    super(element, normalizeConfig(config));
    this.setFancy(this.config.fancy);
  }

  renderSourceToHTML(sourceText) {
    return decodeEncodedMarkup(sourceText);
  }

  setFancy(enabled) {
    const fancy = enabled === true;
    this.config.fancy = fancy;
    if (this.wrapper) this.wrapper.classList.toggle("feather-fancy", fancy);
    if (this.tooltipEl) this.tooltipEl.classList.toggle("feather-fancy", fancy);
    return this;
  }

  ensureTooltip() {
    const tooltip = super.ensureTooltip();
    if (tooltip) tooltip.classList.toggle("feather-fancy", this.config.fancy === true);
    return tooltip;
  }

  setConfig(config) {
    const nextConfig = config && typeof config === "object" ? { ...config } : {};
    if (!Object.prototype.hasOwnProperty.call(nextConfig, "fancy")) {
      nextConfig.fancy = this.config.fancy === true;
    }
    super.setConfig(normalizeConfig(nextConfig));
    this.setFancy(this.config.fancy);
    return this;
  }

  static init(selector, config) {
    const nodes = document.querySelectorAll(selector);
    return Array.from(nodes, (node) => new this(node, config));
  }
}

FeatherText.themes = themes;
FeatherText.version = version;

export { buttons, iconMarkup, themes, version };
