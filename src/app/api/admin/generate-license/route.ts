import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { requireAdminAuth } from '@/lib/auth/adminAuth';
import { LocalLicensingDb } from '@/lib/db/licensingDb';
import { LicenseTier } from '@/types/licensing';

export const VALID_PRODUCTS = [
  'SHEET2VOW',
  'SHEET2VAULT',
  'SHEET2FINANCE',
  'SHEET2HOME',
] as const;

export type ProductCode = typeof VALID_PRODUCTS[number];

/**
 * Generates an uppercase, human-readable cryptographically secure license key.
 * Format: S2S-[PREFIX]-[XXXX]-[XXXX]
 */
async function generateUniqueKey(prefix: string = 'DEV'): Promise<string> {
  const cleanPrefix = (prefix || 'DEV')
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8) || 'DEV';

  for (let attempt = 0; attempt < 10; attempt++) {
    const p1 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const p2 = crypto.randomBytes(2).toString('hex').toUpperCase();
    const candidate = `S2S-${cleanPrefix}-${p1}-${p2}`;

    const existing = await LocalLicensingDb.getLicenseByKeyAsync(candidate);
    if (!existing) {
      return candidate;
    }
  }

  // Fallback with timestamp chunk to guarantee uniqueness
  const fallback = crypto.randomBytes(4).toString('hex').toUpperCase();
  return `S2S-${cleanPrefix}-${fallback}-${Date.now().toString(36).toUpperCase().slice(-4)}`;
}

export async function POST(req: NextRequest) {
  const authError = requireAdminAuth(req);
  if (authError) return authError;

  try {
    const body = await req.json().catch(() => ({}));
    const {
      prefix = 'DEV',
      entitledProducts = [],
      purchaserEmail = '',
      licenseTier = 'developer',
      singleUse = true,
      notes = '',
    } = body;

    // Validate products array
    if (!Array.isArray(entitledProducts) || entitledProducts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Please choose at least one product to entitle with this license key.' },
        { status: 400 }
      );
    }

    const cleanProducts = entitledProducts
      .map((p) => String(p).trim().toUpperCase())
      .filter((p) => VALID_PRODUCTS.includes(p as any));

    if (cleanProducts.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Invalid product selection. Valid products include SHEET2VOW and SHEET2VAULT.' },
        { status: 400 }
      );
    }

    const licenseKey = await generateUniqueKey(prefix);
    const cleanEmail = purchaserEmail ? String(purchaserEmail).trim().toLowerCase() : '';
    const cleanTier: LicenseTier | string = licenseTier || 'developer';
    const cleanNotes = notes ? String(notes).trim() : `Admin-generated ${prefix} key`;

    const primaryProduct = cleanProducts[0];
    const isBundle = cleanProducts.length > 1;
    const sku = isBundle
      ? `S2S-BUNDLE-${cleanProducts.join('-')}`
      : `S2S-${primaryProduct}-${String(cleanTier).toUpperCase()}`;

    const now = new Date().toISOString();

    const licenseDoc = await LocalLicensingDb.saveLicenseAsync({
      licenseKey,
      orderId: licenseKey, // Matches orderId so it can be redeemed seamlessly in the /activate portal
      purchaserEmail: cleanEmail,
      sku,
      status: 'active',
      licenseTier: cleanTier as any,
      entitledProducts: cleanProducts,
      maxWorkspaces: 1, // Single-use guarantee
      singleUse: singleUse !== false,
      notes: cleanNotes,
      createdAt: now,
      updatedAt: now,
    } as any);

    return NextResponse.json({
      success: true,
      license: licenseDoc,
      licenseKey,
      activationUrl: `/activate?orderId=${encodeURIComponent(licenseKey)}`,
      message: `Successfully generated ${singleUse !== false ? 'single-use' : 'multi-use'} license key: ${licenseKey}`,
    });
  } catch (error: any) {
    console.error('Error generating license key:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to generate license key.' },
      { status: 500 }
    );
  }
}
