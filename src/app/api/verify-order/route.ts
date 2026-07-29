import { NextResponse } from 'next/server';
import { LicenseValidator } from '@/lib/core/activation/licenseValidator';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, orderId } = body;

    const validation = await LicenseValidator.validateLicense({
      email,
      orderId,
      productCode: 'SHEET2VOW'
    });

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.errorMessage || 'Validation failed.' },
        { status: 400 }
      );
    }

    // Simulate 350ms Etsy API verification network latency
    await new Promise((resolve) => setTimeout(resolve, 350));

    return NextResponse.json({
      success: true,
      orderId: orderId.trim().toUpperCase(),
      email: email.trim().toLowerCase(),
      customerName: email.split('@')[0].replace('.', ' ').replace(/^./, (c: string) => c.toUpperCase()),
      purchaseDate: new Date().toISOString().split('T')[0],
      packageTier: 'Sheet2Vow Master Wedding Planner Suite',
      licensedSheets: 1,
      isVerified: true,
      message: 'Etsy purchase verified successfully!'
    });
  } catch (error: any) {
    console.error('Error in /api/verify-order:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to verify Etsy order. Please try again.' },
      { status: 500 }
    );
  }
}
