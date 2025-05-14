"use client";

import { useState, useEffect, useCallback } from 'react';
import DashboardNav from "@/components/layout/DashboardNav";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import AdminLayout from "@/components/layout/AdminLayout";
import Link from "next/link";
import { FaCalendar, FaClock, FaCheckCircle, FaFlask, FaBook, FaCubes } from 'react-icons/fa';
import DashboardCalendar from "@/components/shared/DashboardCalendar";
import DashboardRecentAppointments from "@/components/shared/DashboardRecentAppointments";
import DashboardDayAppointments from "@/components/shared/DashboardDayAppointments";
import DashboardStats from "@/components/shared/DashboardStats";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function ChemistryDashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [currentDay, setCurrentDay] = useState(0);
  const [calendarDays, setCalendarDays] = useState([]);
  const [dashboardData, setDashboardData] = useState({
    stats: {
      total_appointments: 0,
      pending: 0,
      completed: 0,
      in_progress: 0
    },
    appointments: [],
    recentAppointments: [],
    analysisTypes: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDayAppointments, setSelectedDayAppointments] = useState([]);
  const [loadingSelectedDay, setLoadingSelectedDay] = useState(false);
  
  useEffect(() => {
    fetchDashboardData();
    const today = new Date();
    setCurrentDate(today);
    setCurrentDay(today.getDate());
    setSelectedDay(today.getDate());
    generateCalendarDays(today);
    updateMonthDisplay(today);
  }, []);
  
  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/appointments?category=chemistry');
      const data = await response.json();
      if (data.success) {
        const appointments = data.data || [];
        // Compute stats
        const stats = {
          total_appointments: appointments.length,
          pending: appointments.filter(a => a.status === 'pending').length,
          completed: appointments.filter(a => a.status === 'completed').length,
          in_progress: appointments.filter(a => a.status === 'in progress').length
        };
        // Recent appointments (last 5 by date)
        const recentAppointments = [...appointments]
          .sort((a, b) => new Date(b.appointment_date) - new Date(a.appointment_date))
          .slice(0, 5);
        // Count occurrences of each analysis_requested
        const analysisTypeCounts = {};
        appointments.forEach(a => {
          if (a.analysis_requested) {
            a.analysis_requested.split(',').forEach(type => {
              const trimmed = type.trim();
              if (trimmed) analysisTypeCounts[trimmed] = (analysisTypeCounts[trimmed] || 0) + 1;
            });
          }
        });
        const analysisTypes = Object.entries(analysisTypeCounts).map(([name, count]) => ({ analysis_requested: name, count }));
        setDashboardData({
          stats,
          appointments,
          recentAppointments,
          analysisTypes
        });
        generateCalendarDays(currentDate, appointments);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };
  
  const updateMonthDisplay = (date) => {
    const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];
    setCurrentMonth(`${monthNames[date.getMonth()]} ${date.getFullYear()}`);
  };
  
  const goToPreviousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    const lastDayOfNewMonth = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();
    const preservedDay = Math.min(selectedDay, lastDayOfNewMonth);
    setCurrentDate(newDate);
    setSelectedDay(preservedDay);
    generateCalendarDays(newDate, dashboardData.appointments);
    updateMonthDisplay(newDate);
  };
  
  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    const lastDayOfNewMonth = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();
    const preservedDay = Math.min(selectedDay, lastDayOfNewMonth);
    setCurrentDate(newDate);
    setSelectedDay(preservedDay);
    generateCalendarDays(newDate, dashboardData.appointments);
    updateMonthDisplay(newDate);
  };
  
  const generateCalendarDays = (date, appointments = []) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayWeekday = firstDayOfMonth.getDay();
    const totalDays = lastDayOfMonth.getDate();
    const days = [];
    // Create appointment lookup map
    const appointmentMap = {};
    appointments.forEach(apt => {
      let aptDate;
      if (typeof apt.appointment_date === 'string') {
        // Always parse as local date (YYYY-MM-DD)
        const [year, month, day] = apt.appointment_date.split('-').map(Number);
        aptDate = new Date(year, month - 1, day);
      } else if (apt.appointment_date instanceof Date) {
        aptDate = new Date(apt.appointment_date.getFullYear(), apt.appointment_date.getMonth(), apt.appointment_date.getDate());
      } else {
        aptDate = new Date(apt.appointment_date);
      }
      // Debug log for each appointment
      console.log('[DEBUG] Appointment:', apt, 'Parsed Date:', aptDate.toISOString(), 'Local:', aptDate.toLocaleDateString());
      if (aptDate.getMonth() === month && aptDate.getFullYear() === year) {
        const dayKey = aptDate.getDate();
        if (!appointmentMap[dayKey]) {
          appointmentMap[dayKey] = { count: 0, statuses: [] };
        }
        appointmentMap[dayKey].count += 1;
        appointmentMap[dayKey].statuses.push(apt.status);
      }
    });
    for (let i = 0; i < firstDayWeekday; i++) {
      days.push({ day: null, isCurrentMonth: false, date: null });
    }
    for (let i = 1; i <= totalDays; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        appointments: appointmentMap[i]
          ? { count: appointmentMap[i].count, statuses: appointmentMap[i].statuses.join(', ') }
          : null,
        date: new Date(year, month, i)
      });
    }
    const neededRows = Math.ceil((firstDayWeekday + totalDays) / 7);
    const totalCells = neededRows * 7;
    const remainingCells = totalCells - days.length;
    for (let i = 0; i < remainingCells; i++) {
      days.push({ day: null, isCurrentMonth: false, date: null });
    }
    setCalendarDays(days);
    // Debug log for calendarDays
    setTimeout(() => {
      console.log('[DEBUG] calendarDays:', days.map(d => ({ day: d.day, date: d.date ? d.date.toISOString() : null, appointments: d.appointments })));
    }, 0);
  };
  
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const isCurrentDay = (day) => day === currentDay;
  const isSelectedDay = (day) => day === selectedDay;

  const getStatusColor = (status) => {
    // Ensure dotClass is included for calendar dots
    switch (status?.toLowerCase()) {
      case 'completed': return { bgClass: 'bg-green-100', textClass: 'text-green-800', dotClass: 'bg-green-500' };
      case 'pending': return { bgClass: 'bg-yellow-100', textClass: 'text-yellow-800', dotClass: 'bg-yellow-500' }; // Adjusted pending for dot
      case 'in progress': return { bgClass: 'bg-blue-100', textClass: 'text-blue-800', dotClass: 'bg-blue-500' };
      case 'declined': return { bgClass: 'bg-red-100', textClass: 'text-red-800', dotClass: 'bg-red-500' };
      default: return { bgClass: 'bg-gray-100', textClass: 'text-gray-800', dotClass: 'bg-gray-500' };
    }
  };

  const fetchAppointmentsForDay = useCallback(async (date) => {
    if (!date) {
      setSelectedDayAppointments([]);
      return;
    }
    setLoadingSelectedDay(true);
    try {
      // Debug log for selected date
      console.log('FETCH DAY APPOINTMENTS for date:', date);
      const response = await fetch(`/api/appointments?category=chemistry&date=${date}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      if (data.success) {
        setSelectedDayAppointments(data.data || []);
      } else {
         setSelectedDayAppointments([]);
         console.error("API Error fetching day appointments:", data.message);
      }
    } catch (error) {
      console.error('Error fetching day appointments:', error);
      setSelectedDayAppointments([]); // Clear on error
    } finally {
      setLoadingSelectedDay(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDay && selectedDay instanceof Date && !isNaN(selectedDay)) {
      const year = selectedDay.getFullYear();
      const month = (selectedDay.getMonth() + 1).toString().padStart(2, '0');
      const day = selectedDay.getDate().toString().padStart(2, '0');
      fetchAppointmentsForDay(`${year}-${month}-${day}`);
    } else {
      setSelectedDayAppointments([]); // Clear if no valid day/date
    }
  }, [selectedDay, fetchAppointmentsForDay]);

  // Debug log for selectedDay
  useEffect(() => {
    console.log('[DEBUG] selectedDay:', selectedDay instanceof Date ? selectedDay.toISOString() : selectedDay);
  }, [selectedDay]);

  const statConfig = [
    {
      key: "total_appointments",
      label: "Total Appointments",
      icon: <FaCalendar className="text-blue-500 w-8 h-8" />,
      colorClass: ""
    },
    {
      key: "pending",
      label: "Pending",
      icon: <FaClock className="text-yellow-500 w-8 h-8" />,
      colorClass: ""
    },
    {
      key: "in_progress",
      label: "In Progress",
      icon: <FaFlask className="text-blue-500 w-8 h-8" />,
      colorClass: ""
    },
    {
      key: "completed",
      label: "Completed",
      icon: <FaCheckCircle className="text-green-500 w-8 h-8" />,
      colorClass: ""
    }
  ];

  return (
    <DashboardLayout
      stats={dashboardData.stats}
      statConfig={statConfig}
      calendarProps={{
        currentMonth,
        weekdays,
        calendarDays,
        selectedDay,
        currentDay,
        goToPreviousMonth,
        goToNextMonth,
        setSelectedDay,
        getStatusColor,
      }}
      recentAppointments={dashboardData.recentAppointments}
      loading={loading}
      error={error}
      selectedDayAppointments={selectedDayAppointments}
      loadingSelectedDay={loadingSelectedDay}
      dayAppointmentsProps={{
        selectedDay,
        currentMonth,
      }}
      analysisTypes={dashboardData.analysisTypes}
    />
  );
} 