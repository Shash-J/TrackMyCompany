import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Search, 
  Plus, 
  Building2, 
  FileSpreadsheet, 
  Calendar,
  Clock,
  CheckCircle2
} from 'lucide-react';
import type { 
  Company, 
  StudentProfile, 
  OAShortlistStatus, 
  ApplicationStatus 
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

  // Modals
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
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

  // Compute Statistics
  const stats = useMemo(() => calculateStatistics(companies), [companies]);

  // Upcoming Drive: Immediate next coming company based on drive date
  const upcomingDrive = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const drives = companies
      .filter((c) => c.status === 'applied' && !!c.oaDate)
      .sort((a, b) => new Date(a.oaDate!).getTime() - new Date(b.oaDate!).getTime());

    if (drives.length === 0) return null;
    const nextComing = drives.find((c) => new Date(c.oaDate!).getTime() >= today.getTime());
    return nextComing || drives[0];
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
        formSubmitted: true,
        formSubmittedDate: new Date().toISOString(),
        oaStatus: target.oaStatus || 'not_shortlisted',
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

  const handleUpdateOAStatus = (id: string, oaStatus: OAShortlistStatus) => {
    const target = companies.find((c) => c.id === id);
    if (!target) return;

    updateCompany({
      ...target,
      oaStatus,
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

  const openAddModalWithStatus = (status: ApplicationStatus = 'applied') => {
    setEditCompany(null);
    setDefaultStatusForModal(status);
    setIsCompanyModalOpen(true);
  };

  const openEditModal = (company: Company) => {
    setEditCompany(company);
    setDefaultStatusForModal(company.status);
    setIsCompanyModalOpen(true);
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
          const matchRole = (c.role || '').toLowerCase().includes(q);
          const matchCtc = (c.ctc || '').toLowerCase().includes(q);
          const matchReason = (c.rejectionReasonTag || '').toLowerCase().includes(q);
          const matchCustomReason = (c.customReasonNote || '').toLowerCase().includes(q);
          const matchNotes = (c.notes || '').toLowerCase().includes(q);

          if (!matchName && !matchRole && !matchCtc && !matchReason && !matchCustomReason && !matchNotes) {
            return false;
          }
        }

        return true;
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
          onSelectTab={(tab) => setCurrentTab(tab)}
          profile={profile}
          onOpenProfile={() => setIsProfileModalOpen(true)}
          onOpenAddModal={() => openAddModalWithStatus(statusFilter === 'not_applied' ? 'not_applied' : 'applied')}
          onOpenImportExport={() => {
            setImportExportInitialTab('export');
            setIsImportExportModalOpen(true);
          }}
        />

        {/* Main Content Area */}
        <main className="flex-1 w-full px-3.5 sm:px-6 lg:px-8 pt-4 pb-28 md:pb-12">
          
          {/* VIEW 1: MAIN DASHBOARD */}
          {currentTab === 'dashboard' && (
            <div className="space-y-4">
              
              {/* SECTION: UPCOMING DRIVE (SINGULAR - Only 1 immediate next company) */}
              {upcomingDrive && (
                <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-3.5 shadow-lg shadow-black/20">
                  <div className="flex items-center justify-between mb-2.5">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-400" />
                      <h2 className="text-[11px] font-bold uppercase tracking-wider text-amber-400">
                        Upcoming Drive
                      </h2>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      Immediate Next Drive
                    </span>
                  </div>

                  {(() => {
                    const badge = getDaysRemainingBadge(upcomingDrive.oaDate!);
                    return (
                      <div className="bg-[#0B0F19] border border-slate-800/90 rounded-xl p-3 flex flex-col gap-2 hover:border-indigo-500/40 transition-colors">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-sm font-bold text-white truncate">{upcomingDrive.name}</h3>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border shrink-0 ${badge.color}`}>
                                {badge.text}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 truncate mt-0.5">
                              {upcomingDrive.role} • <span className="text-indigo-300 font-mono font-semibold">{upcomingDrive.ctc}</span>
                            </p>
                          </div>
                        </div>

                        {/* Date & OA Status */}
                        <div className="pt-2 border-t border-slate-800/70 flex items-center justify-between text-xs">
                          <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            {new Date(upcomingDrive.oaDate!).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {upcomingDrive.oaStatus === 'shortlisted' ? (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5" />
                                Selected
                              </span>
                            ) : (
                              <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-400 border border-slate-700">
                                Not Selected
                              </span>
                            )}

                            <button
                              onClick={() => openEditModal(upcomingDrive)}
                              className="text-[10px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700 active:scale-95"
                            >
                              Edit
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
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
                <div className="space-y-2.5 md:space-y-0 md:grid md:grid-cols-2 md:gap-3">
                  {filteredCompanies.map((company) => (
                    <CompanyCard
                      key={company.id}
                      company={company}
                      onEdit={openEditModal}
                      onDelete={handleDeleteCompany}
                      onQuickStatusChange={handleQuickStatusChange}
                      onUpdateOAStatus={handleUpdateOAStatus}
                    />
                  ))}
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
                          onClick={() => openAddModalWithStatus('applied')}
                          className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add Company</span>
                        </button>

                        <button
                          onClick={() => setIsImportExportModalOpen(true)}
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
          onSelectTab={(tab) => setCurrentTab(tab)}
          statusFilter={statusFilter}
          onSelectStatusFilter={(status) => setStatusFilter(status)}
          onOpenAddModal={() => openAddModalWithStatus(statusFilter === 'not_applied' ? 'not_applied' : 'applied')}
          onOpenImportExport={() => {
            setImportExportInitialTab('export');
            setIsImportExportModalOpen(true);
          }}
          appliedCount={stats.totalApplied}
          skippedCount={stats.totalNotApplied}
        />

      </div>

      {/* Modals */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentProfile={profile}
        onSave={handleSaveProfile}
        isFirstTime={!profile || !profile.name}
        onImportClick={() => {
          setImportExportInitialTab('import');
          setIsImportExportModalOpen(true);
        }}
      />

      <CompanyModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        onSave={handleSaveCompany}
        editCompany={editCompany}
        defaultStatus={defaultStatusForModal}
      />

      <ImportExportModal
        key={importExportInitialTab}
        isOpen={isImportExportModalOpen}
        onClose={() => setIsImportExportModalOpen(false)}
        companies={companies}
        profile={profile}
        initialTab={importExportInitialTab}
        onImportComplete={handleImportComplete}
      />

    </div>
  );
};

export default App;
