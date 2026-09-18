import React, { useState } from 'react';
import { 
  Calendar, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  ChevronDown, 
  ChevronUp, 
  Tag, 
  GripVertical 
} from 'lucide-react';
import type { Company, OAShortlistStatus, OARejectionReasonTag, RejectionReasonTag } from '../types';
import { OA_REJECTION_PRESET_TAGS, REJECTION_PRESET_TAGS } from '../services/storage';

interface CompanyCardProps {
  company: Company;
  onEdit: (company: Company) => void;
  onDelete: (id: string) => void;
  onQuickStatusChange: (
    id: string, 
    status: 'applied' | 'not_applied',
    rejectionReasonTags?: RejectionReasonTag[],
    customReasonNote?: string
  ) => void;
  onUpdateOAStatus: (
    id: string, 
    oaStatus: OAShortlistStatus,
    oaRejectionReasonTags?: OARejectionReasonTag[],
    oaCustomReasonNote?: string
  ) => void;
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
  const isNotShortlistedForOA = company.oaStatus === 'not_shortlisted';
  const rejectionTags = company.rejectionReasonTags?.length 
    ? company.rejectionReasonTags 
    : [];

  const oaRejectionTags = company.oaRejectionReasonTags?.length
    ? company.oaRejectionReasonTags
    : ['Other'];

  const [isMarkingNotShortlisted, setIsMarkingNotShortlisted] = useState(false);
  const [selectedOATags, setSelectedOATags] = useState<OARejectionReasonTag[]>(
    company.oaRejectionReasonTags?.length
      ? company.oaRejectionReasonTags
      : ['CGPA']
  );
  const [customOANote, setCustomOANote] = useState(company.oaCustomReasonNote || '');

  // Skipped Reason Selection State (when toggling from Applied to Skipped or editing skipped reasons)
  const [isMarkingSkipped, setIsMarkingSkipped] = useState(false);
  const [selectedSkippedTags, setSelectedSkippedTags] = useState<RejectionReasonTag[]>(
    company.rejectionReasonTags?.length ? company.rejectionReasonTags : ['Others']
  );
  const [customSkippedNote, setCustomSkippedNote] = useState(company.customReasonNote || '');

  const handleToggleSkippedTag = (tag: RejectionReasonTag) => {
    setSelectedSkippedTags((prev) => {
      if (prev.includes(tag)) {
        const next = prev.filter((t) => t !== tag);
        return next.length > 0 ? next : [tag];
      } else {
        return [...prev, tag];
      }
    });
  };

  const handleConfirmSkipped = (e: React.MouseEvent) => {
    e.stopPropagation();
    onQuickStatusChange(
      company.id,
      'not_applied',
      selectedSkippedTags,
      customSkippedNote.trim() || undefined
    );
    setIsMarkingSkipped(false);
  };

  const handleToggleOATag = (tag: OARejectionReasonTag) => {
    setSelectedOATags((prev) => {
      if (prev.includes(tag)) {
        const next = prev.filter((t) => t !== tag);
        return next.length > 0 ? next : [tag];
      } else {
        return [...prev, tag];
      }
    });
  };

