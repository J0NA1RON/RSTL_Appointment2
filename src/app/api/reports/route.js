import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from "@/lib/api-auth";

// GET /api/reports - List all reports
export async function GET(request) {
  const { session, error } = await requireAuth(request, "admin");
     if (error) {
       return NextResponse.json({ success: false, message: error }, { status: error === "Unauthorized" ? 401 : 403 });
     }
  try {
    const result = await query(`
      SELECT id, test_id, file_url, created_at, updated_at
      FROM reports
      ORDER BY created_at DESC
    `);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST /api/reports - Create a new report
export async function POST(request) {
  try {
    const body = await request.json();
    const { test_id, file_url } = body;
    if (!test_id || !file_url) {
      return NextResponse.json({ success: false, message: 'test_id and file_url are required' }, { status: 400 });
    }
    const resultInsert = await query(
      `INSERT INTO reports (test_id, file_url)
       VALUES ($1, $2)
       RETURNING id, test_id, file_url, created_at, updated_at`,
      [test_id, file_url]
    );
    return NextResponse.json({ success: true, data: resultInsert.rows[0] });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
} 