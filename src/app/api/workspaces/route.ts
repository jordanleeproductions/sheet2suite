import { NextRequest, NextResponse } from 'next/server';
import { LocalLicensingDb } from '@/lib/db/licensingDb';
import { verifyAdminAuth } from '@/lib/auth/adminAuth';
import { getVerifiedCookieEmail, resolveGoogleTokenEmail } from '@/lib/auth/userSession';

async function resolveCallerIdentity(req: NextRequest): Promise<{
  isAdmin: boolean;
  authenticatedEmail?: string;
  token?: string;
  refreshToken?: string;
}> {
  const adminAuth = verifyAdminAuth(req);
  if (adminAuth.authorized) {
    return { isAdmin: true };
  }

  const authHeader = req.headers.get('authorization');
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7).trim() : undefined;
  const cookieToken = req.cookies.get('s2s_access_token')?.value || req.cookies.get('google_access_token')?.value;
  const token = bearerToken || cookieToken;
  const refreshToken = req.cookies.get('s2s_refresh_token')?.value;
  const cookieEmail = getVerifiedCookieEmail(req);

  let authenticatedEmail = cookieEmail;

  if (!authenticatedEmail && token) {
    authenticatedEmail = (await resolveGoogleTokenEmail(token)) || undefined;
  }

  return {
    isAdmin: false,
    authenticatedEmail,
    token,
    refreshToken,
  };
}

/**
 * Helper to check if an email or orderId has an active license in Firestore ([VULN-12]).
 */
async function verifyActiveLicenseForUser(email: string, orderId?: string): Promise<{
  verified: boolean;
  matchedOrderId?: string;
  licenseDoc?: any;
}> {
  const cleanEmail = (email || '').trim().toLowerCase();
  const cleanOrderId = (orderId || '').trim().toUpperCase();

  if (cleanOrderId && cleanOrderId !== 'VERIFIED-ORDER') {
    const byKey = await LocalLicensingDb.getLicenseByKeyAsync(cleanOrderId);
    if (byKey && (byKey.status === 'active' || byKey.status === 'used')) {
      const boundEmail = (byKey.purchaserEmail || '').trim().toLowerCase();
      if (!boundEmail || boundEmail === cleanEmail) {
        return { verified: true, matchedOrderId: byKey.orderId || byKey.licenseKey, licenseDoc: byKey };
      }
    }
  }

  const allLicenses = await LocalLicensingDb.getAllLicensesAsync();
  const matched = allLicenses.find(
    (lic) =>
      (lic.status === 'active' || lic.status === 'used') &&
      (lic.purchaserEmail || '').trim().toLowerCase() === cleanEmail
  );
  if (matched) {
    return { verified: true, matchedOrderId: matched.orderId || matched.licenseKey, licenseDoc: matched };
  }

  return { verified: false };
}

