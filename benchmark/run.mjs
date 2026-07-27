#!/usr/bin/env node

import assert from "node:assert/strict";
import { createRequire } from "node:module";
import process from "node:process";
import { performance } from "node:perf_hooks";

import { JSDOM } from "jsdom";

import FeatherText from "../src/feathertext.js";

const require = createRequire(import.meta.url);
const { version: jsdomVersion } = require("jsdom/package.json");
const JSDOM_CAVEAT =
  "JSDOM does not perform browser layout, painting, compositing, or native input processing. Treat these measurements as JavaScript/DOM regression signals, not real-user browser latency.";
const THEME_TARGETS = Object.freeze([
  "light",
  "ocean",
  "forest",
  "dark-b",
  "aurora",
  "dawn",
  "rose",
  "graphite",
  "canyon",
  "light",
  "ocean",
  "forest",
  "dark-b",
  "aurora",
  "dawn",
  "rose",
  "graphite",
  "canyon",
  "light",
  "ocean",
]);
const SOURCE_SIZES = Object.freeze([10_000, 100_000, 500_000]);
let _resultSink = 0;

const options = parseArguments(process.argv.slice(2));
if (options.help) {
  console.log(
    "Usage: node benchmark/run.mjs [--json] [--samples N] [--warmup N]",
  );
  console.log("  --json       Emit machine-readable benchmark results.");
  console.log("  --samples N  Measured samples per workload (default: 5).");
  console.log(
    "  --warmup N   Unreported warmup samples per workload (default: 1).",
  );
  process.exit(0);
}

const scenarios = [
  createInitializationScenario(1),
  createInitializationScenario(10),
  createInitializationScenario(20),
  createThemeScenario(),
  createInputScenario(),
  ...SOURCE_SIZES.map(createSourceScenario),
];

const results = [];
for (const scenario of scenarios) results.push(runScenario(scenario, options));

const report = {
  caveat: JSDOM_CAVEAT,
  environment: {
    arch: process.arch,
    jsdom: jsdomVersion,
    node: process.version,
    platform: process.platform,
  },
  settings: {
    samples: options.samples,
    warmup: options.warmup,
  },
  results,
};

if (options.json) console.log(`${JSON.stringify(report, null, 2)}\n`);
else printHumanReport(report);

function createInitializationScenario(count) {
  return {
    description: `Initialize ${count} editor${count === 1 ? "" : "s"}`,
    id: `init-${count}`,
    operationLabel: "editor",
    operations: count,
    setup: () => createDom(count),
    run(state) {
      state.instances = FeatherText.init("textarea", {
        autosave: false,
        countDebounceMs: 0,
      });
      return state.instances.length;
    },
    teardown(state) {
      for (const instance of state.instances || []) instance.destroy();
      state.cleanup();
    },
  };
}

function createThemeScenario() {
  return {
    description: "Switch theme once on 20 existing editors",
    id: "theme-switch-20",
    operationLabel: "editor",
    operations: THEME_TARGETS.length,
    setup() {
      const state = createDom(THEME_TARGETS.length);
      state.document.documentElement.setAttribute(
        "data-benchmark-host",
        "preserve",
      );
      state.document.documentElement.style.setProperty(
        "--benchmark-host-token",
        "preserve",
      );
      state.editors = FeatherText.init("textarea", {
        attribution: false,
        charCount: false,
        toolbar: [],
        wordCount: false,
      });
      state.documentElementAttributes = snapshotAttributes(
        state.document.documentElement,
      );
      state.initialWrapperThemes = state.editors.map((editor) =>
        editor.wrapper.getAttribute("data-theme"),
      );
      return state;
    },
    run(state) {
      for (let index = 0; index < state.editors.length; index += 1) {
        state.editors[index].setTheme(THEME_TARGETS[index]);
      }
      return state.editors.length;
    },
    validate(state) {
      assert.deepEqual(
        snapshotAttributes(state.document.documentElement),
        state.documentElementAttributes,
        "theme changes must not mutate the host documentElement",
      );
      assert.equal(
        new Set(state.editors.map((editor) => editor.wrapper)).size,
        THEME_TARGETS.length,
        "theme benchmark editors must have independent wrappers",
      );
      for (let index = 0; index < state.editors.length; index += 1) {
        const appliedTheme =
          state.editors[index].wrapper.getAttribute("data-theme");
        assert.equal(
          appliedTheme,
          THEME_TARGETS[index],
          `editor ${index + 1} did not receive its theme`,
        );
        assert.notEqual(
          appliedTheme,
          state.initialWrapperThemes[index],
          `editor ${index + 1} wrapper theme did not change`,
        );
      }
    },
    teardown(state) {
      for (const editor of state.editors) editor.destroy();
      state.cleanup();
    },
  };
}

