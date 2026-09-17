import type { Company, StudentProfile, StatisticsData, RejectionReasonTag, OARejectionReasonTag } from '../types';
import {
  initDB,
  getCompaniesFromDB,
  saveCompaniesToDB,
  getProfileFromDB,
  saveProfileToDB,
  getLastBackupDate,
  setLastBackupDate,
  requestPersistentStorage,
  isStoragePersisted,
} from './db';

export { getLastBackupDate, setLastBackupDate, requestPersistentStorage, isStoragePersisted };

const STORAGE_KEY_COMPANIES = 'track_my_company_companies_v1';
const STORAGE_KEY_PROFILE = 'track_my_company_profile_v1';

export const REJECTION_PRESET_TAGS: RejectionReasonTag[] = [
  'Branch',
  'CGPA',
  'CTC',
  'Location',
  'Role',
  'PBC',
  'Others'
];

export const OA_REJECTION_PRESET_TAGS: OARejectionReasonTag[] = [
  'CGPA',
  'Resume',
  'Random',
  'Others'
];

export const normalizeRejectionTag = (tag: string): RejectionReasonTag => {
  const lower = tag.toLowerCase().trim();
  if (lower.includes('branch')) return 'Branch';
  if (lower.includes('cgpa') || lower.includes('grade') || lower.includes('cutoff')) return 'CGPA';
  if (lower.includes('ctc') || lower.includes('pay') || lower.includes('package') || lower.includes('salary')) return 'CTC';
  if (lower.includes('location') || lower.includes('relocation') || lower.includes('city')) return 'Location';
  if (lower.includes('role') || lower.includes('profile') || lower.includes('domain')) return 'Role';
  if (lower.includes('pbc') || lower.includes('product')) return 'PBC';
  return 'Others';
};

export const normalizeOARejectionTag = (tag: string): OARejectionReasonTag => {
  const lower = tag.toLowerCase().trim();
  if (lower.includes('cgpa') || lower.includes('cutoff') || lower.includes('grade')) return 'CGPA';
  if (lower.includes('resume') || lower.includes('cv') || lower.includes('ats')) return 'Resume';
  if (lower.includes('random') || lower.includes('unknown') || lower.includes('luck')) return 'Random';
  return 'Others';
};

// In-memory cache for ultra-fast UI renders
let memoryCompanies: Company[] = [];
let memoryProfile: StudentProfile | null = null;
let isInitialized = false;

/**
 * Initialize storage engine (IndexedDB + one-time migration from localStorage).
 */
export const initStorage = async (): Promise<{ companies: Company[]; profile: StudentProfile | null }> => {
  await initDB();
  memoryCompanies = await getCompaniesFromDB();
  memoryProfile = await getProfileFromDB();
  isInitialized = true;
  return { companies: memoryCompanies, profile: memoryProfile };
};

export const getProfile = async (): Promise<StudentProfile | null> => {
  if (!isInitialized) {
    await initStorage();
  }
  const profile = await getProfileFromDB();
  memoryProfile = profile;
  return profile;
};

export const getProfileSync = (): StudentProfile | null => {
  return memoryProfile;
};

export const saveProfile = async (profile: StudentProfile): Promise<void> => {
  memoryProfile = { ...profile };
  await saveProfileToDB(profile);
  // Keep localStorage updated as fallback
  try {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  } catch (_) {}
  window.dispatchEvent(new Event('storage-profile-change'));
};

export const getCompanies = async (): Promise<Company[]> => {
  if (!isInitialized) {
    await initStorage();
  }
  const companies = await getCompaniesFromDB();
  memoryCompanies = companies;
  return companies;
};

export const getCompaniesSync = (): Company[] => {
  return memoryCompanies;
};

export const saveCompanies = async (companies: Company[]): Promise<void> => {
  memoryCompanies = [...companies];
  await saveCompaniesToDB(companies);
  // Keep localStorage updated as fallback
  try {
    localStorage.setItem(STORAGE_KEY_COMPANIES, JSON.stringify(companies));
  } catch (_) {}
  window.dispatchEvent(new Event('storage-companies-change'));
};

