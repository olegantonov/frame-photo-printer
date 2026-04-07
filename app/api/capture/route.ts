import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { imageData, orientation } = await request.json();

    if (!imageData || !orientation) {
      return NextResponse.json(
        { error: 'Missing imageData or orientation' },
        { status: 400 }
      );
    }

    // Convert base64 to buffer
    const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    const photoId = uuidv4();
    const result = await pool.query(
      'INSERT INTO photos (id, image_data, orientation) VALUES ($1, $2, $3) RETURNING id',
      [photoId, buffer, orientation]
    );

    return NextResponse.json({ photoId: result.rows[0].id }, { status: 201 });
  } catch (error) {
    console.error('Capture error:', error);
    return NextResponse.json(
      { error: 'Failed to capture photo' },
      { status: 500 }
    );
  }
}
