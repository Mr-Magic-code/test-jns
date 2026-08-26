import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { sourceUrl, ...agentFields } = body;

    const formTitle = 'Agent Registration';
    let region = 'General';

    // URL-based Region Detection Logic
    if (sourceUrl) {
      const lowerUrl = sourceUrl.toLowerCase();
      if (lowerUrl.includes('/pakistan')) {
        region = 'Pakistan';
      } else if (
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

    // Saari fields ko JSON mein convert karna
    const formDataJson = JSON.stringify(agentFields);

    // Database mein insert karna (Usi main table mein taake dashboard par show ho)
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

    return NextResponse.json({ message: 'Agent registered successfully!' }, { status: 201 });
  } catch (error) {
    console.error("Agent Registration API Error:", error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}