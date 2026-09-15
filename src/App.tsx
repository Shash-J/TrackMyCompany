import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Search, 
  Filter, 
  Plus, 
  Building2, 
  FileSpreadsheet, 
  RotateCcw,
  ArrowUpDown
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
import { StatCards } from './components/StatCards';
import { CompanyCard } from './components/CompanyCard';
import { CompanyModal } from './components/CompanyModal';
import { ProfileModal } from './components/ProfileModal';
import { StatsView } from './components/StatsView';
import { UpcomingOAs } from './components/UpcomingOAs';
import { ImportExportModal } from './components/ImportExportModal';
import { Footer } from './components/Footer';

export const App: React.FC = () => {
  // Application Data States
  const [companies, setCompanies] = useState<Company[]>([]);
  const [profile, setProfile] = useState<StudentProfile | null>(null);

  // Navigation & Filtering
  const [currentTab, setCurrentTab] = useState<NavTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [oaStatusFilter, setOaStatusFilter] = useState<string>('ALL');
  const [reasonFilter, setReasonFilter] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<'date_desc' | 'name_asc' | 'oa_date'>('date_desc');

  // Modals
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isCompanyModalOpen, setIsCompanyModalOpen] = useState(false);
  const [isImportExportModalOpen, setIsImportExportModalOpen] = useState(false);
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
        oaStatus: target.oaStatus || 'pending',
      });
      setCompanies(getCompanies());
    } else {
      // If marking not applied, open edit modal to allow selecting reason chip
      setEditCompany(target);
      setDefaultStatusForModal('not_applied');
      setIsCompanyModalOpen(true);
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

    // Celebrate shortlist with confetti!
    if (oaStatus === 'shortlisted') {
      try {
        confetti({
          particleCount: 75,
          spread: 60,
          origin: { y: 0.6 },
        });
      } catch (_) {}
    }
  };

  const handleImportComplete = (imported: Company[]) => {
    const current = getCompanies();
    // Combine avoiding duplicate company names
    const existingNames = new Set(current.map((c) => c.name.trim().toLowerCase()));
    const newItems = imported.filter((c) => !existingNames.has(c.name.trim().toLowerCase()));
    const merged = [...newItems, ...current];

    saveCompanies(merged);
    setCompanies(merged);
  };

  // Open Modal helpers
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

  // Filtered companies based on current tab, search, and dropdowns
  const filteredCompanies = useMemo(() => {
    return companies
      .filter((c) => {
        // Tab Filtering
        if (currentTab === 'applied' && c.status !== 'applied') return false;
        if (currentTab === 'not_applied' && c.status !== 'not_applied') return false;
        if (currentTab === 'upcoming_oa' && (c.status !== 'applied' || !c.oaDate)) return false;

        // Search Query
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

        // Tier Filter
        if (tierFilter !== 'ALL' && c.tier !== tierFilter) return false;

        // Priority Filter
        if (priorityFilter !== 'ALL' && c.priority !== priorityFilter) return false;

        // OA Status Filter
        if (oaStatusFilter !== 'ALL' && c.oaStatus !== oaStatusFilter) return false;

        // Rejection Reason Filter
        if (reasonFilter !== 'ALL' && c.rejectionReasonTag !== reasonFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'name_asc') {
          return a.name.localeCompare(b.name);
        }
        if (sortBy === 'oa_date') {
          if (!a.oaDate) return 1;
          if (!b.oaDate) return -1;
          return new Date(a.oaDate).getTime() - new Date(b.oaDate).getTime();
        }
        // Default date_desc
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [companies, currentTab, searchQuery, tierFilter, priorityFilter, oaStatusFilter, reasonFilter, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setTierFilter('ALL');
    setPriorityFilter('ALL');
    setOaStatusFilter('ALL');
    setReasonFilter('ALL');
    setSortBy('date_desc');
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        profile={profile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAddModal={() => openAddModalWithStatus('applied')}
        onOpenImportExport={() => setIsImportExportModalOpen(true)}
        totalCount={stats.totalVisited}
        appliedCount={stats.totalApplied}
        notAppliedCount={stats.totalNotApplied}
        upcomingOACount={stats.totalOAScheduled}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        
        {/* Hero Section & Top Metrics */}
        {currentTab !== 'statistics' && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[11px] uppercase tracking-wider font-bold text-indigo-400">
                    {profile?.name ? `${profile.name}'s Dashboard` : 'Campus Drive Tracker'}
                  </span>
                  {profile?.branch && (
                    <span className="text-[11px] text-slate-500 font-mono">
                      • {profile.branch} {profile.batch ? `(${profile.batch})` : ''}
                    </span>
                  )}
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Placement Company Hub
                </h1>
                <p className="text-xs sm:text-sm text-slate-400 mt-0.5">
                  Track visiting companies, Google form applications, and OA drive dates in one reliable place.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setIsImportExportModalOpen(true)}
                  className="px-3.5 py-2 rounded-xl bg-[#131B2E] hover:bg-slate-800 border border-slate-700/80 text-xs font-semibold text-slate-200 transition-colors flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  <span>Import / Export</span>
                </button>

                <button
                  onClick={() => openAddModalWithStatus('applied')}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Company</span>
                </button>
              </div>
            </div>

            {/* Stat Cards */}
            <StatCards 
              stats={stats} 
              onFilterClick={(type) => {
                if (type === 'all') setCurrentTab('all');
                if (type === 'applied') setCurrentTab('applied');
                if (type === 'not_applied') setCurrentTab('not_applied');
                if (type === 'shortlisted') {
                  setCurrentTab('applied');
                  setOaStatusFilter('shortlisted');
                }
              }}
            />
          </>
        )}

        {/* TAB 1: ALL / APPLIED / NOT APPLIED COMPANIES */}
        {(currentTab === 'all' || currentTab === 'applied' || currentTab === 'not_applied') && (
          <div className="space-y-6">
            
            {/* Search & Filter Bar */}
            <div className="bg-[#131B2E] border border-slate-800 p-4 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-md shadow-black/20">
              
              {/* Search Bar */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by company name, role, CTC, or rejection reason..."
                  className="w-full pl-10 pr-4 py-2 bg-[#0B0F19] border border-slate-700/70 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                />
              </div>

              {/* Filters & Sorters */}
              <div className="flex flex-wrap items-center gap-2">
                
                {/* Tier Filter */}
                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="px-2.5 py-2 bg-[#0B0F19] border border-slate-700/70 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Tiers</option>
                  <option value="OPEN_DREAM">Open Dream (≥12 LPA)</option>
                  <option value="DREAM">Dream (&lt;12 LPA)</option>
                  <option value="MASS">Mass / Regular</option>
                  <option value="INTERN_ONLY">Internship</option>
                  <option value="OFF_CAMPUS">Off-Campus</option>
                </select>

                {/* Priority Filter */}
                {currentTab !== 'not_applied' && (
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="px-2.5 py-2 bg-[#0B0F19] border border-slate-700/70 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ALL">All Priorities</option>
                    <option value="High">P1 High</option>
                    <option value="Medium">P2 Medium</option>
                    <option value="Low">P3 Low</option>
                  </select>
                )}

                {/* OA Status Filter (Only on Applied or All) */}
                {currentTab !== 'not_applied' && (
                  <select
                    value={oaStatusFilter}
                    onChange={(e) => setOaStatusFilter(e.target.value)}
                    className="px-2.5 py-2 bg-[#0B0F19] border border-slate-700/70 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="ALL">All OA Statuses</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="pending">Pending</option>
                    <option value="not_shortlisted">Not Shortlisted</option>
                  </select>
                )}

                {/* Sort Option */}
                <div className="flex items-center gap-1 bg-[#0B0F19] border border-slate-700/70 rounded-xl px-2 py-1">
                  <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent text-xs text-slate-300 focus:outline-none pr-1"
                  >
                    <option value="date_desc" className="bg-[#0B0F19]">Newest Added</option>
                    <option value="name_asc" className="bg-[#0B0F19]">Company (A-Z)</option>
                    <option value="oa_date" className="bg-[#0B0F19]">OA Date</option>
                  </select>
                </div>

                {/* Reset Filters */}
                {(searchQuery || tierFilter !== 'ALL' || priorityFilter !== 'ALL' || oaStatusFilter !== 'ALL' || reasonFilter !== 'ALL') && (
                  <button
                    onClick={resetFilters}
                    title="Reset all filters"
                    className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                )}

              </div>

            </div>

            {/* Companies Grid */}
            {filteredCompanies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
              /* Empty State */
              <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-12 text-center my-6">
                {companies.length === 0 ? (
                  /* Initial Clean Slate State */
                  <div className="max-w-md mx-auto space-y-4">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-600/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                      <Building2 className="w-8 h-8" />
                    </div>
                    <h3 className="text-lg font-bold text-white">Your Placement Tracker is Ready</h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      As new companies arrive in your WhatsApp group, add them here to track your Google Form submissions, CTC, drive dates, and reasons for skipping.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                      <button
                        onClick={() => openAddModalWithStatus('applied')}
                        className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Add Your First Company</span>
                      </button>

                      <button
                        onClick={() => setIsImportExportModalOpen(true)}
                        className="w-full sm:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl transition-colors flex items-center justify-center gap-2"
                      >
                        <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                        <span>Import Excel / CSV</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Filter Mismatch Empty State */
                  <div className="max-w-md mx-auto space-y-3">
                    <Filter className="w-10 h-10 text-slate-600 mx-auto" />
                    <h3 className="text-base font-bold text-white">No companies match your filters</h3>
                    <p className="text-xs text-slate-400">
                      Try clearing your search query or reset the category and status filters.
                    </p>
                    <button
                      onClick={resetFilters}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition-colors"
                    >
                      Clear All Filters
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* TAB 2: UPCOMING OA DRIVES */}
        {currentTab === 'upcoming_oa' && (
          <UpcomingOAs
            companies={companies}
            onUpdateOAStatus={handleUpdateOAStatus}
            onOpenAddModal={() => openAddModalWithStatus('applied')}
            onEditCompany={openEditModal}
          />
        )}

        {/* TAB 3: STATISTICS & INSIGHTS */}
        {currentTab === 'statistics' && (
          <StatsView
            stats={stats}
            companies={companies}
            onNavigateToTab={(tab) => setCurrentTab(tab)}
          />
        )}

      </main>

      {/* Footer */}
      <Footer />

      {/* MODALS */}
      {/* Student Profile Onboarding Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentProfile={profile}
        onSave={handleSaveProfile}
        isFirstTime={!profile || !profile.name}
      />

      {/* Add / Edit Company Modal */}
      <CompanyModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        onSave={handleSaveCompany}
        editCompany={editCompany}
        defaultStatus={defaultStatusForModal}
      />

      {/* Excel / CSV Import & Export Modal */}
      <ImportExportModal
        isOpen={isImportExportModalOpen}
        onClose={() => setIsImportExportModalOpen(false)}
        companies={companies}
        onImportComplete={handleImportComplete}
      />

    </div>
  );
};

export default App;
