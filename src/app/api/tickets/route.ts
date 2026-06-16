import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/jwt';

export async function GET(req: Request) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tickets = await db.supportTicket.findMany({
      where: { userId: authUser.userId }
    });

    return NextResponse.json(tickets);
  } catch (err: any) {
    console.error('Tickets GET error:', err);
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
    const { subject, category, priority, description } = body;

    if (!subject || !category || !description) {
      return NextResponse.json({ error: 'Subject, category, and description are required' }, { status: 400 });
    }

    const newTicket = await db.supportTicket.create({
      data: {
        userId: authUser.userId,
        subject,
        category,
        priority: priority || 'MEDIUM',
        description
      }
    });

    return NextResponse.json({ success: true, ticket: newTicket });
  } catch (err: any) {
    console.error('Tickets POST error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
