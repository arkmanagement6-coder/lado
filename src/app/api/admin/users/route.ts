import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/jwt';

// GET all users (Admin view)
export async function GET(req: Request) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admin credentials required.' }, { status: 403 });
    }

    const allUsers = await db.user.findMany();
    const allProfiles = await db.profile.findMany();

    const result = allUsers.map((user: any) => {
      const profile = allProfiles.find((p: any) => p.id === user.id);
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        mobileNumber: user.mobileNumber,
        role: user.role,
        isVerified: user.isVerified,
        status: user.status,
        createdAt: user.createdAt,
        profilePhoto: profile?.profilePhoto || null,
        city: profile?.city || null,
        completionPercent: profile?.completionPercent || 0
      };
    });

    // Sort by registration date descending
    result.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json(result);
  } catch (err: any) {
    console.error('Admin Fetch Users Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST admin actions
export async function POST(req: Request) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admin credentials required.' }, { status: 403 });
    }

    const body = await req.json();
    const { action, targetUserId, newRole, newPassword } = body; // verify, suspend, activate, changeRole, delete, resetPassword

    if (!targetUserId || !action) {
      return NextResponse.json({ error: 'Target User ID and Action are required' }, { status: 400 });
    }

    // Protect against self-modification on deletion or suspension
    if (targetUserId === authUser.userId && (action === 'delete' || action === 'suspend')) {
      return NextResponse.json({ error: 'Cannot delete or suspend your own admin account' }, { status: 400 });
    }

    let message = '';
    let updatedData: any = {};

    switch (action) {
      case 'verify':
        updatedData = { isVerified: true };
        message = 'User profile verified successfully';
        break;
      case 'unverify':
        updatedData = { isVerified: false };
        message = 'User profile verification removed';
        break;
      case 'suspend':
        updatedData = { status: 'SUSPENDED' };
        message = 'User account suspended successfully';
        break;
      case 'activate':
        updatedData = { status: 'ACTIVE' };
        message = 'User account activated successfully';
        break;
      case 'changeRole':
        if (!newRole) return NextResponse.json({ error: 'New Role is required' }, { status: 400 });
        updatedData = { role: newRole };
        message = `User role changed to ${newRole}`;
        break;
      case 'resetPassword':
        if (!newPassword) return NextResponse.json({ error: 'New Password is required' }, { status: 400 });
        const passwordHash = await bcrypt.hash(newPassword, 10);
        updatedData = { passwordHash };
        message = 'User password reset successfully';
        break;
      case 'delete':
        await db.user.delete({ where: { id: targetUserId } });
        return NextResponse.json({ success: true, message: 'User account deleted successfully' });
      default:
        return NextResponse.json({ error: 'Invalid admin action' }, { status: 400 });
    }

    const updatedUser = await db.user.update({
      where: { id: targetUserId },
      data: updatedData
    });

    // Notify the user of admin changes
    if (action === 'verify') {
      await db.notification.create({
        data: {
          userId: targetUserId,
          type: 'MATCH_FOUND',
          title: 'Account Verified!',
          content: 'An administrator verified your identity. You now have a verified badge!'
        }
      });
    }

    return NextResponse.json({
      success: true,
      message,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
        status: updatedUser.status
      }
    });

  } catch (err: any) {
    console.error('Admin POST action Error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
