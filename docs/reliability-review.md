# Reliability and performance review — 2026-10-14

Baseline: `10fb6c9` on `main`. This is a focused first hardening pass, not a claim that the entire product is bug-free. Preserve the existing screens, terminology, placement decisions, parser heuristics, data model, and import/export formats.

## Repository and behavior map

The baseline contains 55 tracked files, including source, assets, configuration, documentation and the dependency lockfile. The application is a static React/TypeScript PWA built with Vite and deployed to GitHub Pages. There is no application backend.

- `index.html`, `src/main.tsx`, `public/sw.js`, `public/manifest.json`, `public/version.json`, `src/version.ts`, and `vite.config.ts` define the document, startup, installation and update lifecycle.
- `src/App.tsx` owns profile/company state, navigation history, applied/skipped filters, the three OA groups, reminders, import merging and reordering.
- `src/services/db.ts` owns IndexedDB schema version 1, legacy localStorage migration, persistence requests and database transactions. `storage.ts` adds the memory cache, localStorage mirror, CRUD, statistics and JSON backup/restore.
- `excelService.ts` handles Excel/CSV parsing, column inference, profile sheets and downloads; `whatsappParser.ts` extracts announcements and dates. Their existing heuristics and exported formats are preserved.
- The components implement the navbar, bottom navigation, company cards/editor, profile, spreadsheet hub, charts/statistics, reminders, installation, about/update controls and footer. `StatCards` and `UpcomingOAs` are currently not imported by the application. `App.css` and the React/Vite starter assets are also not in the active app graph; they remain untouched.
- Public logos/icons, the tutorial asset, source assets, CSS, README, license, TypeScript/lint settings, package manifest/lockfile and deployment workflow were included in the repository inventory. Binary assets are assets to inspect/measure, not executable source. No branding or licensing changes are made.

## Implemented

| Problem | Change | Verification |
| --- | --- | --- |
| Every document launch waits on the network before falling back to cache | Serve the installed release's cached HTML immediately; check for releases through the existing service-worker update mechanism | Slow-document test at root and offline startup at root and `/TrackMyCompany/` |
| HTML cached without its built JS/CSS; optional features may fail on their first offline use | Generate the complete precache from production output, including lazy chunks, fonts and tutorial assets | First-use spreadsheet export offline, font loading offline, failed-install and successful-update tests |
| A failed precache still activates; cache identity only changes with manual version strings | Reject incomplete installs; content-based revision covers all assets and worker code | Simulated missing chunk keeps the previous release; successful replacement retains student records |
| Worker/update button deletes every cache on the origin | Scope cleanup to this app and release family; apply updates only after installation/activation without manually clearing caches | Unrelated cache retained; failed release retains previous cache |
| Installation reloads a first-time visitor's page | Reload on replacement of an existing controller; first claim does not reload | In-progress profile input survives first install |
| Spreadsheet library runs on every launch | Load the existing spreadsheet modal and its dependencies on demand | Entry bundle reduction; offline first use; modal screenshot equality |
| Google Fonts stylesheet is a render-blocking external dependency | Bundle the same Inter v20 font CSS and WOFF2 files locally, with its OFL license | Offline font load and unchanged before/after screenshots |
| Startup initializes and then reads the same data again | Reuse one initialization promise, load companies/profile concurrently, use its returned values in App | Shared-initialization test; existing UI data loads correctly |
| DB read failure is reported as empty data | Propagate failures to the existing localStorage fallback; allow retry after failed open/terminated connection | Failed-read fallback test |
| A synchronous structured-clone failure after clear can commit a partial company replacement | Explicitly abort and settle the transaction on failure | Invalid replacement preserves the entire previous ordered dataset |
| New-company form retains a previous edit's OA outcome | Reset the internal OA outcome for a new company | Edit-then-add browser regression |
| Undo not-shortlisted issues competing full-record writes | Use one status update that also resets the OA outcome | Undo survives reload with consistent fields |
| Import success appears before persistence completes | Await the existing import completion callback | Type/build checks; existing import workflow retained |
| Failed version check reports Latest | Use the existing error state when no remote version was obtained; bound version fetches | Failed-version-check browser regression |
| Tests fetch an unpinned runner and one parser suite is omitted | Pin `tsx`, run all existing suites, add storage/worker and production browser tests | `npm ci`, `npm test`, production build and browser suite |
| Deployment runs only a build | Add lint/unit/browser validation before deployment; add a PR validation workflow using Node 22 | Local workflow commands run; hosted CI checked separately in the PR |

