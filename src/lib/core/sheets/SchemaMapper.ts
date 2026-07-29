/**
 * SchemaMapper - Generic bi-directional header <-> JSON mapper for Sheet2 Suite apps.
 * Converts raw 2D arrays (values[][]) from Google Sheets API to typed TypeScript models and vice-versa.
 */

export interface SheetSchemaConfig<T> {
  sheetName: string;
  primaryKey: keyof T;
  headerMap: Record<keyof T, string>; // Maps jsonKey -> "Spreadsheet Column Header Name"
}

export class SchemaMapper<T extends Record<string, any>> {
  private config: SheetSchemaConfig<T>;

  constructor(config: SheetSchemaConfig<T>) {
    this.config = config;
  }

  /**
   * Translates 2D spreadsheet values (rows) into array of typed objects.
   * Assumes row 0 contains header names.
   */
  fromSheetRows(rows: string[][]): T[] {
    if (!rows || rows.length < 2) return [];

    const headers = rows[0].map(h => (h || '').trim());
    const dataRows = rows.slice(1);

    // Build reverse map: "Column Header" -> jsonKey
    const reverseHeaderMap: Record<string, keyof T> = {};
    for (const [jsonKey, headerName] of Object.entries(this.config.headerMap)) {
      reverseHeaderMap[headerName] = jsonKey as keyof T;
    }

    return dataRows.map(row => {
      const item: Partial<T> = {};
      headers.forEach((headerName, colIndex) => {
        const jsonKey = reverseHeaderMap[headerName];
        if (jsonKey) {
          item[jsonKey] = (row[colIndex] || '') as any;
        }
      });
      return item as T;
    });
  }

  /**
   * Translates array of typed objects into 2D spreadsheet values ready for API batch update.
   */
  toSheetRows(items: T[]): string[][] {
    const keys = Object.keys(this.config.headerMap) as (keyof T)[];
    const headers = keys.map(key => this.config.headerMap[key]);

    const dataRows = items.map(item => {
      return keys.map(key => {
        const val = item[key];
        if (val === undefined || val === null) return '';
        return String(val);
      });
    });

    return [headers, ...dataRows];
  }
}
