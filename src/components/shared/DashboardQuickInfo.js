import React from "react";

export default function DashboardQuickInfo({ title, stats, getStatusColor }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 flex-shrink-0 transition-all duration-200 hover:scale-105 hover:shadow-lg">
      <h3 className="text-base font-semibold text-gray-800 mb-3">{title}</h3>
      <div className="text-sm space-y-1.5">
        <p>Total Appointments: <span className="font-semibold text-lg">{stats.total}</span></p>
        {Object.entries(stats).map(([status, count]) => {
          if (status === 'total' || count === 0) return null;
          const color = getStatusColor(status);
          return (
            <p key={status} className={`${color.textClass} capitalize`}>
              {status}: <span className="font-medium">{count}</span>
            </p>
          );
        })}
        {stats.total === 0 && <p className="text-gray-500 text-xs italic">No appointments in this view.</p>}
      </div>
    </div>
  );
} 