import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ExternalLink,
  Edit2,
  Trash2,
  Eye,
  Calendar,
  Clock,
  MapPin,
  Building,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Inbox,
  Sparkles,
} from 'lucide-react';
import { StatusBadge, TagBadge } from '../common/Badge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { STATUS_LIST, JOB_STATUSES } from '../../types/job';
import { useJobs } from '../../context/JobContext';

export const ApplicationsTable = () => {
  const navigate = useNavigate();
  const { filteredJobs, updateJobStatus, deleteJob, setEditingJob, setIsAddModalOpen, resetFilters } = useJobs();
  const [jobToDelete, setJobToDelete] = useState(null);

  // Simple pagination
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  const totalPages = Math.ceil(filteredJobs.length / pageSize) || 1;

  const paginatedJobs = filteredJobs.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Table Content */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              <th className="py-3.5 px-4">Company & Role</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4">Type & Location</th>
              <th className="py-3.5 px-4">Salary</th>
              <th className="py-3.5 px-4">Source</th>
              <th className="py-3.5 px-4">Date Applied</th>
              <th className="py-3.5 px-4">Next Reminder</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {paginatedJobs.length > 0 ? (
              paginatedJobs.map((job) => {
                const isOverdue =
                  job.followUpDate &&
                  job.followUpDate < todayStr &&
                  job.status !== JOB_STATUSES.OFFER &&
                  job.status !== JOB_STATUSES.REJECTED;

                return (
                  <tr
                    key={job.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors group cursor-pointer"
                    onClick={() => navigate(`/applications/${job.id}`)}
                  >
                    {/* Company & Role */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 text-xs shrink-0 group-hover:border-indigo-400 transition-colors">
                          {job.company.slice(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white truncate">
                            <span>{job.company}</span>
                            {job.jobLink && (
                              <a
                                href={job.jobLink}
                                target="_blank"
                                rel="noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400"
                              >
                                <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          <p className="text-slate-500 dark:text-slate-400 truncate">
                            {job.jobTitle}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={job.status}
                        onChange={(e) => updateJobStatus(job.id, e.target.value)}
                        className="text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 px-2 py-1 shadow-2xs focus:outline-none focus:ring-1 focus:ring-indigo-500 cursor-pointer"
                      >
                        {STATUS_LIST.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Type & Location */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1 text-slate-600 dark:text-slate-300">
                          <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate max-w-[140px]">{job.location || 'Remote'}</span>
                        </div>
                        <span className="text-[10px] text-slate-400">{job.jobType}</span>
                      </div>
                    </td>

                    {/* Salary */}
                    <td className="py-3.5 px-4 font-medium text-slate-700 dark:text-slate-300">
                      {job.salaryRange || '—'}
                    </td>

                    {/* Source */}
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-[11px]">
                        {job.source || 'Other'}
                      </span>
                    </td>

                    {/* Date Applied */}
                    <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {job.dateApplied || '—'}
                    </td>

                    {/* Next Reminder */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {job.interviewDate ? (
                        <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-semibold bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-200 dark:border-indigo-800 text-[11px]">
                          <Calendar className="w-3 h-3" />
                          Interview: {job.interviewDate.split('T')[0]}
                        </span>
                      ) : job.followUpDate ? (
                        <span
                          className={`inline-flex items-center gap-1 font-medium px-2 py-0.5 rounded-md border text-[11px] ${
                            isOverdue
                              ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300'
                              : 'bg-amber-50 dark:bg-amber-950/60 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-300'
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          {isOverdue ? 'Overdue: ' : 'Follow-up: '}
                          {job.followUpDate}
                        </span>
                      ) : (
                        <span className="text-slate-400">—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => navigate(`/applications/${job.id}`)}
                          title="View Details"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setEditingJob(job)}
                          title="Edit"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setJobToDelete(job)}
                          title="Delete"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={8} className="py-12 text-center text-slate-400 dark:text-slate-500">
                  <Inbox className="w-8 h-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm font-medium">No job applications match your filters.</p>
                  <div className="mt-3 flex items-center justify-center gap-3">
                    <button
                      onClick={resetFilters}
                      className="px-3 py-1.5 text-xs font-medium rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300"
                    >
                      Clear Filters
                    </button>
                    <button
                      onClick={() => setIsAddModalOpen(true)}
                      className="px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white"
                    >
                      Add Application
                    </button>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div>
            Page <span className="font-semibold text-slate-800 dark:text-slate-200">{currentPage}</span> of{' '}
            <span className="font-semibold text-slate-800 dark:text-slate-200">{totalPages}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-40 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!jobToDelete}
        onClose={() => setJobToDelete(null)}
        onConfirm={() => {
          if (jobToDelete) {
            deleteJob(jobToDelete.id);
            setJobToDelete(null);
          }
        }}
        title="Delete Application"
        message={`Are you sure you want to delete your application for ${jobToDelete?.company}? This will delete all history notes and reminders.`}
        confirmText="Delete Application"
        isDestructive={true}
      />
    </div>
  );
};
