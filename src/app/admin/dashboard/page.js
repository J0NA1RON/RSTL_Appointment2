'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/layout/AdminLayout';
import { FaFlask, FaRuler, FaBacteria, FaBook, FaClock, FaInfoCircle, FaTachometerAlt, FaEnvelopeOpenText } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { Card, Button, StatusBadge, Tabs } from '@/components/ui';
import DashboardNav from '@/components/layout/DashboardNav';
import { signOut } from 'next-auth/react';

// AdminSidebar component
function AdminSidebar({ current }) {
  const nav = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: <FaTachometerAlt className="w-5 h-5" /> },
    { label: 'Inquiries Sheet', href: '/admin/dashboard/inquiries', icon: <FaEnvelopeOpenText className="w-5 h-5" /> },
  ];
  return (
    <aside className="fixed top-0 left-0 h-full w-56 bg-white border-r border-gray-200 shadow-sm flex flex-col z-30" aria-label="Admin sidebar">
      <div className="h-16 flex items-center px-6 border-b border-gray-100">
        <span className="text-xl font-bold text-blue-600 tracking-tight">Admin</span>
      </div>
      <div className="px-6 pt-4 pb-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">Navigation</div>
      <nav className="flex-1 py-2 px-2 space-y-2">
        {nav.map(item => (
          <Link key={item.href} href={item.href} className={`relative flex items-center gap-3 px-4 py-2 rounded-lg text-base font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-200 ${current === item.href ? 'bg-blue-100 text-blue-700' : 'text-gray-700 hover:bg-blue-50'}`}
            aria-current={current === item.href ? 'page' : undefined}>
            {/* Active indicator bar */}
            <span className={`absolute left-0 top-0 h-full w-1 rounded-r-lg transition-all ${current === item.href ? 'bg-blue-500' : 'bg-transparent'}`}></span>
            {item.icon}
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}

// Enhanced Tabs with pill style and animated underline
function EnhancedTabs({ activeTab, onChange, tabs }) {
  return (
    <div className="flex space-x-2 px-4 py-3">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`relative px-5 py-2 rounded-full font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-200 ${activeTab === tab.id ? 'bg-blue-600 text-white shadow' : 'bg-gray-100 text-gray-600 hover:bg-blue-50'}`}
          aria-current={activeTab === tab.id ? 'page' : undefined}
        >
          {tab.label}
          {activeTab === tab.id && (
            <span className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 w-2/3 h-1 bg-blue-400 rounded-full animate-pulse"></span>
          )}
        </button>
      ))}
    </div>
  );
}

