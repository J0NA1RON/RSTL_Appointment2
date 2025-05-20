"use client";

import React, { useEffect, useState } from "react";
import AdminLayout from '@/components/layout/AdminLayout';
import Taskbar from '@/components/shared/Taskbar';
import DashboardNav from '@/components/layout/DashboardNav';
import { FaTachometerAlt, FaEnvelopeOpenText } from 'react-icons/fa';
import Link from 'next/link';

const columns = [
  "Inquiry ID",
  "Date of Inquiry",
  "Mode of Inquiry",
  "RSTL Personnel in Contact",
  "Type of Inquiry",
  "Name of Customer",
  "Contact Details",
  "Details of Inquiry",
  "Lab Concerned",
  "Action from Lab",
  "Schedule",
  "Remarks from Lab and/or CRO",
  "Action from CRO",
  "To wait response until",
  "Status",
  "Action Logs (automatically updated from Column L)"
];

// AdminSidebar component (copied from dashboard page)
function AdminSidebar({ current }) {
  const nav = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: <FaTachometerAlt className="w-5 h-5" /> },
    { label: 'Inquiries Sheet', href: '/admin/dashboard/inquiries', icon: <FaEnvelopeOpenText className="w-5 h-5" /> },
  ];
  return (
    <aside className="fixed top-0 left-0 h-full w-56 bg-white border-r border-gray-200 shadow-sm flex flex-col z-30" aria-label="Admin sidebar">
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <span className="text-xl font-bold text-blue-600 tracking-tight">Admin</span>
      </div>
      <div className="px-6 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Navigation</div>
      <nav className="flex-1 py-2 px-2 space-y-2">
        {nav.map(item => (
          <Link key={item.href} href={item.href} className={`relative flex items-center gap-3 px-4 py-2 rounded-lg text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200 ${current === item.href ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-blue-50'}`}
            aria-current={current === item.href ? 'page' : undefined}>
            <span className={`absolute left-0 top-0 h-full w-1 rounded-r-lg transition-all ${current === item.href ? 'bg-blue-500' : 'bg-transparent'}`}></span>
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

export default function InquiriesSheetPage() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editing, setEditing] = useState({}); // { rowIdx: { col: value } }

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/admin/dashboard/inquiries');
        const json = await res.json();
        if (json.success) {
          setData(json.data);
        } else {
          setError(json.message || 'Failed to fetch data');
        }
      } catch (err) {
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Helper to map API data to table columns
  const renderCell = (row, col) => {
    switch (col) {
      case "Inquiry ID": return row.inquiry_id;
      case "Date of Inquiry": return row.date_of_inquiry ? new Date(row.date_of_inquiry).toLocaleString() : '';
      case "Mode of Inquiry": return row.mode_of_inquiry;
      case "RSTL Personnel in Contact": return row.rstl_personnel;
      case "Type of Inquiry": return row.type_of_inquiry;
      case "Name of Customer": return row.customer_name;
      case "Contact Details": return [row.email, row.contact_number].filter(Boolean).join(' / ');
      case "Details of Inquiry": return [row.sample_description, row.name_of_samples, row.sample_quantity, row.number_of_replicates].filter(Boolean).join(' | ');
      case "Lab Concerned": return row.laboratory;
      case "Action from Lab": return row.action_from_lab;
      case "Schedule": return row.schedule ? new Date(row.schedule).toLocaleString() : '';
      case "Remarks from Lab and/or CRO": return row.remarks;
      case "Action from CRO": return row.action_from_cro;
      case "To wait response until": return row.wait_response_until ? new Date(row.wait_response_until).toLocaleDateString() : '';
      case "Status": return row.status;
      case "Action Logs (automatically updated from Column L)": return row.action_logs;
      default: return '';
    }
  };

  // Helper to update cell value in local state
  const handleCellChange = (rowIdx, col, value) => {
    setEditing(prev => ({
      ...prev,
      [rowIdx]: { ...prev[rowIdx], [col]: value }
    }));
  };

  // Save cell value (update local data and clear editing state)
  const handleCellSave = (rowIdx, col) => {
    const value = editing[rowIdx]?.[col] || '';
    setData(prev => prev.map((row, idx) => {
      if (idx !== rowIdx) return row;
      // Map column to field name
      const newRow = { ...row };
      switch (col) {
        case "Mode of Inquiry": newRow.mode_of_inquiry = value; break;
        case "RSTL Personnel in Contact": newRow.rstl_personnel = value; break;
        case "Type of Inquiry": newRow.type_of_inquiry = value; break;
        case "Name of Customer": newRow.customer_name = value; break;
        case "Contact Details": newRow.contact_number = value; break; // or email
        case "Details of Inquiry": newRow.sample_description = value; break;
        case "Lab Concerned": newRow.laboratory = value; break;
        case "Action from Lab": newRow.action_from_lab = value; break;
        case "Schedule": newRow.schedule = value; break;
        case "Remarks from Lab and/or CRO": newRow.remarks = value; break;
        case "Action from CRO": newRow.action_from_cro = value; break;
        case "To wait response until": newRow.wait_response_until = value; break;
        case "Status": newRow.status = value; break;
        case "Action Logs (automatically updated from Column L)": newRow.action_logs = value; break;
        default: break;
      }
      return newRow;
    }));
    setEditing(prev => {
      const copy = { ...prev };
      if (copy[rowIdx]) delete copy[rowIdx][col];
      return copy;
    });
    // TODO: Send update to backend here
  };

  // Render editable or static cell
  const renderEditableCell = (row, col, rowIdx) => {
    const value = renderCell(row, col);
    const isEditing = editing[rowIdx]?.[col] !== undefined;
    if (value === '' || value === undefined || value === null) {
      return isEditing ? (
        <input
          className="w-full px-2 py-1 border rounded text-xs"
          value={editing[rowIdx]?.[col] || ''}
          autoFocus
          onChange={e => handleCellChange(rowIdx, col, e.target.value)}
          onBlur={() => handleCellSave(rowIdx, col)}
          onKeyDown={e => { if (e.key === 'Enter') handleCellSave(rowIdx, col); }}
        />
      ) : (
        <button
          className="text-blue-400 hover:underline text-xs"
          onClick={() => handleCellChange(rowIdx, col, '')}
        >
          + Add
        </button>
      );
    }
    return value;
  };

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar current="/admin/dashboard/inquiries" />
        <div className="flex-1 ml-56">
          <div className="sticky top-0 z-40">
            <DashboardNav />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16">
            <div className="w-full bg-white rounded-lg shadow border border-gray-200 h-[calc(100vh-160px)] overflow-y-auto">
              <table className="min-w-full w-full divide-y divide-gray-200 text-xs">
                <thead className="bg-gray-100 sticky top-0 z-10">
                  <tr>
                    {columns.map(col => (
                      <th key={col} className="px-4 py-3 font-bold text-gray-700 whitespace-nowrap border-r last:border-r-0 text-center bg-gray-100 sticky top-0 z-20">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={columns.length} className="text-center py-8 text-gray-400">Loading...</td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan={columns.length} className="text-center py-8 text-red-500">{error}</td>
                    </tr>
                  ) : data.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} className="text-center py-8 text-gray-400">No inquiries found.</td>
                    </tr>
                  ) : (
                    data.map((row, idx) => (
                      <tr key={row.inquiry_id || idx} className="hover:bg-blue-50 transition-colors">
                        {columns.map(col => (
                          <td key={col} className="px-4 py-2 border-r last:border-r-0 text-center text-gray-700 max-w-xs truncate" title={String(renderCell(row, col) ?? '')}>
                            {renderEditableCell(row, col, idx)}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 