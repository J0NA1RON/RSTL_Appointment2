import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

// GET /api/users - List all users (excluding password)
export async function GET(request) {
  try {
    const result = await query(`
      SELECT id, name, email, lab_access, role, created_at, updated_at
      FROM users
      ORDER BY created_at DESC
    `);
    return NextResponse.json({ success: true, data: result.rows });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST /api/users - Create a new user (password must be hashed before insert)
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, lab_access, role } = body;
    if (!name || !email || !password) {
      return NextResponse.json({ success: false, message: 'Name, email, and password are required' }, { status: 400 });
    }
    // NOTE: Password should be hashed before insert in production
    const result = await query(
      `INSERT INTO users (name, email, password, lab_access, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, email, lab_access, role, created_at, updated_at`,
      [name, email, password, lab_access, role || 'staff']
    );
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
} 