import React, { useState } from 'react';
import { ShieldCheck, Sparkles, Code2, ChevronDown, ChevronUp } from 'lucide-react';
import { GithubIcon } from './GithubIcon';

export const Footer: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <footer className="mt-8 mb-6 px-4">
      <div className="max-w-md mx-auto flex flex-col items-center">
        
        {/* Ultra-Reduced Collapsed Trigger */}
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#131B2E]/60 hover:bg-[#131B2E] border border-slate-800 text-[11px] text-slate-400 hover:text-slate-200 transition-all select-none active:scale-95"
          title="Click to view details"
        >
          <span>TrackMyCompany • Info & Privacy</span>
          {isExpanded ? (
            <ChevronUp className="w-3 h-3 text-indigo-400" />
          ) : (
            <ChevronDown className="w-3 h-3 text-slate-500" />
          )}
        </button>

        {/* Expanded Info: Only shown when clicked */}
        {isExpanded && (
          <div className="w-full mt-3 p-4 bg-[#131B2E] border border-slate-800 rounded-2xl shadow-xl space-y-3.5 animate-fadeIn text-left text-xs">
            
            {/* 1. Privacy */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 font-semibold text-xs">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>100% Client-Side Privacy</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                All data is stored exclusively in your browser's local storage. No databases, no telemetry, and no sign-in required.
              </p>
            </div>

            {/* 2. Convenience */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-indigo-400 font-semibold text-xs">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Student Convenience</span>
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Designed for quick campus placement tracking directly from your WhatsApp groups.
              </p>
            </div>

            {/* 3. Source Available */}
            <div className="space-y-1 pt-1 border-t border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-purple-400 font-semibold text-xs">
                <Code2 className="w-3.5 h-3.5" />
                <span>Source Available</span>
              </div>

              <a
                href="https://github.com/Shash-J/TrackMyCompany.git"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-slate-300 hover:text-white transition-colors"
              >
                <GithubIcon className="w-3 h-3" />
                <span>GitHub Repo</span>
              </a>
            </div>

            <div className="text-center pt-1 border-t border-slate-800/60">
              <button
                onClick={() => setIsExpanded(false)}
                className="text-[10px] text-slate-500 hover:text-slate-300 font-medium py-0.5"
              >
                Close ▴
              </button>
            </div>

          </div>
        )}

      </div>
    </footer>
  );
};
