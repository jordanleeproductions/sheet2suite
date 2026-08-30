import { sheets_v4 } from 'googleapis';

export interface DropdownRuleConfig {
  tabCandidateNames: string[];
  columnHeaderMatches: string[];
  settingsRange: string; // e.g. '=Settings!$A$2:$A$50'
}

export const MASTER_DROPDOWN_RULES: DropdownRuleConfig[] = [
  // GUESTS tab
  {
    tabCandidateNames: ['GUESTS', 'Guest List', 'Guests'],
    columnHeaderMatches: ['Age Category', 'Age', 'Guest Age Category'],
    settingsRange: '=SETTINGS!$C$2:$C$50',
  },
  {
    tabCandidateNames: ['GUESTS', 'Guest List', 'Guests'],
    columnHeaderMatches: ['RSVP Status', 'RSVP', 'Status'],
    settingsRange: '=SETTINGS!$F$2:$F$50',
  },
  // TABLES tab
  {
    tabCandidateNames: ['TABLES', 'Tables'],
    columnHeaderMatches: ['Shape', 'Table Shape', 'Table Shapes'],
    settingsRange: '=SETTINGS!$D$2:$D$50',
  },
  // VENDORS tab
  {
    tabCandidateNames: ['VENDORS', 'Vendors', 'Vendor Directory'],
    columnHeaderMatches: ['Category', 'Vendor Category'],
    settingsRange: '=SETTINGS!$J$2:$J$50',
  },
  // BUDGET tab
  {
    tabCandidateNames: ['BUDGET', 'Budget Ledger', 'Budget'],
    columnHeaderMatches: ['Category', 'Budget Category'],
    settingsRange: '=SETTINGS!$K$2:$K$50',
  },
  {
    tabCandidateNames: ['BUDGET', 'Budget Ledger', 'Budget'],
    columnHeaderMatches: ['Payment Status', 'Status'],
    settingsRange: '=SETTINGS!$G$2:$G$50',
  },
  // TO DO tab
  {
    tabCandidateNames: ['TO DO', 'To Do', 'To_Do_List', 'To-Do List', 'TASKS', 'Tasks'],
    columnHeaderMatches: ['Status', 'Task Status', 'Stage'],
    settingsRange: '=SETTINGS!$H$2:$H$50',
  },
  {
    tabCandidateNames: ['TO DO', 'To Do', 'To_Do_List', 'To-Do List', 'TASKS', 'Tasks'],
    columnHeaderMatches: ['Category', 'To Do Category', 'To Do Categories'],
    settingsRange: '=SETTINGS!$L$2:$L$50',
  },
  {
    tabCandidateNames: ['TO DO', 'To Do', 'To_Do_List', 'To-Do List', 'TASKS', 'Tasks'],
    columnHeaderMatches: ['Priority', 'Priority Levels', 'Priority Level'],
    settingsRange: '=SETTINGS!$E$2:$E$50',
  },
  // MUSIC tab
  {
    tabCandidateNames: ['MUSIC', 'Music', 'Playlists'],
    columnHeaderMatches: ['Play Status'],
    settingsRange: '=SETTINGS!$O$2:$O$50',
  },
  {
    tabCandidateNames: ['MUSIC', 'Music', 'Playlists'],
    columnHeaderMatches: ['Approval Status'],
    settingsRange: '=SETTINGS!$N$2:$N$50',
  },
  // PHOTOS tab
  {
    tabCandidateNames: ['PHOTOS', 'Photos', 'Photo Shot List'],
    columnHeaderMatches: ['Priority'],
    settingsRange: '=SETTINGS!$E$2:$E$50',
  },
  // GIFT REGISTRY tab
  {
    tabCandidateNames: ['GIFT REGISTRY', 'GIFTS', 'Gifts', 'Gift Registry'],
    columnHeaderMatches: ['Gift Type', 'Category / Store', 'Category'],
    settingsRange: '=SETTINGS!$M$2:$M$50',
  },
  // EXPENSES tab
  {
    tabCandidateNames: ['EXPENSES', 'Expenses', 'Expense List'],
    columnHeaderMatches: ['Category', 'Expense Category'],
    settingsRange: '=SETTINGS!$K$2:$K$50',
  },
  // DECOR INVENTORY tab
  {
    tabCandidateNames: ['DECOR INVENTORY', 'DECOR', 'Decor Inventory'],
    columnHeaderMatches: ['Category', 'Decor Category'],
    settingsRange: '=SETTINGS!$I$2:$I$50',
  },
  // CATERING tab (Course Category -> SETTINGS!P)
  {
    tabCandidateNames: ['CATERING', 'Catering', 'Catering Menu', 'Menu', 'FOOD', 'Food'],
    columnHeaderMatches: ['Course Category', 'Category', 'Course'],
    settingsRange: '=SETTINGS!$P$2:$P$50',
  },
];

