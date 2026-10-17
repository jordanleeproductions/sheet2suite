import { NextResponse } from 'next/server';
import { APP_VERSION, BUILD_TIMESTAMP, BUILD_ISO } from '@/lib/buildInfo';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

/**
 * GET /api/version
 * Lightweight, uncached endpoint exposing the current server-side deployment version and timestamp.
 * Polled by client sessions to notify users when a new production release is available.
 */
export async function GET() {
  return NextResponse.json(
    {
      version: APP_VERSION,
      buildTimestamp: BUILD_TIMESTAMP,
      buildIso: BUILD_ISO,
      timestamp: Date.now(),
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        Pragma: 'no-cache',
        Expires: '0',
      },
    }
  );
}
