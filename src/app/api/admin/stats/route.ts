import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/jwt';

export async function GET(req: Request) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admin credentials required.' }, { status: 403 });
    }

    const allUsers = await db.user.findMany();
    const allProfiles = await db.profile.findMany();
    const allInterests = await db.interest.findMany();
    const allTransactions = await db.transaction.findMany();

    const totalUsers = allUsers.length;
    const maleUsers = allProfiles.filter((p: any) => p.gender === 'Groom').length;
    const femaleUsers = allProfiles.filter((p: any) => p.gender === 'Bride').length;
    
    const verifiedProfiles = allUsers.filter((u: any) => u.isVerified === true).length;
    const activeMembers = allUsers.filter((u: any) => u.status === 'ACTIVE').length;
    const premiumMembers = allUsers.filter((u: any) => u.role === 'PREMIUM' || u.role === 'ELITE').length;

    // Calculate revenue
    const totalRevenue = allTransactions
      .filter((t: any) => t.status === 'SUCCESS')
      .reduce((sum: number, t: any) => sum + t.amount, 0);

    // Calculate matches (ACCEPTED interests)
    const successfulMatches = allInterests.filter((i: any) => i.status === 'ACCEPTED').length;
    const interestsSent = allInterests.length;

    // Calculate new registrations (users registered within the last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newRegistrations = allUsers.filter((u: any) => new Date(u.createdAt) >= sevenDaysAgo).length;

    return NextResponse.json({
      totalUsers,
      maleUsers,
      femaleUsers,
      verifiedProfiles,
      activeMembers,
      premiumMembers,
      totalRevenue,
      newRegistrations,
      interestsSent,
      successfulMatches
    });

  } catch (err: any) {
    console.error('Fetch Admin Stats Error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
