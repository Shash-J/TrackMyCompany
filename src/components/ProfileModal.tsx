import React, { useState, useEffect } from 'react';
import { ShieldCheck, GraduationCap, ArrowRight, X } from 'lucide-react';
import type { StudentProfile } from '../types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentProfile: StudentProfile | null;
  onSave: (profile: StudentProfile) => void;
  isFirstTime?: boolean;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  currentProfile,
  onSave,
  isFirstTime = false,
}) => {
  const [name, setName] = useState('');
  const [branch, setBranch] = useState('');
  const [batch, setBatch] = useState('2026');
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentProfile) {
      setName(currentProfile.name || '');
      setBranch(currentProfile.branch || '');
      setBatch(currentProfile.batch || '2026');
    }
  }, [currentProfile, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Student Name is required to personalize your placement tracker.');
      return;
    }
    setError('');
    onSave({
      name: name.trim(),
      branch: branch.trim() || undefined,
      batch: batch.trim() || '2026',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-md bg-[#131B2E] border border-slate-700/80 rounded-2xl shadow-2xl p-6 relative overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow effect background */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-start justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">
                {isFirstTime ? 'Welcome to TrackMyCompany' : 'Student Profile'}
              </h2>
              <p className="text-xs text-slate-400">
                {isFirstTime ? 'Set up your student profile to start tracking' : 'Manage your campus placement profile'}
              </p>
            </div>
          </div>
          {!isFirstTime && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Privacy Highlight Banner */}
        <div className="my-4 p-3 rounded-xl bg-indigo-950/40 border border-indigo-900/60 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
          <p className="text-xs text-indigo-200/90 leading-relaxed">
            <span className="font-semibold text-white">100% Private & Local:</span> No login or passwords required. All your applications and notes are saved directly in your browser.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Field (Mandatory) */}
          <div>
            <label className="block text-xs font-semibold text-slate-200 mb-1.5">
              Your Name <span className="text-rose-400">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (error) setError('');
              }}
              placeholder="e.g. Rahul / Alex"
              className="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-slate-700/80 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
            />
            {error && <p className="text-xs text-rose-400 mt-1 font-medium">{error}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Branch / Department */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Department / Branch
              </label>
              <input
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="e.g. CSE, ISE, ECE"
                className="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-slate-700/80 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>

            {/* Batch */}
            <div>
              <label className="block text-xs font-semibold text-slate-200 mb-1.5">
                Batch / Grad Year
              </label>
              <input
                type="text"
                value={batch}
                onChange={(e) => setBatch(e.target.value)}
                placeholder="e.g. 2026"
                className="w-full px-3.5 py-2.5 bg-[#0B0F19] border border-slate-700/80 rounded-xl text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-sm rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
            >
              <span>{isFirstTime ? 'Enter Placement Tracker' : 'Save Profile Changes'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
