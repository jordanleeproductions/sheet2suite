import { NextRequest, NextResponse } from 'next/server';
import { LocalLicensingDb } from '@/lib/db/licensingDb';

/**
 * GET /api/admin/db
 * Returns all database records (workspaces & licenses) for debugging and testing.
 */
export async function GET() {
  try {
    const workspaces = LocalLicensingDb.getAllWorkspaces();
    const licenses = LocalLicensingDb.getAllLicenses();

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
 * DELETE /api/admin/db
 * Deletes a workspace record or license record by ID.
 */
export async function DELETE(req: NextRequest) {
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
      const deleted = LocalLicensingDb.deleteWorkspace(workspaceId);
      return NextResponse.json({
        success: true,
        message: deleted ? `Successfully deleted workspace ID: ${workspaceId}` : 'Workspace deleted',
      });
    }

    if (licenseKey) {
      const deleted = LocalLicensingDb.deleteLicense(licenseKey);
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
