import React, { useState, useEffect } from 'react';
import { X, Building2, Calendar, Link as LinkIcon, DollarSign, Check, Award, AlertCircle, Tag } from 'lucide-react';
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
  const [formLink, setFormLink] = useState('');
  const [applicationDeadline, setApplicationDeadline] = useState('');
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
      setFormLink(editCompany.formLink || '');
      setApplicationDeadline(editCompany.applicationDeadline || '');
      setNotes(editCompany.notes || '');
      setStatus(editCompany.status);

      setFormSubmitted(editCompany.formSubmitted ?? true);
      setPriority(editCompany.priority || 'High');
      setOaDate(editCompany.oaDate || '');
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
      setFormLink('');
      setApplicationDeadline('');
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
        formLink: formLink.trim() || undefined,
        applicationDeadline: applicationDeadline || undefined,
        notes: notes.trim() || undefined,
        status,
        // Applied fields
        formSubmitted: status === 'applied' ? formSubmitted : undefined,
        formSubmittedDate: status === 'applied' ? (editCompany?.formSubmittedDate || new Date().toISOString()) : undefined,
        priority: status === 'applied' ? priority : undefined,
        oaDate: status === 'applied' && oaDate ? oaDate : undefined,
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div 
        className="w-full max-w-xl bg-[#131B2E] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-[#0B0F19]/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                {editCompany ? 'Edit Company Information' : 'Add Campus Recruitment Company'}
              </h2>
              <p className="text-xs text-slate-400">
                Track drives posted in your WhatsApp group or college portal
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
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
                placeholder="e.g. PhonePe, SAP, Oracle, Cisco"
                className="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-slate-700/80 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
                placeholder="e.g. SDE, Data Analyst, Member Tech Staff"
                className="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-slate-700/80 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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
                placeholder="e.g. 14 LPA, 8.5 + 1L Bonus, ₹40k/mo"
                className="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-slate-700/80 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
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

              {/* Priority & OA Date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-amber-400" />
                    <span>OA Drive Date</span>
                  </label>
                  <input
                    type="date"
                    value={oaDate}
                    onChange={(e) => setOaDate(e.target.value)}
                    className="w-full px-3 py-2 bg-[#0B0F19] border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
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
                  placeholder="e.g. Relocation to Gurugram not preferred, or strictly preparing for product firms..."
                  className="w-full px-3.5 py-2 bg-[#0B0F19] border border-slate-700 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-rose-500"
                />
              </div>
            </div>
          )}

          {/* Google Form Link & Deadline */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5 flex items-center gap-1">
                <LinkIcon className="w-3.5 h-3.5 text-indigo-400" />
                <span>Google Form / Notification Link</span>
              </label>
              <input
                type="url"
                value={formLink}
                onChange={(e) => setFormLink(e.target.value)}
                placeholder="https://forms.gle/..."
                className="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-slate-700/80 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Application Deadline
              </label>
              <input
                type="date"
                value={applicationDeadline}
                onChange={(e) => setApplicationDeadline(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-slate-700/80 rounded-xl text-sm text-white focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              Personal Placement Notes / Preparation Focus
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Focus on Trees, Graphs, DBMS SQL queries, and System Design basics..."
              className="w-full px-3.5 py-2 bg-[#0B0F19] border border-slate-700/80 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
            >
              {editCompany ? 'Save Changes' : 'Add Company to Tracker'}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
