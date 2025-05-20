'use client';

import { useState } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/20/solid';

export default function ServiceSelection({ 
  appointment, 
  onServiceTabChange, 
  onServiceSelection,
  onShelfLifeServiceChange,
  onSearchChange,
  onContinueToShelfLife,
  servicesData,
  servicesLoading,
  servicesError,
  errors,
  disabled = false
}) {
  const [expandedCategories, setExpandedCategories] = useState({});
  const [expandedSampleType, setExpandedSampleType] = useState(null);

  if (servicesLoading) {
    return <div className="p-8 text-center text-gray-500">Loading services...</div>;
  }
  if (servicesError) {
    return <div className="p-8 text-center text-red-500">{servicesError}</div>;
  }
  if (!servicesData || Object.keys(servicesData).length === 0) {
    return <div className="p-8 text-center text-gray-500">No services available.</div>;
  }

  // Map tab keys to categories
  const tabMap = {
    chemical: 'chemistry',
    microbiological: 'microbiology',
    shelflife: 'shelf_life',
  };

  const currentCategory = tabMap[appointment.currentServiceTab];
  const currentServices = servicesData[currentCategory] || [];

  // For shelf life, show as checkboxes; for others, show as radio/select
  return (
    <div className="bg-gray-50 rounded-xl border border-gray-200 overflow-hidden">
      {/* Service Header */}
      <div className="bg-blue-600 p-8">
        <h3 className="text-2xl font-semibold text-white mb-2">
          {appointment.currentServiceTab === 'chemical' && 'Chemical Analysis'}
          {appointment.currentServiceTab === 'microbiological' && 'Microbiological Tests'}
          {appointment.currentServiceTab === 'shelflife' && 'Shelf Life Testing'}
        </h3>
        <p className="text-blue-100">
          {appointment.currentServiceTab === 'chemical' && 'Select chemical analysis services for your sample.'}
          {appointment.currentServiceTab === 'microbiological' && 'Select microbiological tests for your sample.'}
          {appointment.currentServiceTab === 'shelflife' && 'Select shelf life testing services for your product.'}
        </p>
      </div>

      {/* Service Type Tabs */}
      <div className="p-8">
        <div className="mb-6 border-b border-gray-200">
          <div className="flex space-x-4">
            {['chemical', 'microbiological', 'shelflife'].map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={(e) => { e.preventDefault(); onServiceTabChange(tab); }}
                className={`px-4 py-2 text-sm font-medium border-b-2 ${
                  appointment.currentServiceTab === tab
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
                disabled={disabled}
              >
                {tab === 'chemical' ? 'Chemical Analysis' :
                 tab === 'microbiological' ? 'Microbiological Tests' :
                 'Shelf Life Testing'}
              </button>
            ))}
          </div>
        </div>

        {/* Service List */}
        {appointment.currentServiceTab === 'shelflife' ? (
          <div className="bg-blue-50 p-6 rounded-lg">
            <h3 className="text-lg font-medium text-blue-900 mb-2">Shelf Life Testing</h3>
            <p className="text-sm text-blue-700 mb-6">Select the required testing services for shelf life analysis</p>
            <div className="space-y-4">
              {currentServices.map((service) => (
                <label key={service.id} className={`flex items-start p-4 bg-white rounded-lg shadow-sm ${disabled ? 'opacity-75' : ''}`}>
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      checked={!!appointment.shelfLifeServices[service.id]}
                      onChange={(e) => onShelfLifeServiceChange(service.id)}
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                      required={false}
                      disabled={disabled}
                    />
                  </div>
                  <div className="ml-3 flex-grow">
                    <div className="flex justify-between items-start">
                      <span className="text-sm font-medium text-gray-900">{service.name}</span>
                      <span className="text-sm font-medium text-blue-600">{service.price}</span>
                    </div>
                    <p className="text-sm text-gray-500">{service.description}</p>
                  </div>
                </label>
              ))}
            </div>
            {errors.shelfLifeServices && (
              <p className="mt-2 text-sm text-red-600">{errors.shelfLifeServices}</p>
            )}
            {Object.values(appointment.shelfLifeServices || {}).some(Boolean) && (
              <div className="mt-6">
                <button
                  type="button"
                  onClick={onContinueToShelfLife}
                  className="w-full px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={disabled}
                >
                  Continue to Shelf Life Details
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Search Box */}
            <div className="mb-6">
              <input
                type="text"
                placeholder="Search services..."
                value={appointment.searchQuery}
                onChange={onSearchChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:bg-gray-100"
                disabled={disabled}
              />
            </div>
            {/* Group services by sample_type */}
            {Object.entries(
              currentServices
                .filter(service => !!service.sample_type)
                .filter(service => {
                  const q = (appointment.searchQuery || '').toLowerCase();
                  return (
                    service.name?.toLowerCase().includes(q) ||
                    service.description?.toLowerCase().includes(q)
                  );
                })
                .reduce((acc, service) => {
                  const sampleType = service.sample_type;
                  if (!acc[sampleType]) acc[sampleType] = [];
                  acc[sampleType].push(service);
                  return acc;
                }, {})
            ).map(([sampleType, services]) => (
              <div key={sampleType} className="mb-4 border rounded-lg bg-white">
                <button
                  type="button"
                  className="w-full flex items-center justify-between px-4 py-3 text-left text-lg font-semibold text-blue-700 hover:bg-blue-50 focus:outline-none"
                  onClick={() => setExpandedSampleType(expandedSampleType === sampleType ? null : sampleType)}
                >
                  <span>{sampleType}</span>
                  {expandedSampleType === sampleType ? (
                    <ChevronDownIcon className="h-5 w-5" />
                  ) : (
                    <ChevronRightIcon className="h-5 w-5" />
                  )}
                </button>
                {expandedSampleType === sampleType && (
                  <div className="p-4 space-y-2">
                    {services.map((service) => (
                      <label key={service.id} className={`flex items-start p-4 bg-gray-50 rounded-lg shadow-sm ${disabled ? 'opacity-75' : ''}`}>
                <div className="flex items-center h-5">
                  <input
                    type="checkbox"
                    checked={appointment.selectedServices.includes(service.id)}
                    onChange={() => onServiceSelection(service.id)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 disabled:opacity-50"
                    disabled={disabled}
                  />
                </div>
                <div className="ml-3 flex-grow">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-gray-900">{service.name}</span>
                    <span className="text-sm font-medium text-blue-600">{service.price}</span>
                  </div>
                  <p className="text-sm text-gray-500">{service.description}</p>
                </div>
              </label>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 