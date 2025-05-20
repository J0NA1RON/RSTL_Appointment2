import React from "react";
import { FaChevronDown, FaChevronRight, FaCheck, FaTimes, FaTrash } from 'react-icons/fa';

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
        className={`$${enabled ? 'translate-x-5' : 'translate-x-0'} pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
      />
    </button>
  );
}

export default function ServicesGroupedTable({
  groupedServices,
  expandedSampleType,
  setExpandedSampleType,
  editingId,
  editedService,
  onEdit,
  onChange,
  onSave,
  onCancel,
  onDeleteClick,
  SAMPLE_TYPE_OPTIONS
}) {
  return (
    <div className="bg-white rounded-lg shadow h-full flex flex-col border-gray-200">
      <div className="overflow-auto">
        {Object.entries(groupedServices).map(([sampleType, servicesList]) => (
          <div key={sampleType} className="mb-6 border rounded-lg bg-gray-50">
            <button
              type="button"
              className="w-full flex items-center justify-between px-6 py-4 text-left text-xl font-semibold text-blue-700 hover:bg-blue-100 focus:outline-none rounded-t-lg"
              onClick={() => setExpandedSampleType(expandedSampleType === sampleType ? null : sampleType)}
            >
              <span>{sampleType}</span>
              {expandedSampleType === sampleType ? (
                <FaChevronDown className="h-5 w-5" />
              ) : (
                <FaChevronRight className="h-5 w-5" />
              )}
            </button>
            {expandedSampleType === sampleType && (
              <div className="p-0">
                <table className="min-w-full">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr className="border-b">
                      <th className="w-1/4 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type of Test</th>
                      <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pricing (₱)</th>
                      <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Appointment</th>
                      <th className="w-32 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      <th className="w-24 px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {servicesList.map((service) => (
                      <tr key={service.id} className="hover:bg-blue-50 hover:border-l-4 hover:border-blue-400 transition-all duration-150 cursor-pointer">
                        <td className="w-1/4 px-6 py-4">
                          {editingId === service.id ? (
                            <div className="space-y-1">
                              <input
                                type="text"
                                className="w-full px-2 py-1 border rounded text-sm"
                                value={editedService.testType}
                                onChange={e => onChange('testType', e.target.value)}
                                placeholder="Enter test type"
                              />
                              <textarea
                                className="w-full px-2 py-1 border rounded text-sm resize-none"
                                value={editedService.testDescription}
                                onChange={e => onChange('testDescription', e.target.value)}
                                rows="2"
                                placeholder="Enter test description"
                              />
                              <select
                                className="w-full px-2 py-1 border rounded text-sm mt-1"
                                value={editedService.sampleType || 'Uncategorized'}
                                onChange={e => onChange('sampleType', e.target.value)}
                              >
                                {SAMPLE_TYPE_OPTIONS.map(option => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                            </div>
                          ) : (
                            <div className="min-h-[70px]">
                              <div className="text-sm font-medium text-gray-900">{service.testType}</div>
                              <div className="text-sm text-gray-500">{service.testDescription || '-'}</div>
                            </div>
                          )}
                        </td>
                        <td className="w-32 px-6 py-4">
                          {editingId === service.id ? (
                            <input
                              type="number"
                              className="w-24 px-2 py-1 border rounded text-sm"
                              value={editedService.pricing || 0}
                              onChange={e => onChange('pricing', parseFloat(e.target.value) || 0)}
                              min="0"
                              step="0.01"
                            />
                          ) : (
                            <span className="text-sm text-gray-900">
                              {typeof service.pricing === 'number' ? service.pricing.toLocaleString() : '0'}
                            </span>
                          )}
                        </td>
                        <td className="w-32 px-6 py-4">
                          {editingId === service.id ? (
                            <div className="flex items-center justify-center w-full">
                              <ToggleSwitch
                                enabled={editedService.appointment === 'Allowed'}
                                onChange={enabled => onChange('appointment', enabled ? 'Allowed' : 'Not Allowed')}
                              />
                            </div>
                          ) : (
                            <span className={`px-2 py-1 text-xs rounded-full ${service.appointment === 'Allowed' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                              {service.appointment}
                            </span>
                          )}
                        </td>
                        <td className="w-32 px-6 py-4">
                          {editingId === service.id ? (
                            <div className="flex items-center justify-center w-full">
                              <ToggleSwitch
                                enabled={editedService.status === 'Active'}
                                onChange={enabled => onChange('status', enabled ? 'Active' : 'Inactive')}
                                activeColor="bg-green-600"
                              />
                            </div>
                          ) : (
                            <span className={`px-2 py-1 text-xs rounded-full ${service.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {service.status}
                            </span>
                          )}
                        </td>
                        <td className="w-24 px-6 py-4">
                          <div className="flex gap-2 justify-center">
                            {editingId === service.id ? (
                              <>
                                <button 
                                  onClick={onSave}
                                  className="text-green-600 hover:text-green-800 transition-colors duration-150"
                                >
                                  <FaCheck className="w-5 h-5" />
                                </button>
                                <button 
                                  onClick={onCancel}
                                  className="text-red-600 hover:text-red-800 transition-colors duration-150"
                                >
                                  <FaTimes className="w-5 h-5" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button 
                                  onClick={() => onEdit(service)}
                                  className="text-blue-600 hover:text-blue-800 transition-colors duration-150"
                                >
                                  Edit
                                </button>
                                <button 
                                  onClick={() => onDeleteClick(service)}
                                  className="text-red-600 hover:text-red-800 transition-colors duration-150"
                                >
                                  <FaTrash className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
} 