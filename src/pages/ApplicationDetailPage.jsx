import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Building,
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Clock,
  ExternalLink,
  Edit2,
  Trash2,
  User,
  Mail,
  Phone,
  Plus,
  Send,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  History,
} from 'lucide-react';
import { useJobs } from '../context/JobContext';
import { StatusBadge, TagBadge } from '../components/common/Badge';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { CalendarSyncButton } from '../components/common/CalendarSyncButton';
import { STATUS_LIST, STATUS_CONFIG, JOB_STATUSES } from '../types/job';

export const ApplicationDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { jobs, updateJob, updateJobStatus, deleteJob, addActivity, setEditingJob } = useJobs();

  const [newNote, setNewNote] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);

  // Find job by id
  const job = jobs.find((j) => j.id === id);

  if (!job) {
    return (
      <div className="py-16 text-center">
        <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">
          Application Not Found
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          The requested job application may have been removed or does not exist.
        </p>
        <button
          onClick={() => navigate('/applications')}
          className="mt-4 px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors"
        >
          Back to Applications
        </button>
      </div>
    );
  }

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    addActivity(job.id, {
      type: 'note_added',
      title: 'Note Logged',
      details: newNote.trim(),
    });

    setNewNote('');
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const isOverdue =
    job.followUpDate &&
    job.followUpDate < todayStr &&
    job.status !== JOB_STATUSES.OFFER &&
    job.status !== JOB_STATUSES.REJECTED;

  // Stepper stages
  const mainStages = [
    JOB_STATUSES.WISHLIST,
    JOB_STATUSES.APPLIED,
    JOB_STATUSES.ONLINE_TEST,
    JOB_STATUSES.INTERVIEW,
    JOB_STATUSES.OFFER,
  ];

  const currentStageIndex = mainStages.indexOf(job.status);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/applications')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Applications</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setEditingJob(job)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-700/60 transition-colors"
          >
            <Edit2 className="w-3.5 h-3.5" />
            <span>Edit</span>
          </button>
          <button
            onClick={() => setIsDeleting(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900 bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-xs font-semibold hover:bg-rose-100 dark:hover:bg-rose-950 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white font-bold text-xl flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
              {job.company.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center flex-wrap gap-2.5">
                <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  {job.company}
                </h1>
                <StatusBadge status={job.status} size="md" />
              </div>
              <p className="text-base text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                {job.jobTitle}
              </p>

              <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-slate-500 dark:text-slate-400">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {job.location || 'Remote'}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  {job.jobType}
                </span>
                {job.salaryRange && (
                  <span className="flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400">
                    <DollarSign className="w-3.5 h-3.5" />
                    {job.salaryRange}
                  </span>
                )}
                {job.jobLink && (
                  <a
                    href={job.jobLink}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline font-medium"
                  >
                    <span>View Posting</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Quick status dropdown */}
          <div className="shrink-0 flex flex-col sm:items-end">
            <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Update Status
            </label>
            <select
              value={job.status}
              onChange={(e) => updateJobStatus(job.id, e.target.value)}
              className="px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              {STATUS_LIST.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Pipeline Stepper */}
        {job.status !== JOB_STATUSES.REJECTED && job.status !== JOB_STATUSES.WITHDRAWN && (
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-4">
              Pipeline Journey
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {mainStages.map((stage, idx) => {
                const isPassed = currentStageIndex >= idx;
                const isCurrent = job.status === stage;

                return (
                  <button
                    key={stage}
                    onClick={() => updateJobStatus(job.id, stage)}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      isCurrent
                        ? 'border-indigo-500 bg-indigo-50/70 dark:bg-indigo-950/60 ring-2 ring-indigo-500/20 shadow-xs'
                        : isPassed
                        ? 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/40 dark:bg-slate-800/40 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      {isPassed ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : (
                        <span className="w-3.5 h-3.5 rounded-full border border-slate-300 dark:border-slate-600 flex items-center justify-center text-[9px] text-slate-400 font-bold">
                          {idx + 1}
                        </span>
                      )}
                      <span className="text-[11px] font-bold truncate">{stage}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Grid: Details & Reminders + Activity Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column: Key Information & Reminders */}
        <div className="space-y-6 lg:col-span-1">
          {/* Reminders & Dates Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs space-y-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>Timeline & Reminders</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <span className="block text-slate-400 text-[11px]">Date Applied</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {job.dateApplied || '—'}
                </span>
              </div>

              <div>
                <span className="block text-slate-400 text-[11px] mb-1">Interview Schedule</span>
                {job.interviewDate ? (
                  <div className="space-y-2">
                    <span className="font-bold text-indigo-600 dark:text-indigo-400 block text-xs">
                      {new Date(job.interviewDate).toLocaleString([], {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    <CalendarSyncButton job={job} size="sm" />
                  </div>
                ) : (
                  <span className="text-slate-400 italic">No interview scheduled</span>
                )}
              </div>

              <div>
                <span className="block text-slate-400 text-[11px]">Follow-up Target</span>
                {job.followUpDate ? (
                  <span
                    className={`font-semibold ${
                      isOverdue
                        ? 'text-rose-600 dark:text-rose-400 flex items-center gap-1 font-bold'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
                    {isOverdue && <AlertTriangle className="w-3.5 h-3.5" />}
                    {job.followUpDate} {isOverdue && '(Overdue!)'}
                  </span>
                ) : (
                  <span className="text-slate-400 italic">None set</span>
                )}
              </div>

              <div>
                <span className="block text-slate-400 text-[11px]">Application Source</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {job.source || 'Other'}
                </span>
              </div>
            </div>
          </div>

          {/* Contact Person Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-500" />
              <span>Contact Person</span>
            </h3>

            {job.contactPerson?.name ? (
              <div className="space-y-2 text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {job.contactPerson.name}
                  </span>
                  {job.contactPerson.role && (
                    <p className="text-slate-500 dark:text-slate-400">
                      {job.contactPerson.role}
                    </p>
                  )}
                </div>

                {job.contactPerson.email && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <a
                      href={`mailto:${job.contactPerson.email}`}
                      className="hover:underline text-indigo-600 dark:text-indigo-400 truncate"
                    >
                      {job.contactPerson.email}
                    </a>
                  </div>
                )}

                {job.contactPerson.phone && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{job.contactPerson.phone}</span>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                No recruiter or hiring manager contact details added yet.
              </p>
            )}
          </div>

          {/* Notes Card */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs space-y-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-white">
              Application Notes
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {job.notes || 'No notes provided yet.'}
            </p>
          </div>
        </div>

        {/* Right column: Interactive Activity Log & Timeline */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                  <History className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">
                    Activity & Audit Trail
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Chronological record of status changes and interview updates
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Add Note Form */}
            <form onSubmit={handleAddNote} className="mb-6">
              <div className="relative">
                <textarea
                  rows={2}
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Log an interview note, salary update, or next action item..."
                  className="w-full p-3 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-800/60 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none pr-20"
                />
                <button
                  type="submit"
                  disabled={!newNote.trim()}
                  className="absolute right-2.5 bottom-3.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3 h-3" />
                  <span>Log</span>
                </button>
              </div>
            </form>

            {/* Timeline Stream */}
            <div className="relative border-l-2 border-slate-200 dark:border-slate-800 ml-4 space-y-6">
              {job.history && job.history.length > 0 ? (
                [...job.history]
                  .reverse()
                  .map((log) => (
                    <div key={log.id} className="relative pl-6">
                      {/* Timeline dot */}
                      <span className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white dark:bg-slate-900 border-2 border-indigo-600 dark:border-indigo-400" />

                      <div className="bg-slate-50/70 dark:bg-slate-800/50 rounded-xl p-3.5 border border-slate-200/70 dark:border-slate-700/60 text-xs">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="font-bold text-slate-900 dark:text-white">
                            {log.title}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(log.timestamp).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>

                        {log.details && (
                          <p className="text-slate-600 dark:text-slate-300 mt-1 whitespace-pre-line leading-relaxed">
                            {log.details}
                          </p>
                        )}

                        {log.fromStatus && log.toStatus && (
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-slate-400 font-medium">Changed from</span>
                            <StatusBadge status={log.fromStatus} size="xs" />
                            <span className="text-slate-400">to</span>
                            <StatusBadge status={log.toStatus} size="xs" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))
              ) : (
                <div className="pl-6 text-xs text-slate-400">
                  No activity history recorded yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={isDeleting}
        onClose={() => setIsDeleting(false)}
        onConfirm={() => {
          deleteJob(job.id);
          navigate('/applications');
        }}
        title="Delete Job Application"
        message={`Are you sure you want to delete ${job.company}? All timeline logs and notes will be permanently removed.`}
        confirmText="Yes, Delete"
        isDestructive={true}
      />
    </div>
  );
};
