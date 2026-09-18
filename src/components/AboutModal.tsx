import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  HardDrive, 
  Code2, 
  Mail, 
  Check, 
  Copy, 
  ExternalLink, 
  Building2, 
  Heart,
  Smartphone
} from 'lucide-react';
import { GithubIcon } from './GithubIcon';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenInstall?: () => void;
  isStandalone?: boolean;
}

export const AboutModal: React.FC<AboutModalProps> = ({ 
  isOpen, 
  onClose,
  onOpenInstall,
  isStandalone = false
}) => {
  const [copied, setCopied] = useState(false);
  const contactEmail = 'shasedujois@gmail.com';

  if (!isOpen) return null;

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(contactEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
      {/* Modal Container */}
      <div 
        className="w-full max-w-md bg-[#131B2E] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-left"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-800 flex items-center justify-between bg-[#0B0F19]/90">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-md shadow-indigo-500/25 border border-indigo-400/30 shrink-0">
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight leading-tight">
                  TrackMyCompany
                </h2>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                  v1.0.0
                </span>
              </div>
              <p className="text-[11px] text-slate-400 leading-tight mt-0.5">
                Campus Placement & Company Tracker
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer active:scale-95"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          
          {/* 1. Privacy Guarantee */}
          <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-emerald-500/30 space-y-1.5 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>100% Client-Side Privacy</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Your placement journey is entirely private. No telemetry, no user tracking, no sign-up forms, and no third-party analytic scripts.
            </p>
          </div>

          {/* 2. No Cloud Storage - IndexedDB & PWA */}
          <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-indigo-500/30 space-y-1.5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs">
                <HardDrive className="w-4 h-4 shrink-0" />
                <span>Persistent IndexedDB & PWA</span>
              </div>
              <span className="text-[10px] text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded border border-indigo-700/40">
                Offline Ready
              </span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              All your records, notes, and stats stay strictly on your device in your browser's persistent IndexedDB database. Works completely offline and never touches any remote cloud server.
            </p>
            {!isStandalone && onOpenInstall && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenInstall();
                }}
                className="mt-2 w-full py-2 px-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-900/30 active:scale-95 cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Add Icon to Home Screen (Install)</span>
              </button>
            )}
          </div>

          {/* 3. Open Source */}
          <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-purple-500/30 space-y-2 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-purple-400 font-bold text-xs">
                <Code2 className="w-4 h-4 shrink-0" />
                <span>Free & Open Source</span>
              </div>
              <a
                href="https://github.com/Shash-J/TrackMyCompany.git"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-purple-300 hover:text-white transition-colors font-medium bg-purple-950/60 px-2 py-0.5 rounded-md border border-purple-700/40"
              >
                <GithubIcon className="w-3 h-3" />
                <span>GitHub Repo</span>
                <ExternalLink className="w-2.5 h-2.5" />
              </a>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Built openly for students everywhere. You are free to inspect the source code, fork the repository, or contribute improvements.
            </p>
          </div>

          {/* 4. Contact Makers */}
          <div className="p-3.5 rounded-xl bg-[#0B0F19] border border-amber-500/30 space-y-2.5 shadow-sm">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-xs">
              <Mail className="w-4 h-4 shrink-0" />
              <span>Contact Makers</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed">
              Have suggestions, feedback, or need help? Reach out directly to the maker:
            </p>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
              <div className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700/80 font-mono text-xs text-amber-200 select-all flex items-center justify-between">
                <span>{contactEmail}</span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyEmail}
                  className="flex-1 sm:flex-none px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                  title="Copy email to clipboard"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5 text-slate-400" />
                      <span>Copy</span>
                    </>
                  )}
                </button>

                <a
                  href={`mailto:${contactEmail}`}
                  className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-900/30 cursor-pointer active:scale-95"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Send Email</span>
                </a>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-3.5 bg-[#0B0F19]/95 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <span className="flex items-center gap-1">
            Built with <Heart className="w-3 h-3 text-rose-500 fill-rose-500 inline" /> for placement prep
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
