import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [todayPhotos, todayPrints, pendingPrints, totalUsers, activeFrames] = await Promise.all([
      prisma.photo.count({
        where: {
          created_at: {
            gte: today,
          },
        },
      }),
      prisma.printLog.count({
        where: {
          printed_at: {
            gte: today,
          },
          status: 'success',
        },
      }),
      prisma.printLog.count({
        where: {
          status: 'pending',
        },
      }),
      prisma.user.count(),
      prisma.frame.count({
        where: {
          active: true,
        },
      }),
    ]);

    return NextResponse.json({
      todayPhotos,
      todayPrints,
      pendingPrints,
      totalUsers,
      totalFrames: activeFrames,
    });
  } catch (error) {
    console.error('Stats error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
