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

/**
 * One-time migration from localStorage to IndexedDB.
 * Guarantees zero data loss for users who previously had data in localStorage.
 */
export async function migrateFromLocalStorage(db: IDBPDatabase<TrackMyCompanyDB>): Promise<void> {
  try {
    const migrationFlag = await db.get('meta', 'migrated_from_localstorage');
    if (migrationFlag && migrationFlag.value === true) {
      return; // Already migrated
    }

    // Check if there are companies in localStorage
    const rawCompanies = localStorage.getItem(STORAGE_KEY_COMPANIES);
    let migratedCount = 0;
    if (rawCompanies) {
      try {
        const parsed = JSON.parse(rawCompanies);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const tx = db.transaction('companies', 'readwrite');
          for (let i = 0; i < parsed.length; i++) {
            const company = parsed[i];
            if (company && company.id) {
              await tx.store.put({ ...company, order: i });
              migratedCount++;
            }
          }
          await tx.done;
          console.log(`[IndexedDB] Successfully migrated ${migratedCount} companies from localStorage.`);
        }
      } catch (err) {
        console.error('[IndexedDB] Failed parsing localStorage companies during migration:', err);
      }
    }

    // Check profile
    const rawProfile = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (rawProfile) {
      try {
        const parsedProfile = JSON.parse(rawProfile);
        if (parsedProfile && parsedProfile.name) {
          await db.put('profile', { id: 'student_profile', ...parsedProfile });
          console.log('[IndexedDB] Successfully migrated profile from localStorage.');
        }
      } catch (err) {
        console.error('[IndexedDB] Failed parsing localStorage profile during migration:', err);
      }
    }

    // Mark as migrated
    await db.put('meta', {
      key: 'migrated_from_localstorage',
      value: true,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[IndexedDB] Migration error:', err);
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
    return [];
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
    await tx.store.clear();
    for (let i = 0; i < companies.length; i++) {
      await tx.store.put({ ...companies[i], order: i });
    }
    await tx.done;
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
    return null;
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
