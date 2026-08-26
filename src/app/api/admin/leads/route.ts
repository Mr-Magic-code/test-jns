import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = new TextEncoder().encode(process.env.JNS_MASTER_KEY);

// Helper function for Auth Verification
async function verifyAuth() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return false;
  try {
    await jwtVerify(token, SECRET_KEY);
    return true;
  } catch {
    return false;
  }
}

// 1. GET: Saari submissions fetch karne ke liye
export async function GET() {
  try {
    if (!(await verifyAuth())) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const [rows]: any = await pool.execute(
      "SELECT id, form_type, region, source_url, form_data, status, created_at FROM form_submissions ORDER BY created_at DESC"
    );

    return NextResponse.json({ submissions: rows }, { status: 200 });
  } catch (error) {
    console.error("Fetch Submissions Error:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// 2. PATCH: Status update karne ke liye (Read, Unread, Trashed / Soft Delete, Recover)
export async function PATCH(request: Request) {
  try {
    if (!(await verifyAuth())) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { id, status } = await request.json();

    if (!id || !status) {
      return NextResponse.json({ message: 'Missing id or status' }, { status: 400 });
    }

    await pool.execute(
      `UPDATE form_submissions SET status = ? WHERE id = ?`,
      [status, id]
    );

    return NextResponse.json({ message: 'Lead status updated successfully' }, { status: 200 });
  } catch (error) {
    console.error("Update Status Error:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

// 3. DELETE: Database se permanently delete karne ke liye
export async function DELETE(request: Request) {
  try {
    if (!(await verifyAuth())) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Missing lead ID' }, { status: 400 });
    }

    await pool.execute(
      `DELETE FROM form_submissions WHERE id = ?`,
      [id]
    );

    return NextResponse.json({ message: 'Lead permanently deleted from database' }, { status: 200 });
  } catch (error) {
    console.error("Permanent Delete Error:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}