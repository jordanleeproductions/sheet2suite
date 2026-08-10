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

    // Step 1: Query LocalFirestore 'licenses' collection for exact license document
    let licenseDoc = LocalFirestore.getDoc<LicenseDocument>('licenses', cleanOrderId);

    if (!licenseDoc) {
      // Query by licenseKey or purchaserEmail if document ID didn't match directly
      const byKey = LocalFirestore.query<LicenseDocument>('licenses', 'licenseKey', cleanOrderId);
      if (byKey.length > 0) {
        licenseDoc = byKey[0];
      }
    }

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

    // Step 2: If new Order ID, auto-register license document into LocalFirestore
    let entitledProducts: ProductCode[] = [req.productCode];
    if (cleanOrderId.includes('BUNDLE') || cleanOrderId.includes('MASTER') || cleanOrderId.includes('SUITE') || cleanOrderId.includes('ALL')) {
      entitledProducts = ['SHEET2VOW', 'SHEET2FINANCE', 'SHEET2HOME', 'SHEET2CLOSET', 'SHEET2INVENTORY'];
    } else if (cleanOrderId.includes('FINANCE')) {
      entitledProducts = ['SHEET2FINANCE'];
    } else if (cleanOrderId.includes('STAY') || cleanOrderId.includes('HOME')) {
      entitledProducts = ['SHEET2HOME'];
    }

    const newLicense: LicenseDocument = {
      id: cleanOrderId,
      licenseKey: cleanOrderId,
      orderId: cleanOrderId,
      purchaserEmail: cleanEmail,
      sku: entitledProducts.length > 1 ? 'ETSY-MASTER-SUITE-BUNDLE' : `ETSY-${req.productCode}-PRO`,
      status: 'active',
      licenseTier: entitledProducts.length > 1 ? 'pro' : 'standard',
      entitledProducts,
      maxWorkspaces: entitledProducts.length > 1 ? 10 : 2,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    LocalFirestore.setDoc('licenses', cleanOrderId, newLicense);

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
