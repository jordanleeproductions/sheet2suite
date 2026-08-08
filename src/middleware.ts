import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Sheet2Suite Unified Subdomain Middleware Engine [LIFE-5]
 * Handles $0-cost DNS subdomain routing for the Sheet2Suite family:
 * - vow.sheet2suite.com -> Sheet2Vow Digital Wedding Planner
 * - stay.sheet2suite.com -> Sheet2Stay Vacation Rental Tracker
 * - finances.sheet2suite.com -> Sheet2Finances Personal Budget Ledger
 * - events.sheet2suite.com -> Sheet2Events Party & Banquet Planner
 * - activate.sheet2suite.com -> Shared Activation Portal
 */
export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Skip static assets, _next internal files, and API routes
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // 1. activate.sheet2suite.com -> Route to /activate
  if (hostname.startsWith('activate.')) {
    if (!url.pathname.startsWith('/activate')) {
      return NextResponse.rewrite(new URL(`/activate${url.pathname}`, req.url));
    }
  }

  // 2. vow.sheet2suite.com -> Route to / (Sheet2Vow core)
  if (hostname.startsWith('vow.')) {
    return NextResponse.next();
  }

  // 3. stay.sheet2suite.com -> Route to /activate with pre-selected SKU
  if (hostname.startsWith('stay.')) {
    if (!url.pathname.startsWith('/activate')) {
      return NextResponse.rewrite(new URL(`/activate?product=SHEET2HOME`, req.url));
    }
  }

  // 4. finances.sheet2suite.com -> Route to /activate with pre-selected SKU
  if (hostname.startsWith('finances.')) {
    if (!url.pathname.startsWith('/activate')) {
      return NextResponse.rewrite(new URL(`/activate?product=SHEET2FINANCE`, req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
