import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StatCards } from '../components/dashboard/StatCards';
import { StatusPieChart } from '../components/dashboard/StatusPieChart';
import { TimelineChart } from '../components/dashboard/TimelineChart';
import { UpcomingWidget } from '../components/dashboard/UpcomingWidget';
import { RecentActivityWidget } from '../components/dashboard/RecentActivityWidget';
import { useAuth } from '../context/AuthContext';
import { useJobs } from '../context/JobContext';
import { PlusCircle, Sparkles, ArrowRight, LayoutGrid, Award, Printer } from 'lucide-react';

export const DashboardPage = () => {
  const { currentUser } = useAuth();
  const { setIsAddModalOpen, stats, exportPDF } = useJobs();
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-violet-900 text-white p-6 sm:p-8 shadow-lg">
        {/* Decorative background glow circles */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-indigo-500/20 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-32 -mb-16 w-48 h-48 rounded-full bg-violet-500/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-indigo-200 border border-white/10 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Job Hunt Command Center</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
              Welcome back, {currentUser?.name || 'Job Seeker'}!
            </h1>
            <p className="mt-1 text-sm text-indigo-100 max-w-xl">
              You have <span className="font-semibold text-white">{stats.activeCount} active applications</span> in your pipeline
              {stats.offers > 0 && (
                <span> and <span className="font-semibold text-emerald-300">{stats.offers} job offers</span> in hand!</span>
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              onClick={exportPDF}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition-all"
              title="Print or Save Career Audit Report as PDF"
            >
              <Printer className="w-4 h-4 text-emerald-300" />
              <span>PDF Report</span>
            </button>
            <button
              onClick={() => navigate('/applications')}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-md border border-white/20 transition-all"
            >
              <LayoutGrid className="w-4 h-4" />
              <span>View Pipeline</span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white hover:bg-indigo-50 text-indigo-950 text-xs font-bold shadow-md hover:shadow-lg transition-all"
            >
              <PlusCircle className="w-4 h-4 text-indigo-600" />
              <span>Add New Application</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <StatCards />

      {/* Charts Section: Pie Chart + Timeline Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4">
          <StatusPieChart />
        </div>
        <div className="lg:col-span-8">
          <TimelineChart />
        </div>
      </div>

      {/* Widgets Section: Upcoming & Reminders + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingWidget />
        <RecentActivityWidget />
      </div>
    </div>
  );
};
