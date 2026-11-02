/**
 * Sheet2Suite Universal Activation & Product Plugin Contracts
 */

export interface VerifiedOrder {
  orderId: string;
  email: string;
  customerName?: string;
  purchaseDate?: string;
  packageTier: string;
  entitledProducts: string[];
  licensedSheets: number;
  isVerified: boolean;
  message?: string;
}

export interface UniversalActivationState {
  orderId: string;
  email: string;
  productCode: string;
  productName: string;
  googleEmail: string;
  googleToken: string;
  isGoogleConnected: boolean;
  driveFolder: string;
}

export interface ProductSetupPluginProps<TConfig = any> {
  productCode: string;
  productName: string;
  userEmail: string;
  orderId: string;
  driveFolder: string;
  isGoogleConnected: boolean;
  onBrowseGoogleDrive: () => void;
  onChangeDriveFolder: (folder: string) => void;
  onComplete: (productConfig: TConfig) => Promise<void> | void;
  onBack: () => void;
  isSubmitting?: boolean;
}

export interface SuiteProductDescriptor {
  id: string;
  code: string;
  name: string;
  tagline: string;
  subdomain: string;
  defaultDriveFolder: string;
  icon?: string;
  status: 'active' | 'coming_soon';
}

export const SUITE_PRODUCTS: Record<string, SuiteProductDescriptor> = {
  SHEET2VOW: {
    id: 'vow',
    code: 'SHEET2VOW',
    name: 'Sheet2Vow',
    tagline: 'Digital Wedding Planning Canvas',
    subdomain: 'vow',
    defaultDriveFolder: 'My Drive / Sheet2Suite / Sheet2Vow',
    status: 'active',
  },
  SHEET2VAULT: {
    id: 'vault',
    code: 'SHEET2VAULT',
    name: 'Sheet2Vault',
    tagline: 'Home Valuables, Inventory & Insurance Claim Dossier',
    subdomain: 'vault',
    defaultDriveFolder: 'My Drive / Sheet2Suite / Sheet2Vault',
    status: 'coming_soon',
  },
};
