import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/jwt';

// GET all notifications for active user
export async function GET(req: Request) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const notifications = await db.notification.findMany({
      where: { userId: authUser.userId },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(notifications);
  } catch (err: any) {
    console.error('Fetch Notifications API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT to mark all notifications as read
export async function PUT(req: Request) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await db.notification.updateMany({
      where: { userId: authUser.userId },
      data: { isRead: true }
    });

    return NextResponse.json({ message: 'Notifications marked as read', count: result.count });
  } catch (err: any) {
    console.error('Mark Notifications Read API error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
