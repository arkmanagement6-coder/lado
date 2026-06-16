import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { signToken } from '@/lib/jwt';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, password, mobileNumber, method, otp } = body;

    // Validate registration method
    if (method === 'otp') {
      if (!mobileNumber || !otp) {
        return NextResponse.json({ error: 'Mobile number and OTP are required' }, { status: 400 });
      }
      
      // Sandbox OTP verification - verify if OTP equals '123456' or any 6-digit number
      if (otp !== '123456') {
        return NextResponse.json({ error: 'Invalid OTP code. Use 123456 for sandbox testing.' }, { status: 400 });
      }

      // Generate a mock email for mobile signup if not provided
      const mockEmail = `user_${mobileNumber}@lado.com`;
      const existingUser = await db.user.findUnique({ where: { email: mockEmail } });
      
      if (existingUser) {
        // Log user in directly
        const token = signToken({
          userId: existingUser.id,
          email: existingUser.email,
          role: existingUser.role,
        });

        const response = NextResponse.json({
          user: {
            id: existingUser.id,
            name: existingUser.name,
            email: existingUser.email,
            role: existingUser.role,
            isVerified: existingUser.isVerified,
          },
          message: 'LoggedIn successfully with OTP'
        });

        response.headers.set('Set-Cookie', `lado_auth_token=${token}; Path=/; HttpOnly; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`);
        return response;
      }

      // Create new user for mobile
      const passwordHash = await bcrypt.hash('otp_default_pass_123', 10);
      const newUser = await db.user.create({
        data: {
          name: name || `User ${mobileNumber}`,
          email: mockEmail,
          passwordHash,
          mobileNumber,
          role: 'CUSTOMER',
        },
      });

      // Initialize Profile
      await db.profile.create({
        data: {
          id: newUser.id,
          completionPercent: 10,
          photoPrivacy: 'PUBLIC',
        },
      });

      // Send greeting notification
      await db.notification.create({
        data: {
          userId: newUser.id,
          type: 'MATCH_FOUND',
          title: 'Welcome to Lado Matrimonial!',
          content: 'Complete your profile wizard to unlock AI-based matrimonial suggestions!'
        }
      });

      const token = signToken({
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
      });

      const response = NextResponse.json({
        user: {
          id: newUser.id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          isVerified: false
        },
        message: 'Registered successfully with OTP'
      });

      response.headers.set('Set-Cookie', `lado_auth_token=${token}; Path=/; HttpOnly; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`);
      return response;
    }

    // Email registration method
    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'A user with this email already exists' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = await db.user.create({
      data: {
        name,
        email,
        passwordHash,
        mobileNumber: mobileNumber || null,
        role: 'CUSTOMER',
      },
    });

    // Initialize Profile
    await db.profile.create({
      data: {
        id: newUser.id,
        completionPercent: 10,
        photoPrivacy: 'PUBLIC',
      },
    });

    // Send greeting notification
    await db.notification.create({
      data: {
        userId: newUser.id,
        type: 'MATCH_FOUND',
        title: 'Welcome to Lado Matrimonial!',
        content: 'Fill in your details in the registration wizard to find compatible matches!'
      }
    });

    const token = signToken({
      userId: newUser.id,
      email: newUser.email,
      role: newUser.role,
    });

    const response = NextResponse.json({
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isVerified: false
      },
      message: 'Registered successfully'
    });

    response.headers.set('Set-Cookie', `lado_auth_token=${token}; Path=/; HttpOnly; Max-Age=${60 * 60 * 24 * 7}; SameSite=Lax`);
    return response;

  } catch (err: any) {
    console.error('Registration API error:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
