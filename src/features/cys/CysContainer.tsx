import React, { useState, useEffect } from 'react';
import { Calendar, LayoutTemplate } from 'lucide-react';
import { BusyData, UserAction } from '../../shared/types';
import { STORAGE_KEYS, getStorage, setStorage } from '../../shared/utils';
import { TIME_SLOTS } from './types';
import CysGuest from './CysGuest';
import CysAdmin from './CysAdmin';

const CysContainer: React.FC<{ isLoggedIn: boolean }> = ({ isLoggedIn }) => {
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [busyData, setBusyData] = useState<BusyData>({});
  
  // Form State Lifted Up or Managed in Guest? 
  // We need date selection state shared with Calendar
  const [isMultiDay, setIsMultiDay] = useState(false);
  const [reqStartDate, setReqStartDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reqEndDate, setReqEndDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [reqStartTime, setReqStartTime] = useState<string>('09:00');
  const [reqEndTime, setReqEndTime] = useState<string>('10:00');
  const [userAction, setUserAction] = useState<UserAction>(getStorage(STORAGE_KEYS.USER_ACTION, { likedItems: [], lastRequestTime: 0 }));

  useEffect(() => {
    setBusyData(getStorage(STORAGE_KEYS.BUSY, {}));
    const interval = setInterval(() => setBusyData(getStorage(STORAGE_KEYS.BUSY, {})), 2000);
    return () => clearInterval(interval);
  }, []);

  const handleSlotClick = (time: string) => {
    // Admin Mode: Mark busy
    if (isLoggedIn) {
      const currentBusy = busyData[selectedDate] || [];
      const newBusy = currentBusy.includes(time) ? currentBusy.filter(t => t !== time) : [...currentBusy, time];
      const updatedData = { ...busyData, [selectedDate]: newBusy };
      setBusyData(updatedData);
      setStorage(STORAGE_KEYS.BUSY, updatedData);
    } else {
      // Guest Mode: Quick select start time for convenience
      if (!isMultiDay) {
        setReqStartTime(time);
        // Auto set end time to +1 hour for convenience
        const [h, m] = time.split(':').map(Number);
        const endH = (h + 1).toString().padStart(2, '0');
        setReqEndTime(`${endH}:${m.toString().padStart(2, '0')}`);
        // Sync the form date with the calendar selection
        setReqStartDate(selectedDate);
      }
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8 animate-fade-in">
      <h2 className="text-3xl font-bold text-center text-brand-800 mb-8 uppercase tracking-widest">Check Your Schedule</h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: CALENDAR & BUSY VIEW (SHARED) */}
        <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col h-full">
          <div className="mb-6">
            <h3 className="font-bold text-slate-700 mb-2 flex items-center gap-2">
              <Calendar className="text-brand-600" size={20}/> Availability View
            </h3>
            <input type="date" className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}/>
          </div>
          
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mb-6">
             {TIME_SLOTS.map(time => {
               const busy = busyData[selectedDate]?.includes(time);
               // Simple visual indicator if the time matches user selection in Single Day mode
               const isSelected = !isLoggedIn && !isMultiDay && reqStartDate === selectedDate && reqStartTime === time;
               
               return (
                 <button 
                  key={time} 
                  onClick={() => handleSlotClick(time)} 
                  className={`py-2 px-1 rounded-lg text-sm font-bold transition-all 
                    ${busy ? 'bg-red-500 text-white shadow-red-200' : 
                      isSelected ? 'bg-brand-600 text-white ring-2 ring-offset-2 ring-brand-500' : 'bg-slate-50 text-slate-700 hover:bg-brand-100'}
                  `}
                 >
                   {time}
                 </button>
               )
             })}
          </div>

          <div className="space-y-4 mb-6">
             <div className="flex items-center gap-2 text-sm"><div className="w-4 h-4 bg-red-500 rounded shadow-sm"></div><span>Busy (Admin marked)</span></div>
             {!isLoggedIn && <div className="flex items-center gap-2 text-sm"><div className="w-4 h-4 bg-brand-600 rounded shadow-sm"></div><span>Selected Start Time</span></div>}
             <p className="text-xs text-slate-500 mt-2 italic">*Admin Mode: Click slots to mark Busy (Red). <br/>*Guest Mode: Use form on right to request.</p>
          </div>
          
          {/* Admin also sees the List here if logged in, but we can move it to right column or keep it */}
        </div>

        {/* RIGHT COLUMN */}
        {isLoggedIn ? (
            <CysAdmin />
        ) : (
            <CysGuest 
                reqStartDate={reqStartDate} setReqStartDate={setReqStartDate}
                reqStartTime={reqStartTime} setReqStartTime={setReqStartTime}
                reqEndTime={reqEndTime} setReqEndTime={setReqEndTime}
                isMultiDay={isMultiDay} setIsMultiDay={setIsMultiDay}
                reqEndDate={reqEndDate} setReqEndDate={setReqEndDate}
                userAction={userAction} setUserAction={setUserAction}
            />
        )}
      </div>
    </div>
  );
};

export default CysContainer;