/**
 * Ensures all table columns preserve and link their interactive in-cell dropdown
 * validation rules directly from the 'Settings' tab in the Google Spreadsheet.
 */
export async function applyDropdownValidations(
  sheetsClient: sheets_v4.Sheets,
  spreadsheetId: string
): Promise<{ appliedCount: number; errors?: string[] }> {
  try {
    const metaRes = await sheetsClient.spreadsheets.get({
      spreadsheetId,
      includeGridData: true,
    });

    const sheets = metaRes.data.sheets || [];
    if (!sheets.length) return { appliedCount: 0 };

    // Locate the exact settings sheet title to use in formulas
    const settingsSheet = sheets.find(s => {
      const name = (s.properties?.title || '').toLowerCase();
      return name === 'settings';
    });
    const settingsTitle = settingsSheet?.properties?.title || 'SETTINGS';

    const requests: sheets_v4.Schema$Request[] = [];

    for (const sheet of sheets) {
      const sheetId = sheet.properties?.sheetId;
      const title = sheet.properties?.title || '';
      if (sheetId === undefined || !title) continue;

      const normTitle = title.toLowerCase().replace(/[\s_\-]+/g, '');
      const firstRow = sheet.data?.[0]?.rowData?.[0]?.values || [];
      const headers = firstRow.map(cell => (cell.formattedValue || cell.userEnteredValue?.stringValue || '').trim());

      for (const rule of MASTER_DROPDOWN_RULES) {
        // Check if this sheet matches the rule's target tab candidates
        const matchesTab = rule.tabCandidateNames.some(cand => {
          const normCand = cand.toLowerCase().replace(/[\s_\-]+/g, '');
          return normTitle === normCand || normTitle.includes(normCand);
        });

        if (!matchesTab) continue;

        // Find matching column index
        const colIndex = headers.findIndex(h => {
          const normH = h.toLowerCase().replace(/[\s_\-]+/g, '');
          return rule.columnHeaderMatches.some(m => {
            const normM = m.toLowerCase().replace(/[\s_\-]+/g, '');
            return normH === normM || normH.includes(normM);
          });
        });

        if (colIndex === -1) continue;

        // Construct formula with exact settings tab title e.g. "='Settings'!$A$2:$A$50"
        const settingsFormula = rule.settingsRange.replace('Settings', `'${settingsTitle}'`);

        requests.push({
          setDataValidation: {
            range: {
              sheetId,
              startRowIndex: 1, // Skip header row (row 0)
              endRowIndex: 1000,
              startColumnIndex: colIndex,
              endColumnIndex: colIndex + 1,
            },
            rule: {
              condition: {
                type: 'ONE_OF_RANGE',
                values: [
                  {
                    userEnteredValue: settingsFormula,
                  },
                ],
              },
              inputMessage: 'Please select an option from Settings',
              strict: false,
              showCustomUi: true, // Renders the in-cell dropdown arrow pill in Google Sheets
            },
          },
        });
      }
    }

    if (requests.length > 0) {
      await sheetsClient.spreadsheets.batchUpdate({
        spreadsheetId,
        requestBody: {
          requests,
        },
      });
    }

    return { appliedCount: requests.length };
  } catch (err: any) {
    console.warn('Error applying dropdown validations to Google Sheet:', err?.message);
    return { appliedCount: 0, errors: [err?.message || 'Unknown error'] };
  }
}
