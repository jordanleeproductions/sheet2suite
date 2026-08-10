/**
 * Sheet2 Engine Core: PermanentIdRegistry
 * Location-agnostic and file-name-agnostic Google Drive permanent fileId manager.
 */

export interface RegisteredWorkspace {
  fileId: string; // Permanent Google Drive File ID (immutable across renames and moves)
  userEmail: string;
  partnerEmail?: string;
  title: string;
  driveFolderPath?: string;
  webViewLink?: string;
  productName: 'Sheet2Vow' | 'Sheet2Home' | 'Sheet2Finance';
  orderId?: string;
  orderVerified?: boolean;
  registeredAt: string;
}

export const PermanentIdRegistry = {
  /**
   * Validates if a string is a valid Google Drive fileId format
   */
  isValidFileId(fileId: string): boolean {
    if (!fileId || typeof fileId !== 'string') return false;
    // Typical Google Drive fileId is ~33-44 characters alphanumeric with hyphens/underscores
    return /^[a-zA-Z0-9_-]{20,60}$/.test(fileId.trim());
  },

  /**
   * Formats Google Sheet web URL from permanent fileId
   */
  getDirectSpreadsheetUrl(fileId: string): string {
    if (!fileId) return '#';
    return `https://docs.google.com/spreadsheets/d/${encodeURIComponent(fileId)}/edit`;
  },

  /**
   * Sanitizes workspace object before storage
   */
  sanitizeWorkspaceRecord(record: Partial<RegisteredWorkspace>): RegisteredWorkspace {
    return {
      fileId: record.fileId || '',
      userEmail: (record.userEmail || 'user@sheet2suite.com').trim().toLowerCase(),
      partnerEmail: record.partnerEmail ? record.partnerEmail.trim().toLowerCase() : undefined,
      title: record.title || 'Sheet2Vow Wedding Database',
      driveFolderPath: record.driveFolderPath || 'My Drive / Sheet2Suite / Sheet2Vow',
      webViewLink: record.webViewLink || (record.fileId ? this.getDirectSpreadsheetUrl(record.fileId) : undefined),
      productName: record.productName || 'Sheet2Vow',
      orderId: record.orderId || undefined,
      orderVerified: record.orderVerified !== false,
      registeredAt: record.registeredAt || new Date().toISOString(),
    };
  },
};
