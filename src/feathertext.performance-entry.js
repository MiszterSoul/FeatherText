import FeatherTextCore, { buttons, iconMarkup, themes, version } from "./feathertext.js";

function normalizeConfig(config) {
  const normalized = config && typeof config === "object" ? { ...config } : {};
  normalized.fancy = normalized.fancy === true;
  return normalized;
}

export default class FeatherText extends FeatherTextCore {
  constructor(element, config) {
    super(element, normalizeConfig(config));
    this.setFancy(this.config.fancy);
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

  static init(selector, config) {
    const nodes = document.querySelectorAll(selector);
    return Array.from(nodes, (node) => new this(node, config));
  }
}

FeatherText.themes = themes;
FeatherText.version = version;

export { buttons, iconMarkup, themes, version };
