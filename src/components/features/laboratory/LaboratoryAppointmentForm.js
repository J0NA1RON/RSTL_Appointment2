'use client';

import { useState, useEffect, useRef } from 'react';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { CheckCircleIcon } from '@heroicons/react/24/solid';

// Import components
import ContactInformation from './ContactInformation';
import AppointmentCalendar from './AppointmentCalendar';
import SampleDetails from './SampleDetails';
import ServiceSelection from './ServiceSelection';
import ShelfLifeDetails from './ShelfLifeDetails';
import ReviewSection from './ReviewSection';
import { SubmissionStatus, DeleteConfirmModal } from './Notifications';
import LoadingOverlay from '@/components/shared/LoadingOverlay';

const formatDateLocal = (date) => {
  const pad = (n) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};


// Progress Stepper Component
const ProgressStepper = ({ currentStep, isShelfLifeSelected }) => {
  const steps = [
    { id: 'contact', label: 'Contact Info' },
    { id: 'sample', label: 'Sample Details' },
    ...(isShelfLifeSelected ? [{ id: 'shelflife', label: 'Shelf Life' }] : []),
    { id: 'review', label: 'Review' }
  ];

  return (
    <div className="w-full py-6">
      <div className="flex items-center justify-center">
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-center">
            <div className={`flex items-center justify-center ${
              currentStep === step.id 
                ? 'text-white bg-blue-600'
                : steps.indexOf({ id: currentStep }) > index
                  ? 'text-white bg-green-500'
                  : 'text-gray-500 bg-gray-200'
              } rounded-full h-8 w-8 transition-colors duration-200`}>
              {steps.indexOf({ id: currentStep }) > index ? (
                <CheckCircleIcon className="h-6 w-6" />
              ) : (
                <span className="text-sm font-medium">{index + 1}</span>
              )}
            </div>
            <span className={`ml-2 text-sm font-medium ${
              currentStep === step.id 
                ? 'text-blue-600'
                : steps.indexOf({ id: currentStep }) > index
                  ? 'text-green-500'
                  : 'text-gray-500'
            }`}>
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <div className={`h-0.5 w-12 mx-4 ${
                steps.indexOf({ id: currentStep }) > index
                  ? 'bg-green-500'
                  : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ReviewPageModal: User-friendly modal for review page success/error
function ReviewPageModal({ open, success, message, appointmentIds, onClose }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 flex flex-col items-center text-center">
        {success ? (
          <CheckCircleIcon className="h-20 w-20 text-green-500 mb-4" aria-hidden="true" />
        ) : (
          <XMarkIcon className="h-20 w-20 text-red-500 mb-4" aria-hidden="true" />
        )}
        <h2 className="text-2xl font-bold mb-2">{success ? 'Appointment Booked!' : 'Something Went Wrong'}</h2>
        <p className="text-gray-700 mb-4">
          {success
            ? 'Your appointment has been successfully booked! You will receive a confirmation email shortly.'
            : message}
        </p>
        <button
          type="button"
          onClick={onClose}
          className={`px-8 py-3 text-base font-semibold text-white rounded-lg w-full mt-2 focus:outline-none focus:ring-2 focus:ring-offset-2 ${success ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-red-600 hover:bg-red-700 focus:ring-red-500'}`}
          autoFocus
        >
          OK
        </button>
      </div>
    </div>
  );
}

export default function LaboratoryAppointmentForm() {
  // States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [appointmentToDelete, setAppointmentToDelete] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [appointments, setAppointments] = useState([{
    id: 1,
    // General Information
    clientName: '',
    emailAddress: '',
    phoneNumber: '',
    organization: '',
    sex: '',
    sampleName: '',
    sampleType: '',
    quantity: '',
    preferredDate: '',
    sampleDescription: '',
    
    // Testing Services
    selectedServices: [],
    searchQuery: '',
    currentServiceTab: 'chemical',
    shelfLifeServices: {},
    
    // Shelf Life Details
    objectiveOfStudy: '',
    productName: '',
    netWeight: '',
    brandName: '',
    existingMarket: '',
    productionType: '',
    methodOfPreservation: '',
    productIngredients: '',
    packagingMaterial: '',
    targetShelfLife: '',
    modeOfDeterioration: [''],
    existingPermitsFile: null,
    productImageFile: null,
    hasAttemptedSubmit: false
  }]);

  const [currentAppointmentIndex, setCurrentAppointmentIndex] = useState(0);
  const [errors, setErrors] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [currentStep, setCurrentStep] = useState('contact');
  const [bookedDates, setBookedDates] = useState([]);
  const [isSelectingService, setIsSelectingService] = useState(false);
  const [servicesData, setServicesData] = useState({});
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState(null);

  // Add useEffect to log errors state changes
  useEffect(() => {
    console.log("Errors state updated:", errors);
  }, [errors]);

  // Fetch services on mount
  useEffect(() => {
    async function fetchServices() {
      setServicesLoading(true);
      try {
        const res = await fetch('/api/services');
        const json = await res.json();
        if (json.success) {
          setServicesData(json.data);
        } else {
          setServicesError(json.message || 'Failed to load services');
        }
      } catch (error) {
        setServicesError(error.message || 'Failed to load services');
      }
      setServicesLoading(false);
    }
    fetchServices();
  }, []);

  // Handle contact info change
  const handleContactInfoChange = (name, value) => {
    setAppointments(prev => {
      // Always update the field for all appointments
      return prev.map(appointment => ({
        ...appointment,
        [name]: value
      }));
    });
    // Remove error for the field being edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    // Re-validate this field immediately
    if (name === 'sex' && value) {
      setErrors(prev => {
        const newErrors = { ...prev };
        if (newErrors.sex && value) delete newErrors.sex;
        return newErrors;
      });
    }
  };

  // Handle appointment field change
  const handleAppointmentChange = (name, value) => {
    setAppointments(prev => {
      const newAppointments = [...prev];
      newAppointments[currentAppointmentIndex] = {
        ...newAppointments[currentAppointmentIndex],
        [name]: value
      };
      return newAppointments;
    });
    // Remove error for the field being edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
    // Re-validate this field immediately
    if (name && value) {
      setErrors(prev => {
        const newErrors = { ...prev };
        if (newErrors[name] && value) delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    setSelectedDate(date);
    const localDateString = formatDateLocal(date);

    // Update preferred date for all appointments
    setAppointments(prev => 
      prev.map(appointment => ({
        ...appointment,
        preferredDate: localDateString
      }))
    );
  };

  // Handle service selection
  const handleServiceSelection = (serviceId) => {
    setAppointments(prev => {
      const newAppointments = [...prev];
      const current = newAppointments[currentAppointmentIndex];
      let updatedSelected;
      if (current.selectedServices.includes(serviceId)) {
        updatedSelected = current.selectedServices.filter(id => id !== serviceId);
      } else {
        updatedSelected = [...current.selectedServices, serviceId];
      }
      newAppointments[currentAppointmentIndex] = {
        ...current,
        selectedServices: updatedSelected
      };
      return newAppointments;
    });
  };

  // Handle service tab change
  const handleServiceTabChange = (tab) => {
    // Set the flag to prevent validation during tab change
    setIsSelectingService(true);
    
    // Don't perform validation when switching tabs
    setAppointments(prev => {
      const newAppointments = [...prev];
      newAppointments[currentAppointmentIndex] = {
        ...newAppointments[currentAppointmentIndex],
        currentServiceTab: tab
      };
      return newAppointments;
    });
    
    // Remove service-related errors when changing tabs
    if (errors.services || errors.selectedServices) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.services;
        delete newErrors.selectedServices;
        return newErrors;
      });
    }
    
    // Reset the flag after a short delay
    setTimeout(() => {
      setIsSelectingService(false);
    }, 100);
  };

  // Handle shelf life service change
  const handleShelfLifeServiceChange = (serviceId) => {
    setAppointments(prev => {
      const newAppointments = [...prev];
      const current = newAppointments[currentAppointmentIndex];
      const updatedShelfLife = {
        ...current.shelfLifeServices,
        [serviceId]: !current.shelfLifeServices[serviceId]
      };
      newAppointments[currentAppointmentIndex] = {
        ...current,
        shelfLifeServices: updatedShelfLife
      };
      return newAppointments;
    });
  };

  // Handle search query change
  const handleSearchChange = (e) => {
    // Set the flag to prevent validation during search
    setIsSelectingService(true);
    
    setAppointments(prev => {
      const newAppointments = [...prev];
      newAppointments[currentAppointmentIndex] = {
        ...newAppointments[currentAppointmentIndex],
        searchQuery: e.target.value
      };
      return newAppointments;
    });
    
    // Reset the flag after a short delay
    setTimeout(() => {
      setIsSelectingService(false);
    }, 100);
  };

  // Handle mode of deterioration change
  const handleModeChange = (index, value) => {
    setAppointments(prev => {
      const newAppointments = [...prev];
      const newModes = [...newAppointments[currentAppointmentIndex].modeOfDeterioration];
      newModes[index] = value;
      newAppointments[currentAppointmentIndex] = {
        ...newAppointments[currentAppointmentIndex],
        modeOfDeterioration: newModes
      };
      return newAppointments;
    });
  };

  // Add new mode of deterioration
  const handleAddMode = () => {
    setAppointments(prev => {
      const newAppointments = [...prev];
      newAppointments[currentAppointmentIndex] = {
        ...newAppointments[currentAppointmentIndex],
        modeOfDeterioration: [...newAppointments[currentAppointmentIndex].modeOfDeterioration, '']
      };
      return newAppointments;
    });
  };

  // Remove mode of deterioration
  const handleRemoveMode = (indexToRemove) => {
    setAppointments(prev => {
      const newAppointments = [...prev];
      newAppointments[currentAppointmentIndex] = {
        ...newAppointments[currentAppointmentIndex],
        modeOfDeterioration: newAppointments[currentAppointmentIndex].modeOfDeterioration.filter((_, index) => index !== indexToRemove)
      };
      return newAppointments;
    });
  };

  // Handle file change
  const handleFileChange = (e, fieldName) => {
    const file = e.target.files[0];
    setAppointments(prev => {
      const newAppointments = [...prev];
      newAppointments[currentAppointmentIndex] = {
        ...newAppointments[currentAppointmentIndex],
        [fieldName]: file
      };
      return newAppointments;
    });
  };

  // Add new appointment tab
  const addNewAppointment = () => {
    if (!selectedDate) {
      return;
    }
    const first = appointments[0] || {};
    const localDateString = formatDateLocal(selectedDate);
    
    const newAppointment = {
      id: appointments.length + 1,
      // Keep contact information from the first appointment
      clientName: first.clientName,
      emailAddress: first.emailAddress,
      phoneNumber: first.phoneNumber,
      organization: first.organization,
      sex: first.sex,
      // Set the preferred date to the selected date
      preferredDate: localDateString,
      // Reset other fields
      sampleName: '',
      sampleType: '',
      quantity: '',
      sampleDescription: '',
      selectedServices: [],
      searchQuery: '',
      currentServiceTab: 'chemical',
      shelfLifeServices: {},
      objectiveOfStudy: '',
      productName: '',
      netWeight: '',
      brandName: '',
      existingMarket: '',
      productionType: '',
      methodOfPreservation: '',
      productIngredients: '',
      packagingMaterial: '',
      targetShelfLife: '',
      modeOfDeterioration: [''],
      existingPermitsFile: null,
      productImageFile: null,
      hasAttemptedSubmit: false
    };
    setAppointments([...appointments, newAppointment]);
    setCurrentAppointmentIndex(appointments.length);
    setErrors({});
  };

  // Handle delete appointment
  const handleDeleteAppointment = (index) => {
    setAppointmentToDelete(index);
    setShowDeleteModal(true);
  };

  // Confirm delete appointment
  const confirmDeleteAppointment = () => {
    // console.log("confirmDeleteAppointment called for index:", appointmentToDelete); // Remove log
    if (appointments.length <= 1) {
      // console.warn('Cannot delete the only appointment'); // Removed log
      setShowDeleteModal(false);
      return;
    }
    
    setAppointments(prev => prev.filter((_, i) => i !== appointmentToDelete));
    
    if (currentAppointmentIndex >= appointments.length - 1) {
      setCurrentAppointmentIndex(Math.max(0, appointments.length - 2));
    }
    
    setShowDeleteModal(false);
    setAppointmentToDelete(null);
  };

  // Validation functions
  const validateContactInfo = () => {
    const newErrors = {};
    const currentAppointment = appointments[0]; // Always validate the first (global) contact info

    if (!currentAppointment.clientName?.trim()) {
      newErrors.clientName = 'Client name is required';
    }
    if (!currentAppointment.emailAddress?.trim()) {
      newErrors.emailAddress = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(currentAppointment.emailAddress)) {
      newErrors.emailAddress = 'Please enter a valid email address';
    }
    if (!currentAppointment.phoneNumber?.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    }
    if (!currentAppointment.sex?.trim()) {
      newErrors.sex = 'Please select your sex (gender)';
    }
    
    // Return validation result object
    return {
      isValid: Object.keys(newErrors).length === 0,
      errors: newErrors
    };
  };

  const validateSampleDetails = () => {
    const newErrors = {};
    const currentAppointment = appointments[currentAppointmentIndex];

    if (!currentAppointment.sampleName) newErrors.sampleName = 'Please enter sample name';
    if (!currentAppointment.quantity) {
      newErrors.quantity = 'Please enter quantity';
    } else if (!/\d/.test(currentAppointment.quantity)) {
      newErrors.quantityFormat = 'Quantity must include at least one number (e.g., "4 liters", "500g")';
    }
    if (!currentAppointment.preferredDate) newErrors.preferredDate = 'Please select a preferred date';
    if (!currentAppointment.sampleDescription) newErrors.sampleDescription = 'Please enter sample description';

    // Only require at least one service selected across all labs
    const anyServiceSelected =
      (currentAppointment.selectedServices && currentAppointment.selectedServices.length > 0) ||
      (currentAppointment.shelfLifeServices && Object.values(currentAppointment.shelfLifeServices).some(val => val === true));
    if (!anyServiceSelected) {
      newErrors.services = 'Please select at least one service before continuing.';
    }

    // DON'T setErrors here
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors }; // Return error object
  };

  const validateShelfLifeDetails = () => {
    const newErrors = {};
    const currentAppointment = appointments[currentAppointmentIndex];
    
    if (!currentAppointment.objectiveOfStudy) newErrors.objectiveOfStudy = 'Please enter objective of study';
    if (!currentAppointment.productName) newErrors.productName = 'Please enter product name';
    if (!currentAppointment.netWeight) newErrors.netWeight = 'Please enter net weight';
    if (!currentAppointment.brandName) newErrors.brandName = 'Please enter brand name';
    if (!currentAppointment.existingMarket) newErrors.existingMarket = 'Please enter existing market';
    if (!currentAppointment.productionType) newErrors.productionType = 'Please enter production type';
    if (!currentAppointment.methodOfPreservation) newErrors.methodOfPreservation = 'Please enter method of preservation';
    if (!currentAppointment.productIngredients) newErrors.productIngredients = 'Please enter product ingredients';
    if (!currentAppointment.packagingMaterial) newErrors.packagingMaterial = 'Please enter packaging material';
    if (!currentAppointment.targetShelfLife) newErrors.targetShelfLife = 'Please enter target shelf life';
    if (currentAppointment.modeOfDeterioration.length === 0 || currentAppointment.modeOfDeterioration[0] === '') {
      newErrors.modeOfDeterioration = 'Please enter at least one mode of deterioration';
    }
    
    // DON'T setErrors here
    return { isValid: Object.keys(newErrors).length === 0, errors: newErrors }; // Return error object
  };

  const validateForm = () => {
    const contactValidation = validateContactInfo();
    if (!contactValidation.isValid) {
      setErrors(contactValidation.errors);
        return false;
    }

    let allAppointmentsValid = true;
    let combinedErrors = {}; // Keep combined errors locally for this validation pass

    for (let i = 0; i < appointments.length; i++) {
        const currentIndex = currentAppointmentIndex; 
        setCurrentAppointmentIndex(i); 

        const sampleValidation = validateSampleDetails();
        combinedErrors = { ...combinedErrors, ...sampleValidation.errors }; 
        if (!sampleValidation.isValid) {
            allAppointmentsValid = false;
        }

        const currentApp = appointments[i]; 
        const hasShelfLife = Object.values(currentApp.shelfLifeServices).some(value => value);
        if (hasShelfLife) {
            const shelfLifeValidation = validateShelfLifeDetails();
            combinedErrors = { ...combinedErrors, ...shelfLifeValidation.errors }; 
            if (!shelfLifeValidation.isValid) {
                allAppointmentsValid = false;
            }
        }
        
        setCurrentAppointmentIndex(currentIndex); 
    }
    
    setErrors(combinedErrors); // Set all collected errors at the end
    return allAppointmentsValid;
  };

  // Navigation functions
  const handleNextStep = () => {
    let validationResult = { isValid: false, errors: {} };
    
    switch (currentStep) {
      case 'contact':
        validationResult = validateContactInfo();
        setErrors(validationResult.errors);
        if (validationResult.isValid) {
          setCurrentStep('sample');
        }
        break;
      case 'sample':
        const emptyTabIndex = appointments.findIndex(
          (appointment) => !appointment.sampleName && !appointment.quantity && !appointment.sampleDescription
        );

        if (emptyTabIndex !== -1 && appointments.length > 1) {
          setErrors(prev => ({ ...prev, global: `Please fill out Appointment ${emptyTabIndex + 1} or remove it.` }));
          return;
        }

        validationResult = validateSampleDetails();
        setErrors(validationResult.errors);
        if (validationResult.isValid) {
           const hasShelfLife = appointments.some(appointment => 
             Object.values(appointment.shelfLifeServices).some(value => value));
           setCurrentStep(hasShelfLife ? 'shelflife' : 'review');
        }
        break;
      case 'shelflife':
        validationResult = validateShelfLifeDetails();
        setErrors(validationResult.errors);
        if (validationResult.isValid) {
          setCurrentStep('review');
        }
        break;
      default:
        break;
    }
  };

  const handlePreviousStep = () => {
    // Clear errors when going back
    setErrors({}); 
    switch (currentStep) {
      case 'sample':
        setCurrentStep('contact');
        break;
      case 'shelflife':
        setCurrentStep('sample');
        break;
      case 'review':
        const hasShelfLife = appointments.some(appointment => 
          Object.values(appointment.shelfLifeServices).some(value => value));
        setCurrentStep(hasShelfLife ? 'shelflife' : 'sample');
        break;
      default:
        break;
    }
  };

  const handleContinueToShelfLife = () => {
    const validationResult = validateSampleDetails();
    setErrors(validationResult.errors);
    if (validationResult.isValid) {
      setCurrentStep('shelflife');
    }
  };

  const isShelfLifeSelected = () => {
    return Object.values(appointments[currentAppointmentIndex].shelfLifeServices).some(value => value);
  };

  // Form submission
  const checkIfSubmissionAllowed = () => {
    return currentStep === 'review' && !isSubmitting;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('[DEBUG] handleSubmit called');
    const isValid = validateForm();
    console.log('[DEBUG] validateForm result:', isValid);
    if (!isValid) return;
    setIsSubmitting(true);
    setSubmissionStatus(null);
    try {
      const results = [];
      for (const appointment of appointments) {
        const selectedServiceIds = appointment.selectedServices || [];
        const shelfLifeServiceIds = Object.entries(appointment.shelfLifeServices || {})
          .filter(([id, selected]) => selected)
          .map(([id]) => parseInt(id, 10));
        const servicesByCategory = {};
        const allServicesFlat = Object.entries(servicesData).reduce((acc, [category, services]) => {
          services.forEach(service => {
            acc[service.id] = { ...service, serviceType: category };
          });
          return acc;
        }, {});
        // Standard services
        selectedServiceIds.forEach(id => {
          const service = allServicesFlat[id];
          if (service) {
            if (!servicesByCategory[service.serviceType]) servicesByCategory[service.serviceType] = [];
            servicesByCategory[service.serviceType].push(service);
          }
        });
        // Shelf life services
        if (shelfLifeServiceIds.length > 0) {
          servicesByCategory['shelf_life'] = shelfLifeServiceIds.map(id => allServicesFlat[id]).filter(Boolean);
        }
        for (const [category, services] of Object.entries(servicesByCategory)) {
          const formData = {
            // Common customer data
            name: appointment.clientName,
            email: appointment.emailAddress,
            contact_number: appointment.phoneNumber,
            company_name: appointment.organization,
            sex: appointment.sex,
            // Sample data
            name_of_samples: appointment.sampleName,
            sample_type: appointment.sampleType || 'Not specified',
            sample_quantity: appointment.quantity,
            sample_description: appointment.sampleDescription,
            date: appointment.preferredDate,
            terms: true,
            category,
            service_id: services.map(s => s.id),
            // Shelf life details (if applicable)
            ...(category === 'shelf_life' ? {
              objective_of_study: appointment.objectiveOfStudy,
              product_type: appointment.productName,
              net_weight: appointment.netWeight,
              brand_name: appointment.brandName,
              existing_market: appointment.existingMarket,
              production_type: appointment.productionType,
              product_ingredients: appointment.productIngredients,
              storage_conditions: appointment.methodOfPreservation,
              shelf_life_duration: appointment.targetShelfLife,
              packaging_type: appointment.packagingMaterial,
              target_shelf_life: appointment.targetShelfLife,
              modes_of_deterioration: appointment.modeOfDeterioration,
            } : {})
          };
          console.log('[DEBUG] POSTing formData:', formData);
          const response = await fetch('/api/appointments', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData),
          });
          const result = await response.json();
          if (!response.ok) {
            console.error('[DEBUG] POST error:', result);
            throw new Error(result.message || 'Failed to submit appointment');
          }
          results.push(result);
        }
      }
      setSubmissionStatus({
        success: true,
        message: `Successfully submitted ${results.length} appointment(s)`,
        appointmentIds: results.map(r => r.appointmentId)
      });
    } catch (error) {
      console.error('[DEBUG] Submission error:', error);
      setSubmissionStatus({
        success: false,
        message: error.message || 'An error occurred during submission. Please try again.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add this useEffect to handle the beforeunload event
  useEffect(() => {
    if (isSubmitting) {
      const handleBeforeUnload = (e) => {
        e.preventDefault();
        e.returnValue = '';
      };
      window.addEventListener('beforeunload', handleBeforeUnload);
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [isSubmitting]);

  // Re-validate on step change
  useEffect(() => {
    if (currentStep === 'review') {
      validateForm();
    }
  }, [currentStep, appointments]);

  // console.log("Rendering LaboratoryAppointmentForm"); // Removed log

  return (
    <>
      {isSubmitting && <LoadingOverlay message="Submitting your appointment..." />}
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900">Laboratory Testing Services</h1>
            <p className="mt-2 text-lg text-gray-600">Schedule your laboratory testing appointment</p>
          </div>

          {/* Progress Stepper */}
          <ProgressStepper 
            currentStep={currentStep} 
            isShelfLifeSelected={appointments.some(app => 
              Object.values(app.shelfLifeServices).some(value => value)
            )} 
          />

          {/* Modals */}
          {showDeleteModal && (
            <DeleteConfirmModal
              show={showDeleteModal}
              onCancel={() => setShowDeleteModal(false)}
              onConfirm={confirmDeleteAppointment}
            />
          )}
          <ReviewPageModal
            open={!!submissionStatus}
            success={submissionStatus?.success}
            message={submissionStatus?.message}
            appointmentIds={submissionStatus?.appointmentIds}
            onClose={() => {
              setSubmissionStatus(null);
              if (submissionStatus?.success) {
                setCurrentStep('contact');
                setErrors({});
                setSelectedDate(null);
                setAppointments([{
                  id: 1,
                  clientName: '',
                  emailAddress: '',
                  phoneNumber: '',
                  organization: '',
                  sex: '',
                  sampleName: '',
                  sampleType: '',
                  quantity: '',
                  preferredDate: '',
                  sampleDescription: '',
                  selectedServices: [],
                  searchQuery: '',
                  currentServiceTab: 'chemical',
                  shelfLifeServices: {},
                  objectiveOfStudy: '',
                  productName: '',
                  netWeight: '',
                  brandName: '',
                  existingMarket: '',
                  productionType: '',
                  methodOfPreservation: '',
                  productIngredients: '',
                  packagingMaterial: '',
                  targetShelfLife: '',
                  modeOfDeterioration: [''],
                  existingPermitsFile: null,
                  productImageFile: null,
                  hasAttemptedSubmit: false
                }]);
              }
            }}
          />
          
          {/* Main Form Container */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            {/* Form Content */}
            <div className="p-8">
          {/* Contact Information Section */}
          {currentStep === 'contact' && (
              <ContactInformation
                  contactInfo={appointments[0]}
                onContactInfoChange={handleContactInfoChange}
                errors={errors}
                onNext={handleNextStep}
                disabled={isSubmitting}
              />
          )}

          {/* Sample Details and Service Selection Section */}
          {currentStep === 'sample' && (
                <div className="space-y-8">
              {/* Appointment Tabs */}
                  <div className="flex flex-wrap items-center gap-2 pb-4 border-b border-gray-200">
                {appointments.map((appointment, index) => {
                  const tabLabel = (appointment.sampleName && appointment.sampleName.trim())
                                   ? appointment.sampleName.trim()
                                   : `Appointment ${index + 1}`;
                  
                  return (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setCurrentAppointmentIndex(index)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                        index === currentAppointmentIndex
                              ? 'bg-blue-600 text-white shadow-md transform scale-105'
                              : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                          } disabled:opacity-50 disabled:cursor-not-allowed max-w-[200px] truncate`}
                          disabled={isSubmitting}
                          title={tabLabel}
                        >
                          <span className="flex items-center gap-2">
                            <span className="truncate">{tabLabel}</span>
                        {appointments.length > 1 && (
                              <button
                            onClick={(e) => {
                                  e.stopPropagation();
                              handleDeleteAppointment(index);
                            }}
                                className="p-1 hover:bg-red-100 rounded-full"
                                disabled={isSubmitting}
                          >
                                <XMarkIcon className="h-4 w-4 text-red-500" />
                              </button>
                        )}
                          </span>
                    </button>
                  );
                })}
                    
                <button
                  type="button"
                  onClick={addNewAppointment}
                      className="px-4 py-2 rounded-lg text-sm font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={isSubmitting}
                >
                      <PlusIcon className="h-4 w-4" />
                      Add Appointment
                </button>
              </div>

                  {/* Form Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                      {/* Calendar */}
                  <div className="lg:col-span-1">
                    <AppointmentCalendar 
                      selectedDate={selectedDate} 
                      onDateSelect={handleDateSelect}
                      bookedDates={bookedDates}
                      disabled={isSubmitting}
                    />
                  </div>

                      {/* Details */}
                      <div className="lg:col-span-2 space-y-8">
                    <SampleDetails
                      appointment={appointments[currentAppointmentIndex]}
                      onChange={handleAppointmentChange}
                      errors={errors}
                      disabled={isSubmitting}
                    />

                    <ServiceSelection
                      appointment={appointments[currentAppointmentIndex]}
                      onServiceTabChange={handleServiceTabChange}
                      onServiceSelection={handleServiceSelection}
                      onShelfLifeServiceChange={handleShelfLifeServiceChange}
                      onSearchChange={handleSearchChange}
                      onContinueToShelfLife={handleContinueToShelfLife}
                      servicesData={servicesData}
                      servicesLoading={servicesLoading}
                      servicesError={servicesError}
                      errors={errors}
                      disabled={isSubmitting}
                    />
                      </div>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between pt-8 border-t border-gray-200">
                      <button
                        type="button"
                        onClick={handlePreviousStep}
                        className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                      >
                        Back
                      </button>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isSubmitting}
                      >
                        Continue
                      </button>
                </div>
              </div>
            )}

                {/* Shelf Life Details Section */}
            {currentStep === 'shelflife' && (
              <>
              <ShelfLifeDetails
                appointment={appointments[currentAppointmentIndex]}
                onChange={handleAppointmentChange}
                onModeChange={handleModeChange}
                onAddMode={handleAddMode}
                onRemoveMode={handleRemoveMode}
                onFileChange={handleFileChange}
                errors={errors}
                disabled={isSubmitting}
              />
                <div className="flex justify-between pt-8 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={handlePreviousStep}
                    className="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    Back to Sample Details
                  </button>
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="px-6 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={isSubmitting}
                  >
                    Continue to Review
                  </button>
                </div>
              </>
            )}

            {/* Review Section */}
            {currentStep === 'review' && (
                <ReviewSection
                  servicesData={servicesData}
                  errors={errors}
                  onPrevious={handlePreviousStep}
                  isSubmitting={isSubmitting}
                  onSubmit={handleSubmit}
                  allAppointments={appointments}
                />
            )}
              </div>
            </div>
          </div>
        </div>
    </>
  );
} 