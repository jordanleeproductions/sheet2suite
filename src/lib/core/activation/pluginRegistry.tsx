'use client';

import React from 'react';
import VowSetupWizard from '@/products/vow/setup/VowSetupWizard';
import { ProductSetupPluginProps } from './types';

/**
 * Universal Product Setup Plugin Registry
 * Dynamically resolves and mounts the domain-specific setup wizard for any Sheet2Suite product.
 */
export function ProductSetupPluginRenderer(props: ProductSetupPluginProps) {
  const code = (props.productCode || 'SHEET2VOW').toUpperCase();

  switch (code) {
    case 'SHEET2VOW':
    case 'VOW':
      return <VowSetupWizard {...props} />;

    default:
      // Fallback for upcoming suite apps (Sheet2Build, Sheet2Finance, etc.)
      return (
        <div style={{ padding: '1.5rem', backgroundColor: 'var(--color-bg-subtle)', borderRadius: 'var(--border-radius-md)', border: '1px solid var(--color-border)', textAlign: 'center' }}>
          <h3 style={{ margin: '0 0 0.5rem 0', fontFamily: 'var(--font-mono)' }}>{props.productName || code} Setup</h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--color-muted)', marginBottom: '1.25rem' }}>
            Ready to provision your {props.productName || code} digital canvas into your Google Drive folder:
            <br />
            <code>{props.driveFolder}</code>
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={props.onBack}
              style={{ padding: '0.65rem 1.25rem', backgroundColor: 'transparent', border: '1px solid var(--color-border)', borderRadius: 'var(--border-radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-mono)' }}
            >
              Back
            </button>
            <button
              type="button"
              disabled={props.isSubmitting}
              onClick={() => props.onComplete({})}
              style={{ padding: '0.65rem 1.5rem', backgroundColor: 'var(--color-primary)', color: 'var(--color-on-primary)', border: 'none', borderRadius: 'var(--border-radius-sm)', cursor: 'pointer', fontFamily: 'var(--font-mono)', fontWeight: 800 }}
            >
              {props.isSubmitting ? 'PROVISIONING...' : 'PROVISION & LAUNCH'}
            </button>
          </div>
        </div>
      );
  }
}
