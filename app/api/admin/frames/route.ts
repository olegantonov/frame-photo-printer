import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const frames = await prisma.frame.findMany({
      orderBy: {
        created_at: 'desc',
      },
    });

    return NextResponse.json(frames);
  } catch (error) {
    console.error('Error fetching frames:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, width_mm, height_mm, border_px, image_url, active } = body;

    if (!name || !width_mm || !height_mm) {
      return NextResponse.json(
        { error: 'Name, width_mm, and height_mm are required' },
        { status: 400 }
      );
    }

    const frame = await prisma.frame.create({
      data: {
        name,
        width_mm: parseFloat(width_mm),
        height_mm: parseFloat(height_mm),
        border_px: parseInt(border_px) || 40,
        image_url: image_url || null,
        active: active !== false,
      },
    });

    return NextResponse.json(frame);
  } catch (error) {
    console.error('Error creating frame:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, name, width_mm, height_mm, border_px, image_url, active } = body;

    if (!id) {
      return NextResponse.json({ error: 'Frame ID required' }, { status: 400 });
    }

    const frame = await prisma.frame.update({
      where: { id },
      data: {
        name,
        width_mm: parseFloat(width_mm),
        height_mm: parseFloat(height_mm),
        border_px: parseInt(border_px),
        image_url,
        active,
      },
    });

    return NextResponse.json(frame);
  } catch (error) {
    console.error('Error updating frame:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Frame ID required' }, { status: 400 });
    }

    await prisma.frame.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting frame:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
