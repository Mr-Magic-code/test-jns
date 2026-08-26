import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { formName, sourceUrl, ...otherFields } = body;

    const formTitle = formName || 'Form Submission';
    
    // Region default 'General' set hai
    let region = 'General';

    // URL-based Region Detection Logic
    if (sourceUrl) {
      const lowerUrl = sourceUrl.toLowerCase();
      
      if (lowerUrl.includes('/pakistan')) {
        region = 'Pakistan';
      } 
      else if (
        lowerUrl.includes('/middleeast') || 
        lowerUrl.includes('/qatar') || 
        lowerUrl.includes('/bahrain') || 
        lowerUrl.includes('/saudi') || 
        lowerUrl.includes('/uae') || 
        lowerUrl.includes('/dubai')
      ) {
        region = 'MiddleEast';
      }
    }

    // Baqi saari fields JSON mein pack karna
    const formDataJson = JSON.stringify(otherFields);

    // Database mein insert karna
    await pool.execute(
      `INSERT INTO form_submissions (form_type, region, source_url, form_data, status, created_at) 
       VALUES (?, ?, ?, ?, 'unread', NOW())`,
      [
        formTitle,
        region,
        sourceUrl || '',
        formDataJson
      ]
    );

    return NextResponse.json({ message: 'Lead submitted and saved successfully!' }, { status: 201 });
  } catch (error) {
    console.error("Form Submission API Error:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}