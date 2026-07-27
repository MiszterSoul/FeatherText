let axeBuilderPromise;

export function loadAxeBuilder() {
  axeBuilderPromise ??= import("@axe-core/playwright")
    .then((module) => module.default)
    .catch((error) => {
      const requestedPackageIsMissing =
        error?.code === "ERR_MODULE_NOT_FOUND" &&
        String(error.message).includes("@axe-core/playwright");
      if (requestedPackageIsMissing) return null;
      throw error;
    });
  return axeBuilderPromise;
}

export async function analyzeDocument(page, AxeBuilder) {
  // These pages contain no third-party widgets, so scan the complete document
  // without rule disables or element exclusions.
  return new AxeBuilder({ page }).analyze();
}

export function formatAxeViolations(violations) {
  if (!violations.length) return "No axe violations.";
  return violations
    .map((violation) => {
      const nodes = violation.nodes
        .map((node) => `    - ${node.target.join(" ")}: ${node.failureSummary || "failed"}`)
        .join("\n");
      return `${violation.id} (${violation.impact || "unknown impact"}): ${violation.help}\n${nodes}`;
    })
    .join("\n\n");
}
