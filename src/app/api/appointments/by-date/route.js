import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { format, parseISO } from 'date-fns'; // Import if needed for response formatting
import { requireAuth } from "@/lib/api-auth";

export async function GET(request) {
  const { session, error } = await requireAuth(request, "admin");
     if (error) {
       return NextResponse.json({ success: false, message: error }, { status: error === "Unauthorized" ? 401 : 403 });
     }
  const { searchParams } = new URL(request.url);
  const appointmentDate = searchParams.get('date'); // Expecting YYYY-MM-DD format
  const serviceCategory = searchParams.get('service'); // Expecting category name like 'chemistry'

  if (!appointmentDate || !serviceCategory) {
    return NextResponse.json(
      { success: false, message: 'Missing required date or service query parameters' },
      { status: 400 }
    );
  }

  try {
    // 1. Get the service ID for the category
    const serviceResult = await query(
      `SELECT id FROM services WHERE category ILIKE $1 LIMIT 1`, 
      [serviceCategory]
    );

    if (serviceResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: `Service category '${serviceCategory}' not found` }, 
        { status: 404 }
      );
    }
    const serviceId = serviceResult.rows[0].id;

    // 2. Fetch appointments for the specific date and service
    // Adjust JOINs and SELECT fields based on what frontend needs for the selected day display
    // Example for Chemistry:
    let detailsJoin = '';
    let detailFields = 'ad.sample_description as analysis_requested'; // Default or fallback

    if (serviceCategory.toLowerCase() === 'chemistry') {
      detailsJoin = 'LEFT JOIN chemistry_details cd ON ad.id = cd.appointment_detail_id';
      detailFields = `cd.analysis_requested, (SELECT STRING_AGG(s.name, ', ') FROM appointment_detail_services ads JOIN services s ON ads.service_id = s.id WHERE ads.appointment_detail_id = ad.id) as services`;
    } else if (serviceCategory.toLowerCase() === 'metrology') {
      detailsJoin = 'LEFT JOIN metrology_details md ON ad.id = md.appointment_detail_id';
      detailFields = 'md.number_of_liters, md.type_of_test';
    }
    // Add else if blocks for other services (metrology, microbiology, etc.)
    // if they need different detail fields fetched.

    const appointmentsResult = await query(`
      SELECT 
        a.id,
        a.appointment_date,
        a.appointment_time, 
        a.status,
        c.name as customer_name,
        ${detailFields} 
        -- Add other necessary fields like customer_email, etc. if needed
      FROM appointments a
      JOIN customers c ON a.customer_id = c.id
      JOIN appointment_details ad ON a.id = ad.appointment_id
      ${detailsJoin} 
      WHERE 
        a.service_id = $1 AND
        a.appointment_date::date = $2
      ORDER BY a.appointment_time ASC
    `, [serviceId, appointmentDate]);

    // Optional: Format data if needed before sending, though frontend might handle it
    const formattedData = appointmentsResult.rows.map(apt => ({
      ...apt,
      // Example formatting (can be done on frontend too):
      // date: apt.appointment_date ? format(new Date(apt.appointment_date), 'MMM d, yyyy') : 'N/A',
      // time: apt.appointment_time ? format(parseISO(`1970-01-01T${apt.appointment_time}`), 'p') : 'N/A',
    }));

    return NextResponse.json({
      success: true,
      data: formattedData // Send back the fetched appointments
    });

  } catch (error) {
    console.error('Error fetching appointments by date:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
} 