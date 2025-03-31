"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaGripHorizontal, FaRegCalendarAlt, FaRegFileAlt, FaCog } from "react-icons/fa";

export default function DashboardSidebar() {
  const pathname = usePathname();

  const navItems = [
    { 
      id: "dashboard", 
      label: "Overview", 
      icon: <FaGripHorizontal className="h-7 w-7" />, 
      href: "/metrology/dashboard" 
    },
    { 
      id: "calendar", 
      label: "Calendar", 
      icon: <FaRegCalendarAlt className="h-7 w-7" />, 
      href: "/metrology/dashboard/calendar" 
    },
    { 
      id: "reports", 
      label: "Reports", 
      icon: <FaRegFileAlt className="h-7 w-7" />, 
      href: "/metrology/dashboard/reports" 
    },
    { 
      id: "services", 
      label: "Manage Services", 
      icon: <FaCog className="h-7 w-7" />, 
      href: "/metrology/dashboard/services" 
    }
  ];

  return (
    <aside className="bg-white w-16 shadow-md h-full flex-shrink-0">
      <div className="p-4 flex flex-col items-center">
        {navItems.map((item) => {
          // Only mark as active when `pathname` exactly matches the `href`
          const isActive = pathname === item.href;

          return (
            <div key={item.id} className="relative group w-full flex justify-center">
              <Link
                href={item.href}
                className={`mb-6 p-2 rounded-lg transition-colors duration-200 flex items-center justify-center ${
                  isActive ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-blue-200"
                }`}
              >
                {item.icon}
              </Link>

              {/* Tooltip */}
              <span className="absolute left-full ml-3 top-1/2 -translate-y-6 bg-gray-500 text-white text-xs px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap shadow-md z-10">
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
