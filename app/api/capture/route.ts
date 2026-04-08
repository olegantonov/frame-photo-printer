import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { applyFrame, detectImageOrientation } from '@/lib/frameRenderer';

export async function POST(request: NextRequest) {
  try {
    const { imageData } = await request.json();

    if (!imageData) {
      return NextResponse.json(
        { error: 'Missing imageData' },
        { status: 400 }
      );
    }

    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Detect orientation automatically
    const orientation = await detectImageOrientation(buffer);

    // Apply frame automatically
    const framedImageBuffer = await applyFrame(buffer, orientation, 40);

    const photoId = uuidv4();
    await pool.query(
      'INSERT INTO photos (id, image_data, orientation, frame_applied, framed_image_data) VALUES ($1, $2, $3, $4, $5)',
      [photoId, buffer, orientation, true, framedImageBuffer]
    );

    return NextResponse.json({ 
      photoId, 
      orientation,
      frameApplied: true,
      message: `Foto capturada em modo ${orientation === 'portrait' ? 'retrato' : 'paisagem'}` 
    }, { status: 201 });
  } catch (error) {
    console.error('Capture error:', error);
    return NextResponse.json(
      { error: 'Failed to capture photo' },
      { status: 500 }
    );
  }
}
