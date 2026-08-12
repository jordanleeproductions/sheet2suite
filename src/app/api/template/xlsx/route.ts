import { NextRequest, NextResponse } from 'next/server';
import { generateMasterXlsxBuffer } from '@/lib/core/templates/xlsxGenerator';

/**
 * GET /api/template/xlsx
 * Serves/downloads the pre-formatted Microsoft Excel (.xlsx) Master Template for offline / non-Google users.
 */
export async function GET(req: NextRequest) {
  try {
    const url = req.nextUrl;
    const coupleName = url.searchParams.get('coupleName') || 'Alex & Sam';

    const xlsxBuffer = await generateMasterXlsxBuffer(coupleName);

    return new NextResponse(xlsxBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="Sheet2Vow_${coupleName.replace(/[^a-zA-Z0-9]/g, '_')}_Master_Template.xlsx"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating XLSX template download:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate Excel template file.' },
      { status: 500 }
    );
  }
}
