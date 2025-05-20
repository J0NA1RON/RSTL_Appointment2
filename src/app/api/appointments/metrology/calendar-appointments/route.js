import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from "@/lib/api-auth";

export async function GET(request) {
  const { session, error } = await requireAuth(request, "admin");
     if (error) {
       return NextResponse.json({ success: false, message: error }, { status: error === "Unauthorized" ? 401 : 403 });
     }
  try {
    // Get all service IDs for metrology
    const serviceResults = await query(
      `SELECT id FROM services WHERE category = 'metrology'`
    );
    if (serviceResults.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Metrology service not found' }, { status: 404 });
    }
    const serviceIds = serviceResults.rows.map(row => row.id);

    // Fetch all metrology appointments for all metrology services
    const appointmentsResult = await query(`
      SELECT 
        a.id,
        a.appointment_date,
        a.appointment_time,
        a.status,
        c.name as customer_name,
        c.email as customer_email,
        c.contact_number as customer_contact,
        ad.sample_description,
        md.type_of_test,
        md.number_of_liters,
        md.truck_plate_number,
        md.manager_name
      FROM appointments a
      JOIN customers c ON a.customer_id = c.id
      JOIN appointment_details ad ON a.id = ad.appointment_id
      JOIN metrology_details md ON ad.id = md.appointment_detail_id
      WHERE a.service_id = ANY($1)
      ORDER BY a.appointment_date DESC, a.appointment_time DESC
    `, [serviceIds]);

    // Normalize appointment_date for all rows
    const normalizedRows = appointmentsResult.rows.map(row => {
      let normalizedDate;
      if (row.appointment_date instanceof Date) {
        const year = row.appointment_date.getFullYear();
        const month = (row.appointment_date.getMonth() + 1).toString().padStart(2, '0');
        const day = row.appointment_date.getDate().toString().padStart(2, '0');
        normalizedDate = `${year}-${month}-${day}`;
      } else if (typeof row.appointment_date === 'string') {
        normalizedDate = row.appointment_date.slice(0, 10);
      } else {
        normalizedDate = row.appointment_date;
      }
      return {
        ...row,
        appointment_date: normalizedDate,
      };
    });
    return NextResponse.json({
      success: true,
      data: normalizedRows
    });

  } catch (error) {
    console.error('Error fetching metrology appointments for table:', error);
    return NextResponse.json(
      { success: false, message: error.message }, 
      { status: 500 }
    );
  }
}
