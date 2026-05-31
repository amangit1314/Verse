import { NextResponse } from 'next/server';
import { logout } from '@/lib/appwrite-auth';

export async function POST() {
  const success = await logout();
  
  if (success) {
    return NextResponse.json({ success: true });
  }
  
  return NextResponse.json({ error: 'Logout failed' }, { status: 400 });
}
