import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from "@/lib/api-auth";

export async function GET(request) {
  const { session, error } = await requireAuth(request, "admin");
     if (error) {
       return NextResponse.json({ success: false, message: error }, { status: error === "Unauthorized" ? 401 : 403 });
     }
  try {
    // Query to fetch all inquiries with all related data (based on appointment_report_view)
    const result = await query(`
      SELECT 
        a.id AS inquiry_id,
        a.created_at AS date_of_inquiry,
        i.mode_of_inquiry,
        u_personnel.name AS rstl_personnel,
        s.name AS type_of_inquiry,
        c.name AS customer_name,
        c.company_name,
        c.email,
        c.contact_number,
        a.appointment_date,
        ad.sample_description,
        ad.name_of_samples,
        ad.sample_quantity,
        ad.number_of_replicates,
        s.category AS laboratory,
        (SELECT action_desc FROM action_logs WHERE appointment_id = a.id AND action_type = 'lab' ORDER BY created_at DESC LIMIT 1) AS action_from_lab,
        a.appointment_date AS schedule,
        (SELECT remark_text FROM remarks WHERE appointment_id = a.id ORDER BY created_at DESC LIMIT 1) AS remarks,
        (SELECT action_desc FROM action_logs WHERE appointment_id = a.id AND action_type = 'cro' ORDER BY created_at DESC LIMIT 1) AS action_from_cro,
        i.response_deadline AS wait_response_until,
        a.status,
        (SELECT string_agg(action_desc, ', ' ORDER BY created_at DESC) FROM action_logs WHERE appointment_id = a.id) AS action_logs
      FROM 
        appointments a
      JOIN 
        customers c ON a.customer_id = c.id
      JOIN 
        services s ON a.service_id = s.id
      JOIN 
        appointment_details ad ON a.id = ad.appointment_id
      LEFT JOIN 
        inquiry_information i ON a.id = i.appointment_id
      LEFT JOIN 
        users u_personnel ON i.rstl_personnel_id = u_personnel.id
      LEFT JOIN 
        lab_assignments la ON a.id = la.appointment_id
      ORDER BY a.created_at DESC
    `);

    return NextResponse.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error fetching inquiries:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch inquiries' },
      { status: 500 }
    );
  }
} 