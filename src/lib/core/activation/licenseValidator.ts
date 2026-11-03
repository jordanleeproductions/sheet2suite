/**
 * LicenseValidator - Core license entitlement validator for Sheet2 Suite applications.
 * Validates Etsy Order IDs & license codes against product entitlement rules.
 */

export type ProductCode =
  | 'SHEET2VOW'
  | 'SHEET2FINANCE'
  | 'SHEET2HOME'
  | 'SHEET2CLOSET'
  | 'SHEET2INVENTORY'
  | 'SHEET2VAULT';

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

import { LicenseDocument } from '@/lib/db/firestoreDb';
import { LocalLicensingDb } from '@/lib/db/licensingDb';

function getConfiguredProPromoCodes(): string[] {
  const raw = process.env.PRO_PROMO_CODES || '';
  return raw
    .split(',')
    .map((c) => c.trim().toUpperCase())
    .filter(Boolean);
}

export class LicenseValidator {
  /**
   * Validates customer license for any target Sheet2 Suite product against Cloud Firestore.
   * SECURITY [VULN-5] (Option A):
   * - Enforces purchaserEmail binding so an Order ID cannot be shared publicly across multiple emails.
   * - Enforces maxWorkspaces cap per Order ID.
   * - Requires new self-activated Etsy Order IDs to be valid 9-11 digit numeric Etsy receipt numbers.
   * - Removes the "PRO" substring auto-upgrade bypass.
   */
  static async validateLicense(req: LicenseValidationRequest): Promise<LicenseValidationResponse> {
    const cleanEmail = (req.email || '').trim().toLowerCase();
    const cleanOrderId = (req.orderId || '').trim().toUpperCase();

    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return {
        valid: false,
        productCode: req.productCode,
        customerEmail: cleanEmail,
        licenseTier: 'standard',
        entitledProducts: [],
        activatedAt: '',
        errorMessage: 'Invalid email address provided.',
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
        errorMessage: 'Invalid Order ID format. Please enter a valid 9-11 digit Etsy Order ID.',
      };
    }

    const licenseDoc = await LocalLicensingDb.getLicenseByKeyAsync(cleanOrderId);

    // Step 1: Existing License Document in Firestore
    if (licenseDoc) {
      if (licenseDoc.status !== 'active') {
        return {
          valid: false,
          productCode: req.productCode,
          customerEmail: cleanEmail,
          licenseTier: licenseDoc.licenseTier || 'standard',
          entitledProducts: (licenseDoc.entitledProducts as ProductCode[]) || [req.productCode],
          activatedAt: licenseDoc.createdAt,
          errorMessage: `License status is currently ${licenseDoc.status.toUpperCase()}. Please contact support.`,
        };
      }

      // Verify product entitlement if specified on the license document
      if (
        Array.isArray(licenseDoc.entitledProducts) &&
        licenseDoc.entitledProducts.length > 0 &&
        !licenseDoc.entitledProducts.includes(req.productCode)
      ) {
        return {
          valid: false,
          productCode: req.productCode,
          customerEmail: cleanEmail,
          licenseTier: licenseDoc.licenseTier || 'standard',
          entitledProducts: licenseDoc.entitledProducts as ProductCode[],
          activatedAt: licenseDoc.createdAt,
          errorMessage: `This license key does not include access to ${req.productCode}.`,
        };
      }

      // Bind or verify purchaserEmail so an order ID cannot be shared across unrelated accounts
      const boundEmail = (licenseDoc.purchaserEmail || '').trim().toLowerCase();
      if (boundEmail && boundEmail !== cleanEmail) {
        return {
          valid: false,
          productCode: req.productCode,
          customerEmail: cleanEmail,
          licenseTier: licenseDoc.licenseTier || 'standard',
          entitledProducts: [],
          activatedAt: licenseDoc.createdAt,
          errorMessage:
            'This Order ID is already registered to a different email address. Please sign in with the original purchase email.',
        };
      }

      // Enforce maxWorkspaces limit per Order ID
      const allWorkspaces = await LocalLicensingDb.getAllWorkspacesAsync();
      const matchingWorkspaces = allWorkspaces.filter(
        (w) => (w.orderId || '').trim().toUpperCase() === cleanOrderId
      );
      const userAlreadyHasWorkspaceOnOrder = matchingWorkspaces.some(
        (w) => (w.userEmail || '').trim().toLowerCase() === cleanEmail
      );
      const maxAllowedWorkspaces = licenseDoc.maxWorkspaces || 1;

      if (!userAlreadyHasWorkspaceOnOrder && matchingWorkspaces.length >= maxAllowedWorkspaces) {
        return {
          valid: false,
          productCode: req.productCode,
          customerEmail: cleanEmail,
          licenseTier: licenseDoc.licenseTier || 'standard',
          entitledProducts: [],
          activatedAt: licenseDoc.createdAt,
          errorMessage: `This license has reached its maximum limit of ${maxAllowedWorkspaces} activated workspace(s).`,
        };
      }

      // If purchaserEmail was initially blank on an admin-created key, bind it to this first buyer
      if (!boundEmail) {
        await LocalLicensingDb.saveLicenseAsync({
          ...licenseDoc,
          licenseKey: licenseDoc.licenseKey || cleanOrderId,
          purchaserEmail: cleanEmail,
        });
      }

      return {
        valid: true,
        productCode: req.productCode,
        customerEmail: cleanEmail,
        licenseTier: licenseDoc.licenseTier || 'standard',
        entitledProducts: (licenseDoc.entitledProducts as ProductCode[]) || [req.productCode],
        activatedAt: licenseDoc.createdAt,
      };
    }

