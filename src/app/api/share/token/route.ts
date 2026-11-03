import { NextRequest, NextResponse } from 'next/server';
import { generateShareToken, ShareScope } from '@/lib/share/token';
import { verifyWorkspaceAuthorization, isMockSpreadsheet } from '@/lib/auth/workspaceAuth';
import { LocalLicensingDb } from '@/lib/db/licensingDb';

/**
 * POST /api/share/token
 * Server-side endpoint for minting HMAC-SHA256 signed share tokens.
 * Ensures SHARE_JWT_SECRET never needs to be exposed to the browser bundle.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      spreadsheetId,
      scope = 'vendor_hub',
      weddingName = 'Our Wedding',
      expiresInDays = 30,
      folderId,
      folderName,
      folderPath,
    } = body;

    if (!spreadsheetId) {
      return NextResponse.json(
        { success: false, error: 'spreadsheetId is required.' },
        { status: 400 }
      );
    }

    let shareVersion = 1;
    let ownerEmail: string | undefined;

    if (!isMockSpreadsheet(spreadsheetId)) {
      const authResult = await verifyWorkspaceAuthorization(req, spreadsheetId);
      if (!authResult.authorized) {
        const status = authResult.isUnauthenticated ? 401 : 403;
        return NextResponse.json(
          { success: false, error: authResult.error || 'Access denied to this workspace.' },
          { status }
        );
      }

      const ws =
        authResult.workspace ||
        (await LocalLicensingDb.getWorkspaceBySpreadsheetIdAsync(spreadsheetId));
      shareVersion = ws?.shareVersion || 1;
      ownerEmail = ws?.userEmail || authResult.targetUserEmail || authResult.userEmail;
    }

    const validDays = Math.min(365, Math.max(1, Number(expiresInDays) || 30));
    const exp = Date.now() + validDays * 24 * 60 * 60 * 1000;

    const token = generateShareToken({
      spreadsheetId,
      scope: scope as ShareScope,
      weddingName: weddingName || 'Our Wedding',
      shareVersion,
      userEmail: ownerEmail,
      folderId,
      folderName,
      folderPath,
      expiresInDays: validDays,
    });

    const basePath =
      scope === 'guest_upload'
        ? '/upload/'
        : scope === 'guest_song_request'
        ? '/request-song/'
        : scope === 'partner_invite'
        ? `/vow?spreadsheetId=${encodeURIComponent(spreadsheetId)}&inviteToken=`
        : '/share/';

    const origin =
      req.headers.get('origin') ||
      req.nextUrl?.origin ||
      process.env.NEXT_PUBLIC_APP_URL ||
      '';

    const shareUrl = `${origin}${basePath}${token}`;

    return NextResponse.json({
      success: true,
      token,
      shareUrl,
      exp,
      shareVersion,
    });
  } catch (err: any) {
    console.error('[Share Token POST] Error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to generate share token.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/share/token
 * Server-side revocation for a single vendor share token or all tokens for a workspace ("Revoke All").
 */
export async function DELETE(req: NextRequest) {
  try {
    let body: any = {};
    try {
      body = await req.json();
    } catch (_) {}

    const spreadsheetId =
      body.spreadsheetId || req.nextUrl.searchParams.get('spreadsheetId') || undefined;
    const tokenToRevoke = body.token || req.nextUrl.searchParams.get('token') || undefined;
    const revokeAll =
      Boolean(body.revokeAll) || req.nextUrl.searchParams.get('revokeAll') === 'true';

    if (!spreadsheetId) {
      return NextResponse.json(
        { success: false, error: 'spreadsheetId is required.' },
        { status: 400 }
      );
    }

    if (isMockSpreadsheet(spreadsheetId)) {
      return NextResponse.json({ success: true, shareVersion: 2, isMock: true });
    }

    const authResult = await verifyWorkspaceAuthorization(req, spreadsheetId);
    if (!authResult.authorized) {
      const status = authResult.isUnauthenticated ? 401 : 403;
      return NextResponse.json(
        { success: false, error: authResult.error || 'Access denied to this workspace.' },
        { status }
      );
    }

    const ws =
      authResult.workspace ||
      (await LocalLicensingDb.getWorkspaceBySpreadsheetIdAsync(spreadsheetId));

    const currentVersion = ws?.shareVersion || 1;
    const nextVersion = revokeAll || !tokenToRevoke ? currentVersion + 1 : currentVersion;
    const revokedList = Array.isArray(ws?.revokedShareTokens) ? [...ws!.revokedShareTokens] : [];

    if (tokenToRevoke && typeof tokenToRevoke === 'string') {
      const sig = tokenToRevoke.split('.')[2] || tokenToRevoke;
      if (!revokedList.includes(sig)) {
        revokedList.push(sig);
      }
    }

    await LocalLicensingDb.saveWorkspaceAsync({
      ...(ws || {}),
      spreadsheetId,
      shareVersion: nextVersion,
      revokedShareTokens: revokedList,
    });

    return NextResponse.json({
      success: true,
      shareVersion: nextVersion,
      revokedCount: revokedList.length,
    });
  } catch (err: any) {
    console.error('[Share Token DELETE] Error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to revoke share link.' },
      { status: 500 }
    );
  }
}
