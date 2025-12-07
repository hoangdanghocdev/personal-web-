import React, { useState, useEffect, useRef } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface DateRangePickerProps {
  startDate: string;
  endDate: string;
  onChange: (start: string, end: string) => void;
}

const DateRangePicker: React.FC<DateRangePickerProps> = ({ startDate, endDate, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Parse YYYY-MM-DD to Local Date object to avoid timezone issues
  const parseYMD = (ymd: string) => {
      if(!ymd) return new Date();
      const [y, m, d] = ymd.split('-').map(Number);
      return new Date(y, m - 1, d);
  };

  const [viewDate, setViewDate] = useState(parseYMD(startDate));
  const [hoverDate, setHoverDate] = useState<Date | null>(null);
  const [selectingStart, setSelectingStart] = useState<Date | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSelectingStart(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));

  const toYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  const handleDayClick = (day: number) => {
    const clickedDate = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);

    if (!selectingStart) {
      setSelectingStart(clickedDate);
      setHoverDate(null); // Reset hover to avoid jumping
    } else {
      let start = selectingStart;
      let end = clickedDate;
      if (end < start) {
        [start, end] = [end, start];
      }
      onChange(toYMD(start), toYMD(end));
      setSelectingStart(null);
      setIsOpen(false);
    }
  };

  const formatDateDisplay = (ymd: string) => {
    if (!ymd) return '';
    const date = parseYMD(ymd);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const renderCalendar = () => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDay = getFirstDayOfMonth(year, month);

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`pad-${i}`} className="h-9 w-9" />);
    }

    const startObj = selectingStart || (startDate ? parseYMD(startDate) : null);
    const endObj = selectingStart ? null : (endDate ? parseYMD(endDate) : null);
    
    // Helper to check date equality (ignoring time)
    const isSameDate = (d1: Date, d2: Date) => 
        d1.getFullYear() === d2.getFullYear() && 
        d1.getMonth() === d2.getMonth() && 
        d1.getDate() === d2.getDate();

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      
      let isSelected = false;
      let isRange = false;
      let isStart = false;
      let isEnd = false;

      // Logic to determine visual state
      if (selectingStart) {
        isStart = isSameDate(date, selectingStart);
        if (hoverDate) {
            const s = selectingStart < hoverDate ? selectingStart : hoverDate;
            const e = selectingStart < hoverDate ? hoverDate : selectingStart;
            if (date > s && date < e) isRange = true;
            if (isSameDate(date, hoverDate)) isEnd = true; // Visual end guide
            
            // Edge case: if hovering same day as start
            if (isSameDate(selectingStart, hoverDate) && isSameDate(date, selectingStart)) {
                isStart = true; isEnd = true; 
            }
        }
      } else {
        if (startObj) isStart = isSameDate(date, startObj);
        if (endObj) isEnd = isSameDate(date, endObj);
        if (startObj && endObj && date > startObj && date < endObj) isRange = true;
      }

      // Visual Styles
      let btnClass = "h-9 w-9 flex items-center justify-center text-sm rounded-full transition-colors relative z-10 cursor-pointer ";
      if (isStart || isEnd) {
        btnClass += "bg-brand-600 text-white font-bold shadow-brand-200 shadow-md transform scale-105";
      } else if (isRange) {
        btnClass += "bg-brand-50 text-brand-700 font-medium rounded-none";
      } else {
        btnClass += "text-slate-700 hover:bg-slate-100";
      }

      // Range Strip Logic (Background connector)
      let strip = null;
      if (isRange || (isStart && (endObj || hoverDate)) || (isEnd && (startObj || hoverDate))) {
         // Determine range direction presence
         const isSingleDay = (startObj && endObj && isSameDate(startObj, endObj)) && !selectingStart;

         if (!isSingleDay) {
            if (isStart) strip = <div className="absolute top-0 bottom-0 right-0 w-1/2 bg-brand-50" />;
            if (isEnd) strip = <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-brand-50" />;
            if (isRange) strip = <div className="absolute inset-0 bg-brand-50 -mx-1" />;
         }
      }

      days.push(
        <div 
            key={d} 
            className="relative p-0.5 flex items-center justify-center"
            onMouseEnter={() => selectingStart && setHoverDate(date)}
        >
          {strip}
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); handleDayClick(d); }}
            className={btnClass}
          >
            {d}
          </button>
        </div>
      );
    }
    return days;
  };

  return (
    <div className="relative w-full z-50" ref={containerRef}>
        {/* Modern Trigger UI - Airbnb/Booking Style */}
        <div 
            onClick={() => setIsOpen(!isOpen)}
            className={`
                group relative flex items-center w-full transition-all duration-300 cursor-pointer select-none
                bg-white border
                ${isOpen 
                    ? 'border-brand-500 shadow-[0_4px_20px_rgba(59,130,246,0.15)] rounded-2xl ring-2 ring-brand-100 ring-offset-1' 
                    : 'border-slate-200 hover:border-brand-300 hover:shadow-lg rounded-2xl shadow-sm'
                }
            `}
        >
            {/* Left Icon */}
            <div className="pl-4 pr-3 py-4 border-r border-slate-100 flex items-center justify-center">
                 <div className={`
                    p-2 rounded-xl transition-colors duration-300
                    ${isOpen ? 'bg-brand-50 text-brand-600' : 'bg-slate-50 text-slate-400 group-hover:bg-brand-50 group-hover:text-brand-500'}
                 `}>
                    <CalendarDays size={20} strokeWidth={2} />
                 </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 flex items-center justify-between px-5 py-3">
                
                {/* Check-In */}
                <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-0.5 group-hover:text-brand-400 transition-colors">Start Date</span>
                    <span className={`text-sm font-bold truncate transition-colors ${startDate ? 'text-slate-800' : 'text-slate-300 italic'}`}>
                        {startDate ? formatDateDisplay(startDate) : 'Select date'}
                    </span>
                </div>

                {/* Arrow */}
                <div className="px-4 text-slate-300 group-hover:text-brand-300 transition-colors transform group-hover:translate-x-1 duration-300">
                    <ArrowRight size={18} strokeWidth={2.5} />
                </div>

                {/* Check-Out */}
                <div className="flex flex-col text-right">
                    <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400 mb-0.5 group-hover:text-brand-400 transition-colors">End Date</span>
                    <span className={`text-sm font-bold truncate transition-colors ${endDate ? 'text-slate-800' : 'text-slate-300 italic'}`}>
                        {endDate ? formatDateDisplay(endDate) : 'Select date'}
                    </span>
                </div>
            </div>
        </div>

        {/* Dropdown Calendar */}
        {isOpen && (
            <div className="absolute top-full left-0 mt-3 bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 w-full min-w-[300px] animate-fade-in-up z-[60]">
                {/* Triangle Indicator */}
                <div className="absolute -top-2 left-8 w-4 h-4 bg-white border-t border-l border-slate-100 transform rotate-45 z-0"></div>
                
                <div className="relative z-10">
                    <div className="flex items-center justify-between mb-5">
                        <button type="button" onClick={handlePrevMonth} className="p-2 hover:bg-slate-50 rounded-full text-slate-500 transition-colors hover:text-brand-600"><ChevronLeft size={20}/></button>
                        <span className="font-bold text-slate-800 text-base">
                            {viewDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </span>
                        <button type="button" onClick={handleNextMonth} className="p-2 hover:bg-slate-50 rounded-full text-slate-500 transition-colors hover:text-brand-600"><ChevronRight size={20}/></button>
                    </div>

                    <div className="grid grid-cols-7 mb-3 text-center">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                            <span key={d} className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{d}</span>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-y-1">
                        {renderCalendar()}
                    </div>
                    
                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-xs">
                         <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-brand-600 block"></span>
                            <span className="text-slate-500">Selected</span>
                         </div>
                         <div className="text-brand-600 font-medium">
                            {selectingStart 
                                ? "Select end date" 
                                : "Click start date"}
                         </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};

export default DateRangePicker;