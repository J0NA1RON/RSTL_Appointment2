import React from "react";
import DashboardNav from "@/components/layout/DashboardNav";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import AdminLayout from "@/components/layout/AdminLayout";

export default function ServicesDashboardLayout({
  toolbar,
  table,
  children
}) {
  return (
    <AdminLayout>
      <div className="h-screen flex flex-col">
        <DashboardNav />
        <div className="flex flex-1 overflow-hidden">
          <DashboardSidebar />
          <main className="flex-1 bg-gray-100 flex flex-col overflow-hidden">
            {toolbar}
            {table}
          </main>
        </div>
      </div>
      {children}
    </AdminLayout>
  );
} 