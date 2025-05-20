import React from "react";
import { FaSearch, FaDownload } from 'react-icons/fa';

export default function ReportsToolbar({
  title,
  onExport,
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  dateSort,
  setDateSort,
  filterOptions
}) {
  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <button
          onClick={onExport}
          className="ml-2 px-3 py-2 border border-gray-200 rounded-lg bg-white text-gray-700 text-sm font-medium flex items-center gap-2 transition-colors duration-150 hover:bg-gray-50 hover:border-gray-300"
        >
          <FaDownload className="w-4 h-4" />
          Export
        </button>
      </div>
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FaSearch className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            className="pl-10 pr-4 py-2 w-[300px] border border-gray-200 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Search appointments..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={filterType}
          onChange={e => setFilterType(e.target.value)}
          className="border border-gray-200 rounded-lg py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          <option value="all">All Test Types</option>
          {filterOptions.map(opt => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </select>
        <select
          value={dateSort}
          onChange={e => setDateSort(e.target.value)}
          className="border border-gray-200 rounded-lg py-2 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
      </div>
    </>
  );
} 