export const addCompany = async (data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Promise<Company> => {
  const existing = await getCompanies();
  const now = new Date().toISOString();
  const newCompany: Company = {
    ...data,
    id: `cmp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: now,
    updatedAt: now,
  };
  const updated = [newCompany, ...existing];
  await saveCompanies(updated);
  return newCompany;
};

export const updateCompany = async (company: Company): Promise<void> => {
  const existing = await getCompanies();
  const updated = existing.map((c) =>
    c.id === company.id ? { ...company, updatedAt: new Date().toISOString() } : c
  );
  await saveCompanies(updated);
};

export const deleteCompany = async (id: string): Promise<void> => {
  const existing = await getCompanies();
  const updated = existing.filter((c) => c.id !== id);
  await saveCompanies(updated);
};

export const calculateStatistics = (companies: Company[]): StatisticsData => {
  const totalVisited = companies.length;
  const appliedList = companies.filter((c) => c.status === 'applied');
  const notAppliedList = companies.filter((c) => c.status === 'not_applied');
  const undecidedList = companies.filter((c) => c.status === 'undecided');

  const totalApplied = appliedList.length;
  const totalNotApplied = notAppliedList.length;
  const totalUndecided = undecidedList.length;

  const appliedPercentage = totalVisited > 0 ? Math.round((totalApplied / totalVisited) * 100) : 0;
  const notAppliedPercentage = totalVisited > 0 ? Math.round((totalNotApplied / totalVisited) * 100) : 0;

  // OA stats
  const oaScheduledList = appliedList.filter((c) => !!c.oaDate);
  const totalOAScheduled = oaScheduledList.length;
  const oaNotShortlistedList = appliedList.filter((c) => c.oaStatus === 'not_shortlisted');
  const oaNotShortlistedCount = oaNotShortlistedList.length;
  const oaShortlistedCount = Math.max(0, totalApplied - oaNotShortlistedCount);
  const oaPendingCount = 0;
  const oaShortlistConversionRate = totalApplied > 0 ? Math.round((oaShortlistedCount / totalApplied) * 100) : 0;

  // Tier counts
  const openDreamCount = companies.filter((c) => c.tier === 'OPEN_DREAM').length;
  const dreamCount = companies.filter((c) => c.tier === 'DREAM').length;
  const massCount = companies.filter((c) => c.tier === 'MASS').length;
  const internCount = companies.filter((c) => c.tier === 'INTERN_ONLY').length;
  const offCampusCount = companies.filter((c) => c.tier === 'OFF_CAMPUS').length;

  // Group rejection reasons (Skipped)
  const reasonMap: { [tag: string]: { count: number; customNotes: string[] } } = {};
  
  // Seed all preset tags
  REJECTION_PRESET_TAGS.forEach((tag) => {
    reasonMap[tag] = { count: 0, customNotes: [] };
  });

  notAppliedList.forEach((company) => {
    const tags = company.rejectionReasonTags?.length 
      ? company.rejectionReasonTags 
      : ['Others'];

    tags.forEach((rawTag) => {
      const tag = normalizeRejectionTag(rawTag);
      if (!reasonMap[tag]) {
        reasonMap[tag] = { count: 0, customNotes: [] };
      }
      reasonMap[tag].count += 1;
      if (company.customReasonNote && company.customReasonNote.trim()) {
        if (!reasonMap[tag].customNotes.includes(company.customReasonNote.trim())) {
          reasonMap[tag].customNotes.push(company.customReasonNote.trim());
        }
      }
    });
  });

  const rejectionReasons = Object.entries(reasonMap)
    .filter(([_, data]) => data.count > 0)
    .map(([tag, data]) => ({
      tag,
      count: data.count,
      percentage: totalNotApplied > 0 ? Math.round((data.count / totalNotApplied) * 100) : 0,
      customNotes: data.customNotes,
    }))
    .sort((a, b) => b.count - a.count);

  // Group OA rejection reasons (Applied but not shortlisted to write OA)
  const oaReasonMap: { [tag: string]: { count: number; customNotes: string[] } } = {};
  OA_REJECTION_PRESET_TAGS.forEach((tag) => {
    oaReasonMap[tag] = { count: 0, customNotes: [] };
  });

  oaNotShortlistedList.forEach((company) => {
    const rawTags = company.oaRejectionReasonTags?.length
      ? company.oaRejectionReasonTags
      : [];

    if (rawTags.length === 0) {
      // If no tag is explicitly selected, group under 'Others'
      oaReasonMap['Others'].count += 1;
      if (company.oaCustomReasonNote && company.oaCustomReasonNote.trim()) {
        if (!oaReasonMap['Others'].customNotes.includes(company.oaCustomReasonNote.trim())) {
          oaReasonMap['Others'].customNotes.push(company.oaCustomReasonNote.trim());
        }
      }
    } else {
      rawTags.forEach((rawTag) => {
        const mappedTag = normalizeOARejectionTag(rawTag);
        if (!oaReasonMap[mappedTag]) {
          oaReasonMap[mappedTag] = { count: 0, customNotes: [] };
        }
        oaReasonMap[mappedTag].count += 1;
        if (company.oaCustomReasonNote && company.oaCustomReasonNote.trim()) {
          if (!oaReasonMap[mappedTag].customNotes.includes(company.oaCustomReasonNote.trim())) {
            oaReasonMap[mappedTag].customNotes.push(company.oaCustomReasonNote.trim());
          }
        }
      });
    }
  });

  const totalOARejected = oaNotShortlistedList.length;
  const oaRejectionReasons = Object.entries(oaReasonMap)
    .filter(([_, data]) => data.count > 0)
    .map(([tag, data]) => ({
      tag,
      count: data.count,
      percentage: totalOARejected > 0 ? Math.round((data.count / totalOARejected) * 100) : 0,
      customNotes: data.customNotes,
    }))
    .sort((a, b) => b.count - a.count);

  return {
    totalVisited,
    totalApplied,
    totalNotApplied,
    totalUndecided,
    appliedPercentage,
    notAppliedPercentage,
    totalOAScheduled,
    oaShortlistedCount,
    oaNotShortlistedCount,
    oaPendingCount,
    oaShortlistConversionRate,
    openDreamCount,
    dreamCount,
    massCount,
    internCount,
    offCampusCount,
    rejectionReasons,
    oaRejectionReasons,
  };
};

export const exportToJSON = async (): Promise<string> => {
  const [profile, companies] = await Promise.all([getProfile(), getCompanies()]);
  const now = new Date().toISOString();
  const data = {
    profile,
    companies,
    exportedAt: now,
    version: '1.0',
    storageEngine: 'IndexedDB',
  };
  await setLastBackupDate(now);
  return JSON.stringify(data, null, 2);
};

export const importFromJSON = async (jsonString: string): Promise<boolean> => {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.profile) {
      await saveProfile(parsed.profile);
    }
    if (Array.isArray(parsed.companies)) {
      await saveCompanies(parsed.companies);
    }
    return true;
  } catch (err) {
    console.error('Invalid JSON backup file', err);
    return false;
  }
};
