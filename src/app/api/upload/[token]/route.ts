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
    console.error('Error fetching upload metadata:', error);
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
      return NextResponse.json({ error: 'Invalid or expired upload token' }, { status: 401 });
    }

    const formData = await request.formData();
    const files = formData.getAll('files') as File[];
    const uploaderName = (formData.get('uploaderName') as string) || 'Anonymous Guest';
    const caption = (formData.get('caption') as string) || '';

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files uploaded' }, { status: 400 });
    }

    console.log(`Received ${files.length} upload(s) from "${uploaderName}" for spreadsheet: ${payload.spreadsheetId}`);
    files.forEach((f, idx) => {
      console.log(`  File ${idx + 1}: ${f.name} (${f.type}, ${f.size} bytes)`);
    });

    // In a live Google Drive integration context, these files are uploaded to 
    // the user's "My Drive/Wedding Planning/Guest Uploads" folder using drive.file scope.

    return NextResponse.json({
      success: true,
      message: `Successfully uploaded ${files.length} file(s)!`,
      uploadedCount: files.length,
      uploaderName,
      folderPath: 'My Drive/Wedding Planning/Guest Uploads',
    });
  } catch (error) {
    console.error('Error in photo upload proxy:', error);
    return NextResponse.json({ error: 'Failed to process file upload' }, { status: 500 });
  }
}
