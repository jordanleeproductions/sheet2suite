import { google } from 'googleapis';
import { DEFAULT_MASTER_SHEET_ID } from './client';
import { generateMasterXlsxBuffer } from '@/lib/core/templates/xlsxGenerator';

/**
 * Fetches the live Master Google Sheet as an XLSX buffer for 1:1 fidelity cloning.
 * 1. Tries direct Google Sheets export endpoint (works instantly for viewable/public sheets).
 * 2. Tries Google Drive API export via Service Account credentials (if configured).
 * 3. Falls back to programmatic ExcelJS generator (Tier 3 fallback).
 */
export async function getMasterSpreadsheetXlsxBuffer(
  coupleName: string = 'Alex & Sam',
  customMasterSheetId?: string
): Promise<{ buffer: Buffer; source: 'live_master_export' | 'service_account_export' | 'programmatic_template' }> {
  const masterSheetId = customMasterSheetId || process.env.GOOGLE_MASTER_SHEET_ID || DEFAULT_MASTER_SHEET_ID;

  // 1. Direct Public Export Fetch (~100-200ms)
  try {
    const exportUrl = `https://docs.google.com/spreadsheets/d/${masterSheetId}/export?format=xlsx`;
    const response = await fetch(exportUrl, {
      headers: {
        'User-Agent': 'Sheet2Suite-Master-Sync/1.0',
      },
    });

    if (response.ok) {
      const arrayBuffer = await response.arrayBuffer();
      if (arrayBuffer && arrayBuffer.byteLength > 2000) {
        return {
          buffer: Buffer.from(arrayBuffer),
          source: 'live_master_export',
        };
      }
    }
  } catch (directErr: any) {
    console.warn('Direct master template export fetch failed:', directErr?.message);
  }

  // 2. Service Account Export (if credentials exist)
  if (
    process.env.GOOGLE_CLIENT_EMAIL &&
    (process.env.GOOGLE_PRIVATE_KEY || process.env.GOOGLE_PRIVATE_KEY_BASE64)
  ) {
    try {
      let privateKey = process.env.GOOGLE_PRIVATE_KEY || '';
      if (process.env.GOOGLE_PRIVATE_KEY_BASE64) {
        privateKey = Buffer.from(process.env.GOOGLE_PRIVATE_KEY_BASE64, 'base64').toString('ascii');
      }
      privateKey = privateKey.replace(/\\n/g, '\n');

      const jwtClient = new google.auth.JWT({
        email: process.env.GOOGLE_CLIENT_EMAIL,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      });

      const drive = google.drive({ version: 'v3', auth: jwtClient });
      const exportRes = await drive.files.export(
        {
          fileId: masterSheetId,
          mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
        { responseType: 'arraybuffer' }
      );

      if (exportRes.data) {
        return {
          buffer: Buffer.from(exportRes.data as ArrayBuffer),
          source: 'service_account_export',
        };
      }
    } catch (saErr: any) {
      console.warn('Service account master export failed:', saErr?.message);
    }
  }

  // 3. Fallback: Programmatic ExcelJS Master Template
  const fallbackBuffer = await generateMasterXlsxBuffer(coupleName);
  return {
    buffer: fallbackBuffer,
    source: 'programmatic_template',
  };
}