## Measurements and validation

Measured on Windows, Node 22.19.0, Chromium 156 through Playwright. Mobile results use Pixel 7 emulation, not physical Android hardware. Fixture data is synthetic.

| Metric | Baseline | Candidate |
| --- | ---: | ---: |
| Initial JS, minified | 839.48 kB | approximately 393 kB |
| Initial JS, gzip | 256.57 kB | approximately 109 kB |
| Spreadsheet feature chunk | bundled at startup | approximately 448 kB, loaded on demand |
| Cached launch with an injected 5,000 ms document delay | 5,498 ms | 132 ms desktop / 115 ms mobile in the recorded run |
| Generated app CSS | 75.64 kB | identical bytes |

The initial JS reduction is about 53% raw / 57% compressed. Total JS across all chunks is approximately unchanged. This improves startup work; it does not claim that spreadsheet processing itself became faster. Precaching the full release and local fonts increases initial offline provisioning work. Subsequent launches and first-use offline features benefit from that completed cache.

- Existing engine, Excel and WhatsApp parser suites pass.
- Six new Node regression tests pass, including injected storage failures and worker lifecycle checks.
- Eighteen production-browser tests pass across desktop and mobile layouts.
- Ten before/after screenshots are byte-identical: dashboard, expanded card, statistics, spreadsheet modal, and profile modal, at both viewport sizes. The comparison normalizes baseline Google Fonts requests to the exact vendored font assets. It does not exercise every transient state or every screen.
- TypeScript/build passes. Lint exits successfully with pre-existing warnings (unused catch bindings, regex escapes, and React render/effect warnings); this is not a warning-free lint claim.
- The baseline fails the new slow-document performance assertion, and the candidate passes. Timings are single-run local evidence, not production percentiles or a speed guarantee for every phone.

Run:

```sh
npm ci
npm test
npm run lint
npm run build
npx playwright install chromium
npm run test:e2e
```

The browser harness serves `dist` on loopback only, injects a delayed HTML response / incomplete release, and never contacts production or uses student records. `TEST_DIST` can point it at an older production build to reproduce the baseline failure. Do not run two harnesses on the same port concurrently. `node scripts/compare-ui.mjs <baseline-dist> <output-dir>` runs the optional visual comparison.

## Next work, ordered by risk

These are findings/review targets still open. They should be separate tested changes rather than silently bundled into a startup optimization.

1. **Durable writes and recovery:** addressed by phase two below. Remaining qualifications include physical-device storage pressure and simultaneous fallback writes in browsers without Web Locks or tabs still running the previous implementation.
2. **JSON restore validation and atomicity:** addressed by phase two below, including legacy backup fixtures, quota failures, duplicate IDs and malformed nested fields.
3. **Dependency security:** `npm audit` reports eight high-severity package entries, including the shipped `xlsx@0.18.5` parser (prototype pollution and ReDoS), plus development-tool dependencies. There is no fixed `xlsx` version available through its existing npm release line. Qualify an upstream-supported distribution with real legacy `.xls`, `.xlsx`, CSV and roundtrip fixtures before replacing the parser. No blanket `audit fix --force` was applied.
4. **Data-fidelity edge cases:** Excel exports creation/update timestamps and deadline fields that its importer does not currently restore; date-only display paths use inconsistent local/UTC parsing; pasted registration links are parsed but not carried through the company form. Add fixtures first, then preserve intended fields without changing import heuristics or placement rules.
5. **Long-lived sessions and updates:** upcoming dates/reminders are memoized by company changes and do not refresh automatically at midnight. Automatic release reloads can still interrupt an edit (existing update policy). Review with an explicit dirty-form/state-restoration test before altering the update experience. Test a real installed Android PWA and iOS Safari offline/low-storage lifecycle.
6. **Large datasets:** each write still rewrites the complete company list and several handlers re-read it; import merging uses repeated linear searches. Profile realistic 100/1,000/10,000-record fixtures and optimize only with ordering/merge equivalence tests.

