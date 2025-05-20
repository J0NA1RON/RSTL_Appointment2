"use client";
import { useState, useEffect } from "react";
import AdminLayout from "@/components/layout/AdminLayout";
import DashboardNav from "@/components/layout/DashboardNav";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import ServicesToolbar from "@/components/shared/ServicesToolbar";
import ServicesGroupedTable from "@/components/shared/ServicesGroupedTable";
import DeleteModal from "@/components/shared/DeleteModal";
import ConfirmModal from "@/components/shared/ConfirmModal";
import AddEditServiceModal from '@/components/shared/AddEditServiceModal';

export default function ServicesPage() {
  // State for services, editing, modals, etc.
  const [limitDate, setLimitDate] = useState("");
  const [limitValue, setLimitValue] = useState("");
  const [limitStatus, setLimitStatus] = useState(null);
  const [groupedServices, setGroupedServices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedSampleType, setExpandedSampleType] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [editingId, setEditingId] = useState(null);
  const [editedService, setEditedService] = useState(null);
  const [deleteModal, setDeleteModal] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [modalMessage, setModalMessage] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchServices = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/services?category=metrology');
      const data = await response.json();
      if (data.success) {
        // Group by sampleType
        const grouped = {};
        data.data.metrology.forEach(service => {
          const sampleType = service.sample_type || 'Uncategorized';
          if (!grouped[sampleType]) grouped[sampleType] = [];
          grouped[sampleType].push({
            id: service.id,
            testType: service.name || '',
            testDescription: service.description || '',
            pricing: parseFloat(service.price) || 0,
            appointment: service.active ? 'Allowed' : 'Not Allowed',
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleEdit = (service) => {
    setEditingId(service.id);
    setEditedService({ ...service, pricing: parseFloat(service.pricing) || 0 });
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
      let response, data;
      if (editingId === 'new') {
        response = await fetch('/api/services', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: editedService.testType.trim(),
            description: editedService.testDescription.trim(),
            price: parseFloat(editedService.pricing) || 0,
            active: editedService.status === 'Active',
            sample_type: editedService.sampleType || 'Uncategorized',
            category: 'metrology',
          }),
        });
      } else {
        response = await fetch(`/api/services/${editingId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: editedService.testType.trim(),
            description: editedService.testDescription.trim(),
            price: parseFloat(editedService.pricing) || 0,
            active: editedService.status === 'Active',
            sample_type: editedService.sampleType || 'Uncategorized',
            category: 'metrology',
          }),
        });
      }
      data = await response.json();
      if (data.success) {
        await fetchServices();
        setEditingId(null);
        setEditedService(null);
        setModalType(null);
        setShowAddModal(false);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to save service');
    }
  };

  const handleCancelEdit = () => {
    if (editingId === 'new' && !editedService.testType?.trim() && !editedService.testDescription?.trim()) {
      setEditingId(null);
      setEditedService(null);
      setModalType(null);
      setShowAddModal(false);
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
    if (!serviceToDelete) return;
    try {
      const response = await fetch(`/api/services/${serviceToDelete.id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        await fetchServices();
        setDeleteModal(false);
        setServiceToDelete(null);
      } else {
        setError(data.message);
      }
    } catch (error) {
      setError('Failed to delete service');
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModal(false);
    setServiceToDelete(null);
  };

  return (
    <AdminLayout>
      <div className="h-screen flex flex-col">
        <DashboardNav />
        <div className="flex flex-1 min-h-0">
          <DashboardSidebar />
          <main className="flex-1 min-h-0 overflow-auto bg-gray-100 flex flex-col p-5 gap-6">
            <div className="flex flex-col gap-4 min-h-0 h-full">
              <ServicesToolbar
                title="Manage Sample Tests"
                onAdd={handleAddNew}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                filterType={filterType}
                setFilterType={setFilterType}
                stats={{ total: Object.values(groupedServices).flat().length, active: Object.values(groupedServices).flat().filter(s => s.status === 'Active').length }}
                typeOptions={["All", ...Object.keys(groupedServices)]}
              />
              <div className="flex-1 min-h-0">
                {loading ? (
                  <div className="flex items-center justify-center h-full text-gray-500">Loading services...</div>
                ) : error ? (
                  <div className="flex items-center justify-center h-full text-red-600">{error}</div>
                ) : (
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
                    SAMPLE_TYPE_OPTIONS={["Petroleum", "Water", "Soil", "Gas", "Metals", "Liquid", "Uncategorized"]}
                  />
                )}
              </div>
              <DeleteModal isOpen={deleteModal} testType={serviceToDelete?.testType || ''} onCancel={handleDeleteCancel} onConfirm={handleDeleteConfirm} />
              <ConfirmModal isOpen={modalType === 'cancel' || modalType === 'emptySave'} title="Confirm" message={modalMessage} onCancel={() => setModalType(null)} onConfirm={() => { setModalType(null); setEditingId(null); setEditedService(null); setShowAddModal(false); }} />
              {/* Custom Daily Limit UI */}
              <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-md font-semibold text-blue-900 mb-2">Set Custom Daily Liter Limit</h3>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault();
                    setLimitStatus(null);
                    try {
                      const res = await fetch("/api/appointments/metrology/constraints", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ constraint_date: limitDate, daily_liter_capacity: limitValue })
                      });
                      const data = await res.json();
                      if (data.success) {
                        setLimitStatus({ success: true, message: "Custom limit set successfully." });
                      } else {
                        setLimitStatus({ success: false, message: data.message || "Failed to set limit." });
                      }
                    } catch (err) {
                      setLimitStatus({ success: false, message: err.message });
                    }
                  }}
                  className="flex flex-col sm:flex-row gap-2 items-center"
                >
                  <input
                    type="date"
                    value={limitDate}
                    onChange={e => setLimitDate(e.target.value)}
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    required
                  />
                  <input
                    type="number"
                    value={limitValue}
                    onChange={e => setLimitValue(e.target.value)}
                    placeholder="Liters (e.g. 80000)"
                    className="border border-gray-300 rounded-md px-3 py-2 text-sm"
                    min="1"
                    required
                  />
                  <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700">Set Limit</button>
                </form>
                {limitStatus && (
                  <div className={`mt-2 text-sm ${limitStatus.success ? 'text-green-700' : 'text-red-700'}`}>{limitStatus.message}</div>
                )}
              </div>
              {/* Add/Edit Service Modal */}
              <AddEditServiceModal
                isOpen={showAddModal && editingId === 'new'}
                service={editedService}
                onChange={handleChange}
                onSave={handleSaveService}
                onCancel={handleCancelEdit}
                mode="add"
                sampleTypeOptions={["Petroleum", "Water", "Soil", "Gas", "Metals", "Liquid", "Uncategorized"]}
              />
            </div>
          </main>
        </div>
      </div>
    </AdminLayout>
  );
} 