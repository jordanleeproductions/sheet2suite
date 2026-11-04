import { NextRequest, NextResponse } from 'next/server';
import {
  PRODUCT_VERSIONS,
  getProductBuildInfo,
  normalizeProductId,
} from '@/lib/buildInfo';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const requestedProduct = searchParams.get('product');
  const productId = normalizeProductId(requestedProduct);
  const info = getProductBuildInfo(productId);

  return NextResponse.json(
    {
      product: info.id,
      name: info.name,
      version: info.version,
      buildTimestamp: info.buildTimestamp,
      buildEpoch: info.buildEpoch,
      buildIso: info.buildIso,
      products: PRODUCT_VERSIONS,
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
      },
    }
  );
}
