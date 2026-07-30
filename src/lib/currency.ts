export type CurrencyCode = 'USD' | 'CAD' | 'CAD_FR' | 'GBP' | 'EUR';

export const CURRENCY_OPTIONS: { code: CurrencyCode; label: string; symbol: string; example: string }[] = [
  { code: 'USD', label: 'USD — US Dollar ($)', symbol: '$', example: '$35,000' },
  { code: 'CAD', label: 'CAD — Canadian Dollar ($)', symbol: '$', example: '$35,000' },
  { code: 'CAD_FR', label: 'CAD (FR) — French Canadian (35 000 $)', symbol: '$', example: '35 000 $' },
  { code: 'GBP', label: 'GBP — British Pound Sterling (£)', symbol: '£', example: '£35,000' },
  { code: 'EUR', label: 'EUR — Euro (€)', symbol: '€', example: '€35,000' },
];

export function formatCurrency(amount: number | undefined | null, currency: string = 'USD'): string {
  const val = Math.round(amount || 0);
  switch (currency) {
    case 'GBP':
      return `£${val.toLocaleString('en-GB')}`;
    case 'EUR':
      return `€${val.toLocaleString('de-DE')}`;
    case 'CAD_FR':
      return `${val.toLocaleString('fr-CA')} $`;
    case 'CAD':
      return `$${val.toLocaleString('en-CA')}`;
    case 'USD':
    default:
      return `$${val.toLocaleString('en-US')}`;
  }
}