  const handleConfirmNotShortlisted = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateOAStatus(
      company.id,
      'not_shortlisted',
      selectedOATags,
      customOANote.trim() || undefined
    );
    setIsMarkingNotShortlisted(false);
  };

  const handleUndoNotShortlisted = (e: React.MouseEvent) => {
    e.stopPropagation();
    onUpdateOAStatus(company.id, 'shortlisted', undefined, undefined);
    setIsMarkingNotShortlisted(false);
  };

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
        <div className="flex items-center gap-2 min-w-0 flex-1">
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

          {/* Minimal small red dot indicating not selected/shortlisted for OA */}
          {isApplied && isNotShortlistedForOA && (
            <span 
              className="w-2 h-2 rounded-full bg-rose-500 shrink-0 shadow-xs shadow-rose-500/60"
              title={`Not shortlisted for OA${oaRejectionTags.length ? `: ${oaRejectionTags.join(', ')}` : ''}`}
            />
          )}
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
                  setIsMarkingSkipped(false);
                  onQuickStatusChange(company.id, 'applied');
                }}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  isApplied && !isMarkingSkipped
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Applied
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsExpanded(true);
                  setIsMarkingSkipped(true);
                }}
                className={`px-2 py-1 rounded text-[11px] font-semibold transition-all cursor-pointer ${
                  !isApplied || isMarkingSkipped
                    ? 'bg-rose-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Skipped
              </button>
            </div>
          </div>

          {/* Opportunity Type & Drive Date */}
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
            <div>
              <span className="text-slate-400">Type: </span>
              <span className="font-semibold text-white">{company.type || company.role || 'Full Time (FTE)'}</span>
            </div>

            {company.oaDate && (
              <span className="inline-flex items-center gap-1 text-slate-300 bg-[#0B0F19] px-2.5 py-1 rounded-lg border border-slate-800 font-mono text-[11px]">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Drive: {new Date(company.oaDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>

          {/* INLINE REASON TAG SELECTOR PROMPT (WHEN TRANSITIONING TO SKIPPED OR EDITING SKIPPED REASONS) */}
          {isMarkingSkipped ? (
            <div 
              className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-800/50 space-y-2.5 animate-fadeIn" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                  <XCircle className="w-3.5 h-3.5 text-rose-400" />
                  Why are you skipping {company.name}?
                </span>
                <button
                  type="button"
                  onClick={() => setIsMarkingSkipped(false)}
                  className="text-[10px] text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>

              <div>
                <span className="text-[10px] font-semibold text-slate-300 block mb-1">
                  Reason tags (select all that apply):
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {REJECTION_PRESET_TAGS.map((tag) => {
                    const isSelected = selectedSkippedTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleToggleSkippedTag(tag)}
                        className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                          isSelected
                            ? 'bg-rose-500/30 border-rose-500/70 text-rose-200 font-bold shadow-sm shadow-rose-500/20'
                            : 'bg-[#0B0F19] border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                        }`}
                      >
                        <span className="text-[10px] font-bold">{isSelected ? '✓' : '+'}</span>
                        <span>{tag}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <input
                  type="text"
                  value={customSkippedNote}
                  onChange={(e) => setCustomSkippedNote(e.target.value)}
                  placeholder="Optional note (e.g. 3 yr bond, location not preferred...)"
                  className="w-full px-3 py-1.5 bg-[#0B0F19] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setIsMarkingSkipped(false)}
                  className="px-2.5 py-1 text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSkipped}
                  className="px-3.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow-sm shadow-rose-600/30 cursor-pointer"
                >
                  Confirm Skipped ✕
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* DYNAMIC: APPLIED (OA STATUS & SHORTLIST REASONS) */}
              {isApplied && (
                <div>
                  {isNotShortlistedForOA ? (
                    /* State: Applied but Not Shortlisted to write OA */
                <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/40 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400 shrink-0">
                        <XCircle className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-bold text-rose-300">
                            Not Shortlisted for OA ✕
                          </span>
                        </div>
                        <span className="text-[10px] text-rose-400/80 block truncate">
                          Applied, but not shortlisted to write OA
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMarkingNotShortlisted(!isMarkingNotShortlisted);
                        }}
                        className="text-[10px] font-semibold text-slate-300 hover:text-white px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 transition-colors shrink-0 cursor-pointer"
                      >
                        {isMarkingNotShortlisted ? 'Close' : 'Edit Reason'}
                      </button>
                      <button
                        onClick={handleUndoNotShortlisted}
                        className="text-[10px] font-semibold text-emerald-300 hover:text-emerald-200 px-2.5 py-1 rounded-lg bg-emerald-950/60 border border-emerald-700/50 hover:bg-emerald-900/60 transition-colors shrink-0 cursor-pointer"
                        title="Mark as Writing OA"
                      >
                        Undo (Writing OA)
                      </button>
                    </div>
                  </div>

                  {/* Reasons Display */}
                  {!isMarkingNotShortlisted && (
                    <div className="pt-1.5 border-t border-rose-900/40 flex flex-wrap items-center gap-1.5">
                      <span className="text-[10px] text-slate-400">Reason:</span>
                      {oaRejectionTags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/30 flex items-center gap-1"
                        >
                          <Tag className="w-2.5 h-2.5" />
                          <span>{tag}</span>
                        </span>
                      ))}
                      {company.oaCustomReasonNote && (
                        <span className="text-[10px] text-slate-300 italic block w-full mt-0.5">
                          "{company.oaCustomReasonNote}"
                        </span>
                      )}
                    </div>
                  )}

                  {/* Inline Reason Tag Selector Form (when editing) */}
                  {isMarkingNotShortlisted && (
                    <div className="pt-2 border-t border-rose-900/50 space-y-2.5 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                      <div>
                        <span className="text-[10px] font-semibold text-slate-300 block mb-1">
                          Select reason for not being shortlisted:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {OA_REJECTION_PRESET_TAGS.map((tag) => {
                            const isSelected = selectedOATags.includes(tag);
                            return (
                              <button
                                key={tag}
                                type="button"
                                onClick={() => handleToggleOATag(tag)}
                                className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                                  isSelected
                                    ? 'bg-rose-500/30 border-rose-500/70 text-rose-200 font-bold shadow-sm shadow-rose-500/20'
                                    : 'bg-[#0B0F19] border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                                }`}
                              >
                                <span className="text-[10px] font-bold">{isSelected ? '✓' : '+'}</span>
                                <span>{tag}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div>
                        <input
                          type="text"
                          value={customOANote}
                          onChange={(e) => setCustomOANote(e.target.value)}
                          placeholder="Custom reason note (e.g. Cutoff was 8.5 CGPA, classified under Others)..."
                          className="w-full px-3 py-1.5 bg-[#0B0F19] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500"
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setIsMarkingNotShortlisted(false)}
                          className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleConfirmNotShortlisted}
                          className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow-sm shadow-rose-600/30"
                        >
                          Save Reason
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : isMarkingNotShortlisted ? (
                /* Inline Reason Tag Selector Form (when transitioning from Writing OA to Not Shortlisted) */
                <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-800/40 space-y-2.5 animate-fadeIn" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                      <XCircle className="w-3.5 h-3.5 text-rose-400" />
                      Mark as Not Shortlisted for OA
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsMarkingNotShortlisted(false)}
                      className="text-[10px] text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                  </div>

                  <div>
                    <span className="text-[10px] font-semibold text-slate-300 block mb-1">
                      Reason tags (select all that apply):
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {OA_REJECTION_PRESET_TAGS.map((tag) => {
                        const isSelected = selectedOATags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleToggleOATag(tag)}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                              isSelected
                                ? 'bg-rose-500/30 border-rose-500/70 text-rose-200 font-bold shadow-sm shadow-rose-500/20'
                              : 'bg-[#0B0F19] border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                            }`}
                          >
                            <span className="text-[10px] font-bold">{isSelected ? '✓' : '+'}</span>
                            <span>{tag}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={customOANote}
                      onChange={(e) => setCustomOANote(e.target.value)}
                      placeholder="Custom reason note (e.g. Cutoff was 8.5 CGPA, classified under Others)..."
                      className="w-full px-3 py-1.5 bg-[#0B0F19] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsMarkingNotShortlisted(false)}
                      className="px-2.5 py-1 text-xs text-slate-400 hover:text-white"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmNotShortlisted}
                      className="px-3.5 py-1 bg-rose-600 hover:bg-rose-500 text-white rounded-lg text-xs font-bold shadow-sm shadow-rose-600/30"
                    >
                      Confirm Not Shortlisted ✕
                    </button>
                  </div>
                </div>
              ) : (
                /* Default State: Writing OA (Scheduled) */
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-300 shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-emerald-300">
                          Writing OA ✓
                        </span>
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                          Scheduled
                        </span>
                      </div>
                      <span className="text-[10px] text-emerald-400/80 block truncate">
                        Scheduled to write the Online Assessment
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMarkingNotShortlisted(true);
                    }}
                    className="w-full sm:w-auto py-1.5 px-3 bg-slate-900 hover:bg-rose-950/60 text-slate-300 hover:text-rose-300 border border-slate-700 hover:border-rose-700/60 font-medium text-xs rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-3.5 h-3.5 text-rose-400" />
                    <span>Mark as Not Shortlisted</span>
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
                <div className="flex items-center gap-2">
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
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMarkingSkipped(true);
                    }}
                    className="text-[10px] font-semibold text-slate-400 hover:text-rose-300 px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 transition-colors cursor-pointer shrink-0 active:scale-95"
                  >
                    Edit Reason
                  </button>
                </div>
              </div>
              {company.customReasonNote && (
                <p className="text-xs text-slate-300 italic pt-1 border-t border-slate-800/60">
                  "{company.customReasonNote}"
                </p>
              )}
            </div>
          )}
        </>
      )}

          {/* Notes */}
          {company.notes && (
            <div className="text-xs text-slate-400 bg-[#0B0F19] p-2.5 rounded-xl border border-slate-800">
              <span className="text-slate-500 font-semibold block text-[10px] uppercase mb-0.5">Notes</span>
              <p className="text-slate-300">{company.notes}</p>
            </div>
          )}

          {/* Actions: Edit & Delete */}
          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-end gap-2">
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(company);
                }}
                className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-xs text-slate-200 border border-slate-700 flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5 text-indigo-400" />
                <span>Edit</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(company.id);
                }}
                className="py-1.5 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 active:scale-95 text-xs text-rose-300 border border-rose-800/50 flex items-center gap-1.5 transition-all cursor-pointer"
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
