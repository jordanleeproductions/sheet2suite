import { Sheet2SuiteLicense } from '@/types/licensing';
import { LocalFirestore, LicenseDocument, getCloudFirestore } from '@/lib/db/firestoreDb';

export interface WorkspaceRecord {
  workspaceId: string;
  userEmail: string;
  partnerEmail?: string;
  coPlanners?: string[];
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
        w.userEmail?.toLowerCase() === normalized ||
        (w.partnerEmail && w.partnerEmail.toLowerCase() === normalized) ||
        (w.coPlanners && Array.isArray(w.coPlanners) && w.coPlanners.some((cp) => cp.trim().toLowerCase() === normalized))
    );
  },

  // 1b. Async query checking Cloud Firestore + local fallback
  async getWorkspacesByEmailAsync(email: string): Promise<WorkspaceRecord[]> {
    const normalized = email.trim().toLowerCase();
    const cloudDb = getCloudFirestore();
    const results: WorkspaceRecord[] = [];
    const seenIds = new Set<string>();

    if (cloudDb) {
      try {
        // Query 1: userEmail
        const qUser = await cloudDb.collection('workspaces').where('userEmail', '==', normalized).get();
        qUser.forEach((doc: any) => {
          const data = doc.data() as WorkspaceRecord;
          const id = data.workspaceId || doc.id;
          if (!seenIds.has(id)) {
            seenIds.add(id);
            results.push(data);
          }
        });

        // Query 2: partnerEmail
        const qPartner = await cloudDb.collection('workspaces').where('partnerEmail', '==', normalized).get();
        qPartner.forEach((doc: any) => {
          const data = doc.data() as WorkspaceRecord;
          const id = data.workspaceId || doc.id;
          if (!seenIds.has(id)) {
            seenIds.add(id);
            results.push(data);
          }
        });

        // Query 3: coPlanners array-contains
        const qCo = await cloudDb.collection('workspaces').where('coPlanners', 'array-contains', normalized).get();
        qCo.forEach((doc: any) => {
          const data = doc.data() as WorkspaceRecord;
          const id = data.workspaceId || doc.id;
          if (!seenIds.has(id)) {
            seenIds.add(id);
            results.push(data);
          }
        });

        if (results.length > 0) return results;
      } catch (err: any) {
        console.warn('[LicensingDb] Error querying Cloud Firestore workspaces by email:', err?.message);
      }
    }

    // Local file storage scan fallback
    return this.getWorkspacesByEmail(email);
  },

  // 1c. Find workspace by spreadsheet ID async
  async getWorkspaceBySpreadsheetIdAsync(spreadsheetId: string): Promise<WorkspaceRecord | null> {
    const cleanId = spreadsheetId.trim();
    const cloudDb = getCloudFirestore();
    if (cloudDb) {
      try {
        const snap = await cloudDb.collection('workspaces').where('spreadsheetId', '==', cleanId).limit(1).get();
        if (!snap.empty) {
          return snap.docs[0].data() as WorkspaceRecord;
        }
      } catch (err: any) {
        console.warn('[LicensingDb] Error querying Cloud Firestore by spreadsheetId:', err?.message);
      }
    }

    const localAll = LocalFirestore.getDocs<WorkspaceRecord>('workspaces');
    return localAll.find((w) => w.spreadsheetId === cleanId) || null;
  },

  // 1d. Add co-planner email to an existing workspace
  async addCoPlannerAsync(spreadsheetId: string, coPlannerEmail: string): Promise<WorkspaceRecord | null> {
    const cleanId = spreadsheetId.trim();
    const normalizedEmail = coPlannerEmail.trim().toLowerCase();
    const workspace = await this.getWorkspaceBySpreadsheetIdAsync(cleanId);
    if (!workspace) return null;

    if (
      workspace.userEmail?.toLowerCase() === normalizedEmail ||
      workspace.partnerEmail?.toLowerCase() === normalizedEmail
    ) {
      return workspace;
    }

    const existingCoPlanners = Array.isArray(workspace.coPlanners) ? [...workspace.coPlanners] : [];
    if (!existingCoPlanners.some((cp) => cp.trim().toLowerCase() === normalizedEmail)) {
      existingCoPlanners.push(normalizedEmail);
      workspace.coPlanners = existingCoPlanners;
      workspace.lastActiveAt = new Date().toISOString();

      await LocalFirestore.setDocAsync('workspaces', workspace.workspaceId, workspace);
    }

    return workspace;
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
