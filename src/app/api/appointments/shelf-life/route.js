import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth } from "@/lib/api-auth";

export async function POST(request) {
  try {
    const formData = await request.json();
    
    // Validate required fields
    const requiredFields = [
      'name', 'email', 'contactNumber', 'sex', 
      'nameOfSamples', 'sampleQuantity', 'sampleDescription', 'selectedDate',
      'productType', 'storageConditions', 'shelfLifeDuration', 'packagingType'
    ];
    
    for (const field of requiredFields) {
      if (!formData[field]) {
        return NextResponse.json(
          { success: false, message: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }
    
    // Generate a unique appointment reference number
    const appointmentRef = `SHELF-${uuidv4().substring(0, 8).toUpperCase()}`;
    
    // 1. Insert customer data and get customer_id
    const customerResult = await query(
      `INSERT INTO customers (name, email, contact_number, company_name, sex)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [formData.name, formData.email, formData.contactNumber, formData.companyName || null, formData.sex]
    );
    const customerId = customerResult.rows[0].id;
    
    // 2. Get service ID for shelf life testing service
    const serviceResult = await query(
      `SELECT id FROM services WHERE category = 'shelf_life' LIMIT 1`
    );
    
    if (serviceResult.rows.length === 0) {
      return NextResponse.json(
        { success: false, message: 'Shelf life service not found' },
        { status: 404 }
      );
    }
    
    const serviceId = serviceResult.rows[0].id;
    
    // 3. Insert appointment and get appointment_id
    const appointmentDate = (formData.selectedDate || '').slice(0, 10);
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
         appointment_id, name_of_samples, sample_type, sample_quantity, 
         sample_description, sample_condition, number_of_replicates, terms_accepted
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING id`,
      [
        appointmentId,
        formData.nameOfSamples,
        formData.sampleType || 'Food Product',
        parseInt(formData.sampleQuantity, 10) || 1,
        formData.sampleDescription,
        formData.sampleCondition || 'Normal',
        formData.replicates || 1,
        formData.terms || true
      ]
    );
    const appointmentDetailId = appointmentDetailsResult.rows[0].id;
    
    // 5. Insert shelf life-specific details
    await query(
      `INSERT INTO shelf_life_details (
         appointment_detail_id, product_type, storage_conditions, 
         shelf_life_duration, packaging_type, modes_of_deterioration
       )
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        appointmentDetailId,
        formData.productType,
        formData.storageConditions,
        formData.shelfLifeDuration,
        formData.packagingType,
        formData.modesOfDeterioration
      ]
    );
    
    // Record action log for the appointment
    await query(
      `INSERT INTO action_logs (appointment_id, action_type, action_desc)
       VALUES ($1, $2, $3)`,
      [appointmentId, 'creation', 'Shelf life study appointment created through online form']
    );
    
    // After inserting appointment_details and getting appointmentDetailId
    if (Array.isArray(formData.service_id)) {
      for (const sid of formData.service_id) {
        await query(
          `INSERT INTO appointment_detail_services (appointment_detail_id, service_id) VALUES ($1, $2)`,
          [appointmentDetailId, sid]
        );
      }
    } else if (formData.service_id) {
      await query(
        `INSERT INTO appointment_detail_services (appointment_detail_id, service_id) VALUES ($1, $2)`,
        [appointmentDetailId, formData.service_id]
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Shelf life study appointment created successfully',
      appointmentId,
      appointmentRef
    });
  } catch (error) {
    console.error('Error creating shelf life study appointment:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create appointment' }, 
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
  const service_id = searchParams.get('service_id');
  const category = searchParams.get('category');
  const date = searchParams.get('date');
  const status = searchParams.get('status');

  let sql = `
    SELECT a.*, s.name as service_name, s.category, c.name as customer_name, c.email as customer_email, c.company_name,
    (SELECT STRING_AGG(s.name, ', ') FROM appointment_detail_services ads JOIN services s ON ads.service_id = s.id WHERE ads.appointment_detail_id = ad.id) as services
    FROM appointments a
    JOIN services s ON a.service_id = s.id
    JOIN customers c ON a.customer_id = c.id
    WHERE 1=1
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