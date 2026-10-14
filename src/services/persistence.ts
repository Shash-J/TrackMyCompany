import { initDB, transactStorage, type StorageSnapshot } from './db';
import { isCompanyList, isProfile } from './backupValidation';

export const SNAPSHOT_KEY = 'track_my_company_snapshot_v2';
const COMPANIES_KEY = 'track_my_company_companies_v1';
const PROFILE_KEY = 'track_my_company_profile_v1';
const LOCK_NAME = 'trackmycompany-storage-v2';
export const SAVE_ERROR = 'Could not save your changes. Browser storage is unavailable or full. Please free some space and try again.';

let memory: StorageSnapshot | null = null;
let queue: Promise<unknown> = Promise.resolve();
let initialized = false;
let changes: BroadcastChannel | null = null;

function connectChanges(): void {
  if (!changes && typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    changes = new BroadcastChannel(LOCK_NAME);
    changes.onmessage = () => window.dispatchEvent(new Event('storage-data-change'));
  }
}

// The local queue includes reads so a read never passes an unfinished write.
// Web Locks extend this ordering to other tabs, including fallback-only writes.
function exclusive<T>(operation: () => Promise<T>): Promise<T> {
  const run = () => typeof navigator !== 'undefined' && navigator.locks
    ? navigator.locks.request(LOCK_NAME, operation) : operation();
  const result = queue.then(run, run);
  queue = result.catch(() => {});
  return result;
}

function checkpoint(): StorageSnapshot | null {
  const raw = localStorage.getItem(SNAPSHOT_KEY);
  if (!raw) return null;
  const parsed = JSON.parse(raw);
  if (parsed.schema !== 2 || !Number.isSafeInteger(parsed.revision) || parsed.revision < 0
    || !isCompanyList(parsed.companies) || (parsed.profile !== null && !isProfile(parsed.profile))) {
    throw new Error('Stored recovery snapshot is invalid.');
  }
  return { companies: parsed.companies, profile: parsed.profile, revision: parsed.revision };
}

function legacyFallback(): StorageSnapshot {
  // Keep legacy payloads intact. A parse failure prevents overwriting them.
  const rawCompanies = localStorage.getItem(COMPANIES_KEY);
  const rawProfile = localStorage.getItem(PROFILE_KEY);
  return {
    companies: rawCompanies ? JSON.parse(rawCompanies) : [],
    profile: rawProfile ? JSON.parse(rawProfile) : null,
    revision: 0,
  };
}

function writeCheckpoint(snapshot: StorageSnapshot): void {
  // One atomic localStorage replacement includes both datasets and revision.
  localStorage.setItem(SNAPSHOT_KEY, JSON.stringify({ schema: 2, ...snapshot }));
}

function mirrorLegacy(snapshot: StorageSnapshot): void {
  // Retain the old keys for compatibility. Only the versioned snapshot is used
  // for recovery once present; partial mirror updates cannot become authority.
  try { localStorage.setItem(COMPANIES_KEY, JSON.stringify(snapshot.companies)); } catch { /* Best effort. */ }
  try { localStorage.setItem(PROFILE_KEY, JSON.stringify(snapshot.profile)); } catch { /* Best effort. */ }
}

async function operate(mutate?: (current: StorageSnapshot) => StorageSnapshot): Promise<StorageSnapshot> {
  let saved: StorageSnapshot | null = null;
  let fallbackError: unknown;
  try { saved = checkpoint(); } catch (error) { fallbackError = error; }
  let current: StorageSnapshot | null = null;
  let candidate: StorageSnapshot | null = null;
  let mutationError: unknown;
  const apply = (base: StorageSnapshot): StorageSnapshot => {
    if (!mutate) return base;
    try {
      const next = mutate(base);
      // Validate serializability before attempting either persistence engine.
      // A bad record must never turn into a successful lossy JSON fallback.
      structuredClone(next);
      JSON.stringify(next);
      candidate = { ...next, revision: base.revision + 1 };
      return candidate;
    } catch (error) {
      mutationError = error;
      throw error;
    }
  };
  let result: StorageSnapshot;
  try {
    if (!initialized) {
      await initDB();
      initialized = true;
    }
    result = await transactStorage(saved, mutate ? apply : undefined, base => { current = base; });
  } catch (error) {
    if (mutationError) throw mutationError;
    console.warn('[Storage] IndexedDB unavailable; using the durable fallback.', error);
    // Prefer a successfully read DB snapshot, then its versioned mirror. A
    // stale legacy key or in-memory view must never supersede either of those.
    if (!current) {
      if (saved) current = saved;
      else if (fallbackError) throw fallbackError;
      else current = memory ?? legacyFallback();
    }
    result = candidate ?? apply(current);
    if (mutate) {
      try { writeCheckpoint(result); }
      catch (fallbackFailure) { throw new Error(SAVE_ERROR, { cause: fallbackFailure }); }
      mirrorLegacy(result);
    }
    memory = result;
    return result;
  }
  // The DB commit is already durable. Failure of its optional mirror does not
  // turn a successful commit into an error or cause an older mirror to win.
  if (mutate || !saved || saved.revision !== result.revision) {
    try { writeCheckpoint(result); mirrorLegacy(result); } catch { /* DB remains authoritative. */ }
  }
  memory = result;
  return result;
}

export const readStorage = (): Promise<StorageSnapshot> => {
  connectChanges();
  return exclusive(() => operate());
};
export const mutateStorage = (mutate: (current: StorageSnapshot) => StorageSnapshot): Promise<StorageSnapshot> =>
  exclusive(async () => {
    const result = await operate(mutate);
    window.dispatchEvent(new Event('storage-data-change'));
    // Also notify peers when localStorage is blocked and no storage event fires.
    try { changes?.postMessage(result.revision); } catch { /* Focus also refreshes peers. */ }
    return result;
  });

export const readMemoryStorage = (): StorageSnapshot => memory ?? { companies: [], profile: null, revision: 0 };
