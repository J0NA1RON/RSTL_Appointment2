import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { requireAuth } from "@/lib/api-auth";

// Zod schemas
const metrologyQuerySchema = z.object({
  service_id: z.string().optional(),
  category: z.string().optional(),
  date: z.string().optional(),
  status: z.string().optional(),
});

const metrologyCreateSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  contactNumber: z.string().min(1),
  sex: z.string().min(1),
  nameOfSamples: z.string().min(1),
  sampleDescription: z.string().min(1),
  selectedDate: z.string().min(1),
  plateNumber: z.string().min(1),
  typeOfTest: z.string().min(1),
  numberOfLiters: z.union([z.string(), z.number()]),
  terms: z.boolean(),
  companyName: z.string().min(1),
});

export async function POST(request) {
  try {
    const formData = await request.json();
    const parseResult = metrologyCreateSchema.safeParse(formData);
    if (!parseResult.success) {
      return NextResponse.json({ success: false, message: 'Invalid input', errors: parseResult.error.errors }, { status: 400 });
    }
    
    // Validate required fields
    const requiredFields = ['name', 'email', 'contactNumber', 'sex', 'nameOfSamples', 'sampleDescription', 'selectedDate', 'plateNumber', 'typeOfTest', 'numberOfLiters', 'terms'];
    
    for (const field of requiredFields) {
      if (!formData[field]) {
        return NextResponse.json(
          { success: false, message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Generate a unique appointment reference number
    const appointmentRef = `METRO-${uuidv4().substring(0, 8).toUpperCase()}`;
    
    // Get the appointment date
    const appointmentDate = (formData.selectedDate || formData.appointmentDate || '').slice(0, 10);
    // 1. Get the daily liter limit for this date
    let limitResult = await query(
      `SELECT daily_liter_capacity FROM appointment_constraints WHERE constraint_date = $1`,
      [appointmentDate]
    );
    let dailyLimit = 80000;
    if (limitResult.rows.length > 0) {
      dailyLimit = parseFloat(limitResult.rows[0].daily_liter_capacity);
    }
    // 2. Sum the number_of_liters for all metrology appointments on this date
    let sumResult = await query(
      `SELECT COALESCE(SUM(md.number_of_liters),0) AS total_liters
       FROM appointments a
       JOIN appointment_details ad ON a.id = ad.appointment_id
       JOIN metrology_details md ON ad.id = md.appointment_detail_id
       WHERE a.appointment_date = $1`,
      [appointmentDate]
    );
    const currentTotal = parseFloat(sumResult.rows[0].total_liters) || 0;
    const requestedLiters = parseFloat(formData.numberOfLiters) || 0;
    if (currentTotal + requestedLiters > dailyLimit) {
      return NextResponse.json({
        success: false,
        message: `Daily limit exceeded. Only ${dailyLimit - currentTotal} liters remaining for ${appointmentDate}.`
      }, { status: 400 });
    }
    
    // --- ENFORCE ONLY VERIFIED COMPANIES AND THEIR TRUCKS CAN BE USED ---
    // 0. Check company exists and is verified
    const companyRes = await query(
      `SELECT id, verified FROM companies WHERE LOWER(name) = LOWER($1)`,
      [formData.companyName]
    );
    if (companyRes.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Company not registered.' }, { status: 400 });
    }
    if (!companyRes.rows[0].verified) {
      return NextResponse.json({ success: false, message: 'Company is not verified.' }, { status: 400 });
    }
    const companyId = companyRes.rows[0].id;
    // 0b. Check truck exists under this company
    const truckRes = await query(
      `SELECT id FROM trucks WHERE LOWER(license_plate) = LOWER($1) AND company_id = $2`,
      [formData.plateNumber, companyId]
    );
    if (truckRes.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Truck not registered under this company.' }, { status: 400 });
    }
    
    // 1. Insert customer data and get customer_id
    const customerResult = await query(
      `INSERT INTO customers (name, email, contact_number, company_name, sex)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [formData.name, formData.email, formData.contactNumber, formData.companyName || null, formData.sex]
    );
    const customerId = customerResult.rows[0].id;
    
    // 2. Get service ID for metrology service
    const serviceResult = await query(
      `SELECT id FROM services WHERE category = 'metrology' LIMIT 1`
    );
    const serviceId = serviceResult.rows[0].id;
    
    // 3. Insert appointment and get appointment_id
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
         appointment_id, plate_number, sample_description, 
         name_of_samples, terms_accepted
       )
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        appointmentId, 
        formData.plateNumber, 
        formData.sampleDescription, 
        formData.nameOfSamples,
        formData.terms
      ]
    );
    const appointmentDetailId = appointmentDetailsResult.rows[0].id;
    
    // 5. Insert metrology-specific details
    await query(
      `INSERT INTO metrology_details (
         appointment_detail_id, type_of_test, number_of_liters, 
         truck_plate_number
       )
       VALUES ($1, $2, $3, $4)`,
      [
        appointmentDetailId,
        formData.typeOfTest,
        formData.numberOfLiters,
        formData.plateNumber
      ]
    );
    
    return NextResponse.json({ 
      success: true, 
      message: 'Metrology appointment created successfully',
      appointmentId
    });
  } catch (error) {
    console.error('Error creating metrology appointment:', error);
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
  const paramsObj = Object.fromEntries(searchParams.entries());
  const parseResult = metrologyQuerySchema.safeParse(paramsObj);
  if (!parseResult.success) {
    return NextResponse.json({ success: false, message: 'Invalid query parameters', errors: parseResult.error.errors }, { status: 400 });
  }
  const service_id = searchParams.get('service_id');
  const category = searchParams.get('category');
  const date = searchParams.get('date');
  const status = searchParams.get('status');

  let sql = `
    SELECT a.*, s.name as service_name, s.category, c.name as customer_name, c.email as customer_email, c.company_name,
           ad.name_of_samples, ad.sample_description, md.type_of_test, md.number_of_liters, md.truck_plate_number
    FROM appointments a
    JOIN services s ON a.service_id = s.id
    JOIN customers c ON a.customer_id = c.id
    LEFT JOIN appointment_details ad ON a.id = ad.appointment_id
    LEFT JOIN metrology_details md ON ad.id = md.appointment_detail_id
    WHERE s.category = 'metrology'
  `;
  const params = [];

  if (service_id) {
    sql += ` AND s.id = $${params.length + 1}`;
    params.push(service_id);
  }
  if (category) {
    sql += ` AND s.category = $${params.length + 1}`;
    params.push(category);
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

  try {
    const result = await query(sql, params);
    // Normalize appointment_date for all rows
    const normalizedRows = result.rows.map(row => {
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
    return NextResponse.json({ success: true, data: normalizedRows });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
} 