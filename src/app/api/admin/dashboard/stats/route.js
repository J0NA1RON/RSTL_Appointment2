import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from "@/lib/api-auth";

export async function GET(request) {
  const { session, error } = await requireAuth(request, "admin");
     if (error) {
       return NextResponse.json({ success: false, message: error }, { status: error === "Unauthorized" ? 401 : 403 });
     }
  try {
    // Get statistics for each service category in the same window as chemistry dashboard
    const stats = await query(
      `WITH service_stats AS (
        SELECT 
          s.category,
          COUNT(*) as total_appointments,
          COUNT(CASE WHEN a.status = 'pending' THEN 1 END) as pending_count,
          COUNT(CASE WHEN a.status = 'completed' THEN 1 END) as completed_count
        FROM appointments a
        JOIN services s ON a.service_id = s.id
        WHERE a.appointment_date >= CURRENT_DATE - INTERVAL '30 days'
          AND a.appointment_date <= CURRENT_DATE + INTERVAL '60 days'
        GROUP BY s.category
      )
      SELECT 
        category,
        COALESCE(total_appointments, 0) as appointments,
        COALESCE(pending_count, 0) as pending,
        COALESCE(completed_count, 0) as completed
      FROM service_stats`
    );

    // Format response
    const formattedStats = {
      metrology: { appointments: 0, pending: 0, completed: 0 },
      chemistry: { appointments: 0, pending: 0, completed: 0 },
      microbiology: { appointments: 0, pending: 0, completed: 0 },
      shelfLife: { appointments: 0, pending: 0, completed: 0 }
    };
    stats.rows.forEach(row => {
      let key = row.category;
      if (key === 'shelf-life' || key === 'shelf_life') key = 'shelfLife';
      if (key === 'chemistry' || key === 'microbiology' || key === 'metrology' || key === 'shelfLife') {
        formattedStats[key] = {
          appointments: parseInt(row.appointments),
          pending: parseInt(row.pending),
          completed: parseInt(row.completed)
        };
      }
    });

    return NextResponse.json({
      success: true,
      data: formattedStats
    });
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
} 