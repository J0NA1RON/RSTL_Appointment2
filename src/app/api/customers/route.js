import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from "@/lib/api-auth";

// GET /api/customers - List all customers
export async function GET(request) {
  const { session, error } = await requireAuth(request, "admin");
     if (error) {
       return NextResponse.json({ success: false, message: error }, { status: error === "Unauthorized" ? 401 : 403 });
     }
  try {
    const result = await query(`
      SELECT id, name, email, contact_number, sex, company_name, created_at, updated_at
      FROM customers
      ORDER BY created_at DESC
    `);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST /api/customers - Create a new customer
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, contact_number, sex, company_name } = body;
    if (!name) {
      return NextResponse.json({ success: false, message: 'Name is required' }, { status: 400 });
    }
    const result = await query(
      `INSERT INTO customers (name, email, contact_number, sex, company_name)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, contact_number, sex, company_name, created_at, updated_at`,
      [name, email, contact_number, sex, company_name]
    );
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
} 