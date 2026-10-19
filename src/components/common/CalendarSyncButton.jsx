import React, { useState, useRef, useEffect } from 'react';
import { Calendar, Download, ExternalLink, CalendarPlus, ChevronDown } from 'lucide-react';
import { calendarService } from '../../services/calendarService';
import { useToast } from '../../context/ToastContext';

export const CalendarSyncButton = ({ job, size = 'sm', className = '' }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const { addToast } = useToast();

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [open]);

  if (!job?.interviewDate) return null;

  const handleGoogleCalendar = (e) => {
    e.stopPropagation();
    setOpen(false);
    const url = calendarService.getGoogleCalendarUrl(job);
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
      addToast('Opening Google Calendar...', 'info');
    }
  };

  const handleDownloadICS = (e) => {
    e.stopPropagation();
    setOpen(false);
    calendarService.downloadICS(job);
    addToast('Downloaded .ics calendar invite', 'success');
  };

  const isSmall = size === 'sm';

  return (
    <div className={`relative inline-block text-left ${className}`} ref={containerRef}>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className={`inline-flex items-center gap-1.5 rounded-xl font-semibold border transition-all ${
          isSmall
            ? 'px-2.5 py-1 text-[11px]'
            : 'px-3.5 py-2 text-xs'
        } bg-white dark:bg-slate-800 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 shadow-2xs`}
        title="Sync interview to calendar"
      >
        <CalendarPlus className={isSmall ? 'w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400' : 'w-4 h-4 text-indigo-600 dark:text-indigo-400'} />
        <span>Sync Calendar</span>
        <ChevronDown className={isSmall ? 'w-3 h-3 opacity-60' : 'w-3.5 h-3.5 opacity-60'} />
      </button>

      {open && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 sm:right-auto sm:left-0 top-full mt-1.5 z-50 w-56 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl p-1.5 text-xs animate-in fade-in-50 zoom-in-95 duration-100"
        >
          <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-100 dark:border-slate-700/60 mb-1">
            Add to Calendar
          </div>

          <button
            type="button"
            onClick={handleGoogleCalendar}
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors text-left"
          >
            <span className="flex items-center gap-2 font-medium">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>Google Calendar</span>
            </span>
            <ExternalLink className="w-3 h-3 opacity-50" />
          </button>

          <button
            type="button"
            onClick={handleDownloadICS}
            className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-300 transition-colors text-left"
          >
            <span className="flex items-center gap-2 font-medium">
              <Download className="w-4 h-4 text-emerald-500" />
              <span>Download iCal (.ics)</span>
            </span>
            <span className="text-[10px] text-slate-400">Apple/Outlook</span>
          </button>
        </div>
      )}
    </div>
  );
};
