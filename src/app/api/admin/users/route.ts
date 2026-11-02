import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = new TextEncoder().encode(process.env.JNS_MASTER_KEY);

export async function GET() {
  try {
    const cookieStore = await cookies();
    // Yahan 'token' ki jagah 'auth_token' kiya gaya hai jo login API mein set hota hai
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Jose library ke zariye token verify karein
    const { payload }: any = await jwtVerify(token, SECRET_KEY);
    
    if (payload.role !== 'Super-Admin') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Sirf approved users fetch karein (COALESCE se full_name ya name dono handle ho jayenge)
    const [rows]: any = await pool.execute(
      "SELECT id, full_name, email, branch_office, role, status FROM users WHERE status = 'Approved' ORDER BY id DESC"
    );

    return NextResponse.json({ users: rows }, { status: 200 });
  } catch (error) {
    console.error("Fetch Users Error:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}