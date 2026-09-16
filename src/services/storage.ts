import type { Company, StudentProfile, StatisticsData, RejectionReasonTag, OARejectionReasonTag } from '../types';

const STORAGE_KEY_COMPANIES = 'track_my_company_companies_v1';
const STORAGE_KEY_PROFILE = 'track_my_company_profile_v1';

export const REJECTION_PRESET_TAGS: RejectionReasonTag[] = [
  'Low CTC',
  'Strict Bond / Service Agreement',
  'Location Not Preferred',
  'Not Interested in Role',
  'CGPA / Branch Ineligible',
  'Focusing on Other Companies',
  'PBC',
  'Other'
];

export const OA_REJECTION_PRESET_TAGS: OARejectionReasonTag[] = [
  'CGPA',
  'Resume',
  'Random / Unknown',
  'Other'
];

export const getProfile = (): StudentProfile | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load profile from localStorage', err);
    return null;
  }
};

export const saveProfile = (profile: StudentProfile): void => {
  try {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
    window.dispatchEvent(new Event('storage-profile-change'));
  } catch (err) {
    console.error('Failed to save profile to localStorage', err);
  }
};

export const getCompanies = (): Company[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COMPANIES);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load companies from localStorage', err);
    return [];
  }
};

export const saveCompanies = (companies: Company[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_COMPANIES, JSON.stringify(companies));
    window.dispatchEvent(new Event('storage-companies-change'));
  } catch (err) {
    console.error('Failed to save companies to localStorage', err);
  }
};

export const addCompany = (data: Omit<Company, 'id' | 'createdAt' | 'updatedAt'>): Company => {
  const existing = getCompanies();
  const now = new Date().toISOString();
  const newCompany: Company = {
    ...data,
    id: `cmp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: now,
    updatedAt: now,
  };
  const updated = [newCompany, ...existing];
  saveCompanies(updated);
  return newCompany;
};

export const updateCompany = (company: Company): void => {
  const existing = getCompanies();
  const updated = existing.map((c) =>
    c.id === company.id ? { ...company, updatedAt: new Date().toISOString() } : c
  );
  saveCompanies(updated);
};

export const deleteCompany = (id: string): void => {
  const existing = getCompanies();
  const updated = existing.filter((c) => c.id !== id);
  saveCompanies(updated);
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
      : [company.rejectionReasonTag || 'Other'];

    tags.forEach((tag) => {
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
      : (company.oaRejectionReasonTag ? [company.oaRejectionReasonTag] : []);

    if (rawTags.length === 0) {
      // If no tag is explicitly selected, group under 'Other'
      oaReasonMap['Other'].count += 1;
      if (company.oaCustomReasonNote && company.oaCustomReasonNote.trim()) {
        if (!oaReasonMap['Other'].customNotes.includes(company.oaCustomReasonNote.trim())) {
          oaReasonMap['Other'].customNotes.push(company.oaCustomReasonNote.trim());
        }
      }
    } else {
      rawTags.forEach((tag) => {
        const mappedTag = OA_REJECTION_PRESET_TAGS.includes(tag) ? tag : 'Other';
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

export const exportToJSON = (): string => {
  const data = {
    profile: getProfile(),
    companies: getCompanies(),
    exportedAt: new Date().toISOString(),
    version: '1.0',
  };
  return JSON.stringify(data, null, 2);
};

export const importFromJSON = (jsonString: string): boolean => {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.profile) {
      saveProfile(parsed.profile);
    }
    if (Array.isArray(parsed.companies)) {
      saveCompanies(parsed.companies);
    }
    return true;
  } catch (err) {
    console.error('Invalid JSON backup file', err);
    return false;
  }
};
