import React from "react";
import DashboardNav from "@/components/layout/DashboardNav";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import AdminLayout from "@/components/layout/AdminLayout";

export default function ReportsDashboardLayout({
  toolbar,
  statsCards,
  mainContent,
  sidePanel,
  children
}) {
  return (
    <AdminLayout>
      <div className="h-screen flex flex-col">
        <DashboardNav />
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <DashboardSidebar />
          <main className="flex-1 bg-gray-50 p-8 flex flex-col min-h-0 overflow-hidden">
            {toolbar}
            {statsCards}
            {/* Responsive layout: full width if no sidePanel, grid if sidePanel */}
            {sidePanel ? (
              <div className="grid grid-cols-1 xl:grid-cols-[1fr,300px] gap-6 flex-1 min-h-0 overflow-auto">
                {mainContent}
                {sidePanel}
              </div>
            ) : (
              <div className="flex-1 min-h-0 overflow-auto">
                {mainContent}
              </div>
            )}
          </main>
        </div>
      </div>
      {children}
    </AdminLayout>
  );
} 