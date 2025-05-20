import React from "react";
import DashboardNav from "@/components/layout/DashboardNav";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import AdminLayout from "@/components/layout/AdminLayout";

export default function CalendarDashboardLayout({
  leftColumn,
  rightColumn,
  modal,
  filters,
}) {
  return (
    <AdminLayout>
      <div className="h-screen flex flex-col">
        <DashboardNav />
        <div className="flex flex-1 overflow-hidden">
          <DashboardSidebar />
          <main className="flex-1 bg-gray-100 p-4 flex flex-col lg:flex-row gap-4">
            {/* Left Column: Calendar, Quick Info, Filters */}
            <div className="w-full lg:w-80 xl:w-96 flex-shrink-0 flex flex-col gap-4 max-h-screen overflow-y-auto">
              {leftColumn}
            </div>
            {/* Right Column: Filters (top) & Table/Controls */}
            <div className="flex-1 flex flex-col gap-4 min-w-0">
              {filters && <div>{filters}</div>}
              {rightColumn}
            </div>
          </main>
        </div>
        {/* Modal (if any) */}
        {modal}
      </div>
    </AdminLayout>
  );
} 