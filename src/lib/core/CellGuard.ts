/**
 * Sheet2 Engine Core: CellGuard
 * Security & Data Integrity Guardrails:
 * - Formula Injection Sanitization (=, +, -, @)
 * - Dangerous Nested Function Blocking (IMPORTXML, IMPORTHTML, IMPORTRANGE, WEBSERVICE, etc.)
 * - Untrusted Public Guest Input Escaping
 */

const DANGEROUS_FORMULA_FUNCTIONS =
  /\b(IMPORTXML|IMPORTHTML|IMPORTDATA|IMPORTFEED|IMPORTRANGE|WEBSERVICE|IMAGE|HYPERLINK|GOOGLEFINANCE|QUERY|DDE)\s*\(/i;

export const CellGuard = {
  /**
   * Sanitizes string values to prevent Google Sheets Formula Injection Attacks.
   * Blocks nested data-exfiltration formulas even when wrapped inside =IF() or =SUM().
   */
  sanitizeCellValue(value: any): any {
    if (typeof value !== 'string') return value;

    const trimmed = value.trim();

    if (trimmed.startsWith("'")) {
      return value;
    }

    // Never allow dangerous external-fetch or exfiltration functions in any formula
    if (DANGEROUS_FORMULA_FUNCTIONS.test(trimmed)) {
      return `'${trimmed}`;
    }

    // Allow safe internal arithmetic/lookup formulas that do not contain dangerous functions
    if (/^=(IF|SUM|SUMIF|ARRAYFORMULA|VLOOKUP|AVERAGE|COUNT)\b/i.test(trimmed)) {
      return trimmed;
    }

    if (/^[=+\-@\t\r]/.test(trimmed)) {
      // Prefix single quote directly onto trimmed string so leading whitespace cannot bypass escaping
      return `'${trimmed}`;
    }

    // Escape currency-like text strings (e.g. "$200", "€50", "£100") so Google Sheets USER_ENTERED
    // does not auto-coerce them into raw numeric cells in unformatted text columns
    if (/^[$€£¥]\s*\d/.test(trimmed)) {
      return `'${trimmed}`;
    }

    return value;
  },

  /**
   * Strictly sanitizes untrusted guest/public inputs (e.g. guestbook uploads, song requests).
   * Escapes ALL leading formula characters without any formula whitelist.
   */
  sanitizeUntrustedValue(value: any): any {
    if (typeof value !== 'string') return value;
    const trimmed = value.trim();
    if (trimmed.startsWith("'")) return value;
    if (/^[=+\-@\t\r]/.test(trimmed) || DANGEROUS_FORMULA_FUNCTIONS.test(trimmed)) {
      return `'${trimmed}`;
    }
    if (/^[$€£¥]\s*\d/.test(trimmed)) {
      return `'${trimmed}`;
    }
    return value;
  },

  /**
   * Recursively sanitizes untrusted guest/public payloads.
   */
  sanitizeUntrustedInput<T>(payload: T): T {
    if (payload === null || payload === undefined) return payload;

    if (typeof payload === 'string') {
      return this.sanitizeUntrustedValue(payload) as unknown as T;
    }

    if (Array.isArray(payload)) {
      return payload.map((item) => this.sanitizeUntrustedInput(item)) as unknown as T;
    }

    if (typeof payload === 'object') {
      const sanitizedObj: Record<string, any> = {};
      for (const [key, val] of Object.entries(payload)) {
        sanitizedObj[key] = this.sanitizeUntrustedInput(val);
      }
      return sanitizedObj as T;
    }

    return payload;
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
