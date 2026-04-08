import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

const FRAMES_DIR = path.join(process.cwd(), 'public', 'frames');

export async function GET() {
  try {
    // Ensure frames directory exists
    try {
      await fs.access(FRAMES_DIR);
    } catch {
      await fs.mkdir(FRAMES_DIR, { recursive: true });
    }

    // List PNG files in frames directory
    const files = await fs.readdir(FRAMES_DIR);
    const frames = files
      .filter(file => file.toLowerCase().endsWith('.png'))
      .map(file => ({
        name: file,
        path: `/frames/${file}`,
        displayName: file.replace(/\.png$/i, '').replace(/[-_]/g, ' ')
      }));

    return NextResponse.json(frames, { status: 200 });
  } catch (error) {
    console.error('Frames GET error:', error);
    return NextResponse.json(
      { error: 'Failed to list frames' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!file.name.toLowerCase().endsWith('.png')) {
      return NextResponse.json(
        { error: 'Only PNG files are allowed' },
        { status: 400 }
      );
    }

    // Ensure frames directory exists
    try {
      await fs.access(FRAMES_DIR);
    } catch {
      await fs.mkdir(FRAMES_DIR, { recursive: true });
    }

    // Save the file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    
    // Sanitize filename
    const safeName = file.name
      .toLowerCase()
      .replace(/[^a-z0-9.-]/g, '-')
      .replace(/-+/g, '-');
    
    const filePath = path.join(FRAMES_DIR, safeName);
    await fs.writeFile(filePath, buffer);

    return NextResponse.json({
      success: true,
      frame: {
        name: safeName,
        path: `/frames/${safeName}`,
        displayName: safeName.replace(/\.png$/i, '').replace(/[-_]/g, ' ')
      }
    }, { status: 200 });
  } catch (error) {
    console.error('Frames POST error:', error);
    return NextResponse.json(
      { error: 'Failed to upload frame' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('name');
    
    if (!filename) {
      return NextResponse.json(
        { error: 'No filename provided' },
        { status: 400 }
      );
    }

    const filePath = path.join(FRAMES_DIR, filename);
    
    // Security check: ensure the file is within FRAMES_DIR
    const resolvedPath = path.resolve(filePath);
    if (!resolvedPath.startsWith(FRAMES_DIR)) {
      return NextResponse.json(
        { error: 'Invalid filename' },
        { status: 400 }
      );
    }

    await fs.unlink(filePath);

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('Frames DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete frame' },
      { status: 500 }
    );
  }
}
