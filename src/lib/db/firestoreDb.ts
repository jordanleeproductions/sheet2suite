/**
 * Firestore-Compatible Local Document Database Engine for Sheet2Suite
 * Mirrors Firebase Firestore collections (/licenses, /workspaces, /users)
 * Stores document snapshots locally under data/firestore/{collection}/{docId}.json
 * Provides a 1-to-1 migration path to Firebase Firestore SDK when ready for production cloud deployment.
 */

import fs from 'fs';
import path from 'path';

export interface LicenseDocument {
  id: string; // Document ID (licenseKey / orderId)
  licenseKey: string;
  orderId: string;
  purchaserEmail: string;
  sku: string;
  status: 'active' | 'revoked' | 'expired';
  licenseTier: 'standard' | 'pro' | 'unlimited';
  entitledProducts: string[];
  maxWorkspaces: number;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceDocument {
  id: string; // Document ID (workspaceId)
  workspaceId: string;
  userEmail: string;
  partnerEmail?: string;
  coPlanners?: string[];
  spreadsheetId: string;
  spreadsheetName: string;
  driveFolderPath: string;
  webViewLink: string;
  productName: string;
  orderId?: string;
  orderVerified: boolean;
  createdAt: string;
  lastActiveAt: string;
}

export interface UserDocument {
  id: string; // Document ID (userEmail)
  email: string;
  displayName?: string;
  activeWorkspaces: string[];
  createdAt: string;
}

const FIRESTORE_BASE_DIR = path.join(process.cwd(), 'data', 'firestore');

function ensureCollectionDir(collectionName: string): string {
  const dirPath = path.join(FIRESTORE_BASE_DIR, collectionName);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
  return dirPath;
}

// Seed default entitlement licenses into Firestore licenses collection if empty
function seedDefaultLicenses() {
  const collectionDir = ensureCollectionDir('licenses');
  const seededKeys = ['ETSY-98765432', 'ETSY-12345678', 'ETSY-DEMO-9876', 'S2S-MASTER-PASS-2026'];

  seededKeys.forEach((key) => {
    const docPath = path.join(collectionDir, `${key.toLowerCase()}.json`);
    if (!fs.existsSync(docPath)) {
      const isBundle = key.includes('MASTER') || key.includes('DEMO');
      const seedDoc: LicenseDocument = {
        id: key,
        licenseKey: key,
        orderId: key,
        purchaserEmail: 'jordanleeproductions@gmail.com',
        sku: isBundle ? 'ETSY-MASTER-SUITE-BUNDLE' : 'ETSY-SHEET2VOW-PRO',
        status: 'active',
        licenseTier: isBundle ? 'pro' : 'standard',
        entitledProducts: isBundle
          ? ['SHEET2VOW', 'SHEET2FINANCE', 'SHEET2HOME', 'SHEET2CLOSET', 'SHEET2INVENTORY']
          : ['SHEET2VOW'],
        maxWorkspaces: isBundle ? 10 : 2,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      fs.writeFileSync(docPath, JSON.stringify(seedDoc, null, 2), 'utf-8');
    }
  });
}

// Automatically seed on module load
seedDefaultLicenses();

export const LocalFirestore = {
  /**
   * Reads a document by Collection Name & Document ID (Firestore doc().get())
   */
  getDoc<T = any>(collectionName: string, docId: string): T | null {
    try {
      const dirPath = ensureCollectionDir(collectionName);
      const filePath = path.join(dirPath, `${docId.toLowerCase().trim()}.json`);
      if (!fs.existsSync(filePath)) return null;

      const raw = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(raw) as T;
    } catch (e) {
      console.error(`LocalFirestore Error reading ${collectionName}/${docId}:`, e);
      return null;
    }
  },

  /**
   * Writes a document by Collection Name & Document ID (Firestore setDoc())
   */
  setDoc<T = any>(collectionName: string, docId: string, data: T): T {
    const dirPath = ensureCollectionDir(collectionName);
    const filePath = path.join(dirPath, `${docId.toLowerCase().trim()}.json`);
    const docWithId = { id: docId, updatedAt: new Date().toISOString(), ...data };
    fs.writeFileSync(filePath, JSON.stringify(docWithId, null, 2), 'utf-8');
    return docWithId as unknown as T;
  },

  /**
   * Deletes a document by Collection Name & Document ID / matching property (Firestore deleteDoc())
   */
  deleteDoc(collectionName: string, docId: string): boolean {
    const dirPath = ensureCollectionDir(collectionName);
    const targetNorm = docId.toLowerCase().trim();
    const filePath = path.join(dirPath, `${targetNorm}.json`);

    let hasDeleted = false;

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      hasDeleted = true;
    }

    // Also scan all JSON files in the collection directory to match any document field
    try {
      const files = fs.readdirSync(dirPath);
      for (const file of files) {
        if (file.endsWith('.json')) {
          const fullPath = path.join(dirPath, file);
          if (fs.existsSync(fullPath)) {
            const raw = fs.readFileSync(fullPath, 'utf-8');
            const doc = JSON.parse(raw);
            if (
              String(doc.id || '').toLowerCase() === targetNorm ||
              String(doc.workspaceId || '').toLowerCase() === targetNorm ||
              String(doc.spreadsheetId || '').toLowerCase() === targetNorm ||
              String(doc.licenseKey || '').toLowerCase() === targetNorm ||
              String(doc.orderId || '').toLowerCase() === targetNorm ||
              String(doc.userEmail || '').toLowerCase() === targetNorm ||
              String(doc.purchaserEmail || '').toLowerCase() === targetNorm
            ) {
              fs.unlinkSync(fullPath);
              hasDeleted = true;
            }
          }
        }
      }
    } catch (err) {
      console.error(`LocalFirestore error during scan delete in ${collectionName}:`, err);
    }

    return hasDeleted;
  },

  /**
   * Retrieves all documents in a collection (Firestore getDocs())
   */
  getDocs<T = any>(collectionName: string): T[] {
    try {
      const dirPath = ensureCollectionDir(collectionName);
      const files = fs.readdirSync(dirPath);
      const docs: T[] = [];

      for (const file of files) {
        if (file.endsWith('.json')) {
          const raw = fs.readFileSync(path.join(dirPath, file), 'utf-8');
          docs.push(JSON.parse(raw) as T);
        }
      }
      return docs;
    } catch (e) {
      console.error(`LocalFirestore Error listing collection ${collectionName}:`, e);
      return [];
    }
  },

  /**
   * Simple query helper to filter collection documents by field equality
   */
  query<T = any>(collectionName: string, field: keyof T, value: any): T[] {
    const all = this.getDocs<T>(collectionName);
    const targetStr = String(value).trim().toLowerCase();
    return all.filter((doc) => {
      const val = doc[field];
      if (typeof val === 'string') return val.trim().toLowerCase() === targetStr;
      return val === value;
    });
  },

  /**
   * Purges all documents across all collections in the local database
   */
  purgeAll(): void {
    if (fs.existsSync(FIRESTORE_BASE_DIR)) {
      fs.rmSync(FIRESTORE_BASE_DIR, { recursive: true, force: true });
    }
    seedDefaultLicenses();
  },
};
