import React from "react";

export default function ReportsCompletionStats({ completionStats }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex-shrink-0 max-h-[60vh] overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4">Completion Stats</h2>
      <div className="space-y-4">
        {completionStats.map((stat) => (
          <div key={stat.name}>
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm text-gray-600">{stat.name}</span>
              <span className="text-sm font-medium">{stat.count}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-green-500 h-2 rounded-full"
                style={{ width: `${(stat.count / Math.max(...completionStats.map(s => s.count), 1)) * 100}%` }}
              ></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 