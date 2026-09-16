import React from 'react';
import { 
  Calendar, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle,
  Award,
  Sparkles,
  Tag
} from 'lucide-react';
import type { Company, OAShortlistStatus } from '../types';

interface CompanyCardProps {
  company: Company;
  onEdit: (company: Company) => void;
  onDelete: (id: string) => void;
  onQuickStatusChange: (id: string, status: 'applied' | 'not_applied') => void;
  onUpdateOAStatus: (id: string, oaStatus: OAShortlistStatus) => void;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  onEdit,
  onDelete,
  onQuickStatusChange,
  onUpdateOAStatus,
}) => {
  // Generate consistent gradient for company initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const getTierBadge = () => {
    switch (company.tier) {
      case 'OPEN_DREAM':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1 shadow-sm shadow-purple-500/10">
            <Sparkles className="w-3 h-3 text-purple-400" />
            Open Dream (≥12 LPA)
          </span>
        );
      case 'DREAM':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wide uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
            Dream (&lt;12 LPA)
          </span>
        );
      case 'MASS':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-blue-500/15 text-blue-300 border border-blue-500/30">
            Mass / Regular
          </span>
        );
      case 'INTERN_ONLY':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-amber-500/15 text-amber-300 border border-amber-500/30">
            Internship Only
          </span>
        );
      case 'OFF_CAMPUS':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase bg-slate-700 text-slate-300 border border-slate-600">
            Off-Campus
          </span>
        );
      default:
        return null;
    }
  };

  const getPriorityBadge = () => {
    if (!company.priority) return null;
    switch (company.priority) {
      case 'High':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/15 text-rose-300 border border-rose-500/30">
            P1 High
          </span>
        );
      case 'Medium':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30">
            P2 Medium
          </span>
        );
      case 'Low':
        return (
          <span className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-700/60 text-slate-400 border border-slate-600/40">
            P3 Low
          </span>
        );
    }
  };

  return (
    <div className="bg-[#131B2E] border border-slate-800/90 rounded-2xl p-4 transition-all duration-200 shadow-lg shadow-black/20 flex flex-col justify-between">
      
      {/* Top Section */}
      <div>
        <div className="flex items-start justify-between gap-2.5 mb-2.5">
          
          {/* Avatar and Company Title */}
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/80 flex items-center justify-center font-bold text-sm text-indigo-300 shadow-inner shrink-0">
              {getInitials(company.name)}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-base font-bold text-white tracking-tight leading-snug truncate">
                {company.name}
              </h3>
              <p className="text-xs text-slate-400 italic truncate">
                {company.role || 'Campus Recruitment'}
              </p>
            </div>
          </div>

          {/* Quick Actions (Edit / Delete) - Always visible for touch devices */}
          <div className="flex items-center gap-1 shrink-0">
            {company.formLink && (
              <a
                href={company.formLink}
                target="_blank"
                rel="noopener noreferrer"
                title="Open Google Form"
                className="p-2 text-slate-400 hover:text-indigo-400 active:bg-slate-800 rounded-lg transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={() => onEdit(company)}
              title="Edit details"
              className="p-2 text-slate-400 hover:text-white active:bg-slate-800 rounded-lg transition-colors active:scale-95"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(company.id)}
              title="Delete company"
              className="p-2 text-slate-400 hover:text-rose-400 active:bg-rose-950/40 rounded-lg transition-colors active:scale-95"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* Tier & CTC & Priority Strip */}
        <div className="flex flex-wrap items-center gap-2 my-2.5">
          {getTierBadge()}
          <div className="px-2.5 py-0.5 rounded-full text-xs font-bold text-indigo-200 bg-indigo-950/60 border border-indigo-700/40">
            💰 {company.ctc || 'Not Disclosed'}
          </div>
          {getPriorityBadge()}
        </div>

        {/* Business Model / Sector if specified */}
        {company.businessModel && (
          <div className="text-xs text-slate-400 mb-2">
            <span className="text-slate-500 font-medium">Business Model: </span>
            <span className="text-slate-300">{company.businessModel}</span>
          </div>
        )}

        {/* Application Status Content */}
        <div className="my-3 pt-2.5 border-t border-slate-800/80">
          {company.status === 'applied' && (
            <div className="space-y-2.5">
              
              {/* Form submitted check and drive date */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 font-medium text-emerald-400">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Form Submitted
                </span>
                {company.oaDate && (
                  <span className="inline-flex items-center gap-1 text-slate-300 bg-slate-800/90 px-2 py-0.5 rounded-md border border-slate-700 font-mono text-[11px]">
                    <Calendar className="w-3 h-3 text-amber-400" />
                    OA: {new Date(company.oaDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                )}
              </div>

              {/* OA Shortlist Selector & Status */}
              <div className="p-2.5 rounded-xl bg-[#0B0F19]/80 border border-slate-800">
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="text-slate-400 font-medium flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-amber-400" />
                    OA Shortlist:
                  </span>
                  {company.oaStatus === 'shortlisted' ? (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                      Shortlisted for OA ✨
                    </span>
                  ) : company.oaStatus === 'not_shortlisted' ? (
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/40">
                      Not Shortlisted
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      Pending Shortlist
                    </span>
                  )}
                </div>

                {/* Quick Toggle for OA Status */}
                <div className="grid grid-cols-3 gap-1 pt-1 text-[11px]">
                  <button
                    onClick={() => onUpdateOAStatus(company.id, 'pending')}
                    className={`py-1 px-1.5 rounded-lg border text-center transition-all ${
                      company.oaStatus === 'pending' || !company.oaStatus
                        ? 'bg-amber-950/60 border-amber-500/50 text-amber-300 font-semibold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Pending
                  </button>
                  <button
                    onClick={() => onUpdateOAStatus(company.id, 'shortlisted')}
                    className={`py-1 px-1.5 rounded-lg border text-center transition-all ${
                      company.oaStatus === 'shortlisted'
                        ? 'bg-emerald-950/80 border-emerald-500/60 text-emerald-300 font-bold shadow-sm shadow-emerald-500/20'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Shortlisted
                  </button>
                  <button
                    onClick={() => onUpdateOAStatus(company.id, 'not_shortlisted')}
                    className={`py-1 px-1.5 rounded-lg border text-center transition-all ${
                      company.oaStatus === 'not_shortlisted'
                        ? 'bg-rose-950/80 border-rose-500/60 text-rose-300 font-bold'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    Rejected
                  </button>
                </div>
              </div>

            </div>
          )}

          {company.status === 'not_applied' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="inline-flex items-center gap-1.5 font-medium text-rose-400">
                  <XCircle className="w-3.5 h-3.5" />
                  Not Applied / Skipped
                </span>
                {company.rejectionReasonTag && (
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                    <Tag className="w-3 h-3" />
                    {company.rejectionReasonTag}
                  </span>
                )}
              </div>

              {company.customReasonNote && (
                <p className="text-xs text-slate-300 bg-[#0B0F19] p-2.5 rounded-xl border border-slate-800/90 italic">
                  "{company.customReasonNote}"
                </p>
              )}
            </div>
          )}

          {company.status === 'undecided' && (
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                Decide whether to apply
              </span>
              {company.applicationDeadline && (
                <span className="text-amber-300 font-mono text-[11px]">
                  Due: {new Date(company.applicationDeadline).toLocaleDateString()}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Notes if any */}
        {company.notes && (
          <div className="text-[11px] text-slate-400 bg-slate-900/40 p-2 rounded-lg border border-slate-800 mb-3 line-clamp-2">
            {company.notes}
          </div>
        )}
      </div>

      {/* Bottom Action Footer - Min 42px touch targets */}
      <div className="pt-3 border-t border-slate-800/80 flex items-center gap-2">
        {company.status !== 'applied' ? (
          <button
            onClick={() => onQuickStatusChange(company.id, 'applied')}
            className="flex-1 min-h-[42px] py-2 px-3 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 active:scale-[0.98] text-white shadow-md shadow-indigo-600/20 transition-all flex items-center justify-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4 text-white" />
            <span>Mark as Applied</span>
          </button>
        ) : (
          <button
            onClick={() => onEdit(company)}
            className="flex-1 min-h-[42px] py-2 px-3 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 active:bg-slate-900 active:scale-[0.98] text-slate-200 border border-slate-700 transition-all flex items-center justify-center gap-1.5"
          >
            <Edit3 className="w-4 h-4 text-indigo-400" />
            <span>Update Drive Details</span>
          </button>
        )}

        {company.status !== 'not_applied' && (
          <button
            onClick={() => onQuickStatusChange(company.id, 'not_applied')}
            className="min-h-[42px] py-2 px-3 text-xs font-medium rounded-xl bg-rose-950/40 hover:bg-rose-900/60 active:scale-[0.98] text-rose-300 border border-rose-800/50 transition-all flex items-center justify-center"
            title="Mark Not Applied and set rejection reason"
          >
            Skip Company
          </button>
        )}
      </div>

    </div>
  );
};
