export type CurrencyCode = 'USD' | 'CAD' | 'CAD_FR' | 'GBP' | 'EUR';

export const CURRENCY_OPTIONS: { code: CurrencyCode; label: string; symbol: string; example: string }[] = [
  { code: 'USD', label: 'USD — US Dollar ($)', symbol: '$', example: '$35,000' },
  { code: 'CAD', label: 'CAD — Canadian Dollar ($)', symbol: '$', example: '$35,000' },
  { code: 'CAD_FR', label: 'CAD (FR) — French Canadian (35 000 $)', symbol: '$', example: '35 000 $' },
  { code: 'GBP', label: 'GBP — British Pound Sterling (£)', symbol: '£', example: '£35,000' },
  { code: 'EUR', label: 'EUR — Euro (€)', symbol: '€', example: '€35,000' },
];

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
 * Formats date string into consistent YYYY-MM-DD format
 */
export function formatDateConsistent(dateStr: string | undefined | null): string {
  if (!dateStr || dateStr.trim() === '' || dateStr.trim() === '-') return '-';
  const clean = dateStr.trim();
  
  // If already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
    return clean;
  }

  // If M/D/YYYY or MM/DD/YYYY or M-D-YYYY
  const slashParts = clean.split(/[\/\-]/);
  if (slashParts.length === 3) {
    if (slashParts[0].length === 4) {
      // YYYY/MM/DD
      const year = slashParts[0];
      const month = slashParts[1].padStart(2, '0');
      const day = slashParts[2].padStart(2, '0');
      return `${year}-${month}-${day}`;
    } else if (slashParts[2].length === 4) {
      // M/D/YYYY or D/M/YYYY (standard US spreadsheet format M/D/YYYY)
      const month = slashParts[0].padStart(2, '0');
      const day = slashParts[1].padStart(2, '0');
      const year = slashParts[2];
      return `${year}-${month}-${day}`;
    }
  }

  // If valid parseable date
  const parsed = new Date(clean);
  if (!isNaN(parsed.getTime())) {
    const year = parsed.getUTCFullYear();
    const month = String(parsed.getUTCMonth() + 1).padStart(2, '0');
    const day = String(parsed.getUTCDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  return clean;
}
