/**
 * Calendar sync service for Google Calendar and iCalendar (.ics) exports
 */

const formatToUTCString = (date) => {
  const d = new Date(date);
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
};

export const calendarService = {
  /**
   * Generate Google Calendar web link
   */
  getGoogleCalendarUrl: (job) => {
    if (!job?.interviewDate) return '';

    const startDate = new Date(job.interviewDate);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration

    const title = encodeURIComponent(`Interview: ${job.company} - ${job.jobTitle}`);
    const dates = `${formatToUTCString(startDate)}/${formatToUTCString(endDate)}`;

    let detailsText = `Job Application: ${job.jobTitle} at ${job.company}\n`;
    if (job.salaryRange) detailsText += `Salary Range: ${job.salaryRange}\n`;
    if (job.contactPerson?.name) {
      detailsText += `Recruiter: ${job.contactPerson.name} (${job.contactPerson.role || 'Recruiter'}) - ${job.contactPerson.email || ''} ${job.contactPerson.phone || ''}\n`;
    }
    if (job.jobLink) detailsText += `Job Posting: ${job.jobLink}\n`;
    if (job.notes) detailsText += `\nNotes:\n${job.notes}\n`;
    detailsText += `\nOrganized via JobTrack`;

    const details = encodeURIComponent(detailsText);
    const location = encodeURIComponent(job.location || 'Remote');

    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
  },

  /**
   * Generate and trigger download of .ics (iCalendar) file
   */
  downloadICS: (job) => {
    if (!job?.interviewDate) return;

    const startDate = new Date(job.interviewDate);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000);
    const now = new Date();

    const dtStart = formatToUTCString(startDate);
    const dtEnd = formatToUTCString(endDate);
    const dtStamp = formatToUTCString(now);
    const uid = `jobtrack-${job.id || Date.now()}@jobtrack.app`;

    let description = `Job Application: ${job.jobTitle} at ${job.company}\\n`;
    if (job.salaryRange) description += `Salary Range: ${job.salaryRange}\\n`;
    if (job.contactPerson?.name) {
      description += `Recruiter: ${job.contactPerson.name} (${job.contactPerson.role || 'Recruiter'}) - ${job.contactPerson.email || ''}\\n`;
    }
    if (job.jobLink) description += `Posting: ${job.jobLink}\\n`;
    if (job.notes) {
      const sanitizedNotes = job.notes.replace(/\r?\n/g, '\\n').replace(/[,;]/g, ' ');
      description += `Notes: ${sanitizedNotes}\\n`;
    }

    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//JobTrack//Job Application Tracker//EN',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART:${dtStart}`,
      `DTEND:${dtEnd}`,
      `SUMMARY:Interview: ${job.company} - ${job.jobTitle}`,
      `DESCRIPTION:${description}`,
      `LOCATION:${job.location || 'Remote'}`,
      'STATUS:CONFIRMED',
      'SEQUENCE:0',
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanCompany = (job.company || 'Job').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.setAttribute('download', `Interview_${cleanCompany}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },
};
