import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let config = await prisma.systemConfig.findUnique({
      where: { id: 'system' }
    });

    if (!config) {
      config = await prisma.systemConfig.create({
        data: { id: 'system' }
      });
    }

    return NextResponse.json(config, { status: 200 });
  } catch (error) {
    console.error('Config GET error:', error);
    return NextResponse.json(
      { error: 'Failed to get config' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      default_printer, 
      hotspot_enabled, 
      hotspot_ssid, 
      hotspot_password,
      frame_portrait,
      frame_landscape,
      frame_show_id,
      frame_show_datetime
    } = body;

    const config = await prisma.systemConfig.upsert({
      where: { id: 'system' },
      update: {
        ...(default_printer !== undefined && { default_printer }),
        ...(hotspot_enabled !== undefined && { hotspot_enabled }),
        ...(hotspot_ssid !== undefined && { hotspot_ssid }),
        ...(hotspot_password !== undefined && { hotspot_password }),
        ...(frame_portrait !== undefined && { frame_portrait }),
        ...(frame_landscape !== undefined && { frame_landscape }),
        ...(frame_show_id !== undefined && { frame_show_id }),
        ...(frame_show_datetime !== undefined && { frame_show_datetime }),
      },
      create: {
        id: 'system',
        default_printer,
        hotspot_enabled: hotspot_enabled ?? false,
        hotspot_ssid: hotspot_ssid ?? 'FramePhotoPrinter',
        hotspot_password: hotspot_password ?? 'foto1234',
        frame_portrait: frame_portrait ?? null,
        frame_landscape: frame_landscape ?? null,
        frame_show_id: frame_show_id ?? true,
        frame_show_datetime: frame_show_datetime ?? true,
      }
    });

    return NextResponse.json(config, { status: 200 });
  } catch (error) {
    console.error('Config PUT error:', error);
    return NextResponse.json(
      { error: 'Failed to update config' },
      { status: 500 }
    );
  }
}
