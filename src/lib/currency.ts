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
