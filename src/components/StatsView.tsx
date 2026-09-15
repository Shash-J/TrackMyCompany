import React from 'react';
import { 
  TrendingUp, 
  XCircle, 
  Award, 
  Send, 
  PieChart, 
  Layers, 
  CheckCircle2
} from 'lucide-react';
import type { StatisticsData, Company } from '../types';

interface StatsViewProps {
  stats: StatisticsData;
  companies: Company[];
  onNavigateToTab?: (tab: any) => void;
}

export const StatsView: React.FC<StatsViewProps> = ({ stats }) => {
  return (
    <div className="space-y-8 animate-fadeIn">
      
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#131B2E] border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-bold tracking-wider text-indigo-400">Campus Recruitment Analytics</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Placement Drive Insights & Statistics
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time conversion metrics, tier distribution, and rejection pattern analysis.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
            <span className="block text-2xl font-bold text-indigo-300">{stats.totalVisited}</span>
            <span className="text-[10px] uppercase font-semibold text-slate-400">Companies Visited</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
            <span className="block text-2xl font-bold text-emerald-300">{stats.appliedPercentage}%</span>
            <span className="text-[10px] uppercase font-semibold text-slate-400">Application Rate</span>
          </div>
        </div>
      </div>

      {/* Grid: Placement Conversion Funnel & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Placement Conversion Funnel */}
        <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-6 shadow-lg shadow-black/20 card-glow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                <TrendingUp className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Application to OA Funnel</h3>
                <p className="text-xs text-slate-400">From visiting campus to writing the test</p>
              </div>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {/* Step 1: Companies Visited */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  1. Total Companies Visited
                </span>
                <span className="text-white font-bold">{stats.totalVisited} (100%)</span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: '100%' }} />
              </div>
            </div>

            {/* Step 2: Form Submitted / Applied */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Send className="w-3.5 h-3.5 text-emerald-400" />
                  2. Forms Submitted (Applied)
                </span>
                <span className="text-emerald-300 font-bold">
                  {stats.totalApplied} ({stats.appliedPercentage}%)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-emerald-500 rounded-full transition-all duration-500" 
                  style={{ width: `${stats.appliedPercentage}%` }} 
                />
              </div>
            </div>

            {/* Step 3: OA Shortlisted */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  3. Shortlisted to Write OA
                </span>
                <span className="text-amber-300 font-bold">
                  {stats.oaShortlistedCount} ({stats.oaShortlistConversionRate}% of applied)
                </span>
              </div>
              <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-amber-500 rounded-full transition-all duration-500" 
                  style={{ width: `${stats.totalVisited > 0 ? Math.round((stats.oaShortlistedCount / stats.totalVisited) * 100) : 0}%` }} 
                />
              </div>
            </div>

            {/* Conversion Stat Note */}
            <div className="mt-4 p-3 rounded-xl bg-[#0B0F19] border border-slate-800 text-xs flex items-center justify-between text-slate-400">
              <span>Shortlist Success Rate (Shortlisted / Applied):</span>
              <span className="font-bold text-amber-400 font-mono text-sm">
                {stats.oaShortlistConversionRate}%
              </span>
            </div>
          </div>
        </div>

        {/* Category / Tier Breakdown */}
        <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-6 shadow-lg shadow-black/20 card-glow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <PieChart className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Tier Distribution</h3>
                <p className="text-xs text-slate-400">Breakdown of companies by CTC bracket</p>
              </div>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            
            <div className="p-3 rounded-xl bg-[#0B0F19] border border-purple-900/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-purple-500" />
                <div>
                  <span className="text-xs font-bold text-white block">Open Dream (≥ 12 LPA)</span>
                  <span className="text-[10px] text-slate-400">High compensation & product firms</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-bold text-purple-300 font-mono">{stats.openDreamCount}</span>
                <span className="text-[11px] text-slate-400 block">
                  {stats.totalVisited > 0 ? Math.round((stats.openDreamCount / stats.totalVisited) * 100) : 0}%
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0B0F19] border border-emerald-900/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500" />
                <div>
                  <span className="text-xs font-bold text-white block">Dream (&lt; 12 LPA)</span>
                  <span className="text-[10px] text-slate-400">Standard core & product opportunities</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-bold text-emerald-300 font-mono">{stats.dreamCount}</span>
                <span className="text-[11px] text-slate-400 block">
                  {stats.totalVisited > 0 ? Math.round((stats.dreamCount / stats.totalVisited) * 100) : 0}%
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0B0F19] border border-blue-900/30 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-blue-500" />
                <div>
                  <span className="text-xs font-bold text-white block">Mass / Regular Recruiters</span>
                  <span className="text-[10px] text-slate-400">Large intake recruitment drives</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-bold text-blue-300 font-mono">{stats.massCount}</span>
                <span className="text-[11px] text-slate-400 block">
                  {stats.totalVisited > 0 ? Math.round((stats.massCount / stats.totalVisited) * 100) : 0}%
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-3 h-3 rounded-full bg-amber-500" />
                <div>
                  <span className="text-xs font-bold text-white block">Internships & Off-Campus</span>
                  <span className="text-[10px] text-slate-400">Summer internships or off-campus</span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-base font-bold text-amber-300 font-mono">
                  {stats.internCount + stats.offCampusCount}
                </span>
                <span className="text-[11px] text-slate-400 block">
                  {stats.totalVisited > 0 ? Math.round(((stats.internCount + stats.offCampusCount) / stats.totalVisited) * 100) : 0}%
                </span>
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* MAJOR REASONS FOR REJECTING / SKIPPING COMPANIES */}
      <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-6 shadow-lg shadow-black/20 card-glow">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <XCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Major Reasons for Skipping / Not Applying
              </h3>
              <p className="text-xs text-slate-400">
                Aggregated statistics based on your rejection reason tags and custom notes
              </p>
            </div>
          </div>

          <div className="text-xs font-semibold px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 self-start sm:self-auto">
            {stats.totalNotApplied} Companies Skipped ({stats.notAppliedPercentage}%)
          </div>
        </div>

        {/* Rejection Reasons List & Distribution */}
        {stats.rejectionReasons.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400/60 mb-2" />
            <p className="text-sm font-semibold text-white">No companies skipped yet</p>
            <p className="text-xs mt-1">
              When you choose not to apply to a company and tag reasons (like Low CTC or Bond), the breakdown will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-5 pt-5">
            {stats.rejectionReasons.map((item, idx) => (
              <div key={item.tag} className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-mono text-[10px] text-slate-400 font-bold">
                      {idx + 1}
                    </span>
                    <span className="font-bold text-white text-sm">
                      {item.tag}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-rose-300">
                      {item.count} {item.count === 1 ? 'company' : 'companies'}
                    </span>
                    <span className="text-[11px] px-2 py-0.5 rounded-full bg-rose-950/60 text-rose-300 border border-rose-800/60 font-semibold font-mono">
                      {item.percentage}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>

                {/* Custom Notes / Descriptions under this Tag (especially for 'Other' or extra details) */}
                {item.customNotes.length > 0 && (
                  <div className="mt-2 pl-7 flex flex-wrap gap-1.5">
                    {item.customNotes.map((note, noteIdx) => (
                      <span 
                        key={noteIdx}
                        className="text-[11px] text-slate-300 bg-[#0B0F19] px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1 italic"
                      >
                        "{note}"
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
