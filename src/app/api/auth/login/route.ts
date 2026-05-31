import { NextResponse } from 'next/server';
import { loginWithGoogle } from '@/lib/appwrite-auth';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const redirectTo = searchParams.get('redirectTo') || '/';
  const origin = new URL(request.url).origin;
  const successUrl = `${origin}/auth/callback?redirectTo=${encodeURIComponent(redirectTo)}`;
  const failureUrl = `${origin}/auth/signin?error=oauth`;

  try {
    const response = await loginWithGoogle(successUrl, failureUrl);
    if (!response) {
      throw new Error('Appwrite did not return an OAuth URL.');
    }
    return NextResponse.redirect(response);
  } catch (error) {
    return NextResponse.json({ error: 'Login failed' }, { status: 400 });
  }
}
