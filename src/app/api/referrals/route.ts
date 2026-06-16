import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/jwt';

export async function GET(req: Request) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const referrals = await db.referral.findMany({
      where: { inviterId: authUser.userId }
    });

    const inviteesCount = referrals.length;
    const walletBalance = referrals.reduce((sum: number, r: any) => sum + (r.rewardAmount || 0), 0);

    return NextResponse.json({
      referrals,
      inviteesCount,
      walletBalance,
      referralCode: `LADO-${authUser.userId.slice(0, 5).toUpperCase()}-2026`
    });
  } catch (err: any) {
    console.error('Referrals GET error:', err);
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
    const { inviteeEmail } = body;

    if (!inviteeEmail) {
      return NextResponse.json({ error: 'Invitee email is required' }, { status: 400 });
    }

    // Create a mock referral entry
    const newRef = await db.referral.create({
      data: {
        inviterId: authUser.userId,
        inviteeId: `mock-invitee-${Math.random().toString(36).substring(2, 7)}`,
        rewardAmount: 500.0 // ₹500 rewards
      }
    });

    return NextResponse.json({ success: true, referral: newRef });
  } catch (err: any) {
    console.error('Referrals POST error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
