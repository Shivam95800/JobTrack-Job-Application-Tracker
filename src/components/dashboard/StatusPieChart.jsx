import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { useJobs } from '../../context/JobContext';
import { STATUS_CONFIG } from '../../types/job';

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900/90 text-white text-xs px-3 py-2 rounded-xl shadow-xl backdrop-blur-md border border-slate-700">
        <div className="flex items-center gap-2">
          <span
            className="w-2.5 h-2.5 rounded-full"
            style={{ backgroundColor: data.payload.color }}
          />
          <span className="font-semibold">{data.name}</span>
        </div>
        <div className="mt-1 font-bold text-sm text-indigo-300">
          {data.value} {data.value === 1 ? 'application' : 'applications'}
        </div>
      </div>
    );
  }
  return null;
};

export const StatusPieChart = () => {
  const { stats } = useJobs();
  const data = stats.statusDistribution;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-xs flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            Status Breakdown
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Distribution across the job hunt pipeline
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
          {stats.total} Total
        </span>
      </div>

      <div className="flex-1 min-h-[260px] relative">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={95}
                paddingAngle={3}
                dataKey="value"
                stroke="transparent"
              >
                {data.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.color}
                    className="hover:opacity-85 transition-opacity cursor-pointer"
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full flex items-center justify-center text-xs text-slate-400">
            No application data available
          </div>
        )}
      </div>

      {/* Custom Legend Grid */}
      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
        {data.map((item) => (
          <div key={item.name} className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-slate-600 dark:text-slate-400 truncate">
                {item.name}
              </span>
            </div>
            <span className="font-bold text-slate-900 dark:text-white ml-2">
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
