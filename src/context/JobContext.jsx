import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';
import { jobService } from '../services/jobService';
import { exportImportService } from '../services/exportImportService';
import { JOB_STATUSES, STATUS_LIST, STATUS_CONFIG } from '../types/job';

const JobContext = createContext();

const DEFAULT_FILTERS = {
  search: '',
  status: 'ALL',
  jobType: 'ALL',
  source: 'ALL',
  dateFrom: '',
  dateTo: '',
};

export const JobProvider = ({ children }) => {
  const { currentUser } = useAuth();
  const { addToast } = useToast();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // View mode preference
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('jobtrack_view_mode') || 'kanban';
  });

  // Filter & sort states
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sortBy, setSortBy] = useState('date_desc');

  // Modal control states for global quick-add or edit
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  // Sync viewMode to localStorage
  useEffect(() => {
    localStorage.setItem('jobtrack_view_mode', viewMode);
  }, [viewMode]);

  // Load jobs when currentUser changes
  useEffect(() => {
    if (currentUser?.id) {
      setLoading(true);
      const data = jobService.getJobs(currentUser.id);
      setJobs(data);
      setLoading(false);
    } else {
      setJobs([]);
      setLoading(false);
    }
  }, [currentUser?.id]);

  const refreshJobs = useCallback(() => {
    if (currentUser?.id) {
      const data = jobService.getJobs(currentUser.id);
      setJobs(data);
    }
  }, [currentUser?.id]);

  // CRUD actions
  const addJob = useCallback(
    (jobData) => {
      if (!currentUser?.id) return null;
      const created = jobService.createJob(currentUser.id, jobData);
      setJobs((prev) => [created, ...prev]);
      addToast(`Added application for ${created.company}!`, 'success');
      return created;
    },
    [currentUser?.id, addToast]
  );

  const updateJob = useCallback(
    (jobId, updates) => {
      if (!currentUser?.id) return null;
      const updated = jobService.updateJob(currentUser.id, jobId, updates);
      if (updated) {
        setJobs((prev) => prev.map((j) => (j.id === jobId ? updated : j)));
        addToast(`Updated ${updated.company} application`, 'success');

        if (updates.status === JOB_STATUSES.OFFER) {
          triggerOfferConfetti();
        }
      }
      return updated;
    },
    [currentUser?.id, addToast]
  );

  const updateJobStatus = useCallback(
    (jobId, newStatus) => {
      if (!currentUser?.id) return null;
      const existing = jobs.find((j) => j.id === jobId);
      if (existing?.status === newStatus) return existing;

      const updated = jobService.updateJobStatus(currentUser.id, jobId, newStatus);
      if (updated) {
        setJobs((prev) => prev.map((j) => (j.id === jobId ? updated : j)));
        addToast(`Moved ${updated.company} to ${newStatus}`, 'info');

        if (newStatus === JOB_STATUSES.OFFER) {
          triggerOfferConfetti();
        }
      }
      return updated;
    },
    [currentUser?.id, jobs, addToast]
  );

  const deleteJob = useCallback(
    (jobId) => {
      if (!currentUser?.id) return false;
      const existing = jobs.find((j) => j.id === jobId);
      const ok = jobService.deleteJob(currentUser.id, jobId);
      if (ok) {
        setJobs((prev) => prev.filter((j) => j.id !== jobId));
        addToast(
          existing ? `Deleted ${existing.company} application` : 'Application deleted',
          'info'
        );
      }
      return ok;
    },
    [currentUser?.id, jobs, addToast]
  );

  const addActivity = useCallback(
    (jobId, activity) => {
      if (!currentUser?.id) return null;
      const updated = jobService.addActivity(currentUser.id, jobId, activity);
      if (updated) {
        setJobs((prev) => prev.map((j) => (j.id === jobId ? updated : j)));
        addToast('Activity logged', 'success');
      }
      return updated;
    },
    [currentUser?.id, addToast]
  );

  const resetToSampleData = useCallback(() => {
    if (!currentUser?.id) return;
    const sample = jobService.resetToSampleData(currentUser.id);
    setJobs(sample);
    addToast('Reset to realistic sample applications', 'success');
  }, [currentUser?.id, addToast]);

  const clearAll = useCallback(() => {
    if (!currentUser?.id) return;
    jobService.clearAllJobs(currentUser.id);
    setJobs([]);
    addToast('Cleared all applications', 'info');
  }, [currentUser?.id, addToast]);

  // Export & Import
  const exportCSV = useCallback(() => {
    if (jobs.length === 0) {
      addToast('No applications to export', 'error');
      return;
    }
    exportImportService.exportToCSV(jobs);
    addToast(`Exported ${jobs.length} applications to CSV`, 'success');
  }, [jobs, addToast]);

  const importCSV = useCallback(
    (csvText) => {
      if (!currentUser?.id) return;
      try {
        const imported = exportImportService.parseCSV(csvText, currentUser.id);
        const combined = [...imported, ...jobs];
        jobService.bulkSaveJobs(currentUser.id, combined);
        setJobs(combined);
        addToast(`Successfully imported ${imported.length} applications!`, 'success');
      } catch (err) {
        console.error(err);
        addToast(`Import failed: ${err.message}`, 'error');
      }
    },
    [currentUser?.id, jobs, addToast]
  );

  const exportJSON = useCallback(() => {
    if (jobs.length === 0) {
      addToast('No data to export', 'error');
      return;
    }
    exportImportService.exportToJSON(jobs, currentUser);
    addToast('Backup exported successfully', 'success');
  }, [jobs, currentUser, addToast]);

  const importJSON = useCallback(
    (jsonText) => {
      if (!currentUser?.id) return;
      try {
        const parsed = exportImportService.parseJSON(jsonText, currentUser.id);
        jobService.bulkSaveJobs(currentUser.id, parsed);
        setJobs(parsed);
        addToast(`Restored ${parsed.length} applications from backup!`, 'success');
      } catch (err) {
        console.error(err);
        addToast(`Restore failed: ${err.message}`, 'error');
      }
    },
    [currentUser?.id, addToast]
  );

  // Confetti effect helper
  const triggerOfferConfetti = () => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'],
      });
    } catch {
      // ignore
    }
  };

  // Filter and sort jobs
  const filteredJobs = useMemo(() => {
    return jobs
      .filter((j) => {
        // Search
        if (filters.search) {
          const q = filters.search.toLowerCase();
          const matchCompany = j.company?.toLowerCase().includes(q);
          const matchTitle = j.jobTitle?.toLowerCase().includes(q);
          const matchLocation = j.location?.toLowerCase().includes(q);
          const matchNotes = j.notes?.toLowerCase().includes(q);
          const matchContact = j.contactPerson?.name?.toLowerCase().includes(q);
          if (!matchCompany && !matchTitle && !matchLocation && !matchNotes && !matchContact) {
            return false;
          }
        }

        // Status filter
        if (filters.status && filters.status !== 'ALL') {
          if (j.status !== filters.status) return false;
        }

        // Job type
        if (filters.jobType && filters.jobType !== 'ALL') {
          if (j.jobType !== filters.jobType) return false;
        }

        // Source
        if (filters.source && filters.source !== 'ALL') {
          if (j.source !== filters.source) return false;
        }

        // Date range
        if (filters.dateFrom) {
          if (new Date(j.dateApplied) < new Date(filters.dateFrom)) return false;
        }
        if (filters.dateTo) {
          if (new Date(j.dateApplied) > new Date(filters.dateTo)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'date_desc':
            return new Date(b.dateApplied || b.createdAt) - new Date(a.dateApplied || a.createdAt);
          case 'date_asc':
            return new Date(a.dateApplied || a.createdAt) - new Date(b.dateApplied || b.createdAt);
          case 'company_asc':
            return (a.company || '').localeCompare(b.company || '');
          case 'company_desc':
            return (b.company || '').localeCompare(a.company || '');
          case 'salary_desc':
            return (b.salaryMin || 0) - (a.salaryMin || 0);
          case 'salary_asc':
            return (a.salaryMin || 0) - (b.salaryMin || 0);
          default:
            return 0;
        }
      });
  }, [jobs, filters, sortBy]);

  // Quick statistics calculation
  const stats = useMemo(() => {
    const total = jobs.length;
    const statusCounts = {};
    STATUS_LIST.forEach((s) => (statusCounts[s] = 0));

    jobs.forEach((j) => {
      if (statusCounts[j.status] !== undefined) {
        statusCounts[j.status]++;
      }
    });

    const activeCount =
      (statusCounts[JOB_STATUSES.APPLIED] || 0) +
      (statusCounts[JOB_STATUSES.ONLINE_TEST] || 0) +
      (statusCounts[JOB_STATUSES.INTERVIEW] || 0);

    const offers = statusCounts[JOB_STATUSES.OFFER] || 0;
    const interviews =
      (statusCounts[JOB_STATUSES.INTERVIEW] || 0) +
      (statusCounts[JOB_STATUSES.ONLINE_TEST] || 0);

    // Response rate: proportion of applied jobs that received any stage progression
    // (Online Test + Interview + Offer + Rejected) / total excluding pure Wishlist
    const appliedOrBeyond = jobs.filter((j) => j.status !== JOB_STATUSES.WISHLIST).length;
    const progressed = jobs.filter(
      (j) =>
        j.status === JOB_STATUSES.ONLINE_TEST ||
        j.status === JOB_STATUSES.INTERVIEW ||
        j.status === JOB_STATUSES.OFFER ||
        (j.status === JOB_STATUSES.REJECTED && (j.history?.length || 0) > 1)
    ).length;

    const responseRate =
      appliedOrBeyond > 0 ? Math.round((progressed / appliedOrBeyond) * 100) : 0;

    // Status distribution for Recharts Pie chart
    const statusDistribution = STATUS_LIST.map((status) => ({
      name: status,
      value: statusCounts[status] || 0,
      color: STATUS_CONFIG[status]?.hex || '#6366f1',
    })).filter((item) => item.value > 0);

    // Applications per month/week for Recharts Area/Bar chart
    const monthlyMap = {};
    const monthsNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Generate last 6 months buckets
    const now = new Date();
    for (let i = 5; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${monthsNames[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;
      monthlyMap[key] = { name: key, count: 0, offers: 0, interviews: 0 };
    }

    jobs.forEach((j) => {
      const d = new Date(j.dateApplied || j.createdAt);
      if (!isNaN(d.getTime())) {
        const key = `${monthsNames[d.getMonth()]} ${d.getFullYear().toString().slice(2)}`;
        if (monthlyMap[key]) {
          monthlyMap[key].count++;
          if (j.status === JOB_STATUSES.OFFER) monthlyMap[key].offers++;
          if (j.status === JOB_STATUSES.INTERVIEW || j.status === JOB_STATUSES.ONLINE_TEST) {
            monthlyMap[key].interviews++;
          }
        }
      }
    });

    const monthlyTimeline = Object.values(monthlyMap);

    return {
      total,
      statusCounts,
      activeCount,
      offers,
      interviews,
      responseRate,
      statusDistribution,
      monthlyTimeline,
    };
  }, [jobs]);

  // Reminders & Follow-ups
  const reminders = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];

    // Upcoming interviews: jobs with interviewDate
    const interviews = jobs
      .filter((j) => j.interviewDate && j.status !== JOB_STATUSES.WITHDRAWN && j.status !== JOB_STATUSES.REJECTED)
      .map((j) => ({
        ...j,
        eventDate: j.interviewDate,
        isOverdue: false,
        eventType: 'interview',
      }))
      .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

    // Follow-ups
    const followUps = jobs
      .filter((j) => j.followUpDate && j.status !== JOB_STATUSES.WITHDRAWN && j.status !== JOB_STATUSES.REJECTED)
      .map((j) => {
        const isOverdue = j.followUpDate < todayStr;
        return {
          ...j,
          eventDate: j.followUpDate,
          isOverdue,
          eventType: 'followup',
        };
      })
      .sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));

    const overdueCount = followUps.filter((f) => f.isOverdue).length;

    return {
      interviews,
      followUps,
      allUpcoming: [...interviews, ...followUps.filter((f) => !f.isOverdue)].sort(
        (a, b) => new Date(a.eventDate) - new Date(b.eventDate)
      ),
      overdueList: followUps.filter((f) => f.isOverdue),
      overdueCount,
    };
  }, [jobs]);

  const resetFilters = () => setFilters(DEFAULT_FILTERS);

  return (
    <JobContext.Provider
      value={{
        jobs,
        filteredJobs,
        loading,
        viewMode,
        setViewMode,
        filters,
        setFilters,
        resetFilters,
        sortBy,
        setSortBy,
        stats,
        reminders,
        addJob,
        updateJob,
        updateJobStatus,
        deleteJob,
        addActivity,
        resetToSampleData,
        clearAll,
        exportCSV,
        importCSV,
        exportJSON,
        importJSON,
        refreshJobs,
        // Modal states
        isAddModalOpen,
        setIsAddModalOpen,
        editingJob,
        setEditingJob,
      }}
    >
      {children}
    </JobContext.Provider>
  );
};

export const useJobs = () => {
  const ctx = useContext(JobContext);
  if (!ctx) throw new Error('useJobs must be used within JobProvider');
  return ctx;
};
