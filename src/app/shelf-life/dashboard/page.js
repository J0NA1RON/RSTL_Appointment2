"use client";

import { useState } from "react";
import DashboardNav from "@/app/components/shared/DashboardNav";
import DashboardSidebar from "@/app/components/shared/DashboardSidebar";
import AdminLayout from "@/app/components/shared/AdminLayout";

const dummyAppointments = [
  {
    id: 1,
    productName: "Organic Fruit Juice",
    company: "Natural Foods Inc.",
    weight: "500ml",
    requestDate: "4/1/2025",
    status: "Pending",
    contactPerson: "John Smith"
  },
  {
    id: 2,
    productName: "Vitamin Supplement",
    company: "HealthPlus Co.",
    weight: "60 tablets",
    requestDate: "3/28/2025",
    status: "In Progress",
    contactPerson: "Sarah Johnson"
  },
  {
    id: 3,
    productName: "Canned Vegetables",
    company: "Green Valley Foods",
    weight: "400g",
    requestDate: "3/30/2025",
    status: "Pending",
    contactPerson: "Emily Chen"
  }
];

const StatusCard = ({ title, count, icon, color, textColor, borderColor }) => {
  return (
    <div className={`p-6 rounded-xl border ${borderColor} ${color} transition-all duration-200 hover:shadow-md`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className={`text-2xl font-semibold mt-2 ${textColor}`}>{count}</p>
        </div>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${color}`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

const StatusBadge = ({ status }) => {
  const statusStyles = {
    Pending: "bg-yellow-50 text-yellow-800 border-yellow-200",
    "In Progress": "bg-blue-50 text-blue-800 border-blue-200",
    Completed: "bg-green-50 text-green-800 border-green-200",
    Declined: "bg-red-50 text-red-800 border-red-200",
    Cancelled: "bg-gray-50 text-gray-800 border-gray-200"
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm border ${statusStyles[status]}`}>
      {status}
    </span>
  );
};

export default function ShelfLifePage() {
  const [appointments] = useState(dummyAppointments);

  return (
    <AdminLayout>
      <div className="h-screen flex flex-col">
        <DashboardNav />
        <div className="flex flex-1 overflow-hidden">
          <DashboardSidebar />
          <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold text-gray-900">Shelf Life Testing Dashboard</h1>
              <p className="text-sm text-gray-500">Overview of product shelf life testing appointments</p>
            </div>

            {/* Status Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-6 mb-6">
              <StatusCard
                title="Pending Tests"
                count="2"
                color="bg-yellow-50"
                textColor="text-yellow-700"
                borderColor="border-yellow-100"
                icon={
                  <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
              <StatusCard
                title="In Progress" 
                count="1"
                color="bg-blue-50"
                textColor="text-blue-700"
                borderColor="border-blue-100"
                icon={
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                }
              />
              <StatusCard
                title="Completed"
                count="0"
                color="bg-green-50"
                textColor="text-green-700"
                borderColor="border-green-100"
                icon={
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
            </div>

            <div className="grid grid-cols-1 gap-6">
              {/* Calendar Card */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                <div className="text-center mb-4">
                  <h3 className="text-base font-medium">April 2025</h3>
                  <p className="text-sm text-gray-500">Calendar view of testing appointments</p>
                </div>
                <div className="grid grid-cols-7 text-sm">
                  <div className="text-center p-2">Su</div>
                  <div className="text-center p-2">Mo</div>
                  <div className="text-center p-2">Tu</div>
                  <div className="text-center p-2">We</div>
                  <div className="text-center p-2">Th</div>
                  <div className="text-center p-2">Fr</div>
                  <div className="text-center p-2">Sa</div>
                  <div className="text-center p-2 text-gray-400">31</div>
                  {Array.from({ length: 30 }, (_, i) => (
                    <div
                      key={i + 1}
                      className={`text-center p-2 ${
                        [1, 28, 30].includes(i + 1)
                          ? "text-blue-600 bg-blue-50 rounded"
                          : ""
                      }`}
                    >
                      {i + 1}
                    </div>
                  ))}
                </div>
              </div>

              {/* Appointments Table */}
              <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                  <h2 className="text-lg font-medium">Upcoming Appointments</h2>
                  <p className="text-sm text-gray-500">Next scheduled testing appointments</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-200">
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Weight</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {appointments.map((appointment) => (
                        <tr key={appointment.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {appointment.contactPerson}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {appointment.productName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {appointment.company}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {appointment.weight}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {appointment.requestDate}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={appointment.status} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </AdminLayout>
  );
} 