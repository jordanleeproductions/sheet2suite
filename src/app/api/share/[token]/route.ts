import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { verifyShareToken } from '@/lib/share/token';
import { isShareTokenRevokedAsync } from '@/lib/share/revocation';
import { mockDatabase, mockWeddingName } from '@/lib/sheets/mockDb';
import { getGoogleAuthAsync } from '@/lib/sheets/client';
import { isMockSpreadsheet } from '@/lib/auth/workspaceAuth';
import { LocalLicensingDb } from '@/lib/db/licensingDb';
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

    // Verify token signature & expiration
    const payload = verifyShareToken(token);
    if (!payload) {
      return NextResponse.json({ success: false, error: 'Invalid, revoked, or expired share link' }, { status: 401 });
    }

    // Verify server-side revocation status
    const isRevoked = await isShareTokenRevokedAsync(payload, token);
    if (isRevoked) {
      return NextResponse.json({ success: false, error: 'This vendor share link has been revoked by the couple.' }, { status: 401 });
    }

    const { spreadsheetId, scope, weddingName } = payload;
    let data: any = {};

    // Mock Mode
    if (isMockSpreadsheet(spreadsheetId)) {
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
        const dietaryGuestList: Array<{ name: string; restriction: string; mealChoice: string; table: string }> = [];
        const mealChoiceMap: Record<string, number> = {};

        attendingGuests.forEach(g => {
          const name = `${g.firstName} ${g.lastName}`.trim();
          const meal = g.mealChoice || 'Standard Menu';
          const table = g.tableAssignment || 'Unassigned';

          // Group Meal Choice Counts
          mealChoiceMap[meal] = (mealChoiceMap[meal] || 0) + 1;

          // Group Dietary Restrictions
          if (g.dietaryRestrictions && g.dietaryRestrictions.trim() !== '' && g.dietaryRestrictions.trim() !== 'None') {
            const key = g.dietaryRestrictions.trim();
            dietaryMap[key] = (dietaryMap[key] || 0) + 1;
            dietaryGuestList.push({
              name,
              restriction: key,
              mealChoice: meal,
              table
            });
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
          mealChoicesSummary: Object.entries(mealChoiceMap).map(([meal, count]) => ({ meal, count })),
          dietaryGuestList,
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

    // Google Sheets Mode: Authenticate using the couple's stored OAuth credentials for this spreadsheet
    try {
      const ws = await LocalLicensingDb.getWorkspaceBySpreadsheetIdAsync(spreadsheetId);
      const ownerEmail = ws?.userEmail || payload.userEmail;
      const auth = await getGoogleAuthAsync(undefined, spreadsheetId, ownerEmail, undefined, {
        allowStoredFallback: true,
      });
      const sheetsClient = google.sheets({ version: 'v4', auth });

      // Fetch spreadsheet metadata to get exact available sheet titles
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

      const musicTitle = findTitle(['MUSIC', 'Music Playlist', 'Music', 'Playlists']);
      const photosTitle = findTitle(['PHOTOS', 'Photos', 'Photo Shot List']);
      const scheduleTitle = findTitle(['SCHEDULE', 'Day-Of-Schedule', 'Schedule', 'Day_Of_Schedule', 'Timeline']);
      const guestsTitle = findTitle(['GUESTS', 'Guest List', 'Guests', 'Guest_List']);

      // Define tab ranges depending on scope
      const ranges: string[] = [];
      if (scope === 'music' || scope === 'vendor_hub') ranges.push(`'${musicTitle}'!A1:I1000`);
      if (scope === 'photos' || scope === 'vendor_hub') ranges.push(`'${photosTitle}'!A1:H1000`);
      if (scope === 'timeline' || scope === 'vendor_hub') ranges.push(`'${scheduleTitle}'!A1:F1000`);
      if (scope === 'catering' || scope === 'vendor_hub') ranges.push(`'${guestsTitle}'!A1:L1000`);

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
        const dietaryGuestList: Array<{ name: string; restriction: string; mealChoice: string; table: string }> = [];
        const mealChoiceMap: Record<string, number> = {};

        attendingGuests.forEach(g => {
          const name = `${g.firstName} ${g.lastName}`.trim();
          const meal = g.mealChoice || 'Standard Menu';
          const table = g.tableAssignment || 'Unassigned';

          // Group Meal Choice Counts
          mealChoiceMap[meal] = (mealChoiceMap[meal] || 0) + 1;

          // Group Dietary Restrictions
          if (g.dietaryRestrictions && g.dietaryRestrictions.trim() !== '' && g.dietaryRestrictions.trim() !== 'None') {
            const key = g.dietaryRestrictions.trim();
            dietaryMap[key] = (dietaryMap[key] || 0) + 1;
            dietaryGuestList.push({
              name,
              restriction: key,
              mealChoice: meal,
              table
            });
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
          mealChoicesSummary: Object.entries(mealChoiceMap).map(([meal, count]) => ({ meal, count })),
          dietaryGuestList,
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
      console.error('Error loading live spreadsheet for vendor share endpoint:', sheetError?.message);
      return NextResponse.json(
        {
          success: false,
          error: 'Unable to load live wedding spreadsheet. The couple may need to reconnect Google Drive in Sheet2Vow Settings.',
        },
        { status: 502 }
      );
    }

  } catch (error: any) {
    console.error('Error handling vendor share request:', error);
    return NextResponse.json({ success: false, error: 'Internal server error processing share token' }, { status: 500 });
  }
}
