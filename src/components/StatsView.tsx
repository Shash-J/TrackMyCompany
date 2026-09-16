import React from 'react';
import { 
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Calendar,
  History,
  Tag,
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

  // 1. Status Distribution Data
  const statusChartItems: PieChartItem[] = [
    {
      label: 'Applied',
      value: stats.totalApplied,
      color: '#10B981', // Emerald
    },
    {
      label: 'Skipped / Not Applied',
      value: stats.totalNotApplied,
      color: '#F43F5E', // Rose
    },
    {
      label: 'Undecided',
      value: stats.totalUndecided,
      color: '#64748B', // Slate
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

  // 4. OA Conversion Breakdown Data (Applied companies)
  const oaChartItems: PieChartItem[] = [
    {
      label: 'Shortlisted',
      value: stats.oaShortlistedCount,
      color: '#10B981', // Emerald
    },
    {
      label: 'Under Review / Pending',
      value: stats.oaPendingCount,
      color: '#F59E0B', // Amber
    },
    {
      label: 'Not Shortlisted',
      value: stats.oaNotShortlistedCount,
      color: '#EF4444', // Red
    },
  ];

  // Collect all custom notes from skipped companies
  const allCustomNotes = stats.rejectionReasons.flatMap((r) => 
    r.customNotes.map((note) => ({ tag: r.tag, note }))
  );

  return (
    <div className="space-y-8 animate-fadeIn pb-8">
      
      {/* Top Banner with Core Placement Metrics */}
      <div className="bg-[#131B2E] border border-slate-800 p-6 rounded-2xl shadow-lg shadow-black/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[11px] uppercase font-bold tracking-wider text-indigo-400">
                Campus Analytics & Records
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <PieChartIcon className="w-5 h-5 text-indigo-400" />
              <span>Placement Statistics & Charts</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Round visual breakdown of applications, tiers, rejection patterns, and chronological records.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
              <span className="block text-xl font-extrabold text-indigo-300 font-mono">{stats.totalVisited}</span>
              <span className="text-[10px] uppercase font-semibold text-slate-400">Visited</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <span className="block text-xl font-extrabold text-emerald-300 font-mono">{stats.appliedPercentage}%</span>
              <span className="text-[10px] uppercase font-semibold text-slate-400">Applied</span>
            </div>
            <div className="px-4 py-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <span className="block text-xl font-extrabold text-amber-300 font-mono">{stats.oaShortlistConversionRate}%</span>
              <span className="text-[10px] uppercase font-semibold text-slate-400">Shortlisted</span>
            </div>
          </div>
        </div>

        {/* 4 Mini Summary Metric Chips */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80">
          <div className="p-3 bg-[#0B0F19] rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Total Drives</span>
            <span className="text-base font-bold text-white font-mono">{stats.totalVisited}</span>
          </div>
          <div className="p-3 bg-[#0B0F19] rounded-xl border border-slate-800">
            <span className="text-[10px] text-emerald-400 uppercase font-semibold block">Forms Submitted</span>
            <span className="text-base font-bold text-emerald-300 font-mono">{stats.totalApplied} ({stats.appliedPercentage}%)</span>
          </div>
          <div className="p-3 bg-[#0B0F19] rounded-xl border border-slate-800">
            <span className="text-[10px] text-rose-400 uppercase font-semibold block">Skipped / Passed</span>
            <span className="text-base font-bold text-rose-300 font-mono">{stats.totalNotApplied} ({stats.notAppliedPercentage}%)</span>
          </div>
          <div className="p-3 bg-[#0B0F19] rounded-xl border border-slate-800">
            <span className="text-[10px] text-amber-400 uppercase font-semibold block">Shortlisted for OA</span>
            <span className="text-base font-bold text-amber-300 font-mono">{stats.oaShortlistedCount}</span>
          </div>
        </div>
      </div>

      {/* ROUND PIE CHARTS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
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
        <div className="space-y-3">
          <PieChart
            title="Major Reasons for Skipping / Not Applying"
            items={rejectionChartItems}
            centerLabel={`${stats.totalNotApplied}`}
            centerSublabel="Skipped"
            emptyMessage="No companies skipped yet"
          />

          {/* Student's Custom Rejection Notes */}
          {allCustomNotes.length > 0 && (
            <div className="p-4 bg-[#131B2E] border border-slate-800 rounded-xl">
              <span className="text-xs font-semibold text-slate-300 block mb-2">
                Your Specific Reason Notes:
              </span>
              <div className="flex flex-wrap gap-2">
                {allCustomNotes.map((item, idx) => (
                  <span 
                    key={idx}
                    className="text-[11px] text-slate-300 bg-[#0B0F19] px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1.5"
                  >
                    <span className="text-rose-400 font-medium">[{item.tag}]</span>
                    <span className="italic">"{item.note}"</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PIE 4: OA SHORTLIST & EVALUATION FUNNEL */}
        <PieChart
          title="OA Shortlist Status (Applied Drives)"
          items={oaChartItems}
          centerLabel={`${stats.totalApplied}`}
          centerSublabel="Applied"
          emptyMessage="No applied companies yet"
        />

      </div>

      {/* SECTION: ALL COMPANIES */}
      <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-6 shadow-lg shadow-black/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                All Companies
              </h3>
              <p className="text-xs text-slate-400">
                Placement record of all {chronologicalCompanies.length} companies in order of arrival
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            All Companies
          </span>
        </div>

        {chronologicalCompanies.length === 0 ? (
          <div className="py-12 text-center text-slate-400">
            <Clock className="w-8 h-8 mx-auto text-slate-600 mb-2" />
            <p className="text-sm font-semibold text-white">No companies recorded yet</p>
            <p className="text-xs mt-0.5">
              Companies added from your WhatsApp announcements will appear here in chronological arrival order.
            </p>
          </div>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] font-semibold">
                  <th className="py-3 px-3"># Arrival</th>
                  <th className="py-3 px-3">Company Name</th>
                  <th className="py-3 px-3">Role / Profile</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">CTC</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Drive / Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {chronologicalCompanies.map((company, index) => {
                  const arrivalNum = index + 1;
                  const dateAdded = new Date(company.createdAt).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  });

                  return (
                    <tr key={company.id} className="hover:bg-[#0B0F19]/50 transition-colors">
                      {/* Arrival # */}
                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5 font-mono">
                          <span className="w-6 h-6 rounded-lg bg-slate-800 text-indigo-300 flex items-center justify-center font-bold text-xs border border-slate-700">
                            {arrivalNum}
                          </span>
                          <span className="text-[10px] text-slate-500">{dateAdded}</span>
                        </div>
                      </td>

                      {/* Company Name */}
                      <td className="py-3.5 px-3 font-bold text-white text-sm">
                        <div className="flex items-center gap-1.5">
                          <span>{company.name}</span>
                          {company.formLink && (
                            <a
                              href={company.formLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-500 hover:text-indigo-400"
                              title="Open application link"
                            >
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-3 text-slate-300">
                        {company.role || 'Software Engineer'}
                      </td>

                      {/* Tier */}
                      <td className="py-3.5 px-3">
                        {company.tier === 'OPEN_DREAM' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                            Open Dream
                          </span>
                        ) : company.tier === 'DREAM' ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            Dream
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-500/15 text-blue-300 border border-blue-500/30">
                            {company.tier}
                          </span>
                        )}
                      </td>

                      {/* CTC */}
                      <td className="py-3.5 px-3 font-mono font-semibold text-indigo-200">
                        {company.ctc || 'N/A'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-3">
                        {company.status === 'applied' ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                              <CheckCircle2 className="w-3 h-3" />
                              Applied
                            </span>
                            {company.oaStatus === 'shortlisted' && (
                              <span className="block text-[10px] text-amber-300 font-semibold">
                                ★ Shortlisted for OA
                              </span>
                            )}
                          </div>
                        ) : company.status === 'not_applied' ? (
                          <div className="space-y-1">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                              <XCircle className="w-3 h-3" />
                              Skipped
                            </span>
                            {company.rejectionReasonTag && (
                              <span className="block text-[10px] text-slate-400 flex items-center gap-1">
                                <Tag className="w-2.5 h-2.5 text-rose-400" />
                                {company.rejectionReasonTag}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-800 text-slate-400">
                            Undecided
                          </span>
                        )}
                      </td>

                      {/* OA Date or Reason note */}
                      <td className="py-3.5 px-3 text-slate-400 text-[11px]">
                        {company.status === 'applied' && company.oaDate ? (
                          <span className="inline-flex items-center gap-1 bg-[#0B0F19] px-2 py-1 rounded-md border border-slate-800 font-mono text-slate-300">
                            <Calendar className="w-3 h-3 text-amber-400" />
                            OA: {new Date(company.oaDate).toLocaleDateString()}
                          </span>
                        ) : company.status === 'not_applied' && company.customReasonNote ? (
                          <span className="italic text-slate-400 line-clamp-1">
                            "{company.customReasonNote}"
                          </span>
                        ) : (
                          <span className="text-slate-600">—</span>
                        )}
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
};
