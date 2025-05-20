import React, { useState } from "react";
import { FaTimes } from 'react-icons/fa';

export default function DeclineModal({ isOpen, onClose, onConfirm }) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">Decline Consultation</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <FaTimes className="w-5 h-5" />
          </button>
        </div>
        <div className="mb-4">
          <label htmlFor="declineReason" className="block text-sm font-medium text-gray-700 mb-2">
            Reason for Declining
          </label>
          <textarea
            id="declineReason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
            rows="4"
            placeholder="Please provide a reason for declining this consultation..."
          ></textarea>
        </div>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (reason.trim()) {
                onConfirm(reason);
                onClose();
                setReason('');
              }
            }}
            disabled={!reason.trim()}
            className={`px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors duration-150 ${
              reason.trim() ? 'bg-red-600 hover:bg-red-700' : 'bg-red-400 cursor-not-allowed'
            }`}
          >
            Confirm Decline
          </button>
        </div>
      </div>
    </div>
  );
} 