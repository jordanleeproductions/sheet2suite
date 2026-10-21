import { NextRequest, NextResponse } from 'next/server';
import { validateAdminKey, verifyAdminAuth } from '@/lib/auth/adminAuth';

/**
 * GET /api/admin/auth
 * Checks whether the current request is authenticated as an admin.
 */
export async function GET(req: NextRequest) {
  const auth = verifyAdminAuth(req);
  return NextResponse.json({
    authenticated: auth.authorized,
  });
}

/**
 * POST /api/admin/auth
 * Authenticates an admin using a secret key and establishes an HttpOnly session cookie.
 */
export async function POST(req: NextRequest) {
  try {
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
      message: 'Admin authentication successful.',
    });

    // Set secure HttpOnly cookie for browser persistence
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
 * Logs out of the admin session by clearing the HttpOnly cookie.
 */
export async function DELETE() {
  const response = NextResponse.json({
    success: true,
    message: 'Admin session terminated.',
  });

  response.cookies.set({
    name: 's2s_admin_key',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });

  return response;
}
