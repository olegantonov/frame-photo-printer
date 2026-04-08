import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

const execAsync = promisify(exec);

async function printWithCups(imageBuffer: Buffer, printerName: string): Promise<void> {
  const tempFile = join(tmpdir(), `print-${uuidv4()}.png`);
  
  try {
    await writeFile(tempFile, imageBuffer);
    
    // Print using lp command (CUPS)
    await execAsync(`lp -d "${printerName}" -o fit-to-page -o media=a5 "${tempFile}"`);
  } finally {
    // Clean up temp file
    try {
      await unlink(tempFile);
    } catch {
      // Ignore cleanup errors
    }
  }
}

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

    try {
      // Log as pending
      await pool.query(
        'INSERT INTO print_logs (id, photo_id, printer_name, status) VALUES ($1, $2, $3, $4)',
        [logId, photoId, printerName, 'printing']
      );

      // Print via CUPS
      await printWithCups(imageBuffer, printerName);

      // Update status to success
      await pool.query(
        'UPDATE print_logs SET status = $1 WHERE id = $2',
        ['success', logId]
      );

      await pool.query(
        'UPDATE photos SET printed_at = NOW() WHERE id = $1',
        [photoId]
      );

      return NextResponse.json(
        { success: true, logId, message: 'Foto impressa com sucesso!' },
        { status: 200 }
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      await pool.query(
        'UPDATE print_logs SET status = $1, error_message = $2 WHERE id = $3',
        ['failed', errorMessage, logId]
      );

      return NextResponse.json(
        { error: 'Falha ao imprimir', details: errorMessage },
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
