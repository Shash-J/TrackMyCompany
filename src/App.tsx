import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { 
  Search, 
  Plus, 
  Building2, 
  FileSpreadsheet, 
  RotateCcw,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
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

  // Dashboard Filter State
  const [statusFilter, setStatusFilter] = useState<'all' | 'applied' | 'not_applied'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
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

  // Upcoming OA Drives for Applied Companies
  const upcomingDrives = useMemo(() => {
    return companies
      .filter((c) => c.status === 'applied' && !!c.oaDate)
      .sort((a, b) => new Date(a.oaDate!).getTime() - new Date(b.oaDate!).getTime());
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
        oaStatus: target.oaStatus || 'pending',
      });
      setCompanies(getCompanies());
    } else {
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

  const handleImportComplete = (imported: Company[]) => {
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

  // Filtered companies for the Dashboard
  const filteredCompanies = useMemo(() => {
    return companies
      .filter((c) => {
        // Status filter chip
        if (statusFilter === 'applied' && c.status !== 'applied') return false;
        if (statusFilter === 'not_applied' && c.status !== 'not_applied') return false;

        // Search Query
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchName = c.name.toLowerCase().includes(q);
          const matchRole = (c.role || '').toLowerCase().includes(q);
          const matchCtc = (c.ctc || '').toLowerCase().includes(q);
          const matchReason = (c.rejectionReasonTag || '').toLowerCase().includes(q);
          const matchCustomReason = (c.customReasonNote || '').toLowerCase().includes(q);

          if (!matchName && !matchRole && !matchCtc && !matchReason && !matchCustomReason) {
            return false;
          }
        }

        // Tier Filter
        if (tierFilter !== 'ALL' && c.tier !== tierFilter) return false;

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
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [companies, statusFilter, searchQuery, tierFilter, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setTierFilter('ALL');
    setStatusFilter('all');
    setSortBy('date_desc');
  };

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
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-sans">
      
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        profile={profile}
        onOpenProfile={() => setIsProfileModalOpen(true)}
        onOpenAddModal={() => openAddModalWithStatus('applied')}
        onOpenImportExport={() => setIsImportExportModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* VIEW 1: MAIN DASHBOARD */}
        {currentTab === 'dashboard' && (
          <div className="space-y-6">
            
            {/* Dashboard Header Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
                  Placement Hub
                </h1>
                <p className="text-xs text-slate-400">
                  Add and track campus companies from your WhatsApp announcements.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsImportExportModalOpen(true)}
                  className="px-3 py-1.5 rounded-xl bg-[#131B2E] hover:bg-slate-800 border border-slate-700/80 text-xs font-medium text-slate-300 transition-colors flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Import / Export</span>
                </button>

                <button
                  onClick={() => openAddModalWithStatus('applied')}
                  className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-md shadow-indigo-600/30 transition-all flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Company</span>
                </button>
              </div>
            </div>

            {/* SECTION: UPCOMING DRIVES OF APPLIED COMPANIES */}
            {upcomingDrives.length > 0 && (
              <div className="bg-[#131B2E] border border-slate-800 rounded-2xl p-5 shadow-lg shadow-black/20">
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-amber-400" />
                    <h2 className="text-sm font-bold text-white tracking-tight uppercase tracking-wider text-[11px] text-amber-400">
                      Upcoming Drives of Applied Companies ({upcomingDrives.length})
                    </h2>
                  </div>
                  <span className="text-[11px] text-slate-400">
                    Online assessment schedule
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {upcomingDrives.map((drive) => {
                    const badge = getDaysRemainingBadge(drive.oaDate!);
                    return (
                      <div 
                        key={drive.id}
                        className="bg-[#0B0F19] border border-slate-800/90 rounded-xl p-3.5 flex flex-col justify-between gap-2.5 hover:border-indigo-500/40 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h3 className="text-sm font-bold text-white">{drive.name}</h3>
                              <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md border ${badge.color}`}>
                                {badge.text}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-400 line-clamp-1">{drive.role} • <span className="text-indigo-300 font-mono font-semibold">{drive.ctc}</span></p>
                          </div>
                        </div>

                        {/* Date & Shortlist Status Modifier */}
                        <div className="pt-2 border-t border-slate-800/70 flex items-center justify-between text-xs">
                          <span className="text-[11px] text-slate-400 font-mono flex items-center gap-1">
                            <Clock className="w-3 h-3 text-amber-400" />
                            {new Date(drive.oaDate!).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                          </span>

                          <div className="flex items-center gap-1">
                            {drive.oaStatus === 'shortlisted' ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" />
                                Shortlisted
                              </span>
                            ) : drive.oaStatus === 'not_shortlisted' ? (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1">
                                <XCircle className="w-3 h-3" />
                                Not Shortlisted
                              </span>
                            ) : (
                              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                Pending
                              </span>
                            )}

                            <button
                              onClick={() => openEditModal(drive)}
                              className="text-[10px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700"
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

            {/* COMPANY MANAGEMENT: Minimal Controls & Filter Chips */}
            <div className="bg-[#131B2E] border border-slate-800 p-3 rounded-2xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shadow-md shadow-black/20">
              
              {/* Status Filter Chips */}
              <div className="flex items-center gap-1 bg-[#0B0F19] p-1 rounded-xl border border-slate-800/80 self-start">
                <button
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    statusFilter === 'all'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  All ({companies.length})
                </button>
                <button
                  onClick={() => setStatusFilter('applied')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    statusFilter === 'applied'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Applied ({stats.totalApplied})
                </button>
                <button
                  onClick={() => setStatusFilter('not_applied')}
                  className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                    statusFilter === 'not_applied'
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Skipped ({stats.totalNotApplied})
                </button>
              </div>

              {/* Search & Selectors */}
              <div className="flex flex-1 md:max-w-md items-center gap-2">
                <div className="relative flex-1">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search company, CTC, reason..."
                    className="w-full pl-8 pr-3 py-1.5 bg-[#0B0F19] border border-slate-700/70 rounded-xl text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                  />
                </div>

                <select
                  value={tierFilter}
                  onChange={(e) => setTierFilter(e.target.value)}
                  className="px-2.5 py-1.5 bg-[#0B0F19] border border-slate-700/70 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Tiers</option>
                  <option value="OPEN_DREAM">Open Dream (≥12 LPA)</option>
                  <option value="DREAM">Dream (&lt;12 LPA)</option>
                  <option value="MASS">Mass / Regular</option>
                  <option value="INTERN_ONLY">Internship</option>
                  <option value="OFF_CAMPUS">Off-Campus</option>
                </select>

                <div className="flex items-center gap-1 bg-[#0B0F19] border border-slate-700/70 rounded-xl px-2 py-0.5">
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-transparent text-xs text-slate-300 focus:outline-none pr-1 py-1"
                  >
                    <option value="date_desc" className="bg-[#0B0F19]">Newest</option>
                    <option value="name_asc" className="bg-[#0B0F19]">A - Z</option>
                    <option value="oa_date" className="bg-[#0B0F19]">OA Date</option>
                  </select>
                </div>

                {(searchQuery || tierFilter !== 'ALL' || statusFilter !== 'all') && (
                  <button
                    onClick={resetFilters}
                    title="Reset filters"
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-colors"
                  >
                    <RotateCcw className="w-3 h-3" />
                  </button>
                )}
              </div>

            </div>

            {/* Companies Grid */}
            {filteredCompanies.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    <h3 className="text-sm font-semibold text-white">No companies match your filters</h3>
                    <p className="text-xs text-slate-400">
                      Try clearing the search query or status filter.
                    </p>
                    <button
                      onClick={resetFilters}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 transition-colors"
                    >
                      Clear Filters
                    </button>
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

      {/* Expandable Footer with Keywords */}
      <Footer />

      {/* Modals */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        currentProfile={profile}
        onSave={handleSaveProfile}
        isFirstTime={!profile || !profile.name}
      />

      <CompanyModal
        isOpen={isCompanyModalOpen}
        onClose={() => setIsCompanyModalOpen(false)}
        onSave={handleSaveCompany}
        editCompany={editCompany}
        defaultStatus={defaultStatusForModal}
      />

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
