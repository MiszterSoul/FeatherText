# Performance and size

## Evidence sets

The supplied pre-change measurements remain historical and are not overwritten by the post-merge results. Full context is preserved in [`baseline.md`](baseline.md). Results from different fixtures or protocols are separate baselines unless all comparison controls are recorded.

## Historical pre-change measurements

### Assets

| Asset               |          Raw |         gzip |
| ------------------- | -----------: | -----------: |
| Minified JavaScript | 46,828 bytes | 13,402 bytes |
| CSS                 | 15,557 bytes |  3,868 bytes |

### Package

- tarball: 124,692 bytes;
- unpacked: 529,327 bytes;
- 12 files, including source maps and `src/`.

### JSDOM p95

| Scenario                 |        p95 |
| ------------------------ | ---------: |
| 1 editor initialization  |  64.814 ms |
| 10 editor initialization | 297.839 ms |
| 20 editor initialization | 553.410 ms |
| Theme switch for 20      |   5.390 ms |
| Input                    |   0.298 ms |
| Source 10K               |  37.029 ms |
| Source 100K              |  48.627 ms |
| Source 500K              | 245.141 ms |

The historical package baseline included maps and source. Package size and runtime transfer size answer different questions and must remain separate.

## Post-merge v0.2.0 evidence

The post-merge evidence was recorded with Node.js `20.19.2` and npm `10.8.2`. The unit-test result was **70/70 passing**.

### Latest size command

| Asset      |        Raw |  Minified |      gzip | Configured gzip gate | Achieved result |
| ---------- | ---------: | --------: | --------: | -------------------: | --------------- |
| JavaScript | 159.16 KiB | 95.85 KiB | 27.45 KiB |               35 KiB | Pass            |
| CSS        |  21.23 KiB | 17.55 KiB |  4.28 KiB |               20 KiB | Pass            |

The table reports both targets and achieved measurements: 35 KiB and 20 KiB are configured gzip gates; 27.45 KiB and 4.28 KiB are the observed outputs. They are not page-load or parse-time results.

The package tarball was **156,270 bytes** and contained **exactly 11 files**.

### Fresh JSDOM p95

Environment: JSDOM `29.1.1`, Linux x64, Node.js `20.19.2`; **5 measured samples plus 1 warm-up**.

| Scenario                    |       p95 total | Derived per operation |
| --------------------------- | --------------: | --------------------: |
| 1 editor initialization     |    77.641794 ms |                     — |
| 10 editor initialization    |   279.974966 ms |                     — |
| 20 editor initialization    |   501.366244 ms |                     — |
| Theme switch for 20 editors |    26.414901 ms |    1.320745 ms/editor |
| Input batch, 1,000 events   |   155.852584 ms |     0.155853 ms/event |
| Source 10K                  |   114.939459 ms |                     — |
| Source 100K                 | 1,017.311953 ms |                     — |
| Source 500K                 |   276.787002 ms |                     — |

The 500K result is faster than the 100K result because the highlight threshold bypasses syntax-highlighting work at 500K. It is a different execution path, not evidence that larger documents generally process faster.

Two attempts at **25 measured samples plus 3 warm-ups** OOMed near Node's default approximately 2 GB heap limit. One attempt used a forced-GC harness and still OOMed. Consequently, the completed five-sample run is useful evidence but does not achieve the intended 25-sample depth.

JSDOM timings isolate JavaScript/DOM behavior in a simulated environment. JSDOM does not perform browser layout, paint, or compositing, so these numbers are not browser-rendering or user-visible latency measurements.

### Browser and accessibility automation

Previous automation verified **85 E2E checks**: 17 each across Chromium 151, Firefox 153, WebKit 26.5, Mobile Chrome, and Tablet WebKit. It also verified **12 axe checks**.

Those are achieved automated checks, not performance timings or certification. There is no Lighthouse result, manual assistive-technology record, or latest-two-browser certification. Axe checks do not by themselves establish WCAG conformance, and the named browser runs do not establish an ongoing latest-two support guarantee.

