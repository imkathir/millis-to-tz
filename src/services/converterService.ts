/**
 * ConverterService — High-precision epoch translation and temporal inspection
 */

export type TimestampUnit = 'seconds' | 'milliseconds' | 'microseconds' | 'nanoseconds';

export interface CalendarMetrics {
  dayOfYear: number;
  totalDaysInYear: number;
  isoWeek: number;
  quarter: number;
  isLeapYear: boolean;
  julianDay: number;
  hexValue: string;
  binaryValue: string;
  relativeTime: string;
}

export interface ConvertedTimeOutput {
  millis: number;
  seconds: number;
  microseconds: string;
  nanoseconds: string;
  detectedUnit: TimestampUnit;
  isValid: boolean;
  errorMessage?: string;
  
  // Date string representations
  utcIso: string;
  utcRfc: string;
  utcDate: string;
  utcTime: string;
  
  localIso: string;
  localRfc: string;
  localDate: string;
  localTime: string;
  localTimezoneName: string;
  
  // Rich metrics
  metrics: CalendarMetrics;
}

class ConverterService {
  /**
   * Auto-detect timestamp precision based on numeric magnitude / string length
   */
  public detectUnit(inputStr: string): TimestampUnit {
    const clean = inputStr.trim().replace(/,/g, '');
    const num = Math.abs(parseFloat(clean));
    
    // Check if numeric
    if (!isNaN(num)) {
      const len = clean.split('.')[0].replace(/^-/, '').length;
      if (len <= 11) return 'seconds'; // e.g. 1,700,000,000
      if (len <= 14) return 'milliseconds'; // e.g. 1,700,000,000,000
      if (len <= 17) return 'microseconds'; // e.g. 1,700,000,000,000,000
      return 'nanoseconds'; // e.g. 1,700,000,000,000,000,000
    }
    
    return 'milliseconds';
  }

  /**
   * Normalizes any input unit to Milliseconds
   */
  public normalizeToMillis(value: number | string, unit: TimestampUnit): number {
    const num = typeof value === 'string' ? parseFloat(value.trim().replace(/,/g, '')) : value;
    if (isNaN(num)) return NaN;

    switch (unit) {
      case 'seconds':
        return Math.floor(num * 1000);
      case 'milliseconds':
        return Math.floor(num);
      case 'microseconds':
        return Math.floor(num / 1000);
      case 'nanoseconds':
        return Math.floor(num / 1000000);
      default:
        return Math.floor(num);
    }
  }

  /**
   * Parse arbitrary user input: timestamp, ISO string, natural language, date picker
   */
  public parseInputToMillis(input: string, forcedUnit?: TimestampUnit): { millis: number; detectedUnit: TimestampUnit; isValid: boolean } {
    const trimmed = input.trim();
    if (!trimmed) {
      return { millis: Date.now(), detectedUnit: 'milliseconds', isValid: true };
    }

    // Try parsing as standard date string first if it contains non-digits (like '-' or ':' or 'T')
    if (/[a-zA-Z-:]/.test(trimmed) && !/^[0-9]+$/.test(trimmed)) {
      // Natural shortcuts
      const lower = trimmed.toLowerCase();
      if (lower === 'now') return { millis: Date.now(), detectedUnit: 'milliseconds', isValid: true };
      if (lower === 'today') {
        const d = new Date();
        d.setHours(0, 0, 0, 0);
        return { millis: d.getTime(), detectedUnit: 'milliseconds', isValid: true };
      }
      if (lower === 'yesterday') {
        const d = new Date();
        d.setDate(d.getDate() - 1);
        d.setHours(0, 0, 0, 0);
        return { millis: d.getTime(), detectedUnit: 'milliseconds', isValid: true };
      }
      if (lower === 'tomorrow') {
        const d = new Date();
        d.setDate(d.getDate() + 1);
        d.setHours(0, 0, 0, 0);
        return { millis: d.getTime(), detectedUnit: 'milliseconds', isValid: true };
      }

      const parsedDate = new Date(trimmed);
      if (!isNaN(parsedDate.getTime())) {
        return { millis: parsedDate.getTime(), detectedUnit: 'milliseconds', isValid: true };
      }
    }

    // Numeric parsing
    const detectedUnit = forcedUnit || this.detectUnit(trimmed);
    const millis = this.normalizeToMillis(trimmed, detectedUnit);
    const isValid = !isNaN(millis) && isFinite(millis);

    return { millis: isValid ? millis : Date.now(), detectedUnit, isValid };
  }

