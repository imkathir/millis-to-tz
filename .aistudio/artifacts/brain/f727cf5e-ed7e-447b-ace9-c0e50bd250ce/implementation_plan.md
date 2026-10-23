# Millis to TZ: Unix Milliseconds & Timezone Studio

A modern, high-precision developer utility inspired by CurrentMillis.com, featuring live millisecond ticking, bi-directional timestamp decoding, multi-timezone comparison matrix, batch parsing with CSV export, cron expression debugging, countdown scheduling, and code snippet generators across 14+ languages, optimized for static hosting on GitHub Pages.

### User Review & Critical Decisions

> [!IMPORTANT]
> **Summary of Revisions & Critical Architectural Alignment**:
>
> 1. **Brand & Title Updated**: Officially renamed to **"Millis to TZ"** (displaying as `Millis to TZ` / `millis-to-tz`) per your selection.
> 2. **Client Framework & Architecture Alignment (Ember.js request)**:
>    - The project runtime in this container is standardized on Vite + React 19 (`@vitejs/plugin-react`, Tailwind CSS). Standard Ember.js requires the Ember CLI / Glimmer Embroider pipeline which cannot run inside the Vite React runtime.
>    - **Architectural Solution**: We implement Ember's core design ethos — specifically Ember's **Service-Oriented Reactive Architecture**:
>      - Dedicated standalone singleton services (`ClockService`, `TimezoneEngineService`, `BatchParserService`, `CronService`) that encapsulate state, tracking, and pure business logic just like Ember Services (`@service clock`, `@service timezone`).
>      - Ember-style reactive tracked stores with clean event-driven updates.
>      - In the Code Snippets module, we include Ember.js / Glimmer component and service recipes for integrating millisecond-to-timezone conversions in Ember applications.
>      - Full static compatibility with GitHub Pages (`base: './'`).

- **Confirmed Visual Theme**: Sleek dark hacker aesthetic featuring monospace tabular figures (`font-mono tabular-nums`), deep slate canvas (`#090d16` and `#0f1422`), clean hairline borders (`#1e293b`), and emerald/cyan live accents.
- **Confirmed Feature Scope**:
  1. **Live Epoch Clock**: Real-time millisecond, second, microsecond, and nanosecond ticker with freeze/pause mode and 1-click clipboard copy.
  2. **Bi-directional Millis <-> TZ Converter**: Automatic format detection (s, ms, μs, ns), human date input, calendar metrics (day of year, leap year, ISO week, Julian date).
  3. **Multi-Timezone Matrix**: Simultaneous live comparison across global zones (UTC, EST, PST, GMT, CET, IST, JST, AEST, and custom IANA search) with an interactive time scrubber.
  4. **Batch Timestamp Parser & CSV Exporter**: Bulk log/timestamp ingestion, real-time conversion table, and 1-click CSV download.
  5. **Cron Expression Debugger**: Human-readable explanation and next 10 calculated trigger executions in UTC and Local time.
  6. **Countdown & Target Timestamp Scheduler**: Visual countdown with precision target timing.
  7. **Multi-Language Snippet Generator**: Copyable code across 14+ languages including JavaScript, TypeScript, Ember.js/Glimmer, Python, Go, Rust, Java, C#, PHP, Swift, Kotlin, Bash, Ruby, and SQL.
  8. **GitHub Pages Deployer Modal**: Complete copy-paste instructions and GitHub Actions workflow (`deploy.yml`) for manual or automated GitHub Pages deployment.

---

### 1. Overview & Core Concept

- **What It Does**: `Millis to TZ` provides instant, zero-latency timestamp conversion, timezone translation, batch processing, and cron scheduling in a single unified dark-mode developer workstation.
- **Target Audience**: Backend engineers, frontend developers, DevOps/SREs, and data analysts working with distributed systems, databases, logs, and APIs.
- **Key Value**: A 100% client-side, zero-ad, fast alternative to CurrentMillis.com with rich timezone tooling that can be cloned and deployed directly to any GitHub Pages repository for free.

---

### 2. User Experience & Visual Design

#### Key User Flows
1. **Live Epoch & Instant Freeze**: The user lands on the page and sees the live milliseconds ticking in high-contrast tabular monospace font. Clicking "Freeze Time" stops the clock at the exact millisecond for careful log comparison.
2. **Millis to TZ Conversion**: The user enters an epoch value into the search bar. The engine auto-detects if it's seconds, milliseconds, microseconds, or nanoseconds, and instantly displays the corresponding local time, UTC, ISO 8601, RFC 2822, relative time, and calendar properties.
3. **World Timezone Matrix**: Compare local time with 10+ timezones at a glance. An interactive scrubber slider allows dragging backwards or forwards in time to inspect past logs or future releases across all timezones in lockstep.
4. **Batch Conversion**: Paste multiline server logs or a list of millisecond values; the batch engine parses each row, shows conversion status, and provides an instant "Export to CSV" button.
5. **Cron & Scheduler**: Input any 5-field cron expression to see its human meaning and the next 10 execution dates in both UTC and local timezone.
6. **Code Snippets**: Select language tabs (including Ember.js, Node.js, Python, Go, etc.) to copy boilerplate code for getting current millis or parsing timestamps.
7. **Deploy to GitHub Pages**: Click the "Deploy to GH Pages" button in the header to open a guide with one-line terminal commands and a ready-to-use GitHub Actions workflow file.

