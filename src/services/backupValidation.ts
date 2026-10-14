import type { Company, StudentProfile } from '../types';

const object = (value: unknown): value is Record<string, unknown> =>
  value !== null && typeof value === 'object' && !Array.isArray(value);
const optionalStrings = (value: Record<string, unknown>, keys: string[]) =>
  keys.every(key => value[key] === undefined || typeof value[key] === 'string');

export function isProfile(value: unknown): value is StudentProfile {
  return object(value) && typeof value.name === 'string' && !!value.name.trim()
    && optionalStrings(value, ['branch', 'batch', 'college', 'targetCtc']);
}

export function isCompanyList(value: unknown): value is Company[] {
  if (!Array.isArray(value)) return false;
  const ids = new Set<string>();
  return value.every(company => {
    if (!object(company) || typeof company.id !== 'string' || !company.id.trim()
      || ids.has(company.id) || typeof company.name !== 'string' || !company.name.trim()
      || typeof company.ctc !== 'string'
      || !['OPEN_DREAM', 'DREAM', 'MASS', 'INTERN_ONLY', 'OFF_CAMPUS'].includes(String(company.tier))
      || !['applied', 'not_applied', 'undecided'].includes(String(company.status))
      || !optionalStrings(company, ['type', 'role', 'applicationDeadline', 'formLink', 'customReasonNote',
        'oaDate', 'oaCustomReasonNote', 'notes', 'createdAt', 'updatedAt'])
      || (company.oaStatus !== undefined && !['pending', 'shortlisted', 'not_shortlisted'].includes(String(company.oaStatus)))
      || (company.oaCleared !== undefined && typeof company.oaCleared !== 'boolean')
      || !['rejectionReasonTags', 'oaRejectionReasonTags'].every(key => company[key] === undefined
        || (Array.isArray(company[key]) && company[key].every(tag => typeof tag === 'string')))) return false;
    ids.add(company.id);
    return true;
  });
}

// Legacy backups may omit timestamps, metadata or either dataset. Keep their
// values intact; validation must never silently rewrite placement decisions.
export function parseBackup(text: string): { companies?: Company[]; profile?: StudentProfile } {
  const value: unknown = JSON.parse(text);
  if (!object(value) || (!('companies' in value) && !('profile' in value))
    || ('companies' in value && !isCompanyList(value.companies))
    || ('profile' in value && value.profile !== null && !isProfile(value.profile))) {
    throw new Error('Invalid backup file format.');
  }
  return {
    companies: value.companies as Company[] | undefined,
    // The existing restore behavior leaves the current profile when null.
    profile: value.profile === null ? undefined : value.profile as StudentProfile | undefined,
  };
}