function createInputScenario() {
  const inputEvents = 1_000;
  return {
    description: `Dispatch ${inputEvents} editor input events`,
    id: "input-handler",
    operationLabel: "event",
    operations: inputEvents,
    setup() {
      const state = createDom(1);
      [state.editor] = FeatherText.init("textarea", {
        countDebounceMs: 0,
        toolbar: [],
      });
      state.editor.editor.innerHTML = "<p>FeatherText input benchmark</p>";
      state.event = new state.window.Event("input", { bubbles: true });
      return state;
    },
    run(state) {
      for (let index = 0; index < inputEvents; index += 1) {
        state.editor.editor.dispatchEvent(state.event);
      }
      return state.editor.element.value.length;
    },
    teardown(state) {
      state.editor.destroy();
      state.cleanup();
    },
  };
}

function createSourceScenario(size) {
  return {
    description: `Activate source mode for ${formatDecimalBytes(size)} of HTML`,
    id: `source-${size / 1_000}K`,
    operationLabel: "activation",
    operations: 1,
    setup() {
      const state = createDom(1);
      [state.editor] = FeatherText.init("textarea", {
        attribution: false,
        charCount: false,
        toolbar: [],
        wordCount: false,
      });
      state.source = makeSource(size);
      state.editor.editor.innerHTML = state.source;
      state.editor.element.value = state.source;
      return state;
    },
    run(state) {
      state.editor.setSourceMode(true, { focus: false, history: false });
      return state.editor.isSource;
    },
    validate(state) {
      assert.equal(state.editor.isSource, true, "source mode did not activate");
      assert.equal(
        state.editor.source.value,
        state.editor.editor.innerHTML,
        "source buffer does not match the activated editor content",
      );
      assert.equal(
        state.editor.source.value.length,
        size,
        "source-mode activation workload size changed",
      );
      assert.ok(
        state.editor.codeOverlay.textContent.length > 0,
        "source highlight pathway produced an empty overlay",
      );
    },
    teardown(state) {
      state.editor.destroy();
      state.cleanup();
    },
    workloadBytes: size,
  };
}

function runScenario(scenario, settings) {
  const durations = [];
  const totalRuns = settings.warmup + settings.samples;

  for (let runIndex = 0; runIndex < totalRuns; runIndex += 1) {
    const state = scenario.setup();
    let output;
    let elapsed;
    try {
      const start = performance.now();
      output = scenario.run(state);
      elapsed = performance.now() - start;
      if (scenario.validate) scenario.validate(state, output);
      consume(output);
    } finally {
      scenario.teardown(state);
    }
    if (runIndex >= settings.warmup) durations.push(elapsed);
  }

  const batch = summarize(durations);
  const perOperation = Object.fromEntries(
    Object.entries(batch).map(([key, value]) => [
      key,
      round(value / scenario.operations),
    ]),
  );
  return {
    id: scenario.id,
    description: scenario.description,
    operationLabel: scenario.operationLabel,
    operationsPerSample: scenario.operations,
    samples: settings.samples,
    ...(scenario.workloadBytes
      ? { workloadBytes: scenario.workloadBytes }
      : {}),
    milliseconds: batch,
    millisecondsPerOperation: perOperation,
  };
}

function summarize(values) {
  const sorted = [...values].sort((left, right) => left - right);
  const mean = sorted.reduce((sum, value) => sum + value, 0) / sorted.length;
  const middle = Math.floor(sorted.length / 2);
  const median =
    sorted.length % 2 === 0
      ? (sorted[middle - 1] + sorted[middle]) / 2
      : sorted[middle];
  const p95Index = Math.max(0, Math.ceil(sorted.length * 0.95) - 1);
  return {
    min: round(sorted[0]),
    median: round(median),
    mean: round(mean),
    p95: round(sorted[p95Index]),
    max: round(sorted.at(-1)),
  };
}

