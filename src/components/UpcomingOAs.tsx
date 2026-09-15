import React from 'react';
import { Calendar, Clock, CheckCircle2, XCircle, Plus } from 'lucide-react';
import type { Company, OAShortlistStatus } from '../types';

interface UpcomingOAsProps {
  companies: Company[];
  onUpdateOAStatus: (id: string, oaStatus: OAShortlistStatus) => void;
  onOpenAddModal: () => void;
  onEditCompany: (company: Company) => void;
}

export const UpcomingOAs: React.FC<UpcomingOAsProps> = ({
  companies,
  onUpdateOAStatus,
  onOpenAddModal,
  onEditCompany,
}) => {
  // Filter applied companies that have an OA date
  const oaCompanies = companies
    .filter((c) => c.status === 'applied' && !!c.oaDate)
    .sort((a, b) => new Date(a.oaDate!).getTime() - new Date(b.oaDate!).getTime());

  const getDaysRemaining = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return { text: 'Today!', urgent: true, color: 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' };
    } else if (diffDays === 1) {
      return { text: 'Tomorrow', urgent: true, color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
    } else if (diffDays > 1) {
      return { text: `In ${diffDays} days`, urgent: false, color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' };
    } else {
      return { text: `${Math.abs(diffDays)} days ago`, urgent: false, color: 'bg-slate-800 text-slate-400 border-slate-700' };
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#131B2E] border border-slate-800 p-6 rounded-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase font-bold tracking-wider text-amber-400">Online Assessments Schedule</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Upcoming OA Drives & Shortlists
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track test dates and record whether your college placement cell shortlisted you for each assessment.
          </p>
        </div>

        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/25 transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Drive</span>
        </button>
      </div>

      {oaCompanies.length === 0 ? (
        <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-12 text-center">
          <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">No OA Drive Dates Scheduled Yet</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            When you mark a company as "Applied" and add the Online Assessment date posted in your WhatsApp group, it will appear here in chronological order.
          </p>
          <button
            onClick={onOpenAddModal}
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-semibold transition-colors"
          >
            <Plus className="w-4 h-4 text-indigo-400" />
            <span>Add Company with OA Date</span>
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {oaCompanies.map((company) => {
            const badge = getDaysRemaining(company.oaDate!);
            const formattedDate = new Date(company.oaDate!).toLocaleDateString(undefined, {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            });

            return (
              <div 
                key={company.id}
                className="bg-[#131B2E] border border-slate-800/90 hover:border-indigo-500/40 rounded-2xl p-5 transition-all card-glow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                {/* Date & Badge */}
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-[#0B0F19] border border-slate-700 flex flex-col items-center justify-center text-center shrink-0">
                    <span className="text-[10px] uppercase font-bold text-indigo-400">
                      {new Date(company.oaDate!).toLocaleDateString(undefined, { month: 'short' })}
                    </span>
                    <span className="text-lg font-extrabold text-white font-mono leading-none">
                      {new Date(company.oaDate!).getDate()}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-white">
                        {company.name}
                      </h3>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                        {badge.text}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
                      <span className="text-slate-300 font-medium">{company.role}</span>
                      <span>•</span>
                      <span className="text-indigo-300 font-mono font-semibold">{company.ctc}</span>
                      <span>•</span>
                      <span>{formattedDate}</span>
                    </div>
                  </div>
                </div>

                {/* OA Shortlist Status & Quick Modifier */}
                <div className="w-full sm:w-auto flex flex-col sm:items-end gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400">Status:</span>
                    {company.oaStatus === 'shortlisted' ? (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Shortlisted for OA
                      </span>
                    ) : company.oaStatus === 'not_shortlisted' ? (
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                        <XCircle className="w-3.5 h-3.5" />
                        Not Shortlisted
                      </span>
                    ) : (
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        Pending Shortlist
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onUpdateOAStatus(company.id, 'shortlisted')}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
                        company.oaStatus === 'shortlisted'
                          ? 'bg-emerald-600 text-white border-emerald-500 shadow-sm'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                      }`}
                    >
                      Shortlisted
                    </button>
                    <button
                      onClick={() => onUpdateOAStatus(company.id, 'not_shortlisted')}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-all ${
                        company.oaStatus === 'not_shortlisted'
                          ? 'bg-rose-600 text-white border-rose-500 shadow-sm'
                          : 'bg-slate-900 border-slate-700 text-slate-300 hover:text-white'
                      }`}
                    >
                      Rejected
                    </button>
                    <button
                      onClick={() => onEditCompany(company)}
                      className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 text-slate-300 hover:text-white text-xs font-medium"
                    >
                      Edit
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
