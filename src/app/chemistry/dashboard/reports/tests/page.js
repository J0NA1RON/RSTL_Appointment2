"use client";

import React, { useEffect, useState } from 'react';
import ReportsDashboardLayout from '@/components/layout/ReportsDashboardLayout';
import ReportsToolbar from '@/components/shared/ReportsToolbar';
import ReportsStatsCards from '@/components/shared/ReportsStatsCards';
import ReportsAppointmentsTable from '@/components/shared/ReportsAppointmentsTable';
import SampleDetailsModal from '@/components/shared/SampleDetailsModal';
import * as XLSX from "xlsx";

export default function ChemistryReportsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [dateSort, setDateSort] = useState('newest');
  const [selectedSample, setSelectedSample] = useState(null);
  const [activeTab, setActiveTab] = useState('sample-details');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch('/api/appointments?category=chemistry');
        const json = await res.json();
        if (json.success) {
          setAppointments(json.data);
        } else {
          setAppointments([]);
        }
      } catch (error) {
        setAppointments([]);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  // Compute stats
  const completedCount = appointments.filter(a => a.status && a.status.toLowerCase() === 'completed').length;
  const declinedCount = appointments.filter(a => a.status && a.status.toLowerCase() === 'declined').length;
  const cancelledCount = appointments.filter(a => a.status && a.status.toLowerCase() === 'cancelled').length;

  const getStatusColor = (status) => {
    if (!status) return 'bg-gray-100 text-gray-800';
    const s = status.toLowerCase();
    if (s === 'completed') return 'bg-green-100 text-green-800';
    if (s === 'declined') return 'bg-red-100 text-red-800';
    if (s === 'cancelled') return 'bg-gray-100 text-gray-800';
    return 'bg-gray-100 text-gray-800';
  };

  const sortByDate = (a, b) => {
    const dateA = new Date(a.date);
    const dateB = new Date(b.date);
    return dateSort === 'newest' ? dateB - dateA : dateA - dateB;
  };

  const filterOptions = Array.from(new Set(appointments.map(a => a.services))).filter(Boolean);

  const filteredAppointments = appointments
    .filter(item => {
      const matchesSearch = 
        (item.customer_name && item.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.company_name && item.company_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.name_of_samples && item.name_of_samples.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (item.services && item.services.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesFilter = filterType === 'all' || (item.services && item.services.toLowerCase() === filterType.toLowerCase());
      return matchesSearch && matchesFilter;
    })
    .sort(sortByDate);

  const handleViewDetails = (sample) => {
    setSelectedSample(sample);
    setActiveTab('sample-details');
  };

  const handleExport = () => {
    // Prepare data for export (all visible columns in the table)
    if (!filteredAppointments.length) return;
    const columns = [
      { key: 'appointment_date', label: 'Date' },
      { key: 'status', label: 'Status' },
      { key: 'customer_name', label: 'Client' },
      { key: 'customer_email', label: 'Email' },
      { key: 'contact_number', label: 'Phone' },
      { key: 'company_name', label: 'Org' },
      { key: 'sex', label: 'Sex' },
      { key: 'name_of_samples', label: 'Sample' },
      { key: 'sample_type', label: 'Type' },
      { key: 'sample_quantity', label: 'Qty' },
      { key: 'sample_description', label: 'Description' },
      { key: 'services', label: 'Analysis' },
      { key: 'parameters', label: 'Params' },
      { key: 'delivery_type', label: 'Delivery' },
    ];
    const exportData = filteredAppointments.map(row => {
      const obj = {};
      columns.forEach(col => {
        obj[col.label] = row[col.key];
      });
      return obj;
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Chemistry Test Reports");
    XLSX.writeFile(wb, "chemistry_test_reports.xlsx");
  };

  if (loading) {
    return (
      <ReportsDashboardLayout
        toolbar={null}
        statsCards={null}
        mainContent={<div className="flex items-center justify-center h-full text-lg text-gray-600">Loading chemistry test reports...</div>}
        sidePanel={null}
      />
    );
  }

  return (
    <ReportsDashboardLayout
      toolbar={
        <ReportsToolbar
          title="Appointment History"
          onExport={handleExport}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterType={filterType}
          setFilterType={setFilterType}
          dateSort={dateSort}
          setDateSort={setDateSort}
          filterOptions={filterOptions}
        />
      }
      statsCards={
        <ReportsStatsCards
          completedCount={completedCount}
          declinedCount={declinedCount}
          cancelledCount={cancelledCount}
        />
      }
      mainContent={
        <ReportsAppointmentsTable
          appointments={filteredAppointments}
          getStatusColor={getStatusColor}
          onViewDetails={handleViewDetails}
          columns={[
            { key: 'appointment_date', label: 'Date' },
            { key: 'status', label: 'Status' },
            { key: 'customer_name', label: 'Client' },
            { key: 'customer_email', label: 'Email', className: 'hidden md:table-cell' },
            { key: 'contact_number', label: 'Phone', className: 'hidden lg:table-cell' },
            { key: 'company_name', label: 'Org', className: 'hidden md:table-cell' },
            { key: 'sex', label: 'Sex', className: 'hidden lg:table-cell' },
            { key: 'name_of_samples', label: 'Sample' },
            { key: 'sample_type', label: 'Type', className: 'hidden md:table-cell' },
            { key: 'sample_quantity', label: 'Qty', className: 'hidden md:table-cell' },
            { key: 'sample_description', label: 'Description', className: 'hidden lg:table-cell' },
            { key: 'services', label: 'Analysis' },
            { key: 'parameters', label: 'Params', className: 'hidden md:table-cell' },
            { key: 'delivery_type', label: 'Delivery', className: 'hidden md:table-cell' },
          ]}
        />
      }
      sidePanel={null}
    >
      <SampleDetailsModal
        isOpen={!!selectedSample}
        sample={selectedSample}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onClose={() => setSelectedSample(null)}
      />
    </ReportsDashboardLayout>
  );
} 