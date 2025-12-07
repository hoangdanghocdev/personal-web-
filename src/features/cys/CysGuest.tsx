import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle2, AlertCircle, CalendarDays, Loader2, ArrowRight, Calendar, Send, Briefcase, Palmtree, Home, HelpCircle, UserCheck, MessageCircle, Coffee } from 'lucide-react';
import { RequestCYS } from './types';
import { UserAction } from '../../shared/types';
import { STORAGE_KEYS, getStorage, setStorage, generateId } from '../../shared/utils';
import LeafletLocationPicker from './LeafletLocationPicker';
import PurposeSelect, { PurposeOption } from './PurposeSelect';

// --- CONSTANTS FOR REASONS ---

const MULTI_DAY_REASONS: PurposeOption[] = [
  { id: 'Business Trip', label: 'Business Trip', icon: Briefcase, color: 'text-blue-600', bg: 'bg-blue-50' },
  { id: 'Personal Vacation', label: 'Personal Vacation', icon: Palmtree, color: 'text-orange-500', bg: 'bg-orange-50' },
  { id: 'Family Visit', label: 'Family Visit', icon: Home, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  { id: 'Other', label: 'Other', icon: HelpCircle, color: 'text-slate-500', bg: 'bg-slate-100' },
];

// UPDATED: Rich Options for In-Day Events with Specific Icons
const IN_DAY_REASONS: PurposeOption[] = [
  { id: 'Work Interview', label: 'Job Interview', icon: Briefcase, color: 'text-purple-600', bg: 'bg-purple-50' },
  { id: 'Casual Meeting', label: 'Casual Meeting', icon: MessageCircle, color: 'text-indigo-600', bg: 'bg-indigo-50' },
  { id: 'Coffee Chat', label: 'Coffee Chat', icon: Coffee, color: 'text-amber-600', bg: 'bg-amber-50' },
  { id: 'Other', label: 'Other', icon: HelpCircle, color: 'text-slate-500', bg: 'bg-slate-100' },
];

interface CysGuestProps {
  reqStartDate: string;
  setReqStartDate: (d: string) => void;
  reqStartTime: string;
  setReqStartTime: (t: string) => void;
  reqEndTime: string;
  setReqEndTime: (t: string) => void;
  isMultiDay: boolean;
  setIsMultiDay: (b: boolean) => void;
  reqEndDate: string;
  setReqEndDate: (d: string) => void;
  userAction: UserAction;
  setUserAction: (ua: UserAction) => void;
}

const CysGuest: React.FC<CysGuestProps> = ({
  reqStartDate, setReqStartDate,
  reqStartTime, setReqStartTime,
  reqEndTime, setReqEndTime,
  isMultiDay, setIsMultiDay,
  reqEndDate, setReqEndDate,
  userAction, setUserAction
}) => {
  // Local Form State
  const [reqName, setReqName] = useState('');
  const [reqContact, setReqContact] = useState('');
  const [reqPlatform, setReqPlatform] = useState('');
  const [reqReason, setReqReason] = useState(''); 
  const [reqOther, setReqOther] = useState('');
  const [reqLocation, setReqLocation] = useState('');
  
  // Real-time Status State
  const [checkStatus, setCheckStatus] = useState<'idle' | 'checking' | 'available' | 'busy' | 'invalid'>('idle');
  const [statusMsg, setStatusMsg] = useState('');

  // Switch Reasons based on type
  const currentReasons = isMultiDay ? MULTI_DAY_REASONS : IN_DAY_REASONS;

  // Reset reason when mode changes
  useEffect(() => {
    setReqReason('');
  }, [isMultiDay]);

  // --- REAL-TIME CHECKING EFFECT ---
  useEffect(() => {
    // Reset status on every change immediately
    setCheckStatus('checking');
    setStatusMsg('Checking schedule...');

    // 1. Validation Logic
    let isValid = false;
    let errorMsg = '';

    if (isMultiDay) {
        if (!reqStartDate || !reqEndDate) {
            setCheckStatus('idle'); // Still typing
            return;
        }
        if (reqEndDate <= reqStartDate) {
            isValid = false;
            errorMsg = 'End Date must be after Start Date.';
        } else {
            isValid = true;
        }
    } else {
        if (!reqStartDate || !reqStartTime || !reqEndTime) {
            setCheckStatus('idle'); // Still typing
            return;
        }
        if (reqEndTime <= reqStartTime) {
            isValid = false;
            errorMsg = 'End Time must be later than Start Time.';
        } else {
            isValid = true;
        }
    }

    if (!isValid) {
        setCheckStatus('invalid');
        setStatusMsg(errorMsg);
        return;
    }

    // 2. API Simulation (Debounced)
    const timer = setTimeout(() => {
        // Here we would actually check the `busyData`
        // For demo: Random availability
        const isBusy = Math.random() > 0.8; 
        
        if (isBusy) {
            setCheckStatus('busy');
            setStatusMsg('This time slot is conflicted with another event.');
        } else {
            setCheckStatus('available');
            setStatusMsg('Schedule is clear. You can proceed.');
        }
    }, 600); // 600ms debounce to prevent spamming while user types

    return () => clearTimeout(timer);

  }, [reqStartDate, reqEndDate, reqStartTime, reqEndTime, isMultiDay]);

  // --- SUBMIT LOGIC ---
  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();

    if (checkStatus !== 'available') return;
    if (!reqReason) {
        alert("Please select a purpose.");
        return;
    }

    // Spam Check
    const now = Date.now();
    if (now - userAction.lastRequestTime < 3 * 60 * 1000) {
      alert('Please wait 3 minutes before sending another request.');
      return;
    }

    const newUA = { ...userAction, lastRequestTime: now };
    setUserAction(newUA);
    setStorage(STORAGE_KEYS.USER_ACTION, newUA);

    const newReq: RequestCYS = {
      id: generateId(),
      name: reqName, contact: reqContact, contactPlatform: reqPlatform,
      reason: reqReason, 
      subReason: undefined, 
      otherDetail: reqReason === 'Other' ? reqOther : undefined,
      location: reqLocation,
      isMultiDay,
      startDate: reqStartDate,
      endDate: reqEndDate,
      startTime: reqStartTime,
      endTime: reqEndTime
    };

    const requests = getStorage(STORAGE_KEYS.REQUESTS, []);
    setStorage(STORAGE_KEYS.REQUESTS, [...requests, newReq]);
    
    alert('Request sent successfully!');
    setReqName(''); setReqContact(''); setReqLocation(''); setReqReason('');
    setCheckStatus('idle');
  };

  return (
    <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden flex flex-col h-full relative z-10">
      
      {/* 1. TOP SECTION: CONFIGURATION */}
      <div className="p-6 md:p-8 bg-slate-50/50">
        
        {/* TABS */}
        <div className="flex bg-white p-1 rounded-xl shadow-sm border border-slate-200 mb-8">
            <button 
                type="button"
                onClick={() => setIsMultiDay(false)}
                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                    !isMultiDay 
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-200' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
            >
                <Clock size={18} /> In-Day Event
            </button>
            <button 
                type="button"
                onClick={() => setIsMultiDay(true)}
                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                    isMultiDay 
                    ? 'bg-brand-600 text-white shadow-md shadow-brand-200' 
                    : 'text-slate-500 hover:bg-slate-50'
                }`}
            >
                <CalendarDays size={18} /> Multi-Day Event
            </button>
        </div>

        {/* DYNAMIC INPUT GRID */}
        <div className="animate-fade-in">
             {!isMultiDay ? (
                 /* MODE A: IN-DAY */
                 <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-6 space-y-2">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Date</label>
                        <div className="relative group">
                             <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                             <input 
                                type="date" 
                                value={reqStartDate}
                                onChange={(e) => setReqStartDate(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 font-medium text-slate-700 shadow-sm transition-all"
                             />
                        </div>
                    </div>
                    <div className="md:col-span-3 space-y-2">
                         <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Start</label>
                         <input 
                            type="time" 
                            value={reqStartTime}
                            onChange={(e) => setReqStartTime(e.target.value)}
                            className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 font-medium text-slate-700 shadow-sm text-center"
                         />
                    </div>
                    <div className="md:col-span-3 space-y-2">
                         <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">End</label>
                         <input 
                            type="time" 
                            value={reqEndTime}
                            onChange={(e) => setReqEndTime(e.target.value)}
                            className={`w-full px-4 py-3.5 bg-white border rounded-xl outline-none focus:ring-4 transition-all font-medium text-slate-700 shadow-sm text-center ${
                                checkStatus === 'invalid' ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500/10'
                            }`}
                         />
                    </div>
                 </div>
             ) : (
                 /* MODE B: MULTI-DAY */
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
                    <div className="space-y-2 relative z-10">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">From Date</label>
                        <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                            <input 
                                type="date" 
                                value={reqStartDate}
                                onChange={(e) => setReqStartDate(e.target.value)}
                                className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-xl outline-none focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 font-medium text-slate-700 shadow-sm"
                            />
                        </div>
                    </div>
                    
                    {/* Arrow Divider (Desktop) */}
                    <div className="hidden md:flex absolute inset-0 items-center justify-center pointer-events-none pt-6 z-0">
                         <div className="bg-slate-100 p-2 rounded-full text-slate-400">
                             <ArrowRight size={20} />
                         </div>
                    </div>

                    <div className="space-y-2 relative z-10">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">To Date</label>
                        <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-brand-500 transition-colors" size={18} />
                            <input 
                                type="date" 
                                value={reqEndDate}
                                onChange={(e) => setReqEndDate(e.target.value)}
                                className={`w-full pl-11 pr-4 py-3.5 bg-white border rounded-xl outline-none focus:ring-4 font-medium text-slate-700 shadow-sm ${
                                    checkStatus === 'invalid' ? 'border-red-300 focus:border-red-500 focus:ring-red-500/10' : 'border-slate-200 focus:border-brand-500 focus:ring-brand-500/10'
                                }`}
                            />
                        </div>
                    </div>
                 </div>
             )}
        </div>
      </div>

      {/* 2. MIDDLE SECTION: STATUS BANNER */}
      {checkStatus !== 'idle' && (
          <div className={`
            px-6 py-4 flex items-start gap-4 border-y
            animate-fade-in
            ${checkStatus === 'checking' ? 'bg-slate-50 border-slate-100' : ''}
            ${checkStatus === 'available' ? 'bg-emerald-50/80 border-emerald-100' : ''}
            ${checkStatus === 'busy' || checkStatus === 'invalid' ? 'bg-rose-50/80 border-rose-100' : ''}
          `}>
             <div className="shrink-0 mt-0.5">
                 {checkStatus === 'checking' && <Loader2 size={24} className="text-slate-400 animate-spin"/>}
                 {checkStatus === 'available' && <div className="p-1 bg-emerald-100 rounded-full text-emerald-600"><CheckCircle2 size={20} strokeWidth={3}/></div>}
                 {(checkStatus === 'busy' || checkStatus === 'invalid') && <div className="p-1 bg-rose-100 rounded-full text-rose-600"><AlertCircle size={20} strokeWidth={3}/></div>}
             </div>
             
             <div className="flex-1">
                 <h4 className={`text-sm font-extrabold uppercase tracking-wide mb-0.5
                    ${checkStatus === 'checking' ? 'text-slate-500' : ''}
                    ${checkStatus === 'available' ? 'text-emerald-700' : ''}
                    ${checkStatus === 'busy' || checkStatus === 'invalid' ? 'text-rose-700' : ''}
                 `}>
                    {checkStatus === 'checking' && 'Checking...'}
                    {checkStatus === 'available' && 'Available'}
                    {checkStatus === 'busy' && 'Not Available'}
                    {checkStatus === 'invalid' && 'Invalid Time'}
                 </h4>
                 <p className={`text-sm font-medium
                    ${checkStatus === 'checking' ? 'text-slate-400' : ''}
                    ${checkStatus === 'available' ? 'text-emerald-600' : ''}
                    ${checkStatus === 'busy' || checkStatus === 'invalid' ? 'text-rose-600' : ''}
                 `}>{statusMsg}</p>
             </div>
          </div>
      )}

      {/* 3. BOTTOM SECTION: DETAILS FORM */}
      <div className={`p-6 md:p-8 space-y-6 transition-all duration-300 bg-white ${checkStatus === 'available' ? 'opacity-100' : 'opacity-40 pointer-events-none filter blur-[1px]'}`}>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Full Name <span className="text-red-500">*</span></label>
                     <input required placeholder="Your Name" value={reqName} onChange={e => setReqName(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all font-medium text-slate-800" />
                </div>
                <div className="space-y-2">
                     <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Phone / Contact <span className="text-red-500">*</span></label>
                     <input required placeholder="Phone number" value={reqContact} onChange={e => setReqContact(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all font-medium text-slate-800" />
                </div>
            </div>
            
            <div className="space-y-2">
                 <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Contact Platform</label>
                 <input placeholder="e.g. Messenger Link, Zalo..." value={reqPlatform} onChange={e => setReqPlatform(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 transition-all font-medium text-slate-800" />
            </div>
            
            {/* PURPOSE - High Z-Index relative to parent to overlap Location if needed, but Modal has 9999 */}
            <div className="space-y-2 relative z-20"> 
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Purpose</label>
                <PurposeSelect 
                    value={reqReason} 
                    onChange={setReqReason} 
                    options={currentReasons}
                    placeholder={isMultiDay ? "Select Multi-day Reason..." : "Select In-day Reason..."}
                />
            </div>
            
            {reqReason === 'Other' && (
                <div className="space-y-2 animate-fade-in relative z-10">
                    <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Specific Details</label>
                    <input placeholder="Please specify..." value={reqOther} onChange={e => setReqOther(e.target.value)} className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 font-medium text-slate-800" required />
                </div>
            )}

            {/* LOCATION - Base Z-Index */}
            <div className="space-y-2 relative z-0"> 
                 <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">Location</label>
                 <LeafletLocationPicker value={reqLocation} onChange={setReqLocation} />
            </div>

            <button 
                onClick={handleSubmitRequest}
                className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-3 mt-4"
            >
                <Send size={20} strokeWidth={2}/> Confirm Booking
            </button>
      </div>
    </div>
  );
};

export default CysGuest;