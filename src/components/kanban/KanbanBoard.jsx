import React, { useState } from 'react';
import { KanbanCard } from './KanbanCard';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { STATUS_LIST, STATUS_CONFIG } from '../../types/job';
import { useJobs } from '../../context/JobContext';
import { Plus, Sparkles, Inbox } from 'lucide-react';

export const KanbanBoard = () => {
  const { filteredJobs, updateJobStatus, deleteJob, setIsAddModalOpen } = useJobs();
  const [draggedJobId, setDraggedJobId] = useState(null);
  const [activeDropColumn, setActiveDropColumn] = useState(null);
  const [jobToDelete, setJobToDelete] = useState(null);

  const handleDragStart = (e, jobId) => {
    setDraggedJobId(jobId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragEnd = () => {
    setDraggedJobId(null);
    setActiveDropColumn(null);
  };

  const handleDragOver = (e, status) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (activeDropColumn !== status) {
      setActiveDropColumn(status);
    }
  };

  const handleDragLeave = (e, status) => {
    if (activeDropColumn === status) {
      setActiveDropColumn(null);
    }
  };

  const handleDrop = (e, targetStatus) => {
    e.preventDefault();
    const jobId = e.dataTransfer.getData('text/plain') || draggedJobId;
    if (jobId) {
      updateJobStatus(jobId, targetStatus);
    }
    setDraggedJobId(null);
    setActiveDropColumn(null);
  };

  return (
    <div className="w-full">
      {/* Horizontal scroll container for all columns */}
      <div className="flex gap-4 overflow-x-auto pb-6 pt-1 select-none min-h-[calc(100vh-280px)]">
        {STATUS_LIST.map((status) => {
          const config = STATUS_CONFIG[status];
          const columnJobs = filteredJobs.filter((j) => j.status === status);
          const isDropActive = activeDropColumn === status;

          return (
            <div
              key={status}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={(e) => handleDragLeave(e, status)}
              onDrop={(e) => handleDrop(e, status)}
              className={`flex flex-col shrink-0 w-72 sm:w-80 rounded-2xl bg-slate-100/70 dark:bg-slate-900/50 border border-t-4 transition-all duration-150 ${
                config.columnBorder
              } ${
                isDropActive
                  ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/20 ring-2 ring-indigo-400 ring-offset-2 dark:ring-offset-slate-900'
                  : 'border-slate-200/80 dark:border-slate-800'
              }`}
            >
              {/* Column Header */}
              <div className="p-3.5 flex items-center justify-between border-b border-slate-200/60 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${config.pill}`} />
                  <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700 dark:text-slate-300">
                    {status}
                  </h3>
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 shadow-2xs">
                    {columnJobs.length}
                  </span>
                </div>

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  title={`Add application to ${status}`}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-800 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Cards Container */}
              <div className="p-2.5 flex-1 space-y-2.5 overflow-y-auto min-h-[220px]">
                {columnJobs.length > 0 ? (
                  columnJobs.map((job) => (
                    <KanbanCard
                      key={job.id}
                      job={job}
                      onDragStart={handleDragStart}
                      onDragEnd={handleDragEnd}
                      onDeleteClick={(j) => setJobToDelete(j)}
                    />
                  ))
                ) : (
                  <div className="h-full min-h-[140px] flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-slate-200 dark:border-slate-800 text-center text-slate-400 dark:text-slate-600">
                    <Inbox className="w-6 h-6 mb-1.5 opacity-50" />
                    <p className="text-xs font-medium">No applications</p>
                    <p className="text-[10px] mt-0.5">Drag cards here</p>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

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
        message={`Are you sure you want to delete your application for ${jobToDelete?.company}? This will remove all associated interview notes and activity logs.`}
        confirmText="Delete Application"
        isDestructive={true}
      />
    </div>
  );
};
