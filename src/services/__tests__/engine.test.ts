import { parseWhatsAppMessage } from '../whatsappParser';
import { parseSpreadsheetDate } from '../excelService';
import { calculateStatistics, normalizeRejectionTag, normalizeOARejectionTag } from '../storage';
import type { Company } from '../../types';

function assert(condition: unknown, msg: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

console.log('🧪 Starting Principal Engineer Comprehensive Reliability Tests...');

// ==========================================
// TEST SUITE 1: WhatsApp Parser RVCE Drives
// ==========================================
console.log('\n--- 1. Testing WhatsApp Parser Edge Cases ---');

// Test 1.1: Standard RVCE announcement with colon
const rvceMsg1 = `PLACEMENT DRIVE 2027
Company: Cisco Systems
Type: OPEN DREAM, 6 Months Internship + FTE
CTC: 24.5 LPA
Stipend: 95,000 PM
Eligibility: CSE, ISE, AIML, ECE, EEE
Drive Date: 28th October 2026
Registration: https://forms.gle/ciscoTest123
DEADLINE: 5:00 PM, 20/10/2026`;

const r1 = parseWhatsAppMessage(rvceMsg1);
assert(r1 !== null, 'Cisco message should parse');
assert(r1.name === 'Cisco Systems', 'Name should be Cisco Systems');
assert(r1.tier === 'OPEN_DREAM', 'Tier should be OPEN_DREAM');
assert(r1.oaDate === '2026-10-28', 'OA Date should be 2026-10-28');
assert(r1.ctc.includes('24.5 LPA'), 'CTC should include 24.5 LPA');
assert(r1.ctc.includes('95,000 PM'), 'Stipend should be included in CTC');
assert(r1.formLink === 'https://forms.gle/ciscoTest123', 'Form link should match');
console.log('✓ Cisco announcement parsed accurately');

// Test 1.2: Message with dash and asterisk formatting
const rvceMsg2 = `*Placement Notification - 2027 Batch*
*Company* - Texas Instruments
*Type* - Dream, FTE + Internship
*Package* - 18.0 LPA
*Drive Date* - 15/11/2026
*Registration* - https://docs.google.com/forms/d/e/sampleTI/viewform`;

const r2 = parseWhatsAppMessage(rvceMsg2);
assert(r2 !== null, 'Texas Instruments should parse');
assert(r2.name === 'Texas Instruments', 'Name should be Texas Instruments');
assert(r2.tier === 'OPEN_DREAM' || r2.tier === 'DREAM', 'Tier should be valid');
assert(r2.oaDate === '2026-11-15', 'OA Date should be 2026-11-15');
console.log('✓ Texas Instruments parsed accurately');

// Test 1.3: Message without company should safely return null
const junkMsg = 'Hey batch of 2027, please submit your resumes by evening.';
const r3 = parseWhatsAppMessage(junkMsg);
assert(r3 === null, 'Junk text without company name must return null');
console.log('✓ Non-announcement rejected cleanly');

// ==========================================
// TEST SUITE 2: Excel & Spreadsheet Date Parser
// ==========================================
console.log('\n--- 2. Testing Date Serial & String Parsing ---');

// Test 2.1: Excel numeric serial dates (e.g. 45560 = 2024-09-25)
const parsedSerial = parseSpreadsheetDate(45560);
assert(typeof parsedSerial === 'string' && parsedSerial.startsWith('2024'), `Serial date 45560 should resolve to 2024 date, got: ${parsedSerial}`);

// Test 2.2: Standard YYYY-MM-DD
assert(parseSpreadsheetDate('2026-09-25') === '2026-09-25', 'ISO date preserved');

// Test 2.3: DD/MM/YYYY
assert(parseSpreadsheetDate('25/09/2026') === '2026-09-25', 'DD/MM/YYYY converted to ISO');

// Test 2.4: DD-MM-YYYY
assert(parseSpreadsheetDate('25-09-2026') === '2026-09-25', 'DD-MM-YYYY converted to ISO');

// Test 2.5: Empty / invalid values
assert(parseSpreadsheetDate(null) === undefined, 'null returns undefined');
assert(parseSpreadsheetDate('') === undefined, 'empty string returns undefined');
assert(parseSpreadsheetDate('invalid-date') === undefined, 'invalid string returns undefined');
console.log('✓ All spreadsheet date parser edge cases verified');

// ==========================================
// TEST SUITE 3: Tag Normalization
// ==========================================
console.log('\n--- 3. Testing Tag Normalization ---');
assert(normalizeRejectionTag('Eligible branch not allowed') === 'Branch', 'Branch mapped');
assert(normalizeRejectionTag('CGPA cutoff is 8.0') === 'CGPA', 'CGPA mapped');
assert(normalizeRejectionTag('Low package / compensation') === 'CTC', 'CTC mapped');
assert(normalizeRejectionTag('Work location in Gurgaon') === 'Location', 'Location mapped');
assert(normalizeRejectionTag('Tech support profile') === 'Role', 'Role mapped');
assert(normalizeRejectionTag('Product based company only') === 'PBC', 'PBC mapped');
assert(normalizeRejectionTag('Family reasons') === 'Others', 'Others mapped');

assert(normalizeOARejectionTag('Low cgpa in round 1') === 'CGPA', 'OA CGPA mapped');
assert(normalizeOARejectionTag('ATS score was low') === 'Resume', 'OA Resume mapped');
assert(normalizeOARejectionTag('Unknown luck / slotting') === 'Random', 'OA Random mapped');
assert(normalizeOARejectionTag('Internal interview review') === 'Others', 'OA Others mapped');
console.log('✓ Tag normalization verified');

// ==========================================
// TEST SUITE 4: Placement Statistics Engine
// ==========================================
console.log('\n--- 4. Testing Placement Statistics Engine ---');

const mockCompanies: Company[] = [
  {
    id: 'c1',
    name: 'PhonePe',
    status: 'applied',
    oaStatus: 'shortlisted',
    oaCleared: true,
    tier: 'OPEN_DREAM',
    ctc: '33 LPA',
    createdAt: '2026-09-01T00:00:00Z',
    updatedAt: '2026-09-01T00:00:00Z',
  },
  {
    id: 'c2',
    name: 'Cisco',
    status: 'applied',
    oaStatus: 'shortlisted',
    oaCleared: false,
    tier: 'OPEN_DREAM',
    ctc: '24 LPA',
    createdAt: '2026-09-02T00:00:00Z',
    updatedAt: '2026-09-02T00:00:00Z',
  },
  {
    id: 'c3',
    name: 'Oracle',
    status: 'applied',
    oaStatus: 'not_shortlisted',
    oaRejectionReasonTags: ['CGPA'],
    tier: 'DREAM',
    ctc: '18 LPA',
    createdAt: '2026-09-03T00:00:00Z',
    updatedAt: '2026-09-03T00:00:00Z',
  },
  {
    id: 'c4',
    name: 'TCS',
    status: 'not_applied',
    rejectionReasonTags: ['CTC'],
    tier: 'MASS',
    ctc: '3.6 LPA',
    createdAt: '2026-09-04T00:00:00Z',
    updatedAt: '2026-09-04T00:00:00Z',
  },
];

const stats = calculateStatistics(mockCompanies);
assert(stats.totalVisited === 4, 'Total visited should be 4');
assert(stats.totalApplied === 3, 'Total applied should be 3');
assert(stats.totalNotApplied === 1, 'Total skipped should be 1');
assert(stats.appliedPercentage === 75, 'Applied percentage should be 75%');
assert(stats.notAppliedPercentage === 25, 'Skipped percentage should be 25%');

// OA Stats
assert(stats.oaShortlistedCount === 2, 'Shortlisted for OA should be 2 (PhonePe, Cisco)');
assert(stats.oaNotShortlistedCount === 1, 'Not shortlisted should be 1 (Oracle)');
assert(stats.oaClearedCount === 1, 'OA cleared should be 1 (PhonePe)');
assert(stats.oaNotClearedCount === 1, 'OA not cleared should be 1 (Cisco)');
assert(stats.oaClearRate === 50, 'OA clear rate should be 50% (1 cleared out of 2 decided)');

console.log('✓ Statistics engine computed accurate placement KPIs');

// Test 4.2: Empty company dataset (Zero Division Safety)
const emptyStats = calculateStatistics([]);
assert(emptyStats.totalVisited === 0, 'Zero total visited');
assert(emptyStats.appliedPercentage === 0, 'Zero applied percentage');
assert(emptyStats.oaClearRate === 0, 'Zero OA clear rate without NaN');
assert(emptyStats.oaShortlistConversionRate === 0, 'Zero shortlist rate without NaN');
console.log('✓ Statistics engine is 100% resilient to empty dataset (no NaN / division by zero)');

console.log('\n======================================================');
console.log('🎉 ALL ENGINE RELIABILITY UNIT TESTS PASSED (100%)');
console.log('======================================================\n');
