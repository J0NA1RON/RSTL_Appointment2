import React from "react";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, isToday, parseISO } from 'date-fns';

export default function CalendarMonthView({
  currentMonth,
  selectedDate,
  appointments,
  onDateSelect,
  onMonthChange,
  getStatusColor,
  viewMode
}) {
  const renderCalendarHeader = () => (
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-lg font-semibold text-gray-900">
        {format(currentMonth, 'MMMM yyyy')}
      </h2>
      <div className="flex gap-2">
        <button onClick={() => onMonthChange(-1)} className="p-1.5 hover:bg-gray-100 rounded-lg">&lt;</button>
        <button onClick={() => { onMonthChange(0); }} className="px-3 py-1 text-xs hover:bg-gray-100 rounded-lg border">Today</button>
        <button onClick={() => onMonthChange(1)} className="p-1.5 hover:bg-gray-100 rounded-lg">&gt;</button>
      </div>
    </div>
  );

  const renderCalendarDaysHeader = () => {
    const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return (
      <div className="grid grid-cols-7 text-center text-xs font-medium text-gray-500 mb-1">
        {days.map((day, index) => <div key={`${day}-${index}`} className="py-1">{day}</div>)}
      </div>
    );
  };

  const renderCalendarCells = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);
    const rows = [];
    let days = [];
    let day = startDate;
    while (day <= endDate) {
      for (let i = 0; i < 7; i++) {
        const cloneDay = day;
        const dayAppointments = appointments.filter(apt => isSameDay(parseISO(apt.appointment_date), cloneDay));
        days.push(
          <div
            key={format(day, 'yyyy-MM-dd')}
            day={cloneDay}
            className={`
              p-1 border border-gray-100 h-16 overflow-hidden flex flex-col items-center justify-start cursor-pointer
              ${!isSameMonth(day, monthStart) ? 'bg-gray-50 text-gray-400' : 'bg-white hover:bg-blue-50'}
              ${isToday(day) ? 'border-blue-300 font-semibold' : ''}
              ${selectedDate && isSameDay(day, selectedDate) && viewMode === 'day' ? 'bg-blue-100 ring-1 ring-blue-300' : ''}
            `}
            onClick={() => onDateSelect(cloneDay)}
          >
            <span className={`text-xs ${isToday(day) ? 'text-blue-600 font-bold' : ''}`}>{format(day, 'd')}</span>
            {dayAppointments.length > 0 && (
              <div className="flex flex-wrap justify-center gap-0.5 mt-1">
                {dayAppointments.slice(0, 4).map(apt => (
                  <span key={apt.id} className={`w-1 h-1 rounded-full ${getStatusColor(apt.status).dotClass}`} title={apt.status}></span>
                ))}
                {dayAppointments.length > 4 && <span className="w-1 h-1 rounded-full bg-gray-400" title={`${dayAppointments.length - 4} more`}></span>}
              </div>
            )}
          </div>
        );
        day = addDays(day, 1);
      }
      rows.push(
        <div className="grid grid-cols-7" key={days.length > 0 ? format(days[0].props.day, 'yyyy-MM-dd-week') : `empty-row-${rows.length}`}>{days}</div>
      );
      days = [];
    }
    return <div className="border-t border-l border-gray-200">{rows}</div>;
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-3 border border-gray-200 flex-grow flex flex-col">
      {renderCalendarHeader()}
      {renderCalendarDaysHeader()}
      <div className="flex-grow">{renderCalendarCells()}</div>
    </div>
  );
} 