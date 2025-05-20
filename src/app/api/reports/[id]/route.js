import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from "@/lib/api-auth";

// GET /api/reports/:id - Get a single report
export async function GET(request, { params }) {
  const { session, error } = await requireAuth(request, "admin");
     if (error) {
       return NextResponse.json({ success: false, message: error }, { status: error === "Unauthorized" ? 401 : 403 });
     }
  const { id } = params;
  try {
    const result = await query(
      `SELECT id, test_id, file_url, created_at, updated_at FROM reports WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Report not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PATCH /api/reports/:id - Update a report
export async function PATCH(request, { params }) {
  const { id } = params;
  try {
    const body = await request.json();
    const fields = ['test_id', 'file_url'];
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
      `UPDATE reports SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${values.length} RETURNING id, test_id, file_url, created_at, updated_at`,
      values
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Report not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE /api/reports/:id - Delete a report
export async function DELETE(request, { params }) {
  const { id } = params;
  try {
    const result = await query(
      `DELETE FROM reports WHERE id = $1 RETURNING id`,
      [id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Report not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Report deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
} 