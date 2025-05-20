'use client';

import { useState } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import LoadingOverlay from '@/components/shared/LoadingOverlay';

function ResultModal({ isOpen, onClose, success, message, appointmentId }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg max-w-md w-full p-6">
        <div className="flex items-center gap-3 mb-4">
          {success ? (
            <svg className="h-7 w-7 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          ) : (
            <svg className="h-7 w-7 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          )}
          <h3 className={`text-lg font-semibold ${success ? 'text-green-700' : 'text-red-700'}`}>{success ? 'Submission Successful' : 'Submission Failed'}</h3>
        </div>
        <div className={`mb-4 text-sm ${success ? 'text-green-700' : 'text-red-700'}`}>{message}</div>
        {success && appointmentId && (
          <div className="mb-4 text-sm text-gray-700">Your Appointment ID: <span className="font-semibold">{appointmentId}</span></div>
        )}
        <div className="flex justify-end">
          <button onClick={onClose} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium">Close</button>
        </div>
      </div>
    </div>
  );
}

export default function ResearchConsultation() {
    const [formData, setFormData] = useState({
        fullName: '',
        sex: '',
        emailAddress: '',
        contactNumber: '',
        institution: '',
        typeOfResearch: 'Chemical',
        yearLevel: '',
        researchTitle: '',
        consultationDetails: '',
        terms: false
    });

    const [errors, setErrors] = useState({});
    const [selectedFiles, setSelectedFiles] = useState([]);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState({
        success: false,
        message: '',
        appointmentId: null
    });
    const [showResultModal, setShowResultModal] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 3) {
            alert('You can only upload up to 3 files');
            return;
        }
        
        const validFiles = files.filter(file => {
            const isValidType = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'].includes(file.type);
            const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
            return isValidType && isValidSize;
        });

        if (validFiles.length !== files.length) {
            alert('Some files were rejected. Please only upload PDF or Word documents under 5MB.');
        }

        setSelectedFiles(validFiles);
    };

    const handleRemoveFile = (index) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const validateForm = () => {
        const newErrors = {};

        // Personal Information validation
        if (!formData.fullName) newErrors.fullName = 'Please enter your full name';
        if (!formData.sex) newErrors.sex = 'Please select your sex';
        if (!formData.emailAddress) newErrors.emailAddress = 'Please enter your email address';
        if (!formData.contactNumber) newErrors.contactNumber = 'Please enter your contact number';
        if (!formData.institution) newErrors.institution = 'Please enter your institution';
        if (!formData.yearLevel) newErrors.yearLevel = 'Please enter your year level/position';
        if (!formData.researchTitle) newErrors.researchTitle = 'Please enter your research title or topic';

        // Schedule Appointment validation
        if (!selectedDate) newErrors.appointmentDate = 'Please select an appointment date';
        if (!formData.consultationDetails) newErrors.consultationDetails = 'Please describe your research and consultation needs';
        if (selectedFiles.length === 0) newErrors.files = 'Please upload at least one research paper';

        // Terms validation
        if (!formData.terms) newErrors.terms = 'Please agree to the Terms of Service and Privacy Policy';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (validateForm()) {
            setIsSubmitting(true);
            try {
                // Upload files first
                let uploadedFiles = [];
                if (selectedFiles.length > 0) {
                    for (const file of selectedFiles) {
                        const formDataUpload = new FormData();
                        formDataUpload.append('file', file);
                        const res = await fetch('/api/uploads/appointment', {
                            method: 'POST',
                            body: formDataUpload,
                        });
                        const data = await res.json();
                        if (data.success && data.files && data.files.length > 0) {
                            uploadedFiles.push(data.files[0]);
                        } else {
                            throw new Error(data.message || 'File upload failed');
                        }
                    }
                }
                const formDataToSubmit = {
                    ...formData,
                    selectedDate: selectedDate ? selectedDate.toISOString() : null,
                    uploadedFiles
                };
                const response = await fetch('/api/appointments/research-consultation', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formDataToSubmit),
                });
                const data = await response.json();
                if (data.success) {
                    setSubmissionStatus({
                        success: true,
                        message: 'Thank you! Your research consultation request has been received. You will receive a confirmation email shortly.',
                        appointmentId: data.appointmentId
                    });
                    setShowResultModal(true);
                    setFormData({
                        fullName: '',
                        sex: '',
                        emailAddress: '',
                        contactNumber: '',
                        institution: '',
                        typeOfResearch: 'Chemical',
                        yearLevel: '',
                        researchTitle: '',
                        consultationDetails: '',
                        terms: false
                    });
                    setSelectedDate(null);
                    setSelectedFiles([]);
                } else {
                    setSubmissionStatus({
                        success: false,
                        message: data.message || 'Sorry, we could not process your request. Please check your details and try again.'
                    });
                    setShowResultModal(true);
                }
            } catch (error) {
                setSubmissionStatus({
                    success: false,
                    message: error.message || 'A network error occurred. Please check your connection and try again.'
                });
                setShowResultModal(true);
            } finally {
                setIsSubmitting(false);
            }
        }
    };

    // Calendar functions
    const getDaysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
    };

    const renderCalendar = () => {
        const daysInMonth = getDaysInMonth(currentDate);
        const firstDay = getFirstDayOfMonth(currentDate);
        const days = [];

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-8" />);
        }

        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
            const isSelected = selectedDate && date.toDateString() === selectedDate.toDateString();
            const isToday = date.toDateString() === new Date().toDateString();
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;

            days.push(
                <button
                    key={day}
                    onClick={() => setSelectedDate(date)}
                    disabled={isWeekend}
                    className={`h-8 w-8 mx-auto flex items-center justify-center rounded-full transition-colors
                        ${isSelected ? 'bg-blue-600 text-white' : ''}
                        ${isToday && !isSelected ? 'bg-blue-50 text-blue-600' : ''}
                        ${isWeekend ? 'text-red-300' : 'text-gray-900'}
                        ${!isSelected && !isToday && !isWeekend ? 'hover:bg-gray-100' : ''}
                    `}
                >
                    {day}
                </button>
            );
        }

        return days;
    };

    return (
        <div className="min-h-screen bg-gray-50 py-4 sm:py-8">
            {isSubmitting && <LoadingOverlay message="Submitting your request..." />}
            <div className="max-w-[98rem] mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="flex items-center justify-center gap-2 text-blue-600 mb-2">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <h1 className="text-lg sm:text-xl font-semibold">Research Consultation</h1>
                </div>
                <p className="text-center text-xs sm:text-sm text-gray-600 mb-4 sm:mb-6">
                    Schedule a consultation with our research experts to discuss your project needs
                </p>

                {/* Main Form */}
                <div className="bg-blue-600 rounded-t-lg p-3 sm:p-4">
                    <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <h2 className="text-sm sm:text-base text-white font-medium">Research Consultation Request</h2>
                    </div>
                    <p className="text-xs sm:text-sm text-white/80 ml-6 sm:ml-7">Please provide your details to schedule a consultation with our research team</p>
                </div>

                <div className="bg-white rounded-b-lg shadow-sm p-4 sm:p-6">
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-2 gap-x-6 sm:gap-x-12 gap-y-4 sm:gap-y-6">
                        {/* Left Column - Personal Information */}
                        <div>
                            <div className="flex items-center gap-2 mb-4 sm:mb-6">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <h3 className="text-sm font-medium text-gray-900">Personal Information</h3>
                            </div>

                            <div className="space-y-3 sm:space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-700">Full Name</label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="Enter your full name"
                                        className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                                    />
                                    {errors.fullName && (
                                        <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-700">Sex</label>
                                    <select
                                        name="sex"
                                        value={formData.sex}
                                        onChange={handleChange}
                                        className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.sex ? 'border-red-500' : 'border-gray-300'} rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                                    >
                                        <option value="">Select</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                        <option value="Other">Other</option>
                                    </select>
                                    {errors.sex && (
                                        <p className="mt-1 text-sm text-red-600">{errors.sex}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-700">Email Address</label>
                                    <input
                                        type="email"
                                        name="emailAddress"
                                        value={formData.emailAddress}
                                        onChange={handleChange}
                                        placeholder="Enter your email address"
                                        className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.emailAddress ? 'border-red-500' : 'border-gray-300'} rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                                    />
                                    {errors.emailAddress && (
                                        <p className="mt-1 text-sm text-red-600">{errors.emailAddress}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-700">Contact Number</label>
                                    <input
                                        type="tel"
                                        name="contactNumber"
                                        value={formData.contactNumber}
                                        onChange={handleChange}
                                        placeholder="Enter your contact number"
                                        className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.contactNumber ? 'border-red-500' : 'border-gray-300'} rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                                    />
                                    {errors.contactNumber && (
                                        <p className="mt-1 text-sm text-red-600">{errors.contactNumber}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-700">School / University / Institution</label>
                                    <input
                                        type="text"
                                        name="institution"
                                        value={formData.institution}
                                        onChange={handleChange}
                                        placeholder="Enter your institution"
                                        className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.institution ? 'border-red-500' : 'border-gray-300'} rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                                    />
                                    {errors.institution && (
                                        <p className="mt-1 text-sm text-red-600">{errors.institution}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-700">Type of Research</label>
                                    <select
                                        name="typeOfResearch"
                                        value={formData.typeOfResearch}
                                        onChange={handleChange}
                                        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    >
                                        <option value="Chemical">Chemical</option>
                                        <option value="Biological">Biological</option>
                                        <option value="Physical">Physical</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-700">Year Level / Position</label>
                                    <input
                                        type="text"
                                        name="yearLevel"
                                        value={formData.yearLevel}
                                        onChange={handleChange}
                                        placeholder="e.g. Senior Graduate"
                                        className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.yearLevel ? 'border-red-500' : 'border-gray-300'} rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                                    />
                                    {errors.yearLevel && (
                                        <p className="mt-1 text-sm text-red-600">{errors.yearLevel}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-700">Research Title / Topic</label>
                                    <input
                                        type="text"
                                        name="researchTitle"
                                        value={formData.researchTitle}
                                        onChange={handleChange}
                                        placeholder="Enter your research title or topic"
                                        className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.researchTitle ? 'border-red-500' : 'border-gray-300'} rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                                    />
                                    {errors.researchTitle && (
                                        <p className="mt-1 text-sm text-red-600">{errors.researchTitle}</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Right Column - Schedule Appointment */}
                        <div>
                            <div className="flex items-center gap-2 mb-4 sm:mb-6">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <h3 className="text-sm font-medium text-gray-900">Schedule Appointment</h3>
                            </div>

                            <div className="space-y-3 sm:space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-700">Select Date</label>
                                    <div className={`mt-1 bg-white border ${errors.appointmentDate ? 'border-red-500' : 'border-gray-300'} rounded-md overflow-hidden`}>
                                        <div className="px-4 py-2 flex items-center justify-between bg-white">
                                            <button
                                                type="button"
                                                onClick={handlePrevMonth}
                                                className="p-1 hover:bg-gray-100 rounded-full"
                                            >
                                                <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
                                            </button>
                                            <span className="text-sm font-medium">
                                                {currentDate.toLocaleString('default', { month: 'long' })} {currentDate.getFullYear()}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={handleNextMonth}
                                                className="p-1 hover:bg-gray-100 rounded-full"
                                            >
                                                <ChevronRightIcon className="w-5 h-5 text-gray-600" />
                                            </button>
                                        </div>
                                        <div className="border-t border-gray-200">
                                            <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-500">
                                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                                                    <div key={i} className="py-2">{day}</div>
                                                ))}
                                            </div>
                                            <div className="grid grid-cols-7 gap-px text-sm">
                                                {renderCalendar()}
                                            </div>
                                        </div>
                                        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
                                            <div className="flex items-center gap-2">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                                                    <span className="text-xs text-gray-600">Selected Date</span>
                                                </div>
                                                <div className="flex items-center gap-2 ml-4">
                                                    <div className="w-2 h-2 bg-red-300 rounded-full"></div>
                                                    <span className="text-xs text-gray-600">Unavailable</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    {errors.appointmentDate && (
                                        <p className="mt-1 text-sm text-red-600">{errors.appointmentDate}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <label className="block text-sm text-gray-700">Upload Research Papers</label>
                                    <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 ${errors.files ? 'border-red-500' : 'border-gray-300'} border-dashed rounded-md`}>
                                        <div className="space-y-1 text-center">
                                            <svg
                                                className="mx-auto h-12 w-12 text-gray-400"
                                                stroke="currentColor"
                                                fill="none"
                                                viewBox="0 0 48 48"
                                                aria-hidden="true"
                                            >
                                                <path
                                                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                                    strokeWidth={2}
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                />
                                            </svg>
                                            <div className="flex text-sm text-gray-600">
                                                <label
                                                    htmlFor="file-upload"
                                                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                                                >
                                                    <span>Upload files</span>
                                                    <input
                                                        id="file-upload"
                                                        name="file-upload"
                                                        type="file"
                                                        className="sr-only"
                                                        multiple
                                                        accept=".pdf,.doc,.docx"
                                                        onChange={handleFileChange}
                                                    />
                                                </label>
                                                <p className="pl-1">or drag and drop</p>
                                            </div>
                                            <p className="text-xs text-gray-500">PDF or Word up to 5MB (max 3 files)</p>
                                        </div>
                                    </div>
                                    {errors.files && (
                                        <p className="mt-1 text-sm text-red-600">{errors.files}</p>
                                    )}
                                    {selectedFiles.length > 0 && (
                                        <div className="mt-2">
                                            <h4 className="text-sm font-medium text-gray-700">Selected Files:</h4>
                                            <ul className="mt-2">
                                                {selectedFiles.map((file, index) => (
                                                    <li key={index} className="py-2 flex items-center justify-between border-b border-gray-200 last:border-0">
                                                        <div className="flex items-center gap-2">
                                                            <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                            </svg>
                                                            <span className="text-sm text-gray-600">
                                                                {file.name} ({file.type.split('/')[1].toUpperCase()})
                                                            </span>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleRemoveFile(index)}
                                                            className="text-sm text-red-600 hover:text-red-700"
                                                        >
                                                            Remove
                                                        </button>
                                                    </li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm text-gray-700">Consultation Details</label>
                                    <textarea
                                        name="consultationDetails"
                                        value={formData.consultationDetails}
                                        onChange={handleChange}
                                        rows={4}
                                        placeholder="Briefly describe your research and what you'd like to discuss during the consultation..."
                                        className={`mt-1 block w-full px-3 py-2 bg-white border ${errors.consultationDetails ? 'border-red-500' : 'border-gray-300'} rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500`}
                                    />
                                    {errors.consultationDetails && (
                                        <p className="mt-1 text-sm text-red-600">{errors.consultationDetails}</p>
                                    )}
                                </div>

                                <div className="bg-blue-50 border border-blue-100 rounded-md p-3 sm:p-4">
                                    <div className="flex items-center gap-2">
                                        <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span className="text-sm font-medium text-blue-800">Consultation Guidelines</span>
                                    </div>
                                    <ul className="mt-2 text-xs sm:text-sm text-blue-600 space-y-1 ml-6 sm:ml-7 list-disc">
                                        <li>Consultations are limited to 60 minutes per session</li>
                                        <li>Please arrive 10 minutes before your scheduled time</li>
                                        <li>Bring any relevant research materials or files</li>
                                        <li>Cancellations should be made at least 24 hours in advance</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Terms and Submit Button */}
                        <div className="col-span-1 lg:col-span-2 space-y-4 sm:space-y-6 mt-2 sm:mt-4">
                            <div className="flex items-start">
                                <input
                                    id="terms"
                                    name="terms"
                                    type="checkbox"
                                    checked={formData.terms}
                                    onChange={(e) => setFormData(prev => ({ ...prev, terms: e.target.checked }))}
                                    className={`mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 ${errors.terms ? 'border-red-500' : ''}`}
                                />
                                <label htmlFor="terms" className="ml-2 text-xs sm:text-sm text-gray-600">
                                    I accept <a href="#" className="text-blue-600 hover:underline">Terms of Service and Privacy Policy</a>
                                </label>
                            </div>
                            {errors.terms && (
                                <p className="text-sm text-red-600">{errors.terms}</p>
                            )}

                            <div className="flex justify-end">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {isSubmitting ? 'Submitting...' : 'Schedule Consultation'}
                                </button>
                            </div>
                        </div>
                    </form>
                    
                    {/* Success/Error Message */}
                    <ResultModal
                        isOpen={showResultModal}
                        onClose={() => setShowResultModal(false)}
                        success={submissionStatus.success}
                        message={submissionStatus.message}
                        appointmentId={submissionStatus.appointmentId}
                    />
                </div>
            </div>
        </div>
    );
} 