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
  connectTimeout: 30000, // 30 seconds timeout to prevent Vercel 500 errors
  queueLimit: 0,
  ssl: process.env.DB_HOST && process.env.DB_HOST.includes('aivencloud') ? { rejectUnauthorized: false } : undefined
});

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const region = searchParams.get('region');

    let query = `
      SELECT 
        b.*, 
        c.name AS category_name 
      FROM \`blogs\` b
      LEFT JOIN \`blog_categories\` c ON b.category_id = c.id
      WHERE b.status = 'published'
    `;

    const params: any[] = [];
    if (region && region !== 'all') {
      query += ' AND b.region = ?';
      params.push(region);
    }

    query += ' ORDER BY b.updated_at DESC';

    const [rows]: any = await pool.query(query, params);
    return NextResponse.json({ blogs: rows }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json({ message: error.message || 'Database error' }, { status: 500 });
  }
}