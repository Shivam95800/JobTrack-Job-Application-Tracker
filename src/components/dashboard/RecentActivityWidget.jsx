import React from 'react';
import { useNavigate } from 'react-router-dom';
import { History, ArrowRight, MessageSquare, CheckCircle, Clock } from 'lucide-react';
import { useJobs } from '../../context/JobContext';

export const RecentActivityWidget = () => {
  const navigate = useNavigate();
  const { jobs } = useJobs();

  // Aggregate history from all jobs
  const activities = jobs
    .flatMap((job) =>
      (job.history || []).map((h) => ({
        ...h,
        company: job.company,
        jobTitle: job.jobTitle,
        jobId: job.id,
      }))
    )
    .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
    .slice(0, 6);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/60 text-violet-600 dark:text-violet-400">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">
              Recent Activity
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Timeline of status changes and actions
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 space-y-3 overflow-y-auto max-h-[300px]">
        {activities.length > 0 ? (
          activities.map((act) => (
            <div
              key={act.id}
              onClick={() => navigate(`/applications/${act.jobId}`)}
              className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-pointer group"
            >
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold">
                {act.company.slice(0, 1)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <span className="text-xs font-bold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    {act.company}
                  </span>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {new Date(act.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                  {act.title}
                </p>
                {act.details && (
                  <p className="text-[11px] text-slate-400 dark:text-slate-500 line-clamp-1 mt-0.5">
                    {act.details}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="py-8 text-center text-slate-400 dark:text-slate-500 text-xs">
            <Clock className="w-6 h-6 mx-auto mb-1.5 opacity-40" />
            <p>No recent activity recorded</p>
          </div>
        )}
      </div>
    </div>
  );
};
