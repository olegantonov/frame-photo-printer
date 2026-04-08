import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { exec } from 'child_process';
import { promisify } from 'util';
import { writeFile, unlink } from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';

const execAsync = promisify(exec);

// Process print jobs in background
async function processPrintJob(jobId: string) {
  try {
    // Mark as processing
    await prisma.printJob.update({
      where: { id: jobId },
      data: { status: 'processing', processed_at: new Date() }
    });

    // Get job details
    const job = await prisma.printJob.findUnique({ where: { id: jobId } });
    if (!job) return;

    // Get photo data
    const photoResult = await pool.query(
      'SELECT framed_image_data FROM photos WHERE id = $1 AND frame_applied = true',
      [job.photo_id]
    );

    if (photoResult.rows.length === 0) {
      await prisma.printJob.update({
        where: { id: jobId },
        data: { status: 'failed', error: 'Photo not found' }
      });
      return;
    }

    const imageBuffer = photoResult.rows[0].framed_image_data;
    const tempFile = join(tmpdir(), `print-${jobId}.png`);

    try {
      await writeFile(tempFile, imageBuffer);

      // Print each copy
      for (let i = 0; i < job.copies; i++) {
        await execAsync(`lp -d "${job.printer_name}" -o fit-to-page -o media=a5 "${tempFile}"`);
      }

      // Mark as completed
      await prisma.printJob.update({
        where: { id: jobId },
        data: { status: 'completed', completed_at: new Date() }
      });

      // Update photo printed_at
      await pool.query(
        'UPDATE photos SET printed_at = NOW() WHERE id = $1',
        [job.photo_id]
      );

    } finally {
      try { await unlink(tempFile); } catch { /* ignore */ }
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    await prisma.printJob.update({
      where: { id: jobId },
      data: { status: 'failed', error: errorMessage }
    });
  }
}

// Add job to queue
export async function POST(request: NextRequest) {
  try {
    const { photoId, printerName, copies = 1 } = await request.json();

    if (!photoId || !printerName) {
      return NextResponse.json(
        { error: 'Missing photoId or printerName' },
        { status: 400 }
      );
    }

    if (copies < 1 || copies > 10) {
      return NextResponse.json(
        { error: 'Copies must be between 1 and 10' },
        { status: 400 }
      );
    }

    // Verify photo exists
    const photoResult = await pool.query(
      'SELECT id FROM photos WHERE id = $1 AND frame_applied = true',
      [photoId]
    );

    if (photoResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Photo not found or frame not applied' },
        { status: 404 }
      );
    }

    // Create print job
    const job = await prisma.printJob.create({
      data: {
        photo_id: photoId,
        printer_name: printerName,
        copies: copies,
        status: 'pending'
      }
    });

    // Process job in background (don't await)
    processPrintJob(job.id).catch(console.error);

    return NextResponse.json({
      success: true,
      jobId: job.id,
      copies: copies,
      message: `${copies} cópia${copies > 1 ? 's' : ''} adicionada${copies > 1 ? 's' : ''} à fila de impressão`
    }, { status: 201 });

  } catch (error) {
    console.error('Print queue error:', error);
    return NextResponse.json(
      { error: 'Failed to add to print queue' },
      { status: 500 }
    );
  }
}

// Get queue status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (jobId) {
      // Get specific job
      const job = await prisma.printJob.findUnique({ where: { id: jobId } });
      if (!job) {
        return NextResponse.json({ error: 'Job not found' }, { status: 404 });
      }
      return NextResponse.json(job);
    }

    // Get recent jobs (last 50)
    const jobs = await prisma.printJob.findMany({
      orderBy: { created_at: 'desc' },
      take: 50
    });

    // Get queue stats
    const pending = await prisma.printJob.count({ where: { status: 'pending' } });
    const processing = await prisma.printJob.count({ where: { status: 'processing' } });
    const completed = await prisma.printJob.count({ where: { status: 'completed' } });
    const failed = await prisma.printJob.count({ where: { status: 'failed' } });

    return NextResponse.json({
      stats: { pending, processing, completed, failed },
      jobs
    });

  } catch (error) {
    console.error('Print queue GET error:', error);
    return NextResponse.json(
      { error: 'Failed to get queue status' },
      { status: 500 }
    );
  }
}
