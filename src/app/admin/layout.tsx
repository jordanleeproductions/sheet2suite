import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sheet2Suite Admin Portal',
  description: 'Internal admin database and workspace management portal for Sheet2Suite.',
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
