"use client";

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { FaCalendar, FaClock, FaCheckCircle, FaFlask } from 'react-icons/fa';
import Link from 'next/link';

const statConfig = [
  {
    key: 'managers',
    label: 'Registered Managers',
    icon: <FaFlask className="text-blue-500 w-8 h-8" />, 
    colorClass: ''
  },
  {
    key: 'scheduled',
    label: 'Scheduled Appointments',
    icon: <FaCalendar className="text-green-500 w-8 h-8" />, 
    colorClass: ''
  },
  {
    key: 'today',
    label: 'Appointments Today',
    icon: <FaClock className="text-violet-500 w-8 h-8" />, 
    colorClass: ''
  },
  {
    key: 'liters',
    label: 'Liters Available',
    icon: <FaFlask className="text-orange-500 w-8 h-8" />, 
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

export default function MetrologyDashboard() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState('');
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [currentDay, setCurrentDay] = useState(0);
  const [calendarDays, setCalendarDays] = useState([]);
  const [stats, setStats] = useState({});
  const [appointments, setAppointments] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [analysisTypes, setAnalysisTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedDayAppointments, setSelectedDayAppointments] = useState([]);
  const [loadingSelectedDay, setLoadingSelectedDay] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [dailyLimit, setDailyLimit] = useState(80000);

  // Fetch dashboard data
  useEffect(() => {
    async function fetchDashboardData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/appointments/metrology');
        const data = await res.json();
        if (data.success) {
          setAppointments(data.data || []);
          // Optionally compute stats and recentAppointments here if needed
        } else {
          setError(data.message || 'Failed to load dashboard data');
        }
      } catch (err) {
        setError(err.message || 'Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
    const today = new Date();
    setCurrentDate(today);
    setCurrentDay(today.getDate());
    setSelectedDay(today.getDate());
    generateCalendarDays(today, appointments);
    updateMonthDisplay(today);
  }, []);

  useEffect(() => {
    generateCalendarDays(currentDate, appointments);
  }, [currentDate, appointments]);

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
    generateCalendarDays(newDate, appointments);
    updateMonthDisplay(newDate);
  };

  const goToNextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + 1);
    const lastDayOfNewMonth = new Date(newDate.getFullYear(), newDate.getMonth() + 1, 0).getDate();
    const preservedDay = Math.min(selectedDay, lastDayOfNewMonth);
    setCurrentDate(newDate);
    setSelectedDay(preservedDay);
    generateCalendarDays(newDate, appointments);
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
    console.log('[DEBUG] Appointments for calendar:', appointments);
    appointments.forEach(apt => {
      let aptDate;
      if (typeof apt.appointment_date === 'string') {
        // Always use only the date part (first 10 chars)
        const [year, month, day] = apt.appointment_date.slice(0, 10).split('-').map(Number);
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
    console.log('[DEBUG] appointmentMap:', appointmentMap);
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

  // Fetch appointments for a selected day
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
      const res = await fetch(`/api/appointments/by-date?date=${year}-${month}-${day}&service=metrology`);
      const data = await res.json();
      if (data.success) {
        setSelectedDayAppointments(data.data || []);
      } else {
        setSelectedDayAppointments([]);
      }
    } catch (err) {
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

  // Fetch companies for registered managers
  useEffect(() => {
    async function fetchCompanies() {
      try {
        const res = await fetch('/api/companies?verified=true');
        const data = await res.json();
        if (data.success) {
          setCompanies(data.data || []);
        }
      } catch {}
    }
    fetchCompanies();
  }, []);

  // Fetch daily limit for selected day
  useEffect(() => {
    if (!selectedDay) return;
    function formatLocalDate(date) {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    }
    async function fetchLimit() {
      try {
        const dateStr = formatLocalDate(selectedDay);
        const res = await fetch(`/api/appointments/metrology/constraints?date=${dateStr}`);
        const data = await res.json();
        if (data.success && data.data && data.data.daily_liter_capacity) {
          setDailyLimit(parseFloat(data.data.daily_liter_capacity));
        } else {
          setDailyLimit(80000);
        }
      } catch {
        setDailyLimit(80000);
      }
    }
    fetchLimit();
  }, [selectedDay]);

  // Compute stats dynamically
  useEffect(() => {
    const registeredManagers = companies.length;
    const scheduledAppointments = appointments.filter(a => a.status === 'pending' || a.status === 'accepted' || a.status === 'in progress').length;
    const appointmentsToday = selectedDayAppointments.length;
    const litersUsed = selectedDayAppointments.reduce((sum, a) => sum + (parseFloat(a.number_of_liters) || 0), 0);
    const litersAvailable = dailyLimit - litersUsed;
    setStats({
      managers: registeredManagers,
      scheduled: scheduledAppointments,
      today: appointmentsToday,
      liters: litersAvailable
    });
  }, [appointments, selectedDayAppointments, companies, dailyLimit]);

  // Compute recent appointments (5 most recent metrology appointments)
  useEffect(() => {
    // Sort by date and time descending
    const sorted = [...appointments].sort((a, b) => {
      const dateA = a.appointment_date?.slice(0, 10) || '';
      const dateB = b.appointment_date?.slice(0, 10) || '';
      if (dateA !== dateB) return dateB.localeCompare(dateA);
      // If same date, compare time
      const timeA = a.appointment_time || '';
      const timeB = b.appointment_time || '';
      return (timeB || '').localeCompare(timeA || '');
    });
    setRecentAppointments(sorted.slice(0, 5));
  }, [appointments]);

  return (
    <DashboardLayout
      stats={stats}
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
      recentAppointments={recentAppointments}
      loading={loading}
      error={error}
      selectedDayAppointments={selectedDayAppointments}
      loadingSelectedDay={loadingSelectedDay}
      dayAppointmentsProps={{
        selectedDay,
        currentMonth,
      }}
      analysisTypes={analysisTypes}
    >
    </DashboardLayout>
  );
} 