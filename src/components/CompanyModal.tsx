import React, { useState, useEffect } from 'react';
import { X, Building2, Calendar, DollarSign, Check, Award, AlertCircle, Tag } from 'lucide-react';
import type { Company, TierCategory, ApplicationStatus, RejectionReasonTag, PriorityLevel, OAShortlistStatus } from '../types';
import { REJECTION_PRESET_TAGS } from '../services/storage';

interface CompanyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (companyData: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>, editId?: string) => void;
  editCompany?: Company | null;
  defaultStatus?: ApplicationStatus;
}

export const CompanyModal: React.FC<CompanyModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editCompany,
  defaultStatus = 'applied',
}) => {
  const [name, setName] = useState('');
  const [role, setRole] = useState('Software Development Engineer');
  const [tier, setTier] = useState<TierCategory>('OPEN_DREAM');
  const [ctc, setCtc] = useState('');
  const [businessModel, setBusinessModel] = useState('');
  const [notes, setNotes] = useState('');

  const [status, setStatus] = useState<ApplicationStatus>(defaultStatus);

  // When Applied
  const [formSubmitted, setFormSubmitted] = useState(true);
  const [priority, setPriority] = useState<PriorityLevel>('High');
  const [oaDate, setOaDate] = useState('');
  const [oaStatus, setOaStatus] = useState<OAShortlistStatus>('pending');

  // When Not Applied
  const [rejectionReasonTag, setRejectionReasonTag] = useState<RejectionReasonTag>('Low CTC');
  const [customReasonNote, setCustomReasonNote] = useState('');

  const [error, setError] = useState('');

  useEffect(() => {
    if (editCompany) {
      setName(editCompany.name);
      setRole(editCompany.role || '');
      setTier(editCompany.tier || 'DREAM');
      setCtc(editCompany.ctc || '');
      setBusinessModel(editCompany.businessModel || '');
      setNotes(editCompany.notes || '');
      setStatus(editCompany.status);

      setFormSubmitted(editCompany.formSubmitted ?? true);
      setPriority(editCompany.priority || 'High');
      setOaDate(editCompany.oaDate || editCompany.applicationDeadline || '');
      setOaStatus(editCompany.oaStatus || 'pending');

      setRejectionReasonTag(editCompany.rejectionReasonTag || 'Low CTC');
      setCustomReasonNote(editCompany.customReasonNote || '');
    } else {
      // Reset form
      setName('');
      setRole('Software Development Engineer');
      setTier('OPEN_DREAM');
      setCtc('');
      setBusinessModel('');
      setNotes('');
      setStatus(defaultStatus);
      setFormSubmitted(true);
      setPriority('High');
      setOaDate('');
      setOaStatus('pending');
      setRejectionReasonTag('Low CTC');
      setCustomReasonNote('');
    }
    setError('');
  }, [editCompany, isOpen, defaultStatus]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Company Name is required.');
      return;
    }

    onSave(
      {
        name: name.trim(),
        role: role.trim() || 'Software Engineer',
        tier,
        ctc: ctc.trim() || 'Not Disclosed',
        businessModel: businessModel.trim() || undefined,
        formLink: editCompany?.formLink || undefined,
        applicationDeadline: oaDate || editCompany?.applicationDeadline || undefined,
        notes: notes.trim() || undefined,
        status,
        // Applied fields
        formSubmitted: status === 'applied' ? formSubmitted : undefined,
        formSubmittedDate: status === 'applied' ? (editCompany?.formSubmittedDate || new Date().toISOString()) : undefined,
        priority: status === 'applied' ? priority : undefined,
        oaDate: oaDate ? oaDate : undefined,
        oaStatus: status === 'applied' ? oaStatus : undefined,
        // Not applied fields
        rejectionReasonTag: status === 'not_applied' ? rejectionReasonTag : undefined,
        customReasonNote: status === 'not_applied' && customReasonNote.trim() ? customReasonNote.trim() : undefined,
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
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight leading-tight">
                {editCompany ? 'Edit Company' : 'Add Campus Company'}
              </h2>
              <p className="text-[10px] text-slate-400 leading-tight">
                Placement WhatsApp drive record
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-4 space-y-4 overflow-y-auto flex-1 overscroll-contain">
          
          {error && (
            <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Company Name & Role */}
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
                className="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Role / Job Profile
              </label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Tier / Category & CTC */}
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
                <span>CTC / Compensation (Text Input)</span>
              </label>
              <input
                type="text"
                value={ctc}
                onChange={(e) => setCtc(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Decision Status Selector (Applied vs Not Applied vs Undecided) */}
          <div className="p-4 rounded-xl bg-[#0B0F19] border border-slate-800">
            <label className="block text-xs font-semibold text-slate-200 mb-2">
              Your Placement Decision for this Company:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setStatus('applied')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
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
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  status === 'not_applied'
                    ? 'bg-rose-600 border-rose-500 text-white shadow-md shadow-rose-600/30'
                    : 'bg-[#131B2E] border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <X className="w-3.5 h-3.5" />
                <span>Not Applied</span>
              </button>

              <button
                type="button"
                onClick={() => setStatus('undecided')}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  status === 'undecided'
                    ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-[#131B2E] border-slate-700 text-slate-300 hover:border-slate-600'
                }`}
              >
                <span>Undecided</span>
              </button>
            </div>
          </div>

          {/* DYNAMIC SECTION: IF APPLIED */}
          {status === 'applied' && (
            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-800/40 space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Application & OA Drive Details
                </span>
                <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                  <input
                    type="checkbox"
                    checked={formSubmitted}
                    onChange={(e) => setFormSubmitted(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 bg-[#0B0F19] border-slate-700"
                  />
                  <span>Form Submitted</span>
                </label>
              </div>

              {/* Priority */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                  className="w-full px-3 py-2 bg-[#0B0F19] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="High">P1 - High Priority</option>
                  <option value="Medium">P2 - Medium Priority</option>
                  <option value="Low">P3 - Low Priority</option>
                </select>
              </div>

              {/* OA Shortlist Status */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-amber-400" />
                  <span>OA Shortlist Status (Did college shortlist you to write OA?)</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setOaStatus('pending')}
                    className={`py-1.5 px-2 rounded-lg border text-xs text-center transition-all ${
                      oaStatus === 'pending'
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-200 font-bold'
                        : 'bg-[#0B0F19] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    ⏳ Pending
                  </button>
                  <button
                    type="button"
                    onClick={() => setOaStatus('shortlisted')}
                    className={`py-1.5 px-2 rounded-lg border text-xs text-center transition-all ${
                      oaStatus === 'shortlisted'
                        ? 'bg-emerald-500/25 border-emerald-500/60 text-emerald-200 font-bold'
                        : 'bg-[#0B0F19] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    🎉 Shortlisted
                  </button>
                  <button
                    type="button"
                    onClick={() => setOaStatus('not_shortlisted')}
                    className={`py-1.5 px-2 rounded-lg border text-xs text-center transition-all ${
                      oaStatus === 'not_shortlisted'
                        ? 'bg-rose-500/25 border-rose-500/60 text-rose-200 font-bold'
                        : 'bg-[#0B0F19] border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    ❌ Not Shortlisted
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* DYNAMIC SECTION: IF NOT APPLIED (REJECTION REASONS) */}
          {status === 'not_applied' && (
            <div className="p-4 rounded-xl bg-rose-950/20 border border-rose-800/40 space-y-3 animate-fadeIn">
              <span className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                <Tag className="w-4 h-4 text-rose-400" />
                Reason for Not Applying / Rejection Tag
              </span>

              {/* Preset Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {REJECTION_PRESET_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setRejectionReasonTag(tag)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                      rejectionReasonTag === tag
                        ? 'bg-rose-500/25 border-rose-500/60 text-rose-200 font-bold shadow-sm shadow-rose-500/20'
                        : 'bg-[#0B0F19] border-slate-700 text-slate-400 hover:text-slate-200 hover:border-slate-600'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>

              {/* Custom Reason Note */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Custom Reason / Extra Note {rejectionReasonTag === 'Other' && <span className="text-rose-400">*</span>}
                </label>
                <textarea
                  rows={2}
                  value={customReasonNote}
                  onChange={(e) => setCustomReasonNote(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#0B0F19] border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          )}

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
              className="py-2.5 px-4 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 active:scale-95 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 px-4 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 active:scale-[0.98] rounded-xl shadow-lg shadow-indigo-600/30 transition-all text-center"
            >
              {editCompany ? 'Save Changes' : 'Add Company to Tracker'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
