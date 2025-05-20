import React from 'react';

export default function DashboardCalendar({
  currentMonth,
  weekdays,
  calendarDays,
  selectedDay,
  currentDay,
  goToPreviousMonth,
  goToNextMonth,
  setSelectedDay,
  getStatusColor
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-4 border border-gray-200 h-full flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <button onClick={goToPreviousMonth} className="text-blue-600">&lt;</button>
        <span className="font-semibold text-lg">{currentMonth}</span>
        <button onClick={goToNextMonth} className="text-blue-600">&gt;</button>
      </div>
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekdays.map((day, idx) => (
          <div key={idx} className="text-xs font-medium text-gray-500 text-center">{day}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-1 flex-1 min-h-[350px]">
        {calendarDays.map((dayObj, idx) => {
          // Determine if there are appointments and what statuses
          let hasAppointments = dayObj.appointments && dayObj.appointments.count > 0;
          let statusList = [];
          if (hasAppointments && dayObj.appointments.statuses) {
            statusList = dayObj.appointments.statuses.split(',').map(s => s.trim());
          }
          // Use the first status for the ring color
          const mainStatus = statusList[0];
          const statusColor = mainStatus ? getStatusColor(mainStatus) : null;
          return (
            <button
              key={idx}
              className={`aspect-square min-h-[48px] w-full flex flex-col items-center justify-center rounded-md text-sm relative
                ${dayObj.isCurrentMonth ? 'bg-blue-50' : 'bg-gray-100'}
                ${selectedDay && dayObj.date && selectedDay instanceof Date && dayObj.date.toDateString() === selectedDay.toDateString() ? 'ring-2 ring-blue-500 animate-selected-ring' : ''}
                ${dayObj.day === currentDay ? 'font-bold text-blue-700' : ''}
                ${hasAppointments && statusColor ? `border-4 ${statusColor.bgClass}` : ''}
                transition-all duration-200 hover:bg-blue-100 hover:scale-110 hover:ring-2 hover:ring-blue-300 hover:shadow-lg cursor-pointer`}
              style={hasAppointments && statusColor ? { borderColor: statusColor.dotClass.replace('bg-', 'var(--tw-') } : {}}
              disabled={!dayObj.isCurrentMonth}
              onClick={() => dayObj.isCurrentMonth && dayObj.date && setSelectedDay(dayObj.date)}
            >
              <span>{dayObj.day || ''}</span>
              {/* Status dots below the day */}
              <div className="flex space-x-0.5 mt-1">
                {statusList.map((status, i) => {
                  const color = getStatusColor(status);
                  return <span key={i} className={`w-2 h-2 rounded-full ${color ? color.dotClass : 'bg-gray-300'} transition-transform duration-200 group-hover:scale-125`}></span>;
                })}
              </div>
            </button>
          );
        })}
      </div>
      {/* Legend */}
      <div className="flex flex-wrap items-center justify-center gap-4 mt-4">
        <div className="flex items-center space-x-1"><span className="w-3 h-3 rounded-full bg-green-500 inline-block"></span><span className="text-xs text-gray-700">Completed</span></div>
        <div className="flex items-center space-x-1"><span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span><span className="text-xs text-gray-700">Pending</span></div>
        <div className="flex items-center space-x-1"><span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span><span className="text-xs text-gray-700">In Progress</span></div>
        <div className="flex items-center space-x-1"><span className="w-3 h-3 rounded-full bg-red-500 inline-block"></span><span className="text-xs text-gray-700">Declined</span></div>
      </div>
    </div>
  );
} 