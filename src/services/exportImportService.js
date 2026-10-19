import { JOB_STATUSES, JOB_TYPES, JOB_SOURCES } from '../types/job';
import { parseSalaryNumber } from './jobService';

/**
 * Utility to safely escape CSV cell values
 */
const escapeCSV = (val) => {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
};

export const exportImportService = {
  /**
   * Export applications to CSV
   */
  exportToCSV: (jobs) => {
    const headers = [
      'Company',
      'Job Title',
      'Location',
      'Job Type',
      'Salary Range',
      'Status',
      'Source',
      'Date Applied',
      'Job Link',
      'Contact Name',
      'Contact Role',
      'Contact Email',
      'Contact Phone',
      'Follow-up Date',
      'Interview Date',
      'Notes',
    ];

    const rows = jobs.map((j) => [
      escapeCSV(j.company),
      escapeCSV(j.jobTitle),
      escapeCSV(j.location),
      escapeCSV(j.jobType),
      escapeCSV(j.salaryRange),
      escapeCSV(j.status),
      escapeCSV(j.source),
      escapeCSV(j.dateApplied),
      escapeCSV(j.jobLink),
      escapeCSV(j.contactPerson?.name || ''),
      escapeCSV(j.contactPerson?.role || ''),
      escapeCSV(j.contactPerson?.email || ''),
      escapeCSV(j.contactPerson?.phone || ''),
      escapeCSV(j.followUpDate || ''),
      escapeCSV(j.interviewDate || ''),
      escapeCSV(j.notes || ''),
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    // Trigger browser download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `JobTrack_Applications_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Parse CSV text into job applications array
   */
  parseCSV: (csvText, userId) => {
    // Standard robust regex for CSV parsing
    const lines = [];
    const rows = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
    if (rows.length < 2) {
      throw new Error('CSV must contain a header row and at least one data row.');
    }

    const parseLine = (text) => {
      const result = [];
      let current = '';
      let inQuotes = false;
      for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (c === '"') {
          if (inQuotes && text[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (c === ',' && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += c;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headerCols = parseLine(rows[0]).map((h) => h.toLowerCase().replace(/[^a-z0-9]/g, ''));

    const parsedJobs = [];
    const now = new Date().toISOString();

    for (let i = 1; i < rows.length; i++) {
      const cols = parseLine(rows[i]);
      if (cols.length === 0 || (cols.length === 1 && !cols[0])) continue;

      const getCol = (keyMatches) => {
        const idx = headerCols.findIndex((h) => keyMatches.some((k) => h.includes(k)));
        return idx !== -1 ? cols[idx] || '' : '';
      };

      const company = getCol(['company', 'org']) || 'Unknown Company';
      const jobTitle = getCol(['title', 'role', 'position']) || 'Software Engineer';
      const statusRaw = getCol(['status']);
      const status = Object.values(JOB_STATUSES).find(
        (s) => s.toLowerCase() === statusRaw.toLowerCase()
      ) || JOB_STATUSES.APPLIED;

      const jobTypeRaw = getCol(['type']);
      const jobType = JOB_TYPES.find(
        (t) => t.toLowerCase() === jobTypeRaw.toLowerCase()
      ) || 'Full-time';

      const sourceRaw = getCol(['source']);
      const source = JOB_SOURCES.find(
        (s) => s.toLowerCase() === sourceRaw.toLowerCase()
      ) || 'Other';

      parsedJobs.push({
        id: `job-imported-${Date.now()}-${i}`,
        userId,
        company,
        jobTitle,
        location: getCol(['location', 'city']) || 'Remote',
        jobType,
        salaryRange: getCol(['salary', 'compensation', 'pay']),
        salaryMin: parseSalaryNumber(getCol(['salary', 'compensation', 'pay'])),
        jobLink: getCol(['link', 'url']),
        dateApplied: getCol(['dateapplied', 'date', 'applied']) || now.split('T')[0],
        status,
        source,
        contactPerson: {
          name: getCol(['contactname', 'recruitername', 'contact']),
          role: getCol(['contactrole', 'recruiterrole']),
          email: getCol(['contactemail', 'email']),
          phone: getCol(['contactphone', 'phone']),
        },
        notes: getCol(['notes', 'comment', 'description']),
        followUpDate: getCol(['followup', 'followupdate']) || null,
        interviewDate: getCol(['interview', 'interviewdate']) || null,
        createdAt: now,
        updatedAt: now,
        history: [
          {
            id: `act-imp-${Date.now()}-${i}`,
            type: 'created',
            title: 'Imported from CSV',
            timestamp: now,
          },
        ],
      });
    }

    return parsedJobs;
  },

  /**
   * Export all jobs to JSON backup
   */
  exportToJSON: (jobs, user) => {
    const backupData = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      user: {
        email: user?.email,
        name: user?.name,
      },
      jobsCount: jobs.length,
      jobs,
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `JobTrack_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Parse JSON backup
   */
  parseJSON: (jsonString, userId) => {
    const parsed = JSON.parse(jsonString);
    let jobsList = [];

    if (Array.isArray(parsed)) {
      jobsList = parsed;
    } else if (parsed && Array.isArray(parsed.jobs)) {
      jobsList = parsed.jobs;
    } else {
      throw new Error('Invalid JSON backup file. Expected an array of jobs or a backup object.');
    }

    // Re-bind to current userId
    return jobsList.map((j) => ({
      ...j,
      id: j.id || `job-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      userId,
      history: Array.isArray(j.history) ? j.history : [],
    }));
  },
};
