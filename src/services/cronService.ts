/**
 * CronService — Parse, explain, and preview next executions of 5-field cron expressions
 */

export interface CronExecution {
  date: Date;
  millis: number;
  utcString: string;
  localString: string;
  relative: string;
}

export interface CronAnalysis {
  isValid: boolean;
  errorMessage?: string;
  explanation: string;
  nextExecutions: CronExecution[];
  fields: {
    minute: string;
    hour: string;
    dayOfMonth: string;
    month: string;
    dayOfWeek: string;
  };
}

export interface CronPreset {
  label: string;
  expression: string;
  description: string;
}

export const CRON_PRESETS: CronPreset[] = [
  { label: 'Every minute', expression: '* * * * *', description: 'Triggers every single minute' },
  { label: 'Every 5 minutes', expression: '*/5 * * * *', description: 'Triggers at :00, :05, :10, :15, ...' },
  { label: 'Every 15 minutes', expression: '*/15 * * * *', description: 'Triggers every quarter hour' },
  { label: 'Hourly at :00', expression: '0 * * * *', description: 'Triggers at the start of every hour' },
  { label: 'Daily at Midnight', expression: '0 0 * * *', description: 'Triggers every day at 00:00 UTC' },
  { label: 'Weekday 9 AM', expression: '0 9 * * 1-5', description: 'Triggers Monday through Friday at 09:00' },
  { label: 'Weekly Sunday', expression: '0 0 * * 0', description: 'Triggers every Sunday at 00:00' },
  { label: 'Monthly 1st', expression: '0 0 1 * *', description: 'Triggers at 00:00 on the 1st of every month' },
];

class CronService {
  /**
   * Parse a cron field into a set of allowed numbers
   */
  private parseField(field: string, min: number, max: number): Set<number> | null {
    const allowed = new Set<number>();
    const parts = field.split(',');

    for (const part of parts) {
      if (part === '*') {
        for (let i = min; i <= max; i++) allowed.add(i);
      } else if (part.includes('/')) {
        const [range, stepStr] = part.split('/');
        const step = parseInt(stepStr, 10);
        if (isNaN(step) || step <= 0) return null;

        let start = min;
        let end = max;
        if (range !== '*') {
          if (range.includes('-')) {
            const [rStart, rEnd] = range.split('-').map((n) => parseInt(n, 10));
            if (isNaN(rStart) || isNaN(rEnd)) return null;
            start = Math.max(min, rStart);
            end = Math.min(max, rEnd);
          } else {
            const rStart = parseInt(range, 10);
            if (isNaN(rStart)) return null;
            start = rStart;
          }
        }

        for (let i = start; i <= end; i += step) {
          allowed.add(i);
        }
      } else if (part.includes('-')) {
        const [rStart, rEnd] = part.split('-').map((n) => parseInt(n, 10));
        if (isNaN(rStart) || isNaN(rEnd) || rStart > rEnd) return null;
        for (let i = Math.max(min, rStart); i <= Math.min(max, rEnd); i++) {
          allowed.add(i);
        }
      } else {
        const num = parseInt(part, 10);
        if (isNaN(num) || num < min || num > max) return null;
        allowed.add(num);
      }
    }

    return allowed.size > 0 ? allowed : null;
  }

  /**
   * Provide plain-English explanation of 5-field cron
   */
  public explainExpression(minute: string, hour: string, dom: string, month: string, dow: string): string {
    const minDesc = minute === '*' ? 'every minute' : minute.startsWith('*/') ? `every ${minute.slice(2)} minutes` : `at minute ${minute}`;
    const hrDesc = hour === '*' ? 'of every hour' : hour.startsWith('*/') ? `every ${hour.slice(2)} hours` : `at ${hour}:00`;
    const domDesc = dom === '*' ? 'every day' : `on day ${dom} of the month`;
    const monthDesc = month === '*' ? 'of every month' : `in month ${month}`;
    
    let dowDesc = 'every day of the week';
    if (dow !== '*') {
      const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
      if (dow === '1-5') dowDesc = 'Monday through Friday';
      else if (dow === '0,6' || dow === '6,0') dowDesc = 'Saturday and Sunday';
      else {
        const parsed = dow.split(',').map(d => days[parseInt(d, 10)] || d).join(', ');
        dowDesc = `on ${parsed}`;
      }
    }

    return `Executes ${minDesc} ${hrDesc}, ${domDesc}, ${monthDesc}, ${dowDesc}.`;
  }

