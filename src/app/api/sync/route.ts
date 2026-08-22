import { NextResponse } from 'next/server';
import { getSheetsClient } from '@/lib/sheets/client';
import { 
  guestMapper, 
  budgetMapper, 
  expenseMapper,
  scheduleMapper, 
  vendorMapper, 
  taskMapper,
  photoMapper,
  giftMapper 
} from '@/lib/sheets/mapper';
import { Guest, BudgetItem, ExpenseItem, ScheduleEvent, Vendor, Task, PhotoShot, GiftItem, Song, WeddingData } from '@/lib/sheets/types';

import { mockDatabase, mockWeddingName, setMockWeddingName } from '@/lib/sheets/mockDb';
import { CellGuard } from '@/lib/core/CellGuard';
import { applyDropdownValidations } from '@/lib/sheets/dropdownValidator';

// Map sheet columns to standard header lists so that we can write files correctly
const HEADERS_MAP = {
  guests: ['Guest ID', 'First Name', 'Last Name', 'Party Group', 'Age Category', 'RSVP Status', 'Dietary Restrictions', 'Table Assignment', 'Email Address', 'Phone Number', 'Mailing Address', 'Thanked'],
  budget: ['Item ID', 'Category', 'Vendor Name', 'Estimated Cost', 'Actual Cost', 'Amount Paid', 'Due Date', 'Payment Status'],
  expenses: ['Item ID', 'Description', 'Category', 'Actual Cost', 'Amount Paid', 'Purchase Date', 'Notes'],
  schedule: ['Start Time', 'End Time', 'Event Moment', 'Location', 'Responsibility / Vendors', 'Notes / Details'],
  vendors: ['Vendor ID', 'Vendor Name', 'Category', 'Contact Name', 'Email Address', 'Phone Number', 'Total Contract Value', 'Deposit Paid', 'Balance Owing', 'Payment Due Date', 'Contract Link', 'Staff Meals Required'],
  tasks: ['Task ID', 'Task Name', 'Kanban Stage', 'Category', 'Priority', 'Assigned To', 'Due Date', 'Notes / Links'],
  music: ['Song ID', 'Song Title', 'Artist', 'Occasion', 'Play Status', 'Requested By', 'Notes', 'Approval Status', 'Link'],
  photos: ['Shot ID', 'Description', 'Location', 'Shot Time', 'Included People', 'Status', 'Priority', 'Notes'],
  gifts: ['Item ID', 'Gift Description / Name', 'Giver / From', 'Category / Store', 'Estimated Value / Cash Amount', 'Thank You Sent', 'Notes']
};

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const spreadsheetId = searchParams.get('spreadsheetId');
    
    const authHeader = req.headers.get('Authorization');
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    if (!spreadsheetId) {
      return NextResponse.json({ success: false, error: 'spreadsheetId is required' }, { status: 400 });
    }

    // Mock Mode
    if (!accessToken || accessToken === 'mock-token' || spreadsheetId === 'mock-sheet-id-vow-12345') {
      // Dynamically calculate metrics for consistency in mock mode
      const estimatedCost = mockDatabase.budget.reduce((sum, item) => sum + item.estimatedCost, 0);
      const actualCost = mockDatabase.budget.reduce((sum, item) => sum + item.actualCost, 0);
      const remainingTasks = mockDatabase.tasks.filter(task => task.kanbanStage === 'To Do').length;

      mockDatabase.dashboard = {
        ...mockDatabase.dashboard,
        estimatedCost,
        actualCost,
        remainingTasks
      };

      return NextResponse.json({
        success: true,
        data: mockDatabase,
        weddingName: mockWeddingName,
        isMock: true
      });
    }

    const sheetsClient = getSheetsClient(accessToken);

    // Step 1: Fetch spreadsheet metadata to get exact available sheet titles
    const metaRes = await sheetsClient.spreadsheets.get({ spreadsheetId });
    const availableTitles = (metaRes.data.sheets || []).map(s => s.properties?.title || '').filter(Boolean);

    const findTitle = (candidates: string[]) => {
      // 1. Exact match
      const exact = candidates.find(c => availableTitles.includes(c));
      if (exact) return exact;

      // 2. Normalized match (ignoring case, spaces, hyphens, underscores)
      for (const c of candidates) {
        const normCandidate = c.toLowerCase().replace(/[\s_\-]+/g, '');
        const matched = availableTitles.find(t => t.toLowerCase().replace(/[\s_\-]+/g, '') === normCandidate);
        if (matched) return matched;
      }

      // 3. Substring match
      for (const c of candidates) {
        const normCandidate = c.toLowerCase().replace(/[\s_\-]+/g, '');
        if (!normCandidate) continue;
        const matched = availableTitles.find(t => {
          const normTitle = t.toLowerCase().replace(/[\s_\-]+/g, '');
          return normTitle.includes(normCandidate) || normCandidate.includes(normTitle);
        });
        if (matched) return matched;
      }

      return candidates[0];
    };

    const settingsTitle = findTitle(['SETTINGS', 'Settings', 'DASHBOARD', 'Dashboard']);
    const guestsTitle = findTitle(['GUESTS', 'Guest List', 'Guests', 'Guest_List']);
    const budgetTitle = findTitle(['BUDGET', 'Budget Ledger', 'Budget', 'Budget_Ledger']);
    const expensesTitle = findTitle(['EXPENSES', 'Expenses', 'Expense List']);
    const scheduleTitle = findTitle(['SCHEDULE', 'Day-Of-Schedule', 'Schedule', 'Day_Of_Schedule', 'Timeline']);
    const vendorsTitle = findTitle(['VENDORS', 'Vendors', 'Vendor Directory']);
    const tasksTitle = findTitle(['TO DO', 'To Do', 'To_Do_List', 'To-Do List', 'To Do List', 'TASKS', 'Tasks']);
    const photosTitle = findTitle(['PHOTOS', 'Photos', 'Photo Shot List']);
    const giftsTitle = findTitle(['GIFT REGISTRY', 'GIFTS', 'Gifts', 'Gift Registry', 'Gift_Registry']);
    const dashTitle = availableTitles.some(t => t.toLowerCase() === 'dashboard') ? findTitle(['DASHBOARD', 'Dashboard']) : null;
    const ranges = [
      `'${settingsTitle}'!A1:B10`,
      `'${guestsTitle}'!A1:L1000`,
      `'${budgetTitle}'!A1:H1000`,
      `'${expensesTitle}'!A1:G1000`,
      `'${scheduleTitle}'!A1:F1000`,
      `'${vendorsTitle}'!A1:L1000`,
      `'${tasksTitle}'!A1:H1000`,
      `'${photosTitle}'!A1:H1000`,
      `'${giftsTitle}'!A1:G1000`,
      `'${settingsTitle}'!Z1:Z3`,
    ];
    if (dashTitle) {
      ranges.push(`'${dashTitle}'!B2`);
    }

    // Fetch all spreadsheet tabs in a single atomic batch get
    const batchGetResponse = await sheetsClient.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges,
    });

    const valueRanges = batchGetResponse.data.valueRanges || [];
    
    // Parse SETTINGS Table A1:B10 (A2="Wedding Name" -> B2, A3="Wedding Budget" -> B3)
    const settingsTableRows = valueRanges[0]?.values || [];
    let weddingName = 'Our Wedding';
    let totalBudget = 30000;
    let foundInTable = false;

    for (const row of settingsTableRows) {
      const label = String(row[0] || '').toLowerCase().trim();
      const val = row[1];
      if (label.includes('wedding name') || label.includes('couple name') || label.includes('name')) {
        if (val) {
          weddingName = String(val).trim();
          foundInTable = true;
        }
      } else if (label.includes('budget') || label.includes('wedding budget')) {
        if (val) {
          totalBudget = Number(String(val).replace(/[^0-9.]/g, '')) || 30000;
          foundInTable = true;
        }
      }
    }

    // Fallback: Check B2 directly if row index match, or legacy Z1/Z2/Z3
    if (!foundInTable) {
      const b2Val = settingsTableRows[1]?.[1]; // B2
      const b3Val = settingsTableRows[2]?.[1]; // B3
      if (b2Val) weddingName = String(b2Val).trim();
      if (b3Val) totalBudget = Number(String(b3Val).replace(/[^0-9.]/g, '')) || 30000;

      if (!b2Val && !b3Val) {
        const zRows = valueRanges[9]?.values || [];
        const z1Val = zRows[0]?.[0] || '';
        const z2Val = zRows[1]?.[0] || '';
        const z3Val = zRows[2]?.[0] || '';

        if (z2Val) weddingName = String(z2Val).trim();
        if (z3Val) totalBudget = Number(z3Val) || 30000;

        if (!z2Val && !z3Val && z1Val) {
          try {
            if (z1Val.startsWith('{')) {
              const parsed = JSON.parse(z1Val);
              if (parsed.weddingName) weddingName = parsed.weddingName;
              if (parsed.budget) totalBudget = Number(parsed.budget) || 30000;
            }
          } catch (_) {}
        }
      }
    }

    // Parse Guest List
    const guestRows = valueRanges[1]?.values || [];
    const guestHeaders = guestRows[0] || HEADERS_MAP.guests;
    const guests = guestRows.slice(1).map(row => guestMapper.fromRow(guestHeaders, row));

    // Parse Budget Ledger
    const budgetRows = valueRanges[2]?.values || [];
    const budgetHeaders = budgetRows[0] || HEADERS_MAP.budget;
    const budget = budgetRows.slice(1).map(row => budgetMapper.fromRow(budgetHeaders, row));

    // Parse Expenses
    const expenseRows = valueRanges[3]?.values || [];
    const expenseHeaders = expenseRows[0] || HEADERS_MAP.expenses;
    const expenses = expenseRows.slice(1).map(row => expenseMapper.fromRow(expenseHeaders, row));

    // Parse Day-Of-Schedule
    const scheduleRows = valueRanges[4]?.values || [];
    const scheduleHeaders = scheduleRows[0] || HEADERS_MAP.schedule;
    const schedule = scheduleRows.slice(1).map(row => scheduleMapper.fromRow(scheduleHeaders, row));

    // Parse Vendors
    const vendorRows = valueRanges[5]?.values || [];
    const vendorHeaders = vendorRows[0] || HEADERS_MAP.vendors;
    const vendors = vendorRows.slice(1).map(row => vendorMapper.fromRow(vendorHeaders, row));

    // Parse To-Do List
    const taskRows = valueRanges[6]?.values || [];
    const taskHeaders = taskRows[0] || HEADERS_MAP.tasks;
    const tasks = taskRows.slice(1).map(row => taskMapper.fromRow(taskHeaders, row));

    // Parse Photos
    const photoRows = valueRanges[7]?.values || [];
    const photoHeaders = photoRows[0] || HEADERS_MAP.photos;
    const photos = photoRows.slice(1).map(row => photoMapper.fromRow(photoHeaders, row));

    // Parse Gifts
    const giftRows = valueRanges[8]?.values || [];
    const giftHeaders = giftRows[0] || HEADERS_MAP.gifts;
    const gifts = giftRows.slice(1).map(row => giftMapper.fromRow(giftHeaders, row));

    // Calculate dynamic values for Dashboard UI
    const estimatedCost = budget.reduce((sum, item) => sum + item.estimatedCost, 0);
    const actualCost = expenses.length > 0 
      ? expenses.reduce((sum, item) => sum + item.actualCost, 0)
      : budget.reduce((sum, item) => sum + item.actualCost, 0);
    const remainingTasks = tasks.filter(t => t.kanbanStage === 'To Do').length;

    const data: WeddingData = {
      dashboard: {
        totalBudget,
        estimatedCost,
        actualCost,
        remainingTasks
      },
      guests,
      budget,
      expenses,
      schedule,
      vendors,
      tasks,
      music: [],
      photos: photos.length > 0 ? photos : mockDatabase.photos,
      gifts: gifts.length > 0 ? gifts : mockDatabase.gifts
    };

    return NextResponse.json({
      success: true,
      data,
      weddingName,
      isMock: false
    });

  } catch (error: any) {
    console.error('Error fetching sheet data in /api/sync:', error);
    const isAuthError = error?.code === 401 || error?.status === 401 || String(error?.message).toLowerCase().includes('invalid authentication credentials');
    return NextResponse.json(
      {
        success: false,
        isAuthError: Boolean(isAuthError),
        error: isAuthError ? 'Google OAuth access token expired or invalid. Please sign in again to refresh your session.' : (error.message || 'Sync load failed')
      },
      { status: isAuthError ? 401 : 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : null;

    const body = await req.json();
    const { spreadsheetId, sheetType, data } = body;

    if (!spreadsheetId) {
      return NextResponse.json({ success: false, error: 'spreadsheetId is required' }, { status: 400 });
    }
    if (!sheetType) {
      return NextResponse.json({ success: false, error: 'sheetType is required' }, { status: 400 });
    }

    // Mock Mode Update
    if (!accessToken || accessToken === 'mock-token' || spreadsheetId === 'mock-sheet-id-vow-12345') {
      if (sheetType === 'dashboard') {
        const newBudgetVal = data.totalBudget !== undefined ? Number(data.totalBudget) : (data.budget !== undefined ? Number(data.budget) : mockDatabase.dashboard.totalBudget);
        mockDatabase.dashboard.totalBudget = isNaN(newBudgetVal) ? mockDatabase.dashboard.totalBudget : newBudgetVal;
        setMockWeddingName(data.weddingName || mockWeddingName || 'Our Wedding');
      } else if (sheetType === 'guests') {
        mockDatabase.guests = data as Guest[];
      } else if (sheetType === 'budget') {
        mockDatabase.budget = data as BudgetItem[];
      } else if (sheetType === 'expenses') {
        mockDatabase.expenses = data as ExpenseItem[];
      } else if (sheetType === 'schedule') {
        mockDatabase.schedule = data as ScheduleEvent[];
      } else if (sheetType === 'vendors') {
        mockDatabase.vendors = data as Vendor[];
      } else if (sheetType === 'tasks') {
        mockDatabase.tasks = data as Task[];
      } else if (sheetType === 'photos') {
        mockDatabase.photos = data as PhotoShot[];
      } else if (sheetType === 'music') {
        mockDatabase.music = data as Song[];
      } else if (sheetType === 'gifts') {
        mockDatabase.gifts = data as GiftItem[];
      }

      // Recompute metrics
      const estimatedCost = mockDatabase.budget.reduce((sum, item) => sum + item.estimatedCost, 0);
      const actualCost = (mockDatabase.expenses && mockDatabase.expenses.length > 0)
        ? mockDatabase.expenses.reduce((sum, item) => sum + item.actualCost, 0)
        : mockDatabase.budget.reduce((sum, item) => sum + item.actualCost, 0);
      const remainingTasks = mockDatabase.tasks.filter(task => task.kanbanStage === 'To Do').length;

      mockDatabase.dashboard = {
        ...mockDatabase.dashboard,
        estimatedCost,
        actualCost,
        remainingTasks
      };

      return NextResponse.json({
        success: true,
        message: `Successfully synchronized ${sheetType} in Mock Mode.`,
        data: mockDatabase,
        isMock: true
      });
    }

    const sheetsClient = getSheetsClient(accessToken);

    if (sheetType === 'repair_dropdowns') {
      const res = await applyDropdownValidations(sheetsClient, spreadsheetId);
      return NextResponse.json({
        success: true,
        message: `Successfully preserved and linked ${res.appliedCount} dropdown validation rules from 'Settings' tab.`,
        appliedCount: res.appliedCount,
      });
    }

    if (sheetType === 'dashboard') {
      // Fetch spreadsheet metadata to check available sheet titles safely
      const metaRes = await sheetsClient.spreadsheets.get({ spreadsheetId });
      const availableTitles = (metaRes.data.sheets || []).map(s => s.properties?.title || '').filter(Boolean);

      const findTitle = (candidates: string[]) => {
        const exact = candidates.find(c => availableTitles.includes(c));
        if (exact) return exact;
        for (const c of candidates) {
          const normCandidate = c.toLowerCase().replace(/[\s_\-]+/g, '');
          const matched = availableTitles.find(t => t.toLowerCase().replace(/[\s_\-]+/g, '') === normCandidate);
          if (matched) return matched;
        }
        return null;
      };

      const settingsTitle = findTitle(['SETTINGS', 'Settings']) || 'SETTINGS';
      const dashTitle = findTitle(['DASHBOARD', 'Dashboard']);
      const updateRanges: any[] = [
        {
          range: `'${settingsTitle}'!A1:B3`,
          values: [
            ['Name', 'Value'],
            ['Wedding Name', data.weddingName || 'Our Wedding'],
            ['Wedding Budget', data.totalBudget !== undefined ? Number(data.totalBudget) : (data.budget !== undefined ? Number(data.budget) : 35000)]
          ],
        }
      ];

      if (dashTitle) {
        updateRanges.unshift({
          range: `'${dashTitle}'!B2`,
          values: [[data.weddingName || 'Our Wedding']],
        });
      }

      // Update configuration storage without failing if DASHBOARD tab was deleted
      await sheetsClient.spreadsheets.values.batchUpdate({
        spreadsheetId,
        requestBody: {
          valueInputOption: 'USER_ENTERED',
          data: updateRanges
        }
      });
    } else {
      // Overwrite the sheet rows
      // Fetch spreadsheet metadata to get exact available sheet titles
      const metaRes = await sheetsClient.spreadsheets.get({ spreadsheetId });
      const availableTitles = (metaRes.data.sheets || []).map(s => s.properties?.title || '').filter(Boolean);

      const findTitle = (candidates: string[]) => {
        // 1. Exact match
        const exact = candidates.find(c => availableTitles.includes(c));
        if (exact) return exact;

        // 2. Normalized match (ignoring case, spaces, hyphens, underscores)
        for (const c of candidates) {
          const normCandidate = c.toLowerCase().replace(/[\s_\-]+/g, '');
          const matched = availableTitles.find(t => t.toLowerCase().replace(/[\s_\-]+/g, '') === normCandidate);
          if (matched) return matched;
        }

        // 3. Substring match
        for (const c of candidates) {
          const normCandidate = c.toLowerCase().replace(/[\s_\-]+/g, '');
          if (!normCandidate) continue;
          const matched = availableTitles.find(t => {
            const normTitle = t.toLowerCase().replace(/[\s_\-]+/g, '');
            return normTitle.includes(normCandidate) || normCandidate.includes(normTitle);
          });
          if (matched) return matched;
        }

        return candidates[0];
      };

      let range = '';
      let values: any[][] = [];
      const headers = HEADERS_MAP[sheetType as keyof typeof HEADERS_MAP];
      
      // Setup the header row
      values.push(headers);

      if (sheetType === 'guests') {
        const title = findTitle(['GUESTS', 'Guest List', 'Guests', 'Guest_List']);
        range = `'${title}'!A1:L1000`;
        (data as Guest[]).forEach(item => {
          values.push(guestMapper.toRow(headers, item));
        });
      } else if (sheetType === 'budget') {
        const title = findTitle(['BUDGET', 'Budget Ledger', 'Budget', 'Budget_Ledger']);
        range = `'${title}'!A1:H1000`;
        (data as BudgetItem[]).forEach(item => {
          values.push(budgetMapper.toRow(headers, item));
        });
      } else if (sheetType === 'expenses') {
        const title = findTitle(['EXPENSES', 'Expenses', 'Expense List']);
        range = `'${title}'!A1:G1000`;
        (data as ExpenseItem[]).forEach(item => {
          values.push(expenseMapper.toRow(headers, item));
        });
      } else if (sheetType === 'schedule') {
        const title = findTitle(['SCHEDULE', 'Day-Of-Schedule', 'Schedule', 'Day_Of_Schedule', 'Timeline']);
        range = `'${title}'!A1:F1000`;
        (data as ScheduleEvent[]).forEach(item => {
          values.push(scheduleMapper.toRow(headers, item));
        });
      } else if (sheetType === 'vendors') {
        const title = findTitle(['VENDORS', 'Vendors', 'Vendor Directory']);
        range = `'${title}'!A1:L1000`;
        (data as Vendor[]).forEach(item => {
          values.push(vendorMapper.toRow(headers, item));
        });
      } else if (sheetType === 'tasks') {
        const title = findTitle(['TO DO', 'To Do', 'To_Do_List', 'To-Do List', 'To Do List', 'TASKS', 'Tasks']);
        range = `'${title}'!A1:H1000`;
        (data as Task[]).forEach(item => {
          values.push(taskMapper.toRow(headers, item));
        });
      } else if (sheetType === 'photos') {
        const title = findTitle(['PHOTOS', 'Photos', 'Photo Shot List']);
        range = `'${title}'!A1:H1000`;
        (data as PhotoShot[]).forEach(item => {
          values.push(photoMapper.toRow(headers, item));
        });
      } else if (sheetType === 'gifts') {
        const title = findTitle(['GIFT REGISTRY', 'GIFTS', 'Gifts', 'Gift Registry', 'Gift_Registry']);
        range = `'${title}'!A1:G1000`;
        (data as GiftItem[]).forEach(item => {
          values.push(giftMapper.toRow(headers, item));
        });
      }

      // To prevent stale cells if new data is shorter, we clear first
      const clearRange = range.replace('1', '2'); // e.g. 'Guest List'!A2:K1000
      await sheetsClient.spreadsheets.values.clear({
        spreadsheetId,
        range: clearRange,
      });

      const sanitizedValues = CellGuard.sanitizePayload(values);

      // Update values
      await sheetsClient.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: sanitizedValues
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synchronized ${sheetType} to Google Sheets.`
    });

  } catch (error: any) {
    console.error('Error synchronizing sheet data in /api/sync:', error);
    const isAuthError = error?.code === 401 || error?.status === 401 || String(error?.message).toLowerCase().includes('invalid authentication credentials');
    return NextResponse.json(
      {
        success: false,
        isAuthError: Boolean(isAuthError),
        error: isAuthError ? 'Google OAuth access token expired or invalid. Please sign in again to refresh your session.' : (error.message || 'Sync save failed')
      },
      { status: isAuthError ? 401 : 500 }
    );
  }
}
