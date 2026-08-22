import { NextRequest, NextResponse } from 'next/server';
import { auditMasterSpreadsheet, repairGoogleSheetHeaders } from '../../../../../scripts/validateMasterSheet';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const customSheetId = searchParams.get('spreadsheetId') || undefined;

    // Extract optional Bearer token from header
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;

    const report = await auditMasterSpreadsheet(customSheetId, token);
    return NextResponse.json({ success: true, report });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to validate master sheet schema.' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const spreadsheetId = body.spreadsheetId;
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;

    const report = await auditMasterSpreadsheet(spreadsheetId, token);
    const repairResult = await repairGoogleSheetHeaders(report, token);

    return NextResponse.json({
      success: repairResult.success,
      repairedTabs: repairResult.repairedTabs,
      error: repairResult.error,
      report
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to auto-repair master sheet.' },
      { status: 500 }
    );
  }
}
