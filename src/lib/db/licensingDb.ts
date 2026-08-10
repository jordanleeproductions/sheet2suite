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

/**
 * Local Data Store Engine (Can swap to Firebase / Firestore cleanly)
 */
export const LocalLicensingDb = {
  // 1. Get all workspaces for a user or partner email
  getWorkspacesByEmail(email: string): WorkspaceRecord[] {
    const normalized = email.trim().toLowerCase();
    const workspaces = readJsonFile<WorkspaceRecord[]>(WORKSPACES_FILE, []);
    return workspaces.filter(
      (w) =>
        w.userEmail.toLowerCase() === normalized ||
        (w.partnerEmail && w.partnerEmail.toLowerCase() === normalized)
    );
  },

  // 2. Save or update a workspace record
  saveWorkspace(record: Omit<WorkspaceRecord, 'workspaceId' | 'activatedAt' | 'lastActiveAt'> & { workspaceId?: string }): WorkspaceRecord {
    const workspaces = readJsonFile<WorkspaceRecord[]>(WORKSPACES_FILE, []);
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
      workspaces[existingIndex] = updated;
      writeJsonFile(WORKSPACES_FILE, workspaces);
      return updated;
    } else {
      const newRecord: WorkspaceRecord = {
        workspaceId: record.workspaceId || `ws_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
        activatedAt: now,
        lastActiveAt: now,
        ...record,
      };
      workspaces.push(newRecord);
      writeJsonFile(WORKSPACES_FILE, workspaces);
      return newRecord;
    }
  },

  // 3. License verification helper
  getLicenseByKey(licenseKey: string): Sheet2SuiteLicense | null {
    const licenses = readJsonFile<Sheet2SuiteLicense[]>(LICENSES_FILE, []);
    return licenses.find((l) => l.licenseKey.toLowerCase() === licenseKey.trim().toLowerCase()) || null;
  },

  // 4. Register new license
  saveLicense(license: Sheet2SuiteLicense): Sheet2SuiteLicense {
    const licenses = readJsonFile<Sheet2SuiteLicense[]>(LICENSES_FILE, []);
    const index = licenses.findIndex((l) => l.licenseKey === license.licenseKey);
    if (index >= 0) {
      licenses[index] = license;
    } else {
      licenses.push(license);
    }
    writeJsonFile(LICENSES_FILE, licenses);
    return license;
  },

  // 5. Admin methods: list all workspaces & licenses
  getAllWorkspaces(): WorkspaceRecord[] {
    return readJsonFile<WorkspaceRecord[]>(WORKSPACES_FILE, []);
  },

  getAllLicenses(): Sheet2SuiteLicense[] {
    return readJsonFile<Sheet2SuiteLicense[]>(LICENSES_FILE, []);
  },

  deleteWorkspace(targetId: string): boolean {
    const workspaces = readJsonFile<WorkspaceRecord[]>(WORKSPACES_FILE, []);
    const targetNormalized = targetId.trim().toLowerCase();
    const filtered = workspaces.filter(
      (w) =>
        w.workspaceId !== targetId &&
        w.spreadsheetId !== targetId &&
        w.userEmail.toLowerCase() !== targetNormalized
    );
    writeJsonFile(WORKSPACES_FILE, filtered);
    return filtered.length < workspaces.length;
  },

  deleteLicense(licenseKey: string): boolean {
    const licenses = readJsonFile<Sheet2SuiteLicense[]>(LICENSES_FILE, []);
    const filtered = licenses.filter((l) => l.licenseKey !== licenseKey);
    writeJsonFile(LICENSES_FILE, filtered);
    return filtered.length < licenses.length;
  },
};
