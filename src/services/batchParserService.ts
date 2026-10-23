/**
 * BatchParserService — Bulk timestamp extraction, validation, and CSV export
 */

import { converterService, TimestampUnit } from './converterService';

export interface BatchParsedItem {
  id: string;
  original: string;
  isValid: boolean;
  detectedUnit: TimestampUnit | 'date_string' | 'invalid';
  millis: number;
  seconds: number;
  utcIso: string;
  utcFormatted: string;
  localFormatted: string;
  relative: string;
}

export interface BatchParseResult {
  items: BatchParsedItem[];
  totalCount: number;
  validCount: number;
  invalidCount: number;
}

class BatchParserService {
  /**
   * Parse multiline or delimiter-separated text into structured items
   */
  public parseRawText(rawText: string, forcedUnit?: TimestampUnit): BatchParseResult {
    if (!rawText.trim()) {
      return { items: [], totalCount: 0, validCount: 0, invalidCount: 0 };
    }

    // Split by newlines, commas, or semicolons
    const tokens = rawText
      .split(/[\r\n,;]+/)
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const items: BatchParsedItem[] = [];
    let validCount = 0;
    let invalidCount = 0;

    tokens.forEach((token, index) => {
      // Strip quotes if present
      const cleanToken = token.replace(/^["']|["']$/g, '').trim();
      
      // Check if it's a numeric timestamp or date
      const isNumeric = /^-?\d+(\.\d+)?$/.test(cleanToken);
      let detectedUnit: TimestampUnit | 'date_string' | 'invalid' = 'invalid';
      let millis = NaN;
      let isValid = false;

      if (isNumeric) {
        const unit = forcedUnit || converterService.detectUnit(cleanToken);
        detectedUnit = unit;
        millis = converterService.normalizeToMillis(cleanToken, unit);
        isValid = !isNaN(millis) && isFinite(millis);
      } else {
        const d = new Date(cleanToken);
        if (!isNaN(d.getTime())) {
          millis = d.getTime();
          detectedUnit = 'date_string';
          isValid = true;
        }
      }

      if (isValid) {
        validCount++;
        const dateObj = new Date(millis);
        items.push({
          id: `item-${index}-${cleanToken}`,
          original: cleanToken,
          isValid: true,
          detectedUnit,
          millis,
          seconds: Math.floor(millis / 1000),
          utcIso: dateObj.toISOString(),
          utcFormatted: dateObj.toUTCString(),
          localFormatted: dateObj.toLocaleString(),
          relative: converterService.formatRelativeTime(millis),
        });
      } else {
        invalidCount++;
        items.push({
          id: `item-${index}-${cleanToken}`,
          original: cleanToken,
          isValid: false,
          detectedUnit: 'invalid',
          millis: 0,
          seconds: 0,
          utcIso: 'Invalid Date',
          utcFormatted: 'Invalid Date',
          localFormatted: 'Invalid Date',
          relative: 'N/A',
        });
      }
    });

    return {
      items,
      totalCount: tokens.length,
      validCount,
      invalidCount,
    };
  }

  /**
   * Generate CSV format and trigger download
   */
  public exportToCsv(items: BatchParsedItem[], filename = 'millis-to-tz-export.csv'): void {
    const headers = ['Original Input', 'Status', 'Detected Type', 'Milliseconds', 'Seconds', 'UTC ISO-8601', 'UTC String', 'Local Time'];
    const rows = items.map((item) => [
      `"${item.original.replace(/"/g, '""')}"`,
      item.isValid ? 'VALID' : 'INVALID',
      item.detectedUnit,
      item.isValid ? item.millis : '',
      item.isValid ? item.seconds : '',
      `"${item.utcIso}"`,
      `"${item.utcFormatted}"`,
      `"${item.localFormatted}"`,
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  /**
   * Export as JSON
   */
  public exportToJson(items: BatchParsedItem[]): string {
    return JSON.stringify(
      items.map((i) => ({
        original: i.original,
        isValid: i.isValid,
        detectedUnit: i.detectedUnit,
        millis: i.millis,
        seconds: i.seconds,
        utcIso: i.utcIso,
        local: i.localFormatted,
      })),
      null,
      2
    );
  }

  /**
   * Sample logs for testing
   */
  public getSampleBatchData(): string {
    const now = Date.now();
    return [
      now.toString(), // Current millis
      Math.floor(now / 1000).toString(), // Current seconds
      (now - 3600000).toString(), // 1 hour ago (ms)
      (now - 86400000).toString(), // 1 day ago (ms)
      '1700000000000', // Round millis
      '1700000000', // Round seconds
      '2026-10-23T12:00:00Z', // ISO string
      (now * 1000).toString(), // Microseconds
      '1609459200000', // Jan 1 2021
      '1577836800', // Jan 1 2020 seconds
      'invalid-timestamp-sample',
    ].join('\n');
  }
}

export const batchParserService = new BatchParserService();
