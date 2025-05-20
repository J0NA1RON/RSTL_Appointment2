import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from "@/lib/api-auth";

// POST /api/appointments/metrology/constraints
export async function POST(request) {
  try {
    const body = await request.json();
    const { constraint_date, daily_liter_capacity } = body;
    if (!constraint_date || !daily_liter_capacity) {
      return NextResponse.json({ success: false, message: 'Date and limit are required.' }, { status: 400 });
    }
    // Check if a constraint already exists for this date
    const existing = await query(
      'SELECT id FROM appointment_constraints WHERE constraint_date = $1',
      [constraint_date]
    );
    let result;
    if (existing.rows.length > 0) {
      // Update
      result = await query(
        'UPDATE appointment_constraints SET daily_liter_capacity = $1, updated_at = NOW() WHERE constraint_date = $2 RETURNING *',
        [daily_liter_capacity, constraint_date]
      );
    } else {
      // Insert
      result = await query(
        'INSERT INTO appointment_constraints (constraint_date, daily_liter_capacity) VALUES ($1, $2) RETURNING *',
        [constraint_date, daily_liter_capacity]
      );
    }
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// GET /api/appointments/metrology/constraints?date=YYYY-MM-DD
export async function GET(request) {
  const { session, error } = await requireAuth(request, "admin");
     if (error) {
       return NextResponse.json({ success: false, message: error }, { status: error === "Unauthorized" ? 401 : 403 });
     }
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  if (!date) {
    return NextResponse.json({ success: false, message: 'Date is required.' }, { status: 400 });
  }
  try {
    const result = await query(
      'SELECT daily_liter_capacity FROM appointment_constraints WHERE constraint_date = $1',
      [date]
    );
    if (result.rows.length > 0) {
      return NextResponse.json({ success: true, data: { daily_liter_capacity: parseFloat(result.rows[0].daily_liter_capacity) } });
    } else {
      return NextResponse.json({ success: true, data: { daily_liter_capacity: 80000 } });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
} 