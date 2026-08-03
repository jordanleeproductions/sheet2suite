import { NextResponse } from 'next/server';
import { getSheetsClient } from '@/lib/sheets/client';
import { 
  guestMapper, 
  budgetMapper, 
  scheduleMapper, 
  vendorMapper, 
  taskMapper,
  photoMapper,
  giftMapper 
} from '@/lib/sheets/mapper';
import { Guest, BudgetItem, ScheduleEvent, Vendor, Task, PhotoShot, GiftItem, WeddingData } from '@/lib/sheets/types';

import { mockDatabase, mockWeddingName, setMockWeddingName } from '@/lib/sheets/mockDb';

// Map sheet columns to standard header lists so that we can write files correctly
const HEADERS_MAP = {
  guests: ['Guest ID', 'First Name', 'Last Name', 'Party Group', 'Age Category', 'RSVP Status', 'Dietary Restrictions', 'Table Assignment', 'Email Address', 'Phone Number', 'Mailing Address', 'Thanked'],
  budget: ['Item ID', 'Category', 'Vendor Name', 'Estimated Cost', 'Actual Cost', 'Amount Paid', 'Due Date', 'Payment Status'],
  schedule: ['Start Time', 'End Time', 'Event Moment', 'Location', 'Responsibility / Vendors', 'Notes / Details'],
  vendors: ['Vendor ID', 'Vendor Name', 'Category', 'Contact Name', 'Email Address', 'Phone Number', 'Total Contract Value', 'Deposit Paid', 'Balance Owing', 'Payment Due Date', 'Contract Link', 'Staff Meals Required'],
  tasks: ['Task ID', 'Task Name', 'Kanban Stage', 'Category', 'Priority', 'Assigned To', 'Due Date', 'Notes / Links'],
  music: ['Song ID', 'Title', 'Artist', 'List Type', 'Link', 'Notes'],
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

    // Fetch all spreadsheet tabs in a single atomic batch get
    const batchGetResponse = await sheetsClient.spreadsheets.values.batchGet({
      spreadsheetId,
      ranges: [
        "'Settings'!B2",
        "'Guest List'!A1:L1000",
        "'Budget Ledger'!A1:H1000",
        "'Day-Of-Schedule'!A1:F1000",
        "'Vendors'!A1:L1000",
        "'To-Do List'!A1:H1000",
        "'PHOTOS'!A1:H1000",
        "'GIFT REGISTRY'!A1:G1000",
        "'Dashboard'!B2"
      ]
    });

    const valueRanges = batchGetResponse.data.valueRanges || [];
    
    // Parse Settings / Configuration JSON (Cell B2 in 'Settings' tab, fallback to 'Dashboard'!B2)
    const settingsVal = valueRanges[0]?.values?.[0]?.[0] || valueRanges[8]?.values?.[0]?.[0] || '';
    let totalBudget = 30000;
    let weddingName = 'Our Wedding';
    
    try {
      if (settingsVal.startsWith('{')) {
        const parsed = JSON.parse(settingsVal);
        totalBudget = Number(parsed.budget) || 30000;
        weddingName = parsed.weddingName || 'Our Wedding';
      } else {
        totalBudget = Number(settingsVal) || 30000;
      }
    } catch {
      totalBudget = Number(settingsVal) || 30000;
    }

    // Parse Guest List
    const guestRows = valueRanges[1]?.values || [];
    const guestHeaders = guestRows[0] || HEADERS_MAP.guests;
    const guests = guestRows.slice(1).map(row => guestMapper.fromRow(guestHeaders, row));

    // Parse Budget Ledger
    const budgetRows = valueRanges[2]?.values || [];
    const budgetHeaders = budgetRows[0] || HEADERS_MAP.budget;
    const budget = budgetRows.slice(1).map(row => budgetMapper.fromRow(budgetHeaders, row));

    // Parse Day-Of-Schedule
    const scheduleRows = valueRanges[3]?.values || [];
    const scheduleHeaders = scheduleRows[0] || HEADERS_MAP.schedule;
    const schedule = scheduleRows.slice(1).map(row => scheduleMapper.fromRow(scheduleHeaders, row));

    // Parse Vendors
    const vendorRows = valueRanges[4]?.values || [];
    const vendorHeaders = vendorRows[0] || HEADERS_MAP.vendors;
    const vendors = vendorRows.slice(1).map(row => vendorMapper.fromRow(vendorHeaders, row));

    // Parse To-Do List
    const taskRows = valueRanges[5]?.values || [];
    const taskHeaders = taskRows[0] || HEADERS_MAP.tasks;
    const tasks = taskRows.slice(1).map(row => taskMapper.fromRow(taskHeaders, row));

    // Parse Photos
    const photoRows = valueRanges[6]?.values || [];
    const photoHeaders = photoRows[0] || HEADERS_MAP.photos;
    const photos = photoRows.slice(1).map(row => photoMapper.fromRow(photoHeaders, row));

    // Parse Gifts
    const giftRows = valueRanges[7]?.values || [];
    const giftHeaders = giftRows[0] || HEADERS_MAP.gifts;
    const gifts = giftRows.slice(1).map(row => giftMapper.fromRow(giftHeaders, row));

    // Calculate dynamic values for Dashboard UI
    const estimatedCost = budget.reduce((sum, item) => sum + item.estimatedCost, 0);
    const actualCost = budget.reduce((sum, item) => sum + item.actualCost, 0);
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
    return NextResponse.json({ success: false, error: error.message || 'Sync load failed' }, { status: 500 });
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
        mockDatabase.dashboard.totalBudget = Number(data.budget) || mockDatabase.dashboard.totalBudget;
        setMockWeddingName(data.weddingName || 'Our Wedding');
      } else if (sheetType === 'guests') {
        mockDatabase.guests = data as Guest[];
      } else if (sheetType === 'budget') {
        mockDatabase.budget = data as BudgetItem[];
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
        message: `Successfully synchronized ${sheetType} in Mock Mode.`,
        data: mockDatabase,
        isMock: true
      });
    }

    const sheetsClient = getSheetsClient(accessToken);

    if (sheetType === 'dashboard') {
      // Update cell B2 in 'Settings' tab for clean configuration storage
      await sheetsClient.spreadsheets.values.update({
        spreadsheetId,
        range: "'Settings'!B2",
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values: [[JSON.stringify({ budget: data.budget, weddingName: data.weddingName })]],
        },
      });
    } else {
      // Overwrite the sheet rows
      let range = '';
      let values: any[][] = [];
      const headers = HEADERS_MAP[sheetType as keyof typeof HEADERS_MAP];
      
      // Setup the header row
      values.push(headers);

      if (sheetType === 'guests') {
        range = "'Guest List'!A1:L1000";
        (data as Guest[]).forEach(item => {
          values.push(guestMapper.toRow(headers, item));
        });
      } else if (sheetType === 'budget') {
        range = "'Budget Ledger'!A1:H1000";
        (data as BudgetItem[]).forEach(item => {
          values.push(budgetMapper.toRow(headers, item));
        });
      } else if (sheetType === 'schedule') {
        range = "'Day-Of-Schedule'!A1:F1000";
        (data as ScheduleEvent[]).forEach(item => {
          values.push(scheduleMapper.toRow(headers, item));
        });
      } else if (sheetType === 'vendors') {
        range = "'Vendors'!A1:L1000";
        (data as Vendor[]).forEach(item => {
          values.push(vendorMapper.toRow(headers, item));
        });
      } else if (sheetType === 'tasks') {
        range = "'To-Do List'!A1:H1000";
        (data as Task[]).forEach(item => {
          values.push(taskMapper.toRow(headers, item));
        });
      } else if (sheetType === 'photos') {
        range = "'PHOTOS'!A1:H1000";
        (data as PhotoShot[]).forEach(item => {
          values.push(photoMapper.toRow(headers, item));
        });
      } else if (sheetType === 'gifts') {
        range = "'GIFT REGISTRY'!A1:G1000";
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

      // Update values
      await sheetsClient.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption: 'USER_ENTERED',
        requestBody: {
          values
        }
      });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synchronized ${sheetType} to Google Sheets.`
    });

  } catch (error: any) {
    console.error('Error synchronizing sheet data in /api/sync:', error);
    return NextResponse.json({ success: false, error: error.message || 'Sync save failed' }, { status: 500 });
  }
}
