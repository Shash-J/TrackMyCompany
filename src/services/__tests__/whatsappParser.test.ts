import { parseWhatsAppMessage } from '../whatsappParser';

function assert(condition: unknown, msg: string): asserts condition {
  if (!condition) {
    throw new Error(`Assertion failed: ${msg}`);
  }
}

// Test 1: Reject message without company name
const invalidMsg = 'Hey guys, please submit all documents before 5 PM today!';
const result1 = parseWhatsAppMessage(invalidMsg);
assert(result1 === null, 'Message without company name must be rejected');

// Test 2: Parse Deltek announcement correctly
const deltekMsg = `PLACEMENT DRIVE 2027

Company: Deltek
Type: Preplacement Talk/Guest Talk

Eligibility: BE in CSE, CY, CD, ISE, AIML, ECE, ETE, EIE, EEE

Drive Date: 25th September

Registration: https://forms.gle/AaVcKaxyo7NsEfTN7

Fill in correct credentials only, don't round off CGPA.
NPTEL Backlog is a backlog

DEADLINE: 5.00 PM, 17/09/2026 (Tomorrow)`;

const result2 = parseWhatsAppMessage(deltekMsg);
assert(result2 !== null, 'Deltek should be parsed');
assert(result2.name === 'Deltek', 'Name should be Deltek');
assert(result2.role === 'Pre-Placement Session', 'Role should be Pre-Placement Session');
assert(result2.tier === 'DREAM', 'Tier should be DREAM');

// Test 3: Parse SentinelOne announcement correctly with stipend and role
const sentinelMsg = `PLACEMENT DRIVE 2027

Company: SentinelOne 
Type: OPEN DREAM, intern + PBC(FTE)

Conversion to FTE depends on Performance based and business requirement.

Eligibility: BE in CSE, CY, CD, ISE, AIML, ECE, Requesting to Consider ETE, EIE, EEE

Stipend: Software Engineer Intern (Backend / Frontend / QA): 45K per month
Technical Support Intern: 35K per month
JD: Software Engineer Intern, Technical Support Intern
Location: Bangalore

Drive Date: 23rd September
Mode of Process: Offline mode, at RVCE Campus

CGPA Criteria: CGPA 7 and above, No active backlogs are allowed.

Registration: https://forms.gle/PwTW7FCEpw423fj87

DEADLINE: 5.00 PM, 16/09/2026 (Today)`;

const result3 = parseWhatsAppMessage(sentinelMsg);
assert(result3 !== null, 'SentinelOne should be parsed');
assert(result3.name === 'SentinelOne', 'Name should be SentinelOne');
assert(result3.role === 'Software Engineer Intern, Technical Support Intern', 'Role should match JD');
assert(result3.tier === 'OPEN_DREAM', 'Tier should be OPEN_DREAM');

// Test 4: Parse Samsung RI
const samsungMsg = `*Company:* Samsung RI
*Type:*  Open Dream, Internship+ PBC 
*CTC:* 26.8 LPA (PBC) 
 *Eligibility:* BE In CSE, ISE, AIML,DS, ECE, EEE, ETE (requesting for ETE)
 *Stipend:* 75k  PM Location: Bengaluru 
*CGPA Criteria*:  7.5 CGPA and above, No active backlogs are allowed. 
*Role:* Developer Intern

*Registration:* https://docs.google.com/forms/d/e/sample/viewform`;

const result4 = parseWhatsAppMessage(samsungMsg);
assert(result4 !== null, 'Samsung RI should be parsed');
assert(result4.name === 'Samsung RI', 'Name should be Samsung RI');
assert(result4.role === 'Developer Intern', 'Role should be Developer Intern');
assert(result4.tier === 'OPEN_DREAM', 'Tier should be OPEN_DREAM');
assert(result4.ctc.includes('26.8 LPA'), 'CTC should include 26.8 LPA');
assert(result4.ctc.includes('75k  PM'), 'CTC should include 75k PM');

console.log('✓ All whatsappParser unit tests passed successfully!');
