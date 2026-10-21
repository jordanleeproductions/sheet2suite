import { NextRequest, NextResponse } from 'next/server';
import { LocalLicensingDb } from '@/lib/db/licensingDb';
import { requireAdminAuth } from '@/lib/auth/adminAuth';

/**
 * GET /api/admin/db
 * Returns all database records (workspaces & licenses) across Cloud Firestore and local storage.
 */
export async function GET(req: NextRequest) {
  const authError = requireAdminAuth(req);
  if (authError) return authError;

  try {
    const workspaces = await LocalLicensingDb.getAllWorkspacesAsync();
    const rawLicenses = await LocalLicensingDb.getAllLicensesAsync();

    // Preserve all raw LicenseDocument properties while mapping productAccess for UI compatibility
    const licenses = rawLicenses.map((doc) => {
      const isBundle = doc.sku.includes('MASTER') || doc.sku.includes('BUNDLE') || doc.sku === 'sheet2suite_bundle';
      const normalizedSku = isBundle ? 'sheet2suite_bundle' : 'sheet2vow';
      return {
        ...doc,
        sku: doc.sku || normalizedSku,
        purchasePlatform: 'etsy' as const,
        productAccess: {
          sheet2vow: true,
          sheet2home: isBundle,
          sheet2finance: isBundle,
        },
      };
    });

    return NextResponse.json({
      success: true,
      stats: {
        totalWorkspaces: workspaces.length,
        totalLicenses: licenses.length,
      },
      workspaces,
      licenses,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch database records.' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/admin/db
 * Updates an existing workspace or license record on Firebase / local database.
 */
export async function PUT(req: NextRequest) {
  const authError = requireAdminAuth(req);
  if (authError) return authError;

  try {
    const body = await req.json();
    const { type, record } = body;

    if (!type || !record) {
      return NextResponse.json(
        { success: false, error: 'Missing "type" (workspace | license) or "record" in payload.' },
        { status: 400 }
      );
    }

    if (type === 'workspace') {
      if (!record.workspaceId && !record.spreadsheetId) {
        return NextResponse.json(
          { success: false, error: 'Workspace record requires workspaceId or spreadsheetId.' },
          { status: 400 }
        );
      }
      const updated = await LocalLicensingDb.saveWorkspaceAsync(record);
      return NextResponse.json({
        success: true,
        message: `Workspace "${updated.workspaceId}" updated successfully on Firebase.`,
        record: updated,
      });
    }

    if (type === 'license') {
      if (!record.licenseKey) {
        return NextResponse.json(
          { success: false, error: 'License record requires licenseKey.' },
          { status: 400 }
        );
      }
      const updated = await LocalLicensingDb.saveLicenseAsync(record);
      return NextResponse.json({
        success: true,
        message: `License "${updated.licenseKey}" updated successfully on Firebase.`,
        record: updated,
      });
    }

    return NextResponse.json(
      { success: false, error: `Invalid record type "${type}". Must be "workspace" or "license".` },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update database record on Firebase.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/db
 * Deletes a workspace record or license record by ID.
 */
export async function DELETE(req: NextRequest) {
  const authError = requireAdminAuth(req);
  if (authError) return authError;

  try {
    const url = req.nextUrl;
    const workspaceId = url.searchParams.get('workspaceId');
    const licenseKey = url.searchParams.get('licenseKey');
    const purgeAll = url.searchParams.get('all') === 'true';

    if (purgeAll) {
      LocalLicensingDb.deleteAllWorkspaces();
      LocalLicensingDb.deleteAllLicenses();
      return NextResponse.json({
        success: true,
        message: 'Successfully purged all workspace records and entitlement licenses from database.',
      });
    }

    if (workspaceId) {
      const deleted = await LocalLicensingDb.deleteWorkspaceAsync(workspaceId);
      return NextResponse.json({
        success: true,
        message: deleted ? `Successfully deleted workspace ID: ${workspaceId}` : 'Workspace deleted',
      });
    }

    if (licenseKey) {
      const deleted = await LocalLicensingDb.deleteLicenseAsync(licenseKey);
      return NextResponse.json({
        success: true,
        message: deleted ? `Successfully deleted license key: ${licenseKey}` : 'License key not found',
      });
    }

    return NextResponse.json(
      { success: false, error: 'Provide workspaceId or licenseKey to delete.' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete record.' },
      { status: 500 }
    );
  }
}
