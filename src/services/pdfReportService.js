/**
 * Professional printable PDF report generator for JobTrack
 */

export const pdfReportService = {
  /**
   * Generates a printable PDF report window and triggers browser print
   */
  generatePDFReport: (jobs, stats, currentUser) => {
    if (!jobs || jobs.length === 0) {
      alert('No applications found to generate a report.');
      return;
    }

    const reportDate = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // Compute stage breakdown
    const stageCounts = {};
    jobs.forEach((j) => {
      stageCounts[j.status] = (stageCounts[j.status] || 0) + 1;
    });

    const interviewsList = jobs
      .filter((j) => j.interviewDate)
      .sort((a, b) => new Date(a.interviewDate) - new Date(b.interviewDate));

    const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>JobTrack Application Report - ${currentUser?.name || 'Job Seeker'}</title>
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      color: #1e293b;
      background-color: #ffffff;
      padding: 24px;
      font-size: 12px;
      line-height: 1.5;
    }
    @page {
      size: A4 portrait;
      margin: 12mm 15mm;
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
      .page-break {
        page-break-before: always;
      }
      tr {
        page-break-inside: avoid;
      }
    }

    .report-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-bottom: 24px;
      padding-bottom: 16px;
      border-bottom: 1px solid #e2e8f0;
    }
    .btn {
      padding: 8px 16px;
      font-size: 13px;
      font-weight: 600;
      border-radius: 8px;
      cursor: pointer;
      border: none;
      transition: background-color 0.2s;
    }
    .btn-primary {
      background-color: #4f46e5;
      color: white;
    }
    .btn-primary:hover {
      background-color: #4338ca;
    }
    .btn-secondary {
      background-color: #f1f5f9;
      color: #334155;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 28px;
      border-bottom: 2px solid #4f46e5;
      padding-bottom: 16px;
    }
    .brand-title {
      font-size: 22px;
      font-weight: 800;
      color: #1e1b4b;
      letter-spacing: -0.5px;
    }
    .brand-subtitle {
      font-size: 11px;
      color: #64748b;
      margin-top: 2px;
    }
    .candidate-info {
      text-align: right;
    }
    .candidate-name {
      font-size: 15px;
      font-weight: 700;
      color: #0f172a;
    }
    .candidate-meta {
      font-size: 11px;
      color: #64748b;
    }

    /* KPI Summary Cards */
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(5, 1fr);
      gap: 12px;
      margin-bottom: 24px;
    }
    .kpi-card {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 10px;
      padding: 12px;
      text-align: center;
    }
    .kpi-label {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      color: #64748b;
      letter-spacing: 0.5px;
      margin-bottom: 4px;
    }
    .kpi-value {
      font-size: 20px;
      font-weight: 800;
      color: #0f172a;
    }
    .kpi-value.accent {
      color: #4f46e5;
    }
    .kpi-value.success {
      color: #059669;
    }

    /* Sections */
    .section-title {
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .section-title::before {
      content: "";
      display: inline-block;
      width: 4px;
      height: 14px;
      background-color: #4f46e5;
      border-radius: 2px;
    }

    /* Tables */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 11px;
    }
    th {
      background-color: #f1f5f9;
      color: #475569;
      font-weight: 600;
      text-align: left;
      padding: 8px 10px;
      border-bottom: 2px solid #cbd5e1;
      text-transform: uppercase;
      font-size: 9.5px;
      letter-spacing: 0.4px;
    }
    td {
      padding: 8px 10px;
      border-bottom: 1px solid #e2e8f0;
      vertical-align: top;
    }
    tr:nth-child(even) td {
      background-color: #f8fafc;
    }

    .badge {
      display: inline-block;
      padding: 2px 8px;
      border-radius: 9999px;
      font-size: 9.5px;
      font-weight: 700;
      text-transform: uppercase;
    }
    .badge-offer { background: #dcfce7; color: #15803d; }
    .badge-interview { background: #fef3c7; color: #b45309; }
    .badge-applied { background: #dbeafe; color: #1d4ed8; }
    .badge-online-test { background: #f3e8ff; color: #7e22ce; }
    .badge-wishlist { background: #f1f5f9; color: #475569; }
    .badge-rejected { background: #ffe4e6; color: #be123c; }
    .badge-withdrawn { background: #f4f4f5; color: #52525b; }

    .footer {
      margin-top: 32px;
      padding-top: 12px;
      border-top: 1px solid #e2e8f0;
      display: flex;
      justify-content: space-between;
      color: #94a3b8;
      font-size: 10px;
    }
  </style>
</head>
<body>
  <div class="report-actions no-print">
    <button class="btn btn-secondary" onclick="window.close()">Close Window</button>
    <button class="btn btn-primary" onclick="window.print()">🖨️ Print / Save as PDF</button>
  </div>

  <div class="header">
    <div>
      <div class="brand-title">JobTrack</div>
      <div class="brand-subtitle">Career Search & Job Application Progress Report</div>
    </div>
    <div class="candidate-info">
      <div class="candidate-name">${currentUser?.name || 'Job Seeker'}</div>
      <div class="candidate-meta">${currentUser?.email || 'user@jobtrack.app'}</div>
      <div class="candidate-meta">${currentUser?.role || 'Candidate'} • Generated on ${reportDate}</div>
    </div>
  </div>

  <!-- KPI SUMMARY -->
  <div class="kpi-grid">
    <div class="kpi-card">
      <div class="kpi-label">Total Tracked</div>
      <div class="kpi-value">${stats?.total || jobs.length}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Active Pipeline</div>
      <div class="kpi-value accent">${stats?.activeCount || 0}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Interviews / Tests</div>
      <div class="kpi-value">${stats?.interviewCount || 0}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Offers Received</div>
      <div class="kpi-value success">${stats?.offers || 0}</div>
    </div>
    <div class="kpi-card">
      <div class="kpi-label">Response Rate</div>
      <div class="kpi-value">${stats?.responseRate || 0}%</div>
    </div>
  </div>

  <!-- UPCOMING INTERVIEWS (IF ANY) -->
  ${
    interviewsList.length > 0
      ? `
  <div class="section-title">Upcoming Interview Schedule (${interviewsList.length})</div>
  <table>
    <thead>
      <tr>
        <th style="width: 25%;">Company & Role</th>
        <th style="width: 25%;">Scheduled Date & Time</th>
        <th style="width: 25%;">Recruiter / Contact</th>
        <th style="width: 25%;">Location / Link</th>
      </tr>
    </thead>
    <tbody>
      ${interviewsList
        .map(
          (j) => `
        <tr>
          <td>
            <strong>${j.company}</strong><br>
            <span style="color:#64748b;">${j.jobTitle}</span>
          </td>
          <td>
            <strong>${new Date(j.interviewDate).toLocaleDateString([], {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            })}</strong>
          </td>
          <td>
            ${j.contactPerson?.name || '—'}<br>
            <span style="color:#64748b;">${j.contactPerson?.email || ''}</span>
          </td>
          <td>${j.location || 'Remote'}</td>
        </tr>
      `
        )
        .join('')}
    </tbody>
  </table>
  `
      : ''
  }

  <!-- APPLICATIONS INVENTORY -->
  <div class="section-title">Applications Inventory (${jobs.length})</div>
  <table>
    <thead>
      <tr>
        <th style="width: 22%;">Company & Role</th>
        <th style="width: 12%;">Status</th>
        <th style="width: 14%;">Type & Location</th>
        <th style="width: 14%;">Compensation</th>
        <th style="width: 12%;">Source</th>
        <th style="width: 10%;">Applied</th>
        <th style="width: 16%;">Notes / Next Step</th>
      </tr>
    </thead>
    <tbody>
      ${jobs
        .map((j) => {
          let badgeClass = 'badge-wishlist';
          const s = (j.status || '').toLowerCase();
          if (s.includes('offer')) badgeClass = 'badge-offer';
          else if (s.includes('interview')) badgeClass = 'badge-interview';
          else if (s.includes('applied')) badgeClass = 'badge-applied';
          else if (s.includes('test')) badgeClass = 'badge-online-test';
          else if (s.includes('reject')) badgeClass = 'badge-rejected';
          else if (s.includes('withdraw')) badgeClass = 'badge-withdrawn';

          return `
        <tr>
          <td>
            <strong>${j.company}</strong><br>
            <span style="color:#64748b;">${j.jobTitle}</span>
          </td>
          <td><span class="badge ${badgeClass}">${j.status}</span></td>
          <td>${j.jobType}<br><span style="color:#64748b;">${j.location || 'Remote'}</span></td>
          <td><strong>${j.salaryRange || '—'}</strong></td>
          <td>${j.source || '—'}</td>
          <td>${j.dateApplied || '—'}</td>
          <td style="color:#475569; font-size: 10px;">${j.notes ? (j.notes.length > 80 ? j.notes.slice(0, 80) + '...' : j.notes) : '—'}</td>
        </tr>
      `;
        })
        .join('')}
    </tbody>
  </table>

  <div class="footer">
    <div>Generated by JobTrack • Confidential Job Hunt Audit</div>
    <div>Page 1 of 1</div>
  </div>

  <script>
    // Auto-trigger print dialog shortly after load
    window.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => {
        window.print();
      }, 350);
    });
  </script>
</body>
</html>`;

    const printWindow = window.open('', '_blank', 'width=900,height=750');
    if (printWindow) {
      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();
    } else {
      alert('Pop-up blocked! Please allow pop-ups for this site to generate your PDF report.');
    }
  },
};
