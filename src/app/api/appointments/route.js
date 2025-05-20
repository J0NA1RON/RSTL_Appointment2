import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendMail } from '@/lib/mail';
import { z } from 'zod';
import { requireAuth } from "@/lib/api-auth";

// Zod schemas
const appointmentQuerySchema = z.object({
  service_id: z.string().optional(),
  category: z.string().optional(),
  date: z.string().optional(),
  status: z.string().optional(),
});

const appointmentCreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  contact_number: z.string().min(1),
  sex: z.string().min(1),
  name_of_samples: z.string().min(1),
  sample_type: z.string().min(1),
  sample_quantity: z.union([z.string(), z.number()]),
  sample_description: z.string().min(1),
  date: z.string().min(1),
  service_id: z.union([z.string(), z.array(z.string()), z.number(), z.array(z.number())]),
  category: z.string().min(1),
  terms: z.boolean().optional(),
  sample_condition: z.string().optional(),
  number_of_replicates: z.union([z.string(), z.number()]).optional(),
  analysis_requested: z.string().optional(),
  parameters: z.string().optional(),
  delivery_type: z.string().optional(),
  test_type: z.string().optional(),
  organism_target: z.string().optional(),
  sample_storage_condition: z.string().optional(),
});

// GET /api/appointments?service_id=3&category=chemistry&date=2025-05-01&status=pending
export async function GET(request) {
  const { session, error } = await requireAuth(request, "admin");
  if (error) {
    return NextResponse.json({ success: false, message: error }, { status: error === "Unauthorized" ? 401 : 403 });
  }
  const { searchParams } = new URL(request.url);
  const paramsObj = Object.fromEntries(searchParams.entries());
  const parseResult = appointmentQuerySchema.safeParse(paramsObj);
  if (!parseResult.success) {
    return NextResponse.json({ success: false, message: 'Invalid query parameters', errors: parseResult.error.errors }, { status: 400 });
  }
  const { service_id, category, date, status } = parseResult.data;

  let sql;
  let params = [];

  // Normalize category for shelf life for internal logic only
  let normalizedCategory = category;
  if (category === 'shelf-life' || category === 'shelf_life') {
    normalizedCategory = 'shelf_life';
  }

  // Use the actual DB value for SQL filtering
  let sqlCategory = category;
  if (category === 'shelf_life') {
    sqlCategory = 'shelf-life';
  }

  if (normalizedCategory === 'chemistry') {
    sql = `
      SELECT a.*, s.category, c.name as customer_name, c.email as customer_email, c.company_name, c.contact_number, c.sex,
             ad.name_of_samples, ad.sample_type, ad.sample_quantity, ad.sample_description,
             COALESCE(sv.services, '') as services
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      JOIN customers c ON a.customer_id = c.id
      JOIN appointment_details ad ON a.id = ad.appointment_id
      JOIN chemistry_details cd ON ad.id = cd.appointment_detail_id
      LEFT JOIN (
        SELECT ads.appointment_detail_id, STRING_AGG(s.name, ', ') as services
        FROM appointment_detail_services ads
        JOIN services s ON ads.service_id = s.id
        GROUP BY ads.appointment_detail_id
      ) sv ON sv.appointment_detail_id = ad.id
      WHERE 1=1
    `;
    if (service_id) {
      sql += ` AND s.id = $${params.length + 1}`;
      params.push(service_id);
    }
    if (date) {
      sql += ` AND a.appointment_date::date = $${params.length + 1}`;
      params.push(date);
    }
    if (status) {
      sql += ` AND a.status = $${params.length + 1}`;
      params.push(status);
    }
    if (sqlCategory) {
      sql += ` AND s.category = $${params.length + 1}`;
      params.push(sqlCategory);
    }
    sql += ' GROUP BY a.id, s.category, c.name, c.email, c.company_name, c.contact_number, c.sex, ad.name_of_samples, ad.sample_type, ad.sample_quantity, ad.sample_description, cd.parameters, cd.delivery_type, sv.services';
    sql += ' ORDER BY a.appointment_date DESC, a.created_at DESC';
  } else if (normalizedCategory === 'microbiology') {
    sql = `
      SELECT a.*, s.category, c.name as customer_name, c.email as customer_email, c.company_name, c.contact_number, c.sex,
             ad.name_of_samples, ad.sample_type, ad.sample_quantity, ad.sample_description,
             COALESCE(sv.services, '') as services
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      JOIN customers c ON a.customer_id = c.id
      JOIN appointment_details ad ON a.id = ad.appointment_id
      JOIN microbiology_details md ON ad.id = md.appointment_detail_id
      LEFT JOIN (
        SELECT ads.appointment_detail_id, STRING_AGG(s.name, ', ') as services
        FROM appointment_detail_services ads
        JOIN services s ON ads.service_id = s.id
        GROUP BY ads.appointment_detail_id
      ) sv ON sv.appointment_detail_id = ad.id
      WHERE 1=1
    `;
    if (service_id) {
      sql += ` AND s.id = $${params.length + 1}`;
      params.push(service_id);
    }
    if (date) {
      sql += ` AND a.appointment_date::date = $${params.length + 1}`;
      params.push(date);
    }
    if (status) {
      sql += ` AND a.status = $${params.length + 1}`;
      params.push(status);
    }
    if (sqlCategory) {
      sql += ` AND s.category = $${params.length + 1}`;
      params.push(sqlCategory);
    }
    sql += ' GROUP BY a.id, s.category, c.name, c.email, c.company_name, c.contact_number, c.sex, ad.name_of_samples, ad.sample_type, ad.sample_quantity, ad.sample_description, sv.services';
    sql += ' ORDER BY a.appointment_date DESC, a.created_at DESC';
  } else if (normalizedCategory === 'shelf_life') {
    sql = `
      SELECT a.*, s.category, c.name as customer_name, c.email as customer_email, c.company_name,
             ad.name_of_samples, ad.sample_type, ad.sample_quantity, ad.sample_description,
             sld.product_type, sld.brand_name, sld.net_weight, sld.product_ingredients, sld.packaging_type, sld.shelf_life_duration
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      JOIN customers c ON a.customer_id = c.id
      JOIN appointment_details ad ON a.id = ad.appointment_id
      LEFT JOIN shelf_life_details sld ON ad.id = sld.appointment_detail_id
      WHERE 1=1
    `;
    if (service_id) {
      sql += ` AND s.id = $${params.length + 1}`;
      params.push(service_id);
    }
    if (sqlCategory) {
      sql += ` AND s.category = $${params.length + 1}`;
      params.push(sqlCategory);
    }
    if (date) {
      sql += ` AND a.appointment_date::date = $${params.length + 1}`;
      params.push(date);
    }
    if (status) {
      sql += ` AND a.status = $${params.length + 1}`;
      params.push(status);
    }
    sql += ' ORDER BY a.appointment_date DESC, a.created_at DESC';
  } else {
    sql = `
      SELECT a.*, s.name as service_name, s.category, c.name as customer_name, c.email as customer_email, c.company_name
      FROM appointments a
      JOIN services s ON a.service_id = s.id
      JOIN customers c ON a.customer_id = c.id
      WHERE 1=1
    `;
    if (service_id) {
      sql += ` AND s.id = $${params.length + 1}`;
      params.push(service_id);
    }
    if (sqlCategory) {
      sql += ` AND s.category = $${params.length + 1}`;
      params.push(sqlCategory);
    }
    if (date) {
      sql += ` AND a.appointment_date::date = $${params.length + 1}`;
      params.push(date);
    }
    if (status) {
      sql += ` AND a.status = $${params.length + 1}`;
      params.push(status);
    }
    sql += ' ORDER BY a.appointment_date DESC, a.created_at DESC';
  }

  try {
    const result = await query(sql, params);
    // Normalize appointment_date for all rows
    const normalizedRows = result.rows.map(row => {
      let normalizedDate;
      if (row.appointment_date instanceof Date) {
        // Use local date parts, not toISOString
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
    return NextResponse.json({ success: true, data: normalizedRows });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const formData = await request.json();
    const parseResult = appointmentCreateSchema.safeParse(formData);
    if (!parseResult.success) {
      return NextResponse.json({ success: false, message: 'Invalid input', errors: parseResult.error.errors }, { status: 400 });
    }
    const data = parseResult.data;
    const category = data.category;
    if (!category) {
      return NextResponse.json({ success: false, message: 'Missing category in request body' }, { status: 400 });
    }
    const supported = ['chemistry', 'microbiology', 'shelf_life', 'metrology', 'research'];
    if (!supported.includes(category)) {
      return NextResponse.json({ success: false, message: `Unsupported category: ${category}` }, { status: 400 });
    }

    // Only implement chemistry, microbiology, shelf_life for now
    if (category === 'metrology' || category === 'research') {
      return NextResponse.json({ success: false, message: 'POST handler for this category not yet implemented' }, { status: 501 });
    }

    // Normalize category for shelf life for internal logic only
    let normalizedCategory = category;
    if (category === 'shelf-life' || category === 'shelf_life') {
      normalizedCategory = 'shelf_life';
    }

    // Use the actual DB value for SQL filtering
    let sqlCategory = category;
    if (category === 'shelf_life') {
      sqlCategory = 'shelf-life';
    }

    // Validate required fields
    const requiredFields = [
      'name', 'email', 'contact_number', 'sex',
      'name_of_samples', 'sample_type', 'sample_quantity', 'sample_description', 'date', 'service_id'
    ];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json({ success: false, message: `Missing required field: ${field}` }, { status: 400 });
      }
    }

    // 1. Insert customer
    const customerResult = await query(
      `INSERT INTO customers (name, email, contact_number, company_name, sex)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [data.name, data.email, data.contact_number, data.company_name || null, data.sex]
    );
    const customerId = customerResult.rows[0].id;

    // 2. Use the first service_id (array) for now (TODO: support multiple services per appointment)
    const serviceId = Array.isArray(data.service_id) ? data.service_id[0] : data.service_id;

    // 3. Insert appointment
    const appointmentDate = (data.date || '').slice(0, 10);
    const appointmentResult = await query(
      `INSERT INTO appointments (customer_id, service_id, appointment_date, status)
       VALUES ($1, $2, $3, $4)
       RETURNING id`,
      [customerId, serviceId, appointmentDate, 'pending']
    );
    const appointmentId = appointmentResult.rows[0].id;

    // 4. Insert appointment_details
    const appointmentDetailsResult = await query(
      `INSERT INTO appointment_details (
         appointment_id, name_of_samples, sample_type, sample_quantity, 
         sample_description, sample_condition, number_of_replicates, terms_accepted
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        appointmentId,
        data.name_of_samples,
        data.sample_type,
        parseInt(data.sample_quantity, 10) || 1,
        data.sample_description,
        data.sample_condition || 'Normal',
        data.number_of_replicates || 1,
        data.terms || true
      ]
    );
    const appointmentDetailId = appointmentDetailsResult.rows[0].id;

    // 5. Insert category-specific details
    if (normalizedCategory === 'shelf_life') {
      await query(
        `INSERT INTO shelf_life_details (
           appointment_detail_id, objective_of_study, product_type, net_weight, brand_name, existing_market, production_type, product_ingredients, storage_conditions, shelf_life_duration, packaging_type, target_shelf_life, modes_of_deterioration
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
        [
          appointmentDetailId,
          data.objective_of_study || '',
          data.product_type || data.productName || '',
          data.net_weight || '',
          data.brand_name || '',
          data.existing_market || '',
          data.production_type || '',
          data.product_ingredients || '',
          data.storage_conditions || '',
          data.shelf_life_duration || data.target_shelf_life || null,
          data.packaging_type || '',
          data.target_shelf_life || '',
          Array.isArray(data.modes_of_deterioration) ? data.modes_of_deterioration.join(', ') : (data.modes_of_deterioration || '')
        ]
      );
    } else if (normalizedCategory === 'chemistry') {
      await query(
        `INSERT INTO chemistry_details (
           appointment_detail_id, analysis_requested, parameters, delivery_type, sample_quantity
         )
         VALUES ($1, $2, $3, $4, $5)`,
        [
          appointmentDetailId,
          data.analysis_requested || data.analysisRequested || 'Standard analysis',
          data.parameters || 'Standard parameters',
          data.delivery_type || data.deliveryType || 'Standard',
          data.sample_quantity
        ]
      );
    } else if (normalizedCategory === 'microbiology') {
      await query(
        `INSERT INTO microbiology_details (
           appointment_detail_id, test_type, organism_target, sample_storage_condition, sample_quantity
         )
         VALUES ($1, $2, $3, $4, $5)`,
        [
          appointmentDetailId,
          data.test_type || data.testType || 'General',
          data.organism_target || '',
          data.sample_storage_condition || '',
          data.sample_quantity
        ]
      );
    }

    // After inserting appointment_details and getting appointmentDetailId
    if (Array.isArray(data.service_id)) {
      for (const sid of data.service_id) {
        await query(
          `INSERT INTO appointment_detail_services (appointment_detail_id, service_id) VALUES ($1, $2)`,
          [appointmentDetailId, sid]
        );
      }
    } else if (data.service_id) {
      await query(
        `INSERT INTO appointment_detail_services (appointment_detail_id, service_id) VALUES ($1, $2)`,
        [appointmentDetailId, data.service_id]
      );
    }

    // Fetch all service names for this appointment detail
    const servicesRes = await query(
      `SELECT s.name FROM appointment_detail_services ads JOIN services s ON ads.service_id = s.id WHERE ads.appointment_detail_id = $1`,
      [appointmentDetailId]
    );
    const serviceNames = servicesRes.rows.map(row => row.name);

    // Send confirmation email with review-style structure
    try {
      const html = `
        <p>Dear ${data.name},</p>
        <h3>Appointment & Contact Information</h3>
        <ul>
          <li><strong>Client Name:</strong> ${data.name}</li>
          <li><strong>Email:</strong> ${data.email}</li>
          <li><strong>Phone:</strong> ${data.contact_number}</li>
          ${data.company_name ? `<li><strong>Organization:</strong> ${data.company_name}</li>` : ''}
          <li><strong>Sex:</strong> ${data.sex}</li>
        </ul>
        <h4>Sample Details</h4>
        <ul>
          <li><strong>Sample Name:</strong> ${data.name_of_samples}</li>
          <li><strong>Sample Type:</strong> ${data.sample_type}</li>
          <li><strong>Quantity:</strong> ${data.sample_quantity}</li>
          <li><strong>Preferred Date:</strong> ${appointmentDate}</li>
          <li><strong>Sample Description:</strong> ${data.sample_description}</li>
        </ul>
        <h4>Selected Services</h4>
        <ul>
          ${serviceNames.map(name => `<li>${name}</li>`).join('')}
        </ul>
        <p>Thank you for choosing our laboratory services. We look forward to serving you!</p>
        <p>Best regards,<br/>RSTL Team</p>
      `;
      const text = `Dear ${data.name},\n\nAppointment & Contact Information\n- Client Name: ${data.name}\n- Email: ${data.email}\n- Phone: ${data.contact_number}\n${data.company_name ? `- Organization: ${data.company_name}\n` : ''}- Sex: ${data.sex}\n\nSample Details\n- Sample Name: ${data.name_of_samples}\n- Sample Type: ${data.sample_type}\n- Quantity: ${data.sample_quantity}\n- Preferred Date: ${appointmentDate}\n- Sample Description: ${data.sample_description}\n\nSelected Services\n${serviceNames.map(name => `- ${name}`).join('\n')}\n\nThank you for choosing our laboratory services. We look forward to serving you!\n\nBest regards,\nRSTL Team`;
      await sendMail({
        to: data.email,
        subject: 'Your Appointment is Booked',
        html,
        text,
      });
    } catch (e) {
      // Log but do not fail the booking if email fails
      console.error('Failed to send confirmation email:', e);
    }
    return NextResponse.json({ success: true, appointmentId });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message || 'Failed to create appointment' }, { status: 500 });
  }
} 