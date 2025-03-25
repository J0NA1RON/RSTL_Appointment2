"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardSidebar() {
  const pathname = usePathname();
  const [activeItem, setActiveItem] = useState('dashboard');
  
  // Set the active item based on the current path
  useEffect(() => {
    if (pathname.includes('/dashboard/calendar')) {
      setActiveItem('calendar');
    } else if (pathname.includes('/dashboard/reports')) {
      setActiveItem('reports');
    } else if (pathname.includes('/dashboard')) {
      setActiveItem('dashboard');
    }
  }, [pathname]);

  const navItems = [
    {
      id: 'dashboard',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      ),
      href: '/metrology/dashboard'
    },
    {
      id: 'calendar',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      href: '/metrology/dashboard/calendar'
    },
    {
      id: 'reports',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      href: '/metrology/reports'
    }
  ];

  return (
    <aside className="bg-white w-16 shadow-md h-full flex-shrink-0 overflow-y-auto">
      <div className="p-4 flex flex-col items-center">
        {navItems.map((item) => (
          <Link 
            key={item.id}
            href={item.href}
            className={`mb-6 p-2 rounded-lg transition-colors duration-200 ${
              activeItem === item.id 
                ? 'bg-blue-500 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
            onClick={(e) => {
              setActiveItem(item.id);
            }}
          >
            {item.icon}
          </Link>
        ))}
      </div>
    </aside>
  );
} 