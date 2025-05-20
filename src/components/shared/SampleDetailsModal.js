import React from "react";
import { FaTimes, FaDownload } from 'react-icons/fa';

export default function SampleDetailsModal({ isOpen, sample, activeTab, setActiveTab, onClose }) {
  if (!isOpen || !sample) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl w-[600px] max-h-[80vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Sample Details</h2>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
          <p className="text-gray-600 mb-6">Complete information about sample {sample.id}</p>
          <div className="border-b border-gray-200 mb-6">
            <div className="flex gap-4">
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'sample-details'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('sample-details')}
              >
                Sample Details
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'customer-info'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('customer-info')}
              >
                Customer Info
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium ${
                  activeTab === 'test-results'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('test-results')}
              >
                Test Results
              </button>
            </div>
          </div>
          {activeTab === 'sample-details' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Sample ID</p>
                  <p className="font-medium">{sample.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <p className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    {sample.status}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sample Name</p>
                  <p className="font-medium">{sample.sampleDetails.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sample Type</p>
                  <p className="font-medium">{sample.sampleDetails.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Number of Samples</p>
                  <p className="font-medium">{sample.sampleDetails.numSamples}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Laboratory</p>
                  <p className="font-medium">{sample.sampleDetails.laboratory}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Date Requested</p>
                  <p className="font-medium">{sample.sampleDetails.dateRequested}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Priority</p>
                  <p className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                    {sample.sampleDetails.priority}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-500 mb-1">Description</p>
                <p className="text-sm">{sample.sampleDetails.description}</p>
              </div>
            </div>
          )}
          {activeTab === 'customer-info' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Customer Name</p>
                  <p className="font-medium">{sample.client.name}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Organization</p>
                  <p className="font-medium">{sample.client.organization}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Email</p>
                  <p className="font-medium">{sample.client.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Contact Number</p>
                  <p className="font-medium">{sample.client.phone}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Sex</p>
                  <p className="font-medium">{sample.client.sex}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Submission Timestamp</p>
                  <p className="font-medium">{sample.client.submissionTimestamp}</p>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'test-results' && (
            <div className="space-y-4">
              <div>
                <p className="text-sm text-gray-500 mb-1">Test Results</p>
                <p className="text-sm">{sample.testResults.summary}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Technician</p>
                  <p className="font-medium">{sample.testResults.technician}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Completed Date</p>
                  <p className="font-medium">{sample.testResults.completedDate}</p>
                </div>
              </div>
              <button className="mt-4 w-full flex items-center justify-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-600">
                <FaDownload className="w-4 h-4" />
                Download Full Report
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 