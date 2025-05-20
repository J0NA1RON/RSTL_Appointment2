import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from "@/lib/api-auth";

// GET /api/inquiries - List all inquiries
export async function GET(request) {
  const { session, error } = await requireAuth(request, "admin");
     if (error) {
       return NextResponse.json({ success: false, message: error }, { status: error === "Unauthorized" ? 401 : 403 });
     }
  try {
    const result = await query(`
      SELECT id, customer_id, service_id, message, status, created_at, updated_at
      FROM inquiries
      ORDER BY created_at DESC
    `);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST /api/inquiries - Create a new inquiry
export async function POST(request) {
  try {
    const body = await request.json();
    const { customer_id, service_id, message, status } = body;
    if (!customer_id || !service_id || !message) {
      return NextResponse.json({ success: false, message: 'customer_id, service_id, and message are required' }, { status: 400 });
    }
    const result = await query(
      `INSERT INTO inquiries (customer_id, service_id, message, status)
       VALUES ($1, $2, $3, $4)
       RETURNING id, customer_id, service_id, message, status, created_at, updated_at`,
      [customer_id, service_id, message, status ?? 'pending']
    );
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
} 