import React from "react";

export default function AcceptedAppointmentsList({ acceptedAppointments, loading, error, getStatusColor, onViewDetails }) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4 flex-shrink-0">
        <h3 className="text-base font-semibold text-gray-800">Accepted Appointments</h3>
        <span className="bg-green-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
          {acceptedAppointments.length} Total
        </span>
      </div>
      <div className="flex-1 overflow-y-auto space-y-3 pr-1">
        {loading && <p className="text-gray-500 text-sm p-4 text-center">Loading...</p>}
        {error && <p className="text-red-500 text-sm p-4 text-center">Error loading list.</p>}
        {!loading && !error && acceptedAppointments.length > 0 ? (
          acceptedAppointments.map(apt => {
            const statusColors = getStatusColor(apt.status);
            return (
              <div
                key={apt.id}
                className={`p-3 rounded-md border border-gray-200 bg-white transition-all duration-150 cursor-pointer hover:bg-gray-50`}
                onClick={() => onViewDetails(apt)}
              >
                <div className="flex justify-between items-start mb-1">
                  <p className="font-semibold text-sm text-gray-900 truncate" title={apt.name}>{apt.name}</p>
                </div>
                <p className="text-xs text-gray-600">{apt.date} &middot; {apt.time}</p>
                <p className="text-xs text-gray-500 mt-1 truncate" title={apt.organization}>{apt.organization}</p>
                <p className="text-xs text-gray-500 mt-0.5 truncate" title={apt.researchType}>{apt.researchType}</p>
              </div>
            );
          })
        ) : (
          !loading && !error && <p className="text-sm text-gray-400 italic p-4 text-center">No accepted appointments.</p>
        )}
      </div>
    </div>
  );
} 