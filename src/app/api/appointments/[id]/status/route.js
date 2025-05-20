import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { sendMail } from '@/lib/mail';

export async function PATCH(request, { params }) {
  const { id } = params;
  const { status, declineReason } = await request.json();

  if (!status) {
    return NextResponse.json(
      { success: false, message: 'Status is required' }, 
      { status: 400 }
    );
  }

  // Optional: Add validation for allowed statuses
  const allowedStatuses = ['pending', 'accepted', 'in progress', 'completed', 'declined'];
  if (!allowedStatuses.includes(status.toLowerCase())) {
      return NextResponse.json(
          { success: false, message: 'Invalid status provided' }, 
          { status: 400 }
      );
  }

  try {
    const result = await query(
      `UPDATE appointments SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Appointment not found' }, 
        { status: 404 }
      );
    }

    // When an appointment is declined, set its number_of_liters to 0
    if (status.toLowerCase() === 'declined') {
      // Find the appointment_detail_id for this appointment
      const detailResult = await query(
        `SELECT ad.id FROM appointment_details ad WHERE ad.appointment_id = $1`,
        [id]
      );
      if (detailResult.rows.length > 0) {
        const appointmentDetailId = detailResult.rows[0].id;
        await query(
          `UPDATE metrology_details SET number_of_liters = 0 WHERE appointment_detail_id = $1`,
          [appointmentDetailId]
        );
      }
    }

    // Fetch email and consultation details for notification
    const infoResult = await query(
      `SELECT c.email AS email, rcd.consultation_details FROM appointments a JOIN customers c ON a.customer_id = c.id LEFT JOIN appointment_details ad ON a.id = ad.appointment_id LEFT JOIN research_consultation_details rcd ON ad.id = rcd.appointment_detail_id WHERE a.id = $1`,
      [id]
    );
    if (infoResult.rows.length > 0) {
      const { email, consultation_details } = infoResult.rows[0];
      if (email) {
        if (status.toLowerCase() === 'declined') {
          await sendMail({
            to: email,
            subject: 'Research Consultation Declined',
            text: `Your research consultation request was declined. Reason: ${declineReason || 'No reason provided.'}\n\nConsultation Details: ${consultation_details || ''}`,
            html: `<p>Your research consultation request was <b>declined</b>.</p><p><b>Reason:</b> ${declineReason || 'No reason provided.'}</p><p><b>Consultation Details:</b> ${consultation_details || ''}</p>`
          });
        } else if (status.toLowerCase() === 'accepted') {
          await sendMail({
            to: email,
            subject: 'Research Consultation Accepted',
            text: 'Your research consultation request has been accepted. We will contact you with further details.',
            html: '<p>Your research consultation request has been <b>accepted</b>. We will contact you with further details.</p>'
          });
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Appointment status updated successfully',
      data: result.rows[0]
    });

  } catch (error) {
    console.error('Error updating appointment status:', error);
    return NextResponse.json(
      { success: false, message: error.message }, 
      { status: 500 }
    );
  }
} 