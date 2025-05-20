"use client";

export default function LabDashboard({ department }) {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{department} Laboratory Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Appointments Overview */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Appointments Overview</h2>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Today's Appointments</span>
              <span className="font-semibold">0</span>
            </div>
            <div className="flex justify-between">
              <span>Pending Appointments</span>
              <span className="font-semibold">0</span>
            </div>
            <div className="flex justify-between">
              <span>Completed Appointments</span>
              <span className="font-semibold">0</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="space-y-2">
            <p className="text-gray-600">No recent activity</p>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-2">
            <button className="w-full p-2 bg-blue-50 text-blue-700 rounded hover:bg-blue-100">
              Create New Appointment
            </button>
            <button className="w-full p-2 bg-green-50 text-green-700 rounded hover:bg-green-100">
              View All Appointments
            </button>
            <button className="w-full p-2 bg-purple-50 text-purple-700 rounded hover:bg-purple-100">
              Generate Reports
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 