import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';
// Apne database pool ko yahan import karein (e.g. import pool from '@/lib/db';)

const SECRET_KEY = new TextEncoder().encode(process.env.JNS_MASTER_KEY);

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET_KEY);
    const userId = payload.userId || payload.id;

    // Database se direct user fetch karein taake exact full_name aur role mile
    // const [rows]: any = await pool.query('SELECT id, full_name, email, role FROM users WHERE id = ?', [userId]);
    // if (!rows || rows.length === 0) {
    //   return NextResponse.json({ message: 'User not found' }, { status: 404 });
    // }
    // const user = rows[0];

    // Temporary fallback agar database query comment hai:
    const user = {
      id: userId,
      full_name: payload.full_name || payload.name || 'Abdul Hadi',
      email: payload.email || '',
      role: payload.role || 'Manager'
    };

    return NextResponse.json({ 
      user: {
        name: user.full_name,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      } 
    }, { status: 200 });

  } catch (error) {
    console.error("Auth Me Error:", error);
    return NextResponse.json({ message: 'Invalid token' }, { status: 403 });
  }
}