import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { JobApplicationModal } from '../forms/JobApplicationModal';
import { useJobs } from '../../context/JobContext';

const getPageTitle = (pathname) => {
  if (pathname === '/') return 'Dashboard Overview';
  if (pathname.startsWith('/applications/') && pathname !== '/applications') return 'Application Details';
  if (pathname.startsWith('/applications')) return 'Applications Pipeline';
  if (pathname.startsWith('/reminders')) return 'Reminders & Interviews';
  if (pathname.startsWith('/settings')) return 'Settings & Data Management';
  return 'JobTrack';
};

export const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const { isAddModalOpen, setIsAddModalOpen, editingJob, setEditingJob } = useJobs();

  const title = getPageTitle(location.pathname);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content Area */}
      <div className="lg:pl-64 flex flex-col flex-1 min-w-0">
        <Header onOpenSidebar={() => setSidebarOpen(true)} title={title} />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Global Add Application Modal */}
      <JobApplicationModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Global Edit Application Modal */}
      {editingJob && (
        <JobApplicationModal
          isOpen={!!editingJob}
          initialData={editingJob}
          onClose={() => setEditingJob(null)}
        />
      )}
    </div>
  );
};
