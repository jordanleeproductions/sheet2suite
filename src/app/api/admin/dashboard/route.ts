import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/adminAuth';
import { LocalLicensingDb } from '@/lib/db/licensingDb';
import { getCloudFirestore, LocalFirestore } from '@/lib/db/firestoreDb';

/**
 * GET /api/admin/dashboard
 * Aggregates high-leverage platform KPIs, licensing distributions, collaboration ratios,
 * and recent activation streams for the executive dashboard tool.
 */
export async function GET(req: NextRequest) {
  const authError = requireAdminAuth(req);
  if (authError) return authError;

  try {
    const workspaces = await LocalLicensingDb.getAllWorkspacesAsync();
    const rawLicenses = await LocalLicensingDb.getAllLicensesAsync();

    // 1. Workspaces Pulse
    const totalWorkspaces = workspaces.length;
    const verifiedWorkspaces = workspaces.filter((w) => w.orderVerified !== false).length;
    const unverifiedWorkspaces = totalWorkspaces - verifiedWorkspaces;
    const verificationRate = totalWorkspaces > 0 ? Math.round((verifiedWorkspaces / totalWorkspaces) * 100) : 100;

    // 2. Collaboration Index
    const soloWorkspaces = workspaces.filter((w) => !w.partnerEmail && (!w.coPlanners || w.coPlanners.length === 0)).length;
    const coupleWorkspaces = workspaces.filter((w) => Boolean(w.partnerEmail) && (!w.coPlanners || w.coPlanners.length <= 1)).length;
    const multiUserWorkspaces = workspaces.filter((w) => (w.coPlanners && w.coPlanners.length > 1)).length;

    // 3. Product Breakdown
    const vowWorkspaces = workspaces.filter((w) => !w.productName || w.productName === 'Sheet2Vow').length;
    const vaultWorkspaces = workspaces.filter((w) => w.productName === 'Sheet2Vault').length;

    // 4. Licenses & Tiers
    const totalLicenses = rawLicenses.length;
    const activeLicenses = rawLicenses.filter((lic) => lic.status === 'active').length;
    const standardLicenses = rawLicenses.filter((lic) => lic.licenseTier === 'standard' || !lic.licenseTier).length;
    const proLicenses = rawLicenses.filter((lic) => lic.licenseTier === 'pro').length;
    const unlimitedLicenses = rawLicenses.filter((lic) => lic.licenseTier === 'unlimited').length;

    // 5. SKU Breakdown
    const vowSkuCount = rawLicenses.filter((lic) => (lic.sku || '').toLowerCase().includes('vow')).length;
    const bundleSkuCount = rawLicenses.filter((lic) => (lic.sku || '').toLowerCase().includes('bundle') || (lic.sku || '').toLowerCase().includes('master')).length;

    // 6. Chronological Recent Activity Feed (Last 10 events)
    const sortedWorkspaces = [...workspaces].sort((a, b) => {
      const timeA = new Date(a.activatedAt || a.lastActiveAt || 0).getTime();
      const timeB = new Date(b.activatedAt || b.lastActiveAt || 0).getTime();
      return timeB - timeA;
    });

    const recentActivations = sortedWorkspaces.slice(0, 10).map((ws) => ({
      workspaceId: ws.workspaceId,
      spreadsheetName: ws.spreadsheetName || 'Untitled Workspace',
      productName: ws.productName || 'Sheet2Vow',
      userEmail: ws.userEmail,
      partnerEmail: ws.partnerEmail,
      orderId: ws.orderId || 'ETSY-VERIFIED',
      orderVerified: ws.orderVerified !== false,
      timestamp: ws.activatedAt || ws.lastActiveAt || new Date().toISOString(),
      spreadsheetId: ws.spreadsheetId,
      webViewLink: ws.webViewLink,
    }));

    // 7. Storage Engine Diagnostics
    const cloudDb = getCloudFirestore();
    const isCloudFirestore = Boolean(cloudDb);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      storage: {
        engine: isCloudFirestore ? 'Cloud Firestore' : 'Local Disk Cache',
        isCloudFirestore,
        status: 'healthy',
      },
      kpis: {
        totalWorkspaces,
        verifiedWorkspaces,
        unverifiedWorkspaces,
        verificationRate,
        totalLicenses,
        activeLicenses,
        soloWorkspaces,
        coupleWorkspaces,
        multiUserWorkspaces,
      },
      products: {
        vowWorkspaces,
        vaultWorkspaces,
      },
      licensingTiers: {
        standard: standardLicenses,
        pro: proLicenses,
        unlimited: unlimitedLicenses,
        vowSkus: vowSkuCount,
        bundleSkus: bundleSkuCount,
      },
      recentActivations,
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || 'Failed to compute dashboard telemetry.' },
      { status: 500 }
    );
  }
}
