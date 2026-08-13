import { Sheet2SuiteLicense } from '@/types/licensing';
import { LocalFirestore, LicenseDocument } from '@/lib/db/firestoreDb';

export interface WorkspaceRecord {
  workspaceId: string;
  userEmail: string;
  partnerEmail?: string;
  spreadsheetId: string;
  spreadsheetName: string;
  driveFolderPath: string;
  webViewLink: string;
  productName: 'Sheet2Vow' | 'Sheet2Home' | 'Sheet2Finance';
  orderId?: string;
  orderVerified?: boolean;
  activatedAt: string;
  lastActiveAt: string;
}

/**
 * Local Data Store Engine (Unified strictly on LocalFirestore document engine)
 */
export const LocalLicensingDb = {
  // 1. Get all workspaces for a user or partner email
  getWorkspacesByEmail(email: string): WorkspaceRecord[] {
    const normalized = email.trim().toLowerCase();
    const workspaces = LocalFirestore.getDocs<WorkspaceRecord>('workspaces');
    return workspaces.filter(
      (w) =>
        w.userEmail.toLowerCase() === normalized ||
        (w.partnerEmail && w.partnerEmail.toLowerCase() === normalized)
    );
  },

  // 2. Save or update a workspace record
  saveWorkspace(record: Omit<WorkspaceRecord, 'workspaceId' | 'activatedAt' | 'lastActiveAt'> & { workspaceId?: string }): WorkspaceRecord {
    const workspaces = LocalFirestore.getDocs<WorkspaceRecord>('workspaces');
    const now = new Date().toISOString();

    const existingIndex = workspaces.findIndex(
      (w) => w.spreadsheetId === record.spreadsheetId || (record.workspaceId && w.workspaceId === record.workspaceId)
    );

    if (existingIndex >= 0) {
      const updated: WorkspaceRecord = {
        ...workspaces[existingIndex],
        ...record,
        lastActiveAt: now,
      };
      LocalFirestore.setDoc('workspaces', updated.workspaceId, updated);
      return updated;
    } else {
      const workspaceId = record.workspaceId || `ws_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      const newRecord: WorkspaceRecord = {
        workspaceId,
        activatedAt: now,
        lastActiveAt: now,
        ...record,
      };
      LocalFirestore.setDoc('workspaces', workspaceId, newRecord);
      return newRecord;
    }
  },

  // 3. License verification helper
  getLicenseByKey(licenseKey: string): Sheet2SuiteLicense | null {
    const doc = LocalFirestore.getDoc<LicenseDocument>('licenses', licenseKey);
    if (!doc) return null;

    const sku = (doc.sku.includes('MASTER') || doc.sku.includes('BUNDLE') ? 'sheet2suite_bundle' : 'sheet2vow') as any;
    return {
      licenseKey: doc.licenseKey,
      orderId: doc.orderId,
      purchasePlatform: 'etsy',
      purchaserEmail: doc.purchaserEmail,
      sku,
      productAccess: {
        sheet2vow: true,
        sheet2home: sku === 'sheet2suite_bundle',
        sheet2finance: sku === 'sheet2suite_bundle',
      },
      status: (doc.status === 'revoked' ? 'revoked' : doc.status === 'expired' ? 'expired' : 'active') as any,
      createdAt: doc.createdAt,
    };
  },

  // 4. Register new license
  saveLicense(license: Sheet2SuiteLicense): Sheet2SuiteLicense {
    const doc: LicenseDocument = {
      id: license.licenseKey,
      licenseKey: license.licenseKey,
      orderId: license.orderId,
      purchaserEmail: license.purchaserEmail,
      sku: license.sku,
      status: license.status as any,
      licenseTier: license.sku.includes('bundle') ? 'pro' : 'standard',
      entitledProducts: license.sku.includes('bundle')
        ? ['SHEET2VOW', 'SHEET2FINANCE', 'SHEET2HOME']
        : ['SHEET2VOW'],
      maxWorkspaces: 2,
      createdAt: license.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    LocalFirestore.setDoc('licenses', license.licenseKey, doc);
    return license;
  },

  // 5. Admin methods: list all workspaces & licenses
  getAllWorkspaces(): WorkspaceRecord[] {
    return LocalFirestore.getDocs<WorkspaceRecord>('workspaces');
  },

  getAllLicenses(): Sheet2SuiteLicense[] {
    const fsDocs = LocalFirestore.getDocs<LicenseDocument>('licenses');
    return fsDocs.map((doc) => {
      const sku = (doc.sku.includes('MASTER') || doc.sku.includes('BUNDLE') || doc.sku === 'sheet2suite_bundle' ? 'sheet2suite_bundle' : 'sheet2vow') as any;
      return {
        licenseKey: doc.licenseKey,
        orderId: doc.orderId,
        purchasePlatform: 'etsy' as const,
        purchaserEmail: doc.purchaserEmail,
        sku,
        productAccess: {
          sheet2vow: true,
          sheet2home: sku === 'sheet2suite_bundle',
          sheet2finance: sku === 'sheet2suite_bundle',
        },
        status: (doc.status === 'revoked' ? 'revoked' : doc.status === 'expired' ? 'expired' : 'active') as any,
        createdAt: doc.createdAt,
      };
    });
  },

  deleteWorkspace(targetId: string): boolean {
    return LocalFirestore.deleteDoc('workspaces', targetId);
  },

  deleteAllWorkspaces(): void {
    const fsWorkspaces = LocalFirestore.getDocs<WorkspaceRecord>('workspaces');
    for (const ws of fsWorkspaces) {
      LocalFirestore.deleteDoc('workspaces', ws.workspaceId);
    }
  },

  deleteLicense(licenseKey: string): boolean {
    return LocalFirestore.deleteDoc('licenses', licenseKey);
  },

  deleteAllLicenses(): void {
    LocalFirestore.purgeAll();
  },
};
