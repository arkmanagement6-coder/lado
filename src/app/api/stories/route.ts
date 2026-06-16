import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/jwt';

// GET all success stories
export async function GET() {
  try {
    const stories = await db.successStory.findMany();
    // Sort by newest first
    stories.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json(stories);
  } catch (err: any) {
    console.error('Fetch Success Stories error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST create story (Admin only)
export async function POST(req: Request) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admin credentials required.' }, { status: 403 });
    }

    const { brideName, groomName, weddingDate, story, coupleImage } = await req.json();

    if (!brideName || !groomName || !weddingDate || !story || !coupleImage) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const newStory = await db.successStory.create({
      data: {
        brideName,
        groomName,
        weddingDate,
        story,
        coupleImage
      }
    });

    return NextResponse.json(newStory);
  } catch (err: any) {
    console.error('Create Success Story error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
