import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, orderId } = body;

    const trimmedEmail = (email || '').trim();
    const trimmedOrderId = (orderId || '').trim();

    if (!trimmedEmail || !trimmedOrderId) {
      return NextResponse.json(
        { success: false, error: 'Please enter both your Email Address and Etsy Order ID.' },
        { status: 400 }
      );
    }

    // Basic email format check
    if (!trimmedEmail.includes('@') || !trimmedEmail.includes('.')) {
      return NextResponse.json(
        { success: false, error: 'Please enter a valid Email Address.' },
        { status: 400 }
      );
    }

    // Simulate 350ms Etsy API verification network latency
    await new Promise((resolve) => setTimeout(resolve, 350));

    // Mock successful Etsy Order Verification payload
    return NextResponse.json({
      success: true,
      orderId: trimmedOrderId.toUpperCase(),
      email: trimmedEmail.toLowerCase(),
      customerName: trimmedEmail.split('@')[0].replace('.', ' ').replace(/^./, (c: string) => c.toUpperCase()),
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
