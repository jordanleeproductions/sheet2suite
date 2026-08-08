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

    const records = LocalLicensingDb.getWorkspacesByEmail(email);

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
      spreadsheetId,
      spreadsheetName,
      driveFolderPath,
      webViewLink,
      productName = 'Sheet2Vow',
    } = body;

    if (!userEmail || !spreadsheetId) {
      return NextResponse.json(
        { success: false, error: 'userEmail and spreadsheetId are required.' },
        { status: 400 }
      );
    }

    const saved = LocalLicensingDb.saveWorkspace({
      userEmail,
      partnerEmail,
      spreadsheetId,
      spreadsheetName: spreadsheetName || 'Wedding Database',
      driveFolderPath: driveFolderPath || 'My Drive / Sheet2Suite / Sheet2Vow',
      webViewLink: webViewLink || `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit`,
      productName,
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
