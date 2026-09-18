import React from 'react';
import { 
  BellRing, 
  X, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Building2,
  Clock
} from 'lucide-react';
import type { Company } from '../types';

interface TodayDriveReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  companies: Company[];
}

export const TodayDriveReminderModal: React.FC<TodayDriveReminderModalProps> = ({
  isOpen,
  onClose,
  companies,
}) => {
  if (!isOpen || companies.length === 0) return null;

  const isSingle = companies.length === 1;
  const singleCompany = companies[0];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm sm:max-w-md bg-[#131B2E] border border-amber-500/40 rounded-3xl shadow-2xl shadow-amber-950/40 overflow-hidden flex flex-col text-left relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient background effect */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-amber-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-full transition-colors cursor-pointer active:scale-95 z-10"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header */}
        <div className="p-5 pb-3 flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-orange-500 p-0.5 shadow-lg shadow-amber-500/30 shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center">
              <BellRing className="w-6 h-6 text-amber-400 animate-bounce" />
            </div>
          </div>

          <div className="min-w-0 flex-1 pr-6">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="text-[10px] font-bold text-amber-300 bg-amber-950/80 border border-amber-500/40 px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider">
                <Clock className="w-3 h-3 text-amber-400" />
                Scheduled Today
              </span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight leading-snug">
              {isSingle 
                ? `${singleCompany.name} drive date was scheduled today`
                : `Drive dates scheduled today for ${companies.length} companies`}
            </h3>
            <p className="text-[11px] text-slate-300 mt-1 leading-relaxed">
              Just a quick reminder in case of any campus schedule changes or placement cell discrepancies.
            </p>
          </div>
        </div>

        {/* Company List */}
        <div className="px-5 pb-4 space-y-2.5 max-h-[300px] overflow-y-auto custom-scrollbar">
          {companies.map((company) => {
            const isSkipped = company.status === 'not_applied';
            const isNotShortlisted = company.status === 'applied' && company.oaStatus === 'not_shortlisted';
            const isSelected = company.status === 'applied' && company.oaStatus === 'shortlisted';

            return (
              <div 
                key={company.id}
                className="p-3 rounded-2xl bg-[#0B0F19]/90 border border-slate-800 flex flex-col gap-2 shadow-sm hover:border-slate-700 transition-colors"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <Building2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <h4 className="text-xs font-bold text-white truncate">{company.name}</h4>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {company.type || company.role || 'Placement Drive'} • <span className="text-indigo-300 font-mono font-medium">{company.ctc}</span>
                    </p>
                  </div>

                  {/* Status Tag */}
                  <div className="shrink-0">
                    {isSkipped ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-rose-400" />
                        Skipped
                      </span>
                    ) : isNotShortlisted ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3 text-amber-400" />
                        Not Shortlisted
                      </span>
                    ) : isSelected ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        Selected
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-indigo-500/15 text-indigo-300 border border-indigo-500/30 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-indigo-400" />
                        Applied (Awaiting OA)
                      </span>
                    )}
                  </div>
                </div>

                {/* Additional Note or Tags if available */}
                {(company.rejectionReasonTags?.length || company.oaRejectionReasonTags?.length || company.notes) && (
                  <div className="text-[10px] text-slate-400 border-t border-slate-800/80 pt-1.5 flex items-center justify-between">
                    <span className="truncate">
                      {isSkipped && company.rejectionReasonTags?.length
                        ? `Reason: ${company.rejectionReasonTags.join(', ')}`
                        : isNotShortlisted && company.oaRejectionReasonTags?.length
                        ? `OA status: ${company.oaRejectionReasonTags.join(', ')}`
                        : company.notes 
                        ? `Note: ${company.notes}`
                        : ''}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="p-4 pt-1 border-t border-slate-800/80 bg-[#0B0F19]/40 flex gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 bg-gradient-to-r from-amber-500 via-amber-400 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-amber-500/20 active:scale-95 transition-all cursor-pointer"
          >
            Got it, thanks
          </button>
        </div>
      </div>
    </div>
  );
};