export async function GET(req: NextRequest) {
  try {
    const caller = await resolveCallerIdentity(req);
    const url = req.nextUrl;
    const requestedEmail = url.searchParams.get('email')?.trim().toLowerCase();

    if (caller.isAdmin) {
      const targetEmail = requestedEmail || req.cookies.get('s2s_user_email')?.value;
      if (!targetEmail) {
        return NextResponse.json(
          { success: false, error: 'Admin query requires an email query parameter.' },
          { status: 400 }
        );
      }
      const records = await LocalLicensingDb.getWorkspacesByEmailAsync(targetEmail);
      return NextResponse.json({
        success: true,
        userEmail: targetEmail,
        count: records.length,
        workspaces: records,
        isAdmin: true,
      });
    }

    if (!caller.authenticatedEmail) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Active user authentication session required.' },
        { status: 401 }
      );
    }

    if (requestedEmail && requestedEmail !== caller.authenticatedEmail) {
      return NextResponse.json(
        { success: false, error: 'Forbidden: Cannot access workspaces for another user account.' },
        { status: 403 }
      );
    }

    const effectiveEmail = caller.authenticatedEmail;
    const records = await LocalLicensingDb.getWorkspacesByEmailAsync(effectiveEmail);

    // Auto-Discovery Fallback ([VULN-12] Hardened: only mark orderVerified if user holds an active license
    // and never overwrite an existing workspace owned by another user)
    if (records.length === 0) {
      try {
        if (caller.token || caller.refreshToken) {
          const licenseStatus = await verifyActiveLicenseForUser(effectiveEmail);
          if (licenseStatus.verified) {
            const { getGoogleAuthAsync } = await import('@/lib/sheets/client');
            const { google } = await import('googleapis');
            const auth = await getGoogleAuthAsync(caller.token, undefined, effectiveEmail, caller.refreshToken);
            const drive = google.drive({ version: 'v3', auth });

            const driveSearch = await drive.files.list({
              q: "mimeType = 'application/vnd.google-apps.spreadsheet' and (name contains 'Sheet2Vow' or name contains 'Wedding') and trashed = false",
              fields: 'files(id, name, webViewLink, modifiedTime)',
              orderBy: 'modifiedTime desc',
              pageSize: 5,
            });

            if (driveSearch.data.files && driveSearch.data.files.length > 0) {
              for (const file of driveSearch.data.files) {
                if (file.id) {
                  const existingSheetWs = await LocalLicensingDb.getWorkspaceBySpreadsheetIdAsync(file.id);
                  if (existingSheetWs && existingSheetWs.userEmail?.toLowerCase() !== effectiveEmail) {
                    continue; // Never hijack another user's registered spreadsheet
                  }
                  const autoRegistered = await LocalLicensingDb.saveWorkspaceAsync({
                    userEmail: effectiveEmail,
                    spreadsheetId: file.id,
                    spreadsheetName: file.name || 'Wedding Database',
                    driveFolderPath: 'My Drive / Sheet2Suite / Sheet2Vow',
                    webViewLink: file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}/edit`,
                    productName: 'Sheet2Vow',
                    orderId: licenseStatus.matchedOrderId,
                    orderVerified: true,
                  });
                  records.push(autoRegistered);
                }
              }
            }
          }
        }
      } catch (driveErr) {
        console.warn('[Workspaces GET] Could not perform Drive auto-discovery fallback:', driveErr);
      }
    }

    return NextResponse.json({
      success: true,
      userEmail: effectiveEmail,
      count: records.length,
      workspaces: records,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch user workspaces.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const caller = await resolveCallerIdentity(req);

    const body = await req.json();
    const {
      userEmail,
      purchaserEmail,
      partnerEmail,
      coPlanners,
      spreadsheetId,
      spreadsheetName,
      driveFolderPath,
      webViewLink,
      productName = 'Sheet2Vow',
      orderId,
    } = body;

    if (!userEmail || !spreadsheetId) {
      return NextResponse.json(
        { success: false, error: 'userEmail and spreadsheetId are required.' },
        { status: 400 }
      );
    }

    const cleanSheetId = String(spreadsheetId).trim();

    if (!caller.isAdmin) {
      if (!caller.authenticatedEmail) {
        return NextResponse.json(
          { success: false, error: 'Unauthorized: Authentication required to register workspace.' },
          { status: 401 }
        );
      }

      const normalizedUserEmail = String(userEmail).trim().toLowerCase();
      if (normalizedUserEmail !== caller.authenticatedEmail) {
        return NextResponse.json(
          { success: false, error: 'Forbidden: Cannot register workspace for another user account.' },
          { status: 403 }
        );
      }
    }

    const resolvedUserEmail = caller.isAdmin ? String(userEmail).trim().toLowerCase() : caller.authenticatedEmail!;

    // SECURITY [VULN-10]: Prevent Workspace Ownership Hijacking on existing spreadsheetId
    const existingWorkspace = await LocalLicensingDb.getWorkspaceBySpreadsheetIdAsync(cleanSheetId);
    if (existingWorkspace) {
      const existingOwner = (existingWorkspace.userEmail || '').trim().toLowerCase();
      if (existingOwner && existingOwner !== resolvedUserEmail && !caller.isAdmin) {
        return NextResponse.json(
          {
            success: false,
            error: 'Forbidden: This spreadsheet is already registered to another workspace owner.',
          },
          { status: 403 }
        );
      }
    }

    // SECURITY [VULN-12]: Compute orderVerified server-side from Firestore license records
    let verifiedOrderFlag = Boolean(caller.isAdmin && body.orderVerified !== false);
    let resolvedOrderId = orderId ? String(orderId).trim().toUpperCase() : existingWorkspace?.orderId;
    let matchedLicenseDoc: any = null;

    if (!verifiedOrderFlag) {
      if (existingWorkspace?.orderVerified && existingWorkspace.userEmail?.toLowerCase() === resolvedUserEmail) {
        verifiedOrderFlag = true;
      } else {
        const checkPrimary = await verifyActiveLicenseForUser(resolvedUserEmail, resolvedOrderId);
        if (checkPrimary.verified) {
          verifiedOrderFlag = true;
          resolvedOrderId = checkPrimary.matchedOrderId || resolvedOrderId;
          matchedLicenseDoc = checkPrimary.licenseDoc;
        } else if (purchaserEmail) {
          const checkPurchaser = await verifyActiveLicenseForUser(String(purchaserEmail), resolvedOrderId);
          if (checkPurchaser.verified) {
            verifiedOrderFlag = true;
            resolvedOrderId = checkPurchaser.matchedOrderId || resolvedOrderId;
            matchedLicenseDoc = checkPurchaser.licenseDoc;
          }
        }
      }
    }

    // Mark single-use license as used once bound to a workspace ([VULN-12])
    if (matchedLicenseDoc && matchedLicenseDoc.singleUse && matchedLicenseDoc.status === 'active') {
      await LocalLicensingDb.saveLicenseAsync({
        ...matchedLicenseDoc,
        status: 'used',
        usedAt: new Date().toISOString(),
        usedBy: resolvedUserEmail,
      });
    }

    const resolvedCoPlanners = Array.isArray(coPlanners)
      ? coPlanners.map((cp) => String(cp).trim().toLowerCase()).filter(Boolean)
      : partnerEmail
      ? [String(partnerEmail).trim().toLowerCase()]
      : existingWorkspace?.coPlanners || [];

    const saved = await LocalLicensingDb.saveWorkspaceAsync({
      userEmail: resolvedUserEmail,
      partnerEmail: partnerEmail ? String(partnerEmail).trim().toLowerCase() : existingWorkspace?.partnerEmail,
      coPlanners: resolvedCoPlanners,
      spreadsheetId: cleanSheetId,
      spreadsheetName: spreadsheetName || existingWorkspace?.spreadsheetName || 'Wedding Database',
      driveFolderPath: driveFolderPath || existingWorkspace?.driveFolderPath || 'My Drive / Sheet2Suite / Sheet2Vow',
      webViewLink: webViewLink || existingWorkspace?.webViewLink || `https://docs.google.com/spreadsheets/d/${cleanSheetId}/edit`,
      productName,
      orderId: resolvedOrderId || undefined,
      orderVerified: verifiedOrderFlag,
      ...(caller.isAdmin ? { allowOwnerOverride: true } : {}),
    } as any);

    return NextResponse.json({
      success: true,
      message: 'Workspace registered successfully in Sheet2Suite database.',
      workspace: saved,
    });
  } catch (error: any) {
    const isConflict = String(error?.message || '').includes('OWNERSHIP_CONFLICT');
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save workspace.' },
      { status: isConflict ? 403 : 500 }
    );
  }
}

/**
 * DELETE /api/workspaces?spreadsheetId=...
 * Self-service GDPR/CCPA & Google API User Data Policy erasure endpoint ([LEGAL-1]).
 * Permanently removes the workspace routing record and stored OAuth tokens from Cloud Firestore
 * while leaving the user's personal Google Sheet intact in their Google Drive.
 */
export async function DELETE(req: NextRequest) {
  try {
    const caller = await resolveCallerIdentity(req);
    if (!caller.isAdmin && !caller.authenticatedEmail) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Active user session required to delete workspace metadata.' },
        { status: 401 }
      );
    }

    const spreadsheetId =
      req.nextUrl.searchParams.get('spreadsheetId') ||
      (await req.json().catch(() => ({}))).spreadsheetId;

    if (!spreadsheetId) {
      return NextResponse.json(
        { success: false, error: 'spreadsheetId parameter is required.' },
        { status: 400 }
      );
    }

    const result = await LocalLicensingDb.deleteWorkspaceForOwnerAsync(
      String(spreadsheetId),
      caller.authenticatedEmail || '',
      caller.isAdmin
    );

    if (!result.deleted) {
      return NextResponse.json(
        { success: false, error: result.error || 'Could not delete workspace registration.' },
        { status: result.error?.startsWith('Forbidden:') ? 403 : 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Workspace registration and stored OAuth tokens permanently deleted from Sheet2Suite servers. Your Google Sheet remains intact in your Google Drive.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete workspace metadata.' },
      { status: 500 }
    );
  }
}
