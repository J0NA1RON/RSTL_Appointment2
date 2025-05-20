"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import DashboardNav from "@/components/layout/DashboardNav";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import ReportsStatsCards from "@/components/shared/ReportsStatsCards";
import ReportsToolbar from "@/components/shared/ReportsToolbar";
import ReportsAppointmentsTable from "@/components/shared/ReportsAppointmentsTable";
import * as XLSX from "xlsx";

export default function ReportsPage() {
  const [completedCount, setCompletedCount] = useState(0);
  const [declinedCount, setDeclinedCount] = useState(0);
  const [cancelledCount, setCancelledCount] = useState(0);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [dateSort, setDateSort] = useState("newest");

  useEffect(() => {
    async function fetchReports() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/appointments/metrology");
        const data = await res.json();
        if (data.success) {
          const reports = data.data || [];
          setCompletedCount(reports.filter(r => r.status === 'completed').length);
          setDeclinedCount(reports.filter(r => r.status === 'declined').length);
          setCancelledCount(reports.filter(r => r.status === 'cancelled').length);
          setReports(reports);
        } else {
          setError(data.message || "Failed to load reports");
        }
      } catch (err) {
        setError(err.message || "Failed to load reports");
      } finally {
        setLoading(false);
      }
    }
    fetchReports();
  }, []);

  // Normalize reports for the table
  const normalizedReports = reports.map(report => ({
    ...report,
    date: report.appointment_date || '',
    client: {
      name: report.customer_name || '',
      organization: report.organization || '',
    },
    sample: report.name_of_samples || '',
    sampleDetails: { laboratory: 'Metrology' },
  }));

  // Filter and sort reports (basic example)
  const filteredReports = normalizedReports.filter(r => {
    if (filterType === "all") return true;
    return r.status === filterType;
  }).filter(r => {
    if (!searchTerm) return true;
    return r.client.name.toLowerCase().includes(searchTerm.toLowerCase());
  }).sort((a, b) => {
    if (dateSort === "newest") return new Date(b.date) - new Date(a.date);
    return new Date(a.date) - new Date(b.date);
  });

  const handleExport = () => {
    // Prepare data for export (only visible columns)
    const exportData = filteredReports.map(r => ({
      ID: r.id,
      Date: r.date || r.appointment_date || '',
      Organization: r.client.organization || '',
      Customer: r.client.name || '',
      "Sample Name": r.sample || '',
      "Type of Test": r.type_of_test || '',
      Liters: r.number_of_liters || '',
      "Truck Plate": r.truck_plate_number || '',
      Status: r.status || '',
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Reports");
    XLSX.writeFile(wb, "metrology_reports.xlsx");
  };

  return (
    <AdminLayout>
      <div className="h-screen flex flex-col">
        <DashboardNav />
        <div className="flex flex-1 min-h-0">
          <DashboardSidebar />
          <main className="flex-1 min-h-0 overflow-auto bg-gray-100 p-5 flex flex-col gap-6">
            <div className="flex flex-col gap-4 min-h-0 h-full">
              <ReportsStatsCards completedCount={completedCount} declinedCount={declinedCount} cancelledCount={cancelledCount} />
              <ReportsToolbar
                title="Reports"
                onExport={handleExport}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterType={filterType}
                setFilterType={setFilterType}
                dateSort={dateSort}
                setDateSort={setDateSort}
                filterOptions={["All", "Completed", "Declined", "Cancelled"]}
              />
              <div className="flex-1 min-h-0">
                <ReportsAppointmentsTable
                  appointments={filteredReports}
                  getStatusColor={status => {
                    switch (status?.toLowerCase()) {
                      case 'completed': return { bgClass: 'bg-green-100', textClass: 'text-green-800' };
                      case 'declined': return { bgClass: 'bg-red-100', textClass: 'text-red-800' };
                      case 'cancelled': return { bgClass: 'bg-gray-100', textClass: 'text-gray-800' };
                      default: return { bgClass: 'bg-blue-100', textClass: 'text-blue-700' };
                    }
                  }}
                  onViewDetails={() => {}}
                  loading={loading}
                  error={error}
                />
              </div>
            </div>
          </main>
        </div>
      </div>
    </AdminLayout>
  );
} 