'use client';

import { useState } from 'react';
import { PlusIcon, XMarkIcon, ExclamationTriangleIcon, DocumentIcon, PhotoIcon } from '@heroicons/react/24/outline';

// Helper component for inline error messages
const InlineError = ({ message }) => {
  if (!message) return null;
  return (
    <div className="flex items-center mt-1.5 px-2 py-1.5 rounded-md bg-red-50 border border-red-200">
      <ExclamationTriangleIcon className="h-4 w-4 text-red-500 mr-1.5 flex-shrink-0" aria-hidden="true" />
      <p className="text-xs font-medium text-red-800">{message}</p>
    </div>
  );
};

// Helper component for form sections
const FormSection = ({ title, children }) => (
  <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
    <h4 className="text-lg font-semibold text-gray-900">{title}</h4>
    {children}
  </div>
);

export default function ShelfLifeDetails({ 
  appointment, 
  onChange,
  onAddMode,
  onRemoveMode,
  onModeChange,
  onFileChange,
  errors = {},
  disabled = false
}) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange(name, value);
  };
  
  const getInputClasses = (fieldName) => {
    const baseClasses = "block w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-base";
    
    if (errors[fieldName]) {
      return `${baseClasses} border-red-300 bg-red-50 text-red-900 placeholder-red-300 disabled:opacity-50`;
    }
    
    return `${baseClasses} border-gray-300 bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400 disabled:opacity-50 disabled:bg-gray-50`;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h3 className="text-2xl font-semibold text-gray-900">Shelf Life Study Details</h3>
        <p className="mt-2 text-sm text-gray-600">Please provide detailed information about your product for the shelf life study.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Basic Product Information */}
        <FormSection title="Product Information">
          <div className="space-y-6">
            <div>
              <label htmlFor="productName" className="block text-sm font-medium text-gray-700 mb-1">
                Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="productName"
                name="productName"
                value={appointment.productName}
                onChange={handleChange}
                placeholder="Enter the product name"
                className={getInputClasses("productName")}
                disabled={disabled}
              />
              <InlineError message={errors.productName} />
            </div>

            <div>
              <label htmlFor="brandName" className="block text-sm font-medium text-gray-700 mb-1">
                Brand Name
              </label>
              <input
                type="text"
                id="brandName"
                name="brandName"
                value={appointment.brandName}
                onChange={handleChange}
                placeholder="Enter the brand name"
                className={getInputClasses("brandName")}
                disabled={disabled}
              />
            </div>

            <div>
              <label htmlFor="netWeight" className="block text-sm font-medium text-gray-700 mb-1">
                Net Weight <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="netWeight"
                name="netWeight"
                value={appointment.netWeight}
                onChange={handleChange}
                placeholder="Enter net weight (e.g., 500g, 1kg)"
                className={getInputClasses("netWeight")}
                disabled={disabled}
              />
              <InlineError message={errors.netWeight} />
            </div>

            <div>
              <label htmlFor="productIngredients" className="block text-sm font-medium text-gray-700 mb-1">
                Product Ingredients <span className="text-red-500">*</span>
              </label>
              <textarea
                id="productIngredients"
                name="productIngredients"
                value={appointment.productIngredients}
                onChange={handleChange}
                rows={4}
                placeholder="List all ingredients in the product"
                className={getInputClasses("productIngredients")}
                disabled={disabled}
              />
              <InlineError message={errors.productIngredients} />
            </div>
          </div>
        </FormSection>

        {/* Market and Production Details */}
        <FormSection title="Market & Production">
          <div className="space-y-6">
            <div>
              <label htmlFor="existingMarket" className="block text-sm font-medium text-gray-700 mb-1">
                Market Type <span className="text-red-500">*</span>
              </label>
              <select
                id="existingMarket"
                name="existingMarket"
                value={appointment.existingMarket}
                onChange={handleChange}
                className={getInputClasses("existingMarket")}
                disabled={disabled}
              >
                <option value="">Select market type</option>
                <option value="Local">Local</option>
                <option value="National">National</option>
                <option value="International">International</option>
                <option value="New Product">New Product (No Market Yet)</option>
              </select>
              <InlineError message={errors.existingMarket} />
            </div>

            <div>
              <label htmlFor="productionType" className="block text-sm font-medium text-gray-700 mb-1">
                Production Type <span className="text-red-500">*</span>
              </label>
              <select
                id="productionType"
                name="productionType"
                value={appointment.productionType}
                onChange={handleChange}
                className={getInputClasses("productionType")}
                disabled={disabled}
              >
                <option value="">Select production type</option>
                <option value="Industrial">Industrial</option>
                <option value="Small Scale">Small Scale</option>
                <option value="Homemade">Homemade</option>
                <option value="Prototype">Prototype</option>
              </select>
              <InlineError message={errors.productionType} />
            </div>

            <div>
              <label htmlFor="packagingMaterial" className="block text-sm font-medium text-gray-700 mb-1">
                Packaging Material <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="packagingMaterial"
                name="packagingMaterial"
                value={appointment.packagingMaterial}
                onChange={handleChange}
                placeholder="e.g., PET Bottles, Glass Jars, Aluminum Foil"
                className={getInputClasses("packagingMaterial")}
                disabled={disabled}
              />
              <InlineError message={errors.packagingMaterial} />
            </div>

            <div>
              <label htmlFor="methodOfPreservation" className="block text-sm font-medium text-gray-700 mb-1">
                Method of Preservation <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="methodOfPreservation"
                name="methodOfPreservation"
                value={appointment.methodOfPreservation}
                onChange={handleChange}
                placeholder="e.g., Refrigeration, Canning, Pasteurization"
                className={getInputClasses("methodOfPreservation")}
                disabled={disabled}
              />
              <InlineError message={errors.methodOfPreservation} />
            </div>
          </div>
        </FormSection>

        {/* Study Details */}
        <FormSection title="Study Specifications">
          <div className="space-y-6">
            <div>
              <label htmlFor="objectiveOfStudy" className="block text-sm font-medium text-gray-700 mb-1">
                Objective of Study <span className="text-red-500">*</span>
              </label>
              <textarea
                id="objectiveOfStudy"
                name="objectiveOfStudy"
                value={appointment.objectiveOfStudy}
                onChange={handleChange}
                rows={4}
                placeholder="Describe the main objective of your shelf life study"
                className={getInputClasses("objectiveOfStudy")}
                disabled={disabled}
              />
              <InlineError message={errors.objectiveOfStudy} />
            </div>

            <div>
              <label htmlFor="targetShelfLife" className="block text-sm font-medium text-gray-700 mb-1">
                Target Shelf Life <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="targetShelfLife"
                name="targetShelfLife"
                value={appointment.targetShelfLife}
                onChange={handleChange}
                placeholder="e.g., 6 months, 1 year"
                className={getInputClasses("targetShelfLife")}
                disabled={disabled}
              />
              <InlineError message={errors.targetShelfLife} />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Modes of Deterioration <span className="text-red-500">*</span>
              </label>
              <div className="space-y-3">
                {appointment.modeOfDeterioration.map((mode, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      value={mode}
                      onChange={(e) => onModeChange(index, e.target.value)}
                      placeholder="e.g., Oxidation, Microbial growth"
                      className={getInputClasses("modeOfDeterioration")}
                      disabled={disabled}
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => onRemoveMode(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        disabled={disabled}
                      >
                        <XMarkIcon className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={onAddMode}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors disabled:opacity-50"
                  disabled={disabled}
                >
                  <PlusIcon className="h-4 w-4 mr-1.5" />
                  Add Mode
                </button>
                <InlineError message={errors.modeOfDeterioration} />
              </div>
            </div>
          </div>
        </FormSection>

        {/* Documents */}
        <FormSection title="Supporting Documents">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Existing Permits/Certificates
              </label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                <div className="text-center">
                  <DocumentIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                  <div className="mt-4 flex text-sm leading-6 text-gray-600">
                    <label
                      htmlFor="existingPermitsFile"
                      className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="existingPermitsFile"
                        name="existingPermitsFile"
                        type="file"
                        className="sr-only"
                        onChange={(e) => onFileChange(e, 'existingPermitsFile')}
                        disabled={disabled}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs leading-5 text-gray-600">PDF, DOC up to 10MB</p>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product Image
              </label>
              <div className="mt-2 flex justify-center rounded-lg border border-dashed border-gray-900/25 px-6 py-10">
                <div className="text-center">
                  <PhotoIcon className="mx-auto h-12 w-12 text-gray-300" aria-hidden="true" />
                  <div className="mt-4 flex text-sm leading-6 text-gray-600">
                    <label
                      htmlFor="productImageFile"
                      className="relative cursor-pointer rounded-md bg-white font-semibold text-blue-600 focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-600 focus-within:ring-offset-2 hover:text-blue-500"
                    >
                      <span>Upload a file</span>
                      <input
                        id="productImageFile"
                        name="productImageFile"
                        type="file"
                        className="sr-only"
                        onChange={(e) => onFileChange(e, 'productImageFile')}
                        accept="image/*"
                        disabled={disabled}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs leading-5 text-gray-600">PNG, JPG, GIF up to 10MB</p>
                </div>
              </div>
            </div>
          </div>
        </FormSection>
      </div>
    </div>
  );
} 