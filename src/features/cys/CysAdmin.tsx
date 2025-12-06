import React from 'react';
import { LayoutTemplate } from 'lucide-react';
import { RequestCYS } from './types';
import { STORAGE_KEYS, getStorage, formatDate } from '../../shared/utils';

const CysAdmin: React.FC = () => {
  const formatRequestTime = (req: RequestCYS) => {
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    
    // Handle Legacy Data (if any old requests exist without startDate)
    if (!req.startDate && req.date) return `${formatDate(req.date)} @ ${req.time} (Legacy)`;

    const start = new Date(req.startDate);

    if (req.isMultiDay) {
      const end = new Date(req.endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive
      return `${start.toLocaleDateString('en-US', options)} - ${end.toLocaleDateString('en-US', options)} (${diffDays} days)`;
    } else {
      // Single Day: 09:00 - 10:30 (1h 30m)
      const [sH, sM] = req.startTime.split(':').map(Number);
      const [eH, eM] = req.endTime.split(':').map(Number);
      
      const mins = (eH * 60 + eM) - (sH * 60 + sM);
      const h = Math.floor(mins / 60);
      const m = mins % 60;
      const duration = `${h}h${m > 0 ? ` ${m}m` : ''}`;

      return `${start.toLocaleDateString('en-US', options)} • ${req.startTime} - ${req.endTime} (${duration})`;
    }
  };

  const requests = getStorage<RequestCYS[]>(STORAGE_KEYS.REQUESTS, []).reverse();

  return (
    <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100 flex flex-col h-full">
      <h3 className="font-bold text-brand-700 mb-2 flex items-center gap-2">
        <LayoutTemplate size={20}/> Admin Dashboard - Recent Requests
      </h3>
      <div className="max-h-[500px] overflow-y-auto space-y-2">
        {requests.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No requests found.</p>}
        {requests.map(req => (
          <div key={req.id} className="text-xs p-3 bg-gray-50 border rounded-lg hover:shadow-md transition-all">
            <div className="flex justify-between items-start mb-1">
              <strong className="text-brand-700 text-sm">{req.name}</strong>
              <span className="text-slate-500 font-mono">{formatRequestTime(req)}</span>
            </div>
            <span className="font-semibold text-slate-700">Reason:</span> {req.reason} {req.subReason ? `(${req.subReason})` : ''} {req.otherDetail ? `- ${req.otherDetail}` : ''}<br/>
            <span className="font-semibold text-slate-700">Contact:</span> {req.contact} ({req.contactPlatform})<br/>
            <span className="font-semibold text-slate-700">Location:</span> {req.location}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CysAdmin;
