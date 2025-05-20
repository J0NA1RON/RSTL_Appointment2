import React from 'react';

export default function DashboardStats({ stats = {}, statConfig = [] }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {statConfig.map((stat, idx) => (
        <div
          key={stat.key}
          className={`flex items-center bg-white rounded-xl shadow-sm p-4 border border-gray-200 transition-all duration-300 hover:shadow-2xl hover:scale-105 hover:-rotate-1 cursor-pointer ${stat.colorClass || ''}`}
        >
          <div className="mr-4 flex-shrink-0">
            {stat.icon}
          </div>
          <div>
            <div className="text-xs text-gray-500 font-medium mb-1">{stat.label}</div>
            <div className="text-xl font-bold text-gray-900">
              {stats[stat.key] !== undefined ? stats[stat.key] : 0}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
} 