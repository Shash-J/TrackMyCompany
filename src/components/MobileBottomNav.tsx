import React from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Plus, 
  BarChart3, 
  FileSpreadsheet
} from 'lucide-react';
import type { NavTab } from './Navbar';

interface MobileBottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  statusFilter: 'applied' | 'not_applied';
  onSelectStatusFilter: (status: 'applied' | 'not_applied') => void;
  onOpenAddModal: () => void;
  onOpenImportExport: () => void;
  appliedCount: number;
  skippedCount: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  statusFilter,
  onSelectStatusFilter,
  onOpenAddModal,
  onOpenImportExport,
  appliedCount,
  skippedCount,
}) => {
  const isAppliedActive = currentTab === 'dashboard' && statusFilter === 'applied';
  const isSkippedActive = currentTab === 'dashboard' && statusFilter === 'not_applied';
  const isStatsActive = currentTab === 'statistics';

  return (
    <nav className="fixed bottom-0 inset-x-0 z-40 max-w-md mx-auto bg-[#0E1526]/95 backdrop-blur-xl border-t border-slate-800/90 px-3 py-1.5 flex md:hidden items-center justify-around shadow-2xl shadow-black/80 pb-safe">
      
      {/* Tab 1: Applied */}
      <button
        onClick={() => {
          onSelectTab('dashboard');
          onSelectStatusFilter('applied');
        }}
        className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-150 active:scale-95 ${
          isAppliedActive
            ? 'text-emerald-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <CheckCircle2 className={`w-5 h-5 ${isAppliedActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
          {appliedCount > 0 && (
            <span className="absolute -top-1 -right-2 px-1 text-[9px] font-bold rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 min-w-[14px] text-center leading-tight">
              {appliedCount}
            </span>
          )}
        </div>
        <span className="text-[10px] mt-1 leading-none tracking-tight">Applied</span>
      </button>

      {/* Tab 2: Skipped */}
      <button
        onClick={() => {
          onSelectTab('dashboard');
          onSelectStatusFilter('not_applied');
        }}
        className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-150 active:scale-95 ${
          isSkippedActive
            ? 'text-rose-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <div className="relative">
          <XCircle className={`w-5 h-5 ${isSkippedActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
          {skippedCount > 0 && (
            <span className="absolute -top-1 -right-2 px-1 text-[9px] font-bold rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 min-w-[14px] text-center leading-tight">
              {skippedCount}
            </span>
          )}
        </div>
        <span className="text-[10px] mt-1 leading-none tracking-tight">Skipped</span>
      </button>

      {/* Tab 3: Prominent Elevated + Add FAB */}
      <div className="flex-1 flex items-center justify-center">
        <button
          onClick={onOpenAddModal}
          className="w-12 h-12 -mt-5 rounded-full bg-gradient-to-tr from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-90 text-white shadow-xl shadow-indigo-600/40 border-[3px] border-[#0B0F19] flex items-center justify-center transition-transform"
          title="Add Company"
          aria-label="Add Company"
        >
          <Plus className="w-6 h-6 stroke-[2.5]" />
        </button>
      </div>

      {/* Tab 4: Statistics */}
      <button
        onClick={() => onSelectTab('statistics')}
        className={`flex-1 flex flex-col items-center justify-center py-1 rounded-xl transition-all duration-150 active:scale-95 ${
          isStatsActive
            ? 'text-purple-400 font-bold'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <BarChart3 className={`w-5 h-5 ${isStatsActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
        <span className="text-[10px] mt-1 leading-none tracking-tight">Stats</span>
      </button>

      {/* Tab 5: Data & Backup (Excel/CSV) */}
      <button
        onClick={onOpenImportExport}
        className="flex-1 flex flex-col items-center justify-center py-1 text-slate-400 hover:text-emerald-400 transition-all duration-150 active:scale-95"
        title="Backup / Excel"
      >
        <FileSpreadsheet className="w-5 h-5 stroke-2" />
        <span className="text-[10px] mt-1 leading-none tracking-tight">Data</span>
      </button>

    </nav>
  );
};