  /**
   * Analyze cron expression and calculate next executions from a base date
   */
  public analyze(expression: string, baseDate: Date = new Date(), maxExecutions = 10): CronAnalysis {
    const trimmed = expression.trim();
    const parts = trimmed.split(/\s+/);

    if (parts.length !== 5) {
      return {
        isValid: false,
        errorMessage: 'Standard cron requires exactly 5 fields: minute hour day-of-month month day-of-week',
        explanation: 'Invalid expression format.',
        nextExecutions: [],
        fields: { minute: '', hour: '', dayOfMonth: '', month: '', dayOfWeek: '' },
      };
    }

    const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;

    const validMinutes = this.parseField(minute, 0, 59);
    const validHours = this.parseField(hour, 0, 23);
    const validDom = this.parseField(dayOfMonth, 1, 31);
    const validMonths = this.parseField(month, 1, 12);
    const validDow = this.parseField(dayOfWeek, 0, 7); // 0 & 7 are Sunday

    if (!validMinutes || !validHours || !validDom || !validMonths || !validDow) {
      return {
        isValid: false,
        errorMessage: 'Invalid syntax in one or more cron fields.',
        explanation: 'Unable to parse field values.',
        nextExecutions: [],
        fields: { minute, hour, dayOfMonth, month, dayOfWeek },
      };
    }

    // Normalize 7 to 0 for Sunday
    if (validDow.has(7)) validDow.add(0);

    const explanation = this.explainExpression(minute, hour, dayOfMonth, month, dayOfWeek);
    const nextExecutions: CronExecution[] = [];

    // Search forward minute by minute (up to 5 years into future limit)
    const current = new Date(baseDate.getTime());
    current.setSeconds(0, 0);
    current.setMinutes(current.getMinutes() + 1); // Start from next minute

    const limit = 525600 * 2; // ~2 years in minutes
    let iterations = 0;

    while (nextExecutions.length < maxExecutions && iterations < limit) {
      iterations++;
      const m = current.getMinutes();
      const h = current.getHours();
      const dom = current.getDate();
      const mon = current.getMonth() + 1;
      const dow = current.getDay();

      if (
        validMonths.has(mon) &&
        validDom.has(dom) &&
        validDow.has(dow) &&
        validHours.has(h) &&
        validMinutes.has(m)
      ) {
        const execDate = new Date(current.getTime());
        const diffMs = execDate.getTime() - Date.now();
        const diffMin = Math.round(diffMs / 60000);
        let relStr = `in ${diffMin} min`;
        if (diffMin >= 60) {
          const diffHrs = Math.floor(diffMin / 60);
          const remMin = diffMin % 60;
          relStr = `in ${diffHrs}h ${remMin > 0 ? remMin + 'm' : ''}`;
        }
        if (diffMin >= 1440) {
          const diffDays = Math.floor(diffMin / 1440);
          relStr = `in ${diffDays} day${diffDays > 1 ? 's' : ''}`;
        }

        nextExecutions.push({
          date: execDate,
          millis: execDate.getTime(),
          utcString: execDate.toUTCString(),
          localString: execDate.toLocaleString(),
          relative: relStr,
        });
      }

      current.setMinutes(current.getMinutes() + 1);
    }

    return {
      isValid: true,
      explanation,
      nextExecutions,
      fields: { minute, hour, dayOfMonth, month, dayOfWeek },
    };
  }
}

export const cronService = new CronService();
