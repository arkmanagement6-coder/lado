import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/jwt';

// GET interests sent and received
export async function GET(req: Request) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allInterests = await db.interest.findMany({
      where: {
        OR: [
          { senderId: authUser.userId },
          { receiverId: authUser.userId }
        ]
      }
    });

    const allUsers = await db.user.findMany();
    const allProfiles = await db.profile.findMany();

    const result = allInterests.map((interest: any) => {
      const isSender = interest.senderId === authUser.userId;
      const targetUserId = isSender ? interest.receiverId : interest.senderId;
      const targetUser = allUsers.find((u: any) => u.id === targetUserId);
      const targetProfile = allProfiles.find((p: any) => p.id === targetUserId);

      return {
        id: interest.id,
        status: interest.status,
        senderId: interest.senderId,
        receiverId: interest.receiverId,
        createdAt: interest.createdAt,
        updatedAt: interest.updatedAt,
        targetUser: targetUser ? {
          id: targetUser.id,
          name: targetUser.name,
          email: targetUser.email,
          role: targetUser.role,
          isVerified: targetUser.isVerified
        } : null,
        targetProfile: targetProfile || null
      };
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Fetch Interests Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST to send interest
export async function POST(req: Request) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { receiverId } = await req.json();
    if (!receiverId) {
      return NextResponse.json({ error: 'Receiver ID is required' }, { status: 400 });
    }

    if (receiverId === authUser.userId) {
      return NextResponse.json({ error: 'You cannot send interest to yourself' }, { status: 400 });
    }

    // Check duplicate
    const existing = await db.interest.findMany({
      where: { senderId: authUser.userId, receiverId }
    });

    if (existing.length > 0) {
      const active = existing.find((i: any) => i.status === 'SENT' || i.status === 'ACCEPTED');
      if (active) {
        return NextResponse.json({ error: 'Interest is already active' }, { status: 400 });
      }
    }

    // Create Interest
    const interest = await db.interest.create({
      data: {
        senderId: authUser.userId,
        receiverId,
        status: 'SENT'
      }
    });

    // Create Notification for receiver
    const sender = await db.user.findFirst({ where: { id: authUser.userId } });
    await db.notification.create({
      data: {
        userId: receiverId,
        type: 'INTEREST_RECEIVED',
        title: 'New Interest Received!',
        content: `${sender?.name || 'Someone'} has expressed interest in your profile. Review it now!`
      }
    });

    return NextResponse.json(interest);
  } catch (err: any) {
    console.error('Send Interest Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// PUT to accept/decline interest
export async function PUT(req: Request) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { interestId, status } = await req.json(); // ACCEPTED, DECLINED, CANCELLED
    if (!interestId || !status) {
      return NextResponse.json({ error: 'Interest ID and status are required' }, { status: 400 });
    }

    const interests = await db.interest.findMany({
      where: { OR: [{ senderId: authUser.userId }, { receiverId: authUser.userId }] }
    });
    const interest = interests.find((i: any) => i.id === interestId);

    if (!interest) {
      return NextResponse.json({ error: 'Interest record not found' }, { status: 404 });
    }

    const updated = await db.interest.update({
      where: { id: interestId },
      data: { status }
    });

    // Create notification for target user
    const currentUser = await db.user.findFirst({ where: { id: authUser.userId } });
    
    if (status === 'ACCEPTED') {
      const targetId = interest.senderId === authUser.userId ? interest.receiverId : interest.senderId;
      await db.notification.create({
        data: {
          userId: targetId,
          type: 'MATCH_FOUND',
          title: 'Interest Accepted!',
          content: `${currentUser?.name} accepted your interest request! You can now start chatting.`
        }
      });

      // Send confirmation to acceptor as well
      await db.notification.create({
        data: {
          userId: authUser.userId,
          type: 'MATCH_FOUND',
          title: 'Match Connected!',
          content: `You accepted interest from ${targetId === interest.senderId ? 'sender' : 'receiver'}. Start talking!`
        }
      });
    }

    return NextResponse.json(updated);
  } catch (err: any) {
    console.error('Update Interest Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE to cancel interest
export async function DELETE(req: Request) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('interestId');
    if (!id) {
      return NextResponse.json({ error: 'Interest ID is required' }, { status: 400 });
    }

    await db.interest.delete({ where: { id } });
    return NextResponse.json({ message: 'Interest deleted/cancelled' });
  } catch (err: any) {
    console.error('Delete Interest Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
