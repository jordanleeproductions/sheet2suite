import { NextRequest, NextResponse } from 'next/server';
import { verifyShareToken } from '@/lib/share/token';
import { mockDatabase } from '@/lib/sheets/mockDb';
import { Song } from '@/lib/sheets/types';

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

    return NextResponse.json({
      success: true,
      weddingName: payload.weddingName || 'Our Wedding',
      spreadsheetId: payload.spreadsheetId,
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
    const { token } = await params;
    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const payload = verifyShareToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const body = await request.json();
    const { songTitle, artist, requestedBy, notes, audioPreviewUrl, albumArt } = body;

    if (!songTitle || !artist) {
      return NextResponse.json({ error: 'Song title and artist are required' }, { status: 400 });
    }

    const titleClean = songTitle.trim();
    const artistClean = (artist || 'Various Artists').trim();
    const requesterName = requestedBy && requestedBy.trim() ? requestedBy.trim() : 'Guest';
    const guestMessage = notes ? notes.trim() : '';

    console.log(`Song Request for spreadsheet ${payload.spreadsheetId}: "${titleClean}" by ${artistClean} (Requester: ${requesterName}, Message: "${guestMessage}")`);

    // Check if song matches an existing banned track in database
    const isBanned = (mockDatabase.music || []).some(s => 
      (s.playStatus === 'Banned' || s.approvalStatus === 'Banned' || s.listType === 'Do Not Play') &&
      s.title.toLowerCase() === titleClean.toLowerCase()
    );

    const newSong: Song = {
      songId: `req-${Date.now()}`,
      title: titleClean,
      artist: artistClean,
      listType: 'Reception',
      playStatus: isBanned ? 'Banned' : 'Must Play',
      approvalStatus: isBanned ? 'Banned' : 'Pending Approval',
      requestedBy: requesterName,
      notes: guestMessage,
      link: audioPreviewUrl || '',
    };

    if (!mockDatabase.music) {
      mockDatabase.music = [];
    }
    mockDatabase.music.push(newSong);

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
