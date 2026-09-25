import * as XLSX from 'xlsx';
import { parseExcelOrCSVFile } from '../excelService';

function assert(condition: unknown, msg: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

console.log('🧪 Starting Excel Service Robustness & Edge-Case Tests...');

// Test 1: Full Workbook Roundtrip
const mockRows = [
  {
    'Company Name': 'PhonePe',
    'Opportunity Type': 'Full Time (FTE)',
    'Role / Profile': 'Backend Engineer',
    'Category / Tier': 'OPEN_DREAM',
    'CTC / Package': '33 LPA',
    'Application Status': 'Applied',
    'OA Drive Date': '2026-10-15',
    'OA Shortlist Status': 'Writing OA',
    'OA Cleared': 'Cleared',
    'Notes': 'Test roundtrip notes',
  },
  {
    'Company Name': 'Infosys',
    'Opportunity Type': 'Full Time (FTE)',
    'Role / Profile': 'System Engineer Specialist',
    'Category / Tier': 'MASS',
    'CTC / Package': '9.5 LPA',
    'Application Status': 'Not Applied',
    'Rejection Reason Tag': 'CTC',
    'Rejection Custom Note': 'Targeting product companies',
  },
  {
    'Company Name': 'Morgan Stanley',
    'Opportunity Type': 'Full Time (FTE)',
    'Role / Profile': 'Technology Analyst',
    'Category / Tier': 'DREAM',
    'CTC / Package': '25.5 LPA',
    'Application Status': 'Applied',
    'OA Shortlist Status': 'Not Shortlisted',
    'OA Rejection Reason': 'CGPA',
    'OA Rejection Note': 'Cutoff was 8.75',
  },
  {
    'Company Name': 'Walmart Global Tech',
    'Opportunity Type': 'Full Time (FTE)',
    'Role / Profile': 'Software Engineer',
    'Category / Tier': 'OPEN_DREAM',
    'CTC / Package': '27 LPA',
    'Application Status': 'Applied',
    'OA Shortlist Status': 'Writing OA',
    'OA Cleared': 'Not Cleared',
  }
];

const wb = XLSX.utils.book_new();
const ws = XLSX.utils.json_to_sheet(mockRows);
XLSX.utils.book_append_sheet(wb, ws, 'Companies');

// Generate binary array buffer
const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
const mockFile = new File([buffer], 'test_placement.xlsx', {
  type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
});

// Run parser
parseExcelOrCSVFile(mockFile).then((result) => {
  assert(result.success, 'Parsing should succeed');
  assert(result.companies.length === 4, `Expected 4 companies, got ${result.companies.length}`);

  const phonepe = result.companies.find((c) => c.name === 'PhonePe');
  assert(phonepe !== undefined, 'PhonePe should exist');
  assert(phonepe.status === 'applied', 'PhonePe status should be applied');
  assert(phonepe.oaCleared === true, 'PhonePe OA should be Cleared (true)');
  assert(phonepe.oaDate === '2026-10-15', 'PhonePe OA date should be 2026-10-15');

  const infosys = result.companies.find((c) => c.name === 'Infosys');
  assert(infosys !== undefined, 'Infosys should exist');
  assert(infosys.status === 'not_applied', 'Infosys status should be not_applied');
  assert(infosys.rejectionReasonTags?.includes('CTC'), 'Infosys rejection tag should include CTC');

  const ms = result.companies.find((c) => c.name === 'Morgan Stanley');
  assert(ms !== undefined, 'Morgan Stanley should exist');
  assert(ms.oaStatus === 'not_shortlisted', 'Morgan Stanley oaStatus should be not_shortlisted');
  assert(ms.oaRejectionReasonTags?.includes('CGPA'), 'MS OA rejection should include CGPA');
  assert(ms.oaCustomReasonNote === 'Cutoff was 8.75', 'MS OA custom note should match');

  const walmart = result.companies.find((c) => c.name === 'Walmart Global Tech');
  assert(walmart !== undefined, 'Walmart should exist');
  assert(walmart.oaCleared === false, 'Walmart OA should be Not Cleared (false)');

  console.log('✓ Excel roundtrip with 3-tier OA states verified successfully!');

  // Test 2: Empty Sheet Resilience
  const emptyWb = XLSX.utils.book_new();
  const emptyWs = XLSX.utils.json_to_sheet([]);
  XLSX.utils.book_append_sheet(emptyWb, emptyWs, 'Empty');
  const emptyBuf = XLSX.write(emptyWb, { bookType: 'xlsx', type: 'array' });
  const emptyFile = new File([emptyBuf], 'empty.xlsx');

  return parseExcelOrCSVFile(emptyFile);
}).then((emptyRes) => {
  assert(!emptyRes.success || emptyRes.companies.length === 0, 'Empty sheet handled gracefully without throwing unhandled error');
  console.log('✓ Empty Excel file handled gracefully without throwing exceptions');

  console.log('\n======================================================');
  console.log('🎉 ALL EXCEL SERVICE UNIT TESTS PASSED (100%)');
  console.log('======================================================\n');
}).catch((err) => {
  console.error('❌ Excel test failed:', err);
  throw err;
});
