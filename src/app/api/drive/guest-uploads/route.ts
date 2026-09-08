import { NextRequest, NextResponse } from 'next/server';
import { LocalFirestore, GuestUploadRecord } from '@/lib/db/firestoreDb';

export const dynamic = 'force-dynamic';

/**
 * GET /api/drive/guest-uploads?spreadsheetId=...&userEmail=...
 * Returns guest photo upload events, messages, and uploaded files for the couple's wedding.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const spreadsheetId = searchParams.get('spreadsheetId') || req.cookies.get('s2v_spreadsheet_id')?.value;
    const userEmail = searchParams.get('userEmail') || req.cookies.get('s2v_google_email')?.value;

    let allUploads: GuestUploadRecord[] = [];
    if (spreadsheetId) {
      allUploads = await LocalFirestore.getDocsAsync<GuestUploadRecord>('guest_uploads', {
        field: 'spreadsheetId',
        value: spreadsheetId,
      });
    }

    // Fallback: If no records found by spreadsheetId and userEmail is provided, check userEmail
    if (allUploads.length === 0 && userEmail) {
      allUploads = await LocalFirestore.getDocsAsync<GuestUploadRecord>('guest_uploads', {
        field: 'userEmail',
        value: userEmail,
      });
    }

    // If still no records and neither query was provided or local test mode
    if (allUploads.length === 0 && !spreadsheetId && !userEmail) {
      allUploads = await LocalFirestore.getDocsAsync<GuestUploadRecord>('guest_uploads');
    }

    // Sort newest first
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
 * DELETE /api/drive/guest-uploads?id=...
 * Removes a guest upload activity record.
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get('id');

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
      } catch (e) {}
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Upload ID is required' }, { status: 400 });
    }

    const deleted = LocalFirestore.deleteDoc('guest_uploads', id);
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
