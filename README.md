# Millis to TZ — Unix Timestamp & Timezone Studio

A modern, high-precision developer utility inspired by [CurrentMillis.com](https://currentmillis.com/), built for instant zero-latency static hosting on **GitHub Pages**.

## Key Features

1. **Live Unix Epoch Ticker**:
   - Real-time tabular display of current Milliseconds, Seconds, Microseconds, and Nanoseconds.
   - Freeze/Pause inspection toggle with tactile 1-click clipboard copy.
   - Jump offsets: `-1w`, `-1d`, `-1h`, `Now`, `+1h`, `+1d`, `+1w`.

2. **Bi-Directional Converter**:
   - Auto-detection heuristics for input precision (10-digit seconds, 13-digit millis, 16-digit micros, 19-digit nanos, or ISO date strings).
   - Instant dual outputs: UTC ISO-8601, RFC-2822, Local ISO, Local calendar string, and relative time ("X hours ago").
   - Rich temporal metrics: Day of Year (e.g. 296/365), ISO-8601 Week Number, Quarter, Leap Year verification, Astronomical Julian Day, and Hexadecimal Unix timestamp.

3. **Synchronous Timezone Matrix**:
   - Real-time world clocks for 12 major financial & tech hubs (UTC, New York, San Francisco, Chicago, London, Berlin, Dubai, Mumbai, Singapore, Tokyo, Sydney, Auckland).
   - Interactive 48-hour time scrubber slider: drag backward or forward in time to simulate cross-timezone moments in lockstep.
   - Search & add custom IANA timezones.

4. **Batch Timestamp Parser & CSV Exporter**:
   - Paste multiline log dumps, comma-separated lists, or arrays of timestamps.
   - Automatically detects format and validates every row.
   - Export structured datasets to CSV or copy clean JSON.

5. **Cron Expression Studio**:
   - 5-part standard Unix cron editor with common presets.
   - Instant plain-English explanation.
   - Upcoming 10 trigger executions with relative countdowns.

6. **14+ Language Code Snippets**:
   - Copyable code snippets for Ember.js (@service clock & template helpers), JavaScript/Node.js, TypeScript, Python, Go, Rust, Java, C# (.NET), PHP, Swift, Kotlin, Bash, Ruby, and SQL.

7. **Target Countdown Scheduler**:
   - Millisecond-precision future target countdown with visual display.

---

## Deploy to Your GitHub Pages

This app is a 100% client-side SPA with relative assets (`base: './'`), requiring zero external backend.

### Option A: Automated GitHub Actions (Recommended)
1. Push this repository to your GitHub account:
   ```bash
   git init
   git add .
   git commit -m "feat: initial commit"
   git branch -M main
   git remote add origin https://github.com/<YOUR_USER>/<YOUR_REPO>.git
   git push -u origin main
   ```
2. In your GitHub repository, navigate to **Settings → Pages**.
3. Under **Build and deployment → Source**, select **GitHub Actions**.
4. The included `.github/workflows/deploy.yml` workflow will automatically build and publish your site!

### Option B: Manual Static Build
```bash
# Install dependencies
npm install

# Build static bundle to dist/
npm run build
```
You can deploy the contents of the `dist/` directory directly to GitHub Pages or any static CDN.