  /**
   * Produce comprehensive temporal conversion output
   */
  public convertMillis(millis: number, detectedUnit: TimestampUnit = 'milliseconds'): ConvertedTimeOutput {
    if (isNaN(millis) || !isFinite(millis)) {
      return {
        millis: 0,
        seconds: 0,
        microseconds: '0',
        nanoseconds: '0',
        detectedUnit,
        isValid: false,
        errorMessage: 'Invalid timestamp value',
        utcIso: '',
        utcRfc: '',
        utcDate: '',
        utcTime: '',
        localIso: '',
        localRfc: '',
        localDate: '',
        localTime: '',
        localTimezoneName: '',
        metrics: this.computeMetrics(new Date(0), 0),
      };
    }

    const date = new Date(millis);
    const seconds = Math.floor(millis / 1000);
    const microseconds = (BigInt(Math.floor(millis)) * 1000n).toString();
    const nanoseconds = (BigInt(Math.floor(millis)) * 1000000n).toString();

    let localTzName = 'Local';
    try {
      localTzName = Intl.DateTimeFormat().resolvedOptions().timeZone || 'Local';
    } catch {
      localTzName = 'Local';
    }

    return {
      millis,
      seconds,
      microseconds,
      nanoseconds,
      detectedUnit,
      isValid: true,
      
      utcIso: date.toISOString(),
      utcRfc: date.toUTCString(),
      utcDate: date.toLocaleDateString('en-US', { timeZone: 'UTC', year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' }),
      utcTime: date.toLocaleTimeString('en-US', { timeZone: 'UTC', hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + '.' + String(Math.abs(millis) % 1000).padStart(3, '0') + ' UTC',
      
      localIso: this.formatLocalIso(date),
      localRfc: date.toString(),
      localDate: date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', weekday: 'short' }),
      localTime: date.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' }) + '.' + String(Math.abs(millis) % 1000).padStart(3, '0'),
      localTimezoneName: localTzName,
      
      metrics: this.computeMetrics(date, millis),
    };
  }

  private formatLocalIso(date: Date): string {
    const pad = (n: number) => String(n).padStart(2, '0');
    const y = date.getFullYear();
    const m = pad(date.getMonth() + 1);
    const d = pad(date.getDate());
    const h = pad(date.getHours());
    const min = pad(date.getMinutes());
    const s = pad(date.getSeconds());
    const ms = String(date.getMilliseconds()).padStart(3, '0');

    const offsetMin = -date.getTimezoneOffset();
    const sign = offsetMin >= 0 ? '+' : '-';
    const offsetH = pad(Math.floor(Math.abs(offsetMin) / 60));
    const offsetM = pad(Math.abs(offsetMin) % 60);

    return `${y}-${m}-${d}T${h}:${min}:${s}.${ms}${sign}${offsetH}:${offsetM}`;
  }

  private computeMetrics(date: Date, millis: number): CalendarMetrics {
    const year = date.getUTCFullYear();
    const isLeapYear = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    const totalDaysInYear = isLeapYear ? 366 : 365;

    // Day of Year
    const startOfYear = new Date(Date.UTC(year, 0, 1));
    const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / 86400000) + 1;

    // ISO 8601 Week Number
    const targetDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    const dayNr = (targetDate.getUTCDay() + 6) % 7;
    targetDate.setUTCDate(targetDate.getUTCDate() - dayNr + 3);
    const firstThursday = targetDate.getTime();
    targetDate.setUTCMonth(0, 1);
    if (targetDate.getUTCDay() !== 4) {
      targetDate.setUTCMonth(0, 1 + ((4 - targetDate.getUTCDay() + 7) % 7));
    }
    const isoWeek = 1 + Math.ceil((firstThursday - targetDate.getTime()) / 604800000);

    // Quarter
    const quarter = Math.floor(date.getUTCMonth() / 3) + 1;

    // Julian Day Number (approx)
    const julianDay = parseFloat((millis / 86400000 + 2440587.5).toFixed(4));

    // Hex and Binary
    const secBig = BigInt(Math.max(0, Math.floor(millis / 1000)));
    const hexValue = '0x' + secBig.toString(16).toUpperCase();
    const binaryValue = secBig.toString(2).padStart(32, '0');

    // Relative Time
    const relativeTime = this.formatRelativeTime(millis);

    return {
      dayOfYear,
      totalDaysInYear,
      isoWeek: isNaN(isoWeek) ? 1 : isoWeek,
      quarter,
      isLeapYear,
      julianDay,
      hexValue,
      binaryValue,
      relativeTime,
    };
  }

  public formatRelativeTime(millis: number): string {
    const diff = millis - Date.now();
    const absDiff = Math.abs(diff);
    const isFuture = diff > 0;

    const seconds = Math.floor(absDiff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 10) return 'Just now';

    let unitStr = '';
    if (days > 0) {
      unitStr = `${days} day${days > 1 ? 's' : ''}`;
    } else if (hours > 0) {
      unitStr = `${hours} hour${hours > 1 ? 's' : ''}`;
    } else if (minutes > 0) {
      unitStr = `${minutes} min${minutes > 1 ? 's' : ''}`;
    } else {
      unitStr = `${seconds} sec${seconds > 1 ? 's' : ''}`;
    }

    return isFuture ? `In ${unitStr}` : `${unitStr} ago`;
  }
}

export const converterService = new ConverterService();
