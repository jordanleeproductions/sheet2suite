export interface Sheet2SuiteLicense {
  licenseKey: string;
  orderId: string;
  purchasePlatform: 'etsy' | 'lemonsqueezy' | 'direct_stripe';
  purchaserEmail: string;
  purchaserName?: string;
  sku: 'sheet2vow' | 'sheet2home' | 'sheet2finance' | 'sheet2suite_bundle';
  productAccess: {
    sheet2vow: boolean;
    sheet2home: boolean;
    sheet2finance: boolean;
  };
  status: 'active' | 'refunded' | 'revoked' | 'expired';
  createdAt: string;
  coPlanner?: {
    partnerEmail?: string;
    partnerName?: string;
    inviteSentAt?: string;
    inviteStatus: 'not_invited' | 'pending_acceptance' | 'activated';
    activatedAt?: string;
  };
}

export interface WorkspaceRecord {
  id?: string;
  workspaceId: string;
  spreadsheetId: string;
  licenseKey: string;
  userEmail: string;
  userRole: 'owner' | 'co_planner' | 'read_only';
  weddingName: string;
  driveFolder: string;
  createdAt: string;
  updatedAt: string;
  metadata?: Record<string, any>;
}

export interface VerifyOrderRequest {
  email: string;
  orderId: string;
}

export interface ProvisionWorkspaceRequest {
  token: string;
  email: string;
  licenseKey: string;
  weddingName: string;
  weddingDate: string;
  budgetThreshold: number;
  driveFolder: string;
  productName: string;
  enabledModules: Record<string, boolean>;
  selectedTasks: string[];
}
