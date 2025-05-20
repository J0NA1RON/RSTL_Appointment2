import React from 'react';

export default function DashboardRecentAppointments({ recentAppointments = [], loading, error, getStatusColor }) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 flex-1 h-full flex flex-col">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Appointments</h3>
      {loading && <p className="text-sm text-gray-500">Loading...</p>}
      {error && <p className="text-sm text-red-500">Error loading appointments.</p>}
      {!loading && !error && recentAppointments.length > 0 ? (
        <div className="flex flex-col gap-3 flex-1">
          {recentAppointments.slice(0, 5).map((apt, idx) => {
            const statusColor = getStatusColor(apt.status);
            return (
              <div key={idx} className="bg-gray-50 rounded-lg p-3 shadow border flex flex-col gap-1 transition-all duration-300 hover:bg-blue-50 hover:shadow-xl hover:scale-105 hover:border-l-4 hover:border-blue-400 cursor-pointer group">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800 text-sm">{apt.client_name || apt.name || apt.customer_name || 'N/A'}</span>
                  <span className={`text-xs px-2 py-1 rounded-full transition-transform duration-200 group-hover:scale-110 ${statusColor ? statusColor.bgClass + ' ' + statusColor.textClass : 'bg-gray-200 text-gray-700'}`}>{apt.status || 'Pending'}</span>
                </div>
                {apt.appointment_date && <div className="text-xs text-gray-500">Date: {apt.appointment_date}</div>}
                {apt.appointment_time && <div className="text-xs text-gray-500">Time: {apt.appointment_time}</div>}
                {apt.delivery_type && <div className="text-xs text-gray-500">Delivery: {apt.delivery_type}</div>}
              </div>
            );
          })}
        </div>
      ) : (
        !loading && !error && <p className="text-sm text-gray-400 italic">No recent appointments.</p>
      )}
    </div>
  );
} 