import fs from 'fs';
import path from 'path';
import { Sheet2SuiteLicense } from '@/lib/sheets/types';

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

const DATA_DIR = path.join(process.cwd(), 'data');
const WORKSPACES_FILE = path.join(DATA_DIR, 'workspaces.json');
const LICENSES_FILE = path.join(DATA_DIR, 'licenses.json');

// Ensure data directory exists
function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Read JSON helper
function readJsonFile<T>(filePath: string, defaultValue: T): T {
  ensureDataDir();
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf-8');
    return defaultValue;
  }
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as T;
  } catch (e) {
    console.error(`Error reading ${filePath}:`, e);
    return defaultValue;
  }
}

// Write JSON helper
function writeJsonFile<T>(filePath: string, data: T): void {
  ensureDataDir();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

import { LocalFirestore, WorkspaceDocument, LicenseDocument } from '@/lib/db/firestoreDb';

/**
 * Local Data Store Engine (Delegates to Firestore-compatible LocalFirestore document store)
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
      writeJsonFile(WORKSPACES_FILE, LocalFirestore.getDocs('workspaces'));
      return updated;
    } else {
      const workspaceId = record.workspaceId || `ws_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      const newRecord: WorkspaceRecord = {
        workspaceId,
        activatedAt: now,
        lastActiveAt: now,
        ...record,
      };
      LocalFirestore.setDoc('workspaces', workspaceId, newRecord);
      writeJsonFile(WORKSPACES_FILE, LocalFirestore.getDocs('workspaces'));
      return newRecord;
    }
  },

  // 3. License verification helper
  getLicenseByKey(licenseKey: string): Sheet2SuiteLicense | null {
    const doc = LocalFirestore.getDoc<LicenseDocument>('licenses', licenseKey);
    if (doc) {
      return {
        licenseKey: doc.licenseKey,
        orderId: doc.orderId,
        purchaserEmail: doc.purchaserEmail,
        sku: doc.sku,
        status: doc.status,
      };
    }
    const licenses = readJsonFile<Sheet2SuiteLicense[]>(LICENSES_FILE, []);
    return licenses.find((l) => l.licenseKey.toLowerCase() === licenseKey.trim().toLowerCase()) || null;
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
      licenseTier: license.sku.includes('MASTER') ? 'pro' : 'standard',
      entitledProducts: ['SHEET2VOW'],
      maxWorkspaces: 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    LocalFirestore.setDoc('licenses', license.licenseKey, doc);
    writeJsonFile(LICENSES_FILE, LocalFirestore.getDocs('licenses'));
    return license;
  },

  // 5. Admin methods: list all workspaces & licenses
  getAllWorkspaces(): WorkspaceRecord[] {
    const fsWorkspaces = LocalFirestore.getDocs<WorkspaceRecord>('workspaces');
    if (fsWorkspaces.length > 0) return fsWorkspaces;
    return readJsonFile<WorkspaceRecord[]>(WORKSPACES_FILE, []);
  },

  getAllLicenses(): Sheet2SuiteLicense[] {
    const fsDocs = LocalFirestore.getDocs<LicenseDocument>('licenses');
    if (fsDocs.length > 0) {
      return fsDocs.map((doc) => ({
        licenseKey: doc.licenseKey,
        orderId: doc.orderId,
        purchaserEmail: doc.purchaserEmail,
        sku: doc.sku,
        status: doc.status,
      }));
    }
    return readJsonFile<Sheet2SuiteLicense[]>(LICENSES_FILE, []);
  },

  deleteWorkspace(targetId: string): boolean {
    const deletedFs = LocalFirestore.deleteDoc('workspaces', targetId);
    const workspaces = readJsonFile<WorkspaceRecord[]>(WORKSPACES_FILE, []);
    const targetNormalized = targetId.trim().toLowerCase();
    const filtered = workspaces.filter(
      (w) =>
        w.workspaceId !== targetId &&
        w.spreadsheetId !== targetId &&
        w.userEmail.toLowerCase() !== targetNormalized &&
        (w.orderId ? w.orderId.toLowerCase() !== targetNormalized : true)
    );
    writeJsonFile(WORKSPACES_FILE, filtered);
    return deletedFs || filtered.length < workspaces.length;
  },

  deleteAllWorkspaces(): void {
    const collectionDir = path.join(DATA_DIR, 'firestore', 'workspaces');
    if (fs.existsSync(collectionDir)) {
      fs.rmSync(collectionDir, { recursive: true, force: true });
    }
    writeJsonFile(WORKSPACES_FILE, []);
  },

  deleteLicense(licenseKey: string): boolean {
    const deletedFs = LocalFirestore.deleteDoc('licenses', licenseKey);
    const licenses = readJsonFile<Sheet2SuiteLicense[]>(LICENSES_FILE, []);
    const targetNormalized = licenseKey.trim().toLowerCase();
    const filtered = licenses.filter((l) => l.licenseKey.toLowerCase() !== targetNormalized);
    writeJsonFile(LICENSES_FILE, filtered);
    return deletedFs || filtered.length < licenses.length;
  },

  deleteAllLicenses(): void {
    LocalFirestore.purgeAll();
    writeJsonFile(LICENSES_FILE, []);
  },
};
