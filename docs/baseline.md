# Pre-change baseline

This file preserves the measured **PRE-CHANGE** facts supplied for the documentation work. It is intentionally historical. Do not silently replace these values with results from a later working tree, compare them across different machines as if they were equivalent, or describe JSDOM measurements as browser performance.

## Environment

| Item            |                                                                      Supplied value |
| --------------- | ----------------------------------------------------------------------------------: |
| Node.js         | `v20.19.2`, from the committed `.tools` runtime because `node` was absent on `PATH` |
| npm             |                                                                            `10.8.2` |
| Package version |                                                                             `0.1.0` |

## Test baseline

`npm test` recorded:

- **6 passing**
- **1 failing**
- failure: encoded-source regression

The failing case was the regression covering conversion of encoded source tags back to regular HTML. This result describes the supplied pre-change run only; consult the current test run before release.

## Dependency audit baseline

`npm audit` recorded:

| Severity | Count / evidence                                                                                |
| -------- | ----------------------------------------------------------------------------------------------- |
| Moderate | 1 — esbuild advisory [`GHSA-67mh-4wv8-2f99`](https://github.com/advisories/GHSA-67mh-4wv8-2f99) |
| High     | 0                                                                                               |
| Critical | 0                                                                                               |

This does not mean the current lockfile is vulnerability-free. Re-run the audit for current status and assess reachability rather than treating a count alone as risk acceptance.

## Asset-size baseline

| Asset               | Raw bytes | gzip bytes |
| ------------------- | --------: | ---------: |
| Minified JavaScript |    46,828 |     13,402 |
| CSS                 |    15,557 |      3,868 |

Compression values are only comparable when the same bytes and compression settings are used.

## Package baseline

| Measurement              | Supplied value |
| ------------------------ | -------------: |
| Package tarball (`.tgz`) |  124,692 bytes |
| Unpacked package         |  529,327 bytes |
| Files                    |             12 |

The 12 files included source maps and `src/`. That is evidence about the pre-change package contents, not a recommendation. Review package contents with `npm pack --dry-run --json` before every release.

## JSDOM p95 baseline

| Scenario                       |        p95 |
| ------------------------------ | ---------: |
| Initialize 1 editor            |  64.814 ms |
| Initialize 10 editors          | 297.839 ms |
| Initialize 20 editors          | 553.410 ms |
| Switch theme across 20 editors |   5.390 ms |
| Input handling                 |   0.298 ms |
| Source mode, 10K               |  37.029 ms |
| Source mode, 100K              |  48.627 ms |
| Source mode, 500K              | 245.141 ms |

These numbers measure code executing under JSDOM. They do **not** include real layout, painting, user input latency, mobile hardware, assistive technology, or network transfer.

## Coverage explicitly absent

At the pre-change baseline there was no existing:

- browser automation;
- end-to-end test suite;
- automated accessibility coverage;
- manual screen-reader record;
- Lighthouse report or budget.

Those areas were therefore **not measured**. No score, pass status, browser matrix, WCAG conformance level, or Lighthouse result may be inferred.

## Post-merge v0.2.0 evidence

The following is a **new post-merge evidence set**, not a replacement for the pre-change baseline above. It was recorded with Node.js `20.19.2` and npm `10.8.2` for package version `0.2.0`.

### Tests

The post-merge unit-test run passed **70/70 tests**.

### Latest size-command result

| Asset      |        Raw |  Minified |      gzip | Configured gzip gate | Result |
| ---------- | ---------: | --------: | --------: | -------------------: | ------ |
| JavaScript | 159.16 KiB | 95.85 KiB | 27.45 KiB |               35 KiB | Pass   |
| CSS        |  21.23 KiB | 17.55 KiB |  4.28 KiB |               20 KiB | Pass   |

These are achieved results from the latest size command. The 35 KiB JavaScript and 20 KiB CSS values are configured gzip targets, not historical measurements or claims about network transfer time.

### Package

| Measurement              | Post-merge value |
| ------------------------ | ---------------: |
| Package tarball (`.tgz`) |    156,270 bytes |
| Files                    |       exactly 11 |

### Fresh JSDOM p95 run

Environment: JSDOM `29.1.1`, Linux x64, Node.js `20.19.2`; **5 measured samples plus 1 warm-up**.

| Scenario                       |       p95 total | Derived per operation |
| ------------------------------ | --------------: | --------------------: |
| Initialize 1 editor            |    77.641794 ms |                     — |
| Initialize 10 editors          |   279.974966 ms |                     — |
| Initialize 20 editors          |   501.366244 ms |                     — |
| Switch theme across 20 editors |    26.414901 ms |    1.320745 ms/editor |
| Input batch, 1,000 events      |   155.852584 ms |     0.155853 ms/event |
| Source mode, 10K               |   114.939459 ms |                     — |
| Source mode, 100K              | 1,017.311953 ms |                     — |
| Source mode, 500K              |   276.787002 ms |                     — |

The 500K source-mode case is faster than the 100K case because the highlight threshold bypasses syntax-highlighting work at that size. It must not be interpreted as normal linear scaling.

Two attempts to collect **25 measured samples plus 3 warm-ups** ran out of memory near Node's default approximately 2 GB heap limit. One of those attempts used a forced-GC harness and still OOMed. The smaller completed run is reported openly rather than presenting it as the originally intended sampling depth.

As with the historical timings, these measurements execute under JSDOM. They do **not** measure browser layout, paint, compositing, real input latency, or rendering on user hardware.

### Browser and accessibility automation evidence

Previous browser automation verified **85 E2E checks**: 17 each across Chromium 151, Firefox 153, WebKit 26.5, Mobile Chrome, and Tablet WebKit. It also verified **12 axe checks**.

That achieved automation coverage is not a browser-performance benchmark, manual assistive-technology test, WCAG certification, or promise of support for the latest two browser versions. There is still no Lighthouse result, manual AT record, or latest-two-browser certification.

## Comparison rule

A future result may be called an improvement or regression only when it records:

1. commit SHA and dirty-tree status;
2. exact Node/npm/browser and operating-system versions;
3. hardware or runner class;
4. fixture and sample count;
5. warm-up and percentile method;
6. generated asset hashes and compression command;
7. raw machine-readable output.

Until then, label later measurements as a new baseline rather than a direct trend.
