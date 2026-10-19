import { storageService } from './storageService';
import { getSampleApplications } from '../data/seedData';
import { JOB_STATUSES } from '../types/job';

const getJobsKey = (userId) => `jobs_${userId || 'anonymous'}`;

// Helper to extract rough numerical value from salary text for sorting
export const parseSalaryNumber = (salaryStr) => {
  if (!salaryStr) return 0;
  // Look for numbers like 160000 or 160k
  const matches = salaryStr.match(/\d+[\d,]*/g);
  if (!matches || matches.length === 0) return 0;
  const cleaned = matches[0].replace(/,/g, '');
  let val = parseFloat(cleaned);
  if (salaryStr.toLowerCase().includes('k') && val < 1000) {
    val *= 1000;
  }
  return val || 0;
};

export const jobService = {
  /**
   * Fetch all applications for a specific user
   */
  getJobs: (userId) => {
    if (!userId) return [];
    const key = getJobsKey(userId);
    const existing = storageService.get(key);

    if (existing === null) {
      // Seed initial sample data for demo user, new signups start with clean personal workspace
      const sample = userId === 'demo_user_1' ? getSampleApplications(userId) : [];
      storageService.set(key, sample);
      return sample;
    }

    return existing || [];
  },

  /**
   * Fetch a single application by ID
   */
  getJobById: (userId, jobId) => {
    const jobs = jobService.getJobs(userId);
    return jobs.find((j) => j.id === jobId) || null;
  },

  /**
   * Create a new application
   */
  createJob: (userId, jobData) => {
    const jobs = jobService.getJobs(userId);
    const now = new Date().toISOString();

    const newJob = {
      id: `job-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      userId,
      company: jobData.company?.trim() || 'Untitled Company',
      jobTitle: jobData.jobTitle?.trim() || 'Untitled Role',
      location: jobData.location?.trim() || 'Remote',
      jobType: jobData.jobType || 'Full-time',
      salaryRange: jobData.salaryRange?.trim() || '',
      salaryMin: parseSalaryNumber(jobData.salaryRange),
      jobLink: jobData.jobLink?.trim() || '',
      dateApplied: jobData.dateApplied || now.split('T')[0],
      status: jobData.status || JOB_STATUSES.APPLIED,
      source: jobData.source || 'LinkedIn',
      contactPerson: {
        name: jobData.contactPerson?.name || '',
        role: jobData.contactPerson?.role || '',
        email: jobData.contactPerson?.email || '',
        phone: jobData.contactPerson?.phone || '',
      },
      notes: jobData.notes?.trim() || '',
      followUpDate: jobData.followUpDate || null,
      interviewDate: jobData.interviewDate || null,
      createdAt: now,
      updatedAt: now,
      history: [
        {
          id: `act-${Date.now()}-1`,
          type: 'created',
          title: `Application created with status "${jobData.status || JOB_STATUSES.APPLIED}"`,
          timestamp: now,
          details: jobData.notes ? `Initial notes: ${jobData.notes}` : undefined,
        },
      ],
    };

    // If an interview date was set on creation, add to history
    if (newJob.interviewDate) {
      newJob.history.push({
        id: `act-${Date.now()}-2`,
        type: 'interview_scheduled',
        title: 'Interview Scheduled',
        details: `Interview set for ${new Date(newJob.interviewDate).toLocaleString()}`,
        timestamp: now,
      });
    }

    const updatedJobs = [newJob, ...jobs];
    storageService.set(getJobsKey(userId), updatedJobs);
    return newJob;
  },

  /**
   * Update an existing job
   */
  updateJob: (userId, jobId, updates) => {
    const jobs = jobService.getJobs(userId);
    const index = jobs.findIndex((j) => j.id === jobId);
    if (index === -1) return null;

    const existing = jobs[index];
    const now = new Date().toISOString();
    const history = [...(existing.history || [])];

    // Check if status changed
    if (updates.status && updates.status !== existing.status) {
      history.push({
        id: `act-${Date.now()}-sc`,
        type: 'status_change',
        title: `Status changed to ${updates.status}`,
        fromStatus: existing.status,
        toStatus: updates.status,
        timestamp: now,
      });
    }

    // Check if interview date changed
    if (updates.interviewDate && updates.interviewDate !== existing.interviewDate) {
      history.push({
        id: `act-${Date.now()}-int`,
        type: 'interview_scheduled',
        title: 'Interview Date Updated',
        details: `Interview set for ${new Date(updates.interviewDate).toLocaleString()}`,
        timestamp: now,
      });
    }

    // Check if notes changed significantly
    if (updates.notes && updates.notes !== existing.notes && updates.notes.trim()) {
      history.push({
        id: `act-${Date.now()}-note`,
        type: 'note_added',
        title: 'Notes Updated',
        details: updates.notes.length > 80 ? `${updates.notes.slice(0, 80)}...` : updates.notes,
        timestamp: now,
      });
    }

    const updatedJob = {
      ...existing,
      ...updates,
      salaryMin: updates.salaryRange ? parseSalaryNumber(updates.salaryRange) : existing.salaryMin,
      updatedAt: now,
      history,
    };

    jobs[index] = updatedJob;
    storageService.set(getJobsKey(userId), jobs);
    return updatedJob;
  },

  /**
   * Move status (specifically for Kanban drag and drop or quick dropdown)
   */
  updateJobStatus: (userId, jobId, newStatus) => {
    return jobService.updateJob(userId, jobId, { status: newStatus });
  },

  /**
   * Add a custom activity/log entry or note to an application
   */
  addActivity: (userId, jobId, { title, details, type = 'note_added' }) => {
    const jobs = jobService.getJobs(userId);
    const index = jobs.findIndex((j) => j.id === jobId);
    if (index === -1) return null;

    const existing = jobs[index];
    const now = new Date().toISOString();

    const newActivity = {
      id: `act-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      type,
      title,
      details,
      timestamp: now,
    };

    const updatedJob = {
      ...existing,
      updatedAt: now,
      history: [...(existing.history || []), newActivity],
    };

    jobs[index] = updatedJob;
    storageService.set(getJobsKey(userId), jobs);
    return updatedJob;
  },

  /**
   * Delete an application
   */
  deleteJob: (userId, jobId) => {
    const jobs = jobService.getJobs(userId);
    const filtered = jobs.filter((j) => j.id !== jobId);
    storageService.set(getJobsKey(userId), filtered);
    return true;
  },

  /**
   * Reset user's jobs to the sample seed data
   */
  resetToSampleData: (userId) => {
    const sample = getSampleApplications(userId);
    storageService.set(getJobsKey(userId), sample);
    return sample;
  },

  /**
   * Clear all jobs for this user
   */
  clearAllJobs: (userId) => {
    storageService.set(getJobsKey(userId), []);
    return [];
  },

  /**
   * Bulk import jobs
   */
  bulkSaveJobs: (userId, newJobsList) => {
    storageService.set(getJobsKey(userId), newJobsList);
    return newJobsList;
  },
};
