import { NextRequest, NextResponse } from 'next/server';
import {
  validateAdminKey,
  verifyAdminAuth,
  ADMIN_SESSION_COOKIE,
  getConfiguredAdminEmails,
} from '@/lib/auth/adminAuth';
import { checkRateLimit } from '@/lib/core/rateLimiter';

/**
 * GET /api/admin/auth
 * Checks whether the current request is authenticated as an admin.
 * Returns admin identity metadata if authorized.
 */
export async function GET(req: NextRequest) {
  const auth = verifyAdminAuth(req);
  return NextResponse.json({
    authenticated: auth.authorized,
    user: auth.adminUser || (auth.adminEmail ? { email: auth.adminEmail } : null),
    authMethod: auth.authMethod,
    authorizedEmails: auth.authorized ? getConfiguredAdminEmails() : [],
  });
}

/**
 * POST /api/admin/auth
 * Authenticates an admin using a developer secret key (fallback for CLI or offline testing)
 * and establishes session cookies.
 */
export async function POST(req: NextRequest) {
  try {
    const rate = checkRateLimit(req, 'admin-auth', 10, 15 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: `Too many authentication attempts. Please try again in ${rate.retryAfterSeconds} seconds.`,
        },
        { status: 429 }
      );
    }
    let candidateKey: string | undefined;

    try {
      const body = await req.json();
      candidateKey = body.adminKey;
    } catch {
      // Body might be empty or invalid JSON; fallback to headers
    }

    if (!candidateKey) {
      candidateKey = req.headers.get('x-admin-key') || undefined;
    }

    if (!validateAdminKey(candidateKey)) {
      return NextResponse.json(
        { success: false, error: 'Invalid admin secret key.' },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: 'Admin key authentication successful.',
      user: {
        email: 'developer@sheet2suite.com',
        name: 'Developer Key Admin',
      },
    });

    // Set fallback cookie for browser persistence
    response.cookies.set({
      name: 's2s_admin_key',
      value: candidateKey!.trim(),
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Authentication error.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/auth
 * Logs out of the admin session by clearing all admin session cookies.
 */
export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: 'Admin session terminated.',
  });

  // Clear Google OAuth Admin Session Cookie
  response.cookies.set({
    name: ADMIN_SESSION_COOKIE,
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  // Clear legacy admin key cookie
  response.cookies.set({
    name: 's2s_admin_key',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  // Clear admin user info cookie
  response.cookies.set({
    name: 's2s_admin_user',
    value: '',
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
