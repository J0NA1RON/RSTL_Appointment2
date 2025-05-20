"use client";

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { FaCalendar, FaClock, FaCheckCircle, FaFlask } from 'react-icons/fa';

const statConfig = [
  {
    key: 'total_appointments',
    label: 'Total Appointments',
    icon: <FaCalendar className="text-blue-500 w-8 h-8" />, 
    colorClass: ''
  },
  {
    key: 'pending',
    label: 'Pending',
    icon: <FaClock className="text-yellow-500 w-8 h-8" />, 
    colorClass: ''
  },
  {
    key: 'in_progress',
    label: 'In Progress',
    icon: <FaFlask className="text-blue-500 w-8 h-8" />, 
    colorClass: ''
  },
  {
    key: 'completed',
    label: 'Completed',
    icon: <FaCheckCircle className="text-green-500 w-8 h-8" />, 
    colorClass: ''
  }
];

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getStatusColor(status) {
  switch (status?.toLowerCase()) {
    case 'pending':
      return { bgClass: 'bg-yellow-100', textClass: 'text-yellow-800', dotClass: 'bg-yellow-500' };
    case 'in progress':
      return { bgClass: 'bg-blue-100', textClass: 'text-blue-800', dotClass: 'bg-blue-500' };
    case 'completed':
      return { bgClass: 'bg-green-100', textClass: 'text-green-800', dotClass: 'bg-green-500' };
    case 'declined':
      return { bgClass: 'bg-red-100', textClass: 'text-red-800', dotClass: 'bg-red-500' };
    default:
      return { bgClass: 'bg-gray-100', textClass: 'text-gray-800', dotClass: 'bg-gray-500' };
  }
}

export default function ShelfLifeDashboard() {
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
    // eslint-disable-next-line
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch appointments with shelf life details
      const response = await fetch('/api/appointments?category=shelf-life');
      const data = await response.json();
      if (data.success) {
        const appointments = (data.data || []).map(a => ({
          ...a,
          // If shelf_life_details fields are present, keep them; otherwise, leave undefined
          product_type: a.product_type,
          storage_conditions: a.storage_conditions,
          shelf_life_duration: a.shelf_life_duration,
          packaging_type: a.packaging_type,
          modes_of_deterioration: a.modes_of_deterioration,
        }));
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
        // Count occurrences of each services
        const analysisTypeCounts = {};
        appointments.forEach(a => {
          if (a.services) {
            a.services.split(',').forEach(type => {
              const trimmed = type.trim();
              if (trimmed) analysisTypeCounts[trimmed] = (analysisTypeCounts[trimmed] || 0) + 1;
            });
          }
        });
        const analysisTypes = Object.entries(analysisTypeCounts).map(([services, count]) => ({ services, count }));
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
  };

  const fetchAppointmentsForDay = useCallback(async (date) => {
    if (!date) {
      setSelectedDayAppointments([]);
      return;
    }
    setLoadingSelectedDay(true);
    try {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      const response = await fetch(`/api/appointments?category=shelf-life&date=${year}-${month}-${day}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      if (data.success) {
        setSelectedDayAppointments(data.data || []);
      } else {
        setSelectedDayAppointments([]);
      }
    } catch (error) {
      setSelectedDayAppointments([]);
    } finally {
      setLoadingSelectedDay(false);
    }
  }, []);

  useEffect(() => {
    if (selectedDay && selectedDay instanceof Date && !isNaN(selectedDay)) {
      fetchAppointmentsForDay(selectedDay);
    } else {
      setSelectedDayAppointments([]);
    }
  }, [selectedDay, fetchAppointmentsForDay]);

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