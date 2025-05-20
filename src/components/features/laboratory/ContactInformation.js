'use client';

import { useState, useEffect } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/20/solid'; // Use solid icon
import { UserIcon, BuildingOfficeIcon, PhoneIcon, EnvelopeIcon, UserCircleIcon } from '@heroicons/react/24/outline';

// Helper component for inline error messages
const InlineError = ({ message }) => {
  if (!message) return null;
  return (
    <div className="flex items-center mt-1.5 px-2 py-1 rounded-md bg-yellow-50 border border-yellow-200">
      <ExclamationTriangleIcon className="h-4 w-4 text-yellow-500 mr-1.5 flex-shrink-0" aria-hidden="true" />
      <p className="text-xs font-medium text-yellow-800">{message}</p>
    </div>
  );
};

export default function ContactInformation({ 
  contactInfo, 
  onContactInfoChange, 
  errors = {},
  onNext,
  disabled = false
}) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onContactInfoChange(name, value);
  };
  
  const getInputClasses = (fieldName) => {
    const baseClasses = "block w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-300 focus:border-transparent transition-colors";
    
    if (errors?.[fieldName]) {
      return `${baseClasses} border-red-400 bg-red-50 text-red-800 disabled:opacity-75`;
    }
    
    return `${baseClasses} border-gray-300 bg-white disabled:opacity-75 disabled:bg-gray-100`;
  };

  return (
    <div className="space-y-8">
      <div className="border-b border-gray-200 pb-4">
        <h2 className="text-2xl font-semibold text-gray-900">Contact Information</h2>
        <p className="mt-1 text-sm text-gray-500">
          Please provide your contact details for the laboratory appointment.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Client Name */}
        <div className="relative">
          <label 
            htmlFor="clientName" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Client Name
          </label>
          <div className="relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserIcon className="h-5 w-5 text-gray-400" />
            </div>
          <input
            type="text"
            id="clientName"
            name="clientName"
            value={contactInfo.clientName}
              onChange={(e) => onContactInfoChange('clientName', e.target.value)}
              className={`block w-full pl-10 pr-3 py-2 rounded-lg border ${
                errors?.clientName 
                  ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } shadow-sm transition-colors`}
            placeholder="Enter your full name"
              disabled={disabled}
            />
          </div>
          {errors?.clientName && (
            <p className="mt-1 text-sm text-red-600">{errors.clientName}</p>
          )}
        </div>

        {/* Organization */}
        <div className="relative">
          <label 
            htmlFor="organization" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Organization
          </label>
          <div className="relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              id="organization"
              name="organization"
              value={contactInfo.organization}
              onChange={(e) => onContactInfoChange('organization', e.target.value)}
              className={`block w-full pl-10 pr-3 py-2 rounded-lg border ${
                errors?.organization 
                  ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } shadow-sm transition-colors`}
              placeholder="Enter your organization name"
            disabled={disabled}
          />
          </div>
          {errors?.organization && (
            <p className="mt-1 text-sm text-red-600">{errors.organization}</p>
          )}
        </div>

        {/* Sex */}
        <div className="relative">
          <label 
            htmlFor="sex" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Sex
          </label>
          <div className="relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <UserCircleIcon className="h-5 w-5 text-gray-400" />
            </div>
            <select
              id="sex"
              name="sex"
              value={contactInfo.sex}
              onChange={(e) => onContactInfoChange('sex', e.target.value)}
              className={`block w-full pl-10 pr-3 py-2 rounded-lg border ${
                errors?.sex 
                  ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } shadow-sm transition-colors`}
              disabled={disabled}
            >
              <option value="">Select your sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Prefer not to say">Prefer not to say</option>
            </select>
          </div>
          {errors?.sex && (
            <p className="mt-1 text-sm text-red-600">{errors.sex}</p>
          )}
        </div>
        
        {/* Email Address */}
        <div className="relative">
          <label 
            htmlFor="emailAddress" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Email Address
          </label>
          <div className="relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <EnvelopeIcon className="h-5 w-5 text-gray-400" />
            </div>
          <input
            type="email"
            id="emailAddress"
            name="emailAddress"
            value={contactInfo.emailAddress}
              onChange={(e) => onContactInfoChange('emailAddress', e.target.value)}
              className={`block w-full pl-10 pr-3 py-2 rounded-lg border ${
                errors?.emailAddress 
                  ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } shadow-sm transition-colors`}
            placeholder="Enter your email address"
            disabled={disabled}
          />
          </div>
          {errors?.emailAddress && (
            <p className="mt-1 text-sm text-red-600">{errors.emailAddress}</p>
          )}
        </div>
        
        {/* Phone Number */}
        <div className="relative">
          <label 
            htmlFor="phoneNumber" 
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Phone Number
          </label>
          <div className="relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <PhoneIcon className="h-5 w-5 text-gray-400" />
            </div>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            value={contactInfo.phoneNumber}
              onChange={(e) => onContactInfoChange('phoneNumber', e.target.value)}
              className={`block w-full pl-10 pr-3 py-2 rounded-lg border ${
                errors?.phoneNumber 
                  ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500' 
                  : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
              } shadow-sm transition-colors`}
            placeholder="Enter your phone number"
            disabled={disabled}
          />
        </div>
          {errors?.phoneNumber && (
            <p className="mt-1 text-sm text-red-600">{errors.phoneNumber}</p>
          )}
        </div>
      </div>
      
      {/* Navigation */}
      <div className="flex justify-end pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onNext}
          disabled={disabled}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Continue to Sample Details
        </button>
      </div>
    </div>
  );
} 