import React, { useState } from 'react';
import { 
  Calendar, 
  ExternalLink, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Award, 
  ChevronDown, 
  ChevronUp,
  Tag,
  Sparkles,
  GripVertical
} from 'lucide-react';
import type { Company, OAShortlistStatus } from '../types';

interface CompanyCardProps {
  company: Company;
  onEdit: (company: Company) => void;
  onDelete: (id: string) => void;
  onQuickStatusChange: (id: string, status: 'applied' | 'not_applied') => void;
  onUpdateOAStatus: (id: string, oaStatus: OAShortlistStatus) => void;
  // Drag and drop reordering props
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  onDragOver?: (e: React.DragEvent, id: string) => void;
  onDragLeave?: (e: React.DragEvent, id: string) => void;
  onDrop?: (e: React.DragEvent, id: string) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  isDragging?: boolean;
  isDragOver?: boolean;
}

export const CompanyCard: React.FC<CompanyCardProps> = ({
  company,
  onEdit,
  onDelete,
  onQuickStatusChange,
  onUpdateOAStatus,
  draggable = false,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  isDragging = false,
  isDragOver = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const isApplied = company.status === 'applied';
  const isOASelected = company.oaStatus === 'shortlisted';
  const rejectionTags = company.rejectionReasonTags?.length 
    ? company.rejectionReasonTags 
    : (company.rejectionReasonTag ? [company.rejectionReasonTag] : []);

  return (
    <div 
      draggable={draggable}
      onDragStart={(e) => onDragStart && onDragStart(e, company.id)}
      onDragOver={(e) => onDragOver && onDragOver(e, company.id)}
      onDragLeave={(e) => onDragLeave && onDragLeave(e, company.id)}
      onDrop={(e) => onDrop && onDrop(e, company.id)}
      onDragEnd={(e) => onDragEnd && onDragEnd(e)}
      className={`bg-[#131B2E] border rounded-2xl transition-all duration-200 shadow-md shadow-black/20 overflow-hidden ${
        isDragOver 
          ? 'border-indigo-500 ring-2 ring-indigo-500/40 bg-[#162038] scale-[1.01]' 
          : isDragging 
            ? 'opacity-40 border-dashed border-slate-600' 
            : 'border-slate-800/90 hover:border-indigo-500/30'
      }`}
    >
      
      {/* CARD HEADER / COLLAPSED STATE: ONLY COMPANY NAME + OPTIONAL DRAG HANDLE */}
      <div 
        onClick={() => setIsExpanded(!isExpanded)}
        className="px-4 py-3.5 flex items-center justify-between gap-3 cursor-pointer select-none group"
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {draggable && (
            <div 
              className="text-slate-600 group-hover:text-slate-400 cursor-grab active:cursor-grabbing p-0.5 -ml-1 transition-colors shrink-0" 
              title="Drag to reorder"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-4 h-4" />
            </div>
          )}
          <h3 className="text-base font-bold text-white tracking-tight leading-tight truncate group-hover:text-indigo-300 transition-colors">
            {company.name}
          </h3>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {/* Subtle indicator chevron */}
          <div className="w-7 h-7 rounded-lg bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-400 group-hover:text-white transition-colors">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4 text-indigo-400" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </div>
        </div>
      </div>

      {/* EXPANDED STATE: DETAILS SHOWN ONLY ON CLICK */}
      {isExpanded && (
        <div className="px-4 pb-4 pt-1 border-t border-slate-800/80 space-y-3.5 animate-fadeIn">
          
          {/* Status & Placement Category Strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5">
              {isApplied ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  Applied
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  Skipped
                </span>
              )}

              {company.ctc && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold text-indigo-200 bg-indigo-950/60 border border-indigo-700/40">
                  💰 {company.ctc}
                </span>
              )}
            </div>

            {/* Quick Status Toggle (Applied vs Skipped) */}
            <div className="flex items-center gap-1 bg-[#0B0F19] p-0.5 rounded-lg border border-slate-800 text-xs">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickStatusChange(company.id, 'applied');
                }}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                  isApplied
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Applied
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onQuickStatusChange(company.id, 'not_applied');
                }}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-all ${
                  !isApplied
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Skipped
              </button>
            </div>
          </div>

          {/* Role & Drive Date */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
            <div>
              <span className="text-slate-400">Role: </span>
              <span className="font-medium text-white">{company.role || 'Software Engineer'}</span>
            </div>

            {company.oaDate && (
              <span className="inline-flex items-center gap-1 text-slate-300 bg-[#0B0F19] px-2.5 py-1 rounded-lg border border-slate-800 font-mono text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Drive: {new Date(company.oaDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>

          {/* DYNAMIC: APPLIED (OA STATUS MILESTONE) */}
          {isApplied && (
            <div>
              {isOASelected ? (
                /* State 1: Shortlisted Milestone Achieved */
                <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-emerald-300">
                          Shortlisted for OA ✨
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Selected
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-400/80 block truncate">
                        Eligible to take the Online Assessment
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateOAStatus(company.id, 'not_shortlisted');
                    }}
                    className="text-[10px] text-slate-400 hover:text-rose-400 px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 hover:border-rose-900/60 transition-colors shrink-0 cursor-pointer"
                    title="Undo shortlist"
                  >
                    Undo
                  </button>
                </div>
              ) : (
                /* State 2: Awaiting OA Results / Action to Mark as Selected */
                <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
                      <Award className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-white block">OA Status</span>
                      <span className="text-[10px] text-slate-400 block">Applied • Awaiting shortlist results</span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateOAStatus(company.id, 'shortlisted');
                    }}
                    className="w-full sm:w-auto py-1.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Mark as OA Selected 🎉</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {/* DYNAMIC: SKIPPED REASON */}
          {!isApplied && (
            <div className="p-3 rounded-xl bg-[#0B0F19] border border-slate-800 space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-xs">
                <span className="text-slate-400 shrink-0">Reasons for skipping:</span>
                {rejectionTags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 items-center">
                    {rejectionTags.map((tag) => (
                      <span 
                        key={tag}
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1"
                      >
                        <Tag className="w-3 h-3" />
                        <span>{tag}</span>
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {company.customReasonNote && (
                <p className="text-xs text-slate-300 italic pt-1 border-t border-slate-800/60">
                  "{company.customReasonNote}"
                </p>
              )}
            </div>
          )}

          {/* Notes */}
          {company.notes && (
            <div className="text-xs text-slate-400 bg-[#0B0F19] p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-500 font-semibold block text-[10px] uppercase mb-0.5">Notes</span>
              <p className="text-slate-300">{company.notes}</p>
            </div>
          )}

          {/* Actions: Edit & Delete */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between gap-2">
            <div className="flex items-center gap-1">
              {company.formLink && (
                <a
                  href={company.formLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  title="Open Form Link"
                  className="p-2 text-slate-400 hover:text-indigo-400 active:bg-slate-800 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(company);
                }}
                className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all"
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Edit</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(company.id);
                }}
                className="py-1.5 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 active:scale-95 text-xs text-rose-300 border border-rose-800/50 flex items-center gap-1.5 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
