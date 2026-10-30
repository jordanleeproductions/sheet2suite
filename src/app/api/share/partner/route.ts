import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getGoogleAuthAsync } from '@/lib/sheets/client';
import { LocalLicensingDb } from '@/lib/db/licensingDb';

// Default model allows strictly 1 secondary user (co-planner / partner) alongside 1 primary user (owner) = 2 users total
const MAX_SECONDARY_USERS = 1;

/**
 * GET /api/share/partner?spreadsheetId=xxx
 * Retrieves primary user and active secondary co-planners for a workspace.
 * Reconciles Cloud Firestore records with live Google Drive permissions.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const spreadsheetId = searchParams.get('spreadsheetId');

    if (!spreadsheetId) {
      return NextResponse.json({ success: false, error: 'spreadsheetId query parameter is required.' }, { status: 400 });
    }

    const { verifyWorkspaceAuthorization } = await import('@/lib/auth/workspaceAuth');
    const authResult = await verifyWorkspaceAuthorization(req, spreadsheetId);
    if (!authResult.authorized) {
      const status = authResult.isUnauthenticated ? 401 : 403;
      return NextResponse.json(
        { success: false, error: authResult.error || 'Access denied.' },
        { status }
      );
    }

    // 1. Fetch workspace document from Cloud Firestore / Local store
    const ws = await LocalLicensingDb.getWorkspaceBySpreadsheetIdAsync(spreadsheetId);

    let coPlanners: string[] = [];
    if (ws?.coPlanners && Array.isArray(ws.coPlanners)) {
      coPlanners = [...ws.coPlanners];
    } else if (ws?.partnerEmail) {
      coPlanners = [ws.partnerEmail];
    }

    // 2. Drive Reconciliation: Query live Google Drive permissions if credentials are available
    try {
      const authHeader = req.headers.get('authorization');
      const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
      const cookieToken = req.cookies.get('s2s_access_token')?.value || req.cookies.get('google_access_token')?.value;
      const refreshToken = req.cookies.get('s2s_refresh_token')?.value;
      const targetUserEmail = authResult.targetUserEmail || authResult.userEmail;

      const auth = await getGoogleAuthAsync(bearerToken || cookieToken, undefined, targetUserEmail, refreshToken);
      if (auth) {
        const drive = google.drive({ version: 'v3', auth });
        const listRes = await drive.permissions.list({
          fileId: spreadsheetId,
          fields: 'permissions(id, emailAddress, role, type, displayName)',
        });

        const perms = listRes.data.permissions || [];
        for (const p of perms) {
          if (p.type === 'user' && p.emailAddress) {
            const email = p.emailAddress.toLowerCase().trim();
            // Exclude service account and primary owner email
            const isOwner = p.role === 'owner' || (ws?.userEmail && ws.userEmail.toLowerCase().trim() === email);
            const isServiceAccount = email.includes('gserviceaccount.com') || email.includes('sheet2suite');
            if (!isOwner && !isServiceAccount) {
              if (!coPlanners.some((cp) => cp.toLowerCase() === email)) {
                coPlanners.push(email);
              }
            }
          }
        }
      }
    } catch (driveErr: any) {
      console.warn('[Co-Planner API GET] Drive permissions reconciliation note:', driveErr?.message);
    }

    // Deduplicate and clean emails
    coPlanners = Array.from(new Set(coPlanners.map((e) => e.trim().toLowerCase()))).filter(Boolean);

    // If new co-planners were discovered from Drive, update the workspace in Firestore
    if (ws && JSON.stringify(ws.coPlanners || []) !== JSON.stringify(coPlanners)) {
      try {
        await LocalLicensingDb.saveWorkspaceAsync({
          ...ws,
          partnerEmail: coPlanners[0] || ws.partnerEmail,
          coPlanners,
        });
      } catch (saveErr) {
        console.warn('[Co-Planner API GET] Auto-heal save note:', saveErr);
      }
    }

    const primaryEmail = ws?.userEmail || req.cookies.get('s2s_user_email')?.value || '';

    // Check workspace license tier
    const licenseKeyOrOrderId = ws?.orderId || (ws as any)?.licenseKey || '';
    const license = licenseKeyOrOrderId
      ? await LocalLicensingDb.getLicenseByKeyAsync(licenseKeyOrOrderId)
      : null;
    const isPro = license?.licenseTier === 'pro' || license?.licenseTier === 'unlimited';
    const effectiveMaxSecondary = isPro ? 999 : MAX_SECONDARY_USERS;

    return NextResponse.json({
      success: true,
      spreadsheetId,
      primaryUser: {
        email: primaryEmail,
        role: 'owner',
      },
      secondaryUsers: coPlanners.map((email) => ({
        email,
        role: 'writer',
        status: 'active',
      })),
      coPlanners,
      maxTotalUsers: isPro ? 1000 : 2,
      maxSecondaryUsers: effectiveMaxSecondary,
      slotsUsed: coPlanners.length,
      canAddMore: coPlanners.length < effectiveMaxSecondary,
      isProTier: isPro,
      licenseTier: license?.licenseTier || 'standard',
    });
  } catch (err: any) {
    console.error('[Co-Planner API GET Error]:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to fetch co-planners.' }, { status: 500 });
  }
}

/**
 * POST /api/share/partner
 * Grants Google Drive permission & sends free native Google Drive notification email.
 * Enforces strict quota limit of MAX 1 secondary user for Standard tier (2 users total: Primary + Secondary).
 * Allows unlimited collaborators for Pro tier.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { spreadsheetId, partnerEmail, role = 'writer', weddingName = 'Our Wedding', accessToken } = body;

    if (!spreadsheetId || !partnerEmail) {
      return NextResponse.json({ success: false, error: 'spreadsheetId and partnerEmail are required.' }, { status: 400 });
    }

    const cleanEmail = String(partnerEmail).trim().toLowerCase();

    // 1. Quota Check in Cloud Firestore Database
    const ws = await LocalLicensingDb.getWorkspaceBySpreadsheetIdAsync(spreadsheetId);
    let existingCoPlanners: string[] = ws?.coPlanners && Array.isArray(ws.coPlanners)
      ? [...ws.coPlanners]
      : (ws?.partnerEmail ? [ws.partnerEmail] : []);

    existingCoPlanners = Array.from(new Set(existingCoPlanners.map((e) => e.trim().toLowerCase()))).filter(Boolean);

    // Prevent primary user from adding themselves as secondary user
    if (ws?.userEmail && ws.userEmail.toLowerCase().trim() === cleanEmail) {
      return NextResponse.json(
        { success: false, error: 'This email is already the primary workspace owner.' },
        { status: 400 }
      );
    }

    // Check workspace license tier
    const postLicenseKeyOrOrderId = ws?.orderId || (ws as any)?.licenseKey || '';
    const license = postLicenseKeyOrOrderId
      ? await LocalLicensingDb.getLicenseByKeyAsync(postLicenseKeyOrOrderId)
      : null;
    const isPro = license?.licenseTier === 'pro' || license?.licenseTier === 'unlimited';

    const alreadyExists = existingCoPlanners.includes(cleanEmail);
    if (!alreadyExists && !isPro && existingCoPlanners.length >= MAX_SECONDARY_USERS) {
      return NextResponse.json(
        {
          success: false,
          error: `Standard workspace plan allows a maximum of 2 users (Primary + 1 Secondary). Upgrade to Sheet2Vow Pro to invite additional co-planners and wedding coordinators.`,
          requiresPro: true,
          slotsUsed: existingCoPlanners.length,
          maxSecondaryUsers: MAX_SECONDARY_USERS,
        },
        { status: 403 }
      );
    }

    // 1b. Verify Workspace Authorization (Caller must be authorized on this workspace)
    const { verifyWorkspaceAuthorization } = await import('@/lib/auth/workspaceAuth');
    const authResult = await verifyWorkspaceAuthorization(req, spreadsheetId);
    if (!authResult.authorized) {
      const status = authResult.isUnauthenticated ? 401 : 403;
      return NextResponse.json(
        { success: false, error: authResult.error || 'Access denied to this workspace.' },
        { status }
      );
    }

    // 2. Obtain Auth Token & Drive Client
    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
    const cookieToken = req.cookies.get('s2s_access_token')?.value || req.cookies.get('google_access_token')?.value;
    const refreshToken = req.cookies.get('s2s_refresh_token')?.value;
    const targetUserEmail = authResult.targetUserEmail || authResult.userEmail;

    const auth = await getGoogleAuthAsync(accessToken || bearerToken || cookieToken, undefined, targetUserEmail, refreshToken);
    if (!auth) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Google connection required to manage Google Drive permissions.' },
        { status: 401 }
      );
    }

    const drive = google.drive({ version: 'v3', auth });

    const origin = req.headers.get('origin') || req.nextUrl?.origin || process.env.NEXT_PUBLIC_APP_URL || 'https://sheet2vow.com';
    const appAccessUrl = `${origin}/vow?spreadsheetId=${spreadsheetId}`;
    const customEmailMsg = `${weddingName}: You've been added as a co-planner to our wedding database on Sheet2Vow!\n\nOpen your Co-Planner App Dashboard directly at:\n${appAccessUrl}`;

    let permissionId: string | undefined;
    try {
      const permRes = await drive.permissions.create({
        fileId: spreadsheetId,
        sendNotificationEmail: true,
        emailMessage: customEmailMsg,
        requestBody: {
          role: role === 'reader' ? 'reader' : 'writer',
          type: 'user',
          emailAddress: cleanEmail,
        },
        fields: 'id',
      });
      permissionId = permRes.data.id || undefined;
    } catch (gErr: any) {
      console.warn('[Co-Planner API] Google Drive permission creation note:', gErr?.message);
    }

    // 3. Update Database Record in Cloud Firestore
    if (!alreadyExists) {
      existingCoPlanners.push(cleanEmail);
    }

    await LocalLicensingDb.saveWorkspaceAsync({
      ...(ws || {}),
      spreadsheetId,
      partnerEmail: cleanEmail,
      coPlanners: existingCoPlanners,
      lastActiveAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `Successfully granted co-planning access to ${cleanEmail} and sent Google notification email.`,
      permissionId,
      primaryUser: {
        email: ws?.userEmail || targetUserEmail || '',
        role: 'owner',
      },
      secondaryUsers: existingCoPlanners.map((email) => ({
        email,
        role: 'writer',
        status: 'active',
      })),
      coPlanners: existingCoPlanners,
      slotsUsed: existingCoPlanners.length,
      maxTotalUsers: 2,
      maxSecondaryUsers: MAX_SECONDARY_USERS,
      canAddMore: existingCoPlanners.length < MAX_SECONDARY_USERS,
      isProTier: false,
    });
  } catch (err: any) {
    console.error('[Co-Planner API POST Error]:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to grant co-planner permission.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/share/partner
 * Revokes co-planner access from Google Drive and removes from database.
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const spreadsheetId = searchParams.get('spreadsheetId');
    const partnerEmail = searchParams.get('partnerEmail');

    if (!spreadsheetId || !partnerEmail) {
      return NextResponse.json({ success: false, error: 'spreadsheetId and partnerEmail query parameters are required.' }, { status: 400 });
    }

    const cleanEmail = String(partnerEmail).trim().toLowerCase();

    // 1. Verify caller workspace authorization
    const { verifyWorkspaceAuthorization } = await import('@/lib/auth/workspaceAuth');
    const authResult = await verifyWorkspaceAuthorization(req, spreadsheetId);
    if (!authResult.authorized) {
      const status = authResult.isUnauthenticated ? 401 : 403;
      return NextResponse.json(
        { success: false, error: authResult.error || 'Access denied to this workspace.' },
        { status }
      );
    }

    // 1b. Obtain Auth Token & Drive Client
    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
    const cookieToken = req.cookies.get('s2s_access_token')?.value || req.cookies.get('google_access_token')?.value;
    const refreshToken = req.cookies.get('s2s_refresh_token')?.value;

    const ws = await LocalLicensingDb.getWorkspaceBySpreadsheetIdAsync(spreadsheetId);
    const targetUserEmail = authResult.targetUserEmail || authResult.userEmail;

    try {
      const auth = await getGoogleAuthAsync(bearerToken || cookieToken, undefined, targetUserEmail, refreshToken);
      if (auth) {
        const drive = google.drive({ version: 'v3', auth });

        const listRes = await drive.permissions.list({
          fileId: spreadsheetId,
          fields: 'permissions(id, emailAddress, role)',
        });

        const targetPerm = (listRes.data.permissions || []).find((p: any) => p.emailAddress?.toLowerCase() === cleanEmail);

        if (targetPerm?.id) {
          await drive.permissions.delete({
            fileId: spreadsheetId,
            permissionId: targetPerm.id,
          });
        }
      }
    } catch (gErr: any) {
      console.warn('[Co-Planner API DELETE] Could not delete Google Drive permission:', gErr?.message);
    }

    // 2. Update Database Record in Cloud Firestore
    let updatedCoPlanners: string[] = [];
    if (ws?.coPlanners && Array.isArray(ws.coPlanners)) {
      updatedCoPlanners = ws.coPlanners.filter((e: string) => e.toLowerCase().trim() !== cleanEmail);
    }

    await LocalLicensingDb.saveWorkspaceAsync({
      ...(ws || {}),
      spreadsheetId,
      partnerEmail: updatedCoPlanners[0] || undefined,
      coPlanners: updatedCoPlanners,
      lastActiveAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: `Successfully revoked access for ${cleanEmail}.`,
      primaryUser: {
        email: ws?.userEmail || '',
        role: 'owner',
      },
      secondaryUsers: updatedCoPlanners.map((email) => ({
        email,
        role: 'writer',
        status: 'active',
      })),
      coPlanners: updatedCoPlanners,
      slotsUsed: updatedCoPlanners.length,
      maxTotalUsers: 2,
      maxSecondaryUsers: MAX_SECONDARY_USERS,
      canAddMore: updatedCoPlanners.length < MAX_SECONDARY_USERS,
      isProTier: false,
    });
  } catch (err: any) {
    console.error('[Co-Planner API DELETE Error]:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to revoke co-planner permission.' },
      { status: 500 }
    );
  }
}