## Phase two: durable storage and restore — release 1.4.3

Student actions previously performed separate reads and full-list replacements. The storage facade updated its memory cache before persistence, swallowed both storage errors, and could reload an older database value after a successful fallback-only write. JSON restore could update the profile before finding malformed company data or encountering a later write failure.

- `persistence.ts` serializes reads and writes in each tab. Web Locks coordinate updated tabs on the same origin, including localStorage-only writes. IndexedDB mutations also read and update within one transaction across companies, profile and metadata.
- A logical revision is committed with database records. A single `track_my_company_snapshot_v2` localStorage value stores both datasets and revision atomically. The newer snapshot is recovered into the database before mutation; a newer database wins over an older mirror. Empty lists and an initial revision-zero snapshot are valid recovery states.
- Memory and change notifications advance only after a database commit or a successful fallback checkpoint. If both engines fail, the save rejects. Forms await saves, retain input on failure, and prevent duplicate submissions; existing error areas show failures. Quick actions report failed persistence rather than silently pretending it succeeded.
- BroadcastChannel notifies other tabs even when the optional localStorage mirror is denied. Storage events and focus refreshes provide additional synchronization.
- Adds, deletes, field patches, group reordering and spreadsheet merging operate on the latest records. Spreadsheet merge ordering, name/ID matching, retained fields, timestamps and placement rules preserve the previous algorithm. Profile and imported records commit together.
- JSON restore validates all supplied data before any write and commits supplied datasets atomically. Existing version-1.0 exports, profile-only/company-only backups, missing legacy timestamps and null-profile semantics remain supported. Malformed records, invalid enums, nested field types and duplicate IDs are rejected.
- Legacy migration populates empty stores without overwriting existing records; its completion marker commits with the migrated data. A failed migration is retryable.
- Tailwind scans explicit application sources, retaining the baseline utility set and document selection styles. Test and review prose cannot change generated CSS.

Validation: the original parser/statistics suites plus 18 Node regression tests and 38 Chromium browser tests pass. Added browser coverage includes concurrent DB and fallback-only writes from two tabs, recovery after document reload, DB-only cross-tab notifications, rejected company/profile saves retaining input, duplicate submissions, invalid backups and failed atomic restores. A reproduced cross-tab profile draft reset is also fixed and covered; opening the form initializes its fields, while background refreshes preserve active input. The ten before/after visual comparisons and generated application CSS remain byte-identical. `node scripts/verify-upgrade.mjs <baseline-dist>` also qualifies an actual v1.4.2 installed worker/build upgrading to v1.4.3: records survive, unrelated caches remain, and first-use export works after an offline reload. The final initial JavaScript is 396.31 kB (110.37 kB gzip), still about 53% smaller raw / 57% smaller compressed than the baseline. Browser timings and mobile emulation retain the limitations described above.

The DB name, schema version, company IDs, legacy keys and public backup format are unchanged. The new checkpoint and metadata are internal. Retaining the legacy mirrors alongside the atomic checkpoint consumes additional localStorage space; the primary DB remains usable when mirroring cannot fit. A device can still evict origin storage or exhaust both engines. Cross-tab fallback serialization requires Web Locks; without it the local queue still orders one tab, and IndexedDB transactions serialize DB-backed actions. Simultaneous edits to the same field remain last-writer-wins, and tabs running the old implementation do not participate in the new coordination. The release does not claim physical-device power-loss qualification, secure parser replacement, or resolution of every remaining review finding.

## Font provenance and update lifecycle reference

The font CSS and seven unique WOFF2 assets were fetched on 2026-10-14 from the same [Google Fonts Inter endpoint](https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap) the baseline uses. The font license is in `public/fonts/OFL.txt`, from [Google Fonts' Inter source](https://github.com/google/fonts/tree/main/ofl/inter). Font weights, unicode ranges and font-display settings are preserved.

The worker's install contract follows [MDN's waitUntil documentation](https://developer.mozilla.org/en-US/docs/Web/API/ExtendableEvent/waitUntil): rejecting the installation promise discards an incomplete worker. The existing working release stays available until a complete replacement can activate.
