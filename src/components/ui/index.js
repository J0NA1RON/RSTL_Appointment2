'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronDown, FaChevronUp, FaSearch, FaTimes } from 'react-icons/fa';

// Color system
export const colors = {
  primary: {
    DEFAULT: '#3B82F6',
    light: '#60A5FA',
    dark: '#2563EB',
  },
  success: {
    DEFAULT: '#10B981',
    light: '#34D399',
    dark: '#059669',
  },
  warning: {
    DEFAULT: '#F59E0B',
    light: '#FBBF24',
    dark: '#D97706',
  },
  danger: {
    DEFAULT: '#EF4444',
    light: '#F87171',
    dark: '#DC2626',
  },
  purple: {
    DEFAULT: '#8B5CF6',
    light: '#A78BFA',
    dark: '#7C3AED',
  },
  cyan: {
    DEFAULT: '#06B6D4',
    light: '#22D3EE',
    dark: '#0891B2',
  },
};

// Button Component
export const Button = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  const variants = {
    primary: `bg-${colors.primary.DEFAULT} text-white hover:bg-${colors.primary.dark} focus:ring-${colors.primary.DEFAULT}`,
    secondary: `bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500`,
    success: `bg-${colors.success.DEFAULT} text-white hover:bg-${colors.success.dark} focus:ring-${colors.success.DEFAULT}`,
    danger: `bg-${colors.danger.DEFAULT} text-white hover:bg-${colors.danger.dark} focus:ring-${colors.danger.DEFAULT}`,
    warning: `bg-${colors.warning.DEFAULT} text-white hover:bg-${colors.warning.dark} focus:ring-${colors.warning.DEFAULT}`,
    outline: `border border-gray-300 text-gray-700 hover:bg-gray-50 focus:ring-gray-500`,
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

// Card Component
export const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-sm border border-gray-200 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};

// Status Badge Component
export const StatusBadge = ({ children, variant = 'primary', className = '' }) => {
  const variants = {
    primary: `bg-${colors.primary.light} text-${colors.primary.dark}`,
    success: `bg-${colors.success.light} text-${colors.success.dark}`,
    warning: `bg-${colors.warning.light} text-${colors.warning.dark}`,
    danger: `bg-${colors.danger.light} text-${colors.danger.dark}`,
    info: `bg-${colors.cyan.light} text-${colors.cyan.dark}`,
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

// Modal Component
export const Modal = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </motion.div>

            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
              &#8203;
            </span>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full"
            >
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                  <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <FaTimes className="h-5 w-5" />
                  </button>
                </div>
                {children}
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

// Confirmation Modal Component
export const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="space-y-4">
        <p className="text-gray-600">{message}</p>
        <div className="flex justify-end space-x-3">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm}>
            Confirm
          </Button>
        </div>
      </div>
    </Modal>
  );
};

// Input Component
export const Input = ({ className = '', ...props }) => {
  return (
    <input
      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-${colors.primary.DEFAULT} focus:ring-${colors.primary.DEFAULT} sm:text-sm ${className}`}
      {...props}
    />
  );
};

// Select Component
export const Select = ({ className = '', children, ...props }) => {
  return (
    <select
      className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-${colors.primary.DEFAULT} focus:ring-${colors.primary.DEFAULT} sm:text-sm ${className}`}
      {...props}
    >
      {children}
    </select>
  );
};

// Search Input Component
export const SearchInput = ({ value, onChange, placeholder = 'Search...', className = '' }) => {
  return (
    <div className={`relative ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <FaSearch className="h-5 w-5 text-gray-400" />
      </div>
      <Input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="pl-10"
      />
    </div>
  );
};

// Tabs Component
export const Tabs = ({ activeTab, onChange, tabs }) => {
  return (
    <div className="border-b border-gray-200">
      <nav className="-mb-px flex space-x-8">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`${
              activeTab === tab.id
                ? `border-${colors.primary.DEFAULT} text-${colors.primary.dark}`
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm`}
          >
            {tab.icon && <span className="mr-2">{tab.icon}</span>}
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
}; 