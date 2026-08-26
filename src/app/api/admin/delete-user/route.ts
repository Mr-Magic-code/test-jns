import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = new TextEncoder().encode(process.env.JNS_MASTER_KEY);

export async function DELETE(request: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Token verify karein aur check karein ke user Super-Admin hai ya nahi
    const { payload }: any = await jwtVerify(token, SECRET_KEY);
    if (payload.role !== 'Super-Admin') {
      return NextResponse.json({ message: 'Unauthorized: Only Super Admin can delete users.' }, { status: 403 });
    }

    // URL se user ka ID nikalna
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'User ID is required' }, { status: 400 });
    }

    // Safety check: Super Admin khud ko delete na kar sakay (Optional lekin achi practice hai)
    if (payload.userId.toString() === id.toString()) {
      return NextResponse.json({ message: 'You cannot delete your own Super Admin account!' }, { status: 400 });
    }

    // Database se user ko hamesha ke liye delete kar dein
    await pool.execute("DELETE FROM users WHERE id = ?", [id]);

    return NextResponse.json({ message: 'User deleted successfully from database.' }, { status: 200 });

  } catch (error) {
    console.error("Delete User Error:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}