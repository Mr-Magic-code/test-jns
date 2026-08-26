import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST() {
  try {
    const cookieStore = await cookies();
    
    // Cookie ko delete karne ka best tareeqa
    cookieStore.delete('auth_token');

    // Response mein header set karna taake browser storage se bhi clear ho jaye
    const response = NextResponse.json({ message: 'Logged out successfully' }, { status: 200 });
    
    // Cookie ko expire karke remove karne ka explicit command
    response.cookies.set('auth_token', '', {
      httpOnly: true,
      expires: new Date(0), // Past date set karke cookie destroy kar di
      path: '/',
    });

    return response;
  } catch (error) {
    return NextResponse.json({ message: 'Error during logout' }, { status: 500 });
  }
}