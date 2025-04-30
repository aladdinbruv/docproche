"use client";

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FaChevronLeft, FaChevronRight, FaCalendarCheck } from 'react-icons/fa';

interface CalendarProps {
  availableDates?: string[];
  onSelectDate: (date: Date) => void;
  selectedDate?: Date | null;
  minDate?: Date;
  maxDate?: Date;
}

export const Calendar = ({
  availableDates = [],
  onSelectDate,
  selectedDate = null,
  minDate = new Date(),
  maxDate,
}: CalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarDays, setCalendarDays] = useState<Array<{ date: Date | null; available: boolean; isCurrentMonth: boolean }>>([]);
  
  // Convert availableDates strings to Date objects
  const availableDateObjects = availableDates.map(dateStr => new Date(dateStr));
  
  // Check if a date is available
  const isDateAvailable = (date: Date) => {
    if (!date) return false;
    
    // Check if date is after minDate
    if (minDate && date < new Date(minDate.setHours(0, 0, 0, 0))) {
      return false;
    }
    
    // Check if date is before maxDate
    if (maxDate && date > new Date(maxDate.setHours(0, 0, 0, 0))) {
      return false;
    }
    
    // If availableDates are provided, check if the date is in the list
    if (availableDateObjects.length > 0) {
      return availableDateObjects.some(availableDate => 
        availableDate.getDate() === date.getDate() &&
        availableDate.getMonth() === date.getMonth() &&
        availableDate.getFullYear() === date.getFullYear()
      );
    }
    
    // If no availableDates provided, all future dates are available
    return true;
  };
  
  // Generate calendar days for the current month
  useEffect(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    
    // First day of the month
    const firstDayOfMonth = new Date(year, month, 1);
    // Last day of the month
    const lastDayOfMonth = new Date(year, month + 1, 0);
    
    // Get the day of the week for the first day (0 = Sunday, 6 = Saturday)
    const firstDayOfWeek = firstDayOfMonth.getDay();
    
    // Calculate days from previous month to display
    const daysFromPrevMonth = firstDayOfWeek;
    
    // Calculate total days to display (6 weeks maximum)
    const totalDays = 42; // 6 rows of 7 days
    
    const days = [];
    
    // Add days from the previous month
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = prevMonthLastDay - daysFromPrevMonth + 1; i <= prevMonthLastDay; i++) {
      const date = new Date(year, month - 1, i);
      days.push({
        date,
        available: isDateAvailable(date),
        isCurrentMonth: false,
      });
    }
    
    // Add days from the current month
    for (let i = 1; i <= lastDayOfMonth.getDate(); i++) {
      const date = new Date(year, month, i);
      days.push({
        date,
        available: isDateAvailable(date),
        isCurrentMonth: true,
      });
    }
    
    // Add days from the next month to fill the remaining slots
    const remainingDays = totalDays - days.length;
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i);
      days.push({
        date,
        available: isDateAvailable(date),
        isCurrentMonth: false,
      });
    }
    
    setCalendarDays(days);
  }, [currentMonth, availableDateObjects, minDate, maxDate]);
  
  // Go to previous month
  const goToPrevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
  };
  
  // Go to next month
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
  };
  
  // Format date as YYYY-MM-DD for comparison
  const formatDateForComparison = (date: Date) => {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
  };
  
  // Check if a date is selected
  const isDateSelected = (date: Date | null) => {
    if (!date || !selectedDate) return false;
    
    return formatDateForComparison(date) === formatDateForComparison(selectedDate);
  };
  
  // Day names
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  
  return (
    <div className="w-full bg-white rounded-lg shadow p-4">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button 
          onClick={goToPrevMonth}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Previous month"
        >
          <FaChevronLeft className="text-gray-600" />
        </button>
        
        <h2 className="text-lg font-semibold text-gray-800">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        
        <button 
          onClick={goToNextMonth}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="Next month"
        >
          <FaChevronRight className="text-gray-600" />
        </button>
      </div>
      
      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-1">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day, index) => (
          <motion.button
            key={index}
            onClick={() => day.date && day.available ? onSelectDate(day.date) : null}
            disabled={!day.available || !day.date}
            className={`
              relative py-2 rounded-lg transition-colors
              ${!day.isCurrentMonth ? 'text-gray-400' : 'text-gray-800'}
              ${day.available && day.date ? 'hover:bg-blue-50 cursor-pointer' : 'cursor-default'}
              ${isDateSelected(day.date) ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}
              ${!day.available && day.isCurrentMonth ? 'line-through text-gray-300' : ''}
            `}
            whileHover={day.available ? { scale: 1.1 } : {}}
            whileTap={day.available ? { scale: 0.95 } : {}}
          >
            {day.date ? day.date.getDate() : ''}
            
            {day.available && day.isCurrentMonth && (
              <motion.span
                className="absolute bottom-0.5 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full bg-green-500"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />
            )}
            
            {isDateSelected(day.date) && (
              <motion.span
                className="absolute top-0.5 right-0.5 text-xs"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                <FaCalendarCheck />
              </motion.span>
            )}
          </motion.button>
        ))}
      </div>
      
      {/* Legend */}
      <div className="mt-4 flex justify-between text-xs text-gray-500">
        <div className="flex items-center">
          <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
          <span>Available</span>
        </div>
        <div className="flex items-center">
          <span className="inline-block w-2 h-2 rounded-full bg-blue-500 mr-1"></span>
          <span>Selected</span>
        </div>
      </div>
    </div>
  );
}; 