import React from "react";
import DashboardNav from "@/components/layout/DashboardNav";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import AdminLayout from "@/components/layout/AdminLayout";

export default function ConsultancyDashboardLayout({
  acceptedAppointmentsList,
  mainTableArea,
  children
}) {
  return (
    <AdminLayout>
      <div className="h-screen flex flex-col">
        <DashboardNav />
        <div className="flex flex-1 overflow-hidden">
          <DashboardSidebar />
          <main className="flex-1 bg-gray-100 p-4 lg:p-6 flex flex-col md:flex-row gap-6">
            {/* Left Column: Accepted Appointments List */}
            <div className="w-full md:w-1/3 lg:w-1/4 flex-shrink-0">
              {acceptedAppointmentsList}
            </div>
            {/* Right Column: Main Table Area */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
              {mainTableArea}
            </div>
          </main>
        </div>
      </div>
      {children}
    </AdminLayout>
  );
} 