"use client";

import { useState, useEffect, useCallback } from 'react';
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
  getDay,
  parseISO,
  isWithinInterval
} from 'date-fns';
import { FaFlask, FaClock, FaSearch, FaCalendar, FaTimes, FaEllipsisH, FaCheck, FaBan, FaCheckCircle } from 'react-icons/fa';
import DashboardNav from "@/components/layout/DashboardNav";
import DashboardSidebar from "@/components/layout/DashboardSidebar";
import AdminLayout from "@/components/layout/AdminLayout";
import CalendarDashboardLayout from "@/components/layout/CalendarDashboardLayout";
import DashboardCalendar from "@/components/shared/DashboardCalendar";
import DashboardQuickInfo from "@/components/shared/DashboardQuickInfo";
import DashboardFilters from "@/components/shared/DashboardFilters";
import DashboardAppointmentsTable from "@/components/shared/DashboardAppointmentsTable";
import ScheduleModal from "@/components/shared/ScheduleModal";
import LoadingOverlay from '@/components/shared/LoadingOverlay';

export default function ChemistryCalendarAndTable() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null); 
  const [viewMode, setViewMode] = useState('month'); // 'day', 'week', 'month', 'all'
  const [loadingAction, setLoadingAction] = useState(false);

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const [calendarDays, setCalendarDays] = useState([]);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [currentDay, setCurrentDay] = useState(new Date().getDate());

  // Function to get status color (shared by modal and calendar/table)
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'completed': return { bgClass: 'bg-green-100', textClass: 'text-green-800', dotClass: 'bg-green-500' };
      case 'pending': return { bgClass: 'bg-yellow-100', textClass: 'text-yellow-800', dotClass: 'bg-yellow-500' };
      case 'accepted': return { bgClass: 'bg-blue-100', textClass: 'text-blue-800', dotClass: 'bg-blue-500' };
      case 'in progress': return { bgClass: 'bg-indigo-100', textClass: 'text-indigo-800', dotClass: 'bg-indigo-500' };
      case 'declined': return { bgClass: 'bg-red-100', textClass: 'text-red-800', dotClass: 'bg-red-500' };
      default: return { bgClass: 'bg-gray-100', textClass: 'text-gray-800', dotClass: 'bg-gray-500' };
    }
  };

  // Fetch *all* microbiology appointments 
  const fetchAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/appointments?category=microbiology`); 
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (data.success) {
        // Transform API data to match table expectations
        const mapped = (data.data || []).map(apt => ({
          id: apt.id || apt.appointment_id || '',
          appointment_date: apt.appointment_date || '',
          appointment_time: apt.appointment_time || '',
          customer_name: apt.customer_name || '',
          customer_contact: apt.contact_number || '',
          analysis_requested: apt.analysis_requested || apt.testType || '',
          status: apt.status || '',
          ...apt
        }));
        setAppointments(mapped);
      } else {
        throw new Error(data.message || 'Failed to fetch appointments');
      }
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  // Generate calendarDays array for DashboardCalendar
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
      const aptDate = new Date(apt.appointment_date);
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

  useEffect(() => {
    generateCalendarDays(currentMonth, appointments);
  }, [currentMonth, appointments]);

  // --- Status Update Logic (remains the same) --- 
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

  // --- Modal Open/Close Logic (remains the same) --- 
  const openModal = (appointment) => {
    setSelectedAppointment(appointment);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedAppointment(null);
  };

  // --- Calendar Navigation Logic --- 
  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  // --- Filtering Logic for Table --- 
  const filteredAppointments = appointments.filter(apt => {
      // Date Range Filter based on viewMode
      let isInDateRange = true;
      const aptDate = parseISO(apt.appointment_date);
      const refDate = selectedDate || currentMonth; // Use selectedDate if available, else currentMonth for week/month context

      switch (viewMode) {
          case 'day':
              isInDateRange = isSameDay(aptDate, refDate);
              break;
          case 'week':
              const weekStart = startOfWeek(refDate, { weekStartsOn: 0 }); // Assuming Sunday start
              const weekEnd = endOfWeek(refDate, { weekStartsOn: 0 });
              isInDateRange = isWithinInterval(aptDate, { start: weekStart, end: weekEnd });
              break;
          case 'month':
              const monthStart = startOfMonth(currentMonth); // Always use currentMonth for month view
              const monthEnd = endOfMonth(currentMonth);
              isInDateRange = isWithinInterval(aptDate, { start: monthStart, end: monthEnd });
              break;
          case 'all':
              isInDateRange = true;
              break;
          default:
              isInDateRange = true;
      }

      if (!isInDateRange) return false; 

      // Search Term Filter
      const lowerSearchTerm = searchTerm.toLowerCase();
      const matchesSearch = !searchTerm || (
          apt.id.toString().includes(lowerSearchTerm) ||
          apt.customer_name?.toLowerCase().includes(lowerSearchTerm) ||
          apt.analysis_requested?.toLowerCase().includes(lowerSearchTerm) ||
          apt.status?.toLowerCase().includes(lowerSearchTerm)
      );
      
      // Status Filter
      const matchesStatus = filterStatus === 'all' || apt.status?.toLowerCase() === filterStatus;
      
      return matchesSearch && matchesStatus; // Must match date (if set), search, and status
  });

  // Calculate stats for the current view
  const currentViewStats = (() => {
      let stats = { total: 0 };
      let title = ''
      let dateRange = { start: null, end: null };
      const refDate = selectedDate || currentMonth;

      switch (viewMode) {
          case 'day':
              if (!selectedDate) return { title: 'Select a day', stats: { total: 0 } };
              title = `Info for ${format(selectedDate, 'MMM d')}`;
              dateRange = { start: selectedDate, end: selectedDate };
              break;
          case 'week':
              dateRange.start = startOfWeek(refDate, { weekStartsOn: 0 });
              dateRange.end = endOfWeek(refDate, { weekStartsOn: 0 });
              title = `Info for Week of ${format(dateRange.start, 'MMM d')}`;
              break;
          case 'month':
              dateRange.start = startOfMonth(currentMonth);
              dateRange.end = endOfMonth(currentMonth);
              title = `Info for ${format(currentMonth, 'MMMM yyyy')}`;
              break;
          case 'all':
          default:
              title = 'Info for All Appointments';
              dateRange = null; // No date range filtering for 'all' stats
      }

      appointments.forEach(apt => {
          const aptDate = parseISO(apt.appointment_date);
          // Check if appointment falls within the calculated range (if range exists)
          if (!dateRange || isWithinInterval(aptDate, dateRange) || (viewMode === 'day' && isSameDay(aptDate, dateRange.start))) {
              stats.total++;
              const status = apt.status.toLowerCase();
              stats[status] = (stats[status] || 0) + 1;
          }
      });

      return { title, stats };
  })();

  // --- Dynamic Table Title --- 
  const getTableTitle = () => {
      switch (viewMode) {
          case 'day': return `Appointments for ${format(selectedDate || new Date(), 'PPP')}`;
          case 'week':
              const weekStart = startOfWeek(selectedDate || currentMonth, { weekStartsOn: 0 });
              return `Appointments for Week of ${format(weekStart, 'MMM d')}`;
          case 'month': return `Appointments for ${format(currentMonth, 'MMMM yyyy')}`;
          case 'all': default: return 'All Microbiology Appointments';
      }
  };

  // --- Main JSX Layout --- 
  return (
    <>
      {loadingAction && <LoadingOverlay message="Processing action..." />}
      <CalendarDashboardLayout
        leftColumn={
          <>
            <DashboardCalendar
              currentMonth={format(currentMonth, 'MMMM yyyy')}
              weekdays={weekdays}
              calendarDays={calendarDays}
              selectedDay={selectedDay}
              currentDay={currentDay}
              goToPreviousMonth={prevMonth}
              goToNextMonth={nextMonth}
              setSelectedDay={(date) => {
                setSelectedDay(date);
                setSelectedDate(date);
                setViewMode('day');
              }}
              getStatusColor={getStatusColor}
            />
            <DashboardQuickInfo
              title={currentViewStats.title}
              stats={currentViewStats.stats}
              getStatusColor={getStatusColor}
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
                      placeholder="Search ID, Name, Analysis..."
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
                      <option value="accepted">Accepted</option>
                      <option value="in progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="declined">Declined</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-0.5">
                    <button 
                      onClick={() => {
                        setViewMode('day');
                        if (!selectedDate) setSelectedDate(new Date());
                      }}
                      className={`px-3 py-1 text-xs rounded-md ${viewMode === 'day' ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'}`}
                      title="Day View (requires selecting a day on calendar)"
                      disabled={!selectedDate}
                    >
                      Day
                    </button>
                    <button 
                      onClick={() => setViewMode('week')}
                      className={`px-3 py-1 text-xs rounded-md ${viewMode === 'week' ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'}`}
                    >
                      Week
                    </button>
                    <button 
                      onClick={() => setViewMode('month')}
                      className={`px-3 py-1 text-xs rounded-md ${viewMode === 'month' ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'}`}
                    >
                      Month
                    </button>
                    <button 
                      onClick={() => { setViewMode('all'); setSelectedDate(null); }}
                      className={`px-3 py-1 text-xs rounded-md ${viewMode === 'all' ? 'bg-gray-200 font-medium' : 'hover:bg-gray-100'}`}
                    >
                      All
                    </button>
                  </div>
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
              columns={[
                { key: 'appointment_date', label: 'Date', render: (apt) => apt.appointment_date },
                { key: 'customer_name', label: 'Customer' },
                { key: 'services', label: 'Analysis' },
                { key: 'name_of_samples', label: 'Sample' },
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
                    <FaEllipsisH />
                  </button>
                ) }
              ]}
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