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

/**
 * Parses any time value (including Excel/Google Sheets numeric fractions of a day like 0.5833333333333334,
 * datetime serial numbers like 46276.58333, ISO timestamps, and 12h/24h text strings)
 * into a canonical display string (default 12h: "2:00 PM", or 24h: "14:00").
 */
export function parseTimeOrSerial(val: any, format: '12h' | '24h' = '12h'): string {
  if (val === null || val === undefined) return '';
  const str = String(val).trim();
  if (!str || str === '-' || str.toLowerCase() === 'invalid date' || str.toLowerCase() === 'invalid time') return '';

  let hours24 = 0;
  let minutes = 0;
  let hasParsed = false;

  // 1. Numeric check: Excel/Google Sheets fraction of day or datetime serial
  const num = Number(str);
  if (!isNaN(num)) {
    const fraction = num >= 1 ? (num - Math.floor(num)) : num;
    const totalMinutes = Math.round(fraction * 1440) % 1440;
    hours24 = Math.floor(totalMinutes / 60);
    minutes = totalMinutes % 60;
    hasParsed = true;
  }

  // 2. ISO / Datetime string check (e.g. 1899-12-30T14:30:00.000Z or 2026-09-11 14:30:00)
  if (!hasParsed) {
    const isoMatch = str.match(/(?:T|\s)(\d{1,2}):(\d{2})(?::(\d{2}))?/i);
    if (isoMatch) {
      hours24 = parseInt(isoMatch[1], 10);
      minutes = parseInt(isoMatch[2], 10);
      hasParsed = true;
    }
  }

  // 3. Standard time string check (e.g. '02:30 PM', '2:30pm', '14:30', '2 PM', '2:30:00 PM')
  if (!hasParsed) {
    const match = str.match(/^(\d{1,2})(?::(\d{2}))?(?::\d{2})?\s*(am|pm|a\.m\.|p\.m\.)?$/i);
    if (match) {
      let h = parseInt(match[1], 10);
      const m = match[2] ? parseInt(match[2], 10) : 0;
      const meridiem = match[3] ? match[3].replace(/\./g, '').toUpperCase() : undefined;

      if (meridiem === 'PM' && h < 12) h += 12;
      else if (meridiem === 'AM' && h === 12) h = 0;
      else if (!meridiem && h >= 24) h = h % 24;

      hours24 = h;
      minutes = m;
      hasParsed = true;
    }
  }

  if (!hasParsed) {
    return str;
  }

  if (format === '24h') {
    return `${String(hours24).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
  }

  const meridiem = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;
  return `${hours12}:${String(minutes).padStart(2, '0')} ${meridiem}`;
}

