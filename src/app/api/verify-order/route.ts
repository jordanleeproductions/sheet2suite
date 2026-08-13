import { NextRequest } from 'next/server';
import { LicenseValidator } from '@/lib/core/activation/licenseValidator';
import { apiResponse } from '@/lib/core/apiResponse';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, orderId } = body;

    const validation = await LicenseValidator.validateLicense({
      email,
      orderId,
      productCode: 'SHEET2VOW',
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
      packageTier: validation.entitledProducts.length > 1 ? 'Sheet2Suite Master Pass (All Apps)' : 'Sheet2Vow Master Wedding Planner Suite',
      entitledProducts: validation.entitledProducts,
      licensedSheets: validation.entitledProducts.length,
      isVerified: true,
      message: 'Etsy purchase verified successfully!',
    });
  } catch (error: any) {
    console.error('Error in /api/verify-order:', error);
    return apiResponse.error('Failed to verify Etsy order. Please try again.');
  }
}
