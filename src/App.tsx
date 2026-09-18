import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Search, 
  Plus, 
  Building2, 
  FileSpreadsheet, 
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { 
  Company, 
  StudentProfile, 
  OAShortlistStatus, 
  ApplicationStatus,
  OARejectionReasonTag,
  RejectionReasonTag
} from './types';

/**
 * Safely parse various date string formats (YYYY-MM-DD, DD/MM/YYYY, DD-MM-YYYY)
 * to local midnight timestamp, avoiding timezone skew.
 */
const parseDateToTimestamp = (dateStr?: string): number | null => {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const s = dateStr.trim();
  if (!s) return null;

  // 1. Check YYYY-MM-DD or YYYY/MM/DD
  const ymdMatch = s.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (ymdMatch) {
    const y = parseInt(ymdMatch[1], 10);
    const m = parseInt(ymdMatch[2], 10) - 1;
    const d = parseInt(ymdMatch[3], 10);
    const date = new Date(y, m, d);
    date.setHours(0, 0, 0, 0);
    return isNaN(date.getTime()) ? null : date.getTime();
  }

  // 2. Check DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = s.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (dmyMatch) {
    const d = parseInt(dmyMatch[1], 10);
    const m = parseInt(dmyMatch[2], 10) - 1;
    const y = parseInt(dmyMatch[3], 10);
    const date = new Date(y, m, d);
    date.setHours(0, 0, 0, 0);
    return isNaN(date.getTime()) ? null : date.getTime();
  }

  // 3. Fallback to standard Date parsing
  const parsed = new Date(s);
  if (!isNaN(parsed.getTime())) {
    parsed.setHours(0, 0, 0, 0);
    return parsed.getTime();
  }

  return null;
};

const formatDriveDate = (dateStr: string): string => {
  const ts = parseDateToTimestamp(dateStr);
  if (ts !== null) {
    return new Date(ts).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  }
  return dateStr;
};

type CompanyListGroup = 'applied_shortlisted' | 'applied_not_shortlisted' | 'skipped';

