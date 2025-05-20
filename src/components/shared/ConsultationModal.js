import React from "react";
import { FaTimes, FaCheck } from 'react-icons/fa';

function getStatusColor(status) {
  switch (status?.toLowerCase()) {
    case 'pending': return { bgClass: 'bg-yellow-100', textClass: 'text-yellow-800' };
    case 'accepted': return { bgClass: 'bg-green-100', textClass: 'text-green-800' };
    case 'declined': return { bgClass: 'bg-red-100', textClass: 'text-red-800' };
    default: return { bgClass: 'bg-gray-100', textClass: 'text-gray-800' };
  }
}

export default function ConsultationModal({ isOpen, onClose, consultation, onAccept, onDecline }) {
  if (!isOpen || !consultation) return null;
  const statusColors = getStatusColor(consultation.status);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[95vh] overflow-hidden p-0 flex flex-col">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h2 className="text-lg font-bold">Consultation Details</h2>
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 text-xs rounded-full font-semibold ${statusColors.bgClass} ${statusColors.textClass}`}>{consultation.status}</span>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl p-1 rounded-full hover:bg-gray-100 transition">
              <FaTimes />
            </button>
          </div>
        </div>
        <div className="flex flex-col gap-2 px-4 py-3 bg-gray-50 overflow-y-auto flex-grow">
          {/* Researcher Info */}
          <div className="bg-white rounded-lg border p-3 text-xs flex flex-col gap-1 mb-2">
            <div className="font-semibold text-blue-700 mb-1">Researcher Info</div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <div><span className="text-gray-500">Name:</span> <span className="font-medium text-gray-900">{consultation.customer || 'N/A'}</span></div>
              <div><span className="text-gray-500">Contact:</span> <span className="font-medium text-gray-900">{consultation.contactNumber || 'N/A'}</span></div>
              <div><span className="text-gray-500">Email:</span> <span className="font-medium text-gray-900 break-words">{consultation.emailAddress || 'N/A'}</span></div>
            </div>
          </div>
          {/* Organization & Research Info */}
          <div className="bg-white rounded-lg border p-3 text-xs flex flex-col gap-1 mb-2">
            <div className="font-semibold text-green-700 mb-1">Research & Organization</div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <div><span className="text-gray-500">Organization:</span> <span className="font-medium text-gray-900">{consultation.organization || 'N/A'}</span></div>
              <div><span className="text-gray-500">Topic:</span> <span className="font-medium text-gray-900">{consultation.researchTopic || 'N/A'}</span></div>
              <div><span className="text-gray-500">Stage:</span> <span className="font-medium text-gray-900">{consultation.researchStage || 'N/A'}</span></div>
              <div><span className="text-gray-500">Type:</span> <span className="font-medium text-gray-900">{consultation.consultationType || 'N/A'}</span></div>
              {consultation.uploadedResearchPaper && (
                <div><span className="text-gray-500">Research Paper:</span> <a href={consultation.uploadedResearchPaper} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-700 underline break-all">View File</a></div>
              )}
            </div>
          </div>
          {/* Appointment Info */}
          <div className="bg-white rounded-lg border p-3 text-xs flex flex-col gap-1 mb-2">
            <div className="font-semibold text-gray-700 mb-1">Appointment</div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <div><span className="text-gray-500">Date:</span> <span className="font-medium text-gray-900">{consultation.date || 'N/A'}</span></div>
            </div>
          </div>
          {/* Consultation Details */}
          {consultation.consultationDetails && (
            <div className="bg-white rounded-lg border p-3 text-xs flex flex-col gap-1 mb-2">
              <div className="font-semibold text-indigo-700 mb-1">Consultation Details</div>
              <div className="text-gray-900 text-sm whitespace-pre-line">{consultation.consultationDetails}</div>
            </div>
          )}
        </div>
        {/* Footer Actions */}
        <div className="flex justify-end gap-3 px-6 py-4 bg-gray-50 rounded-b-xl border-t flex-shrink-0">
          {consultation.status === 'pending' && (
            <>
              <button
                onClick={onDecline}
                className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700 flex items-center gap-2 rounded-lg hover:bg-red-50"
              >
                <FaTimes className="w-4 h-4" />
                Decline
              </button>
              <button
                onClick={onAccept}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-lg flex items-center gap-2"
              >
                <FaCheck className="w-4 h-4" />
                Accept
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 