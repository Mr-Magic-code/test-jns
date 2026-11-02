import { NextResponse } from 'next/server';
import pool from '@/lib/db'; // Aapka MySQL pool connection

// 1. GET: Fetch all categories
export async function GET() {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM `blog_categories` ORDER BY `name` ASC'
    );
    return NextResponse.json({ categories: rows }, { status: 200 });
  } catch (error: any) {
    console.error('Error fetching categories:', error);
    return NextResponse.json({ message: error.message || 'Database error' }, { status: 500 });
  }
}

// 2. POST: Create a new category
export async function POST(req: Request) {
  try {
    const { name, slug } = await req.json();

    if (!name || !slug) {
      return NextResponse.json({ message: 'Name and slug are required' }, { status: 400 });
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const [result]: any = await pool.query(
      'INSERT INTO `blog_categories` (`name`, `slug`) VALUES (?, ?)',
      [name.trim(), cleanSlug]
    );

    return NextResponse.json({ 
      message: 'Category created successfully', 
      categoryId: result.insertId 
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating category:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ message: 'Category slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ message: error.message || 'Database error' }, { status: 500 });
  }
}

// 3. PATCH: Update category (Name / Slug)
export async function PATCH(req: Request) {
  try {
    const { id, name, slug } = await req.json();

    if (!id || !name || !slug) {
      return NextResponse.json({ message: 'ID, name, and slug are required' }, { status: 400 });
    }

    const cleanSlug = slug.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    await pool.query(
      'UPDATE `blog_categories` SET `name` = ?, `slug` = ? WHERE `id` = ?',
      [name.trim(), cleanSlug, id]
    );

    return NextResponse.json({ message: 'Category updated successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error updating category:', error);
    return NextResponse.json({ message: error.message || 'Database error' }, { status: 500 });
  }
}

// 4. DELETE: Delete category
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ message: 'Category ID is required' }, { status: 400 });
    }

    await pool.query('DELETE FROM `blog_categories` WHERE `id` = ?', [id]);

    return NextResponse.json({ message: 'Category deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting category:', error);
    return NextResponse.json({ message: error.message || 'Database error' }, { status: 500 });
  }
}