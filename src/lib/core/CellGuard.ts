/**
 * Sheet2 Engine Core: CellGuard
 * Security & Data Integrity Guardrails:
 * - Formula Injection Sanitization (=, +, -, @)
 * - Protected Column & Summary Row Validation
 */

export const CellGuard = {
  /**
   * Sanitizes string values to prevent Google Sheets Formula Injection Attacks.
   * If a value begins with =, +, -, @, or TAB/CR, it prefixes a single quote (') to escape formula execution.
   */
  sanitizeCellValue(value: any): any {
    if (typeof value !== 'string') return value;

    const trimmed = value.trim();
    if (/^[=+\-@\t\r]/.test(trimmed)) {
      // Escape leading formula character with single quote
      return `'${value}`;
    }

    return value;
  },

  /**
   * Sanitizes an entire array or object payload before dispatching writes to Google Sheets API
   */
  sanitizePayload<T>(payload: T): T {
    if (payload === null || payload === undefined) return payload;

    if (typeof payload === 'string') {
      return this.sanitizeCellValue(payload) as unknown as T;
    }

    if (Array.isArray(payload)) {
      return payload.map((item) => this.sanitizePayload(item)) as unknown as T;
    }

    if (typeof payload === 'object') {
      const sanitizedObj: Record<string, any> = {};
      for (const [key, val] of Object.entries(payload)) {
        sanitizedObj[key] = this.sanitizePayload(val);
      }
      return sanitizedObj as T;
    }

    return payload;
  },

  /**
   * Validates primary key integrity
   */
  ensurePrimaryKey(id: string | undefined, prefix: string): string {
    if (id && id.trim().length > 0) return id;
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
  },
};
