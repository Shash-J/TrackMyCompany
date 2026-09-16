import React, { useState, useEffect } from 'react';
import { 
  X, 
  Building2, 
  Calendar, 
  DollarSign, 
  Check, 
  AlertCircle, 
  Tag, 
  CheckCircle2, 
  XCircle, 
  ClipboardPaste, 
  Sparkles, 
  Edit3, 
  ArrowLeft,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { 
  Company, 
  TierCategory, 
  ApplicationStatus, 
  RejectionReasonTag, 
  OARejectionReasonTag, 
  OAShortlistStatus 
} from '../types';
import { REJECTION_PRESET_TAGS, OA_REJECTION_PRESET_TAGS } from '../services/storage';
import { parseWhatsAppMessage } from '../services/whatsappParser';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>, editId?: string) => void;
  editCompany?: Company | null;
  defaultStatus?: ApplicationStatus;
}

type ModalMode = 'paste' | 'parsed-confirm' | 'manual';

export const CompanyModal: React.FC<CompanyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editCompany,
  defaultStatus = 'applied',
}) => {
  const [mode, setMode] = useState<ModalMode>('paste');
  const [rawMessage, setRawMessage] = useState('');
  const [pasteError, setPasteError] = useState('');
  const [showEditDetails, setShowEditDetails] = useState(false);

  // Form Fields
  const [name, setName] = useState('');
  const [type, setType] = useState('Full Time (FTE)');
  const [role, setRole] = useState('');
  const [tier, setTier] = useState<TierCategory>('OPEN_DREAM');
  const [ctc, setCtc] = useState('');
  const [notes, setNotes] = useState('');
  const [oaDate, setOaDate] = useState('');

  // Decision Status (Applied vs Skipped)
  const [status, setStatus] = useState<ApplicationStatus>(defaultStatus);

  // Applied fields (OA status)
  const [oaStatusState, setOaStatusState] = useState<OAShortlistStatus>('shortlisted');
  const [oaRejectionReasonTags, setOaRejectionReasonTags] = useState<OARejectionReasonTag[]>(['CGPA']);
  const [oaCustomReasonNote, setOaCustomReasonNote] = useState('');

  // Skipped fields
  const [rejectionReasonTags, setRejectionReasonTags] = useState<RejectionReasonTag[]>(['CTC']);
  const [customReasonNote, setCustomReasonNote] = useState('');

  const [formError, setFormError] = useState('');

  useEffect(() => {
    if (editCompany) {
      setMode('manual');
      setName(editCompany.name);
      setType(editCompany.type || editCompany.role || 'Full Time (FTE)');
      setRole(editCompany.role || '');
      setTier(editCompany.tier || 'DREAM');
      setCtc(editCompany.ctc || '');
      setNotes(editCompany.notes || '');
      setStatus(editCompany.status === 'not_applied' ? 'not_applied' : 'applied');
      setOaDate(editCompany.oaDate || '');
      setOaStatusState(editCompany.oaStatus === 'not_shortlisted' ? 'not_shortlisted' : 'shortlisted');

      setOaRejectionReasonTags(
        editCompany.oaRejectionReasonTags?.length ? editCompany.oaRejectionReasonTags : ['CGPA']
      );
      setOaCustomReasonNote(editCompany.oaCustomReasonNote || '');

      setRejectionReasonTags(
        editCompany.rejectionReasonTags?.length ? editCompany.rejectionReasonTags : ['CTC']
      );
      setCustomReasonNote(editCompany.customReasonNote || '');
    } else {
      // Default to paste mode for adding new company
      setMode('paste');
      setRawMessage('');
      setPasteError('');
      setShowEditDetails(false);

      setName('');
      setType('Full Time (FTE)');
      setRole('');
      setTier('OPEN_DREAM');
      setCtc('');
      setNotes('');
      setStatus(defaultStatus === 'not_applied' ? 'not_applied' : 'applied');
      setOaDate('');
      setOaStatusState('shortlisted');
      setOaRejectionReasonTags(['CGPA']);
      setOaCustomReasonNote('');
      setRejectionReasonTags(['CTC']);
      setCustomReasonNote('');
    }
    setFormError('');
  }, [editCompany, isOpen, defaultStatus]);

  if (!isOpen) return null;

  // Handle parsing WhatsApp message
  const handleParseWhatsApp = (textToParse: string) => {
    const text = textToParse.trim();
    if (!text) {
      setPasteError('Please paste a WhatsApp announcement message first.');
      return;
    }

    const parsed = parseWhatsAppMessage(text);
    if (!parsed) {
      // MANDATORY RULE: Must have company name
      setPasteError('No company name found in the message. The system requires at least the company name to auto-fill. Please check the text or enter manually.');
      return;
    }

    // Auto-fill extracted values
    setName(parsed.name);
    setType(parsed.type);
    setRole(parsed.role || '');
    setTier(parsed.tier);
    setCtc(parsed.ctc);
    setOaDate(parsed.oaDate || '');
    setNotes(parsed.notes || '');

    setPasteError('');
    setShowEditDetails(false);
    setMode('parsed-confirm');
  };

  // Clipboard Paste Helper
  const handlePasteFromClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setRawMessage(text);
          handleParseWhatsApp(text);
        }
      }
    } catch {
      // Browser permissions denied or unsupported
    }
  };

  const handleToggleTag = (tag: RejectionReasonTag) => {
    setRejectionReasonTags((prev) => {
      if (prev.includes(tag)) {
        const next = prev.filter((t) => t !== tag);
        return next.length > 0 ? next : [tag];
      } else {
        return [...prev, tag];
      }
    });
  };

  const handleToggleOATag = (tag: OARejectionReasonTag) => {
    setOaRejectionReasonTags((prev) => {
      if (prev.includes(tag)) {
        const next = prev.filter((t) => t !== tag);
        return next.length > 0 ? next : [tag];
      } else {
        return [...prev, tag];
      }
    });
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!name.trim()) {
      setFormError('Company Name is required.');
      return;
    }

    const currentStatus: ApplicationStatus = status === 'not_applied' ? 'not_applied' : 'applied';

    onSave(
      {
        name: name.trim(),
        type: type.trim() || 'Full Time (FTE)',
        role: role.trim() || undefined,
        tier,
        ctc: ctc.trim() || 'Not Disclosed',
        oaDate: oaDate ? oaDate : undefined,
        notes: notes.trim() || undefined,
        status: currentStatus,
        // Applied fields
        oaStatus: currentStatus === 'applied' 
          ? (editCompany ? oaStatusState : 'shortlisted') 
          : undefined,
        oaRejectionReasonTags: currentStatus === 'applied' && oaStatusState === 'not_shortlisted'
          ? oaRejectionReasonTags
          : undefined,
        oaCustomReasonNote: currentStatus === 'applied' && oaStatusState === 'not_shortlisted' && oaCustomReasonNote.trim()
          ? oaCustomReasonNote.trim()
          : undefined,
        // Not applied fields
        rejectionReasonTags: currentStatus === 'not_applied' ? rejectionReasonTags : undefined,
        customReasonNote: currentStatus === 'not_applied' && customReasonNote.trim() ? customReasonNote.trim() : undefined,
      },
      editCompany ? editCompany.id : undefined
    );

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm overflow-hidden animate-fadeIn">
      <div 
        className="w-full max-w-md bg-[#131B2E] border-t sm:border border-slate-700/80 rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Drag Indicator */}
        <div className="w-10 h-1 bg-slate-700 rounded-full mx-auto my-2 shrink-0 sm:hidden" />
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800 bg-[#0B0F19]/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
              {mode === 'paste' ? <ClipboardPaste className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight leading-tight">
                {editCompany 
                  ? 'Edit Company' 
                  : mode === 'paste' 
                    ? 'Paste WhatsApp Announcement' 
                    : mode === 'parsed-confirm' 
                      ? 'Auto-Filled Company' 
                      : 'Add Company Manually'}
              </h2>
              <p className="text-[10px] text-slate-400 leading-tight">
                {mode === 'paste' 
                  ? 'Auto-extracts company details from message' 
                  : mode === 'parsed-confirm'
                    ? 'Confirm if you are applying'
                    : 'Enter drive information manually'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors active:scale-95 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* ============================================================ */}
        {/* MODE 1: SMART WHATSAPP PASTE                                */}
        {/* ============================================================ */}
        {mode === 'paste' && (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="p-4 space-y-3.5 overflow-y-auto flex-1 overscroll-contain">
              
              {/* Instructions Pill */}
              <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/30 text-xs text-indigo-200 flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <span className="font-bold text-white block mb-0.5">Quick Auto-Fill:</span>
                  Copy the full placement drive message from WhatsApp and paste it below. We'll automatically extract the company name, type (Intern/FTE/PBC), CTC, and drive date!
                </div>
              </div>

              {/* Validation Error */}
              {pasteError && (
                <div className="p-3 rounded-xl bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-start gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{pasteError}</span>
                </div>
              )}

              {/* Textarea */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    WhatsApp Message Text:
                  </label>
                  <button
                    type="button"
                    onClick={handlePasteFromClipboard}
                    className="text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    <ClipboardPaste className="w-3 h-3" />
                    <span>Paste Clipboard</span>
                  </button>
                </div>

                <textarea
                  rows={8}
                  value={rawMessage}
                  onChange={(e) => {
                    setRawMessage(e.target.value);
                    if (pasteError) setPasteError('');
                  }}
                  placeholder={`Paste the announcement here...
e.g.
*Company*: Microsoft
*Type*: Open Dream, Internship+ PBC (FTE)
*Stipend*: 1.25 lakhs PM
*Drive Date*: 25th September`}
                  className="w-full px-3.5 py-3 bg-[#0B0F19] border border-slate-700/80 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono resize-none leading-relaxed"
                  autoFocus
                />
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="p-3.5 bg-[#0B0F19]/95 border-t border-slate-800 flex items-center justify-between gap-2.5 shrink-0 pb-safe">
              <button
                type="button"
                onClick={() => setMode('manual')}
                className="py-2.5 px-3.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 active:scale-95 rounded-xl transition-all cursor-pointer"
              >
                Enter Manually Instead
              </button>
              
              <button
                type="button"
                onClick={() => handleParseWhatsApp(rawMessage)}
                className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 active:scale-[0.98] rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Parse Announcement ✨</span>
              </button>
            </div>
          </div>
        )}

        {/* ============================================================ */}
        {/* MODE 2: AUTO-FILLED CONFIRMATION VIEW                        */}
        {/* ============================================================ */}
        {mode === 'parsed-confirm' && (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-4 space-y-4 overflow-y-auto flex-1 overscroll-contain">
              
              {/* Parsed Summary Card */}
              <div className="p-4 rounded-2xl bg-[#0B0F19] border border-indigo-500/30 space-y-2.5 shadow-md shadow-black/30">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-white leading-tight">
                      {name}
                    </h3>
                    <p className="text-xs text-indigo-300 font-medium mt-0.5">
                      Type: <span className="text-white">{type}</span>
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shrink-0">
                    {tier.replace('_', ' ')}
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                  <span className="px-2.5 py-0.5 rounded-lg bg-indigo-950/60 border border-indigo-700/40 text-indigo-200 font-mono font-bold text-[11px]">
                    💰 {ctc}
                  </span>

                  {oaDate && (
                    <span className="inline-flex items-center gap-1 text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-700 font-mono text-[11px]">
                      <Calendar className="w-3 h-3 text-amber-400" />
                      Drive: {new Date(oaDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                </div>

                {notes && (
                  <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-400 whitespace-pre-line line-clamp-3">
                    {notes}
                  </div>
                )}

                {/* Edit Extracted Details Toggle */}
                <button
                  type="button"
                  onClick={() => setShowEditDetails(!showEditDetails)}
                  className="pt-1 text-[11px] font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>{showEditDetails ? 'Hide details' : 'Edit extracted details'}</span>
                  {showEditDetails ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>

                {/* Editable Details Accordion */}
                {showEditDetails && (
                  <div className="pt-3 border-t border-slate-800 space-y-3 animate-fadeIn">
                    <div>
                      <label className="block text-[10px] font-semibold text-slate-300 mb-1">Company Name</label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3 py-1.5 bg-[#131B2E] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-300 mb-1">Type (Intern, FTE, etc.)</label>
                        <input
                          type="text"
                          value={type}
                          onChange={(e) => setType(e.target.value)}
                          className="w-full px-3 py-1.5 bg-[#131B2E] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-300 mb-1">CTC / Package</label>
                        <input
                          type="text"
                          value={ctc}
                          onChange={(e) => setCtc(e.target.value)}
                          className="w-full px-3 py-1.5 bg-[#131B2E] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-300 mb-1">Category / Tier</label>
                        <select
                          value={tier}
                          onChange={(e) => setTier(e.target.value as TierCategory)}
                          className="w-full px-2.5 py-1.5 bg-[#131B2E] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                        >
                          <option value="OPEN_DREAM">Open Dream</option>
                          <option value="DREAM">Dream</option>
                          <option value="MASS">Mass</option>
                          <option value="INTERN_ONLY">Internship</option>
                          <option value="OFF_CAMPUS">Off-Campus</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-300 mb-1">Drive Date</label>
                        <input
                          type="date"
                          value={oaDate}
                          onChange={(e) => setOaDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-[#131B2E] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-semibold text-slate-300 mb-1">Notes</label>
                      <textarea
                        rows={2}
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-3 py-1.5 bg-[#131B2E] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* ============================================================ */}
              {/* THE ONLY DECISION QUESTION: APPLYING VS SKIPPED              */}
              {/* ============================================================ */}
              <div className="p-4 rounded-2xl bg-[#0B0F19] border border-slate-800 space-y-3">
                <label className="block text-xs font-bold text-white uppercase tracking-wider">
                  Are you applying for this company? <span className="text-rose-400">*</span>
                </label>

                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setStatus('applied')}
                    className={`py-3 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                      status === 'applied'
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg shadow-emerald-600/30'
                        : 'bg-[#131B2E] border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    <Check className="w-4 h-4 text-emerald-300" />
                    <span>I'm Applying</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('not_applied')}
                    className={`py-3 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${
                      status === 'not_applied'
                        ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-600/30'
                        : 'bg-[#131B2E] border-slate-700 text-slate-400 hover:text-white hover:border-slate-600'
                    }`}
                  >
                    <X className="w-4 h-4 text-rose-300" />
                    <span>Not Applying</span>
                  </button>
                </div>

                {/* If Not Applying, choose reason tags */}
                {status === 'not_applied' && (
                  <div className="pt-3 border-t border-slate-800 space-y-2.5 animate-fadeIn">
                    <span className="text-[11px] font-semibold text-rose-300 block">
                      Why are you skipping this company?
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {REJECTION_PRESET_TAGS.map((tag) => {
                        const isSelected = rejectionReasonTags.includes(tag);
                        return (
                          <button
                            key={tag}
                            type="button"
                            onClick={() => handleToggleTag(tag)}
                            className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                              isSelected
                                ? 'bg-rose-500/30 border-rose-500/70 text-rose-200 font-bold shadow-sm shadow-rose-500/20'
                                : 'bg-[#131B2E] border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                            }`}
                          >
                            <span className="text-[10px] font-bold">{isSelected ? '✓' : '+'}</span>
                            <span>{tag}</span>
                          </button>
                        );
                      })}
                    </div>

                    <div>
                      <input
                        type="text"
                        value={customReasonNote}
                        onChange={(e) => setCustomReasonNote(e.target.value)}
                        placeholder="Optional extra detail (e.g. 3 yr bond, relocate to Mumbai)..."
                        className="w-full px-3 py-1.5 bg-[#131B2E] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                      />
                    </div>
                  </div>
                )}
              </div>

            </div>

            {/* Bottom Actions */}
            <div className="p-3.5 bg-[#0B0F19]/95 border-t border-slate-800 flex items-center justify-between gap-2.5 shrink-0 pb-safe">
              <button
                type="button"
                onClick={() => setMode('paste')}
                className="py-2.5 px-3.5 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 active:scale-95 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Re-paste</span>
              </button>

              <button
                type="submit"
                className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 active:scale-[0.98] rounded-xl shadow-lg shadow-indigo-600/30 transition-all text-center cursor-pointer"
              >
                Save to Tracker
              </button>
            </div>
          </form>
        )}

        {/* ============================================================ */}
        {/* MODE 3: MANUAL ENTRY FORM                                    */}
        {/* ============================================================ */}
        {mode === 'manual' && (
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            <div className="p-4 space-y-4 overflow-y-auto flex-1 overscroll-contain">
              
              {!editCompany && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setMode('paste')}
                    className="text-xs font-semibold text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Switch to WhatsApp Paste</span>
                  </button>
                </div>
              )}

              {formError && (
                <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Company Name & Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    Company Name <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Microsoft"
                    className="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    Type (Intern, FTE, PBC, etc.)
                  </label>
                  <input
                    type="text"
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    placeholder="e.g. Intern + PBC (FTE) or FTE"
                    className="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Tier & CTC */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                    Placement Category / Tier
                  </label>
                  <select
                    value={tier}
                    onChange={(e) => setTier(e.target.value as TierCategory)}
                    className="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="OPEN_DREAM">Open Dream (≥ 12 LPA)</option>
                    <option value="DREAM">Dream (&lt; 12 LPA)</option>
                    <option value="MASS">Mass / Regular</option>
                    <option value="INTERN_ONLY">Internship Only</option>
                    <option value="OFF_CAMPUS">Off-Campus</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                    <span>CTC / Compensation</span>
                  </label>
                  <input
                    type="text"
                    value={ctc}
                    onChange={(e) => setCtc(e.target.value)}
                    placeholder="e.g. 18 LPA or 40k pm"
                    className="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              {/* Drive Date */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  <span>Drive Date</span>
                </label>
                <input
                  type="date"
                  value={oaDate}
                  onChange={(e) => setOaDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Placement Decision */}
              <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-slate-800">
                <label className="block text-xs font-semibold text-slate-200 mb-2">
                  Placement Decision:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus('applied')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      status === 'applied'
                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-md shadow-emerald-600/30'
                        : 'bg-[#131B2E] border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <Check className="w-3.5 h-3.5" />
                    <span>Applied</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('not_applied')}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      status === 'not_applied'
                        ? 'bg-rose-600 border-rose-500 text-white shadow-md shadow-rose-600/30'
                        : 'bg-[#131B2E] border-slate-700 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Skipped</span>
                  </button>
                </div>
              </div>

              {/* When Editing Applied Company: OA Shortlist status */}
              {editCompany && status === 'applied' && (
                <div className="p-3.5 rounded-xl bg-indigo-950/20 border border-indigo-800/40 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-indigo-400" />
                      OA Shortlist Status
                    </span>
                    <span className="text-[10px] text-slate-400">Online Assessment</span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setOaStatusState('shortlisted')}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        oaStatusState !== 'not_shortlisted'
                          ? 'bg-emerald-600 border-emerald-500 text-white shadow-sm'
                          : 'bg-[#0B0F19] border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Writing OA</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setOaStatusState('not_shortlisted')}
                      className={`py-2 px-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                        oaStatusState === 'not_shortlisted'
                          ? 'bg-rose-600 border-rose-500 text-white shadow-sm'
                          : 'bg-[#0B0F19] border-slate-700 text-slate-400 hover:text-white'
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Not Shortlisted</span>
                    </button>
                  </div>

                  {oaStatusState === 'not_shortlisted' && (
                    <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/50 space-y-2.5 animate-fadeIn">
                      <span className="text-[10px] font-semibold text-rose-300 block">
                        Reason for not being shortlisted:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {OA_REJECTION_PRESET_TAGS.map((tag) => {
                          const isSelected = oaRejectionReasonTags.includes(tag);
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

                      <div>
                        <input
                          type="text"
                          value={oaCustomReasonNote}
                          onChange={(e) => setOaCustomReasonNote(e.target.value)}
                          placeholder="Custom reason note..."
                          className="w-full px-3 py-1.5 bg-[#0B0F19] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* When Skipped: Rejection reasons */}
              {status === 'not_applied' && (
                <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/40 space-y-3 animate-fadeIn">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-rose-400" />
                      Reasons for Skipping
                    </span>
                    <span className="text-[10px] text-slate-400">
                      Select all that apply
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {REJECTION_PRESET_TAGS.map((tag) => {
                      const isSelected = rejectionReasonTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => handleToggleTag(tag)}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                            isSelected
                              ? 'bg-rose-500/25 border-rose-500/60 text-rose-200 font-bold shadow-sm shadow-rose-500/20'
                              : 'bg-[#0B0F19] border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                          }`}
                        >
                          <span className="text-[11px] font-bold">{isSelected ? '✓' : '+'}</span>
                          <span>{tag}</span>
                        </button>
                      );
                    })}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Custom Reason Note
                    </label>
                    <textarea
                      rows={2}
                      value={customReasonNote}
                      onChange={(e) => setCustomReasonNote(e.target.value)}
                      placeholder="e.g. 3 years bond is too long, or location not preferred..."
                      className="w-full px-3.5 py-2 bg-[#0B0F19] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                  Notes
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#0B0F19] border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

            </div>

            {/* Sticky Bottom Actions Bar */}
            <div className="p-3.5 bg-[#0B0F19]/95 border-t border-slate-800 flex items-center justify-end gap-2.5 shrink-0 pb-safe">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-4 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 active:scale-95 rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 active:scale-[0.98] rounded-xl shadow-lg shadow-indigo-600/30 transition-all text-center cursor-pointer"
              >
                {editCompany ? 'Save Changes' : 'Add Company to Tracker'}
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};
