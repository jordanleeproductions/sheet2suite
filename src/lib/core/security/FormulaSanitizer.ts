/**
 * FormulaSanitizer - Protection mechanism against CSV/Formula Excel Injections
 * Sanitizes user input text before writing to Google Sheets to prevent formula execution (=, +, -, @).
 */

export class FormulaSanitizer {
  /**
   * Sanitizes a string input to ensure it cannot be executed as a spreadsheet formula.
   */
  static sanitize(input: unknown): unknown {
    if (typeof input !== 'string') return input;
    const trimmed = input.trim();
    
    // Check if input begins with formula trigger characters
    if (/^[=+@-]/.test(trimmed)) {
      // Escape by prefixing with single quote '
      return `'${input}`;
    }
    
    return input;
  }

  /**
   * Sanitizes an object's string properties recursively before dispatching writes.
   */
  static sanitizeObject<T extends Record<string, any>>(obj: T): T {
    const sanitized: Record<string, any> = {};
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string') {
        sanitized[key] = this.sanitize(value);
      } else if (Array.isArray(value)) {
        sanitized[key] = value.map(v => typeof v === 'object' && v !== null ? this.sanitizeObject(v) : this.sanitize(v));
      } else if (typeof value === 'object' && value !== null) {
        sanitized[key] = this.sanitizeObject(value);
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized as T;
  }
}
