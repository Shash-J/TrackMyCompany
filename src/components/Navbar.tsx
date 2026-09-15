import React from 'react';
import { 
  Building2, 
  BarChart3, 
  Plus, 
  FileSpreadsheet, 
  UserCheck, 
  LayoutDashboard
} from 'lucide-react';
import type { StudentProfile } from '../types';
import { GithubIcon } from './GithubIcon';

export type NavTab = 'dashboard' | 'statistics';

interface NavbarProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  profile: StudentProfile | null;
  onOpenProfile: () => void;
  onOpenAddModal: () => void;
  onOpenImportExport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  profile,
  onOpenProfile,
  onOpenAddModal,
  onOpenImportExport,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-nav border-b border-slate-800/80 bg-[#0B0F19]/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div 
            className="flex items-center gap-3 cursor-pointer" 
            onClick={() => onSelectTab('dashboard')}
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 border border-indigo-400/30">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                  TrackMyCompany
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Campus Placement Tracker for Students</p>
            </div>
          </div>

          {/* Center: Exactly Two Main Tabs */}
          <nav className="flex items-center gap-1.5 bg-[#131B2E] p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onSelectTab('statistics')}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all ${
                currentTab === 'statistics'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Statistics</span>
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Import / Export */}
            <button
              onClick={onOpenImportExport}
              title="Import or Export Excel / CSV"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/60 rounded-xl transition-all"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">Excel / CSV</span>
            </button>

            {/* Add Company Button */}
            <button
              onClick={onOpenAddModal}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl shadow-md shadow-indigo-600/25 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Company</span>
            </button>

            {/* Student Corner Pill */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-indigo-500/30 hover:border-indigo-400/50 rounded-xl text-indigo-200 transition-all group"
              title="Click to view/edit student profile"
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-400 group-hover:scale-110 transition-transform" />
              <div className="text-left hidden sm:block">
                <span className="font-semibold block leading-tight">
                  {profile?.name || 'Student Corner'}
                </span>
                {profile?.branch && (
                  <span className="text-[10px] text-slate-400 block leading-none">
                    {profile.branch} {profile.batch ? `'${profile.batch.slice(-2)}` : ''}
                  </span>
                )}
              </div>
            </button>

            {/* GitHub Repo */}
            <a
              href="https://github.com/Shash-J/TrackMyCompany.git"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700/50 transition-colors"
              title="View on GitHub (Open Source)"
            >
              <GithubIcon className="w-4 h-4" />
            </a>
          </div>

        </div>
      </div>
    </header>
  );
};