## What remains unmeasured or uncertified

- download or parse time over a real network;
- browser main-thread initialization, layout, paint, or interaction latency;
- representative mobile or low-end hardware performance;
- memory use and detached-node behavior beyond the disclosed JSDOM OOM attempts;
- long-task frequency;
- typing latency with real selection/layout;
- Lighthouse performance or any other Lighthouse category;
- Core Web Vitals;
- manual assistive-technology behavior;
- certification against the latest two browser versions;
- competitor bundles under matched features/build settings.

Therefore the project makes no “fastest,” “instant,” Lighthouse-score, mobile-performance, latest-two-browser, WCAG-certification, or competitor-size claim.

## Interpreting the evidence

The historical and post-merge JSDOM runs differ and are not automatically a trend. A defensible regression comparison requires the same fixture, machine, generated artifacts, warm-up/sample method, and recorded working-tree state. Browser automation demonstrates exercised behavior in the named browser versions, but it does not supply browser rendering performance data.

## Gates and future targets

| Metric                        | Status                                       | Evidence or next step                                                   |
| ----------------------------- | -------------------------------------------- | ----------------------------------------------------------------------- |
| JavaScript gzip ≤ 35 KiB      | Achieved in latest size command              | 27.45 KiB                                                               |
| CSS gzip ≤ 20 KiB             | Achieved in latest size command              | 4.28 KiB                                                                |
| Package file count            | Achieved measurement, not a universal budget | Exactly 11 files; review contents and diffs for accidental files        |
| 25-sample JSDOM p95 run       | Not achieved                                 | Both attempts OOMed near the default heap limit, including forced GC    |
| Single-editor browser init    | Target not yet established                   | Benchmark on recorded reference hardware                                |
| Typing INP/long tasks         | Target not yet established                   | Measure real browser interaction first                                  |
| Lighthouse                    | Target not yet established                   | No Lighthouse run exists                                                |
| Manual AT/latest-two browsers | Not certified                                | Define and execute explicit test protocols before making support claims |

If core changes legitimately exceed a size gate, document the feature/size tradeoff and update the gate in review; do not remove meaningful behavior merely to hit a number.

## Reproducible size protocol

1. Start from a clean commit and record SHA/dirty status.
2. Record Node/npm/esbuild versions.
3. Run `npm ci` and `npm run build`.
4. Hash each generated asset.
5. Record raw bytes.
6. Gzip with a fixed tool/version/level and record the exact command.
7. Run `npm pack --dry-run --json` and `npm pack --json`.
8. Store machine-readable output as a release artifact.
9. Compare with the immediately previous release built under the same protocol.

Do not compare gzip output produced with unknown settings.

## Browser benchmark protocol

Use at least one desktop reference and one representative mid-range mobile device. Record browser/OS/device, power mode, thermal state where practical, viewport, sample count, warm-up, fixture hash, and percentile method.

Measure:

- navigation and asset transfer under a defined network profile;
- one, ten, and twenty editor initialization;
- first focus and first input;
- continuous typing and formatting with short/medium/large documents;
- theme switch;
- visual/source transitions at 10K, 100K, and 500K;
- destroy/recreate and memory retention;
- toolbar wrapping and fullscreen;
- denied/allowed clipboard paths.

Use browser Performance traces and preserve raw traces. Report median and p95 rather than only the best run.

## Lighthouse protocol

Lighthouse is not an editor microbenchmark. If used for the Pages site:

1. test the production artifact over HTTP(S), not a file URL;
2. record Lighthouse and Chrome versions, mode, device profile, and run count;
3. run at least three times and report variability;
4. keep the live editor loaded as users receive it;
5. retain JSON reports;
6. describe category scores as site results, not FeatherText library guarantees.

No Lighthouse run has been executed for this documentation pass.

## Competitor comparison

No apples-to-apples competitor measurement exists. Feature sets, build composition, compression, plugins, themes, document fixtures, and hardware must be matched before comparing. [`comparison.md`](comparison.md) therefore uses authoritative architecture/licensing facts and marks measurements unavailable.
