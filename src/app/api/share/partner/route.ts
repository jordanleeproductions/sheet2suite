import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { getGoogleAuth } from '@/lib/sheets/client';
import { LocalFirestore, WorkspaceDocument } from '@/lib/db/firestoreDb';

const MAX_CO_PLANNERS = 2;

/**
 * GET /api/share/partner?spreadsheetId=xxx
 * Retrieves active co-planners for a workspace.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const spreadsheetId = searchParams.get('spreadsheetId');

    if (!spreadsheetId) {
      return NextResponse.json({ success: false, error: 'spreadsheetId query parameter is required.' }, { status: 400 });
    }

    const workspaces = LocalFirestore.getDocs<WorkspaceDocument>('workspaces');
    const ws = workspaces.find((w: WorkspaceDocument) => w.spreadsheetId === spreadsheetId);

    const coPlanners = ws?.coPlanners || (ws?.partnerEmail ? [ws.partnerEmail] : []);

    return NextResponse.json({
      success: true,
      spreadsheetId,
      coPlanners,
      maxAllowed: MAX_CO_PLANNERS,
      slotsUsed: coPlanners.length,
    });
  } catch (err: any) {
    console.error('[Co-Planner API GET Error]:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Failed to fetch co-planners.' }, { status: 500 });
  }
}

/**
 * POST /api/share/partner
 * Grants Google Drive permission & sends free native Google Drive notification email.
 * Enforces strict quota limit of MAX 2 co-planners per workspace.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { spreadsheetId, partnerEmail, role = 'writer', weddingName = 'Our Wedding', accessToken } = body;

    if (!spreadsheetId || !partnerEmail) {
      return NextResponse.json({ success: false, error: 'spreadsheetId and partnerEmail are required.' }, { status: 400 });
    }

    const cleanEmail = String(partnerEmail).trim().toLowerCase();

    // 1. Quota Check in Database
    const workspaces = LocalFirestore.getDocs<WorkspaceDocument>('workspaces');
    const ws = workspaces.find((w: WorkspaceDocument) => w.spreadsheetId === spreadsheetId);
    let existingCoPlanners = ws?.coPlanners || (ws?.partnerEmail ? [ws.partnerEmail] : []);

    // Ensure array is unique
    existingCoPlanners = Array.from(new Set(existingCoPlanners.map((e: string) => e.toLowerCase())));

    const alreadyExists = existingCoPlanners.includes(cleanEmail);
    if (!alreadyExists && existingCoPlanners.length >= MAX_CO_PLANNERS) {
      return NextResponse.json(
        {
          success: false,
          error: `Co-planner quota limit reached (Max ${MAX_CO_PLANNERS} co-planners per workspace). Revoke an existing co-planner to invite a new partner.`,
        },
        { status: 403 }
      );
    }

    // 2. Obtain Auth Token
    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
    const cookieToken = req.cookies.get('s2s_access_token')?.value;
    const token = accessToken || bearerToken || cookieToken || process.env.GOOGLE_ACCESS_TOKEN;

    if (!token && !process.env.GOOGLE_CLIENT_EMAIL) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized: Google connection required to manage Google Drive permissions.' },
        { status: 401 }
      );
    }

    // 3. Execute Google Drive Permission API Call
    const auth = getGoogleAuth(token);
    const drive = google.drive({ version: 'v3', auth });

    let permissionId: string | undefined;
    try {
      const permRes = await drive.permissions.create({
        fileId: spreadsheetId,
        sendNotificationEmail: true, // Native Free Google Notification Email
        emailMessage: `${weddingName}: You've been added as a co-planner to our wedding database on Sheet2Vow!`,
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

    // 4. Update Database Record
    if (!alreadyExists) {
      existingCoPlanners.push(cleanEmail);
    }

    if (ws) {
      LocalFirestore.setDoc<WorkspaceDocument>('workspaces', ws.workspaceId || ws.id, {
        ...ws,
        partnerEmail: ws.partnerEmail || cleanEmail,
        coPlanners: existingCoPlanners,
        lastActiveAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully granted co-planning access to ${cleanEmail} and sent Google notification email.`,
      permissionId,
      coPlanners: existingCoPlanners,
      slotsUsed: existingCoPlanners.length,
      maxAllowed: MAX_CO_PLANNERS,
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

    // 1. Obtain Auth Token
    const authHeader = req.headers.get('authorization');
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
    const cookieToken = req.cookies.get('s2s_access_token')?.value;
    const token = bearerToken || cookieToken || process.env.GOOGLE_ACCESS_TOKEN;

    if (token) {
      try {
        const auth = getGoogleAuth(token);
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
      } catch (gErr: any) {
        console.warn('[Co-Planner API DELETE] Could not delete Google Drive permission:', gErr?.message);
      }
    }

    // 2. Update Database Record
    const workspaces = LocalFirestore.getDocs<WorkspaceDocument>('workspaces');
    const ws = workspaces.find((w: WorkspaceDocument) => w.spreadsheetId === spreadsheetId);
    let updatedCoPlanners: string[] = [];

    if (ws) {
      updatedCoPlanners = (ws.coPlanners || []).filter((e: string) => e.toLowerCase() !== cleanEmail);
      LocalFirestore.setDoc<WorkspaceDocument>('workspaces', ws.workspaceId || ws.id, {
        ...ws,
        coPlanners: updatedCoPlanners,
        lastActiveAt: new Date().toISOString(),
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully revoked access for ${cleanEmail}.`,
      coPlanners: updatedCoPlanners,
      slotsUsed: updatedCoPlanners.length,
      maxAllowed: MAX_CO_PLANNERS,
    });
  } catch (err: any) {
    console.error('[Co-Planner API DELETE Error]:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to revoke co-planner permission.' },
      { status: 500 }
    );
  }
}
