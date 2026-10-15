import { NextRequest, NextResponse } from 'next/server';
import { LocalLicensingDb } from '@/lib/db/licensingDb';

/**
 * GET /api/workspaces?email=user@gmail.com
 * Fetches all active Sheet2Suite spreadsheets registered to the user or their partner.
 */
export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const email = url.searchParams.get('email') || req.cookies.get('s2s_user_email')?.value;

    if (!email) {
      return NextResponse.json(
        { success: false, error: 'Email parameter or s2s_user_email cookie is required.' },
        { status: 400 }
      );
    }

    let records = await LocalLicensingDb.getWorkspacesByEmailAsync(email);

    // Auto-Discovery Fallback: If no records found in database, check Google Drive if session token exists
    if (records.length === 0) {
      try {
        const token = req.headers.get('authorization')?.replace('Bearer ', '') || 
                      req.cookies.get('s2s_access_token')?.value || 
                      req.cookies.get('google_access_token')?.value;
        const refreshToken = req.cookies.get('s2s_refresh_token')?.value;

        if (token || refreshToken) {
          const { getGoogleAuthAsync } = await import('@/lib/sheets/client');
          const { google } = await import('googleapis');
          const auth = await getGoogleAuthAsync(token, undefined, email, refreshToken);
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
                const autoRegistered = await LocalLicensingDb.saveWorkspaceAsync({
                  userEmail: email,
                  spreadsheetId: file.id,
                  spreadsheetName: file.name || 'Wedding Database',
                  driveFolderPath: 'My Drive / Sheet2Suite / Sheet2Vow',
                  webViewLink: file.webViewLink || `https://docs.google.com/spreadsheets/d/${file.id}/edit`,
                  productName: 'Sheet2Vow',
                  orderVerified: true,
                });
                records.push(autoRegistered);
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
      userEmail: email,
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

/**
 * POST /api/workspaces
 * Registers or updates a spreadsheet workspace mapping in the Sheet2Suite database.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      userEmail,
      partnerEmail,
      coPlanners,
      spreadsheetId,
      spreadsheetName,
      driveFolderPath,
      webViewLink,
      productName = 'Sheet2Vow',
      orderId,
      orderVerified = true,
    } = body;

    if (!userEmail || !spreadsheetId) {
      return NextResponse.json(
        { success: false, error: 'userEmail and spreadsheetId are required.' },
        { status: 400 }
      );
    }

    const resolvedCoPlanners = Array.isArray(coPlanners)
      ? coPlanners
      : partnerEmail
      ? [partnerEmail]
      : [];

    const saved = await LocalLicensingDb.saveWorkspaceAsync({
      userEmail,
      partnerEmail,
      coPlanners: resolvedCoPlanners,
      spreadsheetId,
      spreadsheetName: spreadsheetName || 'Wedding Database',
      driveFolderPath: driveFolderPath || 'My Drive / Sheet2Suite / Sheet2Vow',
      webViewLink: webViewLink || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
      productName,
      orderId: orderId || undefined,
      orderVerified: Boolean(orderVerified),
    });

    return NextResponse.json({
      success: true,
      message: 'Workspace registered successfully in Sheet2Suite database.',
      workspace: saved,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to save workspace.' },
      { status: 500 }
    );
  }
}
