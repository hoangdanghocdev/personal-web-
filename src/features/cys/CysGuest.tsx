import React, { useState } from 'react';
import { Send } from 'lucide-react';
import { RequestCYS, REASONS, SPORT_TYPES } from './types';
import { UserAction } from '../../shared/types';
import { STORAGE_KEYS, getStorage, setStorage, generateId } from '../../shared/utils';

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
  const [reqName, setReqName] = useState('');
  const [reqContact, setReqContact] = useState('');
  const [reqPlatform, setReqPlatform] = useState('');
  const [reqReason, setReqReason] = useState('Work Interview');
  const [reqSubReason, setReqSubReason] = useState('Football');
  const [reqOther, setReqOther] = useState('');
  const [reqLocation, setReqLocation] = useState('');
  const [submitMsg, setSubmitMsg] = useState('');

  const handleSubmitRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitMsg('');

    // Spam Check (Guest 3 mins)
    const now = Date.now();
    if (now - userAction.lastRequestTime < 3 * 60 * 1000) {
      setSubmitMsg('Please wait 3 minutes before sending another request.');
      return;
    }
    const newUA = { ...userAction, lastRequestTime: now };
    setUserAction(newUA);
    setStorage(STORAGE_KEYS.USER_ACTION, newUA);

    const newReq: RequestCYS = {
      id: generateId(),
      name: reqName, contact: reqContact, contactPlatform: reqPlatform,
      reason: reqReason, subReason: reqReason === 'Sports' ? reqSubReason : undefined,
      otherDetail: (reqReason === 'Other' || reqSubReason === 'Other') ? reqOther : undefined,
      location: reqLocation,
      isMultiDay,
      startDate: reqStartDate,
      endDate: reqEndDate,
      startTime: reqStartTime,
      endTime: reqEndTime
    };

    const requests = getStorage(STORAGE_KEYS.REQUESTS, []);
    setStorage(STORAGE_KEYS.REQUESTS, [...requests, newReq]);
    setSubmitMsg('Request sent successfully!');
    setReqName(''); setReqContact(''); setReqLocation(''); 
  };

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
      <h3 className="text-lg font-bold mb-6 text-slate-800 flex items-center gap-2"><Send size={20} className="text-brand-600"/> Make a Request</h3>
      <form onSubmit={handleSubmitRequest} className="space-y-4">
          
          {/* 1. Event Type Toggle */}
          <div className="bg-slate-50 p-1 rounded-lg flex items-center relative mb-4">
            <button 
            type="button"
            onClick={() => setIsMultiDay(false)}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all z-10 ${!isMultiDay ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              In-Day Event
            </button>
            <button 
            type="button"
            onClick={() => setIsMultiDay(true)}
            className={`flex-1 py-2 text-sm font-bold rounded-md transition-all z-10 ${isMultiDay ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Multi-Day Event
            </button>
          </div>

          {/* 2. Date/Time Inputs based on Toggle */}
          <div className="grid grid-cols-2 gap-4 animate-fade-in">
            {isMultiDay ? (
              <>
              <div>
                <label className="text-xs font-bold text-slate-500 ml-1">Start Date</label>
                <input type="date" required value={reqStartDate} onChange={e => setReqStartDate(e.target.value)} className="w-full p-2 border rounded-md outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 ml-1">End Date</label>
                <input type="date" required value={reqEndDate} onChange={e => setReqEndDate(e.target.value)} className="w-full p-2 border rounded-md outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
              </div>
              </>
            ) : (
              <>
              <div className="col-span-2">
                  <label className="text-xs font-bold text-slate-500 ml-1">Date</label>
                  <input type="date" required value={reqStartDate} onChange={e => setReqStartDate(e.target.value)} className="w-full p-2 border rounded-md outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
              </div>
              <div>
                  <label className="text-xs font-bold text-slate-500 ml-1">Start Time</label>
                  <input type="time" required value={reqStartTime} onChange={e => setReqStartTime(e.target.value)} className="w-full p-2 border rounded-md outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
              </div>
              <div>
                  <label className="text-xs font-bold text-slate-500 ml-1">End Time</label>
                  <input type="time" required value={reqEndTime} onChange={e => setReqEndTime(e.target.value)} className="w-full p-2 border rounded-md outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500" />
              </div>
              </>
            )}
          </div>

          <div className="h-px bg-slate-100 my-2"></div>

          {/* 3. Personal Info */}
          <div className="grid grid-cols-2 gap-4">
            <input required placeholder="Your Name" value={reqName} onChange={e => setReqName(e.target.value)} className="w-full p-2 border rounded-md outline-none focus:border-brand-500" />
            <input required placeholder="Phone Number" value={reqContact} onChange={e => setReqContact(e.target.value)} className="w-full p-2 border rounded-md outline-none focus:border-brand-500" />
          </div>
          <input required placeholder="Contact Platform (Link/User)" value={reqPlatform} onChange={e => setReqPlatform(e.target.value)} className="w-full p-2 border rounded-md outline-none focus:border-brand-500" />
          
          <div className="grid grid-cols-2 gap-4">
            <select value={reqReason} onChange={e => setReqReason(e.target.value)} className="w-full p-2 border rounded-md outline-none focus:border-brand-500">
              {REASONS.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            {reqReason === 'Sports' && (
              <select value={reqSubReason} onChange={e => setReqSubReason(e.target.value)} className="w-full p-2 border rounded-md outline-none focus:border-brand-500 animate-fade-in">
                {SPORT_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            )}
          </div>
          {(reqReason === 'Other' || (reqReason === 'Sports' && reqSubReason === 'Other')) && (
            <input placeholder="Please specify..." value={reqOther} onChange={e => setReqOther(e.target.value)} className="w-full p-2 border rounded-md outline-none focus:border-brand-500 animate-fade-in" required />
          )}
          <input required placeholder="Location (Google Map Link / Address)" value={reqLocation} onChange={e => setReqLocation(e.target.value)} className="w-full p-2 border rounded-md outline-none focus:border-brand-500" />
          
          <button type="submit" className="w-full bg-brand-600 text-white py-3 rounded-lg font-bold hover:bg-brand-700 transition shadow-lg shadow-brand-200 mt-2">Send Request</button>
          {submitMsg && <div className={`text-center text-sm font-medium ${submitMsg.includes('wait') ? 'text-red-600' : 'text-green-600'}`}>{submitMsg}</div>}
      </form>
    </div>
  );
};

export default CysGuest;
