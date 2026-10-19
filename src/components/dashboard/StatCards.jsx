import React from 'react';
import { Briefcase, Zap, Calendar, Award, Target, TrendingUp } from 'lucide-react';
import { useJobs } from '../../context/JobContext';

export const StatCards = () => {
  const { stats, reminders } = useJobs();

  const cards = [
    {
      title: 'Total Applications',
      value: stats.total,
      subtitle: `${stats.activeCount} active in pipeline`,
      icon: Briefcase,
      color: 'indigo',
      gradient: 'from-indigo-500/10 to-indigo-500/5',
      iconBg: 'bg-indigo-600 text-white',
      border: 'border-indigo-100 dark:border-indigo-950',
    },
    {
      title: 'Interviews & Tests',
      value: stats.interviews,
      subtitle: `${reminders.interviews.length} upcoming scheduled`,
      icon: Calendar,
      color: 'amber',
      gradient: 'from-amber-500/10 to-amber-500/5',
      iconBg: 'bg-amber-500 text-white',
      border: 'border-amber-100 dark:border-amber-950',
    },
    {
      title: 'Job Offers',
      value: stats.offers,
      subtitle: stats.offers > 0 ? 'Congratulations! 🎉' : 'Keep pushing forward',
      icon: Award,
      color: 'emerald',
      gradient: 'from-emerald-500/10 to-emerald-500/5',
      iconBg: 'bg-emerald-600 text-white',
      border: 'border-emerald-100 dark:border-emerald-950',
      badge: stats.offers > 0 ? 'Celebration' : null,
    },
    {
      title: 'Response Rate',
      value: `${stats.responseRate}%`,
      subtitle: 'Applications past review',
      icon: TrendingUp,
      color: 'violet',
      gradient: 'from-violet-500/10 to-violet-500/5',
      iconBg: 'bg-violet-600 text-white',
      border: 'border-violet-100 dark:border-violet-950',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className={`relative overflow-hidden bg-white dark:bg-slate-900 rounded-2xl border ${card.border} p-5 shadow-xs hover:shadow-md transition-all duration-200 group`}
        >
          {/* Subtle gradient background */}
          <div
            className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-50 pointer-events-none`}
          />

          <div className="relative flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {card.title}
            </span>
            <div
              className={`w-9 h-9 rounded-xl flex items-center justify-center shadow-xs ${card.iconBg}`}
            >
              <card.icon className="w-4 h-4" />
            </div>
          </div>

          <div className="relative mt-3">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {card.value}
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
              {card.subtitle}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
};
