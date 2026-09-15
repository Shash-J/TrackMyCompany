import React from 'react';
import { 
  TrendingUp, 
  XCircle, 
  Award, 
  Send, 
  PieChart, 
  Layers, 
  CheckCircle2,
  Clock,
  ExternalLink,
  Calendar,
  History,
  Tag
} from 'lucide-react';
import type { StatisticsData, Company } from '../types';

interface StatsViewProps {
  stats: StatisticsData;
  companies: Company[];
}

export const StatsView: React.FC<StatsViewProps> = ({ stats, companies }) => {
  // Chronological order: order they were added (oldest first or newest first with arrival number)
  // Let's sort oldest first to reflect arrival order 1, 2, 3...
  const chronologicalCompanies = [...companies].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  return (
    <div className="space-y-8 animate-fadeIn pb-8">
      
      {/* Top Banner with Core Metrics */}
      <div className="bg-[#131B2E] border border-slate-800 p-6 rounded-2xl shadow-lg shadow-black/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase font-bold tracking-wider text-indigo-400">Campus Analytics & Records</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Placement Statistics & History
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
              Comprehensive conversion funnel, rejection reasons distribution, and arrival records.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-center">
              <span className="block text-2xl font-extrabold text-indigo-300 font-mono">{stats.totalVisited}</span>
              <span className="text-[10px] uppercase font-semibold text-slate-400">Total Visited</span>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-center">
              <span className="block text-2xl font-extrabold text-emerald-300 font-mono">{stats.appliedPercentage}%</span>
              <span className="text-[10px] uppercase font-semibold text-slate-400">Applied Rate</span>
            </div>
            <div className="px-4 py-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center">
              <span className="block text-2xl font-extrabold text-amber-300 font-mono">{stats.oaShortlistConversionRate}%</span>
              <span className="text-[10px] uppercase font-semibold text-slate-400">OA Shortlist Rate</span>
            </div>
          </div>
        </div>

        {/* 4 Overview Mini-Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-slate-800/80">
          <div className="p-3 bg-[#0B0F19] rounded-xl border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold block">Companies Arrived</span>
            <span className="text-lg font-bold text-white font-mono">{stats.totalVisited}</span>
          </div>
          <div className="p-3 bg-[#0B0F19] rounded-xl border border-slate-800">
            <span className="text-[10px] text-emerald-400 uppercase font-semibold block">Forms Submitted</span>
            <span className="text-lg font-bold text-emerald-300 font-mono">{stats.totalApplied} ({stats.appliedPercentage}%)</span>
          </div>
          <div className="p-3 bg-[#0B0F19] rounded-xl border border-slate-800">
            <span className="text-[10px] text-rose-400 uppercase font-semibold block">Skipped / Rejected</span>
            <span className="text-lg font-bold text-rose-300 font-mono">{stats.totalNotApplied} ({stats.notAppliedPercentage}%)</span>
          </div>
          <div className="p-3 bg-[#0B0F19] rounded-xl border border-slate-800">
            <span className="text-[10px] text-amber-400 uppercase font-semibold block">OA Shortlisted</span>
            <span className="text-lg font-bold text-amber-300 font-mono">{stats.oaShortlistedCount}</span>
          </div>
        </div>
      </div>

      {/* Grid: Conversion Funnel & Tier Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Placement Conversion Funnel */}
        <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-6 shadow-lg shadow-black/20">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <TrendingUp className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Application to OA Funnel</h3>
              <p className="text-xs text-slate-400">Campus drives conversion pipeline</p>
            </div>
          </div>

          <div className="space-y-4 pt-2">
            {/* Step 1 */}
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-300 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-400" />
                  1. Total Companies Visited
                </span>
                <span className="text-white font-bold">{stats.totalVisited} (100%)</span>
              </div>
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div className="h-full bg-indigo-600 rounded-full" style={{ width: '100%' }} />
              </div>
            </div>

            {/* Step 2 */}
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
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-emerald-500 rounded-full" 
                  style={{ width: `${stats.appliedPercentage}%` }} 
                />
              </div>
            </div>

            {/* Step 3 */}
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
              <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                <div 
                  className="h-full bg-amber-500 rounded-full" 
                  style={{ width: `${stats.totalVisited > 0 ? Math.round((stats.oaShortlistedCount / stats.totalVisited) * 100) : 0}%` }} 
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tier Distribution */}
        <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-6 shadow-lg shadow-black/20">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <PieChart className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Tier Breakdown</h3>
              <p className="text-xs text-slate-400">Companies by compensation tier</p>
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <div className="p-2.5 rounded-xl bg-[#0B0F19] border border-purple-900/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-purple-500" />
                <span className="text-xs font-semibold text-white">Open Dream (≥ 12 LPA)</span>
              </div>
              <span className="text-xs font-bold text-purple-300 font-mono">{stats.openDreamCount} companies</span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#0B0F19] border border-emerald-900/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <span className="text-xs font-semibold text-white">Dream (&lt; 12 LPA)</span>
              </div>
              <span className="text-xs font-bold text-emerald-300 font-mono">{stats.dreamCount} companies</span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#0B0F19] border border-blue-900/30 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <span className="text-xs font-semibold text-white">Mass / Regular</span>
              </div>
              <span className="text-xs font-bold text-blue-300 font-mono">{stats.massCount} companies</span>
            </div>

            <div className="p-2.5 rounded-xl bg-[#0B0F19] border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-xs font-semibold text-white">Internships & Off-Campus</span>
              </div>
              <span className="text-xs font-bold text-amber-300 font-mono">{stats.internCount + stats.offCampusCount} companies</span>
            </div>
          </div>
        </div>

      </div>

      {/* MAJOR REASONS FOR REJECTING / SKIPPING COMPANIES */}
      <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-6 shadow-lg shadow-black/20">
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
                Aggregated distribution of rejection reason tags and custom notes
              </p>
            </div>
          </div>

          <div className="text-xs font-semibold px-3 py-1 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 self-start sm:self-auto">
            {stats.totalNotApplied} Companies Skipped ({stats.notAppliedPercentage}%)
          </div>
        </div>

        {stats.rejectionReasons.length === 0 ? (
          <div className="py-10 text-center text-slate-400">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-400/60 mb-2" />
            <p className="text-sm font-semibold text-white">No companies skipped yet</p>
            <p className="text-xs mt-0.5">
              When you choose not to apply to a company and tag reasons (like Low CTC or Bond), the breakdown will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4 pt-5">
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

                <div className="w-full h-2.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
                  <div 
                    className="h-full bg-gradient-to-r from-rose-500 to-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>

                {item.customNotes.length > 0 && (
                  <div className="mt-1 pl-7 flex flex-wrap gap-1.5">
                    {item.customNotes.map((note, noteIdx) => (
                      <span 
                        key={noteIdx}
                        className="text-[11px] text-slate-300 bg-[#0B0F19] px-2.5 py-1 rounded-lg border border-slate-800 italic"
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

      {/* NEW SECTION: COMPANIES IN ORDER OF ARRIVAL / ENTRY */}
      <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-6 shadow-lg shadow-black/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <History className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white">
                Companies in Order of Arrival / Entry
              </h3>
              <p className="text-xs text-slate-400">
                Chronological placement record of all {chronologicalCompanies.length} companies as they arrived on campus
              </p>
            </div>
          </div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            Chronological Log
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
