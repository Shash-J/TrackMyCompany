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

  // 3. Extracted Keywords & Reason Topics for Skipped Companies
  const skippedCompanies = companies.filter((c) => c.status === 'not_applied');
  const totalSkipped = skippedCompanies.length;

  const KEYWORD_TOPICS = [
    {
      id: 'ctc',
      label: 'CTC / Package',
      color: '#F43F5E',
      keywords: ['ctc', 'pay', 'salary', 'package', 'stipend', 'lpa', 'compensation', 'money'],
      tags: ['Low CTC'],
    },
    {
      id: 'pbc',
      label: 'PBC / Product Focus',
      color: '#3B82F6',
      keywords: ['pbc', 'product', 'faang', 'startup', 'product-based'],
      tags: ['PBC'],
    },
    {
      id: 'bond',
      label: 'Service Agreement / Bond',
      color: '#F59E0B',
      keywords: ['bond', 'agreement', 'service', 'lock-in', 'penalty'],
      tags: ['Strict Bond / Service Agreement'],
    },
    {
      id: 'location',
      label: 'Location / Relocation',
      color: '#06B6D4',
      keywords: ['location', 'relocation', 'bangalore', 'hyderabad', 'pune', 'remote', 'city'],
      tags: ['Location Not Preferred'],
    },
    {
      id: 'role',
      label: 'Role / Tech Mismatch',
      color: '#8B5CF6',
      keywords: ['role', 'tech', 'stack', 'developer', 'qa', 'support', 'profile'],
      tags: ['Not Interested in Role'],
    },
    {
      id: 'criteria',
      label: 'CGPA / Branch Eligibility',
      color: '#F97316',
      keywords: ['cgpa', 'branch', 'criteria', 'eligibility', 'cutoff', 'percentage', 'ineligible'],
      tags: ['CGPA / Branch Ineligible'],
    },
    {
      id: 'focus',
      label: 'Other Opportunities',
      color: '#EC4899',
      keywords: ['focus', 'other companies', 'gate', 'cat', 'higher studies', 'off-campus'],
      tags: ['Focusing on Other Companies'],
    },
    {
      id: 'other',
      label: 'Other Reasons',
      color: '#64748B',
      keywords: ['other', 'personal', 'prep', 'preparation'],
      tags: ['Other'],
    },
  ];

  // Extract topic frequencies across skipped companies
  const topicCounts: Record<string, number> = {};
  KEYWORD_TOPICS.forEach((t) => {
    topicCounts[t.id] = 0;
  });

  skippedCompanies.forEach((company) => {
    const tags = company.rejectionReasonTags?.length
      ? company.rejectionReasonTags
      : company.rejectionReasonTag
      ? [company.rejectionReasonTag]
      : [];
    const noteText = `${company.customReasonNote || ''} ${company.notes || ''}`.toLowerCase();

    let matchedAny = false;
    KEYWORD_TOPICS.forEach((topic) => {
      const tagMatch = tags.some((tag) => topic.tags.includes(tag));
      const keywordMatch = topic.keywords.some((kw) => noteText.includes(kw));
      if (tagMatch || keywordMatch) {
        topicCounts[topic.id] = (topicCounts[topic.id] || 0) + 1;
        matchedAny = true;
      }
    });

    if (!matchedAny) {
      topicCounts['other'] = (topicCounts['other'] || 0) + 1;
    }
  });

  const keywordPieItems: PieChartItem[] = KEYWORD_TOPICS
    .filter((t) => topicCounts[t.id] > 0)
    .map((t) => ({
      label: t.label,
      value: topicCounts[t.id],
      color: t.color,
    }));

  // Line-by-line topic breakdown showing percentage
  const topicStats = KEYWORD_TOPICS
    .filter((t) => topicCounts[t.id] > 0)
    .map((t) => {
      const count = topicCounts[t.id];
      const pct = totalSkipped > 0 ? ((count / totalSkipped) * 100).toFixed(0) : '0';
      return {
        ...t,
        count,
        percentage: pct,
      };
    })
    .sort((a, b) => b.count - a.count);

  // Line-by-line specific custom reason notes
  const specificNotes = skippedCompanies
    .filter((c) => !!c.customReasonNote?.trim())
    .map((c) => {
      const tags = c.rejectionReasonTags?.length
        ? c.rejectionReasonTags
        : c.rejectionReasonTag
        ? [c.rejectionReasonTag]
        : [];
      return {
        id: c.id,
        companyName: c.name,
        tags,
        note: c.customReasonNote!.trim(),
      };
    });

  // 4. OA Selection Breakdown Data (Applied companies: Writing OA vs Not Shortlisted for OA)
  const oaChartItems: PieChartItem[] = [
    {
      label: 'Writing OA',
      value: stats.oaShortlistedCount,
      color: '#10B981', // Emerald
    },
    {
      label: 'Not Shortlisted for OA',
      value: stats.oaNotShortlistedCount,
      color: '#F43F5E', // Rose
    },
  ];

  // 5. Reasons for Not Shortlisted for OA
  const OA_TAG_COLORS: Record<string, string> = {
    'CGPA': '#F97316',            // Orange
    'Resume': '#3B82F6',          // Blue
    'Random / Unknown': '#A855F7',// Purple
    'Other': '#64748B',           // Slate
  };

  const oaReasonPieItems: PieChartItem[] = (stats.oaRejectionReasons || []).map((r) => ({
    label: r.tag,
    value: r.count,
    color: OA_TAG_COLORS[r.tag] || '#64748B',
  }));

  const oaTopicStats = (stats.oaRejectionReasons || []).map((r) => ({
    ...r,
    color: OA_TAG_COLORS[r.tag] || '#64748B',
  }));

  const specificOANotes = companies
    .filter((c) => c.status === 'applied' && c.oaStatus === 'not_shortlisted' && !!c.oaCustomReasonNote?.trim())
    .map((c) => ({
      id: c.id,
      companyName: c.name,
      tags: c.oaRejectionReasonTags?.length
        ? c.oaRejectionReasonTags
        : (c.oaRejectionReasonTag ? [c.oaRejectionReasonTag] : ['Other']),
      note: c.oaCustomReasonNote!.trim(),
    }));

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
              <span>Your placement stats</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              analyse and improve your chances of getting placed
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

        {/* PIE 3: EXTRACTED REASONS & KEYWORDS BREAKDOWN */}
        <div className="space-y-3">
          <PieChart
            title="Reasons & Extracted Keywords Breakdown"
            items={keywordPieItems}
            centerLabel={`${stats.totalNotApplied}`}
            centerSublabel="Skipped"
            emptyMessage="No companies skipped yet"
          />

          {/* Line-by-Line Topic Percentage Stats */}
          {topicStats.length > 0 && (
            <div className="p-3.5 bg-[#131B2E] border border-slate-800 rounded-xl space-y-2">
              <span className="text-[11px] font-semibold text-slate-300 block">
                Reasons Breakdown (Line-by-Line %):
              </span>
              <div className="space-y-2">
                {topicStats.map((topic) => (
                  <div key={topic.id} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-300 font-medium flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full inline-block shrink-0"
                          style={{ backgroundColor: topic.color }}
                        />
                        <span>{topic.label}</span>
                      </span>
                      <span className="font-mono text-slate-400 font-semibold">
                        {topic.count} {topic.count === 1 ? 'co' : 'cos'} • {topic.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-[#0B0F19] h-1.5 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${topic.percentage}%`,
                          backgroundColor: topic.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Student's Specific Reason Notes */}
          {specificNotes.length > 0 && (
            <div className="p-3.5 bg-[#131B2E] border border-slate-800 rounded-xl">
              <span className="text-[11px] font-semibold text-slate-300 block mb-2">
                Your Specific Reason Notes:
              </span>
              <div className="flex flex-col gap-1.5">
                {specificNotes.map((item) => (
                  <div
                    key={item.id}
                    className="text-[11px] text-slate-300 bg-[#0B0F19] p-2 rounded-lg border border-slate-800 flex flex-col gap-1"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-bold text-white text-xs">{item.companyName}</span>
                      <div className="flex flex-wrap gap-1">
                        {item.tags.map((t) => (
                          <span key={t} className="text-[9px] font-medium text-rose-300 px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                            {t}
                          </span>
                        ))}
                      </div>
                    </div>
                    <span className="italic text-slate-300 break-words">"{item.note}"</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* PIE 4 & 5: OA STATUS & REASONS FOR NOT SHORTLISTED */}
        <div className="space-y-3">
          <PieChart
            title="OA Shortlist Status (Applied Drives)"
            items={oaChartItems}
            centerLabel={`${stats.totalApplied}`}
            centerSublabel="Applied"
            emptyMessage="No applied companies yet"
          />

          {/* PIE 5: REASONS FOR NOT BEING SHORTLISTED FOR OA */}
          {stats.oaNotShortlistedCount > 0 && (
            <div className="space-y-3 animate-fadeIn">
              <PieChart
                title="Reasons for Not Shortlisted for OA"
                items={oaReasonPieItems}
                centerLabel={`${stats.oaNotShortlistedCount}`}
                centerSublabel="Filtered Out"
                emptyMessage="No reasons recorded yet"
              />

              {/* Line-by-Line OA Reasons Breakdown */}
              {oaTopicStats.length > 0 && (
                <div className="p-3.5 bg-[#131B2E] border border-slate-800 rounded-xl space-y-2">
                  <span className="text-[11px] font-semibold text-slate-300 block">
                    OA Rejection Reasons Breakdown (Line-by-Line %):
                  </span>
                  <div className="space-y-2">
                    {oaTopicStats.map((topic) => (
                      <div key={topic.tag} className="space-y-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-slate-300 font-medium flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full inline-block shrink-0"
                              style={{ backgroundColor: topic.color }}
                            />
                            <span>{topic.tag}</span>
                          </span>
                          <span className="font-mono text-slate-400 font-semibold">
                            {topic.count} {topic.count === 1 ? 'co' : 'cos'} • {topic.percentage}%
                          </span>
                        </div>
                        <div className="w-full bg-[#0B0F19] h-1.5 rounded-full overflow-hidden border border-slate-800">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${topic.percentage}%`,
                              backgroundColor: topic.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Custom OA Rejection Notes */}
              {specificOANotes.length > 0 && (
                <div className="p-3.5 bg-[#131B2E] border border-slate-800 rounded-xl">
                  <span className="text-[11px] font-semibold text-slate-300 block mb-2">
                    Specific Notes (Classified as Others):
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {specificOANotes.map((item) => (
                      <div
                        key={item.id}
                        className="text-[11px] text-slate-300 bg-[#0B0F19] p-2 rounded-lg border border-slate-800 flex flex-col gap-1"
                      >
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-bold text-white text-xs">{item.companyName}</span>
                          <div className="flex flex-wrap gap-1">
                            {item.tags.map((t) => (
                              <span key={t} className="text-[9px] font-medium text-rose-300 px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                        <span className="italic text-slate-300 break-words">"{item.note}"</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* SECTION: ALL COMPANIES */}
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
                Placement record of all {companies.length} companies
              </p>
            </div>
          </div>
          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
            {companies.length} Cos
          </span>
        </div>

        {companies.length === 0 ? (
          <div className="py-10 text-center text-slate-400">
            <Clock className="w-7 h-7 mx-auto text-slate-600 mb-2" />
            <p className="text-xs font-semibold text-white">No companies recorded yet</p>
            <p className="text-[11px] mt-0.5">
              Companies added from your WhatsApp announcements will appear here.
            </p>
          </div>
        ) : (
          <div className="mt-3.5 space-y-2.5 md:space-y-0 md:grid md:grid-cols-2 md:gap-3">
            {companies.map((company, index) => {
              const sequenceNum = index + 1;
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
                        #{sequenceNum}
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

                    {company.status === 'applied' && company.oaStatus === 'not_shortlisted' && (
                      <span className="px-2 py-0.5 rounded-full font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                        <XCircle className="w-2.5 h-2.5" />
                        Not Shortlisted for OA
                      </span>
                    )}

                    {company.status === 'applied' && company.oaStatus !== 'not_shortlisted' && (
                      <span className="px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        Writing OA
                      </span>
                    )}
                  </div>

                  {/* Notes / Reason note */}
                  {company.status === 'applied' && company.oaStatus === 'not_shortlisted' && company.oaRejectionReasonTags && company.oaRejectionReasonTags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {company.oaRejectionReasonTags.map((t) => (
                        <span key={t} className="text-[9px] font-medium text-rose-300 px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                  {company.oaCustomReasonNote && (
                    <p className="text-[10px] text-slate-400 bg-[#131B2E] p-2 rounded-lg border border-slate-800/80 italic">
                      "{company.oaCustomReasonNote}"
                    </p>
                  )}
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
