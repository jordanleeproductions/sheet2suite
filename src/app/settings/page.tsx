'use client';

import React, { Suspense } from 'react';
import Sheet2VowDashboard from '@/app/vow/page';

export default function SettingsRoutePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', background: 'var(--color-bg, #0B1120)' }} />}>
      <Sheet2VowDashboard initialTab="settings" />
    </Suspense>
  );
}
