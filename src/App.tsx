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
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import type { 
  Company, 
  StudentProfile, 
  OAShortlistStatus, 
  ApplicationStatus,
  OARejectionReasonTag
} from './types';
import { 
  getCompanies, 
  saveCompanies, 
  addCompany, 
  updateCompany, 
  deleteCompany, 
  getProfile, 
  saveProfile, 
  calculateStatistics 
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
  const [importExportInitialTab, setImportExportInitialTab] = useState<'import' | 'export' | 'backup'>('export');
  const [editCompany, setEditCompany] = useState<Company | null>(null);
  const [defaultStatusForModal, setDefaultStatusForModal] = useState<ApplicationStatus>('applied');

  // Load initial data
  useEffect(() => {
    const loadedCompanies = getCompanies();
    setCompanies(loadedCompanies);

    const loadedProfile = getProfile();
    setProfile(loadedProfile);

    // If student hasn't entered a name yet, prompt on first visit
    if (!loadedProfile || !loadedProfile.name) {
      setIsProfileModalOpen(true);
    }

    const handleStorageChange = () => {
      setCompanies(getCompanies());
      setProfile(getProfile());
    };

    window.addEventListener('storage-companies-change', handleStorageChange);
    window.addEventListener('storage-profile-change', handleStorageChange);

    return () => {
      window.removeEventListener('storage-companies-change', handleStorageChange);
      window.removeEventListener('storage-profile-change', handleStorageChange);
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

  // Upcoming Drives: Immediate next coming company and full list of upcoming drives (excludes not_shortlisted drives)
  const { immediateNextDrive, allUpcomingDrives } = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const drives = companies
      .filter((c) => c.status === 'applied' && !!c.oaDate && c.oaStatus !== 'not_shortlisted')
      .sort((a, b) => new Date(a.oaDate!).getTime() - new Date(b.oaDate!).getTime());

    if (drives.length === 0) {
      return { immediateNextDrive: null, allUpcomingDrives: [] };
    }

    const futureDrives = drives.filter((c) => new Date(c.oaDate!).getTime() >= today.getTime());
    const list = futureDrives.length > 0 ? futureDrives : drives;
    const nextComing = futureDrives.length > 0 ? futureDrives[0] : drives[0];

    return {
      immediateNextDrive: nextComing,
      allUpcomingDrives: list,
    };
  }, [companies]);

  // Profile Save
  const handleSaveProfile = (newProfile: StudentProfile) => {
    saveProfile(newProfile);
    setProfile(newProfile);
  };

  // Company CRUD
  const handleSaveCompany = (
    data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>,
    editId?: string
  ) => {
    if (editId) {
      const existing = companies.find((c) => c.id === editId);
      if (existing) {
        updateCompany({ ...existing, ...data });
        setCompanies(getCompanies());
      }
    } else {
      addCompany(data);
      setCompanies(getCompanies());
    }
  };

  const handleDeleteCompany = (id: string) => {
    if (window.confirm('Are you sure you want to remove this company from your tracker?')) {
      deleteCompany(id);
      setCompanies(getCompanies());
    }
  };

  const handleQuickStatusChange = (id: string, newStatus: 'applied' | 'not_applied') => {
    const target = companies.find((c) => c.id === id);
    if (!target) return;

    if (newStatus === 'applied') {
      updateCompany({
        ...target,
        status: 'applied',
        oaStatus: target.oaStatus || 'shortlisted',
      });
      setCompanies(getCompanies());
    } else {
      updateCompany({
        ...target,
        status: 'not_applied',
      });
      setCompanies(getCompanies());
    }
  };

  const handleUpdateOAStatus = (
    id: string, 
    oaStatus: OAShortlistStatus,
    oaRejectionReasonTags?: OARejectionReasonTag[],
    oaCustomReasonNote?: string
  ) => {
    const target = companies.find((c) => c.id === id);
    if (!target) return;

    updateCompany({
      ...target,
      oaStatus,
      oaRejectionReasonTags: oaStatus === 'not_shortlisted' ? oaRejectionReasonTags : undefined,
      oaCustomReasonNote: oaStatus === 'not_shortlisted' ? oaCustomReasonNote : undefined,
    });
    setCompanies(getCompanies());

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

  // Drag and drop reordering state & handlers: shifts all intermediate ranks
  const [draggedCompanyId, setDraggedCompanyId] = useState<string | null>(null);
  const [dragOverCompanyId, setDragOverCompanyId] = useState<string | null>(null);

  const reorderCompanies = (sourceId: string, targetId: string) => {
    if (sourceId === targetId) return;

    const sourceIdx = companies.findIndex((c) => c.id === sourceId);
    const targetIdx = companies.findIndex((c) => c.id === targetId);
    if (sourceIdx === -1 || targetIdx === -1) return;

    // Pure rank shifting: remove from sourceIdx and insert at targetIdx
    // This shifts all companies in between by one instead of interchanging
    const newMaster = [...companies];
    const [movedItem] = newMaster.splice(sourceIdx, 1);
    newMaster.splice(targetIdx, 0, movedItem);

    saveCompanies(newMaster);
    setCompanies(newMaster);
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedCompanyId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
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
      reorderCompanies(draggedCompanyId, targetId);
    }
    setDraggedCompanyId(null);
    setDragOverCompanyId(null);
  };

  const handleDragEnd = () => {
    setDraggedCompanyId(null);
    setDragOverCompanyId(null);
  };

  const handleImportComplete = (imported: Company[], importedProfile?: StudentProfile) => {
    if (importedProfile && importedProfile.name) {
      saveProfile(importedProfile);
      setProfile(importedProfile);
      setIsProfileModalOpen(false);
    }

    const current = getCompanies();
    const existingNames = new Set(current.map((c) => c.name.trim().toLowerCase()));
    const newItems = imported.filter((c) => !existingNames.has(c.name.trim().toLowerCase()));
    const merged = [...newItems, ...current];

    saveCompanies(merged);
    setCompanies(merged);
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
    if (window.location.hash === '#excel') {
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

  const getDaysRemainingBadge = (dateStr: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(dateStr);
    target.setHours(0, 0, 0, 0);

    const diffTime = target.getTime() - today.getTime();
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

                          {/* Date & OA Status */}
                          <div className="pt-2 border-t border-slate-800/70 flex items-center justify-between text-xs">
                            <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3 text-amber-400" />
                              {new Date(drive.oaDate!).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>

                            <div className="flex items-center gap-1.5">
                              {drive.oaStatus === 'shortlisted' ? (
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
                                className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700 active:scale-95"
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

              {/* Companies Feed (Each card shows ONLY company name until clicked) */}
              {filteredCompanies.length > 0 ? (
                <div className="space-y-2">
                  {/* Subtle reorder tip when multiple companies exist and not searching */}
                  {filteredCompanies.length > 1 && !searchQuery.trim() && (
                    <div className="flex items-center justify-between text-[11px] text-slate-500 px-1">
                      <span>{filteredCompanies.length} companies</span>
                      <span className="flex items-center gap-1 text-slate-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block animate-pulse" />
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
      />

    </div>
  );
};

export default App;
