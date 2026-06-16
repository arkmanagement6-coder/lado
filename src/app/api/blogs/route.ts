import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getAuthUser } from '@/lib/jwt';

// GET all blogs
export async function GET() {
  try {
    const blogs = await db.blog.findMany();
    // Sort by newest first
    blogs.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return NextResponse.json(blogs);
  } catch (err: any) {
    console.error('Fetch Blogs error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// POST create blog (Admin only)
export async function POST(req: Request) {
  try {
    const authUser = getAuthUser(req);
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden. Admin credentials required.' }, { status: 403 });
    }

    const { title, content, category, image, author } = await req.json();

    if (!title || !content || !category || !image) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Generate unique slug
    const slug = title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '') + '-' + Math.floor(100 + Math.random() * 900);

    const blog = await db.blog.create({
      data: {
        title,
        slug,
        content,
        category,
        image,
        author: author || 'Admin'
      }
    });

    return NextResponse.json(blog);
  } catch (err: any) {
    console.error('Create Blog error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
