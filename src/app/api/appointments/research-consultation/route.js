import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { v4 as uuidv4 } from 'uuid';
import { sendMail } from '../../../../lib/mail';
import { requireAuth } from "@/lib/api-auth";

export async function POST(request) {
  try {
    const formData = await request.json();
    
    // Validate required fields
    const requiredFields = ['fullName', 'sex', 'emailAddress', 'contactNumber', 'institution', 'typeOfResearch', 'yearLevel', 'researchTitle', 'consultationDetails', 'selectedDate'];
    
    for (const field of requiredFields) {
      if (!formData[field]) {
        return NextResponse.json(
          { success: false, message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Generate a unique appointment reference number
    const appointmentRef = `RC-${uuidv4().substring(0, 8).toUpperCase()}`;
    
    // 1. Insert customer data and get customer_id
    const customerResult = await query(
      `INSERT INTO customers (name, email, contact_number, company_name, sex)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [formData.fullName, formData.emailAddress, formData.contactNumber, formData.institution || null, formData.sex]
    );
    const customerId = customerResult.rows[0].id;
    
    // 2. Get service ID for research consultation service
    const serviceResult = await query(
      `SELECT id FROM services WHERE category = 'research' LIMIT 1`
    );
    const serviceId = serviceResult.rows[0].id;
    
    // 3. Insert appointment and get appointment_id
    const appointmentDate = formData.appointmentDate || new Date(formData.selectedDate);
    const appointmentResult = await query(
      `INSERT INTO appointments (customer_id, service_id, appointment_date, status)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [customerId, serviceId, appointmentDate, 'pending']
    );
    const appointmentId = appointmentResult.rows[0].id;
    
    // 4. Insert appointment details and get appointment_detail_id
    const appointmentDetailsResult = await query(
      `INSERT INTO appointment_details (
         appointment_id, sample_description, name_of_samples, terms_accepted
       )
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [
        appointmentId, 
        formData.consultationDetails,
        formData.researchTitle,
        formData.terms
      ]
    );
    const appointmentDetailId = appointmentDetailsResult.rows[0].id;
    
    // 5. Insert research-consultation-specific details
    await query(
      `INSERT INTO research_consultation_details (
         appointment_detail_id, research_topic, consultation_type,
         research_stage, additional_requirements, uploaded_research_paper, consultation_details
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        appointmentDetailId,
        formData.researchTitle,
        formData.typeOfResearch,
        formData.yearLevel,
        null, // additional_requirements (not present in form)
        (formData.uploadedFiles && formData.uploadedFiles.length > 0) ? formData.uploadedFiles[0] : null,
        formData.consultationDetails
      ]
    );
    
    // Send confirmation email
    if (formData.emailAddress) {
      try {
        await sendMail({
          to: formData.emailAddress,
          subject: 'Research Consultation Request Received',
          text: 'Thank you for your submission. We have received your research consultation request and will contact you soon.',
          html: '<p>Thank you for your submission. We have received your research consultation request and will contact you soon.</p>'
        });
      } catch (mailErr) {
        // Log but do not fail the request
        console.error('Error sending confirmation email:', mailErr);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Research consultation appointment created successfully',
      appointmentId
    });
  } catch (error) {
    console.error('Error creating research consultation appointment:', error);
    return NextResponse.json(
      { success: false, message: error.message }, 
      { status: 500 }
    );
  }
}

export async function GET(request) {
  const { session, error } = await requireAuth(request, "admin");
     if (error) {
       return NextResponse.json({ success: false, message: error }, { status: error === "Unauthorized" ? 401 : 403 });
     }
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  try {
    let sql;
    if (type === 'consultancy') {
      // Microbiology consultancy appointments (accept both 'Microbiological' and 'Biological')
      sql = `
        SELECT a.id AS appointment_id, a.appointment_date, a.status, c.name AS customer_name, c.company_name,
               c.contact_number AS contactNumber, c.email AS emailAddress,
               ad.name_of_samples, ad.sample_description,
               rcd.research_topic, rcd.consultation_type, rcd.research_stage, rcd.additional_requirements, rcd.uploaded_research_paper, rcd.consultation_details
        FROM appointments a
        JOIN customers c ON a.customer_id = c.id
        JOIN services s ON a.service_id = s.id
        LEFT JOIN appointment_details ad ON a.id = ad.appointment_id
        LEFT JOIN research_consultation_details rcd ON ad.id = rcd.appointment_detail_id
        WHERE s.category = 'research' AND rcd.consultation_type IN ('Microbiological', 'Biological')
        ORDER BY a.appointment_date DESC
      `;
    } else {
      // Chemistry consultancy appointments (default)
      sql = `
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
    }
    const result = await query(sql);
    const data = result.rows.map(row => ({
      id: row.appointment_id,
      date: row.appointment_date,
      customer: row.customer_name || '',
      organization: row.company_name || '',
      contactNumber: row.contactnumber || '',
      emailAddress: row.emailaddress || '',
      status: row.status || '',
      sampleName: row.name_of_samples || '',
      sampleDescription: row.sample_description || '',
      researchTopic: row.research_topic || '',
      consultationType: row.consultation_type || '',
      researchStage: row.research_stage || '',
      additionalRequirements: row.additional_requirements || '',
      uploadedResearchPaper: row.uploaded_research_paper || '',
      consultationDetails: row.consultation_details || ''
    }));
    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
} 