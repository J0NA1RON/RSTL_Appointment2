import React from "react";
import { FaSearch } from 'react-icons/fa';
import { format } from 'date-fns';

export default function DashboardFilters({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  selectedDate,
  setSelectedDate
}) {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 flex-shrink-0 transition-all duration-200 hover:scale-105 hover:shadow-lg">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Filters</h3>
      <div className="flex flex-col gap-3">
        {selectedDate && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Date: {format(selectedDate, 'MMM d')}</span>
            <button
              onClick={() => setSelectedDate(null)}
              className="px-2 py-1 text-xs border border-gray-300 rounded transition-all duration-150 hover:bg-blue-50 hover:text-blue-700"
            >
              Clear Date
            </button>
          </div>
        )}
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search ID, Name, Analysis..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 pr-3 py-1.5 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <FaSearch className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400 w-3.5 h-3.5" />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-1.5 w-full border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="accepted">Accepted</option>
          <option value="in progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="declined">Declined</option>
        </select>
      </div>
    </div>
  );
} 