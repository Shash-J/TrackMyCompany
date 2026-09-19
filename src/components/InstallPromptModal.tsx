import React, { useState } from 'react';
import { 
  X, 
  Smartphone, 
  ShieldCheck, 
  WifiOff, 
  GraduationCap, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Lock, 
  Share, 
  Code2, 
  Monitor, 
  AlertTriangle
} from 'lucide-react';

interface InstallPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  deferredPrompt: any;
}

export const InstallPromptModal: React.FC<InstallPromptModalProps> = ({
  isOpen,
  onClose,
  deferredPrompt,
}) => {
  const [isKnowMoreOpen, setIsKnowMoreOpen] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [showManualGuide, setShowManualGuide] = useState(false);

  if (!isOpen) return null;

  // Platform detection
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
  const isAndroid = typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent);
  const isDesktop = !isIOS && !isAndroid;

  // Protocol detection: Chrome disables PWAs on insecure HTTP (showing "Not secure")
  const isHttp = typeof window !== 'undefined' && window.location.protocol === 'http:' && window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

  const handleSwitchToHttps = () => {
    if (typeof window !== 'undefined') {
      window.location.replace('https://' + window.location.host + window.location.pathname + window.location.search + window.location.hash);
    }
  };

  const handleInstallClick = async () => {
    // 1. If connection is on insecure HTTP, immediately redirect to HTTPS
    if (isHttp) {
      handleSwitchToHttps();
      return;
    }

    // 2. Check for install prompt from prop or early window capture
    const promptEvent = deferredPrompt || (typeof window !== 'undefined' ? (window as any).__deferredInstallPrompt : null);

    if (promptEvent && typeof promptEvent.prompt === 'function') {
      setIsInstalling(true);
      try {
        await promptEvent.prompt();
        const choice = await promptEvent.userChoice;
        if (choice?.outcome === 'accepted') {
          console.log('[PWA] User accepted installation prompt');
        }
      } catch (err) {
        console.error('[PWA] Installation prompt failed:', err);
        setShowManualGuide(true);
      } finally {
        setIsInstalling(false);
        onClose();
      }
      return;
    }

    // 3. If prompt is not directly callable (e.g. desktop quiet mode or iOS Safari), display the clear guide
    setShowManualGuide(true);
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="w-full max-w-sm bg-[#131B2E] border border-indigo-500/40 rounded-3xl shadow-2xl shadow-indigo-950/50 overflow-hidden flex flex-col text-left relative max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Glow ambient background effect */}
        <div className="absolute -top-16 -left-16 w-32 h-32 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3.5 right-3.5 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800/80 rounded-full transition-colors cursor-pointer active:scale-95 z-10"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Header with App Logo & Verified Badge */}
        <div className="p-5 pb-3 flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 p-0.5 shadow-lg shadow-indigo-500/30 shrink-0 flex items-center justify-center">
            <div className="w-full h-full bg-[#0B0F19] rounded-[14px] flex items-center justify-center">
              {isDesktop ? (
                <Monitor className="w-6 h-6 text-indigo-400" />
              ) : (
                <Smartphone className="w-6 h-6 text-indigo-400" />
              )}
            </div>
          </div>
          
          <div className="min-w-0 flex-1 pr-6">
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 border border-emerald-500/30 px-2 py-0.5 rounded-full flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                Verified & Safe
              </span>
            </div>
            <h3 className="text-base font-bold text-white tracking-tight leading-snug">
              {isDesktop ? 'Install on Desktop / Laptop' : 'Add icon to home screen'}
            </h3>
            <p className="text-[11px] text-slate-400 leading-tight">
              One-tap offline access for your placement drives
            </p>
          </div>
        </div>

        {/* Content Body */}
        <div className="px-5 pb-4 space-y-3">
          
          {/* Quick Highlight Cards */}
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            <div className="p-2.5 rounded-xl bg-[#0B0F19]/80 border border-slate-800 flex items-center gap-2 text-slate-300">
              <WifiOff className="w-4 h-4 text-indigo-400 shrink-0" />
              <span>Works 100% Offline</span>
            </div>
            <div className="p-2.5 rounded-xl bg-[#0B0F19]/80 border border-slate-800 flex items-center gap-2 text-slate-300">
              <GraduationCap className="w-4 h-4 text-purple-400 shrink-0" />
              <span>Built for RVCE students</span>
            </div>
          </div>

          {/* Insecure HTTP Warning Banner */}
          {isHttp && (
            <div className="p-3.5 rounded-2xl bg-amber-950/60 border border-amber-500/50 text-amber-200 text-xs space-y-2 animate-fadeIn">
              <div className="flex items-center gap-1.5 font-bold text-amber-300 text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                <span>Connection shows &quot;Not secure&quot;</span>
              </div>
              <p className="text-[11px] text-amber-200/90 leading-relaxed">
                Chrome strictly disables 1-click app installation on unencrypted HTTP. Click below to reload via secure HTTPS.
              </p>
              <button
                type="button"
                onClick={handleSwitchToHttps}
                className="w-full py-2 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                Switch to HTTPS Now
              </button>
            </div>
          )}

          {/* Step-by-step guidance shown only when direct prompt is quiet or requested */}
          {showManualGuide && !isHttp && (
            <div className="p-3.5 rounded-2xl bg-indigo-950/50 border border-indigo-500/40 text-xs text-slate-200 space-y-2.5 animate-fadeIn">
              <div className="flex items-center gap-1.5 text-indigo-300 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>How to Install on this Device:</span>
              </div>

              {isDesktop && (
                <div className="space-y-2 text-[11px] text-slate-300">
                  <div className="p-2.5 rounded-xl bg-[#0B0F19]/90 border border-slate-800 space-y-1">
                    <strong className="text-white flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-indigo-600 text-[10px] flex items-center justify-center text-white shrink-0">1</span>
                      Address Bar Icon (Fastest)
                    </strong>
                    <p className="text-slate-400 leading-relaxed pl-5">
                      Look at the right end of your address bar for the <span className="text-indigo-300 font-semibold">Install icon</span> (monitor with down arrow) and click <strong>Install</strong>.
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#0B0F19]/90 border border-slate-800 space-y-1">
                    <strong className="text-white flex items-center gap-1.5">
                      <span className="w-4 h-4 rounded-full bg-indigo-600 text-[10px] flex items-center justify-center text-white shrink-0">2</span>
                      Via Chrome Menu
                    </strong>
                    <p className="text-slate-400 leading-relaxed pl-5">
                      Click <strong>Three Dots (⋮)</strong> ➡️ <strong>&quot;Cast, save and share&quot;</strong> ➡️ <strong>&quot;Install TrackMyCompany&quot;</strong> (or <strong>&quot;Create shortcut...&quot;</strong> and check <em>Open as window</em>).
                    </p>
                  </div>
                </div>
              )}

              {isAndroid && (
                <ol className="text-[11px] text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                  <li>Tap the <strong>Three Dots (⋮)</strong> menu in the top-right corner of Chrome.</li>
                  <li>Tap <strong>&quot;Install app&quot;</strong> or <strong>&quot;Add to Home screen&quot;</strong>.</li>
                  <li>Confirm by tapping <strong>Add / Install</strong>.</li>
                </ol>
              )}

              {isIOS && (
                <ol className="text-[11px] text-slate-300 space-y-1.5 list-decimal list-inside leading-relaxed">
                  <li>Tap the <strong>Share</strong> button <Share className="w-3 h-3 inline text-indigo-400 mx-0.5" /> at the bottom in Safari.</li>
                  <li>Scroll down and tap <strong>Add to Home Screen</strong>.</li>
                  <li>Tap <strong>Add</strong> in the top-right corner.</li>
                </ol>
              )}
            </div>
          )}

          {/* "Know More" Toggle Section */}
          <div className="rounded-2xl bg-[#0B0F19]/90 border border-slate-800/90 overflow-hidden transition-all">
            <button
              type="button"
              onClick={() => setIsKnowMoreOpen((prev) => !prev)}
              className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold text-slate-300 hover:text-indigo-400 transition-colors cursor-pointer select-none"
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[11px]">Know more</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-indigo-400 font-medium">
                <span>{isKnowMoreOpen ? 'Hide' : 'Details'}</span>
                {isKnowMoreOpen ? (
                  <ChevronUp className="w-3.5 h-3.5" />
                ) : (
                  <ChevronDown className="w-3.5 h-3.5" />
                )}
              </div>
            </button>

            {isKnowMoreOpen && (
              <div className="px-3.5 pb-3.5 pt-1 border-t border-slate-800/60 text-[11px] text-slate-300 space-y-2 animate-fadeIn">
                <div className="flex items-start gap-2">
                  <Lock className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong className="text-emerald-400">100% Safe & Secure:</strong> No passwords, no login, and zero external tracking. All data is saved exclusively inside your browser's private IndexedDB storage.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <Code2 className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong className="text-cyan-300">Source-Available & Private:</strong> TrackMyCompany is a source-available placement tracker, free for students, education, research, personal use, and other non-commercial purposes. 100% private, no cloud storage, and no login required.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <WifiOff className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong className="text-indigo-300">No Internet Required:</strong> Even on weak campus Wi-Fi or airplane mode, you can instantly check drive dates, eligibility, and your application status.
                  </p>
                </div>

                <div className="flex items-start gap-2">
                  <GraduationCap className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong className="text-purple-300">Built for RVCE Students:</strong> Tailored specifically for RVCE placement seasons to eliminate annoying spreadsheets and WhatsApp chaos.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons: Always actionable and direct! */}
          <div className="space-y-2 pt-1">
            <button
              type="button"
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.98] text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isDesktop ? <Monitor className="w-4 h-4" /> : <Smartphone className="w-4 h-4" />}
              <span>{isInstalling ? 'Installing...' : isDesktop ? 'Install App on Desktop' : 'Add to Home Screen'}</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 px-4 bg-slate-800/80 hover:bg-slate-800 text-slate-400 hover:text-slate-200 text-xs font-medium rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
