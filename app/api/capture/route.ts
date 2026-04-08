import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import { applyFrame, detectImageOrientation, FrameConfig } from '@/lib/frameRenderer';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { imageData } = await request.json();

    if (!imageData) {
      return NextResponse.json(
        { error: 'Missing imageData' },
        { status: 400 }
      );
    }

    // Get frame config from database
    let frameConfig: FrameConfig | undefined;
    try {
      const config = await prisma.systemConfig.findUnique({
        where: { id: 'system' }
      });
      if (config) {
        frameConfig = {
          frame_border_size: config.frame_border_size,
          frame_bg_color: config.frame_bg_color,
          frame_show_id: config.frame_show_id,
          frame_show_datetime: config.frame_show_datetime,
        };
      }
    } catch (e) {
      console.warn('Could not load frame config, using defaults');
    }

    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    // Detect orientation automatically
    const orientation = await detectImageOrientation(buffer);

    // Apply frame with config
    const framedImageBuffer = await applyFrame(buffer, orientation, frameConfig);

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
