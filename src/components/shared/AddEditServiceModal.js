import React from "react";

export default function AddEditServiceModal({ isOpen, service, onChange, onSave, onCancel, mode = 'add', sampleTypeOptions = [] }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-lg font-semibold mb-4">{mode === 'add' ? 'Add New Test' : 'Edit Test'}</h2>
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1">Test Type</label>
            <input
              type="text"
              className="w-full border rounded px-3 py-2 text-sm"
              value={service.testType}
              onChange={e => onChange('testType', e.target.value)}
              placeholder="Enter test type"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="w-full border rounded px-3 py-2 text-sm"
              value={service.testDescription}
              onChange={e => onChange('testDescription', e.target.value)}
              placeholder="Enter description"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Price (₱)</label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2 text-sm"
              value={service.pricing}
              onChange={e => onChange('pricing', parseFloat(e.target.value) || 0)}
              min="0"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Sample Type</label>
            <select
              className="w-full border rounded px-3 py-2 text-sm"
              value={service.sampleType}
              onChange={e => onChange('sampleType', e.target.value)}
            >
              {sampleTypeOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              className="w-full border rounded px-3 py-2 text-sm"
              value={service.status}
              onChange={e => onChange('status', e.target.value)}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded hover:bg-green-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
} 