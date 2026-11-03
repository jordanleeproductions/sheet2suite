import { NextRequest, NextResponse } from 'next/server';
import { LocalFirestore, GuestUploadRecord } from '@/lib/db/firestoreDb';
import { verifyWorkspaceAuthorization, isMockSpreadsheet } from '@/lib/auth/workspaceAuth';

export const dynamic = 'force-dynamic';

/**
 * GET /api/drive/guest-uploads?spreadsheetId=...
 * Returns guest photo upload events, messages, and uploaded files for the couple's wedding.
 * SECURITY [VULN-4]: Requires verified workspace authorization; never dumps all records across tenants.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const spreadsheetId =
      searchParams.get('spreadsheetId') || req.cookies.get('s2v_spreadsheet_id')?.value;

    if (!spreadsheetId) {
      return NextResponse.json(
        { success: false, error: 'spreadsheetId query parameter is required.', uploads: [] },
        { status: 400 }
      );
    }

    if (!isMockSpreadsheet(spreadsheetId)) {
      const authResult = await verifyWorkspaceAuthorization(req, spreadsheetId);
      if (!authResult.authorized) {
        const status = authResult.isUnauthenticated ? 401 : 403;
        return NextResponse.json(
          {
            success: false,
            error: authResult.error || 'Access denied to this workspace.',
            uploads: [],
          },
          { status }
        );
      }
    }

    const allUploads = await LocalFirestore.getDocsAsync<GuestUploadRecord>('guest_uploads', {
      field: 'spreadsheetId',
      value: spreadsheetId,
    });

    allUploads.sort((a, b) => {
      const timeA = new Date(a.uploadedAt || 0).getTime();
      const timeB = new Date(b.uploadedAt || 0).getTime();
      return timeB - timeA;
    });

    return NextResponse.json({
      success: true,
      uploads: allUploads,
      totalCount: allUploads.length,
    });
  } catch (error: any) {
    console.error('[Guest Uploads API] Error fetching records:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to retrieve guest uploads' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/drive/guest-uploads?id=...&spreadsheetId=...
 * Removes a single guest upload activity record after verifying workspace ownership.
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');
    let spreadsheetId =
      searchParams.get('spreadsheetId') || req.cookies.get('s2v_spreadsheet_id')?.value;

    if (!id || !spreadsheetId) {
      try {
        const body = await req.json();
        id = id || body.id;
        spreadsheetId = spreadsheetId || body.spreadsheetId;
      } catch (_) {}
    }

    if (!id || !/^upload_[a-zA-Z0-9_]+$/.test(id.trim())) {
      return NextResponse.json(
        { success: false, error: 'Valid upload ID is required' },
        { status: 400 }
      );
    }

    const existingDoc = await LocalFirestore.getDocAsync<GuestUploadRecord>('guest_uploads', id);
    const targetSpreadsheetId = existingDoc?.spreadsheetId || spreadsheetId;

    if (!targetSpreadsheetId) {
      return NextResponse.json(
        { success: false, error: 'spreadsheetId is required to authorize deletion.' },
        { status: 400 }
      );
    }

    if (!isMockSpreadsheet(targetSpreadsheetId)) {
      const authResult = await verifyWorkspaceAuthorization(req, targetSpreadsheetId);
      if (!authResult.authorized) {
        const status = authResult.isUnauthenticated ? 401 : 403;
        return NextResponse.json(
          { success: false, error: authResult.error || 'Access denied to this workspace.' },
          { status }
        );
      }
    }

    const deleted = await LocalFirestore.deleteDocAsync('guest_uploads', id);
    return NextResponse.json({
      success: true,
      deleted,
      id,
    });
  } catch (error: any) {
    console.error('[Guest Uploads API] Error deleting record:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete guest upload' },
      { status: 500 }
    );
  }
}
