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
  giftMapper,
  musicMapper,
  cateringMapper,
  tableMapper,
} from '@/lib/sheets/mapper';
import { Guest, TableConfig, BudgetItem, ExpenseItem, ScheduleEvent, Vendor, Task, PhotoShot, GiftItem, Song, MenuItem, WeddingData } from '@/lib/sheets/types';

import { mockDatabase, mockWeddingName, setMockWeddingName } from '@/lib/sheets/mockDb';
import { CellGuard } from '@/lib/core/CellGuard';
import { applyDropdownValidations } from '@/lib/sheets/dropdownValidator';

// Map sheet columns to standard header lists so that we can write files correctly
const HEADERS_MAP = {
  guests: ['Guest ID', 'First Name', 'Last Name', 'Party Group', 'Age Category', 'RSVP Status', 'Dietary Restrictions', 'Meal Choice', 'Reception Table', 'Ceremony Seating', 'Email Address', 'Phone Number', 'Mailing Address', 'Thanked'],
  tables: ['Table ID', 'Table Name', 'Table Shape', 'Max Seats', 'Include End Seats', 'Single Side Seating'],
  budget: ['Category ID', 'Category', 'Target Budget', 'Total Spent', 'Remaining', 'Notes'],
  expenses: ['Item ID', 'Description', 'Category', 'Actual Cost', 'Amount Paid', 'Purchase Date', 'Notes'],
  schedule: ['Start Time', 'End Time', 'Event Moment', 'Location', 'Responsibility / Vendors', 'Notes / Details'],
  vendors: ['Vendor ID', 'Vendor Name', 'Category', 'Contact Name', 'Email Address', 'Phone Number', 'Total Contract Value', 'Deposit Paid', 'Balance Owing', 'Payment Due Date', 'Contract Link', 'Staff Meals Required'],
  tasks: ['Task ID', 'Task Name', 'Kanban Stage', 'Category', 'Priority', 'Assigned To', 'Due Date', 'Notes / Links'],
  music: ['Song ID', 'Song Title', 'Artist', 'Occasion', 'Play Status', 'Requested By', 'Notes', 'Approval Status', 'Link'],
  photos: ['Shot ID', 'Description', 'Location', 'Shot Time', 'Included People', 'Status', 'Priority', 'Notes'],
  gifts: ['Item ID', 'Gift Description / Name', 'Giver / From', 'Category / Store', 'Estimated Value / Cash Amount', 'Thank You Sent', 'Notes'],
  catering: ['Item ID', 'Course Category', 'Item Name', 'Description', 'Is Guest Choice', 'Vegetarian', 'Vegan', 'Gluten-Free', 'Nut-Free'],
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

    const auth = await (await import('@/lib/sheets/client')).getGoogleAuthAsync(accessToken, spreadsheetId);
    const sheetsClient = (await import('googleapis')).google.sheets({ version: 'v4', auth });

    // Step 1: Fetch spreadsheet metadata to get exact available sheet titles
    const metaRes = await sheetsClient.spreadsheets.get({ spreadsheetId });
    const availableTitles = (metaRes.data.sheets || []).map(s => s.properties?.title || '').filter(Boolean);

    const findTitle = (candidates: string[]): string | null => {
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

      return null;
    };

    const settingsTitle = findTitle(['SETTINGS', 'Settings', 'DASHBOARD', 'Dashboard']) || 'Settings';
    const guestsTitle = findTitle(['GUESTS', 'Guest List', 'Guests', 'Guest_List']);
    const budgetTitle = findTitle(['BUDGET', 'Budget Ledger', 'Budget', 'Budget_Ledger']);
    const expensesTitle = findTitle(['EXPENSES', 'Expenses', 'Expense List']);
    const scheduleTitle = findTitle(['SCHEDULE', 'Day-Of-Schedule', 'Schedule', 'Day_Of_Schedule', 'Timeline']);
    const vendorsTitle = findTitle(['VENDORS', 'Vendors', 'Vendor Directory']);
    const tasksTitle = findTitle(['TO DO', 'To Do', 'To_Do_List', 'To-Do List', 'To Do List', 'TASKS', 'Tasks']);
    const photosTitle = findTitle(['PHOTOS', 'Photos', 'Photo Shot List']);
    const giftsTitle = findTitle(['GIFT REGISTRY', 'GIFTS', 'Gifts', 'Gift Registry', 'Gift_Registry']);
    const musicTitle = findTitle(['MUSIC', 'Music', 'Playlists', 'Playlist']);
    const cateringTitle = findTitle(['CATERING', 'Catering', 'Catering Menu', 'Menu', 'FOOD', 'Food']);
    const tablesTitle = findTitle(['TABLES', 'Table Assignments', 'Tables', 'Floorplan']);
    const dashTitle = availableTitles.some(t => t.toLowerCase() === 'dashboard') ? findTitle(['DASHBOARD', 'Dashboard']) : null;

    // Dynamically register ranges only for sheets that actually exist in availableTitles
    const rangeIndexMap: Record<string, number> = {};
    const ranges: string[] = [];

    const registerRange = (key: string, title: string | null, cellRange: string) => {
      if (title && availableTitles.includes(title)) {
        rangeIndexMap[key] = ranges.length;
        ranges.push(`'${title}'!${cellRange}`);
      }
    };

    registerRange('settingsTable', settingsTitle, 'A1:B10');
    registerRange('guests', guestsTitle, 'A1:L1000');
    registerRange('budget', budgetTitle, 'A1:H1000');
    registerRange('expenses', expensesTitle, 'A1:G1000');
    registerRange('schedule', scheduleTitle, 'A1:F1000');
    registerRange('vendors', vendorsTitle, 'A1:L1000');
    registerRange('tasks', tasksTitle, 'A1:H1000');
    registerRange('photos', photosTitle, 'A1:H1000');
    registerRange('gifts', giftsTitle, 'A1:G1000');
    registerRange('music', musicTitle, 'A1:I1000');
    registerRange('catering', cateringTitle, 'A1:I1000');
    registerRange('tables', tablesTitle, 'A1:F1000');
    registerRange('settingsZ', settingsTitle, 'Z1:Z3');
    if (dashTitle) {
      registerRange('dash', dashTitle, 'B2');
    }

    // Fetch all present spreadsheet tabs in a single atomic batch get
    let valueRanges: any[] = [];
    if (ranges.length > 0) {
      const batchGetResponse = await sheetsClient.spreadsheets.values.batchGet({
        spreadsheetId,
        ranges,
        valueRenderOption: 'UNFORMATTED_VALUE',
      });
      valueRanges = batchGetResponse.data.valueRanges || [];
    }

    const getRows = (key: string): any[][] => {
      const idx = rangeIndexMap[key];
      if (idx !== undefined && valueRanges[idx]?.values) {
        return valueRanges[idx].values;
      }
      return [];
    };

    const settingsTableRows = getRows('settingsTable');
    let weddingName = 'Our Wedding';
    let totalBudget = 30000;
    let weddingDate = '';
    let location = '';
    let currency = 'USD ($)';

    if (settingsTableRows.length > 0) {
      settingsTableRows.forEach((row: any[]) => {
        if (!row || row.length < 2) return;
        const key = String(row[0] || '').trim().toLowerCase();
        const val = String(row[1] || '').trim();
        
        if (key.includes('wedding name') || key.includes('couple') || key.includes('title')) {
          if (val) weddingName = val;
        } else if (key.includes('budget')) {
          const num = Number(val.replace(/[^0-9.-]+/g, ''));
          if (!isNaN(num) && num > 0) totalBudget = num;
        } else if (key.includes('date')) {
          if (val) weddingDate = val;
        } else if (key.includes('location') || key.includes('venue')) {
          if (val) location = val;
        } else if (key.includes('currency')) {
          if (val) currency = val;
        }
      });
    }

    // Parse legacy Settings!Z1:Z3 if standard table was blank
    const zRows = getRows('settingsZ');
    if (zRows && zRows.length > 0) {
      const z1Val = zRows[0]?.[0];
      const z2Val = zRows[1]?.[0];
      const z3Val = zRows[2]?.[0];

      if (z2Val && !weddingName) weddingName = z2Val;
      if (z3Val) totalBudget = Number(z3Val) || 30000;

      if (!z2Val && !z3Val && z1Val) {
        try {
          if (z1Val.startsWith('{')) {
            const parsed = JSON.parse(z1Val);
            if (parsed.weddingName) weddingName = parsed.weddingName;
            if (parsed.budget) totalBudget = Number(parsed.budget) || 30000;
            if (parsed.weddingDate) weddingDate = parsed.weddingDate;
            if (parsed.location) location = parsed.location;
            if (parsed.currency) currency = parsed.currency;
          }
        } catch (_) {}
      }
    }

    // Helper to check if a sheet row contains real content
    const isNonEmptyRow = (row: any[]) => row && Array.isArray(row) && row.some(cell => cell !== undefined && cell !== null && String(cell).trim() !== '');

    // Parse Guest List
    const guestRows = getRows('guests');
    const guestHeaders = guestRows[0] || HEADERS_MAP.guests;
    const guests = guestRows.slice(1).filter(isNonEmptyRow).map(row => guestMapper.fromRow(guestHeaders, row));

    // Parse Budget Ledger
    const budgetRows = getRows('budget');
    const budgetHeaders = budgetRows[0] || HEADERS_MAP.budget;
    const budget = budgetRows.slice(1).filter(isNonEmptyRow).map(row => budgetMapper.fromRow(budgetHeaders, row));

    // Parse Expenses
    const expenseRows = getRows('expenses');
    const expenseHeaders = expenseRows[0] || HEADERS_MAP.expenses;
    const expenses = expenseRows.slice(1).filter(isNonEmptyRow).map(row => expenseMapper.fromRow(expenseHeaders, row));

    // Parse Day-Of-Schedule
    const scheduleRows = getRows('schedule');
    const scheduleHeaders = scheduleRows[0] || HEADERS_MAP.schedule;
    const schedule = scheduleRows.slice(1).filter(isNonEmptyRow).map(row => scheduleMapper.fromRow(scheduleHeaders, row));

    // Parse Vendors
    const vendorRows = getRows('vendors');
    const vendorHeaders = vendorRows[0] || HEADERS_MAP.vendors;
    const vendors = vendorRows.slice(1).filter(isNonEmptyRow).map(row => vendorMapper.fromRow(vendorHeaders, row)).filter(v => Boolean(v.vendorName && v.vendorName.trim() !== ''));

    // Parse To-Do List
    const taskRows = getRows('tasks');
    const taskHeaders = taskRows[0] || HEADERS_MAP.tasks;
    const tasks = taskRows.slice(1).filter(isNonEmptyRow).map(row => taskMapper.fromRow(taskHeaders, row));

    // Parse Photos
    const photoRows = getRows('photos');
    const photoHeaders = photoRows[0] || HEADERS_MAP.photos;
    const photos = photoRows.slice(1).filter(isNonEmptyRow).map(row => photoMapper.fromRow(photoHeaders, row));

    // Parse Gifts
    const giftRows = getRows('gifts');
    const giftHeaders = giftRows[0] || HEADERS_MAP.gifts;
    const gifts = giftRows.slice(1).filter(isNonEmptyRow).map(row => giftMapper.fromRow(giftHeaders, row));

    // Parse Music Playlists
    const musicRows = getRows('music');
    const musicHeaders = musicRows[0] || HEADERS_MAP.music;
    const music = musicRows.slice(1).filter(isNonEmptyRow).map(row => musicMapper.fromRow(musicHeaders, row));

    // Parse Catering Menu
    const cateringRows = getRows('catering');
    const cateringHeaders = cateringRows[0] || HEADERS_MAP.catering;
    const catering = cateringRows.slice(1).filter(isNonEmptyRow).map((row, idx) => {
      const item = cateringMapper.fromRow(cateringHeaders, row);
      if (!item.id) {
        item.id = `M${101 + idx}`;
      }
      return item;
    });

    // Parse Tables (filter out blank/empty rows with no Table ID)
    const tableRows = getRows('tables');
    const tableHeaders = tableRows[0] || HEADERS_MAP.tables;
    const tables = tableRows
      .slice(1)
      .filter(isNonEmptyRow)
      .map(row => tableMapper.fromRow(tableHeaders, row))
      .filter(table => Boolean(table.tableId && table.tableId.trim() !== ''));

    // Calculate dynamic values for Dashboard UI
    const estimatedCost = budget.reduce((sum, item) => sum + item.estimatedCost, 0);
    const actualCost = expenses.length > 0 
      ? expenses.reduce((sum, item) => sum + item.actualCost, 0)
      : budget.reduce((sum, item) => sum + item.actualCost, 0);
    const remainingTasks = tasks.filter(t => t.kanbanStage === 'To Do').length;

    const data: WeddingData = {
      dashboard: {
        totalBudget: totalBudget > 0 ? totalBudget : (estimatedCost > 0 ? estimatedCost : 0),
        estimatedCost,
        actualCost,
        remainingTasks,
        weddingDate,
        location,
        currency,
      },
      guests,
      budget,
      expenses,
      schedule,
      vendors,
      tasks,
      music,
      photos,
      gifts,
      catering,
      tables,
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
      } else if (sheetType === 'catering') {
        mockDatabase.catering = data as MenuItem[];
      } else if (sheetType === 'tables') {
        mockDatabase.tables = (data as TableConfig[]).filter(t => Boolean(t && t.tableId && t.tableId.trim() !== ''));
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

    const auth = await (await import('@/lib/sheets/client')).getGoogleAuthAsync(accessToken, spreadsheetId);
    const sheetsClient = (await import('googleapis')).google.sheets({ version: 'v4', auth });

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

      let settingsTitle = findTitle(['SETTINGS', 'Settings']);
      if (!settingsTitle) {
        try {
          await sheetsClient.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
              requests: [{
                addSheet: {
                  properties: {
                    title: 'SETTINGS'
                  }
                }
              }]
            }
          });
          settingsTitle = 'SETTINGS';
        } catch (sheetErr) {
          console.warn('Could not auto-create SETTINGS tab, proceeding:', sheetErr);
          settingsTitle = 'SETTINGS';
        }
      }
      const dashTitle = findTitle(['DASHBOARD', 'Dashboard']);
      
      const settingsValues: any[][] = [
        ['Name', 'Value'],
        ['Wedding Name', data.weddingName || 'Our Wedding'],
        ['Wedding Budget', data.totalBudget !== undefined ? Number(data.totalBudget) : (data.budget !== undefined ? Number(data.budget) : 35000)],
      ];

      if (data.weddingDate !== undefined) {
        settingsValues.push(['Wedding Date', data.weddingDate]);
      }
      if (data.location !== undefined) {
        settingsValues.push(['Location Details', data.location]);
      }
      if (data.currency !== undefined) {
        settingsValues.push(['Currency', data.currency]);
      }

      const updateRanges: any[] = [
        {
          range: `'${settingsTitle}'!A1:B${settingsValues.length}`,
          values: settingsValues,
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
      let targetTitle = '';
      let values: any[][] = [];
      const headers = HEADERS_MAP[sheetType as keyof typeof HEADERS_MAP];
      
      // Setup the header row
      values.push(headers);

      if (sheetType === 'guests') {
        targetTitle = findTitle(['GUESTS', 'Guest List', 'Guests', 'Guest_List']);
        range = `'${targetTitle}'!A1:N1000`;
        (data as Guest[]).forEach(item => {
          values.push(guestMapper.toRow(headers, item));
        });
      } else if (sheetType === 'budget') {
        targetTitle = findTitle(['BUDGET', 'Budget Ledger', 'Budget', 'Budget_Ledger']);
        range = `'${targetTitle}'!A1:F1000`;
        (data as BudgetItem[]).forEach((item, index) => {
          values.push(budgetMapper.toRow(headers, item, index + 2));
        });
      } else if (sheetType === 'expenses') {
        targetTitle = findTitle(['EXPENSES', 'Expenses', 'Expense List']);
        range = `'${targetTitle}'!A1:G1000`;
        (data as ExpenseItem[]).forEach(item => {
          values.push(expenseMapper.toRow(headers, item));
        });
      } else if (sheetType === 'schedule') {
        targetTitle = findTitle(['SCHEDULE', 'Day-Of-Schedule', 'Schedule', 'Day_Of_Schedule', 'Timeline']);
        range = `'${targetTitle}'!A1:F1000`;
        (data as ScheduleEvent[]).forEach(item => {
          values.push(scheduleMapper.toRow(headers, item));
        });
      } else if (sheetType === 'vendors') {
        targetTitle = findTitle(['VENDORS', 'Vendors', 'Vendor Directory']);
        range = `'${targetTitle}'!A1:L1000`;
        (data as Vendor[]).filter(item => Boolean(item && item.vendorName && item.vendorName.trim() !== '')).forEach(item => {
          values.push(vendorMapper.toRow(headers, item));
        });
      } else if (sheetType === 'tasks') {
        targetTitle = findTitle(['TO DO', 'To Do', 'To_Do_List', 'To-Do List', 'To Do List', 'TASKS', 'Tasks']);
        range = `'${targetTitle}'!A1:H1000`;
        (data as Task[]).forEach(item => {
          values.push(taskMapper.toRow(headers, item));
        });
      } else if (sheetType === 'photos') {
        targetTitle = findTitle(['PHOTOS', 'Photos', 'Photo Shot List']);
        range = `'${targetTitle}'!A1:H1000`;
        (data as PhotoShot[]).forEach(item => {
          values.push(photoMapper.toRow(headers, item));
        });
      } else if (sheetType === 'gifts') {
        targetTitle = findTitle(['GIFT REGISTRY', 'GIFTS', 'Gifts', 'Gift Registry', 'Gift_Registry']);
        range = `'${targetTitle}'!A1:G1000`;
        (data as GiftItem[]).forEach(item => {
          values.push(giftMapper.toRow(headers, item));
        });
      } else if (sheetType === 'music') {
        targetTitle = findTitle(['MUSIC', 'Music', 'Playlists', 'Playlist']);
        range = `'${targetTitle}'!A1:I1000`;
        (data as Song[]).forEach(item => {
          values.push(musicMapper.toRow(headers, item));
        });
      } else if (sheetType === 'catering') {
        targetTitle = findTitle(['CATERING', 'Catering', 'Catering Menu', 'Menu', 'FOOD', 'Food']);
        range = `'${targetTitle}'!A1:I1000`;
        (data as MenuItem[]).forEach(item => {
          values.push(cateringMapper.toRow(headers, item));
        });
      } else if (sheetType === 'tables') {
        targetTitle = findTitle(['TABLES', 'Table Assignments', 'Tables', 'Floorplan']);
        range = `'${targetTitle}'!A1:F1000`;
        const validTables = (data as TableConfig[]).filter(item => Boolean(item && item.tableId && item.tableId.trim() !== ''));
        validTables.forEach(item => {
          values.push(tableMapper.toRow(headers, item));
        });
      }

      // Auto-create sheet tab if missing from spreadsheet
      if (targetTitle && !availableTitles.some(t => t.toLowerCase() === targetTitle.toLowerCase())) {
        try {
          await sheetsClient.spreadsheets.batchUpdate({
            spreadsheetId,
            requestBody: {
              requests: [
                {
                  addSheet: {
                    properties: {
                      title: targetTitle,
                    }
                  }
                }
              ]
            }
          });
          availableTitles.push(targetTitle);
        } catch (addErr) {
          console.warn(`[Sync] Could not auto-create tab ${targetTitle}:`, addErr);
        }
      }

      // To prevent stale cells if new data is shorter, we clear row 2 onwards
      const cellBounds = range.split('!')[1] || 'A1:Z1000';
      const clearRange = `'${targetTitle}'!${cellBounds.replace(/^A1:/, 'A2:')}`;
      try {
        await sheetsClient.spreadsheets.values.clear({
          spreadsheetId,
          range: clearRange,
        });
      } catch (clearErr) {
        console.warn(`[Sync] Non-critical clear error on ${clearRange}:`, clearErr);
      }

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
