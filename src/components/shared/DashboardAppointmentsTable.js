import React from "react";
import { format, parseISO } from 'date-fns';
import { FaEllipsisH } from 'react-icons/fa';

export default function DashboardAppointmentsTable({
  filteredAppointments,
  viewMode,
  openModal,
  getStatusColor,
  loading,
  error,
  columns
}) {
  // Fallback columns for backward compatibility
  const defaultColumns = [
    { key: 'id', label: 'ID' },
    { key: 'customer_name', label: 'Customer' },
    ...(viewMode !== 'day' ? [
      { key: 'appointment_date', label: 'Date', render: (apt) => format(parseISO(apt.appointment_date), 'MMM d, yyyy') },
      { key: 'appointment_time', label: 'Time', render: (apt) => apt.appointment_time ? format(parseISO(`1970-01-01T${apt.appointment_time}Z`), 'p') : 'N/A' },
    ] : []),
    { key: 'analysis_requested', label: 'Analysis' },
    { key: 'status', label: 'Status', render: (apt) => {
      const statusColors = getStatusColor(apt.status);
      return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors.bgClass} ${statusColors.textClass} transition-transform duration-150 group-hover:scale-110`}>{apt.status}</span>;
    } },
    { key: 'actions', label: 'Actions', render: (apt) => (
      <button
        onClick={() => openModal(apt)}
        className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
        title="View Details / Manage"
      >
        <FaEllipsisH />
      </button>
    ) }
  ];
  const cols = columns && columns.length ? columns : defaultColumns;

  return (
    <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-auto h-full">
        {loading && <p className="p-4 text-center">Loading appointments...</p>}
        {error && <p className="p-4 text-center text-red-500">Error: {error}</p>}
        {!loading && !error && (
          <table className="w-full min-w-[700px]">
            <thead className="bg-gray-50 sticky top-0 z-10">
              <tr>
                {cols.map(col => (
                  <th key={col.key} className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((appointment) => (
                  <tr key={appointment.id} className="hover:bg-blue-50 hover:scale-[1.015] hover:shadow-md transition-all duration-200 group">
                    {cols.map(col => (
                      <td key={col.key} className="px-3 py-2 text-sm text-gray-600 min-w-[100px]">
                        {col.render ? col.render(appointment) : appointment[col.key]}
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={viewMode === 'day' ? 5 : 7} className="px-4 py-6 text-center text-sm text-gray-500">No appointments found matching your criteria.</td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
} 
