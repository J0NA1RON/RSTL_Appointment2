import React from "react";
import { FaTimes, FaUser, FaCalendarAlt, FaInfoCircle, FaFileAlt } from 'react-icons/fa';

function getStatusColor(status) {
  switch (status?.toLowerCase()) {
    case 'completed': return { bgClass: 'bg-green-100', textClass: 'text-green-800', dotClass: 'bg-green-500' };
    case 'pending': return { bgClass: 'bg-yellow-100', textClass: 'text-yellow-800', dotClass: 'bg-yellow-500' };
    case 'accepted': return { bgClass: 'bg-blue-100', textClass: 'text-blue-800', dotClass: 'bg-blue-500' };
    case 'in progress': return { bgClass: 'bg-indigo-100', textClass: 'text-indigo-800', dotClass: 'bg-indigo-500' };
    case 'declined': return { bgClass: 'bg-red-100', textClass: 'text-red-800', dotClass: 'bg-red-500' };
    default: return { bgClass: 'bg-gray-100', textClass: 'text-gray-800', dotClass: 'bg-gray-500' };
  }
}

export default function ConsultancyReportsModal({ isOpen, onClose, consultation }) {
  if (!isOpen || !consultation) return null;
  const statusColors = getStatusColor(consultation.status);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[95vh] overflow-hidden p-0">
        {/* Modal Header */}
        <div className="flex justify-between items-center px-4 py-3 border-b">
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FaInfoCircle className="text-blue-500" /> Consultation Details <span className="text-xs font-normal text-gray-400">(ID: {consultation.id})</span>
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-xl p-1 rounded-full hover:bg-gray-100 transition">
            <FaTimes />
          </button>
        </div>
        <div className="flex flex-col gap-2 px-4 py-3 bg-gray-50 overflow-y-auto">
          {/* Researcher Information */}
          <div className="bg-white rounded-lg border p-3 text-xs flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-1 text-blue-700 font-semibold"><FaUser /> Researcher</div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <div><span className="text-gray-500">Name:</span> <span className="font-medium text-gray-900">{consultation.researcher || consultation.customer || 'N/A'}</span></div>
              <div><span className="text-gray-500">Contact:</span> <span className="font-medium text-gray-900">{consultation.phone || consultation.contactNumber || 'N/A'}</span></div>
              <div><span className="text-gray-500">Email:</span> <span className="font-medium text-gray-900 break-words">{consultation.email || consultation.emailAddress || 'N/A'}</span></div>
              <div><span className="text-gray-500">Position/Year Level:</span> <span className="font-medium text-gray-900">{consultation.position || 'N/A'}</span></div>
            </div>
          </div>
          {/* School/Institution */}
          <div className="bg-white rounded-lg border p-3 text-xs flex flex-col gap-1">
            <div className="font-semibold text-green-700 mb-1">School/Institution</div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <div><span className="text-gray-500">Name:</span> <span className="font-medium text-gray-900">{consultation.client || consultation.organization || 'N/A'}</span></div>
            </div>
          </div>
          {/* Research Information */}
          <div className="bg-white rounded-lg border p-3 text-xs flex flex-col gap-1">
            <div className="font-semibold text-indigo-700 mb-1">Research Information</div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <div><span className="text-gray-500">Topic:</span> <span className="font-medium text-gray-900">{consultation.researchTopic || 'N/A'}</span></div>
              <div><span className="text-gray-500">Research Paper:</span> <span className="font-medium text-gray-900 flex items-center gap-2">{consultation.researchFile || consultation.uploadedResearchPaper ? <><FaFileAlt className="text-gray-400" />{consultation.researchFile || <a href={consultation.uploadedResearchPaper} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline break-all">View File</a>}</> : 'N/A'}</span></div>
            </div>
          </div>
          {/* Consultation Details */}
          <div className="bg-white rounded-lg border p-3 text-xs flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-1 text-gray-700 font-semibold"><FaCalendarAlt /> Consultation</div>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              <div><span className="text-gray-500">Date:</span> <span className="font-medium text-gray-900">{consultation.date || 'N/A'}</span></div>
              <div><span className="text-gray-500">Time:</span> <span className="font-medium text-gray-900">{consultation.time || 'N/A'}</span></div>
              <div className="flex items-center gap-2 mt-1"><span className={`inline-block w-2 h-2 rounded-full ${statusColors.dotClass}`}></span><span className={`font-semibold px-2 py-0.5 rounded-full text-xxs ${statusColors.bgClass} ${statusColors.textClass}`}>{consultation.status}</span></div>
            </div>
            <div className="mt-2">
              <span className="text-gray-500">Consultation Notes:</span>
              <div className="text-gray-900 text-sm whitespace-pre-line mt-1">{consultation.notes || consultation.consultationDetails || 'N/A'}</div>
            </div>
          </div>
        </div>
        {/* Footer Actions */}
        <div className="flex justify-end gap-2 px-4 py-3 border-t bg-white rounded-b-xl">
          <button
            onClick={onClose}
            className="px-4 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 font-medium shadow"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
} 