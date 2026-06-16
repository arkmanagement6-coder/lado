import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/jwt';

export async function GET(req: Request) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await db.user.findFirst({ where: { id: authUser.userId } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const profile = await db.profile.findUnique({ where: { id: user.id } });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
        isVerified: user.isVerified,
        status: user.status,
        twoFactorEnabled: user.twoFactorEnabled,
      },
      profile: profile || null,
    });
  } catch (err: any) {
    console.error('Auth check error:', err);
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
    const { role } = body;

    if (!role) {
      return NextResponse.json({ error: 'Role is required' }, { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: { id: authUser.userId },
      data: { role }
    });

    return NextResponse.json({ success: true, role: updatedUser.role });
  } catch (err: any) {
    console.error('Auth update error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
