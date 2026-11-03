import { NextRequest, NextResponse } from 'next/server';
import { google } from 'googleapis';
import { verifyShareToken } from '@/lib/share/token';
import { isShareTokenRevokedAsync } from '@/lib/share/revocation';
import { mockDatabase } from '@/lib/sheets/mockDb';
import { Song } from '@/lib/sheets/types';
import { getGoogleAuthAsync } from '@/lib/sheets/client';
import { isMockSpreadsheet } from '@/lib/auth/workspaceAuth';
import { LocalLicensingDb } from '@/lib/db/licensingDb';
import { CellGuard } from '@/lib/core/CellGuard';
import { musicMapper } from '@/lib/sheets/mapper';
import { checkRateLimit } from '@/lib/core/rateLimiter';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await params;
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const payload = verifyShareToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired share token' }, { status: 401 });
    }

    const revoked = await isShareTokenRevokedAsync(payload, token);
    if (revoked) {
      return NextResponse.json({ error: 'This song request link has been revoked' }, { status: 401 });
    }

    // SECURITY [VULN-3]: Do not leak internal spreadsheetId or userEmail in public metadata
    return NextResponse.json({
      success: true,
      weddingName: payload.weddingName || 'Our Wedding',
      exp: payload.exp,
    });
  } catch (error) {
    console.error('Error fetching song request metadata:', error);
    return NextResponse.json({ error: 'Failed to process request' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const rate = checkRateLimit(request, 'guest-song-request', 30, 15 * 60 * 1000);
    if (!rate.allowed) {
      return NextResponse.json(
        { error: `Too many requests. Please wait ${rate.retryAfterSeconds}s and try again.` },
        { status: 429 }
      );
    }

    const { token } = await params;
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const payload = verifyShareToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const revoked = await isShareTokenRevokedAsync(payload, token);
    if (revoked) {
      return NextResponse.json({ error: 'This song request link has been revoked' }, { status: 401 });
    }

    const body = await request.json();
    const { songTitle, artist, requestedBy, notes, audioPreviewUrl } = body;

    if (!songTitle || !artist) {
      return NextResponse.json({ error: 'Song title and artist are required' }, { status: 400 });
    }

    const titleClean = String(songTitle).trim().slice(0, 200);
    const artistClean = String(artist || 'Various Artists').trim().slice(0, 200);
    const requesterName =
      requestedBy && String(requestedBy).trim()
        ? String(requestedBy).trim().slice(0, 120)
        : 'Guest';
    const guestMessage = notes ? String(notes).trim().slice(0, 500) : '';
    const linkClean = audioPreviewUrl ? String(audioPreviewUrl).trim().slice(0, 500) : '';

    const newSong: Song = {
      songId: `req-${Date.now()}`,
      title: titleClean,
      artist: artistClean,
      listType: 'Requested Song',
      playStatus: 'Must Play',
      approvalStatus: 'Pending Approval',
      requestedBy: requesterName,
      notes: guestMessage,
      link: linkClean,
    };

    // If real Google Sheet, append directly to the couple's MUSIC tab
    if (!isMockSpreadsheet(payload.spreadsheetId)) {
      try {
        const ws = await LocalLicensingDb.getWorkspaceBySpreadsheetIdAsync(payload.spreadsheetId);
        const ownerEmail = ws?.userEmail || payload.userEmail;
        const auth = await getGoogleAuthAsync(
          undefined,
          payload.spreadsheetId,
          ownerEmail,
          undefined,
          { allowStoredFallback: true }
        );
        const sheets = google.sheets({ version: 'v4', auth });

        const metaRes = await sheets.spreadsheets.get({ spreadsheetId: payload.spreadsheetId });
        const availableTitles = (metaRes.data.sheets || [])
          .map((s) => s.properties?.title || '')
          .filter(Boolean);
        const musicTab =
          availableTitles.find((t) =>
            ['music', 'music playlist', 'playlists'].includes(t.toLowerCase().trim())
          ) || 'MUSIC';

        // Check existing songs for banned status
        try {
          const existingRes = await sheets.spreadsheets.values.get({
            spreadsheetId: payload.spreadsheetId,
            range: `'${musicTab}'!A1:I500`,
          });
          const rows = existingRes.data.values || [];
          if (rows.length > 1) {
            const headers = rows[0];
            const existingSongs = rows.slice(1).map((r) => musicMapper.fromRow(headers, r));
            const isBanned = existingSongs.some(
              (s) =>
                (s.playStatus === 'Banned' ||
                  s.approvalStatus === 'Banned' ||
                  s.listType === 'Do Not Play') &&
                s.title.toLowerCase() === titleClean.toLowerCase()
            );
            if (isBanned) {
              newSong.playStatus = 'Banned';
              newSong.approvalStatus = 'Banned';
            }
          }
        } catch (_) {}

        const rawRow = [
          newSong.songId,
          newSong.title,
          newSong.artist,
          newSong.listType,
          newSong.playStatus,
          newSong.requestedBy || 'Guest',
          newSong.notes || '',
          newSong.approvalStatus || 'Pending Approval',
          newSong.link || '',
        ];
        const sanitizedRow = CellGuard.sanitizeUntrustedInput(rawRow);

        await sheets.spreadsheets.values.append({
          spreadsheetId: payload.spreadsheetId,
          range: `'${musicTab}'!A:I`,
          valueInputOption: 'USER_ENTERED',
          insertDataOption: 'INSERT_ROWS',
          requestBody: {
            values: [sanitizedRow],
          },
        });
      } catch (sheetErr) {
        console.warn('[Request Song] Could not append song to live Google Sheet:', sheetErr);
      }
    } else if (process.env.NODE_ENV !== 'production') {
      const isBanned = (mockDatabase.music || []).some(
        (s) =>
          (s.playStatus === 'Banned' ||
            s.approvalStatus === 'Banned' ||
            s.listType === 'Do Not Play') &&
          s.title.toLowerCase() === titleClean.toLowerCase()
      );
      if (isBanned) {
        newSong.playStatus = 'Banned';
        newSong.approvalStatus = 'Banned';
      }
      if (!mockDatabase.music) {
        mockDatabase.music = [];
      }
      mockDatabase.music.push(newSong);
    }

    return NextResponse.json({
      success: true,
      message: `Successfully requested "${titleClean}" by ${artistClean}!`,
      requestedSong: newSong,
    });
  } catch (error) {
    console.error('Error in song request proxy:', error);
    return NextResponse.json({ error: 'Failed to submit song request' }, { status: 500 });
  }
}
