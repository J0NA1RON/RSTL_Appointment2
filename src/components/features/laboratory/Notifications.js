'use client';

import { CheckCircleIcon, XCircleIcon, XMarkIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

// Alert message component for form validation and user notifications
export function AlertMessage({ show, message, onClose }) {
  if (!show) return null;

  return (
    <div 
      className={`
        fixed top-4 right-4 z-50 bg-white rounded-lg border-l-4 border-yellow-400 
        shadow-md py-4 px-6 max-w-md 
        transition-opacity duration-300 ease-out
        ${show ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
    >
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <ExclamationTriangleIcon className="h-6 w-6 text-yellow-400" aria-hidden="true" />
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium text-gray-800">{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex rounded-md p-1.5 text-gray-500 hover:bg-gray-100 focus:outline-none"
            >
              <span className="sr-only">Dismiss</span>
              <XMarkIcon className="h-5 w-5" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Submission status component for displaying submit results
export function SubmissionStatus({ status, onClose }) {
  if (!status) return null;

  const { success, message, subtitle, appointmentIds } = status;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50" role="dialog" aria-modal="true">
      <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full mx-4">
        <div className="flex flex-col items-center text-center">
          {success ? (
            <CheckCircleIcon className="h-16 w-16 text-green-500 mb-6" aria-hidden="true" />
          ) : (
            <XCircleIcon className="h-16 w-16 text-red-500 mb-6" aria-hidden="true" />
          )}
          <h3 className="text-xl font-semibold text-gray-900 mb-1">
            {success ? 'Success' : 'Error'}
          </h3>
          {subtitle && <div className="text-base text-gray-700 mb-2">{subtitle}</div>}
          <p className="text-gray-600 mb-6">{message}</p>

          {success && appointmentIds && appointmentIds.length > 0 && (
            <div className="mb-6 w-full">
              <p className="text-sm font-medium text-gray-700 mb-2">Appointment ID{appointmentIds.length > 1 ? 's' : ''}:</p>
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-800">
                {appointmentIds.map((id, index) => (
                  <div key={id} className={index !== appointmentIds.length - 1 ? 'mb-2 pb-2 border-b border-gray-200' : ''}>
                    Appointment #{index + 1}: <span className="font-mono font-medium">{id}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onClick={onClose}
            className={`px-6 py-3 text-sm font-medium text-white rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              success ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
            }`}
            autoFocus
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}

// Delete confirmation modal
export function DeleteConfirmModal({ show, onCancel, onConfirm }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-2xl p-6 max-w-md w-full mx-4">
        <div className="flex flex-col items-center text-center">
          <ExclamationTriangleIcon className="h-12 w-12 text-yellow-500 mb-4" aria-hidden="true" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Appointment?</h3>
          <p className="text-gray-600 mb-6">
            Are you sure you want to delete this appointment? This action cannot be undone.
          </p>
          
          <div className="flex gap-4 w-full">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 flex-1"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              className="px-6 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 flex-1"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 