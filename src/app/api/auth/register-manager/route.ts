import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { fullName, email, password, branchOffice } = body;

    // 1. Check karein ke email pehle se registered toh nahi hai
    const checkQuery = 'SELECT * FROM users WHERE email = ?';
    const [existingUsers]: any = await pool.execute(checkQuery, [email]);

    if (existingUsers.length > 0) {
      return NextResponse.json(
        { message: "Email is already registered. Please use a different email." },
        { status: 400 }
      );
    }

    // 2. Password ko Hash (secure) karein
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 3. Current Date aur Time nikalne ke liye
    const now = new Date();

    // 4. Database mein insert karein (status 'Pending' aur role 'Manager' ke sath)
    // Note: Agar aapke DB table mein column ka naam 'full_name' hai toh yahan 'name' ki jagah 'full_name' likhein
    const insertQuery = `
      INSERT INTO users (full_name, email, password, branch_office, role, status, created_at) 
      VALUES (?, ?, ?, ?, 'Manager', 'Pending', ?)
    `;

    await pool.execute(insertQuery, [
      fullName,
      email,
      hashedPassword,
      branchOffice,
      now
    ]);

    return NextResponse.json(
      { message: "Registration successful! Awaiting Super Admin approval." },
      { status: 201 }
    );

  } catch (error) {
    console.error("Manager Registration Error:", error);
    return NextResponse.json(
      { message: "Internal Server Error" },
      { status: 500 }
    );
  }
}