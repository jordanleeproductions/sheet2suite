import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Sheet2Suite Dynamic Subdomain & Multi-Product Proxy Engine [LIFE-5]
 * Handles zero-cost DNS wildcard & subdomain routing for the entire Sheet2Suite ecosystem:
 * - vow.sheet2suite.com -> /vow (Sheet2Vow)
 * - build.sheet2suite.com -> /build (Sheet2Build)
 * - finance.sheet2suite.com -> /finance (Sheet2Finance)
 * - activate.sheet2suite.com -> /activate (Universal Activation Engine)
 * - sheet2suite.com -> / (Parent Suite Showcase & Product Hub)
 */
export function proxy(req: NextRequest) {
  const url = req.nextUrl;
  const hostname = req.headers.get('host') || '';

  // Skip static assets, Next.js internal bundles, and shared API routes
  if (
    url.pathname.startsWith('/_next') ||
    url.pathname.startsWith('/api') ||
    url.pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // Extract primary subdomain from hostname (e.g., 'vow' from 'vow.sheet2suite.com' or 'vow.localhost:3000')
  const hostParts = hostname.split(':')[0].split('.');
  
  // Check for multi-level domain (e.g., 'vow.sheet2suite.com' or 'vow.localhost')
  if (hostParts.length >= 2) {
    const subdomain = hostParts[0].toLowerCase();

    // Ignore 'www' or root hostnames
    if (subdomain !== 'www' && subdomain !== 'localhost' && subdomain !== 'sheet2suite') {
      // If the current path doesn't already start with the subdomain segment, rewrite to it
      if (!url.pathname.startsWith(`/${subdomain}`)) {
        return NextResponse.rewrite(new URL(`/${subdomain}${url.pathname}`, req.url));
      }
    }
  }

  return NextResponse.next();
}

// Backwards compatibility alias
export const middleware = proxy;

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
