import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sheet2Vow',
  description: 'Your all-in-one Google Sheets wedding planner — guests, seating, budget, timeline, vendors, music & more.',
  icons: {
    icon: '/spreadsheet-icon.svg',
    shortcut: '/spreadsheet-icon.svg',
  },
};

export default function VowLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
