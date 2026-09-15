import React from 'react';
import { ShieldCheck, Sparkles, Building2, Code2 } from 'lucide-react';
import { GithubIcon } from './GithubIcon';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-slate-800/80 bg-[#0B0F19] text-slate-400 text-xs">
      
      {/* Important Student & Privacy Disclaimers */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pb-8 border-b border-slate-800/80">
          
          {/* Note 1: Privacy */}
          <div className="p-4 rounded-2xl bg-[#131B2E] border border-slate-800/90 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
              <span>1. 100% Client-Side Privacy</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Everything you track is stored solely in your browser's local storage. There are no databases, no tracking cookies, and zero Google/server authentication walls. Your placement data stays strictly on your device.
            </p>
          </div>

          {/* Note 2: Design Disclaimer */}
          <div className="p-4 rounded-2xl bg-[#131B2E] border border-slate-800/90 space-y-2">
            <div className="flex items-center gap-2 text-indigo-400 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>2. Student Convenience Design</span>
            </div>
            <p className="text-slate-300 text-xs leading-relaxed">
              Designs, workflows, and visual styles are purposefully optimized for student convenience and fast tracking during intense campus placement drives, replacing messy spreadsheets with ease.
            </p>
          </div>

          {/* Note 3: Open Source & Contributions */}
          <div className="p-4 rounded-2xl bg-[#131B2E] border border-slate-800/90 space-y-2">
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
              className="inline-flex items-center gap-1.5 text-indigo-300 hover:text-white font-semibold underline text-xs"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>github.com/Shash-J/TrackMyCompany</span>
            </a>
          </div>

        </div>

        {/* Bottom Bar styled like lastminuteplacementprep.in */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-xs">
              <Building2 className="w-4 h-4" />
            </div>
            <span className="font-bold text-slate-200 text-sm">TrackMyCompany</span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400 text-xs">Built for Campus Recruitment & Placement Drives</span>
          </div>

          <div className="flex items-center gap-4 text-xs text-slate-500">
            <span>© 2026 TrackMyCompany. All rights reserved.</span>
            <a
              href="https://github.com/Shash-J/TrackMyCompany.git"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-slate-300 transition-colors flex items-center gap-1"
            >
              <GithubIcon className="w-3.5 h-3.5" />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>

    </footer>
  );
};
