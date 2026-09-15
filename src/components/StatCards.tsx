import React from 'react';
import { Building2, Send, XCircle, Award, Target } from 'lucide-react';
import type { StatisticsData } from '../types';

interface StatCardsProps {
  stats: StatisticsData;
  onFilterClick?: (filterType: 'all' | 'applied' | 'not_applied' | 'shortlisted') => void;
}

export const StatCards: React.FC<StatCardsProps> = ({ stats, onFilterClick }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 mb-8">
      {/* 1. Total Visited */}
      <div 
        onClick={() => onFilterClick?.('all')}
        className="bg-[#131B2E] p-4 rounded-2xl border border-slate-800 hover:border-indigo-500/40 cursor-pointer transition-all card-glow"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Total Visited
          </span>
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Building2 className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {stats.totalVisited}
          </span>
          <span className="text-xs text-slate-400 font-normal">companies</span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
          <span>Campus drives posted</span>
        </div>
      </div>

      {/* 2. Applied */}
      <div 
        onClick={() => onFilterClick?.('applied')}
        className="bg-[#131B2E] p-4 rounded-2xl border border-slate-800 hover:border-emerald-500/40 cursor-pointer transition-all card-glow"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400">
            Applied
          </span>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Send className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {stats.totalApplied}
          </span>
          <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            {stats.appliedPercentage}%
          </span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
          <span>Forms submitted</span>
        </div>
      </div>

      {/* 3. Not Applied */}
      <div 
        onClick={() => onFilterClick?.('not_applied')}
        className="bg-[#131B2E] p-4 rounded-2xl border border-slate-800 hover:border-rose-500/40 cursor-pointer transition-all card-glow"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-rose-400">
            Not Applied
          </span>
          <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {stats.totalNotApplied}
          </span>
          <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30">
            {stats.notAppliedPercentage}%
          </span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-400"></span>
          <span>Skipped with reasons</span>
        </div>
      </div>

      {/* 4. OA Shortlisted */}
      <div 
        onClick={() => onFilterClick?.('shortlisted')}
        className="bg-[#131B2E] p-4 rounded-2xl border border-slate-800 hover:border-amber-500/40 cursor-pointer transition-all card-glow"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400">
            OA Shortlist
          </span>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Award className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            {stats.oaShortlistedCount}
          </span>
          <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
            {stats.oaShortlistConversionRate}%
          </span>
        </div>
        <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1.5">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-400"></span>
          <span>Eligible for online test</span>
        </div>
      </div>

      {/* 5. Dream / Open Dream Breakdown */}
      <div className="col-span-2 md:col-span-4 lg:col-span-1 bg-[#131B2E] p-4 rounded-2xl border border-slate-800 hover:border-purple-500/40 transition-all card-glow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-purple-400">
            Tiers Breakdown
          </span>
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Target className="w-4 h-4" />
          </div>
        </div>
        <div className="space-y-1.5 mt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-indigo-300 font-medium">Open Dream (≥12 LPA)</span>
            <span className="font-bold text-white">{stats.openDreamCount}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-emerald-300 font-medium">Dream (&lt;12 LPA)</span>
            <span className="font-bold text-white">{stats.dreamCount}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-blue-300 font-medium">Mass / Others</span>
            <span className="font-bold text-white">{stats.massCount + stats.internCount + stats.offCampusCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
