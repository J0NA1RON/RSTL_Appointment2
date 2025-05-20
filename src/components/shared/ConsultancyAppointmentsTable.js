import React from "react";

function formatDate(dateString) {
  if (!dateString) return '';
  const d = new Date(dateString);
  if (isNaN(d)) return dateString;
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function ConsultancyAppointmentsTable({
  filteredAppointments,
  loading,
  error,
  getStatusColor,
  onViewDetails,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus
}) {
  return (
    <>
      {/* Header: Title, Search, Filter */}
      <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 flex-shrink-0">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-gray-900 flex-shrink-0">Appointments</h2>
          <div className="flex items-center gap-3 w-full sm:w-auto sm:flex-grow justify-end">
            {/* Search Input */}
            <div className="relative w-full sm:w-56">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {/* Filter Dropdown */}
            <div className="relative w-full sm:w-auto">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-8 pr-8 py-2 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 appearance-none bg-white"
              >
                <option value="All">All Appointments</option>
                <option value="Pending">Pending</option>
                <option value="Accepted">Accepted</option>
                <option value="Declined">Declined</option>
              </select>
            </div>
          </div>
        </div>
      </div>
      {/* Table Container */}
      <div className="flex-1 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col">
        <div className="overflow-auto flex-grow">
          {loading && <p className="p-6 text-center text-gray-500">Loading appointments...</p>}
          {error && <p className="p-6 text-center text-red-500">Error loading data: {error}</p>}
          {!loading && !error && (
            <table className="w-full min-w-[700px]">
              <thead className="bg-gray-50 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Organization</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Topic</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Stage</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.map((appointment, index) => {
                    const statusColors = getStatusColor(appointment.status);
                    return (
                      <tr key={appointment.id || index} className="hover:bg-gray-50 transition-all duration-150 cursor-pointer" onClick={() => onViewDetails(appointment)}>
                        <td className="px-4 py-3 text-sm text-gray-500 whitespace-nowrap">{formatDate(appointment.date)}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{appointment.customer}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{appointment.organization}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{appointment.researchTopic}</td>
                        <td className="px-4 py-3 text-sm text-gray-900 whitespace-nowrap">{appointment.researchStage}</td>
                        <td className="px-4 py-3 text-sm whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${statusColors.bgClass} ${statusColors.textClass}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusColors.dotClass}`}></span>
                            {appointment.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-4 py-6 text-center text-sm text-gray-500">No appointments found matching your criteria.</td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
} 