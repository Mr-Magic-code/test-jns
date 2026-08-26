import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jnsedu-db',
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 30000, // 30 seconds timeout
  queueLimit: 0,
  ssl: process.env.DB_HOST && process.env.DB_HOST.includes('aivencloud') ? { rejectUnauthorized: false } : undefined
});

export async function GET() {
  try {
    const [rows] = await pool.query('SELECT * FROM events ORDER BY created_at DESC');
    return NextResponse.json({ success: true, events: rows });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { event_name, day_date, event_time, venue, cover_image, target_page, status } = body;

    if (!event_name || !day_date || !target_page) {
      return NextResponse.json({ success: false, message: 'Required fields are missing' }, { status: 400 });
    }

    await pool.query(
      `INSERT INTO events (event_name, day_date, event_time, venue, cover_image, target_page, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [event_name, day_date, event_time, venue, cover_image || null, target_page, status || 'Live']
    );

    return NextResponse.json({ success: true, message: 'Event saved successfully!' }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// ✅ PUT Method for Updating Events (Fixes JSON input error)
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, event_name, day_date, event_time, venue, cover_image, target_page, status } = body;

    if (!id || !event_name || !day_date || !target_page) {
      return NextResponse.json({ success: false, message: 'ID and required fields are missing' }, { status: 400 });
    }

    await pool.query(
      `UPDATE events SET event_name = ?, day_date = ?, event_time = ?, venue = ?, cover_image = ?, target_page = ?, status = ? WHERE id = ?`,
      [event_name, day_date, event_time, venue, cover_image || null, target_page, status || 'Live', id]
    );

    return NextResponse.json({ success: true, message: 'Event updated successfully!' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, message: 'ID required' }, { status: 400 });

    await pool.query('DELETE FROM events WHERE id = ?', [id]);
    return NextResponse.json({ success: true, message: 'Event deleted successfully!' });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}