import { NextRequest, NextResponse } from 'next/server';
import { getDriveClient, getSheetsClient, DEFAULT_MASTER_SHEET_ID } from '@/lib/sheets/client';
import { updateMockDatabase } from '@/lib/sheets/mockDb';
import { CellGuard } from '@/lib/core/CellGuard';
import { checkRateLimit } from '@/lib/core/rateLimiter';
import { getVerifiedCookieEmail, resolveGoogleTokenEmail } from '@/lib/auth/userSession';
import { LocalLicensingDb } from '@/lib/db/licensingDb';

export async function POST(req: NextRequest) {
  try {
    const rate = checkRateLimit(req, 'onboard', 8, 15 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { success: false, error: `Too many onboarding requests. Please wait ${rate.retryAfterSeconds}s.` },
        { status: 429 }
      );
    }

    const authHeader = req.headers.get('Authorization');
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    const body = await req.json().catch(() => ({}));
    const { weddingName, budget, driveFolder, selectedTasks, orderId } = body;

    const finalWeddingName = CellGuard.sanitizeCellValue(weddingName || 'Our Wedding');
    const finalBudget = Number(budget) || 30000;
    const finalSelectedTasks = Array.isArray(selectedTasks) ? selectedTasks : [];

    // Support Mock Mode for out-of-the-box local testing (without mutating global singleton in production)
    if (!accessToken || accessToken === 'mock-token') {
      if (process.env.NODE_ENV !== 'production') {
        updateMockDatabase(finalWeddingName, finalBudget, finalSelectedTasks);
      }
      return NextResponse.json({
        success: true,
        spreadsheetId: 'mock-sheet-id-vow-12345',
        weddingName: finalWeddingName,
        budget: finalBudget,
        isMock: true,
        message: `Onboarded successfully in Mock Mode. Folder: ${driveFolder || 'Root'}`,
      });
    }

    // Verify license entitlement before cloning real Master Sheet ([VULN-11])
    const callerEmail = (getVerifiedCookieEmail(req) || (await resolveGoogleTokenEmail(accessToken)) || '').trim().toLowerCase();
    let hasEntitlement = false;
    if (orderId) {
      const lic = await LocalLicensingDb.getLicenseByKeyAsync(String(orderId).trim().toUpperCase());
      if (lic && (lic.status === 'active' || lic.status === 'used')) {
        hasEntitlement = true;
      }
    }
    if (!hasEntitlement && callerEmail) {
      const allLicenses = await LocalLicensingDb.getAllLicensesAsync();
      hasEntitlement = allLicenses.some(
        (l) => (l.status === 'active' || l.status === 'used') && (l.purchaserEmail || '').trim().toLowerCase() === callerEmail
      );
      if (!hasEntitlement) {
        const ws = await LocalLicensingDb.getWorkspacesByEmailAsync(callerEmail);
        hasEntitlement = ws.some((w) => w.orderVerified !== false);
      }
    }

    if (!hasEntitlement) {
      return NextResponse.json(
        { success: false, error: 'License verification required before provisioning a Google Sheet.' },
        { status: 403 }
      );
    }

    const driveClient = getDriveClient(accessToken);
    const sheetsClient = getSheetsClient(accessToken);
    const masterSheetId = process.env.GOOGLE_MASTER_SHEET_ID || DEFAULT_MASTER_SHEET_ID;

    const copyResponse = await driveClient.files.copy({
      fileId: masterSheetId,
      requestBody: {
        name: `Sheet2Vow - ${finalWeddingName}`,
      },
    });

    const newSheetId = copyResponse.data.id;
    if (!newSheetId) {
      throw new Error('Failed to retrieve copied spreadsheet ID.');
    }

    await sheetsClient.spreadsheets.values.batchUpdate({
      spreadsheetId: newSheetId,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: [
          {
            range: "'SETTINGS'!A1:B3",
            values: [
              ['Name', 'Value'],
              ['Wedding Name', finalWeddingName],
              ['Wedding Budget', finalBudget],
            ],
          },
        ],
      },
    });

    return NextResponse.json({
      success: true,
      spreadsheetId: newSheetId,
      weddingName: finalWeddingName,
      budget: finalBudget,
      isMock: false,
    });
  } catch (error: any) {
    console.error('Error in /api/onboard:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Onboarding failed' },
      { status: 500 }
    );
  }
}
