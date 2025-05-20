"use client";

import React, { useState, useEffect, useCallback } from 'react';
import ConsultancyDashboardLayout from '@/components/layout/ConsultancyDashboardLayout';
import AcceptedAppointmentsList from '@/components/shared/AcceptedAppointmentsList';
import ConsultancyAppointmentsTable from '@/components/shared/ConsultancyAppointmentsTable';
import ConsultationModal from '@/components/shared/ConsultationModal';
import DeclineModal from '@/components/shared/DeclineModal';

const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'pending': return { bgClass: 'bg-yellow-100', textClass: 'text-yellow-800', dotClass: 'bg-yellow-500' };
    case 'accepted': return { bgClass: 'bg-green-100', textClass: 'text-green-800', dotClass: 'bg-green-500' };
    case 'declined': return { bgClass: 'bg-red-100', textClass: 'text-red-800', dotClass: 'bg-red-500' };
    default: return { bgClass: 'bg-gray-100', textClass: 'text-gray-800', dotClass: 'bg-gray-500' };
  }
};

export default function ConsultancyPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeclineModalOpen, setIsDeclineModalOpen] = useState(false);
  const [appointmentToDecline, setAppointmentToDecline] = useState(null);
  const [filterStatus, setFilterStatus] = useState('All');
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchConsultations = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/appointments/research-consultation?type=consultancy');
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      if (data.success) {
        const mapped = (Array.isArray(data.data) ? data.data : []).map(apt => ({
          id: apt.id,
          date: apt.date,
          customer: apt.customer,
          organization: apt.organization,
          researchTopic: apt.researchTopic,
          researchStage: apt.researchStage,
          status: apt.status,
          ...apt
        }));
        setAppointments(mapped);
      } else {
        throw new Error(data.message || 'Failed to fetch consultations');
      }
    } catch (err) {
      setError(err.message);
      setAppointments([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchConsultations();
  }, [fetchConsultations]);

  const handleStatusUpdate = async (appointmentId, newStatus, declineReason = null) => {
    if (!appointmentId || !newStatus) return;
    try {
      const bodyPayload = { status: newStatus };
      const response = await fetch(`/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bodyPayload),
      });
      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `Failed to update status (${response.status})`);
      }
      fetchConsultations();
    } catch (err) {
      alert(`Error updating status: ${err.message}`);
    }
  };

  const handleViewDetails = (appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const handleAccept = (appointment) => {
    if (!appointment || !appointment.id) return;
    handleStatusUpdate(appointment.id, 'accepted');
    if (isModalOpen) setIsModalOpen(false);
  };

  const handleDeclineClick = (appointment) => {
    if (!appointment || !appointment.id) return;
    setAppointmentToDecline(appointment);
    if (isModalOpen) setIsModalOpen(false);
    setIsDeclineModalOpen(true);
  };

  const handleConfirmDecline = (reason) => {
    if (!appointmentToDecline || !appointmentToDecline.id) return;
    handleStatusUpdate(appointmentToDecline.id, 'declined', reason);
    setAppointmentToDecline(null);
    setIsDeclineModalOpen(false);
  };

  const safeAppointments = Array.isArray(appointments) ? appointments : [];
  const acceptedAppointments = safeAppointments.filter(apt => apt.status === 'accepted');
  const filteredAppointments = safeAppointments.filter(apt => {
    if (filterStatus !== 'All' && apt.status?.toLowerCase() !== filterStatus.toLowerCase()) return false;
    const lowerSearchTerm = searchTerm.toLowerCase();
    if (searchTerm && !(
        apt.name?.toLowerCase().includes(lowerSearchTerm) ||
        apt.organization?.toLowerCase().includes(lowerSearchTerm) ||
        apt.researchType?.toLowerCase().includes(lowerSearchTerm) ||
      apt.status?.toLowerCase().includes(lowerSearchTerm)
    )) return false;
    return true;
  });

  return (
    <ConsultancyDashboardLayout
      acceptedAppointmentsList={
        <AcceptedAppointmentsList
          acceptedAppointments={acceptedAppointments}
          loading={loading}
          error={error}
          getStatusColor={getStatusColor}
          onViewDetails={handleViewDetails}
        />
      }
      mainTableArea={
        <ConsultancyAppointmentsTable
          filteredAppointments={filteredAppointments}
          loading={loading}
          error={error}
          getStatusColor={getStatusColor}
          onAccept={handleAccept}
          onDecline={handleDeclineClick}
          onViewDetails={handleViewDetails}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
        />
      }
    >
      <ConsultationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        consultation={selectedAppointment}
        onAccept={() => handleAccept(selectedAppointment)}
        onDecline={() => handleDeclineClick(selectedAppointment)}
      />
      <DeclineModal
        isOpen={isDeclineModalOpen}
        onClose={() => setIsDeclineModalOpen(false)}
        onConfirm={handleConfirmDecline}
      />
    </ConsultancyDashboardLayout>
  );
} 