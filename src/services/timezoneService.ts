/**
 * TimezoneService — Multi-timezone world clock engine and comparative matrix
 */

export interface TimezoneEntry {
  id: string; // IANA identifier e.g. "America/New_York"
  label: string; // Friendly City Name e.g. "New York"
  region: string; // e.g. "Americas", "Europe", "Asia", "UTC"
  abbreviation: string; // e.g. "EDT", "PST", "UTC", "IST"
  isDefault?: boolean;
}

export interface FormattedTimezoneData {
  id: string;
  label: string;
  region: string;
  abbreviation: string;
  time24: string;
  time12: string;
  date: string;
  dayOfWeek: string;
  offsetString: string;
  offsetMinutes: number;
  isDst: boolean;
  relativeDifferenceHours: string;
}

export const DEFAULT_TIMEZONES: TimezoneEntry[] = [
  { id: 'UTC', label: 'UTC / GMT (Zulu)', region: 'Standard', abbreviation: 'UTC', isDefault: true },
  { id: 'America/New_York', label: 'New York (Eastern)', region: 'Americas', abbreviation: 'ET', isDefault: true },
  { id: 'America/Los_Angeles', label: 'San Francisco / LA (Pacific)', region: 'Americas', abbreviation: 'PT', isDefault: true },
  { id: 'America/Chicago', label: 'Chicago (Central)', region: 'Americas', abbreviation: 'CT', isDefault: true },
  { id: 'Europe/London', label: 'London (UK)', region: 'Europe', abbreviation: 'GMT/BST', isDefault: true },
  { id: 'Europe/Berlin', label: 'Berlin / Paris (CET)', region: 'Europe', abbreviation: 'CET', isDefault: true },
  { id: 'Asia/Dubai', label: 'Dubai (GST)', region: 'Middle East', abbreviation: 'GST', isDefault: true },
  { id: 'Asia/Kolkata', label: 'India / Mumbai (IST)', region: 'Asia', abbreviation: 'IST', isDefault: true },
  { id: 'Asia/Singapore', label: 'Singapore (SGT)', region: 'Asia', abbreviation: 'SGT', isDefault: true },
  { id: 'Asia/Tokyo', label: 'Tokyo (JST)', region: 'Asia', abbreviation: 'JST', isDefault: true },
  { id: 'Australia/Sydney', label: 'Sydney (AEST)', region: 'Pacific', abbreviation: 'AEST', isDefault: true },
  { id: 'Pacific/Auckland', label: 'Auckland (NZST)', region: 'Pacific', abbreviation: 'NZST', isDefault: true },
];

class TimezoneService {
  private activeTimezones: TimezoneEntry[] = [...DEFAULT_TIMEZONES];

  /**
   * Get all supported IANA timezones supported by browser
   */
  public getAllAvailableTimezones(): string[] {
    try {
      if (typeof Intl !== 'undefined' && 'supportedValuesOf' in Intl) {
        return (Intl as unknown as { supportedValuesOf: (key: string) => string[] }).supportedValuesOf('timeZone');
      }
    } catch {
      // Fallback list
    }
    return [
      'UTC',
      'America/New_York',
      'America/Los_Angeles',
      'America/Chicago',
      'America/Denver',
      'America/Toronto',
      'America/Sao_Paulo',
      'Europe/London',
      'Europe/Paris',
      'Europe/Berlin',
      'Europe/Amsterdam',
      'Europe/Madrid',
      'Europe/Zurich',
      'Asia/Dubai',
      'Asia/Kolkata',
      'Asia/Singapore',
      'Asia/Tokyo',
      'Asia/Hong_Kong',
      'Asia/Seoul',
      'Asia/Shanghai',
      'Australia/Sydney',
      'Australia/Melbourne',
      'Pacific/Auckland',
      'Pacific/Honolulu',
    ];
  }

  public getActiveTimezones(): TimezoneEntry[] {
    return this.activeTimezones;
  }

  public addTimezone(timeZoneId: string, customLabel?: string): boolean {
    if (this.activeTimezones.some((tz) => tz.id === timeZoneId)) {
      return false;
    }

    const parts = timeZoneId.split('/');
    const city = parts[parts.length - 1].replace(/_/g, ' ');
    const region = parts[0] || 'Custom';

    this.activeTimezones.push({
      id: timeZoneId,
      label: customLabel || city,
      region,
      abbreviation: city.slice(0, 4).toUpperCase(),
    });
    return true;
  }

