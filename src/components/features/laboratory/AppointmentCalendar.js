'use client';

import { useState, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

export default function AppointmentCalendar({ selectedDate, onDateSelect, bookedDates = [], disabled = false }) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState([]);
  
  // Generate calendar days when month changes
  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month
    const firstDay = new Date(year, month, 1);
    // Last day of the month
    const lastDay = new Date(year, month + 1, 0);
    
    // Day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayIndex = firstDay.getDay();
    // Total days in month
    const totalDays = lastDay.getDate();
    
    // Previous month's days to display
    const prevMonthDays = [];
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const prevDate = new Date(year, month, -i);
      prevMonthDays.push({ date: prevDate, isCurrentMonth: false });
    }
    
    // Current month's days
    const currentMonthDays = [];
    for (let i = 1; i <= totalDays; i++) {
      const date = new Date(year, month, i);
      currentMonthDays.push({ date, isCurrentMonth: true });
    }
    
    // Next month's days to display (to fill calendar grid)
    const nextMonthDays = [];
    const daysNeeded = 42 - (prevMonthDays.length + currentMonthDays.length); // 6 rows x 7 days
    for (let i = 1; i <= daysNeeded; i++) {
      const nextDate = new Date(year, month + 1, i);
      nextMonthDays.push({ date: nextDate, isCurrentMonth: false });
    }
    
    setCalendarDays([...prevMonthDays, ...currentMonthDays, ...nextMonthDays]);
  }, [currentMonth]);
  
  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  const isToday = (date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  
  const isSelectedDate = (date) => {
    if (!selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };
  
  const isBookedDate = (date) => {
    return bookedDates.some(bookedDate => {
      const booked = new Date(bookedDate);
      return (
        date.getDate() === booked.getDate() &&
        date.getMonth() === booked.getMonth() &&
        date.getFullYear() === booked.getFullYear()
      );
    });
  };
  
  const isPastDate = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };
  
  const formatMonth = (date) => {
    return date.toLocaleString('default', { month: 'long', year: 'numeric' });
  };
  
  const getDayClass = (dayInfo) => {
    const { date, isCurrentMonth } = dayInfo;
    
    let classes = "flex items-center justify-center h-10 w-10 rounded-full mx-auto ";
    
    if (!isCurrentMonth) {
      classes += "text-gray-400 ";
    } else if (isPastDate(date)) {
      classes += "text-gray-400 cursor-not-allowed ";
    } else if (isBookedDate(date)) {
      classes += "bg-orange-100 text-orange-700 cursor-not-allowed ";
    } else if (isSelectedDate(date)) {
      classes += "bg-blue-600 text-white ";
    } else if (isToday(date)) {
      classes += "bg-blue-100 text-blue-700 ";
    } else {
      classes += "text-gray-800 hover:bg-blue-50 ";
    }
    
    if (disabled) {
      classes += "opacity-50 cursor-not-allowed ";
    }
    
    return classes;
  };
  
  const handleDateClick = (dayInfo) => {
    const { date, isCurrentMonth } = dayInfo;
    
    if (!isCurrentMonth || isPastDate(date) || isBookedDate(date)) {
      return;
    }
    
    onDateSelect(date);
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-8">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Select Appointment Date</h2>
      
      {/* Calendar header */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={goToPreviousMonth}
          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled}
        >
          <ChevronLeftIcon className="h-5 w-5 text-gray-600" />
        </button>
        <h3 className="text-lg font-medium text-gray-900">
          {formatMonth(currentMonth)}
        </h3>
        <button
          type="button"
          onClick={goToNextMonth}
          className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={disabled}
        >
          <ChevronRightIcon className="h-5 w-5 text-gray-600" />
        </button>
      </div>
      
      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 mb-2 text-center">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((dayInfo, index) => (
          <div 
            key={index} 
            className="h-12 flex items-center justify-center"
          >
            <button
              type="button"
              onClick={() => handleDateClick(dayInfo)}
              disabled={!dayInfo.isCurrentMonth || isPastDate(dayInfo.date) || isBookedDate(dayInfo.date) || disabled}
              className={getDayClass(dayInfo)}
            >
              {dayInfo.date.getDate()}
            </button>
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-center mt-6 text-sm text-gray-600 gap-4">
        <div className="flex items-center">
          <div className="h-4 w-4 rounded-full bg-blue-600 mr-2"></div>
          <span>Selected</span>
        </div>
        <div className="flex items-center">
          <div className="h-4 w-4 rounded-full bg-blue-100 mr-2"></div>
          <span>Today</span>
        </div>
        <div className="flex items-center">
          <div className="h-4 w-4 rounded-full bg-orange-100 mr-2"></div>
          <span>Booked</span>
        </div>
      </div>
    </div>
  );
} 