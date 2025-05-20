import React from "react";

export default function ReportsStatsCards({ completedCount, declinedCount, cancelledCount }) {
  return (
    <div className="mb-5 flex-shrink-0">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col items-start transition-colors duration-150 hover:bg-gray-50 hover:border-gray-300">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 inline-block"></span>
            <span className="text-xs font-medium text-gray-500">Completed Tests</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{completedCount}</div>
          <div className="text-xs text-gray-400 mt-1">Last 30 days</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col items-start transition-colors duration-150 hover:bg-gray-50 hover:border-gray-300">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block"></span>
            <span className="text-xs font-medium text-gray-500">Declined Tests</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{declinedCount}</div>
          <div className="text-xs text-gray-400 mt-1">Last 30 days</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex flex-col items-start transition-colors duration-150 hover:bg-gray-50 hover:border-gray-300">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-400 inline-block"></span>
            <span className="text-xs font-medium text-gray-500">Cancelled Tests</span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{cancelledCount}</div>
          <div className="text-xs text-gray-400 mt-1">Last 30 days</div>
        </div>
      </div>
    </div>
  );
} 