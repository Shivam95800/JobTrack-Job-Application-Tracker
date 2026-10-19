import React, { useRef, useState } from 'react';
import {
  Download,
  Upload,
  FileText,
  Database,
  Sparkles,
  Trash2,
  Moon,
  Sun,
  ShieldCheck,
  User,
  RefreshCw,
  CheckCircle,
} from 'lucide-react';
import { useJobs } from '../context/JobContext';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

export const SettingsPage = () => {
  const {
    jobs,
    exportCSV,
    importCSV,
    exportJSON,
    importJSON,
    resetToSampleData,
    clearAll,
  } = useJobs();
  const { currentUser } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [confirmReset, setConfirmReset] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);

  const csvInputRef = useRef(null);
  const jsonInputRef = useRef(null);

  const handleCSVUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        importCSV(text);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleJSONUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        importJSON(text);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">
          Settings & Data Management
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage your job hunt data, backup files, and workspace preferences
        </p>
      </div>

      {/* Account Info */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <User className="w-4 h-4 text-indigo-500" />
          <span>Profile & Workspace</span>
        </h3>

        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-500 text-white font-bold text-lg flex items-center justify-center shadow-md shadow-indigo-500/20">
            {currentUser?.avatar || 'AH'}
          </div>
          <div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base">
              {currentUser?.name || 'Job Seeker'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {currentUser?.email || 'user@jobtrack.app'}
            </p>
            <span className="inline-block mt-1 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800">
              {currentUser?.role || 'Full Stack Engineer'}
            </span>
          </div>
        </div>
      </div>

      {/* Appearance / Theme */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs flex items-center justify-between">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">
            Interface Theme
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Choose between light and dark modes according to your preference
          </p>
        </div>

        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          {theme === 'dark' ? (
            <>
              <Sun className="w-4 h-4 text-amber-400" />
              <span>Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="w-4 h-4 text-slate-600" />
              <span>Dark Mode</span>
            </>
          )}
        </button>
      </div>

      {/* CSV Export & Import */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-500" />
            <span>CSV Import & Export</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Export your job applications to spreadsheet format or import from other trackers
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export to CSV ({jobs.length} applications)</span>
          </button>

          <input
            type="file"
            ref={csvInputRef}
            onChange={handleCSVUpload}
            accept=".csv"
            className="hidden"
          />
          <button
            onClick={() => csvInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Import from CSV</span>
          </button>
        </div>
      </div>

      {/* JSON Backup & Restore */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Database className="w-4 h-4 text-violet-500" />
            <span>JSON Full Backup & Restore</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Creates a lossless backup containing your entire timeline activity, interview notes, and timestamps
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={exportJSON}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-xs font-semibold shadow-xs transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Download JSON Backup</span>
          </button>

          <input
            type="file"
            ref={jsonInputRef}
            onChange={handleJSONUpload}
            accept=".json"
            className="hidden"
          />
          <button
            onClick={() => jsonInputRef.current?.click()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-semibold transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Restore JSON Backup</span>
          </button>
        </div>
      </div>

      {/* Sample Data & Reset */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            <span>Sample Data & Storage Reset</span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Reset or populate your tracker with realistic dummy data for testing
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setConfirmReset(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-amber-300 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 text-amber-800 dark:text-amber-300 text-xs font-semibold transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload 13 Sample Applications</span>
          </button>

          <button
            onClick={() => setConfirmClear(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 text-rose-700 dark:text-rose-300 text-xs font-semibold transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear All Data</span>
          </button>
        </div>
      </div>

      {/* Privacy note */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
        <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
        <span>
          <strong>100% Local & Private:</strong> All your applications, recruiter notes, and interview details are stored directly in your browser's LocalStorage.
        </span>
      </div>

      {/* Reset confirmation */}
      <ConfirmDialog
        isOpen={confirmReset}
        onClose={() => setConfirmReset(false)}
        onConfirm={() => resetToSampleData()}
        title="Reset to Sample Applications"
        message="This will replace your current applications with the default realistic 13 sample tech applications (Stripe, Figma, Google, Netflix, etc.)."
        confirmText="Reset to Sample"
        isDestructive={false}
      />

      {/* Clear confirmation */}
      <ConfirmDialog
        isOpen={confirmClear}
        onClose={() => setConfirmClear(false)}
        onConfirm={() => clearAll()}
        title="Clear All Applications"
        message="Are you sure you want to delete all job applications? This cannot be undone unless you have a recent backup."
        confirmText="Yes, Clear All"
        isDestructive={true}
      />
    </div>
  );
};
