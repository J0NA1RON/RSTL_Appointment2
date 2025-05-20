import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { requireAuth } from "@/lib/api-auth";

// GET /api/services - List all services (optionally filter by category)
export async function GET(request) {
  const { session, error } = await requireAuth(request, "admin");
     if (error) {
       return NextResponse.json({ success: false, message: error }, { status: error === "Unauthorized" ? 401 : 403 });
     }
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  try {
    let sql = `SELECT id, name, description, price, category, active, sample_type, created_at, updated_at FROM services`;
    let params = [];
    if (category) {
      sql += ' WHERE category = $1';
      params.push(category);
    }
    sql += ' ORDER BY created_at DESC';
    const result = await query(sql, params);

    // Group by category for frontend compatibility
    const grouped = {};
    result.rows.forEach(service => {
      if (!grouped[service.category]) grouped[service.category] = [];
      grouped[service.category].push(service);
    });

    // After grouping
    const categoryKeyMap = {
      'shelf-life': 'shelf_life',
      'chemistry': 'chemistry',
      'microbiology': 'microbiology',
      'metrology': 'metrology',
      'research': 'research'
    };
    const remapped = {};
    Object.entries(grouped).forEach(([key, value]) => {
      const mappedKey = categoryKeyMap[key] || key;
      remapped[mappedKey] = value;
    });
    return NextResponse.json({ success: true, data: remapped });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

// POST /api/services - Create a new service
export async function POST(request) {
  try {
    const body = await request.json();
    const { name, description, price, category, active, sample_type } = body;
    if (!name || !category) {
      return NextResponse.json({ success: false, message: 'Name and category are required' }, { status: 400 });
    }
    const result = await query(
      `INSERT INTO services (name, description, price, category, active, sample_type)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, name, description, price, category, active, sample_type, created_at, updated_at`,
      [name, description, price, category, active ?? true, sample_type || null]
    );
    return NextResponse.json({ success: true, data: result.rows[0] });
  } catch (error) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
} 