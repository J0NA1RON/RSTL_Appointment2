"use client";

import React, { useState, useEffect } from 'react';
import ServicesDashboardLayout from '@/components/layout/ServicesDashboardLayout';
import ServicesToolbar from '@/components/shared/ServicesToolbar';
import ServicesGroupedTable from '@/components/shared/ServicesGroupedTable';
import DeleteModal from '@/components/shared/DeleteModal';
import ConfirmModal from '@/components/shared/ConfirmModal';

// Add this Toggle Switch component at the top level of the file
function ToggleSwitch({ enabled, onChange, activeColor = "bg-blue-600", inactiveColor = "bg-gray-200" }) {
  return (
    <button
      type="button"
      className={`${enabled ? activeColor : inactiveColor} relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
      role="switch"
      aria-checked={enabled}
      onClick={() => onChange(!enabled)}
    >
      <span
        className={`${
          enabled ? 'translate-x-5' : 'translate-x-0'
        } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  );
}

// Sample type options
const SAMPLE_TYPE_OPTIONS = [
  'Food',
  'Water and Wastewater',
  'Plant and Plant Extracts',
  'Packages',
  'Others',
  'Uncategorized'
];

export default function ServicesPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editedService, setEditedService] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [modalMessage, setModalMessage] = useState('');
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [groupedServices, setGroupedServices] = useState({});
  const [expandedSampleType, setExpandedSampleType] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch services on component mount
  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/chemistry/services');
      const data = await response.json();
      
      if (data.success) {
        setServices(data.data.map(service => ({
          id: service.id,
          testType: service.test_type || '',
          testDescription: service.test_description || '',
          pricing: parseFloat(service.pricing) || 0,
          appointment: service.appointment || 'Allowed',
          status: service.active ? 'Active' : 'Inactive',
          sampleType: service.sample_type || 'Uncategorized',
        })));
        // Group by sampleType
        const grouped = {};
        data.data.forEach(service => {
          const sampleType = service.sample_type || 'Uncategorized';
          if (!grouped[sampleType]) grouped[sampleType] = [];
          grouped[sampleType].push({
            id: service.id,
            testType: service.test_type || '',
            testDescription: service.test_description || '',
            pricing: parseFloat(service.pricing) || 0,
            appointment: service.appointment || 'Allowed',
            status: service.active ? 'Active' : 'Inactive',
            sampleType: sampleType,
          });
        });
        setGroupedServices(grouped);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to fetch services');
      console.error('Error fetching services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (service) => {
    setEditingId(service.id);
    setEditedService({ 
      ...service,
      pricing: parseFloat(service.pricing) || 0
    });
  };

  const handleAddNew = () => {
    const newService = {
      id: 'new',
      testType: '',
      testDescription: '',
      pricing: 0,
      appointment: 'Allowed',
      status: 'Active',
      sampleType: 'Uncategorized',
    };
    setEditedService(newService);
    setEditingId('new');
    setShowAddModal(true);
  };

  const handleChange = (field, value) => {
    setEditedService(prev => ({ ...prev, [field]: value }));
  };

  const handleSaveService = async () => {
    if (!editedService.testType?.trim() || !editedService.testDescription?.trim()) {
      setModalType('emptySave');
      setModalMessage('Are you sure you want to save service without information?');
      return;
    }

    try {
      const response = await fetch('/api/chemistry/services', {
        method: editingId === 'new' ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingId === 'new' ? undefined : editingId,
          testType: editedService.testType.trim(),
          testDescription: editedService.testDescription.trim(),
          pricing: parseFloat(editedService.pricing) || 0,
          appointment: editedService.appointment,
          active: editedService.status === 'Active',
          sampleType: editedService.sampleType || 'Uncategorized',
        }),
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchServices();
        setEditingId(null);
        setEditedService(null);
        setModalType(null);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to save service');
      console.error('Error saving service:', error);
    }
  };

  const handleCancelEdit = () => {
    if (
      editingId === 'new' && 
      !editedService.testType?.trim() && 
      !editedService.testDescription?.trim()
    ) {
      // If it's a new service and empty, just cancel without confirmation
      setEditingId(null);
      setEditedService(null);
      setModalType(null);
    } else {
      setModalType('cancel');
      setModalMessage('Are you sure you want to cancel changes?');
    }
  };

  const handleDeleteClick = (service) => {
    setServiceToDelete(service);
    setDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const response = await fetch(`/api/chemistry/services?id=${serviceToDelete.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();
      
      if (data.success) {
        await fetchServices();
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to delete service');
      console.error('Error deleting service:', error);
    } finally {
      setDeleteModal(false);
      setServiceToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal(false);
    setServiceToDelete(null);
  };

  const handleModalConfirm = () => {
    switch (modalType) {
      case 'save':
      case 'emptySave':
        handleSaveService();
        break;
      case 'cancel':
      case 'emptyCancel':
        setEditingId(null);
        setEditedService(null);
        setModalType(null);
        break;
    }
  };

  const handleModalCancel = () => {
    setModalType(null);
  };

  const activeTests = services.filter(service => service.status === 'Active').length;
  const totalTests = services.length;
  const typeOptions = Array.from(new Set(services.map(s => s.testType))).filter(Boolean);

  const filteredServices = services.filter(service => {
    const matchesSearch = 
      service.testType?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || service.testType?.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const handleAddModalSave = async () => {
    await handleSaveService();
    setShowAddModal(false);
  };

  const handleAddModalCancel = () => {
    setEditingId(null);
    setEditedService(null);
    setShowAddModal(false);
  };

  if (loading) {
    return (
      <ServicesDashboardLayout
        toolbar={null}
        table={<div className="flex items-center justify-center h-full text-lg text-gray-600">Loading chemistry services...</div>}
      />
    );
  }

  return (
    <ServicesDashboardLayout
      toolbar={
        <ServicesToolbar
          title="Manage Sample Tests"
          onAdd={handleAddNew}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          filterType={filterType}
          setFilterType={setFilterType}
          stats={{ total: totalTests, active: activeTests }}
          typeOptions={typeOptions}
        />
      }
      table={
        <ServicesGroupedTable
          groupedServices={groupedServices}
          expandedSampleType={expandedSampleType}
          setExpandedSampleType={setExpandedSampleType}
          editingId={editingId}
          editedService={editedService}
          onEdit={handleEdit}
          onChange={handleChange}
          onSave={handleSaveService}
          onCancel={handleCancelEdit}
          onDeleteClick={handleDeleteClick}
          SAMPLE_TYPE_OPTIONS={SAMPLE_TYPE_OPTIONS}
        />
      }
    >
      <DeleteModal
        isOpen={deleteModal}
        testType={serviceToDelete?.testType}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />
      <ConfirmModal
        isOpen={!!modalType}
        title="Confirm Action"
        message={modalMessage}
        onCancel={handleModalCancel}
        onConfirm={handleModalConfirm}
      />
      {error && (
        <div className="fixed top-0 left-0 right-0 p-4 bg-red-100 text-red-700 z-50 flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-2 text-red-500 hover:text-red-700">&times;</button>
        </div>
      )}
    </ServicesDashboardLayout>
  );
}