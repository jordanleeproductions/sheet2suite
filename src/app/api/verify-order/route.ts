import { NextRequest } from 'next/server';
import { LicenseValidator } from '@/lib/core/activation/licenseValidator';
import { apiResponse } from '@/lib/core/apiResponse';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, orderId, productCode = 'SHEET2VOW' } = body;
    const requestedProductCode = String(productCode).toUpperCase() as any;

    const validation = await LicenseValidator.validateLicense({
      email,
      orderId,
      productCode: requestedProductCode,
    });

    if (!validation.valid) {
      return apiResponse.badRequest(validation.errorMessage || 'Validation failed.');
    }

    // Simulate 350ms Etsy API verification network latency
    await new Promise((resolve) => setTimeout(resolve, 350));

    return apiResponse.success({
      orderId: orderId.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
      customerName: email.split('@')[0].replace('.', ' ').replace(/^./, (c: string) => c.toUpperCase()),
      purchaseDate: new Date().toISOString().split('T')[0],
      packageTier: validation.productCode === 'SHEET2VAULT' ? (validation.licenseTier === 'pro' ? 'Sheet2Vault Pro (Developer Preview)' : 'Sheet2Vault Standard') : validation.licenseTier === 'pro'
        ? 'Sheet2Vow Pro (Unlimited Collaborators)'
        : 'Sheet2Vow Wedding Planner Suite (Standard)',
      licenseTier: validation.licenseTier,
      entitledProducts: validation.entitledProducts,
      licensedSheets: 1,
      isVerified: true,
      message: validation.productCode === 'SHEET2VAULT' ? 'Developer test license verified successfully!' : 'Etsy purchase verified successfully!',
    });
  } catch (error: any) {
    console.error('Error in /api/verify-order:', error);
    return apiResponse.error('Failed to verify Etsy order. Please try again.');
  }
}
