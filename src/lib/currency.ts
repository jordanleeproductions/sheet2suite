export type CurrencyCode = 'USD' | 'CAD' | 'CAD_FR' | 'GBP' | 'EUR';

export const CURRENCY_OPTIONS: { code: CurrencyCode; label: string; symbol: string; example: string }[] = [
  { code: 'USD', label: 'USD — US Dollar ($)', symbol: '$', example: '$35,000' },
  { code: 'CAD', label: 'CAD — Canadian Dollar ($)', symbol: '$', example: '$35,000' },
  { code: 'CAD_FR', label: 'CAD (FR) — French Canadian (35 000 $)', symbol: '$', example: '35 000 $' },
  { code: 'GBP', label: 'GBP — British Pound Sterling (£)', symbol: '£', example: '£35,000' },
  { code: 'EUR', label: 'EUR — Euro (€)', symbol: '€', example: '€35,000' },
];

export function getCurrencySymbol(currency: string = 'USD'): string {
  const found = CURRENCY_OPTIONS.find(opt => opt.code === currency);
  return found?.symbol || '$';
}

export function formatCurrency(amount: number | undefined | null, currency: string = 'USD', forceDecimals?: boolean): string {
  const num = Number(amount) || 0;
  // If amount has cents (e.g. 100.5 or 100.50) or forceDecimals is requested, show 2 decimal places
  const hasCents = forceDecimals !== undefined ? forceDecimals : !Number.isInteger(num);
  const minDigits = hasCents ? 2 : 0;
  const maxDigits = hasCents ? 2 : 0;

  switch (currency) {
    case 'GBP':
      return `£${num.toLocaleString('en-GB', { minimumFractionDigits: minDigits, maximumFractionDigits: maxDigits })}`;
    case 'EUR':
      return `€${num.toLocaleString('de-DE', { minimumFractionDigits: minDigits, maximumFractionDigits: maxDigits })}`;
    case 'CAD_FR':
      return `${num.toLocaleString('fr-CA', { minimumFractionDigits: minDigits, maximumFractionDigits: maxDigits })} $`;
    case 'CAD':
      return `$${num.toLocaleString('en-CA', { minimumFractionDigits: minDigits, maximumFractionDigits: maxDigits })}`;
    case 'USD':
    default:
      return `$${num.toLocaleString('en-US', { minimumFractionDigits: minDigits, maximumFractionDigits: maxDigits })}`;
  }
}

/**
 * Parses any date value (including Excel/Google Sheets serial date numbers like 46276)
 * into a canonical YYYY-MM-DD string.
 */
export function parseDateOrSerial(dateVal: any): string {
  if (dateVal === null || dateVal === undefined) return '';
  const str = String(dateVal).trim();
  if (!str || str === '-' || str.toLowerCase() === 'invalid date') return '';

  // 1. Check if it's an Excel / Google Sheets numeric serial date
  // Typical dates between 1980 and 2100 fall in the serial range 29221 to 73415
  const num = Number(str);
  if (!isNaN(num) && num >= 1000 && num <= 100000) {
    // 25569 days between Excel epoch (1899-12-30) and Unix epoch (1970-01-01)
    const ms = Math.round((num - 25569) * 86400 * 1000);
    const d = new Date(ms);
    if (!isNaN(d.getTime())) {
      const year = d.getUTCFullYear();
      const month = String(d.getUTCMonth() + 1).padStart(2, '0');
      const day = String(d.getUTCDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
  }

  // 2. Check if already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    return str;
  }

  // 3. Handle M/D/YYYY, MM/DD/YYYY, or YYYY/MM/DD
  const slashParts = str.split(/[\/\-]/);
  if (slashParts.length === 3) {
    if (slashParts[0].length === 4) {
      // YYYY/MM/DD
      const year = slashParts[0];
      const month = slashParts[1].padStart(2, '0');
      const day = slashParts[2].padStart(2, '0');
      return `${year}-${month}-${day}`;
    } else if (slashParts[2].length === 4) {
      // MM/DD/YYYY or M/D/YYYY
      const month = slashParts[0].padStart(2, '0');
      const day = slashParts[1].padStart(2, '0');
      const year = slashParts[2];
      return `${year}-${month}-${day}`;
    }
  }

  // 4. Fallback for ISO / parsable date strings
  const parsed = new Date(str);
  if (!isNaN(parsed.getTime())) {
    const year = parsed.getUTCFullYear();
    const month = String(parsed.getUTCMonth() + 1).padStart(2, '0');
    const day = String(parsed.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return str;
}

/**
 * Formats date string into consistent YYYY-MM-DD format
 */
export function formatDateConsistent(dateStr: string | undefined | null): string {
  if (!dateStr || dateStr.trim() === '' || dateStr.trim() === '-') return '-';
  const clean = parseDateOrSerial(dateStr);
  return clean || '-';
}

/**
 * Formats date string into consistent MM/DD/YYYY format
 */
export function formatDateToMMDDYYYY(dateStr: string | undefined | null): string {
  if (!dateStr || dateStr.trim() === '' || dateStr.trim() === '-') return '';
  const iso = parseDateOrSerial(dateStr);
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [year, month, day] = iso.split('-');
    return `${month}/${day}/${year}`;
  }
  return dateStr.trim();
}
