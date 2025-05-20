import React from "react";
import DashboardNav from "@/components/layout/DashboardNav";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import AdminLayout from "@/components/layout/AdminLayout";

export default function ConsultancyReportsDashboardLayout({
  toolbar,
  statsCards,
  mainContent,
  children
}) {
  return (
    <AdminLayout>
      <div className="h-screen flex flex-col">
        <DashboardNav />
        <div className="flex flex-1 min-h-0 overflow-hidden">
          <DashboardSidebar />
          <main className="flex-1 bg-gray-100 p-8 flex flex-col min-h-0 overflow-hidden">
            {toolbar}
            {statsCards}
            <div className="flex-1 min-h-0 overflow-hidden">
              {mainContent}
            </div>
          </main>
        </div>
      </div>
      {children}
    </AdminLayout>
  );
} 