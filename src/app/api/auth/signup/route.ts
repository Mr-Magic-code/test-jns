import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, password, secretKey } = body;

    // 1. Secret Key Check Karein
    const envSecret = process.env.JNS_MASTER_KEY; 
    
    if (secretKey !== envSecret) {
      return NextResponse.json(
        { message: "Invalid Master Secret Key! Access Denied." }, 
        { status: 403 }
      );
    }

    // 2. Password ko secure (hash) karein
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Database mein Super Admin save karein
    const query = `
      INSERT INTO users (full_name, email, password, role, status) 
      VALUES (?, ?, ?, 'Super-Admin', 'Approved')
    `;
    const values = [fullName, email, hashedPassword];

    await pool.execute(query, values);

    return NextResponse.json(
      { message: "Super Admin account created successfully!" }, 
      { status: 201 }
    );

  } catch (error: any) {
    // Agar email pehle se mojud ho
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json(
        { message: "This email is already registered!" }, 
        { status: 400 }
      );
    }
    console.error("Signup API Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" }, 
      { status: 500 }
    );
  }
}