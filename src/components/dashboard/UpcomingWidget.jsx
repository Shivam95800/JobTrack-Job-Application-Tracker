import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  CalendarCheck,
} from 'lucide-react';
import { useJobs } from '../../context/JobContext';
import { StatusBadge } from '../common/Badge';
import { CalendarSyncButton } from '../common/CalendarSyncButton';

export const UpcomingWidget = () => {
  const navigate = useNavigate();
  const { reminders, updateJob } = useJobs();

  const handleMarkFollowUpDone = (job, e) => {
    e.stopPropagation();
    updateJob(job.id, {
      followUpDate: null,
    });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
            <CalendarCheck className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Upcoming & Reminders
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interviews and scheduled follow-ups
            </p>
          </div>
        </div>

        <button
          onClick={() => navigate('/reminders')}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1"
        >
          <span>View all</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Overdue alert banner */}
      {reminders.overdueCount > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200 flex items-start gap-3 text-xs">
          <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-bold">
              {reminders.overdueCount} {reminders.overdueCount === 1 ? 'follow-up' : 'follow-ups'} overdue!
            </span>
            <p className="mt-0.5 text-rose-700 dark:text-rose-300">
              Check in with recruiters to keep your applications warm.
            </p>
          </div>
        </div>
      )}

      {/* Events list */}
      <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[300px]">
        {reminders.allUpcoming.length > 0 ? (
          reminders.allUpcoming.slice(0, 5).map((item) => {
            const isInterview = item.eventType === 'interview';

            return (
              <div
                key={`${item.id}-${item.eventType}`}
                onClick={() => navigate(`/applications/${item.id}`)}
                className={`p-3 rounded-xl border transition-all cursor-pointer group flex items-start justify-between gap-3 ${
                  item.isOverdue
                    ? 'bg-rose-50/40 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/60 hover:border-rose-400'
                    : isInterview
                    ? 'bg-indigo-50/40 dark:bg-indigo-950/20 border-indigo-200/70 dark:border-indigo-900/50 hover:border-indigo-400'
                    : 'bg-slate-50/70 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800 hover:border-slate-400'
                }`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${
                        isInterview
                          ? 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                          : item.isOverdue
                          ? 'bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-300'
                          : 'bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300'
                      }`}
                    >
                      {item.isOverdue ? 'Overdue' : isInterview ? 'Interview' : 'Follow-up'}
                    </span>
                    <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {item.company}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {item.jobTitle}
                  </p>

                  <div className="mt-1.5 flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400">
                    <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                    <span>
                      {isInterview
                        ? new Date(item.interviewDate).toLocaleString([], {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : `Target: ${item.followUpDate}`}
                    </span>
                  </div>
                </div>

                {/* Quick actions: Calendar sync for interviews, Done button for follow-ups */}
                <div className="shrink-0 flex items-center" onClick={(e) => e.stopPropagation()}>
                  {isInterview ? (
                    <CalendarSyncButton job={item} size="sm" />
                  ) : (
                    <button
                      onClick={(e) => handleMarkFollowUpDone(item, e)}
                      title="Mark follow-up completed"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
            <Calendar className="w-6 h-6 mx-auto mb-1.5 opacity-40" />
            <p>No upcoming interviews or pending follow-ups</p>
          </div>
        )}
      </div>
    </div>
  );
};