const getCompanyGroup = (company: Company): CompanyListGroup => {
  if (company.status === 'not_applied') return 'skipped';
  if (company.oaStatus === 'not_shortlisted') return 'applied_not_shortlisted';
  return 'applied_shortlisted';
};
import { 
  getCompanies, 
  saveCompanies, 
  addCompany, 
  updateCompany, 
  deleteCompany, 
  getProfile, 
  saveProfile, 
  calculateStatistics,
  initStorage
} from './services/storage';
import { Navbar } from './components/Navbar';
import type { NavTab } from './components/Navbar';
import { MobileBottomNav } from './components/MobileBottomNav';
import { CompanyCard } from './components/CompanyCard';
import { CompanyModal } from './components/CompanyModal';
import { ProfileModal } from './components/ProfileModal';
import { StatsView } from './components/StatsView';
import { ImportExportModal } from './components/ImportExportModal';
import { AboutModal } from './components/AboutModal';
import { InstallPromptModal } from './components/InstallPromptModal';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  // Application Data States
  const [companies, setCompanies] = useState<Company[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  // Navigation: Exactly two tabs ('dashboard' | 'statistics')
  const [currentTab, setCurrentTab] = useState<NavTab>('dashboard');

  // Dashboard Filter State: Applied companies by default (strictly 'applied' | 'not_applied')
  const [statusFilter, setStatusFilter] = useState<'applied' | 'not_applied'>('applied');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllUpcoming, setShowAllUpcoming] = useState(false);

  // Modals
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [isInstallPromptOpen, setIsInstallPromptOpen] = useState(false);
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);
  const [importExportInitialTab, setImportExportInitialTab] = useState<'import' | 'export' | 'backup'>('export');
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [defaultStatusForModal, setDefaultStatusForModal] = useState<ApplicationStatus>('applied');
  const [isStandalone, setIsStandalone] = useState(() => {
    if (typeof window === 'undefined') return false;
    return (
      (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
      ((navigator as any).standalone === true)
    );
  });

  // Load initial data from IndexedDB
  useEffect(() => {
    let isMounted = true;

    const loadInitialData = async () => {
      try {
        await initStorage();
        const loadedCompanies = await getCompanies();
        const loadedProfile = await getProfile();

        if (!isMounted) return;
        setCompanies(loadedCompanies);
        setProfile(loadedProfile);

        // If student hasn't entered a name yet, prompt on first visit
        if (!loadedProfile || !loadedProfile.name) {
          setIsProfileModalOpen(true);
        }
      } catch (err) {
        console.error('Failed to load initial data from storage', err);
      }
    };

    loadInitialData();

    const handleStorageChange = async () => {
      const freshCompanies = await getCompanies();
      const freshProfile = await getProfile();
      if (isMounted) {
        setCompanies(freshCompanies);
        setProfile(freshProfile);
      }
    };

    window.addEventListener('storage-companies-change', handleStorageChange);
    window.addEventListener('storage-profile-change', handleStorageChange);

    return () => {
      isMounted = false;
      window.removeEventListener('storage-companies-change', handleStorageChange);
      window.removeEventListener('storage-profile-change', handleStorageChange);
    };
  }, []);

  // Handle PWA installation prompt & daily trigger
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredInstallPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsStandalone(true);
      setIsInstallPromptOpen(false);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Check if running in standalone mode (already installed as PWA)
    const isCurrentlyStandalone = 
      (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || 
      (typeof navigator !== 'undefined' && (navigator as any).standalone === true);

    if (!isCurrentlyStandalone) {
      const today = new Date().toISOString().split('T')[0];
      const lastShown = localStorage.getItem('track_my_company_last_install_prompt_date');
      if (lastShown !== today) {
        // Show after brief initial delay
        const timer = setTimeout(() => {
          setIsInstallPromptOpen(true);
          localStorage.setItem('track_my_company_last_install_prompt_date', today);
        }, 2200);
        return () => {
          clearTimeout(timer);
          window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
          window.removeEventListener('appinstalled', handleAppInstalled);
        };
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Handle mobile / browser back button navigation & URL routing
  useEffect(() => {
    // Initialize base history state so mobile back button can safely navigate back to home
    if (!window.history.state) {
      window.history.replaceState({ page: 'home' }, '', window.location.pathname + window.location.search);
    }

    // Initialize from URL hash on load
    const initialHash = window.location.hash;
    if (initialHash === '#stats') {
      setCurrentTab('statistics');
    } else if (initialHash === '#add-company') {
      setEditCompany(null);
      setDefaultStatusForModal('applied');
      setIsCompanyModalOpen(true);
    }

    const handlePopState = () => {
      const hash = window.location.hash;

      // Close all modals when mobile/browser back is triggered
      setIsCompanyModalOpen(false);
      setIsProfileModalOpen(false);
      setIsImportExportModalOpen(false);
      setIsAboutModalOpen(false);
      setIsInstallPromptOpen(false);

      // Handle tab switching: ensure home page (dashboard) unless user is on #stats
      if (hash === '#stats') {
        setCurrentTab('statistics');
      } else {
        setCurrentTab('dashboard');
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Compute Statistics
  const stats = useMemo(() => calculateStatistics(companies), [companies]);

  // Upcoming Drives: Immediate next coming company and full list of upcoming drives
  // Prioritizes applied scheduled drives; if none or when toggled to skipped, auto-advances to next scheduled upcoming drive
  const { immediateNextDrive, allUpcomingDrives } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();

    // Map and filter all companies that have a valid drive date
    const withDates = companies
      .map((c) => ({
        company: c,
        timestamp: parseDateToTimestamp(c.oaDate),
      }))
      .filter((item): item is { company: Company; timestamp: number } => item.timestamp !== null)
      .sort((a, b) => a.timestamp - b.timestamp);

    if (withDates.length === 0) {
      return { immediateNextDrive: null, allUpcomingDrives: [] };
    }

    // Future scheduled drives (>= today)
    const futureDrives = withDates.filter((item) => item.timestamp >= todayMs);
    const activePool = futureDrives.length > 0 ? futureDrives : withDates;

    // First priority: Applied drives (not rejected for OA)
    const appliedDrives = activePool.filter(
      (item) => item.company.status === 'applied' && item.company.oaStatus !== 'not_shortlisted'
    );

    // If applied drives exist in the active pool, immediateNextDrive is the earliest applied drive.
    // If no applied drives exist (e.g. user toggled to skipped or has only skipped drives):
    // Auto-advance to the earliest scheduled drive in the pool rather than disappearing!
    const nextComing = appliedDrives.length > 0 ? appliedDrives[0].company : activePool[0].company;
    const allDrives = activePool.map((item) => item.company);

    return {
      immediateNextDrive: nextComing,
      allUpcomingDrives: allDrives,
    };
  }, [companies]);

  // Profile Save
  const handleSaveProfile = async (newProfile: StudentProfile) => {
    await saveProfile(newProfile);
    setProfile(newProfile);
  };

  // Company CRUD
  const handleSaveCompany = async (
    data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>,
    editId?: string
  ) => {
    if (editId) {
      const existing = companies.find((c) => c.id === editId);
      if (existing) {
        await updateCompany({ ...existing, ...data });
        const fresh = await getCompanies();
        setCompanies(fresh);
      }
    } else {
      await addCompany(data);
      const fresh = await getCompanies();
      setCompanies(fresh);

      // Trigger install prompt every time they enter a new company (if not running as installed PWA)
      const isStandalone = 
        (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) || 
        (typeof navigator !== 'undefined' && (navigator as any).standalone === true);
      if (!isStandalone) {
        setTimeout(() => {
          setIsInstallPromptOpen(true);
        }, 700);
      }
    }
  };

  const handleDeleteCompany = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this company from your tracker?')) {
      await deleteCompany(id);
      const fresh = await getCompanies();
      setCompanies(fresh);
    }
  };

  const handleQuickStatusChange = async (
    id: string, 
    newStatus: 'applied' | 'not_applied',
    rejectionReasonTags?: RejectionReasonTag[],
    customReasonNote?: string
  ) => {
    const target = companies.find((c) => c.id === id);
    if (!target) return;

    if (newStatus === 'applied') {
      await updateCompany({
        ...target,
        status: 'applied',
        oaStatus: target.oaStatus || 'shortlisted',
        rejectionReasonTags: undefined,
        customReasonNote: undefined,
      });
    } else {
      await updateCompany({
        ...target,
        status: 'not_applied',
        rejectionReasonTags: rejectionReasonTags && rejectionReasonTags.length > 0 ? rejectionReasonTags : (target.rejectionReasonTags || ['Others']),
        customReasonNote: customReasonNote !== undefined ? customReasonNote : target.customReasonNote,
      });
    }
    const fresh = await getCompanies();
    setCompanies(fresh);
  };

  const handleUpdateOAStatus = async (
    id: string, 
    oaStatus: OAShortlistStatus,
    oaRejectionReasonTags?: OARejectionReasonTag[],
    oaCustomReasonNote?: string
  ) => {
    const target = companies.find((c) => c.id === id);
    if (!target) return;

    await updateCompany({
      ...target,
      oaStatus,
      oaRejectionReasonTags: oaStatus === 'not_shortlisted' ? oaRejectionReasonTags : undefined,
      oaCustomReasonNote: oaStatus === 'not_shortlisted' ? oaCustomReasonNote : undefined,
    });
    const fresh = await getCompanies();
    setCompanies(fresh);

    // Celebrate shortlist with confetti
    if (oaStatus === 'shortlisted') {
      try {
        confetti({
          particleCount: 70,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (_) {}
    }
  };

  // Drag and drop reordering state & handlers: restricted strictly to inside the same group
  const [draggedCompanyId, setDraggedCompanyId] = useState<string | null>(null);
  const [dragOverCompanyId, setDragOverCompanyId] = useState<string | null>(null);

  const reorderCompanies = async (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;

    const source = companies.find((c) => c.id === sourceId);
    const target = companies.find((c) => c.id === targetId);
    if (!source || !target) return;

    const sourceGroup = getCompanyGroup(source);
    const targetGroup = getCompanyGroup(target);
    // Strict restriction: Dragging & dropping only within the same group
    if (sourceGroup !== targetGroup) return;

    const groupItems = companies.filter((c) => getCompanyGroup(c) === sourceGroup);
    const sourceIdx = groupItems.findIndex((c) => c.id === sourceId);
    const targetIdx = groupItems.findIndex((c) => c.id === targetId);
    if (sourceIdx === -1 || targetIdx === -1) return;

    // Pure rank shifting inside this group
    const newGroupItems = [...groupItems];
    const [movedItem] = newGroupItems.splice(sourceIdx, 1);
    newGroupItems.splice(targetIdx, 0, movedItem);

    // Reconstruct master list maintaining group boundaries
    const shortlisted = companies.filter((c) => getCompanyGroup(c) === 'applied_shortlisted');
    const notShortlisted = companies.filter((c) => getCompanyGroup(c) === 'applied_not_shortlisted');
    const skipped = companies.filter((c) => getCompanyGroup(c) === 'skipped');
    const others = companies.filter(
      (c) => !['applied_shortlisted', 'applied_not_shortlisted', 'skipped'].includes(getCompanyGroup(c))
    );

    let newShortlisted = shortlisted;
    let newNotShortlisted = notShortlisted;
    let newSkipped = skipped;

    if (sourceGroup === 'applied_shortlisted') {
      newShortlisted = newGroupItems;
    } else if (sourceGroup === 'applied_not_shortlisted') {
      newNotShortlisted = newGroupItems;
    } else if (sourceGroup === 'skipped') {
      newSkipped = newGroupItems;
    }

    const newMaster = [...newShortlisted, ...newNotShortlisted, ...newSkipped, ...others];

    setCompanies(newMaster);
    await saveCompanies(newMaster);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedCompanyId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (!draggedCompanyId) return;

    const source = companies.find((c) => c.id === draggedCompanyId);
    const target = companies.find((c) => c.id === id);
    if (!source || !target || getCompanyGroup(source) !== getCompanyGroup(target)) {
      e.dataTransfer.dropEffect = 'none';
      if (dragOverCompanyId !== null) {
        setDragOverCompanyId(null);
      }
      return;
    }

    e.dataTransfer.dropEffect = 'move';
    if (dragOverCompanyId !== id) {
      setDragOverCompanyId(id);
    }
  };

  const handleDragLeave = (_e: React.DragEvent, id: string) => {
    if (dragOverCompanyId === id) {
      setDragOverCompanyId(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (draggedCompanyId && draggedCompanyId !== targetId) {
      const source = companies.find((c) => c.id === draggedCompanyId);
      const target = companies.find((c) => c.id === targetId);
      if (source && target && getCompanyGroup(source) === getCompanyGroup(target)) {
        reorderCompanies(draggedCompanyId, targetId);
      }
    }
    setDraggedCompanyId(null);
    setDragOverCompanyId(null);
  };

  const handleDragEnd = () => {
    setDraggedCompanyId(null);
    setDragOverCompanyId(null);
  };

  // Track if an import just completed to route to dashboard home page
  const [justImported, setJustImported] = useState(false);

  const handleImportComplete = async (imported: Company[], importedProfile?: StudentProfile) => {
    if (importedProfile && importedProfile.name) {
      await saveProfile(importedProfile);
      setProfile(importedProfile);
      setIsProfileModalOpen(false);
    }

    const current = await getCompanies();
    const existingNames = new Set(current.map((c) => c.name.trim().toLowerCase()));
    const newItems = imported.filter((c) => !existingNames.has(c.name.trim().toLowerCase()));
    const merged = [...newItems, ...current];

    await saveCompanies(merged);
    setCompanies(merged);
    setJustImported(true);
    setCurrentTab('dashboard');
  };

  // Navigation Tab Handler with browser history support
  const handleSelectTab = (tab: NavTab) => {
    if (tab === currentTab) return;
    if (tab === 'statistics') {
      window.history.pushState({ tab: 'statistics' }, '', '#stats');
      setCurrentTab('statistics');
    } else {
      if (window.location.hash === '#stats') {
        window.history.back();
      } else {
        window.history.pushState({ tab: 'dashboard' }, '', window.location.pathname + window.location.search);
        setCurrentTab('dashboard');
      }
    }
  };

  // Company Modal Handlers (Add & Edit) with history pushState
  const openCompanyModalWithStatus = (status: ApplicationStatus = 'applied') => {
    setEditCompany(null);
    setDefaultStatusForModal(status);
    setIsCompanyModalOpen(true);
    window.history.pushState({ modal: 'company' }, '', '#add-company');
  };

  const openEditCompanyModal = (company: Company) => {
    setEditCompany(company);
    setDefaultStatusForModal(company.status);
    setIsCompanyModalOpen(true);
    window.history.pushState({ modal: 'company' }, '', '#edit-company');
  };

  const closeCompanyModal = () => {
    setIsCompanyModalOpen(false);
    if (window.location.hash === '#add-company' || window.location.hash === '#edit-company') {
      window.history.back();
    }
  };

  // Profile Modal Handlers
  const openProfileModal = () => {
    setIsProfileModalOpen(true);
    window.history.pushState({ modal: 'profile' }, '', '#profile');
  };

  const closeProfileModal = () => {
    setIsProfileModalOpen(false);
    if (window.location.hash === '#profile') {
      window.history.back();
    }
  };

  // Import/Export Modal Handlers
  const openImportExportModal = (initialTab: 'import' | 'export' | 'backup' = 'export') => {
    setImportExportInitialTab(initialTab);
    setIsImportExportModalOpen(true);
    window.history.pushState({ modal: 'excel' }, '', '#excel');
  };

  const closeImportExportModal = () => {
    setIsImportExportModalOpen(false);
    if (justImported) {
      setJustImported(false);
      setCurrentTab('dashboard');
      if (window.location.hash === '#excel' || window.location.hash === '#stats') {
        window.history.replaceState({ tab: 'dashboard' }, '', window.location.pathname + window.location.search);
      }
    } else if (window.location.hash === '#excel') {
      window.history.back();
    }
  };

  // About Modal Handlers
  const openAboutModal = () => {
    setIsAboutModalOpen(true);
    window.history.pushState({ modal: 'about' }, '', '#about');
  };

  const closeAboutModal = () => {
    setIsAboutModalOpen(false);
    if (window.location.hash === '#about') {
      window.history.back();
    }
  };

  // Filtered companies for the Dashboard: Only search filter and applied vs skipped
  const filteredCompanies = useMemo(() => {
    return companies
      .filter((c) => {
        if (statusFilter === 'applied' && c.status !== 'applied') return false;
        if (statusFilter === 'not_applied' && c.status !== 'not_applied') return false;

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = c.name.toLowerCase().includes(q);
          const matchType = (c.type || '').toLowerCase().includes(q);
          const matchRole = (c.role || '').toLowerCase().includes(q);
          const matchCtc = (c.ctc || '').toLowerCase().includes(q);
          const matchReason = (c.rejectionReasonTags || []).some((t) => t.toLowerCase().includes(q));
          const matchCustomReason = (c.customReasonNote || '').toLowerCase().includes(q);
          const matchOAReason = (c.oaRejectionReasonTags || []).some((t) => t.toLowerCase().includes(q));
          const matchOACustomReason = (c.oaCustomReasonNote || '').toLowerCase().includes(q);
          const matchNotes = (c.notes || '').toLowerCase().includes(q);

          if (!matchName && !matchType && !matchRole && !matchCtc && !matchReason && !matchCustomReason && !matchOAReason && !matchOACustomReason && !matchNotes) {
            return false;
          }
        }

        return true;
      });
  }, [companies, statusFilter, searchQuery]);

  // Derived groups for the Applied tab: Shortlisted vs Not Shortlisted
  const appliedShortlisted = useMemo(() => {
    if (statusFilter !== 'applied') return [];
    return filteredCompanies.filter((c) => c.oaStatus !== 'not_shortlisted');
  }, [filteredCompanies, statusFilter]);

  const appliedNotShortlisted = useMemo(() => {
    if (statusFilter !== 'applied') return [];
    return filteredCompanies.filter((c) => c.oaStatus === 'not_shortlisted');
  }, [filteredCompanies, statusFilter]);

  const getDaysRemainingBadge = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetMs = parseDateToTimestamp(dateStr);
    if (targetMs === null) {
      return { text: dateStr, color: 'bg-slate-800 text-slate-400 border-slate-700' };
    }

    const diffTime = targetMs - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return { text: 'Today!', color: 'bg-rose-500/20 text-rose-300 border-rose-500/40 animate-pulse' };
    } else if (diffDays === 1) {
      return { text: 'Tomorrow', color: 'bg-amber-500/20 text-amber-300 border-amber-500/40' };
    } else if (diffDays > 1) {
      return { text: `In ${diffDays} days`, color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40' };
    } else {
      return { text: `${Math.abs(diffDays)}d ago`, color: 'bg-slate-800 text-slate-400 border-slate-700' };
    }
  };

  return (
    <div className="min-h-screen bg-[#070A12] text-slate-100 flex flex-col font-sans antialiased">
      
      {/* Responsive App Container Shell */}
      <div className="w-full max-w-md md:max-w-5xl lg:max-w-6xl mx-auto min-h-screen bg-[#0B0F19] flex flex-col relative shadow-2xl sm:border-x sm:border-slate-800/80">
        
        {/* Top App Bar */}
        <Navbar
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          profile={profile}
          onOpenProfile={openProfileModal}
          onOpenAddModal={() => openCompanyModalWithStatus(statusFilter === 'not_applied' ? 'not_applied' : 'applied')}
          onOpenImportExport={() => openImportExportModal('export')}
          onOpenAbout={openAboutModal}
          onOpenInstall={() => setIsInstallPromptOpen(true)}
          isStandalone={isStandalone}
        />

        {/* Main Content Area */}
        <main className="flex-1 w-full px-3.5 sm:px-6 lg:px-8 pt-4 pb-28 md:pb-12">
          
          {/* VIEW 1: MAIN DASHBOARD */}
          {currentTab === 'dashboard' && (
            <div className="space-y-4">
              
              {/* SECTION: UPCOMING DRIVE (SINGULAR by default, or ALL when toggled) */}
              {immediateNextDrive && (
                <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-3.5 shadow-lg shadow-black/20">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <h2 className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                        Upcoming Drive{showAllUpcoming && allUpcomingDrives.length > 1 ? 's' : ''}
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowAllUpcoming((prev) => !prev)}
                      className="text-[10px] font-medium text-slate-300 hover:text-amber-300 transition-colors flex items-center gap-1 px-2 py-0.5 rounded-md bg-slate-800/80 hover:bg-slate-800 border border-slate-700/70 cursor-pointer select-none active:scale-95"
                      title={showAllUpcoming ? 'Click to show immediate next drive only' : 'Click to show all upcoming drives'}
                    >
                      <span>{showAllUpcoming ? 'all upcoming drives' : 'Immediate Next Drive'}</span>
                      {showAllUpcoming ? (
                        <ChevronUp className="w-3 h-3 text-amber-400" />
                      ) : (
                        <ChevronDown className="w-3 h-3 text-slate-400" />
                      )}
                    </button>
                  </div>

                  <div className={showAllUpcoming ? 'space-y-2.5 max-h-[440px] overflow-y-auto pr-0.5 custom-scrollbar' : ''}>
                    {(showAllUpcoming ? allUpcomingDrives : [immediateNextDrive]).map((drive) => {
                      const badge = getDaysRemainingBadge(drive.oaDate!);
                      return (
                        <div
                          key={drive.id}
                          className="bg-[#0B0F19] border border-slate-800/90 rounded-xl p-3 flex flex-col gap-2 hover:border-indigo-500/40 transition-colors"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-1.5">
                                <h3 className="text-sm font-bold text-white truncate">{drive.name}</h3>
                                <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border shrink-0 ${badge.color}`}>
                                  {badge.text}
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                                {drive.type || drive.role || 'Full Time (FTE)'} • <span className="text-indigo-300 font-mono font-semibold">{drive.ctc}</span>
                              </p>
                            </div>
                          </div>

                          {/* Date & OA / Application Status */}
                          <div className="pt-2 border-t border-slate-800/70 flex items-center justify-between text-xs">
                            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-400" />
                              {formatDriveDate(drive.oaDate!)}
                            </span>

                            <div className="flex items-center gap-1.5">
                              {drive.status === 'not_applied' ? (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                                  <XCircle className="w-2.5 h-2.5" />
                                  Skipped{drive.rejectionReasonTags?.length ? ` (${drive.rejectionReasonTags[0]})` : ''}
                                </span>
                              ) : drive.oaStatus === 'shortlisted' ? (
                                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                                  <CheckCircle2 className="w-2.5 h-2.5" />
                                  Selected
                                </span>
                              ) : (
                                <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                                  Awaiting OA
                                </span>
                              )}

                              <button
                                onClick={() => openEditCompanyModal(drive)}
                                className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700 active:scale-95 cursor-pointer"
                              >
                                Edit
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* DASHBOARD TOOLBAR: Only Search & Binary Applied/Skipped Segment */}
              <div className="space-y-2">
                
                {/* Applied vs Skipped Segmented Toggle */}
                <div className="flex items-center gap-1 bg-[#131B2E] p-1 rounded-xl border border-slate-800 shadow-sm">
                  <button
                    onClick={() => setStatusFilter('applied')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg text-center transition-all ${
                      statusFilter === 'applied'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Applied ({stats.totalApplied})
                  </button>
                  <button
                    onClick={() => setStatusFilter('not_applied')}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg text-center transition-all ${
                      statusFilter === 'not_applied'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    Skipped ({stats.totalNotApplied})
                  </button>
                </div>

                {/* Search Bar Alone (NO dropdowns, NO tier selector, NO sort) */}
                <div className="relative w-full">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder={`Search ${statusFilter === 'applied' ? 'applied' : 'skipped'} companies...`}
                    className="w-full pl-8 pr-3 py-2 bg-[#131B2E] border border-slate-800 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>

              </div>

              {/* Companies Feed: Grouped by Shortlisted vs Not Shortlisted in Applied tab */}
              {filteredCompanies.length > 0 ? (
                statusFilter === 'applied' ? (
                  <div className="space-y-3">
                    {/* Subtle count & reorder hint if multiple companies */}
                    {filteredCompanies.length > 1 && !searchQuery.trim() && (
                      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                        <span>{filteredCompanies.length} companies</span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block animate-pulse" />
                          <span>Drag cards to reorder</span>
                        </span>
                      </div>
                    )}

                    {/* Active / Shortlisted group */}
                    {appliedShortlisted.length > 0 ? (
                      <div className="space-y-2.5 md:space-y-0 md:grid md:grid-cols-2 md:gap-3">
                        {appliedShortlisted.map((company) => (
                          <CompanyCard
                            key={company.id}
                            company={company}
                            onEdit={openEditCompanyModal}
                            onDelete={handleDeleteCompany}
                            onQuickStatusChange={handleQuickStatusChange}
                            onUpdateOAStatus={handleUpdateOAStatus}
                            draggable={!searchQuery.trim()}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onDragEnd={handleDragEnd}
                            isDragging={draggedCompanyId === company.id}
                            isDragOver={dragOverCompanyId === company.id}
                          />
                        ))}
                      </div>
                    ) : (
                      searchQuery.trim() && (
                        <div className="p-4 rounded-xl bg-[#131B2E]/60 border border-slate-800 text-center text-xs text-slate-400">
                          No active companies match your search.
                        </div>
                      )
                    )}

                    {/* Line separation between the two groups */}
                    {appliedShortlisted.length > 0 && appliedNotShortlisted.length > 0 && (
                      <div className="py-2">
                        <div className="h-px bg-slate-800/80 w-full" />
                      </div>
                    )}

                    {/* Not Shortlisted group (kept below, each card has a small red dot) */}
                    {appliedNotShortlisted.length > 0 && (
                      <div className="space-y-2.5 md:space-y-0 md:grid md:grid-cols-2 md:gap-3">
                        {appliedNotShortlisted.map((company) => (
                          <CompanyCard
                            key={company.id}
                            company={company}
                            onEdit={openEditCompanyModal}
                            onDelete={handleDeleteCompany}
                            onQuickStatusChange={handleQuickStatusChange}
                            onUpdateOAStatus={handleUpdateOAStatus}
                            draggable={!searchQuery.trim()}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDragLeave={handleDragLeave}
                            onDrop={handleDrop}
                            onDragEnd={handleDragEnd}
                            isDragging={draggedCompanyId === company.id}
                            isDragOver={dragOverCompanyId === company.id}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  /* SKIPPED TAB VIEW */
                  <div className="space-y-2">
                    {filteredCompanies.length > 1 && !searchQuery.trim() && (
                      <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                        <span>{filteredCompanies.length} companies</span>
                        <span className="flex items-center gap-1 text-slate-400">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 inline-block animate-pulse" />
                          <span>Drag cards to reorder</span>
                        </span>
                      </div>
                    )}

                    <div className="space-y-2.5 md:space-y-0 md:grid md:grid-cols-2 md:gap-3">
                      {filteredCompanies.map((company) => (
                        <CompanyCard
                          key={company.id}
                          company={company}
                          onEdit={openEditCompanyModal}
                          onDelete={handleDeleteCompany}
                          onQuickStatusChange={handleQuickStatusChange}
                          onUpdateOAStatus={handleUpdateOAStatus}
                          draggable={!searchQuery.trim()}
                          onDragStart={handleDragStart}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                          onDragEnd={handleDragEnd}
                          isDragging={draggedCompanyId === company.id}
                          isDragOver={dragOverCompanyId === company.id}
                        />
                      ))}
                    </div>
                  </div>
                )
              ) : (
                /* Clean Empty State */
                <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-10 text-center my-4">
                  {companies.length === 0 ? (
                    <div className="max-w-sm mx-auto space-y-3">
                      <div className="w-12 h-12 rounded-xl bg-indigo-600/15 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <h3 className="text-base font-bold text-white">No Companies Added Yet</h3>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        Add companies as they are announced in your WhatsApp placement group.
                      </p>
                      <div className="flex items-center justify-center gap-2 pt-1">
                        <button
                          onClick={() => openCompanyModalWithStatus('applied')}
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Company</span>
                        </button>

                        <button
                          onClick={() => openImportExportModal('import')}
                          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium rounded-xl transition-colors flex items-center gap-1.5"
                        >
                          <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Import CSV / Excel</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="max-w-sm mx-auto space-y-2">
                      <h3 className="text-sm font-semibold text-white">
                        {statusFilter === 'applied' && stats.totalApplied === 0
                          ? 'No Applied Companies'
                          : statusFilter === 'not_applied' && stats.totalNotApplied === 0
                          ? 'No Skipped Companies'
                          : 'No companies match your search'}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {searchQuery
                          ? 'Try changing or clearing your search term.'
                          : statusFilter === 'applied'
                          ? 'Add a company or switch to Skipped.'
                          : 'No skipped companies recorded.'}
                      </p>
                      {searchQuery && (
                        <div className="flex items-center justify-center pt-1">
                          <button
                            onClick={() => setSearchQuery('')}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 transition-colors"
                          >
                            Clear Search
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* VIEW 2: STATISTICS & CHRONOLOGICAL HISTORY */}
          {currentTab === 'statistics' && (
            <StatsView
              stats={stats}
              companies={companies}
            />
          )}

        </main>

        {/* Ultra-Reduced Expandable Footer */}
        <Footer />

        {/* Bottom Navigation Bar for Mobile */}
        <MobileBottomNav
          currentTab={currentTab}
          onSelectTab={handleSelectTab}
          statusFilter={statusFilter}
          onSelectStatusFilter={(status) => setStatusFilter(status)}
          onOpenAddModal={() => openCompanyModalWithStatus(statusFilter === 'not_applied' ? 'not_applied' : 'applied')}
          onOpenImportExport={() => openImportExportModal('export')}
          appliedCount={stats.totalApplied}
          skippedCount={stats.totalNotApplied}
        />

      </div>

      {/* Modals */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={closeProfileModal}
        currentProfile={profile}
        onSave={handleSaveProfile}
        isFirstTime={!profile || !profile.name}
        onImportClick={() => {
          closeProfileModal();
          openImportExportModal('import');
        }}
      />

      <CompanyModal
        isOpen={isCompanyModalOpen}
        onClose={closeCompanyModal}
        onSave={handleSaveCompany}
        editCompany={editCompany}
        defaultStatus={defaultStatusForModal}
      />

      <ImportExportModal
        key={importExportInitialTab}
        isOpen={isImportExportModalOpen}
        onClose={closeImportExportModal}
        companies={companies}
        profile={profile}
        initialTab={importExportInitialTab}
        onImportComplete={handleImportComplete}
      />

      <AboutModal
        isOpen={isAboutModalOpen}
        onClose={closeAboutModal}
        onOpenInstall={() => setIsInstallPromptOpen(true)}
        isStandalone={isStandalone}
      />

      <InstallPromptModal
        isOpen={isInstallPromptOpen}
        onClose={() => setIsInstallPromptOpen(false)}
        deferredPrompt={deferredInstallPrompt}
      />

    </div>
  );
};

export default App;