function createDom(textareaCount) {
  const markup = Array.from(
    { length: textareaCount },
    (_, index) => `<textarea id="editor-${index}"></textarea>`,
  ).join("");
  const dom = new JSDOM(`<!doctype html><html><body>${markup}</body></html>`, {
    pretendToBeVisual: true,
    url: "https://benchmark.invalid/",
  });
  const { window } = dom;
  const { document } = window;

  document.execCommand = () => true;
  document.queryCommandState = () => false;
  window.matchMedia = () => ({
    addEventListener() {},
    addListener() {},
    matches: false,
    media: "(prefers-color-scheme: dark)",
    removeEventListener() {},
    removeListener() {},
  });

  const bindings = {
    CustomEvent: window.CustomEvent,
    Element: window.Element,
    Event: window.Event,
    HTMLElement: window.HTMLElement,
    Node: window.Node,
    NodeFilter: window.NodeFilter,
    document,
    getSelection: window.getSelection.bind(window),
    localStorage: window.localStorage,
    navigator: window.navigator,
    window,
  };
  const previousDescriptors = new Map();
  for (const [name, value] of Object.entries(bindings)) {
    previousDescriptors.set(
      name,
      Object.getOwnPropertyDescriptor(globalThis, name),
    );
    Object.defineProperty(globalThis, name, {
      configurable: true,
      enumerable: true,
      value,
      writable: true,
    });
  }

  return {
    cleanup() {
      for (const [name, descriptor] of previousDescriptors) {
        if (descriptor) Object.defineProperty(globalThis, name, descriptor);
        else delete globalThis[name];
      }
      dom.window.close();
    },
    document,
    instances: [],
    window,
  };
}

function makeSource(size) {
  const start = "<main>\n";
  const end = "</main>";
  const line =
    '<section data-index="12345"><h2>FeatherText</h2><p>Source benchmark text 67890.</p></section>\n';
  const available = size - start.length - end.length;
  const repeated = line.repeat(Math.floor(available / line.length));
  const remaining = available - repeated.length;
  const padding =
    remaining >= 7
      ? `<!--${"x".repeat(remaining - 7)}-->`
      : " ".repeat(remaining);
  const source = `${start}${repeated}${padding}${end}`;
  assert.equal(source.length, size, "source fixture size changed");
  return source;
}

function snapshotAttributes(element) {
  return Object.fromEntries(
    element
      .getAttributeNames()
      .sort()
      .map((name) => [name, element.getAttribute(name)]),
  );
}

function consume(value) {
  if (typeof value === "number") _resultSink ^= value;
  else if (typeof value === "string") _resultSink ^= value.length;
  else _resultSink ^= 1;
}

function parseArguments(args) {
  const parsed = { help: false, json: false, samples: 5, warmup: 1 };
  for (let index = 0; index < args.length; index += 1) {
    const argument = args[index];
    if (argument === "--help") parsed.help = true;
    else if (argument === "--json") parsed.json = true;
    else if (argument === "--samples" || argument === "--warmup") {
      const value = args[index + 1];
      if (value === undefined || value.startsWith("--"))
        throw new Error(`${argument} requires an integer`);
      parsed[argument.slice(2)] = parseCount(
        value,
        argument,
        argument === "--samples" ? 1 : 0,
        100,
      );
      index += 1;
    } else {
      throw new Error(`Unknown option: ${argument}`);
    }
  }
  return parsed;
}

function parseCount(value, label, minimum, maximum) {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < minimum || parsed > maximum) {
    throw new Error(
      `${label} must be an integer from ${minimum} to ${maximum}`,
    );
  }
  return parsed;
}

function printHumanReport(report) {
  console.log("FeatherText JSDOM microbenchmarks");
  console.log(`Caveat: ${report.caveat}`);
  console.log(
    `Environment: Node ${report.environment.node}, JSDOM ${report.environment.jsdom}, ${report.environment.platform}/${report.environment.arch}`,
  );
  console.log(
    `Samples: ${report.settings.samples} measured + ${report.settings.warmup} warmup\n`,
  );

  const rows = report.results.map((result) => ({
    benchmark: result.id,
    median: formatMilliseconds(result.milliseconds.median),
    mean: formatMilliseconds(result.milliseconds.mean),
    p95: formatMilliseconds(result.milliseconds.p95),
    perOperation: `${formatMilliseconds(result.millisecondsPerOperation.median)}/${result.operationLabel}`,
  }));
  const headings = {
    benchmark: "Benchmark",
    median: "Median batch",
    mean: "Mean batch",
    p95: "P95 batch",
    perOperation: "Median/op",
  };
  const keys = Object.keys(headings);
  const widths = Object.fromEntries(
    keys.map((key) => [
      key,
      Math.max(headings[key].length, ...rows.map((row) => row[key].length)),
    ]),
  );
  const formatRow = (row) =>
    keys.map((key) => row[key].padEnd(widths[key])).join("  ");
  console.log(formatRow(headings));
  console.log(keys.map((key) => "-".repeat(widths[key])).join("  "));
  for (const row of rows) console.log(formatRow(row));
}

function formatMilliseconds(value) {
  if (value < 0.001) return `${(value * 1_000).toFixed(2)} µs`;
  return `${value.toFixed(value < 10 ? 3 : 2)} ms`;
}

function formatDecimalBytes(bytes) {
  return `${bytes / 1_000} KB`;
}

function round(value) {
  return Number(value.toFixed(6));
}
