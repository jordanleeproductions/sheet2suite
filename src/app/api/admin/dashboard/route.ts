import { NextRequest, NextResponse } from 'next/server';
import { requireAdminAuth } from '@/lib/auth/adminAuth';
import { LocalLicensingDb } from '@/lib/db/licensingDb';
import { getCloudFirestore } from '@/lib/db/firestoreDb';

/**
 * GET /api/admin/dashboard
 * Aggregates high-leverage platform KPIs, unique user telemetry, collaboration ratios,
 * multi-product user cross-pollination, and recent activation streams for the executive dashboard tool.
 */
export async function GET(req: NextRequest) {
  const authError = requireAdminAuth(req);
  if (authError) return authError;

  try {
    const workspaces = await LocalLicensingDb.getAllWorkspacesAsync();
    const rawLicenses = await LocalLicensingDb.getAllLicensesAsync();

    // Helper to normalize product names to canonical suite keys
    const normalizeProduct = (name?: string): string => {
      if (!name) return 'Sheet2Vow';
      const clean = name.trim().toLowerCase();
      if (clean.includes('vault')) return 'Sheet2Vault';
      if (clean.includes('vow')) return 'Sheet2Vow';
      if (clean.includes('finance')) return 'Sheet2Finance';
      if (clean.includes('home')) return 'Sheet2Home';
      return name.trim();
    };

    // User aggregation collections
    const uniqueUserEmails = new Set<string>();
    const uniquePrimaryOwners = new Set<string>();
    const uniqueCoUsers = new Set<string>();
    const uniqueLicenseHolders = new Set<string>();

    // User product footprint map: email -> Set of normalized products
    const userProductsMap = new Map<string, Set<string>>();
    // User workspaces count map: email -> number
    const userWorkspacesMap = new Map<string, number>();
    // User licenses count map: email -> number
    const userLicensesMap = new Map<string, number>();

    const recordUserProduct = (email: string, product: string) => {
      const normalizedEmail = email.trim().toLowerCase();
      if (!normalizedEmail) return;
      uniqueUserEmails.add(normalizedEmail);
      if (!userProductsMap.has(normalizedEmail)) {
        userProductsMap.set(normalizedEmail, new Set());
      }
      userProductsMap.get(normalizedEmail)!.add(normalizeProduct(product));
    };

    // 1. Workspaces Pulse & Instance Telemetry
    const totalWorkspaces = workspaces.length;
    const verifiedWorkspaces = workspaces.filter((w) => w.orderVerified !== false).length;
    const unverifiedWorkspaces = totalWorkspaces - verifiedWorkspaces;
    const verificationRate = totalWorkspaces > 0 ? Math.round((verifiedWorkspaces / totalWorkspaces) * 100) : 100;

    // Co-user instances calculations
    let instancesWithCoUsers = 0;
    let soloInstances = 0;
    let twoUserInstances = 0;
    let multiCollaboratorInstances = 0;
    let totalAttachedCoUsers = 0;

    for (const ws of workspaces) {
      const prod = normalizeProduct(ws.productName);
      const ownerEmail = ws.userEmail?.trim().toLowerCase();

      if (ownerEmail) {
        uniquePrimaryOwners.add(ownerEmail);
        recordUserProduct(ownerEmail, prod);
        userWorkspacesMap.set(ownerEmail, (userWorkspacesMap.get(ownerEmail) || 0) + 1);
      }

      // Collect distinct co-users for this instance
      const instanceCoUsers = new Set<string>();

      if (ws.partnerEmail?.trim()) {
        const partner = ws.partnerEmail.trim().toLowerCase();
        if (partner !== ownerEmail) {
          instanceCoUsers.add(partner);
          uniqueCoUsers.add(partner);
          recordUserProduct(partner, prod);
        }
      }

      if (Array.isArray(ws.coPlanners)) {
        for (const cp of ws.coPlanners) {
          if (cp?.trim()) {
            const planner = cp.trim().toLowerCase();
            if (planner !== ownerEmail) {
              instanceCoUsers.add(planner);
              uniqueCoUsers.add(planner);
              recordUserProduct(planner, prod);
            }
          }
        }
      }

      if (instanceCoUsers.size > 0) {
        instancesWithCoUsers += 1;
        totalAttachedCoUsers += instanceCoUsers.size;
        if (instanceCoUsers.size === 1) {
          twoUserInstances += 1;
        } else {
          multiCollaboratorInstances += 1;
        }
      } else {
        soloInstances += 1;
      }
    }

    const coUserAttachmentRate = totalWorkspaces > 0
      ? Math.round((instancesWithCoUsers / totalWorkspaces) * 100)
      : 0;

    // 2. Licenses & Tiers
    const totalLicenses = rawLicenses.length;
    const activeLicenses = rawLicenses.filter((lic) => lic.status === 'active').length;
    const standardLicenses = rawLicenses.filter((lic) => lic.licenseTier === 'standard' || !lic.licenseTier).length;
    const proLicenses = rawLicenses.filter((lic) => lic.licenseTier === 'pro').length;
    const unlimitedLicenses = rawLicenses.filter((lic) => lic.licenseTier === 'unlimited').length;

    // SKU Breakdown
    const vowSkuCount = rawLicenses.filter((lic) => (lic.sku || '').toLowerCase().includes('vow')).length;
    const bundleSkuCount = rawLicenses.filter((lic) => (lic.sku || '').toLowerCase().includes('bundle') || (lic.sku || '').toLowerCase().includes('master')).length;

    // Ingest licenses into user footprint
    for (const lic of rawLicenses) {
      const purchaser = lic.purchaserEmail?.trim().toLowerCase();
      if (purchaser) {
        uniqueLicenseHolders.add(purchaser);
        userLicensesMap.set(purchaser, (userLicensesMap.get(purchaser) || 0) + 1);
        if (Array.isArray(lic.entitledProducts) && lic.entitledProducts.length > 0) {
          lic.entitledProducts.forEach((ep) => recordUserProduct(purchaser, ep));
        } else if (lic.sku) {
          if (lic.sku.toLowerCase().includes('vault')) recordUserProduct(purchaser, 'Sheet2Vault');
          if (lic.sku.toLowerCase().includes('vow')) recordUserProduct(purchaser, 'Sheet2Vow');
          if (lic.sku.toLowerCase().includes('bundle') || lic.sku.toLowerCase().includes('master')) {
            recordUserProduct(purchaser, 'Sheet2Vow');
            recordUserProduct(purchaser, 'Sheet2Vault');
          }
        } else {
          recordUserProduct(purchaser, 'Sheet2Vow');
        }
      }

      const redeemer = (lic as any).usedBy?.trim().toLowerCase();
      if (redeemer) {
        uniqueUserEmails.add(redeemer);
        if (Array.isArray(lic.entitledProducts) && lic.entitledProducts.length > 0) {
          lic.entitledProducts.forEach((ep) => recordUserProduct(redeemer, ep));
        }
      }
    }

    // 3. Multi-Product Intelligence
    const userProductSummaries: {
      email: string;
      products: string[];
      productCount: number;
      workspaceCount: number;
      licenseCount: number;
      hasVow: boolean;
      hasVault: boolean;
      isMultiProduct: boolean;
    }[] = [];

    const combinationCounts = new Map<string, { count: number; products: string[] }>();
    let multiProductUsersCount = 0;
    let singleProductUsersCount = 0;

    let vowUsersCount = 0;
    let vaultUsersCount = 0;
    let financeUsersCount = 0;
    let homeUsersCount = 0;

    userProductsMap.forEach((productSet, email) => {
      const products = Array.from(productSet).sort();
      const count = products.length;
      const isMulti = count >= 2;
      const hasVow = products.includes('Sheet2Vow');
      const hasVault = products.includes('Sheet2Vault');

      if (hasVow) vowUsersCount += 1;
      if (hasVault) vaultUsersCount += 1;
      if (products.includes('Sheet2Finance')) financeUsersCount += 1;
      if (products.includes('Sheet2Home')) homeUsersCount += 1;

      if (isMulti) {
        multiProductUsersCount += 1;
        const comboKey = products.join(' + ');
        const existing = combinationCounts.get(comboKey) || { count: 0, products };
        existing.count += 1;
        combinationCounts.set(comboKey, existing);
      } else if (count === 1) {
        singleProductUsersCount += 1;
      }

      userProductSummaries.push({
        email,
        products,
        productCount: count,
        workspaceCount: userWorkspacesMap.get(email) || 0,
        licenseCount: userLicensesMap.get(email) || 0,
        hasVow,
        hasVault,
        isMultiProduct: isMulti,
      });
    });

    // Sort users: multi-product users first, then by productCount desc, then by email
    userProductSummaries.sort((a, b) => {
      if (a.isMultiProduct && !b.isMultiProduct) return -1;
      if (!a.isMultiProduct && b.isMultiProduct) return 1;
      if (b.productCount !== a.productCount) return b.productCount - a.productCount;
      return a.email.localeCompare(b.email);
    });

    const multiProductRate = uniqueUserEmails.size > 0
      ? Math.round((multiProductUsersCount / uniqueUserEmails.size) * 100)
      : 0;

    const combinations = Array.from(combinationCounts.entries())
      .map(([combination, meta]) => ({
        combination,
        count: meta.count,
        products: meta.products,
      }))
      .sort((a, b) => b.count - a.count);

    // 4. Product Breakdown (workspaces)
    const vowWorkspaces = workspaces.filter((w) => !w.productName || w.productName === 'Sheet2Vow').length;
    const vaultWorkspaces = workspaces.filter((w) => w.productName === 'Sheet2Vault').length;

    // 5. Chronological Recent Activity Feed (Last 10 events)
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

    // 6. Storage Engine Diagnostics
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
        soloWorkspaces: soloInstances,
        coupleWorkspaces: twoUserInstances,
        multiUserWorkspaces: multiCollaboratorInstances,
        instancesWithCoUsers,
        soloInstances,
        coUserAttachmentRate,
        totalUniqueUsers: uniqueUserEmails.size,
        uniquePrimaryOwners: uniquePrimaryOwners.size,
        uniqueCoUsers: uniqueCoUsers.size,
        uniqueLicenseHolders: uniqueLicenseHolders.size,
        multiProductUsersCount,
        singleProductUsersCount,
        multiProductRate,
      },
      uniqueUsers: {
        total: uniqueUserEmails.size,
        primaryOwners: uniquePrimaryOwners.size,
        coUsers: uniqueCoUsers.size,
        licenseHolders: uniqueLicenseHolders.size,
      },
      coUserInstances: {
        totalWithCoUsers: instancesWithCoUsers,
        soloInstances,
        attachmentRate: coUserAttachmentRate,
        twoUserInstances,
        multiCollaboratorInstances,
        totalAttachedCoUsers,
        avgCoUsersPerInstance: instancesWithCoUsers > 0 ? Number((totalAttachedCoUsers / instancesWithCoUsers).toFixed(1)) : 0,
      },
      multiProductTelemetry: {
        multiProductUsersCount,
        singleProductUsersCount,
        zeroProductUsersCount: Math.max(0, uniqueUserEmails.size - multiProductUsersCount - singleProductUsersCount),
        multiProductRate,
        productCounts: {
          vowUsers: vowUsersCount,
          vaultUsers: vaultUsersCount,
          financeUsers: financeUsersCount,
          homeUsers: homeUsersCount,
        },
        combinations,
        users: userProductSummaries,
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
