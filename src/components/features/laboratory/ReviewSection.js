'use client';

import { Fragment } from 'react';

export default function ReviewSection({ 
  servicesData = {},
  errors = {},
  onPrevious,
  isSubmitting = false,
  onSubmit,
  allAppointments = []
}) {
  // Log the received allAppointments prop
  console.log("ReviewSection received allAppointments:", allAppointments);

  // Helper to get selected services details for a SINGLE appointment
  const getSelectedServicesDetailsForAppointment = (appointment) => {
    if (!appointment) return [];

    const selectedServiceIds = appointment.selectedServices || [];
    const shelfLifeServices = appointment.shelfLifeServices || {};

    if (selectedServiceIds.length === 0 && !Object.values(shelfLifeServices).some(Boolean)) {
      return [];
    }

    if (!servicesData) {
      return [];
    }

    const allServicesDetails = [];

    // Helper to flatten all services by category
    const allServicesFlat = Object.entries(servicesData).reduce((acc, [category, services]) => {
      services.forEach(service => {
        acc[service.id] = { ...service, serviceType: category };
      });
      return acc;
    }, {});

    // Add selected standard services
    selectedServiceIds.forEach(id => {
      if (allServicesFlat[id]) {
        allServicesDetails.push(allServicesFlat[id]);
      }
    });

    // Add selected shelf life services
    Object.entries(shelfLifeServices).forEach(([id, isSelected]) => {
      if (isSelected && allServicesFlat[id]) {
        // Avoid duplicates
        if (!allServicesDetails.some(s => s.id === id)) {
          allServicesDetails.push(allServicesFlat[id]);
        }
      }
    });

    return allServicesDetails;
  };

  // Helper to calculate total price for a SINGLE appointment
  const calculateTotalPriceForAppointment = (appointment) => {
    const services = getSelectedServicesDetailsForAppointment(appointment);
    return services.reduce((total, service) => {
      const priceNumber = typeof service.price === 'number' ? service.price : parseFloat((service.price || '0').toString().replace(/[₱,]/g, '')) || 0;
      return total + priceNumber;
    }, 0);
  };

  // Calculate overall total price for ALL appointments
  const calculateOverallTotalPrice = () => {
    return allAppointments.reduce((total, app) => total + calculateTotalPriceForAppointment(app), 0);
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Render section with label and value
  const renderSection = (label, value) => {
    if (!value) return null;
    return (
      <div className="py-1">
        <dt className="text-sm font-medium text-gray-500">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900">{value}</dd>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Appointment & Contact Information
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>Review your appointment and contact details before submission.</p>
          </div>
          {allAppointments && allAppointments.length > 0 && (
            <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2 mt-4 mb-6">
              {renderSection("Client Name", allAppointments[0].clientName)}
              {renderSection("Email", allAppointments[0].emailAddress)}
              {renderSection("Phone", allAppointments[0].phoneNumber)}
              {renderSection("Organization", allAppointments[0].organization)}
              {renderSection("Sex", allAppointments[0].sex)}
            </dl>
          )}
          <h4 className="text-md font-semibold text-gray-900 mb-2 mt-8">Samples</h4>
          {allAppointments && allAppointments.length > 0 ? (
            <div className="mt-2 space-y-6">
              {allAppointments.map((appointment, index) => (
                <div 
                  key={index}
                  className={`p-4 rounded-lg ${
                    index % 2 === 0 ? 'bg-gray-50' : 'bg-white'
                  } border border-gray-200`}
                >
                  <h5 className="text-md font-medium text-gray-900 mb-4">
                    Sample #{index + 1}
                  </h5>
                  <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                    {renderSection("Sample Name", appointment.sampleName)}
                    {renderSection("Sample Type", appointment.sampleType)}
                    {renderSection("Quantity", appointment.quantity)}
                    {renderSection("Preferred Date", formatDate(appointment.preferredDate))}
                    {renderSection("Sample Description", appointment.sampleDescription)}
                  </dl>
                  {Object.values(appointment.shelfLifeServices || {}).some(Boolean) && (
                    <div className="mt-6">
                      <h5 className="text-md font-semibold text-blue-700 mb-2">Shelf Life Study Details</h5>
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-4 sm:grid-cols-2">
                        {renderSection("Objective of Study", appointment.objectiveOfStudy)}
                        {renderSection("Product Name", appointment.productName)}
                        {renderSection("Net Weight", appointment.netWeight)}
                        {renderSection("Brand Name", appointment.brandName)}
                        {renderSection("Existing Market", appointment.existingMarket)}
                        {renderSection("Production Type", appointment.productionType)}
                        {renderSection("Method of Preservation", appointment.methodOfPreservation)}
                        {renderSection("Product Ingredients", appointment.productIngredients)}
                        {renderSection("Packaging Material", appointment.packagingMaterial)}
                        {renderSection("Target Shelf Life", appointment.targetShelfLife)}
                        {renderSection("Modes of Deterioration", (appointment.modeOfDeterioration || []).filter(Boolean).join(', '))}
                      </dl>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-5">
              <p className="text-sm text-red-600">No samples have been added yet.</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Selected Services Summary
          </h3>
          <div className="mt-5 space-y-6">
            {allAppointments.map((appointment, index) => {
              const servicesForThisAppointment = getSelectedServicesDetailsForAppointment(appointment);
              const totalForThisAppointment = calculateTotalPriceForAppointment(appointment);
              
              // Don't render a table if no services selected for this appointment
              if (servicesForThisAppointment.length === 0) {
                return null; 
              }

              return (
                <div key={`services-${index}`} className="border border-gray-200 rounded-lg overflow-hidden">
                   <h4 className="text-md font-medium text-gray-800 bg-gray-50 px-4 py-3 border-b border-gray-200">
                    Services for Appointment #{index + 1} (Sample: {appointment.sampleName || 'N/A'})
                  </h4>
                  <table className="min-w-full divide-y divide-gray-200">
                    {Object.entries(
                      servicesForThisAppointment.reduce((acc, service) => {
                        const type = service.serviceType || 'Other';
                        if (!acc[type]) acc[type] = [];
                        acc[type].push(service);
                        return acc;
                      }, {})
                    ).map(([type, services]) => (
                      <tbody key={type} className="bg-white divide-y divide-gray-200">
                        <tr>
                          <td colSpan={2} className="px-6 py-3 bg-blue-50 text-blue-700 font-semibold">
                            {type === 'chemistry' && 'Chemical Analysis'}
                            {type === 'chemical' && 'Chemical Analysis'}
                            {type === 'microbiology' && 'Microbiology Services'}
                            {type === 'shelflife' && 'Shelf Life Services'}
                            {type !== 'chemistry' && type !== 'chemical' && type !== 'microbiology' && type !== 'shelflife' && type}
                          </td>
                        </tr>
                        {services.map((service, serviceIndex) => (
                          <tr key={serviceIndex}>
                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900">
                              {service.name}
                            </td>
                            <td className="px-6 py-3 whitespace-nowrap text-sm text-gray-900 text-right">
                              {service.price}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    ))}
                    {/* Subtotal for this appointment */} 
                    <tbody className="bg-gray-50">
                      <tr className="bg-gray-50">
                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          Subtotal
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900 text-right">
                          ₱{totalForThisAppointment.toFixed(2)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })}

            {/* Overall Total Section */} 
            <div className="mt-6 pt-4 border-t border-gray-300 flex justify-end items-center">
              <span className="text-lg font-semibold text-gray-900 mr-4">Overall Total:</span>
              <span className="text-xl font-bold text-blue-600">
                ₱{calculateOverallTotalPrice().toFixed(2)}
              </span>
            </div>

          </div>
        </div>
      </div>

      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900">
            Terms and Conditions
          </h3>
          <div className="mt-2 max-w-xl text-sm text-gray-500">
            <p>By submitting this form, you agree to our terms of service and privacy policy.</p>
          </div>
        </div>
      </div>

      <div className="flex justify-between">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isSubmitting}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          Back
        </button>
        <button
          type="button"
          onClick={onSubmit} // Use the passed onSubmit prop
          disabled={isSubmitting}
          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Appointment'}
        </button>
      </div>
    </div>
  );
} 