#### Visual Identity & Theme
- **Theme**: Dark hacker terminal precision with sleek modern typography.
- **Palette**:
  - Background (60%): Deep obsidian (`#090d16`) with structural panels (`#0f1422`).
  - Structural lines (30%): Subdued hairline borders (`#1e293b`), muted text (`#94a3b8`).
  - High-intent accents (10%): Phosphor emerald (`#10b981`) for live status and copy feedback, electric cyan (`#06b6d4`) for active states and timezone highlights.
- **Typography**:
  - Headings: `Plus Jakarta Sans` for crisp wordmarks and titles.
  - Telemetry & Data: Tabular monospace (`font-mono tabular-nums`) for timestamps, ensuring zero layout jitter.
- **Anti-Slop Discipline**: No decorative pulsing dots, no artificial watermark typography, unboxed text metadata with quiet middots (`·`).

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Ember.js Service-Oriented Pattern on Vite**:
  - *Chosen Approach*: Implement cleanly segregated, testable services (`ClockService`, `TimezoneEngineService`, `BatchParserService`, `CronService`) reflecting Ember's modular service architecture, while running seamlessly on Vite React 19 for instantaneous builds and hot reloading.
  - *Why*: Allows the codebase to be built into static assets with `npm run build` and hosted directly on GitHub Pages with zero external backend or compilation friction.
- **Decision 2: Relative Asset Base for GitHub Pages**:
  - *Chosen Approach*: Configure `base: './'` in `vite.config.ts`.
  - *Why*: Enables deployment to repository subpaths like `https://username.github.io/millis-to-tz/` without broken image or script URLs.
- **Decision 3: Zero External Dependencies for Time Computation**:
  - *Chosen Approach*: Use native JavaScript `Intl.DateTimeFormat`, `performance.now()`, and lightweight pure-math cron parsing.
  - *Why*: Guarantees zero bundle bloat, instant load time under 150ms, and total offline capability.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Millis to TZ Web App                            │
│                     (Static GitHub Pages SPA)                          │
└────────────────────────────────────────────────────────────────────────┘
                                    │
    ┌───────────────────────────────┴──────────────────────────────┐
    ▼                                                              ▼
┌───────────────────────────┐                    ┌─────────────────────────┐
│     Ember-Style Services  │                    │   Interactive Views     │
│  - ClockService (RAF/Tick)│                    │  - Live Epoch & Freeze  │
│  - TimezoneEngineService  │                    │  - Millis <-> TZ Tool   │
│  - BatchParserService     │                    │  - World TZ Matrix      │
│  - CronEngineService      │                    │  - Batch CSV Exporter   │
└─────────────┬─────────────┘                    │  - Cron Next-Runs       │
              │                                  │  - Snippets (inc Ember) │
              ▼                                  │  - GH Pages Modal       │
┌──────────────────────────────────────────┐     └────────────┬────────────┘
│       Shared Pure State & Stores         │                  │
│  - Active Timestamp / Paused State       │◄─────────────────┘
│  - Selected Timezones & Offsets          │
│  - Batch Raw Input & Parsed Results      │
│  - Scrubber Offset Delta (±Hours/Days)   │
└──────────────────────────────────────────┘
```

#### Core Components
- **`Header`**: Wordmark (`Millis to TZ`), active tool segmented switch, and "Deploy to GitHub Pages" trigger.
- **`LiveEpochPanel`**: Live ticking display in milliseconds, seconds, microseconds, and nanoseconds, with freeze toggle and quick jump buttons.
- **`MillisToTZConverter`**: Bi-directional converter with auto-unit detection, human date picker, and detailed calendar metrics.
- **`TimezoneMatrix`**: Interactive world clock grid with search, custom timezone additions, and a synchronous time scrubber slider.
- **`BatchParser`**: Multi-line raw timestamp parser with tabular validation and CSV export.
- **`CronDebugger`**: Cron syntax parser with 5-field explanation and next 10 calculated executions.
- **`CodeSnippetViewer`**: 14+ language snippets including Ember.js / Glimmer, TypeScript, Python, Go, and more.
- **`GitHubPagesModal`**: Ready-to-copy GitHub Actions YAML workflow and step-by-step git deployment commands.
