import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building,
  MapPin,
  Calendar,
  Clock,
  MoreVertical,
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { StatusBadge, TagBadge } from '../common/Badge';
import { STATUS_LIST, STATUS_CONFIG, JOB_STATUSES } from '../../types/job';
import { useJobs } from '../../context/JobContext';

export const KanbanCard = ({ job, onDragStart, onDragEnd, onDeleteClick }) => {
  const navigate = useNavigate();
  const { updateJobStatus, setEditingJob } = useJobs();
  const [menuOpen, setMenuOpen] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue = job.followUpDate && job.followUpDate < todayStr && job.status !== JOB_STATUSES.OFFER && job.status !== JOB_STATUSES.REJECTED;

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('text/plain', job.id);
        if (onDragStart) onDragStart(e, job.id);
      }}
      onDragEnd={onDragEnd}
      className="group relative bg-white dark:bg-slate-800/90 rounded-xl p-4 border border-slate-200/90 dark:border-slate-700/80 shadow-xs hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-600 transition-all cursor-grab active:cursor-grabbing select-none"
    >
      {/* Top Header: Company + Menu */}
      <div className="flex items-start justify-between gap-2 mb-1.5">
        <div className="min-w-0">
          <h4
            onClick={() => navigate(`/applications/${job.id}`)}
            className="font-bold text-sm text-slate-900 dark:text-white truncate hover:text-indigo-600 dark:hover:text-indigo-400 cursor-pointer"
          >
            {job.company}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-medium">
            {job.jobTitle}
          </p>
        </div>

        {/* Action Menu */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((prev) => !prev);
            }}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-30"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute right-0 top-full mt-1 z-40 w-44 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xl py-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    navigate(`/applications/${job.id}`);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View Details</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    setEditingJob(job);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Application</span>
                </button>
                {job.jobLink && (
                  <a
                    href={job.jobLink}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => setMenuOpen(false)}
                    className="w-full flex items-center gap-2 px-3 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Posting</span>
                  </a>
                )}
                <div className="my-1 border-t border-slate-100 dark:border-slate-700" />
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onDeleteClick(job);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Badges: Location & Job Type */}
      <div className="flex flex-wrap items-center gap-1.5 my-2">
        {job.location && (
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 dark:text-slate-400">
            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
            <span className="truncate max-w-[120px]">{job.location}</span>
          </span>
        )}
        <TagBadge color="slate" className="text-[10px]">
          {job.jobType}
        </TagBadge>
        {job.salaryRange && (
          <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
            {job.salaryRange}
          </span>
        )}
      </div>

      {/* Interview or Follow-up alerts */}
      {job.interviewDate && (
        <div className="mt-2 flex items-center gap-1.5 px-2 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200/80 dark:border-indigo-800 text-[11px] font-medium text-indigo-700 dark:text-indigo-300">
          <Calendar className="w-3 h-3 shrink-0 text-indigo-500" />
          <span className="truncate">
            Interview: {new Date(job.interviewDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      )}

      {job.followUpDate && !job.interviewDate && (
        <div
          className={`mt-2 flex items-center gap-1.5 px-2 py-1 rounded-lg border text-[11px] font-medium ${
            isOverdue
              ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
              : 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
          }`}
        >
          <Clock className="w-3 h-3 shrink-0" />
          <span className="truncate">
            {isOverdue ? 'Overdue follow-up:' : 'Follow-up:'} {job.followUpDate}
          </span>
        </div>
      )}

      {/* Card Footer: Date Applied + Quick Move for Mobile/Touch */}
      <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-400">
        <span>Applied {job.dateApplied || 'recently'}</span>

        {/* Quick stage selector */}
        <select
          value={job.status}
          onChange={(e) => updateJobStatus(job.id, e.target.value)}
          className="text-[10px] font-medium rounded-md border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 px-1.5 py-0.5 focus:outline-none"
        >
          {STATUS_LIST.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
