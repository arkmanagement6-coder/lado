import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/jwt';

export async function GET(req: Request) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Retrieve meetings where user is host or guest
    const hostId = authUser.userId;
    const meetings = await db.meetingSchedule.findMany({
      where: {
        OR: [
          { hostId },
          { guestId: hostId }
        ]
      }
    });

    // Decorate with user profile names
    const allUsers = await db.user.findMany();
    const decorated = meetings.map((m: any) => {
      const hostUser = allUsers.find((u: any) => u.id === m.hostId);
      const guestUser = allUsers.find((u: any) => u.id === m.guestId);
      return {
        ...m,
        hostName: hostUser?.name || 'Host',
        guestName: guestUser?.name || 'Match'
      };
    });

    return NextResponse.json(decorated);
  } catch (err: any) {
    console.error('Meetings GET error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { guestId, meetingType, scheduledAt, notes } = body;

    if (!guestId || !scheduledAt) {
      return NextResponse.json({ error: 'Guest ID and Scheduled Date/Time are required' }, { status: 400 });
    }

    const newMeeting = await db.meetingSchedule.create({
      data: {
        hostId: authUser.userId,
        guestId,
        meetingType: meetingType || 'VIDEO',
        scheduledAt,
        notes
      }
    });

    return NextResponse.json({ success: true, meeting: newMeeting });
  } catch (err: any) {
    console.error('Meetings POST error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'Meeting ID and status are required' }, { status: 400 });
    }

    const updated = await db.meetingSchedule.update({
      where: { id },
      data: { status }
    });

    return NextResponse.json({ success: true, meeting: updated });
  } catch (err: any) {
    console.error('Meetings PUT error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
