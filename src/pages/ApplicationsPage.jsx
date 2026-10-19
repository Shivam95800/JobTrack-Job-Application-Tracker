import React from 'react';
import { FilterBar } from '../components/filters/FilterBar';
import { KanbanBoard } from '../components/kanban/KanbanBoard';
import { ApplicationsTable } from '../components/table/ApplicationsTable';
import { useJobs } from '../context/JobContext';
import { PlusCircle, Loader2 } from 'lucide-react';

export const ApplicationsPage = () => {
  const { viewMode, loading, setIsAddModalOpen } = useJobs();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search & Filters */}
      <FilterBar />

      {/* Main View: Kanban Board OR Table */}
      {viewMode === 'kanban' ? <KanbanBoard /> : <ApplicationsTable />}
    </div>
  );
};
