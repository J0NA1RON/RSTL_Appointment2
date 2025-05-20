"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";

export default function DashboardNav() {
  const [notifications, setNotifications] = useState(false);
  const [dateTime, setDateTime] = useState("");
  const pathname = usePathname();
  const router = useRouter();

  // Dynamically determine the management name based on pathname
  const getManagementTitle = () => {
    if (pathname.includes("/metrology")) return "Metrology Appointment Management";
    if (pathname.includes("/chemistry")) return "Chemistry Appointment Management";
    if (pathname.includes("/microbiology")) return "Microbiology Appointment Management";
    if (pathname.includes("/shelf-life")) return "Shelf Life Appointment Management";
    return "Dashboard"; // Default title if none match
  };

  useEffect(() => {
    const options = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    };
    setDateTime(new Date().toLocaleDateString("en-US", options));

    const timer = setInterval(() => {
      setDateTime(new Date().toLocaleDateString("en-US", options));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleViewAllAppointments = () => {
    setNotifications(false); //to close
  
    if (pathname.includes("/metrology")) {
      router.push("/metrology/dashboard/calendar");
    } else if (pathname.includes("/chemistry")) {
      router.push("/chemistry/dashboard/calendar");
    } else if (pathname.includes("/microbiology")) {
      router.push("/microbiology/dashboard/calendar");
    } else if (pathname.includes("/shelf-life")) {
      router.push("/shelf-life/dashboard/calendar");
    } else {
      router.push("/calendar"); // Fallback
    }
  };
  
  return (
      <div className="dashboard-nav bg-white shadow-md h-20" style={{ height: "65px" }}>
        <div className=" px-4 flex flex-auto justify-between items-center w-full h-full">
          <div className="flex items-center space-x-4">
            <div className="w-[40px] h-[40px] overflow-hidden rounded">
              <Image src="/dost-logo.png" alt="DOST Logo" width={40} height={40} />
            </div>
            <h1 className="text-xl font-bold">{getManagementTitle()}</h1>
          </div>

          <div className="flex items-center space-x-6">
            <div className="text-right">
              <div className="font-semibold">Philippine Standard Time</div>
              <div className="text-sm whitespace-nowrap font-mono text-gray-600 ">{dateTime}</div>
            </div>

            <div className="relative">
              <button
                className="relative p-2 rounded-full hover:bg-gray-100"
                onClick={() => setNotifications(!notifications)}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-gray-700"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500"></span>
              </button>

              {notifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl z-50 border">
                  <div className="p-4 border-b font-semibold text-gray-700 flex justify-between items-center">
                    <span>Upcoming Appointments</span>
                    <span className="text-sm text-gray-500">9 total</span>
                  </div>
                  <ul className="max-h-80 overflow-y-auto">
                    <li className="px-4 py-3 hover:bg-gray-50 flex items-center space-x-3">
                      <span className="p-2 bg-gray-100 rounded-full">📅</span>
                      <div>
                        <div className="font-medium">John Doe</div>
                        <div className="text-sm text-gray-500">Apr 23, 2:00 PM</div>
                      </div>
                      <span className="ml-auto text-xs font-medium text-blue-500 bg-blue-50 px-2 py-1 rounded">New</span>
                    </li>
                    <li className="px-4 py-3 hover:bg-gray-50 flex items-center space-x-3">
                      <span className="p-2 bg-gray-100 rounded-full">📅</span>
                      <div>
                        <div className="font-medium">Jane Smith</div>
                        <div className="text-sm text-gray-500">Apr 24, 10:00 AM</div>
                      </div>
                      <span className="ml-auto text-xs font-medium text-blue-500 bg-blue-50 px-2 py-1 rounded">New</span>
                    </li>
                    <li className="px-4 py-3 hover:bg-gray-50 flex items-center space-x-3">
                      <span className="p-2 bg-gray-100 rounded-full">📅</span>
                      <div>
                        <div className="font-medium">Alice Lee</div>
                        <div className="text-sm text-gray-500">Apr 25, 9:30 AM</div>
                      </div>
                      <span className="ml-auto text-xs font-medium text-blue-500 bg-blue-50 px-2 py-1 rounded">New</span>
                    </li>
                  </ul>
                  <button 
                    onClick={handleViewAllAppointments}
                    className="w-full p-3 text-center text-blue-600 font-medium border-t hover:bg-blue-50 transition-colors duration-200"
                  >
                    View All Appointments
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
} 