  public removeTimezone(timeZoneId: string): void {
    this.activeTimezones = this.activeTimezones.filter((tz) => tz.id !== timeZoneId);
  }

  public resetToDefaults(): void {
    this.activeTimezones = [...DEFAULT_TIMEZONES];
  }

  /**
   * Format given millisecond timestamp for a specific timezone
   */
  public formatForTimezone(millis: number, tzEntry: TimezoneEntry, referenceLocalMillis: number = millis): FormattedTimezoneData {
    const date = new Date(millis);

    let time24 = '--:--:--';
    let time12 = '--:--:--';
    let dateStr = '----';
    let dayOfWeek = '---';
    let abbreviation = tzEntry.abbreviation;
    let offsetString = '+00:00';
    let offsetMinutes = 0;
    let isDst = false;

    try {
      // 24-hour time
      const formatter24 = new Intl.DateTimeFormat('en-US', {
        timeZone: tzEntry.id,
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      time24 = formatter24.format(date);

      // 12-hour time
      const formatter12 = new Intl.DateTimeFormat('en-US', {
        timeZone: tzEntry.id,
        hour12: true,
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
      });
      time12 = formatter12.format(date);

      // Date string
      const dateFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tzEntry.id,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        weekday: 'short',
      });
      dateStr = dateFormatter.format(date);

      // Day of week
      dayOfWeek = new Intl.DateTimeFormat('en-US', {
        timeZone: tzEntry.id,
        weekday: 'short',
      }).format(date);

      // Extract timezone abbreviation and offset
      const partsFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tzEntry.id,
        timeZoneName: 'shortOffset',
      });
      const parts = partsFormatter.formatToParts(date);
      const tzPart = parts.find((p) => p.type === 'timeZoneName');
      if (tzPart) {
        offsetString = tzPart.value.replace('GMT', 'UTC');
        // Parse offset minutes
        const match = offsetString.match(/([+-])(\d+)(?::(\d+))?/);
        if (match) {
          const sign = match[1] === '-' ? -1 : 1;
          const h = parseInt(match[2], 10);
          const m = match[3] ? parseInt(match[3], 10) : 0;
          offsetMinutes = sign * (h * 60 + m);
        }
      }

      // Short abbreviation
      const shortFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tzEntry.id,
        timeZoneName: 'short',
      });
      const shortParts = shortFormatter.formatToParts(date);
      const shortName = shortParts.find((p) => p.type === 'timeZoneName');
      if (shortName && !shortName.value.startsWith('GMT') && !shortName.value.startsWith('UTC')) {
        abbreviation = shortName.value;
      }

      // Check DST by comparing offset in Jan vs July
      const jan = new Date(date.getFullYear(), 0, 1);
      const jul = new Date(date.getFullYear(), 6, 1);
      const janOffset = this.getTzOffsetMinutes(jan, tzEntry.id);
      const julOffset = this.getTzOffsetMinutes(jul, tzEntry.id);
      isDst = Math.max(janOffset, julOffset) === offsetMinutes && janOffset !== julOffset;

    } catch (e) {
      console.warn(`Error formatting timezone ${tzEntry.id}:`, e);
    }

    // Difference from user's local reference
    const userLocalOffsetMinutes = -new Date(referenceLocalMillis).getTimezoneOffset();
    const diffHours = (offsetMinutes - userLocalOffsetMinutes) / 60;
    const diffStr = diffHours === 0 
      ? 'Same time' 
      : diffHours > 0 
        ? `+${diffHours}h vs local` 
        : `${diffHours}h vs local`;

    return {
      id: tzEntry.id,
      label: tzEntry.label,
      region: tzEntry.region,
      abbreviation,
      time24,
      time12,
      date: dateStr,
      dayOfWeek,
      offsetString,
      offsetMinutes,
      isDst,
      relativeDifferenceHours: diffStr,
    };
  }

  private getTzOffsetMinutes(date: Date, timeZone: string): number {
    try {
      const partsFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone,
        timeZoneName: 'shortOffset',
      });
      const parts = partsFormatter.formatToParts(date);
      const tzPart = parts.find((p) => p.type === 'timeZoneName');
      if (tzPart) {
        const match = tzPart.value.match(/([+-])(\d+)(?::(\d+))?/);
        if (match) {
          const sign = match[1] === '-' ? -1 : 1;
          const h = parseInt(match[2], 10);
          const m = match[3] ? parseInt(match[3], 10) : 0;
          return sign * (h * 60 + m);
        }
      }
    } catch {
      return 0;
    }
    return 0;
  }
}

export const timezoneService = new TimezoneService();
