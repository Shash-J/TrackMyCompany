import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Company, StudentProfile } from '../types';

export interface TrackMyCompanyDB extends DBSchema {
  companies: {
    key: string;
    value: Company & { order?: number };
    indexes: { 'by-order': number };
  };
  profile: {
    key: string;
    value: StudentProfile & { id: string };
  };
  meta: {
    key: string;
    value: { key: string; value: any; updatedAt?: string };
  };
}

const DB_NAME = 'trackmycompany_db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<TrackMyCompanyDB>> | null = null;

export interface StorageSnapshot {
  companies: Company[];
  profile: StudentProfile | null;
  revision: number;
}

export const STORAGE_REVISION_KEY = 'storage_revision_v2';

const orderedCompanies = (items: (Company & { order?: number })[]): Company[] => {
  items.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  return items.map(({ order: _order, ...company }) => company);
};

/** Read, recover and mutate both datasets under one IndexedDB transaction. */
export async function transactStorage(
  checkpoint: StorageSnapshot | null,
  mutate?: (current: StorageSnapshot) => StorageSnapshot,
  onRead?: (current: StorageSnapshot) => void,
): Promise<StorageSnapshot> {
  const db = await getDB();
  const tx = db.transaction(['companies', 'profile', 'meta'], 'readwrite');
  try {
    const [items, record, revision] = await Promise.all([
      tx.objectStore('companies').getAll(),
      tx.objectStore('profile').get('student_profile'),
      tx.objectStore('meta').get(STORAGE_REVISION_KEY),
    ]);
    const { id: _id, ...profile } = record ?? {};
    const stored: StorageSnapshot = {
      companies: orderedCompanies(items),
      profile: record ? profile as StudentProfile : null,
      revision: typeof revision?.value === 'number' ? revision.value : 0,
    };
    // A fallback-only write has a higher revision than the old database. Empty
    // datasets are authoritative too, preventing deleted records reappearing.
    const current = checkpoint && (!revision || checkpoint.revision > stored.revision) ? checkpoint : stored;
    onRead?.(current);
    const next = mutate ? mutate(current) : current;
    if (next !== stored) {
      if (next.companies !== stored.companies) {
        await tx.objectStore('companies').clear();
        for (let order = 0; order < next.companies.length; order++) {
          await tx.objectStore('companies').put({ ...next.companies[order], order });
        }
      }
      if (next.profile !== stored.profile) {
        if (next.profile) await tx.objectStore('profile').put({ ...next.profile, id: 'student_profile' });
        else await tx.objectStore('profile').delete('student_profile');
      }
    }
    if (next !== stored || !revision) {
      await tx.objectStore('meta').put({ key: STORAGE_REVISION_KEY, value: next.revision });
    }
    await tx.done;
    return next;
  } catch (error) {
    try { tx.abort(); } catch { /* Already aborted/completed. */ }
    await tx.done.catch(() => {});
    throw error;
  }
}

export function getDB(): Promise<IDBPDatabase<TrackMyCompanyDB>> {
  if (!dbPromise) {
    dbPromise = openDB<TrackMyCompanyDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Companies Store
        if (!db.objectStoreNames.contains('companies')) {
          const companyStore = db.createObjectStore('companies', { keyPath: 'id' });
          companyStore.createIndex('by-order', 'order');
        }
        // Profile Store
        if (!db.objectStoreNames.contains('profile')) {
          db.createObjectStore('profile', { keyPath: 'id' });
        }
        // Meta Store (for flags, backup reminders, etc.)
        if (!db.objectStoreNames.contains('meta')) {
          db.createObjectStore('meta', { keyPath: 'key' });
        }
      },
      blocking() {
        // Release this tab's connection so a future schema upgrade can proceed.
        const current = dbPromise;
        dbPromise = null;
        void current?.then(db => db.close());
      },
      terminated() {
        dbPromise = null;
      },
    }).catch(error => {
      // Do not permanently memoize a transient open failure.
      dbPromise = null;
      throw error;
    });
  }
  return dbPromise;
}

/**
 * Request persistent storage permission from the browser.
 * This instructs the browser not to auto-evict IndexedDB data under storage pressure.
 */
export async function requestPersistentStorage(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
    try {
      const isPersisted = await navigator.storage.persisted();
      if (isPersisted) {
        return true;
      }
      const granted = await navigator.storage.persist();
      console.log(`[IndexedDB] Persistent storage permission granted: ${granted}`);
      return granted;
    } catch (err) {
      console.warn('[IndexedDB] Error requesting persistent storage:', err);
      return false;
    }
  }
  return false;
}

/**
 * Check if persistent storage is already granted.
 */
export async function isStoragePersisted(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persisted) {
    try {
      return await navigator.storage.persisted();
    } catch (err) {
      console.warn('[IndexedDB] Error checking persistence:', err);
      return false;
    }
  }
  return false;
}

const STORAGE_KEY_COMPANIES = 'track_my_company_companies_v1';
const STORAGE_KEY_PROFILE = 'track_my_company_profile_v1';

