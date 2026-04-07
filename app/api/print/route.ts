import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { photoId, printerName } = await request.json();

    if (!photoId || !printerName) {
      return NextResponse.json(
        { error: 'Missing photoId or printerName' },
        { status: 400 }
      );
    }

    // Get framed photo
    const photoResult = await pool.query(
      'SELECT framed_image_data FROM photos WHERE id = $1 AND frame_applied = true',
      [photoId]
    );

    if (photoResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Photo not found or frame not applied' },
        { status: 404 }
      );
    }

    const imageBuffer = photoResult.rows[0].framed_image_data;
    const logId = uuidv4();

    // TODO: Implement actual printer integration
    // For now, just log the print request
    // In production, use CUPS or another print service
    
    try {
      // Simulate print success
      await pool.query(
        'INSERT INTO print_logs (id, photo_id, printer_name, status) VALUES ($1, $2, $3, $4)',
        [logId, photoId, printerName, 'queued']
      );

      await pool.query(
        'UPDATE photos SET printed_at = NOW() WHERE id = $1',
        [photoId]
      );

      return NextResponse.json(
        { success: true, logId, message: 'Print job queued successfully' },
        { status: 200 }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      await pool.query(
        'INSERT INTO print_logs (id, photo_id, printer_name, status, error_message) VALUES ($1, $2, $3, $4, $5)',
        [logId, photoId, printerName, 'failed', errorMessage]
      );

      return NextResponse.json(
        { error: 'Failed to print photo', details: errorMessage },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Print error:', error);
    return NextResponse.json(
      { error: 'Failed to process print request' },
      { status: 500 }
    );
  }
}