export default function AdminDashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('today');
  const [stats, setStats] = useState({
    metrology: { appointments: 0, pending: 0, completed: 0 },
    chemistry: { appointments: 0, pending: 0, completed: 0 },
    microbiology: { appointments: 0, pending: 0, completed: 0 },
    shelfLife: { appointments: 0, pending: 0, completed: 0 }
  });
  const [loading, setLoading] = useState(true);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);

  const periodTabs = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
  ];

  useEffect(() => {
    fetchStats();
  }, [selectedPeriod]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/admin/dashboard/stats?period=${selectedPeriod}`);
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const services = [
    {
      id: 'metrology',
      name: 'Metrology',
      description: 'Volume calibration and measurement services',
      icon: <FaRuler className="w-8 h-8" />,
      href: '/metrology/dashboard',
      color: 'bg-blue-500',
      stats: stats.metrology
    },
    {
      id: 'chemistry',
      name: 'Chemistry',
      description: 'Chemical analysis and testing services',
      icon: <FaFlask className="w-8 h-8" />,
      href: '/chemistry/dashboard',
      color: 'bg-purple-500',
      stats: stats.chemistry
    },
    {
      id: 'microbiology',
      name: 'Microbiology',
      description: 'Microbiological testing and analysis',
      icon: <FaBacteria className="w-8 h-8" />,
      href: '/microbiology/dashboard',
      color: 'bg-green-500',
      stats: stats.microbiology
    },
    {
      id: 'shelfLife',
      name: 'Shelf Life',
      description: 'Product shelf life testing and analysis',
      icon: <FaClock className="w-8 h-8" />,
      href: '/shelf-life/dashboard',
      color: 'bg-teal-500',
      stats: stats.shelfLife
    }
  ];

  return (
    <AdminLayout>
      <div className="min-h-screen bg-gray-50 flex">
        <AdminSidebar current="/admin/dashboard" />
        <div className="flex-1 ml-56">
          <div className="sticky top-0 z-40">
            <DashboardNav />
          </div>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 pt-12 pb-16">
            {/* Header */}
            <div className="mb-10 flex items-center justify-between relative">
              <div>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-1">Laboratory Services Dashboard</h1>
                <p className="text-base text-gray-500 flex items-center gap-2">
                  <FaInfoCircle className="text-blue-400" />
                  Select a laboratory service to view its dashboard
                </p>
              </div>
              {/* User avatar/profile menu */}
              <div className="relative">
                <button
                  className="flex items-center gap-2 bg-white border border-gray-200 rounded-full px-3 py-1.5 shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-200"
                  aria-label="User menu"
                  onClick={() => setProfileMenuOpen((v) => !v)}
                >
                  <span className="inline-block w-8 h-8 bg-blue-200 text-blue-700 font-bold rounded-full flex items-center justify-center">A</span>
                  <span className="hidden md:inline text-sm font-medium text-gray-700">Admin</span>
                </button>
                {profileMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
                    <button
                      onClick={() => signOut({ callbackUrl: '/login' })}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-t-lg"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div className="border-b border-gray-200 mb-10" aria-hidden="true"></div>

            {/* Time Period Selector */}
            <Card className="mb-10 p-0">
              <EnhancedTabs
                activeTab={selectedPeriod}
                onChange={setSelectedPeriod}
                tabs={periodTabs}
              />
            </Card>

            {/* Service Cards Section */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-800">Services Overview</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {services.map((service) => (
                <Link key={service.id} href={service.href} className="focus:outline-none group">
                  <Card className="relative transition-all duration-200 hover:shadow-2xl hover:scale-[1.03] hover:border-blue-400 cursor-pointer group focus:ring-2 focus:ring-blue-200 rounded-xl shadow-lg p-8">
                    {/* Floating Pending badge */}
                    {service.stats?.pending > 0 && (
                      <span className="absolute top-6 right-6 bg-yellow-400 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow z-10 animate-pulse">
                        {service.stats.pending} Pending
                      </span>
                    )}
                    <div className="flex items-center p-0 pb-2">
                      <div className={`rounded-full p-6 ${service.color} shadow-md flex items-center justify-center transition-transform duration-200 group-hover:scale-110`}>
                        <span className="text-white text-3xl">{service.icon}</span>
                      </div>
                      <div className="ml-6 flex-1">
                        <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-700 transition-colors">{service.name}</h3>
                        <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                      </div>
                      <span className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"><svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></svg></span>
                    </div>
                    <div className="grid grid-cols-3 gap-6 px-0 pb-2 pt-4 text-center">
                      <div>
                        <p className="text-2xl font-extrabold text-gray-900">
                          {loading ? <span className="inline-block w-8 h-6 bg-gray-200 rounded animate-pulse" /> : service.stats?.appointments || 0}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">Total</p>
                      </div>
                      <div>
                        <p className="text-2xl font-extrabold text-yellow-500">
                          {loading ? <span className="inline-block w-8 h-6 bg-gray-100 rounded animate-pulse" /> : service.stats?.pending || 0}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">Pending</p>
                      </div>
                      <div>
                        <p className="text-2xl font-extrabold text-green-500">
                          {loading ? <span className="inline-block w-8 h-6 bg-gray-100 rounded animate-pulse" /> : service.stats?.completed || 0}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">Completed</p>
                      </div>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
} 