/** Migrate legacy keys only into empty stores; commit the flag with the data. */
export async function migrateFromLocalStorage(db: IDBPDatabase<TrackMyCompanyDB>): Promise<void> {
  if ((await db.get('meta', 'migrated_from_localstorage'))?.value === true) return;
  let rawCompanies: string | null;
  let rawProfile: string | null;
  try {
    rawCompanies = await db.count('companies') === 0 ? localStorage.getItem(STORAGE_KEY_COMPANIES) : null;
    rawProfile = !await db.get('profile', 'student_profile') ? localStorage.getItem(STORAGE_KEY_PROFILE) : null;
  } catch (error) {
    // Browsers can deny localStorage independently of IndexedDB. Keep the
    // working DB usable and retry legacy migration on a later initialization.
    console.warn('[IndexedDB] Legacy storage is inaccessible.', error);
    return;
  }
  const companies: Company[] = rawCompanies ? JSON.parse(rawCompanies) : [];
  const profile: StudentProfile | null = rawProfile ? JSON.parse(rawProfile) : null;
  const tx = db.transaction(['companies', 'profile', 'meta'], 'readwrite');
  try {
    // Another tab may have completed migration before this transaction began.
    if ((await tx.objectStore('meta').get('migrated_from_localstorage'))?.value !== true) {
      if (Array.isArray(companies) && await tx.objectStore('companies').count() === 0) {
        for (let order = 0; order < companies.length; order++) {
          if (companies[order]?.id) await tx.objectStore('companies').put({ ...companies[order], order });
        }
      }
      if (profile?.name && !await tx.objectStore('profile').get('student_profile')) {
        await tx.objectStore('profile').put({ ...profile, id: 'student_profile' });
      }
      await tx.objectStore('meta').put({
        key: 'migrated_from_localstorage', value: true, updatedAt: new Date().toISOString(),
      });
    }
    await tx.done;
  } catch (error) {
    try { tx.abort(); } catch { /* Already aborted. */ }
    await tx.done.catch(() => {});
    throw error;
  }
}

/**
 * Initialize IndexedDB:
 * 1. Open connection and create stores if needed
 * 2. Request persistent storage
 * 3. Run one-time migration from localStorage
 */
export async function initDB(): Promise<IDBPDatabase<TrackMyCompanyDB>> {
  const db = await getDB();
  // Request persistence in the background
  requestPersistentStorage().catch(() => {});
  // Run migration
  await migrateFromLocalStorage(db);
  return db;
}

/**
 * Retrieve all companies from IndexedDB, ordered by user's rank/order.
 */
export async function getCompaniesFromDB(): Promise<Company[]> {
  try {
    const db = await getDB();
    const items = await db.getAll('companies');
    // Sort by order index
    items.sort((a, b) => {
      const orderA = typeof a.order === 'number' ? a.order : 0;
      const orderB = typeof b.order === 'number' ? b.order : 0;
      return orderA - orderB;
    });
    // Remove internal 'order' property before returning clean Company objects
    return items.map(({ order: _order, ...company }) => company as Company);
  } catch (err) {
    console.error('[IndexedDB] Failed to get companies:', err);
    throw err;
  }
}

/**
 * Save all companies to IndexedDB atomically.
 * Preserves user's exact array ordering.
 */
export async function saveCompaniesToDB(companies: Company[]): Promise<void> {
  try {
    const db = await getDB();
    const tx = db.transaction('companies', 'readwrite');
    try {
      // A synchronous DataCloneError must abort the clear as well; otherwise a
      // malformed record can commit partial data.
      await tx.store.clear();
      for (let order = 0; order < companies.length; order++) {
        await tx.store.put({ ...companies[order], order });
      }
      await tx.done;
    } catch (error) {
      try { tx.abort(); } catch { /* Transaction may already be aborted. */ }
      await tx.done.catch(() => {});
      throw error;
    }
  } catch (err) {
    console.error('[IndexedDB] Failed to save companies:', err);
    throw err;
  }
}

/**
 * Retrieve student profile from IndexedDB.
 */
export async function getProfileFromDB(): Promise<StudentProfile | null> {
  try {
    const db = await getDB();
    const record = await db.get('profile', 'student_profile');
    if (!record) return null;
    const { id: _id, ...profile } = record;
    return profile as StudentProfile;
  } catch (err) {
    console.error('[IndexedDB] Failed to get profile:', err);
    throw err;
  }
}

/**
 * Save student profile to IndexedDB.
 */
export async function saveProfileToDB(profile: StudentProfile): Promise<void> {
  try {
    const db = await getDB();
    await db.put('profile', { id: 'student_profile', ...profile });
  } catch (err) {
    console.error('[IndexedDB] Failed to save profile:', err);
    throw err;
  }
}

/**
 * Get the ISO timestamp of the last successful backup/export.
 */
export async function getLastBackupDate(): Promise<string | null> {
  try {
    const db = await getDB();
    const record = await db.get('meta', 'last_backup_date');
    return record?.value || null;
  } catch (err) {
    console.error('[IndexedDB] Failed to get last backup date:', err);
    return null;
  }
}

/**
 * Update the last backup date in IndexedDB.
 */
export async function setLastBackupDate(isoDateString: string): Promise<void> {
  try {
    const db = await getDB();
    await db.put('meta', {
      key: 'last_backup_date',
      value: isoDateString,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[IndexedDB] Failed to set last backup date:', err);
  }
}
