import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';
import { SignJWT } from 'jose';

const SECRET_KEY = new TextEncoder().encode(process.env.JNS_MASTER_KEY);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // 1. Database mein email check karein
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows]: any = await pool.execute(query, [email]);

    if (rows.length === 0) {
      return NextResponse.json({ message: "Invalid email or password!" }, { status: 401 });
    }

    const user = rows[0];

    // 2. Password Match Karein
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return NextResponse.json({ message: "Invalid email or password!" }, { status: 401 });
    }

    if (user.status !== 'Approved') {
      return NextResponse.json({ message: "Your account is not approved yet!" }, { status: 403 });
    }

    // 3. JWT TOKEN (Secure Ticket) Banayein - ✅ full_name yahan add kar diya hai
    const token = await new SignJWT({ 
        userId: user.id, 
        full_name: user.full_name, // 👈 Yeh line missing thi!
        role: user.role, 
        email: user.email 
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('8h')
      .sign(SECRET_KEY);

    // 4. Response tayyar karein aur Cookie mein token set karein
    const response = NextResponse.json(
      { message: "Login successful!" },
      { status: 200 }
    );

    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });

    return response;

  } catch (error) {
    console.error("Login API Error:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}