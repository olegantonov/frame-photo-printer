import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { applyFrame } from '@/lib/frameRenderer';

export async function POST(request: NextRequest) {
  try {
    const { photoId, orientation } = await request.json();

    if (!photoId || !orientation) {
      return NextResponse.json(
        { error: 'Missing photoId or orientation' },
        { status: 400 }
      );
    }

    // Get photo from database
    const photoResult = await pool.query(
      'SELECT image_data FROM photos WHERE id = $1',
      [photoId]
    );

    if (photoResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Photo not found' },
        { status: 404 }
      );
    }

    const imageBuffer = photoResult.rows[0].image_data;

    // Apply frame with default config
    const framedImageBuffer = await applyFrame(imageBuffer, orientation);

    // Save framed image
    await pool.query(
      'UPDATE photos SET frame_applied = true, framed_image_data = $1 WHERE id = $2',
      [framedImageBuffer, photoId]
    );

    return NextResponse.json(
      { success: true, photoId },
      { status: 200 }
    );
  } catch (error) {
    console.error('Frame error:', error);
    return NextResponse.json(
      { error: 'Failed to apply frame' },
      { status: 500 }
    );
  }
}
