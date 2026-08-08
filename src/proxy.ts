import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Sheet2Suite Unified Subdomain & Path Proxy Engine [LIFE-5]
 * Handles $0-cost DNS subdomain routing & path parity for the Sheet2Suite family:
 * - vow.sheet2suite.com or /vow -> Sheet2Vow Digital Wedding Planner
 * - activate.sheet2suite.com or /activate -> Shared Activation Engine
 * - sheet2suite.com -> Root Parent Platform Showcase & Suite Hub
 */
export function proxy(req: NextRequest) {
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

  // 2. vow.sheet2suite.com -> Route to /vow
  if (hostname.startsWith('vow.')) {
    if (!url.pathname.startsWith('/vow')) {
      return NextResponse.rewrite(new URL(`/vow${url.pathname}`, req.url));
    }
  }

  return NextResponse.next();
}

// Backwards compatibility alias
export const middleware = proxy;

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
