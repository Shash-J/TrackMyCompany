import React from 'react';
import { 
  Building2, 
  FileSpreadsheet, 
  UserCheck,
  LayoutDashboard,
  BarChart3,
  Plus,
  Smartphone
} from 'lucide-react';
import type { StudentProfile } from '../types';

export type NavTab = 'dashboard' | 'statistics';

interface NavbarProps {
  currentTab?: NavTab;
  onSelectTab: (tab: NavTab) => void;
  profile: StudentProfile | null;
  onOpenProfile: () => void;
  onOpenAddModal?: () => void;
  onOpenImportExport: () => void;
  onOpenAbout?: () => void;
  onOpenInstall?: () => void;
  isStandalone?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab = 'dashboard',
  onSelectTab,
  profile,
  onOpenProfile,
  onOpenAddModal,
  onOpenImportExport,
  onOpenAbout,
  onOpenInstall,
  isStandalone = false,
}) => {
  const longPressTimerRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLongPressActive = React.useRef(false);

  const startPress = () => {
    isLongPressActive.current = false;
    longPressTimerRef.current = setTimeout(() => {
      isLongPressActive.current = true;
      if (onOpenAbout) {
        onOpenAbout();
      }
    }, 600); // 600ms hold triggers modal
  };

  const cancelPress = () => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isLongPressActive.current) {
      e.preventDefault();
      e.stopPropagation();
      isLongPressActive.current = false;
      return;
    }
    onSelectTab('dashboard');
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-nav border-b border-slate-800/80 bg-[#0B0F19]/90 backdrop-blur-md">
      <div className="max-w-md md:max-w-5xl lg:max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-2">
          
          {/* Logo & Brand (Click for Dashboard, Long-press for Info & Privacy details) */}
          <div 
            className="flex items-center gap-2.5 cursor-pointer select-none active:scale-95 transition-transform" 
            onClick={handleClick}
            onMouseDown={startPress}
            onMouseUp={cancelPress}
            onMouseLeave={cancelPress}
            onTouchStart={startPress}
            onTouchEnd={cancelPress}
            onTouchCancel={cancelPress}
            title="Press and hold for site details & privacy"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-500/25 border border-indigo-400/30 shrink-0">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="text-base font-bold tracking-tight text-white block leading-none">
                TrackMyCompany
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs (Hidden on mobile, visible on tablet & desktop) */}
          <nav className="hidden md:flex items-center gap-1 bg-[#131B2E] p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => onSelectTab('dashboard')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                currentTab === 'dashboard'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <LayoutDashboard className="w-3.5 h-3.5" />
              <span>Dashboard</span>
            </button>

            <button
              onClick={() => onSelectTab('statistics')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
                currentTab === 'statistics'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>My Stats</span>
            </button>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            
            {/* Desktop Add Company Button */}
            {onOpenAddModal && (
              <button
                onClick={onOpenAddModal}
                className="hidden md:flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-95 text-white font-semibold text-xs rounded-xl shadow-md shadow-indigo-600/25 transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Add Company</span>
              </button>
            )}

            {/* Student Profile Pill */}
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium bg-gradient-to-r from-purple-900/40 to-indigo-900/40 border border-indigo-500/30 hover:border-indigo-400/50 rounded-xl text-indigo-200 transition-all active:scale-95"
              title="Student Profile"
            >
              <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
              <span className="font-semibold text-[11px] max-w-[90px] sm:max-w-[120px] truncate block">
                {profile?.name || 'Profile'}
              </span>
            </button>

            {/* Quick Excel / CSV Button */}
            <button
              onClick={onOpenImportExport}
              title="Import or Export Excel / CSV"
              className="p-2 text-slate-300 bg-slate-800/70 hover:bg-slate-700 border border-slate-700/60 rounded-xl transition-all active:scale-95 flex items-center gap-1.5"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline text-xs text-slate-300 font-medium">Excel</span>
            </button>

            {/* Install / Add to Home Screen Button (Visible if not running as standalone PWA) */}
            {!isStandalone && onOpenInstall && (
              <button
                onClick={onOpenInstall}
                title="Add icon to Home Screen"
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 hover:text-white border border-indigo-500/40 rounded-xl transition-all active:scale-95 cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden sm:inline">Install</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
