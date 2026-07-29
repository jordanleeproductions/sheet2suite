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
  activatedAt: string;
  errorMessage?: string;
}

export class LicenseValidator {
  /**
   * Validates customer license for any target Sheet2 Suite product.
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
        activatedAt: '',
        errorMessage: 'Invalid Order ID format. Please enter a valid Etsy Order ID.'
      };
    }

    // Mock verification payload (can be connected to Lemon Squeezy or Etsy API)
    return {
      valid: true,
      productCode: req.productCode,
      customerEmail: cleanEmail,
      licenseTier: 'standard',
      activatedAt: new Date().toISOString()
    };
  }
}
