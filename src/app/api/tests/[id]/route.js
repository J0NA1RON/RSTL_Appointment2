import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from "@/lib/api-auth";

// GET /api/tests/:id - Get a single test
export async function GET(request, { params }) {
  const { session, error } = await requireAuth(request, "admin");
     if (error) {
       return NextResponse.json({ success: false, message: error }, { status: error === "Unauthorized" ? 401 : 403 });
     }
  const { id } = params;
  try {
    const result = await query(
      `SELECT id, appointment_id, service_id, result, status, created_at, updated_at FROM tests WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Test not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PATCH /api/tests/:id - Update a test
export async function PATCH(request, { params }) {
  const { id } = params;
  try {
    const body = await request.json();
    const fields = ['appointment_id', 'service_id', 'result', 'status'];
    const updates = [];
    const values = [];
    fields.forEach((field) => {
      if (body[field] !== undefined) {
        updates.push(`${field} = $${updates.length + 1}`);
        values.push(body[field]);
      }
    });
    if (updates.length === 0) {
      return NextResponse.json({ success: false, message: 'No fields to update' }, { status: 400 });
    }
    values.push(id);
    const result = await query(
      `UPDATE tests SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${values.length} RETURNING id, appointment_id, service_id, result, status, created_at, updated_at`,
      values
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Test not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE /api/tests/:id - Delete a test
export async function DELETE(request, { params }) {
  const { id } = params;
  try {
    const result = await query(
      `DELETE FROM tests WHERE id = $1 RETURNING id`,
      [id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Test not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Test deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
} 