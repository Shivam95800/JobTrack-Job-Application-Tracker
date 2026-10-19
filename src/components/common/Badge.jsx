import React from 'react';
import { STATUS_CONFIG } from '../../types/job';

export const StatusBadge = ({ status, size = 'sm', className = '' }) => {
  const config = STATUS_CONFIG[status] || {
    label: status || 'Unknown',
    bgLight: 'bg-slate-100 text-slate-700 border-slate-200',
    bgDark: 'dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    pill: 'bg-slate-400',
  };

  const sizeClasses =
    size === 'xs'
      ? 'px-2 py-0.5 text-xs'
      : size === 'md'
      ? 'px-3 py-1 text-sm'
      : 'px-2.5 py-0.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full border shadow-xs transition-colors ${config.bgLight} ${config.bgDark} ${sizeClasses} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.pill}`} />
      <span>{config.label}</span>
    </span>
  );
};

export const TagBadge = ({ children, color = 'slate', className = '' }) => {
  const colors = {
    slate: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    indigo: 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
    amber: 'bg-amber-50 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    rose: 'bg-rose-50 dark:bg-rose-950/70 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
  };

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${colors[color] || colors.slate} ${className}`}
    >
      {children}
    </span>
  );
};
