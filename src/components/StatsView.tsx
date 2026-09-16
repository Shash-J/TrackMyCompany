import React from 'react';
import { 
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  History,
  PieChart as PieChartIcon
} from 'lucide-react';
import type { StatisticsData, Company } from '../types';
import { PieChart } from './PieChart';
import type { PieChartItem } from './PieChart';

interface StatsViewProps {
  stats: StatisticsData;
  companies: Company[];
}

export const StatsView: React.FC<StatsViewProps> = ({ stats, companies }) => {
  // Chronological order: order they were added (oldest first with arrival number 1, 2, 3...)
  const chronologicalCompanies = [...companies].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  // 1. Status Distribution Data (Applied vs Skipped)
  const statusChartItems: PieChartItem[] = [
    {
      label: 'Applied',
      value: stats.totalApplied,
      color: '#10B981', // Emerald
    },
    {
      label: 'Skipped',
      value: stats.totalNotApplied,
      color: '#F43F5E', // Rose
    },
  ];

  // 2. Tier Distribution Data
  const tierChartItems: PieChartItem[] = [
    {
      label: 'Open Dream (≥ 12 LPA)',
      value: stats.openDreamCount,
      color: '#A855F7', // Purple
    },
    {
      label: 'Dream (< 12 LPA)',
      value: stats.dreamCount,
      color: '#10B981', // Emerald
    },
    {
      label: 'Mass / Regular',
      value: stats.massCount,
      color: '#3B82F6', // Blue
    },
    {
      label: 'Internships & Off-Campus',
      value: stats.internCount + stats.offCampusCount,
      color: '#F59E0B', // Amber
    },
  ];

  // 3. Rejection Reasons Data
  const reasonColors: Record<string, string> = {
    'Low CTC': '#F43F5E',
    'Strict Bond / Service Agreement': '#F59E0B',
    'Location Not Preferred': '#06B6D4',
    'CGPA / Branch Ineligible': '#F97316',
    'Not Interested in Role': '#8B5CF6',
    'Focusing on Other Companies': '#EC4899',
    'PBC': '#3B82F6',
    'Other': '#64748B',
  };

  const rejectionChartItems: PieChartItem[] = stats.rejectionReasons.map((item) => ({
    label: item.tag,
    value: item.count,
    color: reasonColors[item.tag] || '#6366F1',
  }));

  // 4. OA Selection Breakdown Data (Applied companies: OA Selected vs Not Selected)
  const notSelectedCount = Math.max(0, stats.totalApplied - stats.oaShortlistedCount);
  const oaChartItems: PieChartItem[] = [
    {
      label: 'OA Selected',
      value: stats.oaShortlistedCount,
      color: '#10B981', // Emerald
    },
    {
      label: 'Not Selected',
      value: notSelectedCount,
      color: '#EF4444', // Red
    },
  ];

  // Collect all custom notes from skipped companies
  const allCustomNotes = stats.rejectionReasons.flatMap((r) => 
    r.customNotes.map((note) => ({ tag: r.tag, note }))
  );

  return (
    <div className="space-y-5 animate-fadeIn pb-6">
      
      {/* Top Banner with Core Placement Metrics */}
      <div className="bg-[#131B2E] border border-slate-800 p-4 sm:p-5 rounded-2xl shadow-lg shadow-black/20">
        <div className="flex flex-col gap-3">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 block mb-1">
              Campus Analytics & Records
            </span>
            <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-indigo-400" />
              <span>Placement Statistics</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Round visual breakdown of applications, tiers, rejection patterns, and records.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-2 pt-1">
            <div className="px-2.5 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
              <span className="block text-lg font-extrabold text-indigo-300 font-mono leading-tight">{stats.totalVisited}</span>
              <span className="text-[9px] uppercase font-semibold text-slate-400">Visited</span>
            </div>
            <div className="px-2.5 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <span className="block text-lg font-extrabold text-emerald-300 font-mono leading-tight">{stats.appliedPercentage}%</span>
              <span className="text-[9px] uppercase font-semibold text-slate-400">Applied</span>
            </div>
            <div className="px-2.5 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <span className="block text-lg font-extrabold text-amber-300 font-mono leading-tight">{stats.oaShortlistConversionRate}%</span>
              <span className="text-[9px] uppercase font-semibold text-slate-400">Shortlist</span>
            </div>
          </div>
        </div>
      </div>

      {/* ROUND PIE CHARTS */}
      <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-2 md:gap-5">
        
        {/* PIE 1: APPLICATION STATUS BREAKDOWN */}
        <PieChart
          title="Application Status Breakdown"
          items={statusChartItems}
          centerLabel={`${stats.totalVisited}`}
          centerSublabel="Total Cos."
          emptyMessage="No companies added yet"
        />

        {/* PIE 2: PLACEMENT TIER BREAKDOWN */}
        <PieChart
          title="Placement Compensation Tiers"
          items={tierChartItems}
          centerLabel={`${stats.totalVisited}`}
          centerSublabel="Tiers"
          emptyMessage="No compensation tiers recorded yet"
        />

        {/* PIE 3: MAJOR REASONS FOR SKIPPING COMPANIES */}
        <div className="space-y-2.5">
          <PieChart
            title="Major Reasons for Skipping / Not Applying"
            items={rejectionChartItems}
            centerLabel={`${stats.totalNotApplied}`}
            centerSublabel="Skipped"
            emptyMessage="No companies skipped yet"
          />

          {/* Student's Custom Rejection Notes */}
          {allCustomNotes.length > 0 && (
            <div className="p-3.5 bg-[#131B2E] border border-slate-800 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-300 block mb-2">
                Your Specific Reason Notes:
              </span>
              <div className="flex flex-col gap-1.5">
                {allCustomNotes.map((item, idx) => (
                  <div 
                    key={idx}
                    className="text-[11px] text-slate-300 bg-[#0B0F19] p-2 rounded-lg border border-slate-800 flex items-start gap-1.5"
                  >
                    <span className="text-rose-400 font-medium shrink-0">[{item.tag}]</span>
                    <span className="italic break-words">"{item.note}"</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PIE 4: OA SHORTLIST & EVALUATION FUNNEL */}
        <PieChart
          title="OA Selected Status (Applied Drives)"
          items={oaChartItems}
          centerLabel={`${stats.totalApplied}`}
          centerSublabel="Applied"
          emptyMessage="No applied companies yet"
        />

      </div>

      {/* SECTION: ALL COMPANIES (Mobile Chronological Feed) */}
      <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-lg shadow-black/20">
        <div className="flex items-center justify-between gap-2 pb-3.5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <History className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white leading-tight">
                All Companies
              </h3>
              <p className="text-[11px] text-slate-400">
                Placement record of all {chronologicalCompanies.length} companies in order of arrival
              </p>
            </div>
          </div>
          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {chronologicalCompanies.length} Cos
          </span>
        </div>

        {chronologicalCompanies.length === 0 ? (
          <div className="py-10 text-center text-slate-400">
            <Clock className="w-7 h-7 mx-auto text-slate-600 mb-2" />
            <p className="text-xs font-semibold text-white">No companies recorded yet</p>
            <p className="text-[11px] mt-0.5">
              Companies added from your WhatsApp announcements will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-3.5 space-y-2.5 md:space-y-0 md:grid md:grid-cols-2 md:gap-3">
            {chronologicalCompanies.map((company, index) => {
              const arrivalNum = index + 1;
              const dateAdded = new Date(company.createdAt).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              });

              return (
                <div 
                  key={company.id}
                  className="bg-[#0B0F19] border border-slate-800/90 rounded-xl p-3 flex flex-col gap-2 hover:border-slate-700 transition-colors"
                >
                  {/* Top Row: Arrival # + Status Pill */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-mono text-xs">
                      <span className="w-5 h-5 rounded-md bg-indigo-950/80 text-indigo-300 flex items-center justify-center font-bold text-[10px] border border-indigo-700/50">
                        #{arrivalNum}
                      </span>
                      <span className="text-[10px] text-slate-500 font-sans">{dateAdded}</span>
                    </div>

                    <div>
                      {company.status === 'applied' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          <CheckCircle2 className="w-3 h-3" />
                          Applied
                        </span>
                      ) : company.status === 'not_applied' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                          <XCircle className="w-3 h-3" />
                          {company.rejectionReasonTag || 'Skipped'}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400">
                          Undecided
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Company Name & Role */}
                  <div>
                    <h4 className="text-sm font-bold text-white leading-tight">
                      {company.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 italic mt-0.5">
                      {company.role || 'Software Engineer'}
                    </p>
                  </div>

                  {/* Badges: Tier, CTC, OA Date */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-800/60 text-[10px]">
                    {company.tier === 'OPEN_DREAM' ? (
                      <span className="px-2 py-0.5 rounded-full font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                        Open Dream
                      </span>
                    ) : company.tier === 'DREAM' ? (
                      <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                        Dream
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                        {company.tier}
                      </span>
                    )}

                    <span className="px-2 py-0.5 rounded-full font-mono font-bold text-indigo-200 bg-indigo-950/60 border border-indigo-700/40">
                      💰 {company.ctc || 'N/A'}
                    </span>

                    {company.oaDate && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full font-mono bg-slate-800 text-amber-300 border border-slate-700">
                        <Calendar className="w-2.5 h-2.5 text-amber-400" />
                        Drive: {new Date(company.oaDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    )}

                    {company.oaStatus === 'shortlisted' && (
                      <span className="px-2 py-0.5 rounded-full font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                        ✨ Shortlisted
                      </span>
                    )}
                  </div>

                  {/* Notes / Reason note */}
                  {company.customReasonNote && (
                    <p className="text-[10px] text-slate-400 bg-[#131B2E] p-2 rounded-lg border border-slate-800/80 italic">
                      "{company.customReasonNote}"
                    </p>
                  )}
                  {company.notes && (
                    <p className="text-[10px] text-slate-400 bg-[#131B2E] p-2 rounded-lg border border-slate-800/80">
                      {company.notes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};
