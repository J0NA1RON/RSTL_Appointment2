import React from "react";

export default function ConsultancyReportsStatsCards({ accepted, declined, thesisDissertation, industryResearch }) {
  return (
    <div className="grid grid-cols-3 gap-4 mb-6">
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Accepted Consultations</h3>
        <div className="flex justify-between items-end">
          <p className="text-2xl font-bold text-green-600">{accepted}</p>
          <div className="text-right">
            <p className="text-sm text-green-600">Completed</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Declined Consultations</h3>
        <div className="flex justify-between items-end">
          <p className="text-2xl font-bold text-red-600">{declined}</p>
          <div className="text-right">
            <p className="text-sm text-red-600">Cancelled</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
        <h3 className="text-sm font-medium text-gray-600 mb-2">Research Types</h3>
        <div className="flex justify-between items-end">
          <div>
            <p className="text-sm text-gray-600">Thesis/Dissertation</p>
            <p className="text-xl font-bold text-gray-900">{thesisDissertation}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Industry Research</p>
            <p className="text-xl font-bold text-gray-900">{industryResearch}</p>
          </div>
        </div>
      </div>
    </div>
  );
} 