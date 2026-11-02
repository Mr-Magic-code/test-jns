import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import { cookies } from 'next/headers';

const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'jnsedu-db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Helper to recursively scan file system directories
function scanDirectory(dir: string, region: 'general' | 'middleeast' | 'pakistan', currentPath: string = ''): any[] {
  let results: any[] = [];
  if (!fs.existsSync(dir)) return results;

  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      if (file === 'api' || file.startsWith('_')) return;
      const nextPath = currentPath ? `${currentPath}/${file}` : file;
      results = results.concat(scanDirectory(filePath, region, nextPath));
    } else if (file === 'page.tsx') {
      const slug = currentPath;
      if (slug) {
        results.push({
          slug,
          region,
          title: slug.split('/').pop()?.replace(/-/g, ' ').replace(/^./, (str) => str.toUpperCase()) || 'Untitled Page',
          author_name: 'System Auto-Sync'
        });
      }
    }
  });

  return results;
}

// 1. GET: Scan File System & Match with DB Records (With Super-Admin role security check for 'flash-admin')
export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const userRole = cookieStore.get('user_role')?.value || cookieStore.get('role')?.value || '';

    const appDir = path.join(process.cwd(), 'src', 'app');
    const generalRouteGroupDir = path.join(appDir, '(general)');
    const rootGeneralDir = appDir;
    const meDir = path.join(appDir, 'middleeast');
    const pakDir = path.join(appDir, 'pakistan');

    const generalPages = scanDirectory(generalRouteGroupDir, 'general');
    
    const rootFiles = fs.readdirSync(rootGeneralDir);
    let rootPages: any[] = [];
    rootFiles.forEach((file) => {
      const p = path.join(rootGeneralDir, file);
      if (fs.statSync(p).isDirectory() && !['api', 'middleeast', 'pakistan', '(general)'].includes(file) && !file.startsWith('_')) {
        rootPages = rootPages.concat(scanDirectory(p, 'general', file));
      }
    });

    const mePages = scanDirectory(meDir, 'middleeast');
    const pakPages = scanDirectory(pakDir, 'pakistan');

    const scannedPages = [...generalPages, ...rootPages, ...mePages, ...pakPages];

    let dbRows: any[] = [];
    try {
      // 🛑 Sirf Super-Admin ke liye 'flash-admin' allow hoga, baaki roles ke liye exclude kar diya jayega
      if (userRole === 'Super-Admin') {
        const [rows]: [any[], any] = await pool.query('SELECT slug, region, title, author_name, status, created_at FROM pages');
        dbRows = rows;
      } else {
        const [rows]: [any[], any] = await pool.query('SELECT slug, region, title, author_name, status, created_at FROM pages WHERE slug != ?', ['flash-admin']);
        dbRows = rows;
      }
    } catch (dbErr) {
      console.error('Database query error:', dbErr);
    }
    
    const processedPages = scannedPages
      .filter(p => {
        if (userRole !== 'Super-Admin' && p.slug === 'flash-admin') return false;
        return true;
      })
      .map((p, index) => {
        const found = dbRows.find(row => row.slug === p.slug && row.region === p.region);
        return {
          id: found?.id || (index + 1000),
          title: found?.title || p.title,
          slug: p.slug,
          region: p.region,
          author_name: found?.author_name || p.author_name,
          status: found?.status || 'published',
          is_saved: !!found,
          created_at: found?.created_at || new Date().toISOString()
        };
      });

    dbRows.forEach((dbRow) => {
      if (userRole !== 'Super-Admin' && dbRow.slug === 'flash-admin') return;
      const exists = processedPages.some(p => p.slug === dbRow.slug && p.region === dbRow.region);
      if (!exists) {
        processedPages.push({
          id: dbRow.id,
          title: dbRow.title,
          slug: dbRow.slug,
          region: dbRow.region,
          author_name: dbRow.author_name || 'Admin',
          status: dbRow.status || 'published',
          is_saved: true,
          created_at: dbRow.created_at
        });
      }
    });

    return NextResponse.json({ success: true, pages: processedPages });
  } catch (error: any) {
    console.error('Error fetching pages:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// 2. POST: Handle Saving with proper slug path preservation
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, slug, region, parentSlug, author_name, isExistingLink } = body;

    if (!title || !slug || !region) {
      return NextResponse.json({ success: false, message: 'Title, slug, and region are required' }, { status: 400 });
    }

    // Slashes (/) ko protect karte huay slug clean karein
    const cleanSlug = slug.split('/').map((part: string) => 
      part.toLowerCase().trim().replace(/[^a-z0-9-]+/g, '-').replace(/(^-|-$)+/g, '')
    ).join('/');

    const finalSlugPath = parentSlug ? `${parentSlug}/${cleanSlug}` : cleanSlug;

    // CASE A: AGAR "SAVE TO DB" ICON SE CLICK HUA HAI (isExistingLink = true)
    if (isExistingLink) {
      const [existing]: [any[], any] = await pool.query(
        'SELECT id FROM pages WHERE slug = ? AND region = ?',
        [finalSlugPath, region]
      );

      if (existing.length === 0) {
        const finalAuthor = author_name || 'Super Admin';
        await pool.query(
          'INSERT INTO pages (title, slug, region, author_name, status) VALUES (?, ?, ?, ?, ?)',
          [title, finalSlugPath, region, finalAuthor, 'published']
        );
      }

      return NextResponse.json({ 
        success: true, 
        message: 'Page saved to database successfully with correct URL path!' 
      }, { status: 201 });
    }

    // CASE B: AGAR "CREATE NEW PAGE" PANE SE AAYA HAI
    const appDir = path.join(process.cwd(), 'src', 'app');
    let targetDir = appDir;

    if (region === 'pakistan') {
      targetDir = parentSlug ? path.join(appDir, 'pakistan', parentSlug, cleanSlug) : path.join(appDir, 'pakistan', cleanSlug);
    } else if (region === 'middleeast') {
      targetDir = parentSlug ? path.join(appDir, 'middleeast', parentSlug, cleanSlug) : path.join(appDir, 'middleeast', cleanSlug);
    } else {
      targetDir = parentSlug ? path.join(appDir, '(general)', parentSlug, cleanSlug) : path.join(appDir, '(general)', cleanSlug);
    }

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    const filePath = path.join(targetDir, 'page.tsx');
    if (!fs.existsSync(filePath)) {
      const pageContent = `import React from 'react';

export default function Page() {
  return (
    <main className="min-h-screen p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4">${title}</h1>
      <p className="text-gray-600">This page was auto-generated by the admin dashboard system.</p>
    </main>
  );
}
`;
      fs.writeFileSync(filePath, pageContent, 'utf8');
    }

    const [existing]: [any[], any] = await pool.query(
      'SELECT id FROM pages WHERE slug = ? AND region = ?',
      [finalSlugPath, region]
    );

    if (existing.length === 0) {
      const finalAuthor = author_name || 'Super Admin';
      await pool.query(
        'INSERT INTO pages (title, slug, region, author_name, status) VALUES (?, ?, ?, ?, ?)',
        [title, finalSlugPath, region, finalAuthor, 'published']
      );
    }

    return NextResponse.json({ 
      success: true, 
      message: 'New page created, file generated, and saved to database successfully!' 
    }, { status: 201 });

  } catch (error: any) {
    console.error('Error in pages API:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}