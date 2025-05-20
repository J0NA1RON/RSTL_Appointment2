import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import nodemailer from 'nodemailer';
import { requireAuth } from "@/lib/api-auth";

// GET /api/companies/:id - Get a single company
export async function GET(request, { params }) {
  const { session, error } = await requireAuth(request, "admin");
     if (error) {
       return NextResponse.json({ success: false, message: error }, { status: error === "Unauthorized" ? 401 : 403 });
     }
  const { id } = params;
  try {
    const result = await query(
      `SELECT id, name, contact_person, contact_email, contact_phone, business_permit, reg_date, verified, verified_date, license_plates, created_at, updated_at FROM companies WHERE id = $1`,
      [id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Company not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// PATCH /api/companies/:id - Update a company
export async function PATCH(request, { params }) {
  const { id } = params;
  try {
    const body = await request.json();
    const fields = ['name', 'contact_person', 'contact_email', 'contact_phone', 'business_permit', 'reg_date', 'verified', 'verified_date', 'license_plates'];
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
      `UPDATE companies SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${values.length} RETURNING id, name, contact_person, contact_email, contact_phone, business_permit, reg_date, verified, verified_date, license_plates, created_at, updated_at`,
      values
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Company not found' }, { status: 404 });
    }
    // Send verification email if verified is being set to true
    if (body.verified === true) {
      const company = result.rows[0];
      if (company.contact_email) {
        // Fetch all trucks for this company
        const trucksResult = await query(
          'SELECT license_plate FROM trucks WHERE company_id = $1',
          [company.id]
        );
        const truckList = trucksResult.rows.map(row => row.license_plate).join(', ');
        try {
          const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS,
            },
          });
          await transporter.sendMail({
            from: `RSTL <${process.env.SMTP_USER}>`,
            to: company.contact_email,
            subject: 'Your Company and Trucks are Now Verified',
            text: `Hello${company.contact_person ? ' ' + company.contact_person : ''},\n\nYour company ("${company.name}") and the following trucks are now verified and can be used to set metrology appointments:\n\n${truckList}\n\nThank you for registering with RSTL.`,
          });
        } catch (emailError) {
          console.error('Error sending verification email:', emailError);
        }
      }
    }
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// DELETE /api/companies/:id - Delete a company
export async function DELETE(request, { params }) {
  const { id } = params;
  try {
    const result = await query(
      `DELETE FROM companies WHERE id = $1 RETURNING id`,
      [id]
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ success: false, message: 'Company not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, message: 'Company deleted' });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
} 