/**
 * SnippetService — Multi-language reference library for Unix millisecond operations
 * Includes Ember.js, JS/TS, Python, Go, Rust, Java, C#, PHP, Swift, Kotlin, Bash, Ruby, SQL, C++
 */

export interface CodeSnippet {
  id: string;
  name: string;
  category: string;
  badge: string;
  nowSnippet: string;
  toHumanSnippet: string;
  toDateToMillisSnippet: string;
}

export const CODE_SNIPPETS: CodeSnippet[] = [
  {
    id: 'javascript',
    name: 'JavaScript / Node.js',
    category: 'Web',
    badge: 'JS',
    nowSnippet: `// Current timestamp in milliseconds
const nowMillis = Date.now();
// Current timestamp in seconds
const nowSec = Math.floor(Date.now() / 1000);`,
    toHumanSnippet: `// Convert milliseconds to Date and Timezone
const millis = 1774320000000;
const date = new Date(millis);

// Formatted ISO 8601 (UTC)
const isoString = date.toISOString();

// Formatted in specific timezone (e.g. America/New_York)
const formatted = new Intl.DateTimeFormat('en-US', {
  timeZone: 'America/New_York',
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
}).format(date);`,
    toDateToMillisSnippet: `// Parse Date or ISO string to Milliseconds
const millis = new Date("2026-10-23T12:00:00Z").getTime();`,
  },
  {
    id: 'typescript',
    name: 'TypeScript',
    category: 'Web',
    badge: 'TS',
    nowSnippet: `// Current timestamp in milliseconds
const nowMillis: number = Date.now();
const highResNano: bigint = process.hrtime.bigint(); // Node.js high-res`,
    toHumanSnippet: `// Millis to UTC and Local format
const millis: number = 1774320000000;
const d: Date = new Date(millis);
const utcString: string = d.toUTCString();
const localString: string = d.toLocaleString('en-US', { timeZoneName: 'short' });`,
    toDateToMillisSnippet: `// Convert ISO string to milliseconds
const toEpochMs = (isoStr: string): number => new Date(isoStr).getTime();`,
  },
  {
    id: 'ember',
    name: 'Ember.js / Glimmer',
    category: 'Web',
    badge: 'Ember',
    nowSnippet: `// app/services/clock.js (Ember Service)
import Service from '@ember/service';
import { tracked } from '@glimmer/tracking';

export default class ClockService extends Service {
  @tracked currentMillis = Date.now();

  init() {
    super.init(...arguments);
    this.timer = setInterval(() => {
      this.currentMillis = Date.now();
    }, 1000);
  }

  willDestroy() {
    super.willDestroy(...arguments);
    clearInterval(this.timer);
  }
}`,
    toHumanSnippet: `// app/helpers/millis-to-tz.js (Ember Template Helper)
import { helper } from '@ember/component/helper';

export function millisToTz([millis, timeZone = 'UTC']) {
  if (!millis) return '';
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    dateStyle: 'medium',
    timeStyle: 'medium'
  }).format(new Date(Number(millis)));
}

export default helper(millisToTz);

{{!-- In template: --}}
{{millis-to-tz this.clock.currentMillis "America/New_York"}}`,
    toDateToMillisSnippet: `// Convert date input in Ember action
import Component from '@glimmer/component';
import { action } from '@ember/object';

export default class TimePicker extends Component {
  @action
  convert(dateString) {
    const epochMs = new Date(dateString).getTime();
    console.log('Millis:', epochMs);
  }
}`,
  },
  {
    id: 'python',
    name: 'Python',
    category: 'Backend',
    badge: 'PY',
    nowSnippet: `import time
from datetime import datetime, timezone

# Current milliseconds (int)
now_millis = int(time.time() * 1000)

# Current seconds (int)
now_sec = int(time.time())`,
    toHumanSnippet: `from datetime import datetime, timezone
from zoneinfo import ZoneInfo

millis = 1774320000000

# Convert millis to UTC datetime
utc_dt = datetime.fromtimestamp(millis / 1000.0, tz=timezone.utc)
print("UTC ISO:", utc_dt.isoformat())

# Convert to specific timezone (e.g. US/Eastern)
eastern_dt = utc_dt.astimezone(ZoneInfo("America/New_York"))
print("Eastern:", eastern_dt.strftime("%Y-%m-%d %H:%M:%S %Z"))`,
    toDateToMillisSnippet: `from datetime import datetime, timezone

# Date string to milliseconds
dt = datetime.fromisoformat("2026-10-23T12:00:00+00:00")
millis = int(dt.timestamp() * 1000)`,
  },
  {
    id: 'golang',
    name: 'Go (Golang)',
    category: 'Backend',
    badge: 'GO',
    nowSnippet: `package main
import (
    "fmt"
    "time"
)

func main() {
    nowMillis := time.Now().UnixMilli()
    nowNano := time.Now().UnixNano()
    fmt.Println(nowMillis, nowNano)
}`,
    toHumanSnippet: `millis := int64(1774320000000)
// Create time.Time from milliseconds
t := time.UnixMilli(millis)

// Load timezone location
loc, _ := time.LoadLocation("America/New_York")
tInLocation := t.In(loc)

fmt.Println("UTC:", t.UTC().Format(time.RFC3339))
fmt.Println("NY:", tInLocation.Format("2006-01-02 15:04:05 MST"))`,
    toDateToMillisSnippet: `// Parse ISO date to Unix Millis
t, _ := time.Parse(time.RFC3339, "2026-10-23T12:00:00Z")
millis := t.UnixMilli()`,
  },
  {
    id: 'rust',
    name: 'Rust',
    category: 'Systems',
    badge: 'RS',
    nowSnippet: `use std::time::{SystemTime, UNIX_EPOCH};

fn main() {
    let now_millis = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("Time went backwards")
        .as_millis();
    println!("Millis: {}", now_millis);
}`,
    toHumanSnippet: `// Using chrono crate
use chrono::{DateTime, Utc, TimeZone};
use chrono_tz::America::New_York;

let millis: i64 = 1774320000000;
let dt: DateTime<Utc> = Utc.timestamp_millis_opt(millis).unwrap();

println!("UTC ISO: {}", dt.to_rfc3339());
let ny_time = dt.with_timezone(&New_York);
println!("NY Time: {}", ny_time.format("%Y-%m-%d %H:%M:%S %Z"));`,
    toDateToMillisSnippet: `use chrono::{DateTime, Utc};

let dt = DateTime::parse_from_rfc3339("2026-10-23T12:00:00Z").unwrap();
let millis = dt.timestamp_millis();`,
  },
  {
    id: 'java',
    name: 'Java',
    category: 'Backend',
    badge: 'JAVA',
    nowSnippet: `// Current millis using System or Instant
long nowMillis = System.currentTimeMillis();
long nowInstant = java.time.Instant.now().toEpochMilli();`,
    toHumanSnippet: `import java.time.Instant;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.format.DateTimeFormatter;

long millis = 1774320000000L;
Instant instant = Instant.ofEpochMilli(millis);

// In specific timezone
ZonedDateTime zdt = instant.atZone(ZoneId.of("America/New_York"));
String formatted = zdt.format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss z"));
System.out.println(formatted);`,
    toDateToMillisSnippet: `import java.time.Instant;

long millis = Instant.parse("2026-10-23T12:00:00Z").toEpochMilli();`,
  },
  {
    id: 'csharp',
    name: 'C# (.NET)',
    category: 'Backend',
    badge: 'C#',
    nowSnippet: `// Unix milliseconds in .NET
long nowMillis = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
long nowSeconds = DateTimeOffset.UtcNow.ToUnixTimeSeconds();`,
    toHumanSnippet: `long millis = 1774320000000;
DateTimeOffset dto = DateTimeOffset.FromUnixTimeMilliseconds(millis);

// Convert to TimeZone
TimeZoneInfo tz = TimeZoneInfo.FindSystemTimeZoneById("Eastern Standard Time");
DateTimeOffset localDto = TimeZoneInfo.ConvertTime(dto, tz);
Console.WriteLine(localDto.ToString("yyyy-MM-dd HH:mm:ss zzz"));`,
    toDateToMillisSnippet: `var dto = DateTimeOffset.Parse("2026-10-23T12:00:00Z");
long millis = dto.ToUnixTimeMilliseconds();`,
  },
  {
    id: 'php',
    name: 'PHP',
    category: 'Backend',
    badge: 'PHP',
    nowSnippet: `// Current milliseconds
$nowMillis = (int) round(microtime(true) * 1000);
$nowSeconds = time();`,
    toHumanSnippet: `$millis = 1774320000000;
$seconds = (int) ($millis / 1000);

$dt = new DateTime("@$seconds");
$dt->setTimezone(new DateTimeZone("America/New_York"));
echo $dt->format("Y-m-d H:i:s T");`,
    toDateToMillisSnippet: `$dt = new DateTime("2026-10-23T12:00:00Z");
$millis = $dt->getTimestamp() * 1000;`,
  },
  {
    id: 'bash',
    name: 'Bash / Linux CLI',
    category: 'DevOps',
    badge: 'SH',
    nowSnippet: `# Current timestamp in milliseconds (GNU date)
date +%s%3N

# Current timestamp in seconds
date +%s`,
    toHumanSnippet: `# Convert milliseconds to human date (UTC)
MILLIS=1774320000000
SECS=$((MILLIS / 1000))
date -u -d "@$SECS" +"%Y-%m-%d %H:%M:%S UTC"

# Convert to specific Timezone
TZ="America/New_York" date -d "@$SECS"`,
    toDateToMillisSnippet: `# Date to milliseconds
date -d "2026-10-23 12:00:00 UTC" +%s%3N`,
  },
  {
    id: 'sql',
    name: 'SQL (Postgres / MySQL / SQLite)',
    category: 'Database',
    badge: 'SQL',
    nowSnippet: `-- PostgreSQL (milliseconds)
SELECT (EXTRACT(EPOCH FROM NOW()) * 1000)::BIGINT;

-- MySQL (milliseconds)
SELECT UNIX_TIMESTAMP(NOW(3)) * 1000;

-- SQLite (seconds)
SELECT strftime('%s', 'now');`,
    toHumanSnippet: `-- PostgreSQL: Millis to Timestamp with Timezone
SELECT TO_TIMESTAMP(1774320000000 / 1000.0) AT TIME ZONE 'America/New_York';

-- MySQL: Millis to Datetime
SELECT FROM_UNIXTIME(1774320000000 / 1000);`,
    toDateToMillisSnippet: `-- PostgreSQL: Timestamp to Milliseconds
SELECT (EXTRACT(EPOCH FROM '2026-10-23 12:00:00Z'::timestamptz) * 1000)::BIGINT;`,
  },
  {
    id: 'ruby',
    name: 'Ruby',
    category: 'Backend',
    badge: 'RB',
    nowSnippet: `# Current milliseconds
now_millis = (Time.now.to_f * 1000).to_i`,
    toHumanSnippet: `require 'time'
millis = 1774320000000
time = Time.at(millis / 1000.0).utc
puts time.iso8601`,
    toDateToMillisSnippet: `require 'time'
millis = (Time.parse("2026-10-23T12:00:00Z").to_f * 1000).to_i`,
  },
];
