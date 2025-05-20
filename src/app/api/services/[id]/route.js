import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from "@/lib/api-auth";

// GET /api/services/:id - Get a single service
export async function GET(request, { params }) {
  const { session, error } = await requireAuth(request, "admin");
     if (error) {
       return NextResponse.json({ success: false, message: error }, { status: error === "Unauthorized" ? 401 : 403 });
     }
  const { id } = params;
  try {
    const result = await query(
      `SELECT id, name, description, price, category, active, created_at, updated_at FROM services WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Service not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PATCH /api/services/:id - Update a service
export async function PATCH(request, { params }) {
  const { id } = params;
  try {
    const body = await request.json();
    const fields = ['name', 'description', 'price', 'category', 'active'];
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
      `UPDATE services SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${values.length} RETURNING id, name, description, price, category, active, created_at, updated_at`,
      values
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Service not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE /api/services/:id - Delete a service
export async function DELETE(request, { params }) {
  const { id } = params;
  try {
    // Check for referencing appointments
    const appointmentCheck = await query(
      `SELECT 1 FROM appointments WHERE service_id = $1 LIMIT 1`,
      [id]
    );
    if (appointmentCheck.rows.length > 0) {
      return NextResponse.json({ success: false, message: 'Cannot delete service: there are existing appointments referencing this service.' }, { status: 400 });
    }
    const result = await query(
      `DELETE FROM services WHERE id = $1 RETURNING id`,
      [id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Service not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Service deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
} 