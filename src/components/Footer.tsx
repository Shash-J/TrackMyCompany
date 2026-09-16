import React, { useState } from 'react';
import { ShieldCheck, Sparkles, Code2, ChevronDown, ChevronUp, Building2 } from 'lucide-react';
import { GithubIcon } from './GithubIcon';

type InfoKeyword = 'privacy' | 'design' | 'opensource' | null;

export const Footer: React.FC = () => {
  const [activeKeyword, setActiveKeyword] = useState<InfoKeyword>(null);

  const toggleKeyword = (keyword: InfoKeyword) => {
    setActiveKeyword((prev) => (prev === keyword ? null : keyword));
  };

  return (
    <footer className="mt-10 mb-8 border-t border-slate-800/80 bg-[#0B0F19] text-slate-400 text-xs">
      <div className="max-w-md md:max-w-5xl lg:max-w-6xl mx-auto px-3.5 sm:px-6 lg:px-8 py-6 space-y-4">
        
        {/* Unified Single Footer Bar */}
        <div className="flex flex-col md:flex-row items-center justify-between text-center md:text-left gap-4">
          
          {/* Left: Brand Identity */}
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 rounded bg-indigo-600 flex items-center justify-center text-white text-[10px] font-bold">
              <Building2 className="w-3 h-3" />
            </div>
            <span className="font-semibold text-slate-200 text-xs">TrackMyCompany</span>
            <span className="text-slate-600">•</span>
            <span className="text-xs text-slate-400">Built for campus recruitment</span>
          </div>

          {/* Center: Expandable Keywords */}
          <div className="flex flex-wrap items-center justify-center gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mr-1 hidden sm:inline">
              About:
            </span>

            {/* Keyword 1: Privacy */}
            <button
              onClick={() => toggleKeyword('privacy')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeKeyword === 'privacy'
                  ? 'bg-emerald-950/70 border-emerald-500 text-emerald-300 shadow-md shadow-emerald-500/10'
                  : 'bg-[#131B2E] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Privacy</span>
              {activeKeyword === 'privacy' ? (
                <ChevronUp className="w-3 h-3 text-emerald-400" />
              ) : (
                <ChevronDown className="w-3 h-3 text-slate-500" />
              )}
            </button>

            {/* Keyword 2: Design Disclaimer */}
            <button
              onClick={() => toggleKeyword('design')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeKeyword === 'design'
                  ? 'bg-indigo-950/70 border-indigo-500 text-indigo-300 shadow-md shadow-indigo-500/10'
                  : 'bg-[#131B2E] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              <span>Design Disclaimer</span>
              {activeKeyword === 'design' ? (
                <ChevronUp className="w-3 h-3 text-indigo-400" />
              ) : (
                <ChevronDown className="w-3 h-3 text-slate-500" />
              )}
            </button>

            {/* Keyword 3: Open Source */}
            <button
              onClick={() => toggleKeyword('opensource')}
              className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-all flex items-center gap-1.5 ${
                activeKeyword === 'opensource'
                  ? 'bg-purple-950/70 border-purple-500 text-purple-300 shadow-md shadow-purple-500/10'
                  : 'bg-[#131B2E] border-slate-800 text-slate-300 hover:border-slate-700 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5 text-purple-400" />
              <span>Open Source</span>
              {activeKeyword === 'opensource' ? (
                <ChevronUp className="w-3 h-3 text-purple-400" />
              ) : (
                <ChevronDown className="w-3 h-3 text-slate-500" />
              )}
            </button>
          </div>

          {/* Right: Copyright & GitHub */}
          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>© 2026 TrackMyCompany</span>
            <a
              href="https://github.com/Shash-J/TrackMyCompany.git"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300 transition-colors flex items-center gap-1 font-medium"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          </div>

        </div>

        {/* Smooth Expanded Card Content */}
        {activeKeyword && (
          <div className="w-full max-w-2xl mx-auto bg-[#131B2E] border border-slate-700/80 rounded-2xl p-5 shadow-xl animate-fadeIn mt-3">
            
            {activeKeyword === 'privacy' && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <ShieldCheck className="w-4 h-4" />
                  <span>1. 100% Client-Side Privacy</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Everything you track is stored solely in your browser's local storage. There are no databases, no tracking cookies, and zero Google/server authentication walls. Your placement data stays strictly on your device.
                </p>
              </div>
            )}

            {activeKeyword === 'design' && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
                  <Sparkles className="w-4 h-4" />
                  <span>2. Student Convenience Design</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Designs, workflows, and visual styles are purposefully chosen at student's convenience for fast tracking during intense campus placement drives, replacing messy spreadsheets with ease.
                </p>
              </div>
            )}

            {activeKeyword === 'opensource' && (
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                  <Code2 className="w-4 h-4" />
                  <span>3. Open Source Project</span>
                </div>
                <p className="text-slate-300 text-xs leading-relaxed">
                  TrackMyCompany is open source! Feel free to contribute features, report bugs, or submit pull requests on GitHub:
                </p>
                <a
                  href="https://github.com/Shash-J/TrackMyCompany.git"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-indigo-300 hover:text-white font-semibold underline text-xs pt-1"
                >
                  <GithubIcon className="w-3.5 h-3.5" />
                  <span>github.com/Shash-J/TrackMyCompany</span>
                </a>
              </div>
            )}

          </div>
        )}

      </div>
    </footer>
  );
};
