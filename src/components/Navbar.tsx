import React from 'react';
import { 
  Building2, 
  FileSpreadsheet, 
  UserCheck 
} from 'lucide-react';
import type { StudentProfile } from '../types';
import { GithubIcon } from './GithubIcon';

export type NavTab = 'dashboard' | 'statistics';

interface NavbarProps {
  currentTab?: NavTab;
  onSelectTab: (tab: NavTab) => void;
  profile: StudentProfile | null;
  onOpenProfile: () => void;
  onOpenAddModal?: () => void;
  onOpenImportExport: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onSelectTab,
  profile,
  onOpenProfile,
  onOpenImportExport,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full glass-nav border-b border-slate-800/80 bg-[#0B0F19]/90 backdrop-blur-md">
      <div className="max-w-md mx-auto px-3.5">
        <div className="flex items-center justify-between h-14 gap-2">
          
          {/* Logo & Brand */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer select-none active:scale-95 transition-transform" 
            onClick={() => onSelectTab('dashboard')}
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-500/25 border border-indigo-400/30 shrink-0">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white block leading-none">
                TrackMyCompany
              </span>
              <span className="text-[10px] text-slate-400 block leading-tight mt-0.5">
                Campus Tracker
              </span>
            </div>
          </div>

          {/* Right Mobile Actions */}
          <div className="flex items-center gap-1.5">
            {/* Student Profile Corner */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-indigo-500/30 hover:border-indigo-400/50 rounded-xl text-indigo-200 transition-all active:scale-95"
              title="Student Profile"
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-semibold text-[11px] max-w-[80px] truncate block">
                {profile?.name || 'Profile'}
              </span>
            </button>

            {/* Quick Excel / CSV Button */}
            <button
              onClick={onOpenImportExport}
              title="Import or Export Excel / CSV"
              className="p-2 text-slate-300 bg-slate-800/70 hover:bg-slate-700 border border-slate-700/60 rounded-xl transition-all active:scale-95"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            </button>

            {/* GitHub Repo */}
            <a
              href="https://github.com/Shash-J/TrackMyCompany.git"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-xl border border-slate-700/50 transition-colors active:scale-95"
              title="View on GitHub"
            >
              <GithubIcon className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>
      </div>
    </header>
  );
};
