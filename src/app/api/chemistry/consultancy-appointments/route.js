import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from "@/lib/api-auth";

export async function GET(request) {
  const { session, error } = await requireAuth(request, "admin");
     if (error) {
       return NextResponse.json({ success: false, message: error }, { status: error === "Unauthorized" ? 401 : 403 });
     }
  try {
    // Get all chemistry research consultancy appointments only
    const sql = `
      SELECT a.id AS appointment_id, a.appointment_date, a.status, c.name AS customer_name, c.company_name,
             c.contact_number AS contactNumber, c.email AS emailAddress,
             ad.name_of_samples, ad.sample_description,
             rcd.research_topic, rcd.consultation_type, rcd.research_stage, rcd.additional_requirements, rcd.uploaded_research_paper, rcd.consultation_details
      FROM appointments a
      JOIN customers c ON a.customer_id = c.id
      JOIN services s ON a.service_id = s.id
      LEFT JOIN appointment_details ad ON a.id = ad.appointment_id
      LEFT JOIN research_consultation_details rcd ON ad.id = rcd.appointment_detail_id
      WHERE s.category = 'research' AND rcd.consultation_type = 'Chemical'
      ORDER BY a.appointment_date DESC
    `;
    const result = await query(sql);
    const data = result.rows.map(row => ({
      id: row.appointment_id,
      date: row.appointment_date,
      customer: row.customer_name,
      organization: row.company_name,
      contactNumber: row.contactnumber,
      emailAddress: row.emailaddress,
      status: row.status,
      sampleName: row.name_of_samples,
      sampleDescription: row.sample_description,
      researchTopic: row.research_topic,
      consultationType: row.consultation_type,
      researchStage: row.research_stage,
      additionalRequirements: row.additional_requirements,
      uploadedResearchPaper: row.uploaded_research_paper,
      consultationDetails: row.consultation_details
    }));
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
} 