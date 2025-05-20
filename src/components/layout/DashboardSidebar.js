"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { ChevronLeft } from 'lucide-react';
import {
  Grid2x2,
  CalendarDays,
  FileStack,
  SlidersHorizontal,
  MessagesSquare,
  Users
} from "lucide-react";


export default function DashboardSidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem('sidebarIsCollapsed');
      if (savedState !== null) {
        setIsCollapsed(JSON.parse(savedState));
      }
      setIsInitialLoad(false);
    }
  }, []);

  const handleToggleCollapse = () => {
    const newState = !isCollapsed;
    setIsCollapsed(newState);
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarIsCollapsed', JSON.stringify(newState));
    }
  };

  let basePath = "/metrology";
  if (pathname.includes("/chemistry")) basePath = "/chemistry";
  if (pathname.includes("/microbiology")) basePath = "/microbiology";
  if (pathname.includes("/shelf-life")) basePath = "/shelf-life";

  const isShelfLife = pathname.includes("/shelf-life");

  const navItems = [
    {
      id: "dashboard",
      label: "Overview",
      icon: <Grid2x2 size={24} />,
      href: `${basePath}/dashboard`,
    },
    ...(basePath === "/metrology"
      ? [
          {
            id: "calendar",
            label: "Appointments",
            icon: <CalendarDays size={24} />,
            href: `${basePath}/dashboard/calendar`,
          },
          {
            id: "reports",
            label: "Reports",
            icon: <FileStack size={24} />,
            href: `${basePath}/dashboard/reports`,
          },
          {
            id: "managers",
            label: "Manage Managers",
            icon: <Users size={24} />,
            href: `${basePath}/dashboard/managers`,
          },
        ]
      : isShelfLife
      ? [
          {
            id: "calendar",
            label: "Calendar",
            icon: <CalendarDays size={24} />,
            href: `${basePath}/dashboard/calendar`,
          },
          {
            id: "reports",
            label: "Reports",
            icon: <FileStack size={24} />,
            href: `${basePath}/dashboard/reports`,
          },
        ]
      : [
          {
            id: "calendar",
            label: basePath === "/chemistry" ? "Chemistry" : "Microbiology",
            icon: <CalendarDays size={24} />,
            href: `${basePath}/dashboard/calendar`,
          },
          {
            id: "consultancy",
            label: "Consultancy",
            icon: <MessagesSquare size={24} />,
            href: `${basePath}/dashboard/consultancy`,
          },
          {
            id: "reports",
            label: "Reports",
            icon: <FileStack size={24} />,
            isDropdown: true,
            subItems: [
              { id: "reports-tests", label: "Tests", href: `${basePath}/dashboard/reports/tests` },
              { id: "reports-consultancy", label: "Consultancy", href: `${basePath}/dashboard/reports/consultancy` },
            ],
          },
        ]),
    !isShelfLife && {
      id: "services",
      label: "Manage    ",
      icon: <SlidersHorizontal size={24} />,
      href: `${basePath}/dashboard/services`,
    },
  ].filter(Boolean);
  
  if (isInitialLoad) {
    return <aside className="bg-white border-r border-gray-200 h-full w-[72px] transition-all duration-300 ease-in-out" aria-hidden="true"></aside>;
  }

  return (
    <aside className={`bg-white border-r border-gray-200 h-full transition-all duration-300 ease-in-out ${isCollapsed ? 'w-[72px]' : 'w-64'}`}> 
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          <Link href="/admin/dashboard" className={`text-lg font-semibold text-gray-900 transition-opacity duration-200 ${isCollapsed ? 'opacity-0 w-0' : 'opacity-100'}`}>Dashboard</Link>
          <button onClick={handleToggleCollapse} className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-50">
            <ChevronLeft className={`w-5 h-5 transition-transform duration-200 ${isCollapsed ? 'rotate-180' : ''}`} />
          </button>
        </div>
        {/* Navigation */}
        <nav className="flex-1 py-6">
          <div className="px-2 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.subItems && item.subItems.some(sub => pathname === sub.href)) ||
                (pathname.startsWith(item.href + '/') && item.href !== `${basePath}/dashboard`);
              return (
                <div key={item.id} className="relative group">
                  {item.isDropdown ? (
                    <>
                      <button
                        onClick={() => setIsReportsOpen(!isReportsOpen)}
                        className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                          isActive 
                            ? "bg-blue-500 text-white" 
                            : "text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex-shrink-0 flex items-center justify-center w-6 h-6">
                          {item.icon}
                        </div>
                        {!isCollapsed && <span className="ml-3 text-[15px]">{item.label}</span>}
                        {!isCollapsed && <ChevronLeft className={`ml-auto w-4 h-4 transition-transform duration-200 ${isReportsOpen ? '-rotate-90' : 'rotate-0'}`} />}
                      </button>
                      {/* Tooltip for collapsed state */}
                      {isCollapsed && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                          {item.label}
                        </div>
                      )}
                      {/* Dropdown items */}
                      {isReportsOpen && !isCollapsed && (
                        <div className="mt-1 ml-9 space-y-1">
                          {item.subItems.map((subItem) => (
                            <Link
                              key={subItem.id}
                              href={subItem.href}
                              className={`block px-3 py-2 text-[15px] rounded-md transition-colors ${
                                pathname === subItem.href
                                  ? "text-blue-600 bg-blue-50"
                                  : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                              }`}
                            >
                              {subItem.label}
                            </Link>
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      href={item.href}
                      className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                        isActive 
                          ? "bg-blue-500 text-white" 
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex-shrink-0 flex items-center justify-center w-6 h-6">
                        {item.icon}
                      </div>
                      {!isCollapsed && <span className="ml-3 text-[15px]">{item.label}</span>}
                      {/* Tooltip for collapsed state */}
                      {isCollapsed && (
                        <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                          {item.label}
                        </div>
                      )}
                    </Link>
                  )}
                </div>
              );
            })}
          </div>
        </nav>
      </div>
    </aside>
  );
} 