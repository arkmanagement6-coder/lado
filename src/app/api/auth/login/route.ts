import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { signToken } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
    }

    // Verify account status
    if (user.status === 'SUSPENDED') {
      return NextResponse.json({ error: 'Your account has been suspended. Please contact support.' }, { status: 403 });
    }

    const isValidPassword = await bcrypt.compare(password, user.passwordHash);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 400 });
    }

    // Sign Auth Token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const response = NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isVerified: user.isVerified
      },
      message: 'Login successful'
    });

    // Set HTTP-only Cookie
    response.headers.set('Set-Cookie', `lado_auth_token=${token}; Path=/; HttpOnly; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`);
    return response;

  } catch (err: any) {
    console.error('Login API error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
