import { NextResponse } from 'next/server';
import pool from '@/lib/db';

// 1. GET: Fetch all blogs (Include last_edited_by)
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
    `;

    const params: any[] = [];
    if (region && region !== 'all') {
      query += ' WHERE b.region = ?';
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

// 2. POST: Create Blog
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, slug, cover_image, region, status = 'published', category_id, content, author_name, author_email } = body;

    if (!title || !slug || !content || !region) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const [result]: any = await pool.query(
      `INSERT INTO \`blogs\` (\`title\`, \`slug\`, \`cover_image\`, \`region\`, \`status\`, \`category_id\`, \`content\`, \`author_name\`, \`author_email\`, \`last_edited_by\`) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title.trim(), cleanSlug, cover_image || null, region, status, category_id ? parseInt(category_id) : null, content, author_name || 'Admin', author_email || '', author_name || 'Admin']
    );

    return NextResponse.json({ message: 'Blog published successfully', blogId: result.insertId }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// 3. PUT: Update Blog (Protects original author, updates last_edited_by)
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, title, slug, cover_image, region, status, category_id, content, last_edited_by } = body;

    if (!id || !title || !slug || !content || !region) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    // NOTE: author_name aur author_email ko yahan query mein chherna nahi hai
    await pool.query(
      `UPDATE \`blogs\` SET 
        \`title\` = ?, \`slug\` = ?, \`cover_image\` = ?, \`region\` = ?, 
        \`status\` = ?, \`category_id\` = ?, \`content\` = ?, 
        \`last_edited_by\` = ?, \`updated_at\` = NOW()
       WHERE \`id\` = ?`,
      [title.trim(), cleanSlug, cover_image || null, region, status, category_id ? parseInt(category_id) : null, content, last_edited_by || 'Admin', id]
    );

    return NextResponse.json({ message: 'Blog updated successfully' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// 4. PATCH: Status change
export async function PATCH(req: Request) {
  try {
    const { id, status, last_edited_by } = await req.json();
    await pool.query('UPDATE `blogs` SET `status` = ?, `last_edited_by` = ?, `updated_at` = NOW() WHERE `id` = ?', [status, last_edited_by, id]);
    return NextResponse.json({ message: 'Status updated' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}

// 5. DELETE: Permanently Delete
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    await pool.query('DELETE FROM `blogs` WHERE `id` = ?', [id]);
    return NextResponse.json({ message: 'Deleted' }, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}