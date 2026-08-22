import { NextResponse } from 'next/server';
import { getDriveClient, getSheetsClient, DEFAULT_MASTER_SHEET_ID } from '@/lib/sheets/client';
import { updateMockDatabase } from '@/lib/sheets/mockDb';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;
    
    const body = await req.json().catch(() => ({}));
    const { weddingName, budget, driveFolder, selectedTasks } = body;

    const finalWeddingName = weddingName || 'Our Wedding';
    const finalBudget = Number(budget) || 30000;
    const finalSelectedTasks = Array.isArray(selectedTasks) ? selectedTasks : [];

    // Support Mock Mode for out-of-the-box local testing
    if (!accessToken || accessToken === 'mock-token') {
      updateMockDatabase(finalWeddingName, finalBudget, finalSelectedTasks);
      return NextResponse.json({
        success: true,
        spreadsheetId: 'mock-sheet-id-vow-12345',
        weddingName: finalWeddingName,
        budget: finalBudget,
        isMock: true,
        message: `Onboarded successfully in Mock Mode. Folder: ${driveFolder || 'Root'}`
      });
    }

    const driveClient = getDriveClient(accessToken);
    const sheetsClient = getSheetsClient(accessToken);

    const masterSheetId = process.env.GOOGLE_MASTER_SHEET_ID || DEFAULT_MASTER_SHEET_ID;

    // 1. Single atomic copy request
    const copyResponse = await driveClient.files.copy({
      fileId: masterSheetId,
      requestBody: {
        name: `Sheet2Vow - ${finalWeddingName}`,
      },
    });

    const newSheetId = copyResponse.data.id;
    if (!newSheetId) {
      throw new Error('Failed to retrieve copied spreadsheet ID.');
    }

    // 2. Perform exactly ONE spreadsheets.values.update call to cell B2
    const configPayload = {
      budget: finalBudget,
      weddingName: finalWeddingName,
    };

    await sheetsClient.spreadsheets.values.batchUpdate({
      spreadsheetId: newSheetId,
      requestBody: {
        valueInputOption: 'USER_ENTERED',
        data: [
          {
            range: "'SETTINGS'!A1:B3",
            values: [
              ['Name', 'Value'],
              ['Wedding Name', finalWeddingName],
              ['Wedding Budget', finalBudget]
            ],
          }
        ]
      }
    });

    return NextResponse.json({
      success: true,
      spreadsheetId: newSheetId,
      weddingName: finalWeddingName,
      budget: finalBudget,
      isMock: false
    });

  } catch (error: any) {
    console.error('Error in /api/onboard:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Onboarding failed' },
      { status: 500 }
    );
  }
}
