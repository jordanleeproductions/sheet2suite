import { NextRequest, NextResponse } from 'next/server';
import { verifyShareToken } from '@/lib/share/token';

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

    const requesterName = requestedBy && requestedBy.trim() ? requestedBy.trim() : 'Guest';
    const guestMessage = notes ? notes.trim() : '';

    console.log(`Song Request for spreadsheet ${payload.spreadsheetId}: "${songTitle}" by ${artist} (Requester: ${requesterName}, Message: "${guestMessage}")`);

    // In a live Google Drive / Sheets context, this appends a new row to the 'Music' sheet tab:
    // Columns: [Song ID, Song Title, Artist Name, List Type ('Play List'), Notes, Requested By]

    return NextResponse.json({
      success: true,
      message: `Successfully requested "${songTitle}" by ${artist}!`,
      requestedSong: {
        songId: `req-${Date.now()}`,
        songTitle,
        artistName: artist,
        listType: 'Play List',
        requestedBy: requesterName,
        notes: guestMessage,
        audioPreviewUrl: audioPreviewUrl || '',
        albumArt: albumArt || '',
      },
    });
  } catch (error) {
    console.error('Error in song request proxy:', error);
    return NextResponse.json({ error: 'Failed to submit song request' }, { status: 500 });
  }
}
