import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out successfully' });
  // Clear the auth cookie
  response.headers.set('Set-Cookie', 'lado_auth_token=; Path=/; HttpOnly; Max-Age=0; SameSite=Lax');
  return response;
}
