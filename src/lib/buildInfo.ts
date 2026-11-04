// Auto-generated & maintained by scripts/bumpVersion.ts
// Multi-product version registry for Sheet2Suite and all suite applications.

export type SuiteProductId =
  | 'suite'
  | 'vow'
  | 'vault'
  | 'finance'
  | 'home'
  | 'closet'
  | 'inventory';

export interface ProductBuildInfo {
  id: SuiteProductId;
  name: string;
  shortName: string;
  tagline: string;
  version: string;
  buildTimestamp: string;
  buildEpoch: number;
  buildIso: string;
  status: 'live' | 'preview' | 'planned';
  accentColor: string;
}

export const PRODUCT_VERSIONS: Record<SuiteProductId, ProductBuildInfo> = {
  suite: {
    id: 'suite',
    name: 'Sheet2Suite',
    shortName: 'Suite',
    tagline: 'Parent Platform, Licensing & Admin Console',
    version: 'v1.23.3',
    buildTimestamp: 'Nov 3, 2026 • 7:35 PM',
    buildEpoch: 1793752500000,
    buildIso: '2026-11-04T00:35:00.000Z',
    status: 'live',
    accentColor: '#4F46E5',
  },
  vow: {
    id: 'vow',
    name: 'Sheet2Vow',
    shortName: 'Vow',
    tagline: 'Bespoke Wedding Planning Suite',
    version: 'v1.19.0',
    buildTimestamp: 'Oct 29, 2026 • 5:30 PM',
    buildEpoch: 1793314800000,
    buildIso: '2026-10-29T22:30:00.000Z',
    status: 'live',
    accentColor: '#059669',
  },
  vault: {
    id: 'vault',
    name: 'Sheet2Vault',
    shortName: 'Vault',
    tagline: 'Home Inventory & Insurance Claim Dossier Engine',
    version: 'v0.1.0',
    buildTimestamp: 'Nov 2, 2026 • 6:30 PM',
    buildEpoch: 1793664000000,
    buildIso: '2026-11-02T23:30:00.000Z',
    status: 'preview',
    accentColor: '#D97706',
  },
  finance: {
    id: 'finance',
    name: 'Sheet2Finance',
    shortName: 'Finance',
    tagline: 'Personal Net Worth & Cashflow Ledger',
    version: 'v0.1.0',
    buildTimestamp: 'Nov 2, 2026 • 6:30 PM',
    buildEpoch: 1793664000000,
    buildIso: '2026-11-02T23:30:00.000Z',
    status: 'planned',
    accentColor: '#0284C7',
  },
  home: {
    id: 'home',
    name: 'Sheet2Home',
    shortName: 'Home',
    tagline: 'Property Maintenance & Renovation Tracker',
    version: 'v0.1.0',
    buildTimestamp: 'Nov 2, 2026 • 6:30 PM',
    buildEpoch: 1793664000000,
    buildIso: '2026-11-02T23:30:00.000Z',
    status: 'planned',
    accentColor: '#7C3AED',
  },
  closet: {
    id: 'closet',
    name: 'Sheet2Closet',
    shortName: 'Closet',
    tagline: 'Wardrobe Archiving & Capsule Curation',
    version: 'v0.1.0',
    buildTimestamp: 'Nov 2, 2026 • 6:30 PM',
    buildEpoch: 1793664000000,
    buildIso: '2026-11-02T23:30:00.000Z',
    status: 'planned',
    accentColor: '#DB2777',
  },
  inventory: {
    id: 'inventory',
    name: 'Sheet2Inventory',
    shortName: 'Inventory',
    tagline: 'Small Business & Maker Stock Ledger',
    version: 'v0.1.0',
    buildTimestamp: 'Nov 2, 2026 • 6:30 PM',
    buildEpoch: 1793664000000,
    buildIso: '2026-11-02T23:30:00.000Z',
    status: 'planned',
    accentColor: '#EA580C',
  },
};

export function normalizeProductId(input?: string | null): SuiteProductId {
  const raw = (input || '').trim().toLowerCase().replace(/^sheet2/, '');
  if (
    raw === 'suite' ||
    raw === 'vow' ||
    raw === 'vault' ||
    raw === 'finance' ||
    raw === 'home' ||
    raw === 'closet' ||
    raw === 'inventory'
  ) {
    return raw;
  }
  return 'vow';
}

export function getProductBuildInfo(product?: SuiteProductId | string | null): ProductBuildInfo {
  const id = normalizeProductId(product);
  return PRODUCT_VERSIONS[id];
}

// Product-specific convenience exports
export const SUITE_VERSION = PRODUCT_VERSIONS.suite.version;
export const SUITE_BUILD_TIMESTAMP = PRODUCT_VERSIONS.suite.buildTimestamp;
export const SUITE_BUILD_ISO = PRODUCT_VERSIONS.suite.buildIso;

export const VOW_VERSION = PRODUCT_VERSIONS.vow.version;
export const VOW_BUILD_TIMESTAMP = PRODUCT_VERSIONS.vow.buildTimestamp;
export const VOW_BUILD_ISO = PRODUCT_VERSIONS.vow.buildIso;

export const VAULT_VERSION = PRODUCT_VERSIONS.vault.version;
export const VAULT_BUILD_TIMESTAMP = PRODUCT_VERSIONS.vault.buildTimestamp;
export const VAULT_BUILD_ISO = PRODUCT_VERSIONS.vault.buildIso;

// Default app exports mapped to Sheet2Vow for backward compatibility in /vow modules
export const APP_VERSION = VOW_VERSION;
export const BUILD_TIMESTAMP = VOW_BUILD_TIMESTAMP;
export const BUILD_ISO = VOW_BUILD_ISO;
