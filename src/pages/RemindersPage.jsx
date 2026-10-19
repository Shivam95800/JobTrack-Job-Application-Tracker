import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  CalendarCheck,
  ExternalLink,
  Plus,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { useJobs } from '../context/JobContext';
import { StatusBadge } from '../components/common/Badge';
import { CalendarSyncButton } from '../components/common/CalendarSyncButton';

export const RemindersPage = () => {
  const navigate = useNavigate();
  const { reminders, updateJob, setIsAddModalOpen } = useJobs();

  const handleMarkFollowUpDone = (jobId) => {
    updateJob(jobId, { followUpDate: null });
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
            <CalendarCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">
              Reminders & Interview Schedule
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Stay ahead of your interviews, coding challenges, and recruiter check-ins
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Application</span>
        </button>
      </div>

      {/* OVERDUE FOLLOW-UPS (If any exist) */}
      {reminders.overdueCount > 0 && (
        <div className="bg-rose-50/70 dark:bg-rose-950/30 rounded-2xl border border-rose-200 dark:border-rose-900 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4 text-rose-800 dark:text-rose-300">
            <AlertTriangle className="w-5 h-5 text-rose-600 dark:text-rose-400" />
            <h2 className="font-bold text-base">
              Action Required: {reminders.overdueCount} Overdue Follow-up{reminders.overdueCount > 1 ? 's' : ''}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {reminders.overdueList.map((job) => (
              <div
                key={job.id}
                className="bg-white dark:bg-slate-900 rounded-xl p-4 border border-rose-200 dark:border-rose-900/60 shadow-xs flex items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {job.company}
                    </span>
                    <StatusBadge status={job.status} size="xs" />
                  </div>
                  <p className="text-xs text-slate-500 truncate">{job.jobTitle}</p>
                  <p className="mt-2 text-xs font-bold text-rose-600 dark:text-rose-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Target was: {job.followUpDate}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => handleMarkFollowUpDone(job.id)}
                    title="Mark Done"
                    className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 transition-colors text-xs font-medium"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => navigate(`/applications/${job.id}`)}
                    title="View Application"
                    className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors text-xs"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* UPCOMING INTERVIEWS SECTION */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-indigo-500" />
          <h2 className="font-bold text-base text-slate-900 dark:text-white">
            Upcoming Interviews & Technical Rounds ({reminders.interviews.length})
          </h2>
        </div>

        {reminders.interviews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {reminders.interviews.map((job) => (
              <div
                key={job.id}
                onClick={() => navigate(`/applications/${job.id}`)}
                className="p-4 rounded-xl border border-indigo-100 dark:border-indigo-950 bg-indigo-50/30 dark:bg-indigo-950/20 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <span className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                      {job.company}
                    </span>
                    <StatusBadge status={job.status} size="xs" />
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {job.jobTitle}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-indigo-100 dark:border-indigo-900/50 flex items-center justify-between gap-2 text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                  <div className="flex items-center gap-1.5 truncate">
                    <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span className="truncate">
                      {new Date(job.interviewDate).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="shrink-0 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                    <CalendarSyncButton job={job} size="sm" />
                    <ArrowRight className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all text-slate-400" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
            <Calendar className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="font-medium">No upcoming interviews scheduled</p>
            <p className="mt-0.5 text-[11px]">
              Set an interview date on any application to see it here!
            </p>
          </div>
        )}
      </div>

      {/* UPCOMING SCHEDULED FOLLOW-UPS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Clock className="w-5 h-5 text-amber-500" />
          <h2 className="font-bold text-base text-slate-900 dark:text-white">
            Future Follow-ups & Check-ins
          </h2>
        </div>

        {reminders.followUps.filter((f) => !f.isOverdue).length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {reminders.followUps
              .filter((f) => !f.isOverdue)
              .map((job) => (
                <div
                  key={job.id}
                  className="py-3 flex items-center justify-between gap-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 px-2 rounded-xl transition-colors"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span
                        onClick={() => navigate(`/applications/${job.id}`)}
                        className="font-bold text-slate-900 dark:text-white hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
                      >
                        {job.company}
                      </span>
                      <StatusBadge status={job.status} size="xs" />
                    </div>
                    <p className="text-slate-500 truncate text-[11px]">{job.jobTitle}</p>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 px-2.5 py-1 rounded-md text-[11px]">
                      Follow-up: {job.followUpDate}
                    </span>
                    <button
                      onClick={() => handleMarkFollowUpDone(job.id)}
                      className="px-2 py-1 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      Mark Done
                    </button>
                  </div>
                </div>
              ))}
          </div>
        ) : (
          <div className="py-6 text-center text-slate-400 dark:text-slate-500 text-xs">
            <p>No upcoming follow-up dates scheduled.</p>
          </div>
        )}
      </div>
    </div>
  );
};
