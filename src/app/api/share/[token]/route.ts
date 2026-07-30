import { NextResponse } from 'next/server';
import { verifyShareToken } from '@/lib/share/token';
import { mockDatabase, mockWeddingName } from '@/lib/sheets/mockDb';
import { getSheetsClient } from '@/lib/sheets/client';
import { musicMapper, photoMapper, scheduleMapper, guestMapper } from '@/lib/sheets/mapper';

export async function GET(
  req: Request,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;

    if (!token) {
      return NextResponse.json({ success: false, error: 'Token parameter is required' }, { status: 400 });
    }

    // Verify token
    const payload = verifyShareToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Invalid, revoked, or expired share link' }, { status: 401 });
    }

    const { spreadsheetId, scope, weddingName } = payload;
    let data: any = {};

    // Mock Mode
    if (spreadsheetId === 'mock-sheet-id-vow-12345' || !process.env.GOOGLE_CLIENT_EMAIL) {
      if (scope === 'music' || scope === 'vendor_hub') {
        data.music = mockDatabase.music;
      }
      if (scope === 'photos' || scope === 'vendor_hub') {
        data.photos = mockDatabase.photos;
      }
      if (scope === 'timeline' || scope === 'vendor_hub') {
        data.schedule = mockDatabase.schedule;
      }
      if (scope === 'catering' || scope === 'vendor_hub') {
        const attendingGuests = mockDatabase.guests.filter(g => (g.rsvpStatus || '').toLowerCase() === 'attending');
        
        // Group dietary restrictions
        const dietaryMap: Record<string, number> = {};
        attendingGuests.forEach(g => {
          if (g.dietaryRestrictions && g.dietaryRestrictions.trim() !== '') {
            const key = g.dietaryRestrictions.trim();
            dietaryMap[key] = (dietaryMap[key] || 0) + 1;
          }
        });

        // Group seating summary
        const tableMap: Record<string, number> = {};
        attendingGuests.forEach(g => {
          const tName = g.tableAssignment || 'Unassigned';
          tableMap[tName] = (tableMap[tName] || 0) + 1;
        });

        data.catering = {
          attendingCount: attendingGuests.length,
          dietarySummary: Object.entries(dietaryMap).map(([restriction, count]) => ({ restriction, count })),
          tableSummary: Object.entries(tableMap).map(([tableName, count]) => ({ tableName, count })),
        };
      }

      return NextResponse.json({
        success: true,
        weddingName: weddingName || mockWeddingName,
        scope,
        data,
        isMock: true,
      });
    }

    // Google Sheets Mode
    try {
      const sheetsClient = getSheetsClient(undefined);

      // Define tab ranges depending on scope
      const ranges: string[] = [];
      if (scope === 'music' || scope === 'vendor_hub') ranges.push("'Music Playlist'!A1:F1000");
      if (scope === 'photos' || scope === 'vendor_hub') ranges.push("'PHOTOS'!A1:H1000");
      if (scope === 'timeline' || scope === 'vendor_hub') ranges.push("'Day-Of-Schedule'!A1:F1000");
      if (scope === 'catering' || scope === 'vendor_hub') ranges.push("'Guest List'!A1:L1000");

      const batchResponse = await sheetsClient.spreadsheets.values.batchGet({
        spreadsheetId,
        ranges,
      });

      const valueRanges = batchResponse.data.valueRanges || [];
      let rangeIdx = 0;

      if (scope === 'music' || scope === 'vendor_hub') {
        const rows = valueRanges[rangeIdx++]?.values || [];
        const headers = rows[0] || ['Song ID', 'Title', 'Artist', 'List Type', 'Link', 'Notes'];
        data.music = rows.slice(1).map(r => musicMapper.fromRow(headers, r));
      }

      if (scope === 'photos' || scope === 'vendor_hub') {
        const rows = valueRanges[rangeIdx++]?.values || [];
        const headers = rows[0] || ['Shot ID', 'Description', 'Location', 'Shot Time', 'Included People', 'Status', 'Priority', 'Notes'];
        data.photos = rows.slice(1).map(r => photoMapper.fromRow(headers, r));
      }

      if (scope === 'timeline' || scope === 'vendor_hub') {
        const rows = valueRanges[rangeIdx++]?.values || [];
        const headers = rows[0] || ['Start Time', 'End Time', 'Event Moment', 'Location', 'Responsibility / Vendors', 'Notes / Details'];
        data.schedule = rows.slice(1).map(r => scheduleMapper.fromRow(headers, r));
      }

      if (scope === 'catering' || scope === 'vendor_hub') {
        const rows = valueRanges[rangeIdx++]?.values || [];
        const headers = rows[0] || ['Guest ID', 'First Name', 'Last Name', 'Party Group', 'Age Category', 'RSVP Status', 'Dietary Restrictions', 'Table Assignment'];
        const guests = rows.slice(1).map(r => guestMapper.fromRow(headers, r));
        const attendingGuests = guests.filter(g => (g.rsvpStatus || '').toLowerCase() === 'attending');

        const dietaryMap: Record<string, number> = {};
        attendingGuests.forEach(g => {
          if (g.dietaryRestrictions && g.dietaryRestrictions.trim() !== '') {
            const key = g.dietaryRestrictions.trim();
            dietaryMap[key] = (dietaryMap[key] || 0) + 1;
          }
        });

        const tableMap: Record<string, number> = {};
        attendingGuests.forEach(g => {
          const tName = g.tableAssignment || 'Unassigned';
          tableMap[tName] = (tableMap[tName] || 0) + 1;
        });

        data.catering = {
          attendingCount: attendingGuests.length,
          dietarySummary: Object.entries(dietaryMap).map(([restriction, count]) => ({ restriction, count })),
          tableSummary: Object.entries(tableMap).map(([tableName, count]) => ({ tableName, count })),
        };
      }

      return NextResponse.json({
        success: true,
        weddingName,
        scope,
        data,
        isMock: false,
      });

    } catch (sheetError: any) {
      console.warn('Fallback to mock mode for share endpoint due to sheet error:', sheetError.message);
      
      // Graceful fallback to mock data
      return NextResponse.json({
        success: true,
        weddingName: weddingName || mockWeddingName,
        scope,
        data: {
          music: mockDatabase.music,
          photos: mockDatabase.photos,
          schedule: mockDatabase.schedule,
          catering: {
            attendingCount: 18,
            dietarySummary: [{ restriction: 'Gluten Free', count: 3 }, { restriction: 'Nut Allergy', count: 1 }],
            tableSummary: [{ tableName: 'Table 1', count: 8 }, { tableName: 'Table 2', count: 8 }]
          }
        },
        isMock: true,
      });
    }

  } catch (error: any) {
    console.error('Error handling vendor share request:', error);
    return NextResponse.json({ success: false, error: 'Internal server error processing share token' }, { status: 500 });
  }
}
