/**
 * Strictly validates that a target origin belongs to an official Sheet2Suite domain,
 * the specific configured Firebase/Cloud Run project host, or local development.
 *
 * SECURITY [VULN-13]: Never allow wildcard multi-tenant cloud suffixes such as
 * "*.web.app", "*.firebaseapp.com", "*.run.app", or "*.hosted.app", since any third party
 * can register an arbitrary subdomain on those public hosting platforms.
 */

const ALLOWED_FIREBASE_HOSTS = new Set([
  'sheet2suite.web.app',
  'sheet2suite.firebaseapp.com',
  'sheet2suite-7036e.web.app',
  'sheet2suite-7036e.firebaseapp.com',
]);

export function isValidAppOrigin(originStr?: string | null, currentWindowOrigin?: string | null): boolean {
  if (!originStr) return false;

  if (currentWindowOrigin && originStr === currentWindowOrigin) {
    return true;
  }

  try {
    const url = new URL(originStr);
    const host = url.hostname.toLowerCase();

    // 1. Primary custom domain and its subdomains
    if (host === 'sheet2suite.com' || host.endsWith('.sheet2suite.com')) {
      return url.protocol === 'https:' || process.env.NODE_ENV !== 'production';
    }

    // 2. Explicit project-owned Firebase hosting domains (never wildcard *.web.app)
    if (ALLOWED_FIREBASE_HOSTS.has(host)) {
      return url.protocol === 'https:';
    }

    // 3. Explicit NEXT_PUBLIC_APP_URL host if configured in environment
    const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL;
    if (configuredAppUrl) {
      try {
        const configuredHost = new URL(configuredAppUrl).hostname.toLowerCase();
        if (host === configuredHost) {
          return true;
        }
      } catch {
        // Ignore malformed NEXT_PUBLIC_APP_URL
      }
    }

    // 4. Local development origins (only permitted outside production or when current origin is local)
    if (host === 'localhost' || host === '127.0.0.1') {
      if (process.env.NODE_ENV !== 'production') return true;
      if (currentWindowOrigin && (currentWindowOrigin.includes('localhost') || currentWindowOrigin.includes('127.0.0.1'))) {
        return true;
      }
      return false;
    }

    return false;
  } catch {
    return false;
  }
}

export function escapeHtmlText(input: string): string {
  return String(input || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
