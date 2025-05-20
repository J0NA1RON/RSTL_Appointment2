'use client';
import { useState } from 'react';
import LoadingOverlay from '@/components/shared/LoadingOverlay';

export default function ManagerRegistration() {
  const [formData, setFormData] = useState({
    companyName: '',
    contactPerson: '',
    contactNumber: '',
    contactEmail: '',
    companyAddress: '',
    truckLicensePlates: [''],
    businessPermit: null,
    orCrDocuments: {},
    additionalNotes: '',
    terms: false
  });

  const [errors, setErrors] = useState({});
  const [licensePlates, setLicensePlates] = useState(['']);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    // Company Information validation
    if (!formData.companyName) newErrors.companyName = 'Please enter company name';
    if (!formData.contactPerson) newErrors.contactPerson = 'Please enter contact person name';
    if (!formData.contactNumber) newErrors.contactNumber = 'Please enter contact number';
    if (!formData.contactEmail) newErrors.contactEmail = 'Please enter contact email';
    if (!formData.companyAddress) newErrors.companyAddress = 'Please enter company address';
    
    // Business Permit validation
    if (!formData.businessPermit) newErrors.businessPermit = 'Please upload business permit document';

    // License Plates validation
    const plateErrors = {};
    licensePlates.forEach((plate, index) => {
      if (!plate) plateErrors[index] = 'Please enter plate number';
      if (!formData.orCrDocuments[index]) plateErrors[`document-${index}`] = 'Please upload OR/CR document';
    });
    if (Object.keys(plateErrors).length > 0) newErrors.licensePlates = plateErrors;

    // Terms validation
    if (!formData.terms) newErrors.terms = 'Please agree to the Terms of Service and Privacy Policy';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    if (fieldName === 'businessPermit') {
      setFormData(prev => ({
        ...prev,
        [fieldName]: file
      }));
    } else {
      // For OR/CR documents
      const truckIndex = fieldName.split('-')[1];
      setFormData(prev => ({
        ...prev,
        orCrDocuments: {
          ...prev.orCrDocuments,
          [truckIndex]: file
        }
      }));
    }
  };

  const removeFile = (fieldName) => {
    if (fieldName === 'businessPermit') {
      setFormData(prev => ({
        ...prev,
        businessPermit: null
      }));
    } else {
      // For OR/CR documents
      const truckIndex = fieldName.split('-')[1];
      setFormData(prev => ({
        ...prev,
        orCrDocuments: {
          ...prev.orCrDocuments,
          [truckIndex]: null
        }
      }));
    }
  };

  const addLicensePlate = () => {
    setLicensePlates(prev => [...prev, '']);
  };

  const removeLicensePlate = (index) => {
    setLicensePlates(prev => prev.filter((_, i) => i !== index));
  };

  const handleLicensePlateChange = (index, value) => {
    const newPlates = [...licensePlates];
    newPlates[index] = value;
    setLicensePlates(newPlates);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        // 1. Check if company exists
        const checkCompanyRes = await fetch(`/api/companies?name=${encodeURIComponent(formData.companyName)}`);
        const checkCompanyData = await checkCompanyRes.json();
        let companyId = null;
        let isNewCompany = false;
        if (checkCompanyData.success && checkCompanyData.data && checkCompanyData.data.length > 0) {
          // Company exists, use its ID
          companyId = checkCompanyData.data[0].id;
          // Optionally, check if other fields match and warn if not
        } else {
          // 2. Upload files
          async function uploadFile(file) {
            const formDataUpload = new FormData();
            formDataUpload.append('file', file);
            const res = await fetch('/api/uploads/appointment', {
              method: 'POST',
              body: formDataUpload,
            });
            const data = await res.json();
            if (data.success && data.files && data.files.length > 0) {
              return data.files[0];
            }
            throw new Error(data.message || 'File upload failed');
          }
          let uploadedBusinessPermitUrl = null;
          if (formData.businessPermit) {
            uploadedBusinessPermitUrl = await uploadFile(formData.businessPermit);
          }
          // 3. Create company
          const companyRes = await fetch('/api/companies', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: formData.companyName,
              contact_person: formData.contactPerson,
              contact_email: formData.contactEmail,
              contact_phone: formData.contactNumber,
              business_permit: uploadedBusinessPermitUrl, // use uploaded file URL
              reg_date: new Date().toISOString(),
              address: formData.companyAddress,
            })
          });
          const companyData = await companyRes.json();
          if (!companyData.success || !companyData.data?.id) throw new Error(companyData.message || 'Failed to create company');
          companyId = companyData.data.id;
          isNewCompany = true;
        }
        // 4. For each truck, check if it exists for this company, if not, create it
        const uploadedOrCrUrls = {};
        for (let i = 0; i < licensePlates.length; i++) {
          if (formData.orCrDocuments[i]) {
            // Upload OR/CR document
            const formDataUpload = new FormData();
            formDataUpload.append('file', formData.orCrDocuments[i]);
            const res = await fetch('/api/uploads/appointment', {
              method: 'POST',
              body: formDataUpload,
            });
            const data = await res.json();
            if (data.success && data.files && data.files.length > 0) {
              uploadedOrCrUrls[i] = data.files[0];
            } else {
              throw new Error(data.message || 'File upload failed');
            }
          }
        }
        let addedTrucks = 0;
        for (let i = 0; i < licensePlates.length; i++) {
          const plate = licensePlates[i];
          // Check if truck exists for this company
          const checkTruckRes = await fetch(`/api/trucks?license_plate=${encodeURIComponent(plate)}&company_id=${companyId}`);
          const checkTruckData = await checkTruckRes.json();
          if (checkTruckData.success && checkTruckData.data && checkTruckData.data.length > 0) {
            // Truck already exists for this company, skip
            continue;
          }
          // Create truck
          const orcr = uploadedOrCrUrls[i] || null;
          const truckRes = await fetch('/api/trucks', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              license_plate: plate,
              company_id: companyId,
              orcr_document: orcr
            })
          });
          const truckData = await truckRes.json();
          if (!truckData.success) throw new Error(truckData.message || 'Failed to create truck');
          addedTrucks++;
        }
        if (isNewCompany) {
          setSuccessMessage('Company and trucks registered successfully!');
        } else if (addedTrucks > 0) {
          setSuccessMessage('New trucks added to existing company successfully!');
        } else {
          setSuccessMessage('No new trucks were added (all already registered for this company).');
        }
        setShowSuccessModal(true);
        // Reset form
        setFormData({
          companyName: '',
          contactPerson: '',
          contactNumber: '',
          contactEmail: '',
          companyAddress: '',
          truckLicensePlates: [''],
          businessPermit: null,
          orCrDocuments: {},
          additionalNotes: '',
          terms: false
        });
        setLicensePlates(['']);
      } catch (error) {
        setErrorMessage(error.message || 'Registration failed.');
        setShowErrorModal(true);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {isSubmitting && <LoadingOverlay message="Processing registration..." />}

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
            <svg className="mx-auto h-12 w-12 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h2 className="text-lg font-semibold text-green-700 mb-2">Success!</h2>
            <p className="text-gray-700 mb-6">{successMessage}</p>
            <button
              onClick={() => setShowSuccessModal(false)}
              className="bg-green-600 text-white px-6 py-2 rounded-md font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full text-center">
            <svg className="mx-auto h-12 w-12 text-red-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
            <h2 className="text-lg font-semibold text-red-700 mb-2">Error</h2>
            <p className="text-gray-700 mb-6">{errorMessage}</p>
            <button
              onClick={() => setShowErrorModal(false)}
              className="bg-red-600 text-white px-6 py-2 rounded-md font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-400"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 justify-center">
            <svg className="w-5 h-5 text-[#2243B0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h1 className="text-xl font-semibold text-[#2243B0]">Company Registration</h1>
          </div>
          <p className="mt-2 text-sm text-gray-600 text-center">
            Please provide your company details to complete the registration
          </p>
        </div>
      </div>

      {/* Main Form */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Form Header */}
          <div className="bg-[#2243B0] rounded-t-lg p-4">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <h2 className="text-white font-medium">Company Registration Request</h2>
            </div>
            <p className="text-sm text-white/80 ml-7">Please provide your details to complete the company registration</p>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-6">
              {/* Left Column - Company Information */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <svg className="w-5 h-5 text-[#2243B0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  <h3 className="text-sm font-medium text-gray-900">Company Information</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700">Company Name</label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      placeholder="Enter company name"
                      className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.companyName ? 'border-red-500' : 'border-gray-300'} rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {errors.companyName && (
                      <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700">Contact Person</label>
                    <input
                      type="text"
                      name="contactPerson"
                      value={formData.contactPerson}
                      onChange={handleChange}
                      placeholder="Enter contact person name"
                      className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.contactPerson ? 'border-red-500' : 'border-gray-300'} rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {errors.contactPerson && (
                      <p className="mt-1 text-sm text-red-600">{errors.contactPerson}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700">Contact Number</label>
                    <input
                      type="tel"
                      name="contactNumber"
                      value={formData.contactNumber}
                      onChange={handleChange}
                      placeholder="09-XXX-XXXX-XXX"
                      className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.contactNumber ? 'border-red-500' : 'border-gray-300'} rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {errors.contactNumber && (
                      <p className="mt-1 text-sm text-red-600">{errors.contactNumber}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700">Contact Email</label>
                    <input
                      type="email"
                      name="contactEmail"
                      value={formData.contactEmail}
                      onChange={handleChange}
                      placeholder="Enter contact email"
                      className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.contactEmail ? 'border-red-500' : 'border-gray-300'} rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {errors.contactEmail && (
                      <p className="mt-1 text-sm text-red-600">{errors.contactEmail}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm text-gray-700">Company Address</label>
                    <input
                      type="text"
                      name="companyAddress"
                      value={formData.companyAddress}
                      onChange={handleChange}
                      placeholder="Enter company address"
                      className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.companyAddress ? 'border-red-500' : 'border-gray-300'} rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                    />
                    {errors.companyAddress && (
                      <p className="mt-1 text-sm text-red-600">{errors.companyAddress}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column - Required Documents */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <svg className="w-5 h-5 text-[#2243B0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-sm font-medium text-gray-900">Required Documents</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm text-gray-700">Business Permit Document</label>
                    <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${errors.businessPermit ? 'border-red-500' : 'border-gray-300'} border-dashed rounded-md`}>
                      <div className="space-y-1 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                          <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label htmlFor="business-permit-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-[#2243B0] hover:text-blue-500">
                            <span>Upload files</span>
                            <input id="business-permit-upload" name="business-permit-upload" type="file" className="sr-only" onChange={(e) => handleFileChange(e, 'businessPermit')} accept=".pdf,.doc,.docx" />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PDF or Word up to 5MB</p>
                      </div>
                    </div>
                    {errors.businessPermit && (
                      <p className="mt-1 text-sm text-red-600">{errors.businessPermit}</p>
                    )}
                    {formData.businessPermit && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between py-2 border-b border-gray-200">
                          <div className="flex items-center gap-2">
                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <span className="text-sm text-gray-600">
                              {formData.businessPermit.name} ({formData.businessPermit.type.split('/')[1].toUpperCase()})
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile('businessPermit')}
                            className="text-sm text-red-600 hover:text-red-700"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Truck Information Section */}
            <div className="mt-8 border-t pt-8">
              <div className="flex items-center gap-2 mb-4 justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-[#2243B0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <h3 className="text-sm font-medium text-gray-900">Truck Information</h3>
                  </div>
                  <p className="text-sm text-gray-500 mt-1 ml-7">Add details for each truck that will be registered for metrology services</p>
                </div>
                <button
                  type="button"
                  onClick={addLicensePlate}
                  className="text-[#2243B0] border border-[#2243B0] hover:bg-blue-50 px-3 py-1.5 rounded-md text-sm flex items-center gap-1 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Truck
                </button>
              </div>

              <div className="space-y-6">
                {licensePlates.map((plate, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                        <svg className="w-4 h-4 text-[#2243B0]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                        Truck Entry {index + 1}
                      </h4>
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeLicensePlate(index)}
                          className="text-red-600 hover:text-red-700 p-1.5 rounded-md hover:bg-red-50 transition-colors flex-shrink-0 border border-red-200"
                          title="Delete truck entry"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          License Plate Number
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <input
                          type="text"
                          value={plate}
                          onChange={(e) => handleLicensePlateChange(index, e.target.value)}
                          placeholder="Enter plate number (e.g., ABC 123)"
                          className={`block w-full px-3 py-2 bg-white border ${errors.licensePlates?.[index] ? 'border-red-500' : 'border-gray-300'} rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                        />
                        {errors.licensePlates?.[index] && (
                          <p className="mt-1 text-sm text-red-600">{errors.licensePlates[index]}</p>
                        )}
                      </div>
                      <div>
                        <label className="block text-sm text-gray-700 mb-1">
                          OR/CR Document
                          <span className="text-red-500 ml-1">*</span>
                        </label>
                        <div className="relative">
                          <input
                            type="file"
                            id={`file-upload-${index}`}
                            onChange={(e) => handleFileChange(e, `orCrDocument-${index}`)}
                            className="hidden"
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.xls,.xlsx,.txt,.csv"
                          />
                          <label
                            htmlFor={`file-upload-${index}`}
                            className={`flex items-center justify-between w-full px-4 py-2 border ${errors.licensePlates?.[`document-${index}`] ? 'border-red-500' : 'border-gray-300'} rounded-md bg-white cursor-pointer hover:bg-gray-50 group`}
                          >
                            <div className="flex items-center gap-2 flex-1">
                              {formData.orCrDocuments[index] ? (
                                <>
                                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                  </svg>
                                  <span className="text-sm text-gray-600">
                                    {formData.orCrDocuments[index].name}
                                  </span>
                                  <span className="text-sm text-gray-400">
                                    ({formData.orCrDocuments[index].type.split('/')[1].toUpperCase()})
                                  </span>
                                </>
                              ) : (
                                <>
                                  <svg className="w-5 h-5 text-[#2243B0] group-hover:text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                                  </svg>
                                  <span className="text-sm text-gray-500 group-hover:text-gray-600">
                                    PDF, Word, or Image
                                  </span>
                                </>
                              )}
                            </div>
                            {formData.orCrDocuments[index] && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  removeFile(`orCrDocument-${index}`);
                                }}
                                className="text-red-600 hover:text-red-700 ml-2"
                              >
                                Remove
                              </button>
                            )}
                          </label>
                        </div>
                        {errors.licensePlates?.[`document-${index}`] && (
                          <p className="mt-1 text-sm text-red-600">{errors.licensePlates[`document-${index}`]}</p>
                        )}
                        <p className="mt-1 text-xs text-gray-500">Maximum file size: 5MB</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              {licensePlates.length === 0 && (
                <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-500">No trucks added yet. Click "Add Truck" to begin.</p>
                </div>
              )}
            </div>

            {/* Additional Notes */}
            <div className="mt-6">
              <label className="block text-sm text-gray-700">Additional Notes</label>
              <textarea
                name="additionalNotes"
                value={formData.additionalNotes}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Additional Infos."
              />
            </div>
   
            {/* Terms and Submit */}
            <div className="mt-6 space-y-4">
              <div className="flex items-start">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={formData.terms}
                  onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.checked }))}
                  className={`mt-1 h-4 w-4 text-[#2243B0] border-gray-300 rounded focus:ring-blue-500 ${errors.terms ? 'border-red-500' : ''}`}
                />
                <label htmlFor="terms" className="ml-2 text-sm text-gray-600">
                  I agree to the <a href="#" className="text-[#2243B0] hover:underline">Terms of Service</a> and <a href="#" className="text-[#2243B0] hover:underline">Privacy Policy</a>
                </label>
              </div>
              {errors.terms && (
                <p className="text-sm text-red-600">{errors.terms}</p>
              )}

              <button
                type="submit"
                className="w-full bg-[#2243B0] text-white px-6 py-3 rounded-md text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Register Company
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 

