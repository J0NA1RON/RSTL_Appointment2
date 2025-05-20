import React from "react";
import { FaTimes, FaCheck, FaBan, FaFlask, FaCheckCircle, FaUser, FaVial, FaCalendarAlt, FaInfoCircle } from 'react-icons/fa';
import { format, parseISO } from 'date-fns';

export default function ScheduleModal({ isOpen, onClose, appointment, onStatusUpdate }) {
  if (!isOpen || !appointment) return null;

  const handleUpdate = async (newStatus) => {
    onClose();
    await onStatusUpdate(appointment.id, newStatus);
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return { bgClass: 'bg-green-100', textClass: 'text-green-800', dotClass: 'bg-green-500' };
      case 'pending': return { bgClass: 'bg-yellow-100', textClass: 'text-yellow-800', dotClass: 'bg-yellow-500' };
      case 'accepted': return { bgClass: 'bg-blue-100', textClass: 'text-blue-800', dotClass: 'bg-blue-500' };
      case 'in progress': return { bgClass: 'bg-indigo-100', textClass: 'text-indigo-800', dotClass: 'bg-indigo-500' };
      case 'declined': return { bgClass: 'bg-red-100', textClass: 'text-red-800', dotClass: 'bg-red-500' };
      default: return { bgClass: 'bg-gray-100', textClass: 'text-gray-800', dotClass: 'bg-gray-500' };
    }
  };
  const statusColors = getStatusColor(appointment.status);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[95vh] overflow-hidden p-0">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FaInfoCircle className="text-blue-500" /> Appointment Details <span className="text-xs font-normal text-gray-400">(ID: {appointment.id})</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl p-1 rounded-full hover:bg-gray-100 transition">
            <FaTimes />
          </button>
        </div>
        <div className="flex flex-col gap-2 px-4 py-3 bg-gray-50">
          {/* Client Information */}
          <div className="bg-white rounded-lg border p-3 text-xs flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-1 text-blue-700 font-semibold"><FaUser /> Client</div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <div><span className="text-gray-500">Name:</span> <span className="font-medium text-gray-900">{appointment.customer_name}</span></div>
              <div><span className="text-gray-500">Contact:</span> <span className="font-medium text-gray-900">{appointment.customer_contact || 'N/A'}</span></div>
              <div><span className="text-gray-500">Email:</span> <span className="font-medium text-gray-900 break-words">{appointment.customer_email || 'N/A'}</span></div>
            </div>
          </div>
          {/* Sample & Test Information */}
          <div className="bg-white rounded-lg border p-3 text-xs flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-1 text-green-700 font-semibold"><FaVial /> Sample & Test</div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {appointment.services && (
                <div><span className="text-gray-500">Test Type:</span> <span className="font-medium text-gray-900">{appointment.services}</span></div>
              )}
              {appointment.analysis_requested && (
                <div><span className="text-gray-500">Analysis:</span> <span className="font-medium text-gray-900">{appointment.analysis_requested}</span></div>
              )}
              {appointment.sample_description && (
                <div><span className="text-gray-500">Sample:</span> <span className="font-medium text-gray-900">{appointment.sample_description}</span></div>
              )}
              {appointment.sample_type && (
                <div><span className="text-gray-500">Sample Type:</span> <span className="font-medium text-gray-900">{appointment.sample_type}</span></div>
              )}
              {appointment.sample_quantity && (
                <div><span className="text-gray-500">Sample Qty:</span> <span className="font-medium text-gray-900">{appointment.sample_quantity}{appointment.sample_quantity_units ? ` ${appointment.sample_quantity_units}` : ''}</span></div>
              )}
              {appointment.parameters && (
                <div><span className="text-gray-500">Parameters:</span> <span className="font-medium text-gray-900">{appointment.parameters}</span></div>
              )}
              {appointment.delivery_type && (
                <div><span className="text-gray-500">Delivery:</span> <span className="font-medium text-gray-900">{appointment.delivery_type}</span></div>
              )}
            </div>
          </div>
          {/* Shelf Life Details */}
          {(appointment.product_type || appointment.brand_name || appointment.net_weight || appointment.packaging_type || appointment.shelf_life_duration || appointment.objective_of_study || appointment.existing_market || appointment.production_type || appointment.product_ingredients || appointment.storage_conditions || appointment.target_shelf_life || appointment.modes_of_deterioration) && (
            <div className="bg-white rounded-lg border p-3 text-xs flex flex-col gap-1">
              <div className="flex items-center gap-2 mb-1 text-purple-700 font-semibold"><FaFlask /> Shelf Life Details</div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {appointment.objective_of_study && (
                  <div><span className="text-gray-500">Objective of Study:</span> <span className="font-medium text-gray-900">{appointment.objective_of_study}</span></div>
                )}
                {appointment.product_type && (
                  <div><span className="text-gray-500">Product Type:</span> <span className="font-medium text-gray-900">{appointment.product_type}</span></div>
                )}
                {appointment.brand_name && (
                  <div><span className="text-gray-500">Brand Name:</span> <span className="font-medium text-gray-900">{appointment.brand_name}</span></div>
                )}
                {appointment.net_weight && (
                  <div><span className="text-gray-500">Net Weight:</span> <span className="font-medium text-gray-900">{appointment.net_weight}</span></div>
                )}
                <div><span className="text-gray-500">Product Ingredients:</span> <span className="font-medium text-gray-900">{appointment.product_ingredients || ''}</span></div>
                {appointment.packaging_type && (
                  <div><span className="text-gray-500">Packaging Type:</span> <span className="font-medium text-gray-900">{appointment.packaging_type}</span></div>
                )}
                {appointment.shelf_life_duration && (
                  <div><span className="text-gray-500">Shelf Life Duration:</span> <span className="font-medium text-gray-900">{appointment.shelf_life_duration}</span></div>
                )}
                {appointment.existing_market && (
                  <div><span className="text-gray-500">Existing Market:</span> <span className="font-medium text-gray-900">{appointment.existing_market}</span></div>
                )}
                {appointment.production_type && (
                  <div><span className="text-gray-500">Production Type:</span> <span className="font-medium text-gray-900">{appointment.production_type}</span></div>
                )}
                {appointment.storage_conditions && (
                  <div><span className="text-gray-500">Storage Conditions:</span> <span className="font-medium text-gray-900">{appointment.storage_conditions}</span></div>
                )}
                {appointment.target_shelf_life && (
                  <div><span className="text-gray-500">Target Shelf Life:</span> <span className="font-medium text-gray-900">{appointment.target_shelf_life}</span></div>
                )}
                {appointment.modes_of_deterioration && (
                  <div><span className="text-gray-500">Modes of Deterioration:</span> <span className="font-medium text-gray-900">{appointment.modes_of_deterioration}</span></div>
                )}
              </div>
            </div>
          )}
          {/* Metrology Details */}
          {(appointment.type_of_test || appointment.number_of_liters || appointment.truck_plate_number) && (
            <div className="bg-white rounded-lg border p-3 text-xs flex flex-col gap-1">
              <div className="flex items-center gap-2 mb-1 text-indigo-700 font-semibold"><FaFlask /> Metrology</div>
              <div className="flex flex-wrap gap-x-4 gap-y-1">
                {appointment.type_of_test && (
                  <div><span className="text-gray-500">Test:</span> <span className="font-medium text-gray-900">{appointment.type_of_test}</span></div>
                )}
                {appointment.number_of_liters && (
                  <div><span className="text-gray-500">Liters:</span> <span className="font-medium text-gray-900">{appointment.number_of_liters}</span></div>
                )}
                {appointment.truck_plate_number && (
                  <div><span className="text-gray-500">Plate:</span> <span className="font-medium text-gray-900">{appointment.truck_plate_number}</span></div>
                )}
              </div>
            </div>
          )}
          {/* Appointment Details */}
          <div className="bg-white rounded-lg border p-3 text-xs flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-1 text-gray-700 font-semibold"><FaCalendarAlt /> Appointment</div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <div><span className="text-gray-500">Date:</span> <span className="font-medium text-gray-900">{format(parseISO(appointment.appointment_date), 'PPP')}</span></div>
              <div className="flex items-center gap-2 mt-1"><span className={`inline-block w-2 h-2 rounded-full ${statusColors.dotClass}`}></span><span className={`font-semibold px-2 py-0.5 rounded-full text-xxs ${statusColors.bgClass} ${statusColors.textClass}`}>{appointment.status}</span></div>
            </div>
          </div>
          {/* Actions */}
          <div className="bg-white rounded-lg border p-3 text-xs flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-1 text-gray-700 font-semibold"><FaInfoCircle /> Manage</div>
            <div className="flex flex-wrap gap-2 mt-1">
              {appointment.status === 'pending' && (
                <button
                  onClick={() => handleUpdate('accepted')}
                  className="px-3 py-1 text-xs bg-green-500 text-white rounded hover:bg-green-600 flex items-center gap-1 shadow"
                >
                  <FaCheck /> Accept
                </button>
              )}
              {(appointment.status === 'pending' || appointment.status === 'accepted') && (
                <button
                  onClick={() => handleUpdate('declined')}
                  className="px-3 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 flex items-center gap-1 shadow"
                >
                  <FaBan /> Decline
                </button>
              )}
              {appointment.status === 'accepted' && (
                <button
                  onClick={() => handleUpdate('in progress')}
                  className="px-3 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center gap-1 shadow"
                >
                  <FaFlask /> Start Test
                </button>
              )}
              {appointment.status === 'in progress' && (
                <button
                  onClick={() => handleUpdate('completed')}
                  className="px-3 py-1 text-xs bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center gap-1 shadow"
                >
                  <FaCheckCircle /> Mark Complete
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 