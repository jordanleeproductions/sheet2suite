import { FormulaSanitizer } from '../security/FormulaSanitizer';

/**
 * CellGuardrails - Safety checks and formula protection for Sheet2 Suite spreadsheets.
 */

export class CellGuardrails {
  /**
   * Protected tab names where non-technical user writes must be restricted (e.g. summary formulas).
   */
  private static PROTECTED_TABS = ['DASHBOARD', 'Calc_Data'];

  /**
   * Validates if a tab is writable or if it contains protected formula blocks.
   */
  static isWritableTab(tabName: string): boolean {
    return !this.PROTECTED_TABS.includes(tabName.toUpperCase());
  }

  /**
   * Prepares and sanitizes data payload before dispatching updates to Google Sheets API.
   */
  static preparePayload<T extends Record<string, any>>(data: T[]): T[] {
    return data.map(item => FormulaSanitizer.sanitizeObject(item));
  }
}