    // Step 2: Sheet2Vault Developer Preview Segregation (Must be pre-registered in /admin or match VAULT_DEV_SECRET_KEY)
    if (req.productCode === 'SHEET2VAULT') {
      const vaultSecretKey = process.env.VAULT_DEV_SECRET_KEY?.trim().toUpperCase();
      if (vaultSecretKey && vaultSecretKey.length >= 8 && cleanOrderId === vaultSecretKey) {
        const entitledProducts: ProductCode[] = ['SHEET2VAULT'];
        const devLicense: LicenseDocument = {
          id: cleanOrderId,
          licenseKey: cleanOrderId,
          orderId: cleanOrderId,
          purchaserEmail: cleanEmail,
          sku: 'DEV-SHEET2VAULT-PRO',
          status: 'active',
          licenseTier: 'pro',
          entitledProducts,
          maxWorkspaces: 5,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        await LocalLicensingDb.saveLicenseAsync(devLicense);

        return {
          valid: true,
          productCode: 'SHEET2VAULT',
          customerEmail: cleanEmail,
          licenseTier: 'pro',
          entitledProducts,
          activatedAt: devLicense.createdAt,
        };
      }

      return {
        valid: false,
        productCode: 'SHEET2VAULT',
        customerEmail: cleanEmail,
        licenseTier: 'standard',
        entitledProducts: [],
        activatedAt: '',
        errorMessage:
          'Sheet2Vault is currently in private developer preview. Early access requires a pre-authorized license key.',
      };
    }

    // Step 3: Option A — New Etsy Order ID Verification
    // Allow optional "ETSY-" or "#" prefix followed by a 9-11 digit numeric Etsy receipt ID, or secret promo code
    const normalizedReceiptDigits = cleanOrderId.replace(/^(ETSY-|#)/, '');
    const isStandardEtsyReceipt = /^\d{9,11}$/.test(normalizedReceiptDigits);
    const proPromoCodes = getConfiguredProPromoCodes();
    const isMatchedProPromo = proPromoCodes.includes(cleanOrderId);

    if (!isStandardEtsyReceipt && !isMatchedProPromo) {
      return {
        valid: false,
        productCode: req.productCode,
        customerEmail: cleanEmail,
        licenseTier: 'standard',
        entitledProducts: [],
        activatedAt: '',
        errorMessage:
          'Invalid Etsy Order ID. Please enter your 9–11 digit numeric Etsy Order / Receipt number (e.g., 3847291847).',
      };
    }

    const canonicalOrderId = isMatchedProPromo ? cleanOrderId : normalizedReceiptDigits;
    const isPro = isMatchedProPromo;
    const entitledProducts: ProductCode[] = ['SHEET2VOW'];

    const newLicense: LicenseDocument = {
      id: canonicalOrderId,
      licenseKey: canonicalOrderId,
      orderId: canonicalOrderId,
      purchaserEmail: cleanEmail,
      sku: isPro ? 'ETSY-SHEET2VOW-PRO' : 'ETSY-SHEET2VOW-STANDARD',
      status: 'active',
      licenseTier: isPro ? 'pro' : 'standard',
      entitledProducts,
      maxWorkspaces: isPro ? 5 : 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await LocalLicensingDb.saveLicenseAsync(newLicense);

    return {
      valid: true,
      productCode: req.productCode,
      customerEmail: cleanEmail,
      licenseTier: newLicense.licenseTier,
      entitledProducts,
      activatedAt: newLicense.createdAt,
    };
  }
}
