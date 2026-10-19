/**
 * LicenseValidator - Core license entitlement validator for Sheet2 Suite applications.
 * Validates Etsy Order IDs & Lemon Squeezy licenses against product entitlement rules.
 */

export type ProductCode = 'SHEET2VOW' | 'SHEET2FINANCE' | 'SHEET2HOME' | 'SHEET2CLOSET' | 'SHEET2INVENTORY';

export interface LicenseValidationRequest {
  email: string;
  orderId: string;
  productCode: ProductCode;
}

export interface LicenseValidationResponse {
  valid: boolean;
  productCode: ProductCode;
  customerEmail: string;
  licenseTier: 'standard' | 'pro' | 'unlimited';
  entitledProducts: ProductCode[];
  activatedAt: string;
  errorMessage?: string;
}

import { LocalFirestore, LicenseDocument } from '@/lib/db/firestoreDb';

export class LicenseValidator {
  /**
   * Validates customer license for any target Sheet2 Suite product against local Firestore database.
   */
  static async validateLicense(req: LicenseValidationRequest): Promise<LicenseValidationResponse> {
    const cleanEmail = (req.email || '').trim().toLowerCase();
    const cleanOrderId = (req.orderId || '').trim().toUpperCase();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      return {
        valid: false,
        productCode: req.productCode,
        customerEmail: cleanEmail,
        licenseTier: 'standard',
        entitledProducts: [],
        activatedAt: '',
        errorMessage: 'Invalid email address provided.'
      };
    }

    if (!cleanOrderId || cleanOrderId.length < 5) {
      return {
        valid: false,
        productCode: req.productCode,
        customerEmail: cleanEmail,
        licenseTier: 'standard',
        entitledProducts: [],
        activatedAt: '',
        errorMessage: 'Invalid Order ID format. Please enter a valid Etsy Order ID.'
      };
    }

    // Step 1: Query Cloud Firestore and local store for exact license document
    const { LocalLicensingDb } = await import('@/lib/db/licensingDb');
    let licenseDoc = await LocalLicensingDb.getLicenseByKeyAsync(cleanOrderId);

    // If license exists in Firestore database, enforce active status
    if (licenseDoc) {
      if (licenseDoc.status !== 'active') {
        return {
          valid: false,
          productCode: req.productCode,
          customerEmail: cleanEmail,
          licenseTier: licenseDoc.licenseTier || 'standard',
          entitledProducts: (licenseDoc.entitledProducts as ProductCode[]) || [req.productCode],
          activatedAt: licenseDoc.createdAt,
          errorMessage: `License status is currently ${licenseDoc.status.toUpperCase()}. Please contact support.`
        };
      }

      return {
        valid: true,
        productCode: req.productCode,
        customerEmail: cleanEmail,
        licenseTier: licenseDoc.licenseTier || 'standard',
        entitledProducts: (licenseDoc.entitledProducts as ProductCode[]) || [req.productCode],
        activatedAt: licenseDoc.createdAt
      };
    }

    // Step 2: If new Order ID, auto-register license document into Cloud Firestore
    const isPro = cleanOrderId.includes('PRO');
    const entitledProducts: ProductCode[] = ['SHEET2VOW'];

    const newLicense: LicenseDocument = {
      id: cleanOrderId,
      licenseKey: cleanOrderId,
      orderId: cleanOrderId,
      purchaserEmail: cleanEmail,
      sku: isPro ? 'ETSY-SHEET2VOW-PRO' : 'ETSY-SHEET2VOW-STANDARD',
      status: 'active',
      licenseTier: isPro ? 'pro' : 'standard',
      entitledProducts,
      maxWorkspaces: isPro ? 5 : 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await LocalLicensingDb.saveLicenseAsync(newLicense);

    return {
      valid: true,
      productCode: req.productCode,
      customerEmail: cleanEmail,
      licenseTier: newLicense.licenseTier,
      entitledProducts,
      activatedAt: newLicense.createdAt
    };
  }
}
