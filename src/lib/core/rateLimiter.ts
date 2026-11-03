import { NextRequest } from 'next/server';

interface RateLimitEntry {
  timestamps: number[];
}

const globalRateStore = globalThis as unknown as {
  __s2s_rate_limit_store?: Map<string, RateLimitEntry>;
};

function getStore(): Map<string, RateLimitEntry> {
  if (!globalRateStore.__s2s_rate_limit_store) {
    globalRateStore.__s2s_rate_limit_store = new Map<string, RateLimitEntry>();
  }
  return globalRateStore.__s2s_rate_limit_store;
}

export function extractClientIp(req: NextRequest | Request): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = req.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;
  return '127.0.0.1';
}

/**
 * Sliding-window rate limiter keyed by bucket + client IP.
 */
export function checkRateLimit(
  req: NextRequest | Request,
  bucket: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; retryAfterSeconds: number } {
  const store = getStore();
  const now = Date.now();
  const ip = extractClientIp(req);
  const key = `${bucket}:${ip}`;

  // Periodic cleanup when map grows large
  if (store.size > 5000) {
    for (const [k, v] of store.entries()) {
      const active = v.timestamps.filter((t) => now - t < windowMs);
      if (active.length === 0) {
        store.delete(k);
      } else {
        v.timestamps = active;
      }
    }
  }

  const entry = store.get(key) || { timestamps: [] };
  entry.timestamps = entry.timestamps.filter((t) => now - t < windowMs);

  if (entry.timestamps.length >= maxRequests) {
    const oldest = entry.timestamps[0] || now;
    const retryAfterSeconds = Math.max(1, Math.ceil((oldest + windowMs - now) / 1000));
    store.set(key, entry);
    return {
      allowed: false,
      remaining: 0,
      retryAfterSeconds,
    };
  }

  entry.timestamps.push(now);
  store.set(key, entry);

  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - entry.timestamps.length),
    retryAfterSeconds: 0,
  };
}
