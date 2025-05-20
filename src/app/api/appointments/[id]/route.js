import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from "@/lib/api-auth";

// GET /api/appointments/:id - Get a single appointment (with customer and service info)
export async function GET(request, { params }) {
  const { session, error } = await requireAuth(request, "admin");
     if (error) {
       return NextResponse.json({ success: false, message: error }, { status: error === "Unauthorized" ? 401 : 403 });
     }
  const { id } = params;
  try {
    const result = await query(
      `SELECT a.*, s.name as service_name, s.category, c.name as customer_name, c.email as customer_email, c.company_name
       FROM appointments a
       JOIN services s ON a.service_id = s.id
       JOIN customers c ON a.customer_id = c.id
       WHERE a.id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Appointment not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PATCH /api/appointments/:id - Update an appointment
export async function PATCH(request, { params }) {
  const { id } = params;
  try {
    const body = await request.json();
    const fields = ['appointment_date', 'appointment_time', 'status', 'service_id', 'customer_id'];
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
      `UPDATE appointments SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${values.length} RETURNING *`,
      values
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Appointment not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE /api/appointments/:id - Delete an appointment
export async function DELETE(request, { params }) {
  const { id } = params;
  try {
    const result = await query(
      `DELETE FROM appointments WHERE id = $1 RETURNING id`,
      [id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Appointment not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Appointment deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
} 