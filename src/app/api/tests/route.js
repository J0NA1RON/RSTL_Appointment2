import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from "@/lib/api-auth";

// GET /api/tests - List all tests
export async function GET(request) {
  const { session, error } = await requireAuth(request, "admin");
     if (error) {
       return NextResponse.json({ success: false, message: error }, { status: error === "Unauthorized" ? 401 : 403 });
     }
  try {
    const result = await query(`
      SELECT id, appointment_id, service_id, result, status, created_at, updated_at
      FROM tests
      ORDER BY created_at DESC
    `);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST /api/tests - Create a new test
export async function POST(request) {
  try {
    const body = await request.json();
    const { appointment_id, service_id, result, status } = body;
    if (!appointment_id || !service_id) {
      return NextResponse.json({ success: false, message: 'appointment_id and service_id are required' }, { status: 400 });
    }
    const resultInsert = await query(
      `INSERT INTO tests (appointment_id, service_id, result, status)
       VALUES ($1, $2, $3, $4)
       RETURNING id, appointment_id, service_id, result, status, created_at, updated_at`,
      [appointment_id, service_id, result, status ?? 'pending']
    );
    return NextResponse.json({ success: true, data: resultInsert.rows[0] });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
} 