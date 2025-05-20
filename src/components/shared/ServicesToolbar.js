import React from "react";
import { FaPlus, FaSearch } from 'react-icons/fa';

export default function ServicesToolbar({
  title,
  onAdd,
  searchTerm,
  setSearchTerm,
  filterType,
  setFilterType,
  stats,
  typeOptions
}) {
  return (
    <div className="p-5 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{title}</h1>
        <button 
          onClick={onAdd}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors duration-150 border border-green-600 hover:border-green-800"
        >
          <FaPlus className="w-4 h-4" />
          Add New Test
        </button>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex gap-4 items-center">
          <div className="relative">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search test type..."
              className="pl-10 pr-4 py-2 border border-gray-200 rounded-lg w-64 focus:outline-none focus:ring-2 focus:ring-green-500"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="all">All Test Types</option>
            {typeOptions.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>
        <div className="text-gray-600">
          <span>Total Tests: {stats.total}</span>
          <span className="mx-2">|</span>
          <span>Active: {stats.active}</span>
        </div>
      </div>
    </div>
  );
} 