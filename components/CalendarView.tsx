import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, addMonths, subMonths, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight, Droplet, Sparkles, Heart } from 'lucide-react';
import { CycleStats, SpecialDate } from '../types';
import { getDayStatus } from '../services/prediction';

interface Props {
  cycleStats: CycleStats;
  specialDates: SpecialDate[];
  onDayClick: (date: Date) => void;
}

const CalendarView: React.FC<Props> = ({ cycleStats, specialDates, onDayClick }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Padding for grid
  const startDay = getDay(monthStart); // 0 = Sun
  const emptyDays = Array(startDay).fill(null);

  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-6 px-4">
        <button onClick={prevMonth} className="p-2 hover:bg-pink-50 rounded-full text-textMuted">
          <ChevronLeft />
        </button>
        <h2 className="text-xl font-bold text-textPrimary capitalize">
          {format(currentDate, 'MMMM yyyy')}
        </h2>
        <button onClick={nextMonth} className="p-2 hover:bg-pink-50 rounded-full text-textMuted">
          <ChevronRight />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2 px-2">
        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
          <div key={d} className="text-center text-xs text-textMuted font-bold uppercase">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-y-4 gap-x-1 px-2">
        {emptyDays.map((_, i) => <div key={`empty-${i}`} />)}
        
        {days.map(day => {
          const status = getDayStatus(day, cycleStats);
          const isSpecial = specialDates.some(sd => {
              // Very simple recurrence check for yearly
              const sDate = new Date(sd.date);
              return sDate.getDate() === day.getDate() && sDate.getMonth() === day.getMonth();
          });
          
          let bgClass = "bg-transparent";
          let textClass = "text-textPrimary";
          
          if (status === 'period') {
            bgClass = "bg-primary text-white shadow-md shadow-pink-200";
            textClass = "text-white";
          } else if (status === 'predicted') {
            bgClass = "bg-accent text-primary border border-pink-100";
          } else if (status === 'fertile') {
            bgClass = "bg-secondary/20 text-blue-600";
          }

          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDayClick(day)}
              className={`relative h-10 w-10 mx-auto flex items-center justify-center rounded-xl text-sm transition-all ${bgClass} ${isToday ? 'ring-2 ring-primary ring-offset-2' : ''}`}
            >
              <span className={textClass}>{format(day, 'd')}</span>
              
              {/* Icons */}
              <div className="absolute -bottom-1 flex gap-0.5">
                {isSpecial && <Heart size={6} className="text-red-500 fill-red-500" />}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-8 flex justify-center gap-4 text-xs text-textMuted">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-primary"></div> Period
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-accent border border-pink-100"></div> Predicted
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded-full bg-secondary/30"></div> Fertile
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
