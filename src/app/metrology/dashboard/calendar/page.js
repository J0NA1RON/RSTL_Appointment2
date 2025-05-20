"use client";

import { useState, useEffect } from 'react';
import { 
  format, 
  addMonths, 
  subMonths, 
  startOfMonth, 
  endOfMonth,
  isSameMonth, 
  isSameDay, 
  isToday,
  startOfWeek,
  endOfWeek,
  addDays,
  getDay
} from 'date-fns';
import { FaFlask, FaClock, FaTint, FaSearch } from 'react-icons/fa';
import DashboardNav from "@/components/layout/DashboardNav";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import AdminLayout from "@/components/layout/AdminLayout";
import DashboardCalendar from "@/components/shared/DashboardCalendar";
import DashboardQuickInfo from "@/components/shared/DashboardQuickInfo";
import DashboardAppointmentsTable from "@/components/shared/DashboardAppointmentsTable";
import CalendarDashboardLayout from '@/components/layout/CalendarDashboardLayout';
import ScheduleModal from '@/components/shared/ScheduleModal';
import LoadingOverlay from '@/components/shared/LoadingOverlay';

export default function CalendarPage() {
  const today = new Date(); 
  const [currentDate, setCurrentDate] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const [calendarDays, setCalendarDays] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(format(currentDate, 'MMMM yyyy'));
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('month');
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const [selectedDay, setSelectedDay] = useState(today);
  const [currentDay, setCurrentDay] = useState(today.getDate());
  const [loadingAction, setLoadingAction] = useState(false);

  // Fetch appointments from backend
  useEffect(() => {
    async function fetchAppointments() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/appointments/metrology/calendar-appointments');
        const data = await res.json();
        if (data.success) {
          setAppointments(data.data);
        } else {
          setError(data.message || 'Failed to fetch appointments');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchAppointments();
  }, []);

  // Generate calendarDays array for DashboardCalendar
  useEffect(() => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const firstDayIndex = getDay(monthStart);
    const days = [];
    // Map appointments by day
    const appointmentMap = {};
    appointments.forEach(apt => {
      const aptDate = new Date(apt.appointment_date);
      if (aptDate.getMonth() === monthStart.getMonth() && aptDate.getFullYear() === monthStart.getFullYear()) {
        const dayKey = aptDate.getDate();
        if (!appointmentMap[dayKey]) {
          appointmentMap[dayKey] = { count: 0, statuses: [] };
        }
        appointmentMap[dayKey].count += 1;
        appointmentMap[dayKey].statuses.push(apt.status);
      }
    });
      // empty slots for days before the 1st of the month
      for (let i = 0; i < firstDayIndex; i++) {
      days.push({ day: null, isCurrentMonth: false, date: null });
      }
        let day = monthStart;
        while (day <= monthEnd) {
      const d = day.getDate();
      days.push({
        day: d,
        isCurrentMonth: true,
        date: new Date(day),
        appointments: appointmentMap[d]
          ? { count: appointmentMap[d].count, statuses: appointmentMap[d].statuses.join(', ') }
          : null
      });
          day = addDays(day, 1);
        }
    // fill out the rest of the grid
    const neededRows = Math.ceil((firstDayIndex + monthEnd.getDate()) / 7);
    const totalCells = neededRows * 7;
    const remainingCells = totalCells - days.length;
    for (let i = 0; i < remainingCells; i++) {
      days.push({ day: null, isCurrentMonth: false, date: null });
    }
        setCalendarDays(days);
        setCurrentMonth(format(currentDate, 'MMMM yyyy'));
  }, [currentDate, appointments]);

  // Filtering logic for table
  const filteredAppointments = appointments.filter(apt => {
    // Date filter
    let isInDateRange = true;
    const aptDate = new Date(apt.appointment_date);
    if (viewMode === 'day' && selectedDate) {
      isInDateRange = isSameDay(aptDate, selectedDate);
    } else if (viewMode === 'week' && selectedDate) {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
      const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 0 });
      isInDateRange = aptDate >= weekStart && aptDate <= weekEnd;
    } else if (viewMode === 'month') {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      isInDateRange = aptDate >= monthStart && aptDate <= monthEnd;
    }
    // Search filter
    const lowerSearchTerm = searchTerm.toLowerCase();
    const matchesSearch = !searchTerm || (
      apt.id.toString().includes(lowerSearchTerm) ||
      apt.customer_name?.toLowerCase().includes(lowerSearchTerm) ||
      apt.status?.toLowerCase().includes(lowerSearchTerm)
    );
    // Status filter
    const matchesStatus = filterStatus === 'all' || apt.status?.toLowerCase() === filterStatus;
    return isInDateRange && matchesSearch && matchesStatus;
  });

  // Stats for quick info
  const quickInfoStats = (() => {
    let stats = { total: 0 };
    if (viewMode === 'day' && selectedDate) {
      const dayApts = appointments.filter(a => isSameDay(new Date(a.appointment_date), selectedDate));
      stats.total = dayApts.length;
      stats.pending = dayApts.filter(a => a.status === 'pending').length;
      stats.completed = dayApts.filter(a => a.status === 'completed').length;
    } else if (viewMode === 'month') {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      const monthApts = appointments.filter(a => {
        const d = new Date(a.appointment_date);
        return d >= monthStart && d <= monthEnd;
      });
      stats.total = monthApts.length;
      stats.pending = monthApts.filter(a => a.status === 'pending').length;
      stats.completed = monthApts.filter(a => a.status === 'completed').length;
    } else {
      stats.total = filteredAppointments.length;
      stats.pending = filteredAppointments.filter(a => a.status === 'pending').length;
      stats.completed = filteredAppointments.filter(a => a.status === 'completed').length;
    }
    return stats;
  })();

  // Table title logic
  const getTableTitle = () => {
    if (viewMode === 'day' && selectedDate) return `Appointments for ${format(selectedDate, 'PPP')}`;
    if (viewMode === 'week' && selectedDate) {
      const weekStart = startOfWeek(selectedDate, { weekStartsOn: 0 });
      return `Appointments for Week of ${format(weekStart, 'MMM d')}`;
    }
    if (viewMode === 'month') return `Appointments for ${format(currentDate, 'MMMM yyyy')}`;
    return 'All Metrology Appointments';
  };

  // View mode switcher
  const viewModeButtons = (
    <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-0.5">
      <button 
        onClick={() => { setViewMode('day'); setSelectedDate(today); }}
        className={`px-3 py-1 text-xs rounded-md ${viewMode === 'day' ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'}`}
      >Day</button>
      <button 
        onClick={() => setViewMode('week')}
        className={`px-3 py-1 text-xs rounded-md ${viewMode === 'week' ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'}`}
      >Week</button>
                    <button 
        onClick={() => setViewMode('month')}
        className={`px-3 py-1 text-xs rounded-md ${viewMode === 'month' ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'}`}
      >Month</button>
                    <button 
        onClick={() => setViewMode('all')}
        className={`px-3 py-1 text-xs rounded-md ${viewMode === 'all' ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'}`}
      >All</button>
                  </div>
  );

  // Modal open/close logic
  const openModal = (appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

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

  // Define metrology columns for the table
  const metrologyColumns = [
    { key: 'id', label: 'ID' },
    { key: 'customer_name', label: 'Customer' },
    ...(viewMode !== 'day' ? [
      { key: 'appointment_date', label: 'Date', render: (apt) => format(new Date(apt.appointment_date), 'MMM d, yyyy') },
    ] : []),
    { key: 'type_of_test', label: 'Test Type' },
    { key: 'number_of_liters', label: 'Number of Liters' },
    { key: 'status', label: 'Status', render: (apt) => {
      const statusColors = getStatusColor(apt.status);
      return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${statusColors.bgClass} ${statusColors.textClass}`}>{apt.status}</span>;
    } },
    { key: 'actions', label: 'Actions', render: (apt) => (
      <button
        onClick={() => openModal(apt)}
        className="p-1 text-gray-500 hover:text-gray-700 rounded hover:bg-gray-100"
        title="View Details / Manage"
      >
        <FaFlask />
      </button>
    ) }
  ];

  // Status update handler for modal
  const handleStatusUpdate = async (appointmentId, newStatus) => {
    setLoadingAction(true);
    try {
      const response = await fetch(`/api/appointments/${appointmentId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update status');
      }
      fetchAppointments();
    } catch (err) {
      console.error("Failed to update appointment status:", err);
      alert(`Error updating status: ${err.message}`);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <>
      {loadingAction && <LoadingOverlay message="Processing action..." />}
      <CalendarDashboardLayout
        leftColumn={
          <>
            <DashboardCalendar
              currentMonth={currentMonth}
              weekdays={weekdays}
              calendarDays={calendarDays}
              selectedDay={selectedDay}
              currentDay={currentDay}
              goToPreviousMonth={() => setCurrentDate(subMonths(currentDate, 1))}
              goToNextMonth={() => setCurrentDate(addMonths(currentDate, 1))}
              setSelectedDay={setSelectedDay}
              getStatusColor={() => ({ bgClass: "bg-blue-100", dotClass: "bg-blue-500" })}
            />
            <DashboardQuickInfo
              title="Date and Stats"
              stats={quickInfoStats}
              getStatusColor={status => ({ textClass: "text-blue-500" })}
            />
          </>
        }
        rightColumn={
          <>
            <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200 flex-shrink-0">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <h3 className="text-base md:text-lg font-semibold text-gray-900 whitespace-nowrap">
                  {getTableTitle()}
                </h3>
                <div className="flex flex-1 items-center gap-2 w-full justify-between">
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Search ID, Name, Status..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 pr-3 py-1.5 w-48 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="all">All Statuses</option>
                      <option value="pending">Pending</option>
                      <option value="in progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="declined">Declined</option>
                    </select>
                  </div>
                  {viewModeButtons}
                </div>
              </div>
            </div>
            <DashboardAppointmentsTable
              filteredAppointments={filteredAppointments}
              viewMode={viewMode}
              openModal={openModal}
              getStatusColor={getStatusColor}
              loading={loading}
              error={error}
              columns={metrologyColumns}
            />
          </>
        }
        modal={
          <ScheduleModal
            isOpen={isModalOpen}
            onClose={closeModal}
            appointment={selectedAppointment}
            onStatusUpdate={handleStatusUpdate}
          />
        }
      />
    </>
  );
} 