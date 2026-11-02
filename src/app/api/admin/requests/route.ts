import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const SECRET_KEY = new TextEncoder().encode(process.env.JNS_MASTER_KEY);

async function verifySuperAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token')?.value;
  if (!token) return false;

  try {
    const { payload }: any = await jwtVerify(token, SECRET_KEY);
    return payload.role === 'Super-Admin';
  } catch {
    return false;
  }
}

export async function GET() {
  if (!(await verifySuperAdmin())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Database se full_name ya name ko fetch karna (COALESCE dono handle kar lega)
    const [rows]: any = await pool.execute(
      "SELECT id, full_name, email, branch_office, role, created_at FROM users WHERE status = 'Pending' ORDER BY created_at DESC"
    );
    return NextResponse.json({ requests: rows }, { status: 200 });
  } catch (error) {
    console.error("Fetch Requests Error:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!(await verifySuperAdmin())) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, action } = body;

    if (!id || !action) {
      return NextResponse.json({ message: 'Invalid data' }, { status: 400 });
    }

    if (action === 'approve') {
      await pool.execute("UPDATE users SET status = 'Approved' WHERE id = ?", [id]);
      return NextResponse.json({ message: 'Manager approved successfully!' }, { status: 200 });
    } else if (action === 'reject') {
      await pool.execute("DELETE FROM users WHERE id = ?", [id]);
      return NextResponse.json({ message: 'Manager request rejected and deleted.' }, { status: 200 });
    }

    return NextResponse.json({ message: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error("Action Error:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}