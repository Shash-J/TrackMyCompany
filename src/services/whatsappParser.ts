import type { TierCategory } from '../types';

export interface ParsedWhatsAppAnnouncement {
  name: string;
  role: string;
  tier: TierCategory;
  ctc: string;
  oaDate?: string;
  formLink?: string;
  applicationDeadline?: string;
  notes?: string;
}

/**
 * Parses raw WhatsApp placement announcements copied from college placement groups.
 * MANDATORY REQUIREMENT: Must contain a recognizable company name.
 * If company name is not found, returns null.
 */
export function parseWhatsAppMessage(rawText: string): ParsedWhatsAppAnnouncement | null {
  if (!rawText || !rawText.trim()) return null;

  const text = rawText.trim();

  // Helper to extract line value following a pattern
  const extractField = (pattern: RegExp): string | null => {
    const match = text.match(pattern);
    if (!match || !match[1]) return null;
    return match[1].replace(/[\*_]/g, '').trim();
  };

  // 1. EXTRACT COMPANY NAME (Mandatory)
  let companyName = '';
  const companyPatterns = [
    /(?:^|\n)\s*[\*_]*\s*Company(?:\s*Name)?\s*[\*_]*\s*[:\-]\s*([^\r\n]+)/i,
    /(?:^|\n)\s*[\*_]*\s*Organisation\s*[\*_]*\s*[:\-]\s*([^\r\n]+)/i,
  ];

  for (const pat of companyPatterns) {
    const val = extractField(pat);
    if (val && !val.toLowerCase().includes('drive') && val.length > 1) {
      companyName = val;
      break;
    }
  }

  // Fallback: Check line by line
  if (!companyName) {
    const lines = text.split('\n');
    for (const line of lines) {
      const m = line.match(/^[\*_\s]*Company[\*_\s]*[:\-]\s*([^\r\n]+)/i);
      if (m && m[1]) {
        companyName = m[1].replace(/[\*_]/g, '').trim();
        break;
      }
    }
  }

  // If no company name is found, reject the message
  if (!companyName) {
    return null;
  }

  // Clean company name: remove trailing notes like (female only hackathon) or (HackWithInfy) or - Bangalore
  let cleanName = companyName;
  let extraCompanyNote = '';
  const parenMatch = cleanName.match(/^([^\(\)]+)\s*\((.+)\)$/);
  if (parenMatch) {
    cleanName = parenMatch[1].trim();
    extraCompanyNote = parenMatch[2].trim();
  }

  // 2. EXTRACT ROLE / JOB PROFILE
  let role = '';
  const rolePatterns = [
    /(?:^|\n)\s*[\*_]*\s*(?:Job\s*Role|Role|Job\s*Profile|Position)\s*[\*_]*\s*[:\-]\s*([^\r\n]+)/i,
    /(?:^|\n)\s*[\*_]*\s*(?:Job\s*Description|JD)\s*[\*_]*\s*[:\-]\s*([^\r\n]+)/i,
    /(?:^|\n)\s*[\*_]*\s*Roles?\s*Offered\s*[\*_]*\s*[:\-]\s*([^\r\n]+)/i,
  ];

  for (const pat of rolePatterns) {
    const val = extractField(pat);
    if (val && !['attached', 'attached below', 'read the jd attached', 'na', 'tbd', 'will be shared soon', 'will be told in ppt'].includes(val.toLowerCase())) {
      role = val;
      break;
    }
  }

  // Check if role is in Stipend line, e.g. "Stipend: Software Engineer Intern (Backend / Frontend / QA): 45K per month"
  if (!role) {
    const stipendRoleMatch = text.match(/(?:Stipend|Role)\s*:\s*([^:\r\n]+Intern[^\r\n]*)/i);
    if (stipendRoleMatch && stipendRoleMatch[1]) {
      role = stipendRoleMatch[1].replace(/[\*_]/g, '').trim();
    }
  }

  if (!role) {
    if (/hackathon/i.test(text)) {
      role = 'Hackathon / Challenge';
    } else if (/preplacement talk|guest talk|pre placement connect/i.test(text)) {
      role = 'Pre-Placement Session';
    } else {
      role = 'Software Engineer';
    }
  }

  // 3. EXTRACT CTC / STIPEND
  let ctc = '';
  let stipend = '';

  // Extract CTC / Package (handle multi-line package tables like Infosys if label is empty)
  const ctcMatch = text.match(/(?:^|\n)\s*[\*_]*\s*(?:CTC|Package|PACKAGE)\s*[\*_]*\s*[:\-]\s*([^\r\n]*)/i);
  if (ctcMatch) {
    let ctcVal = ctcMatch[1].replace(/[\*_]/g, '').trim();
    if (!ctcVal) {
      // Look at subsequent non-empty line
      const afterMatch = text.slice(ctcMatch.index! + ctcMatch[0].length);
      const nextLine = afterMatch.split('\n').map(l => l.trim()).find(l => l.length > 0 && !l.startsWith('*'));
      if (nextLine) {
        ctcVal = nextLine.replace(/[\*_]/g, '').trim();
      }
    }
    if (ctcVal && !['tbd', 'na'].includes(ctcVal.toLowerCase())) {
      ctc = ctcVal;
    }
  }

  // Extract Stipend
  const stipendMatch = text.match(/(?:^|\n)\s*[\*_]*\s*Stipend\s*[\*_]*\s*[:\-]\s*([^\r\n]+)/i);
  if (stipendMatch) {
    let stipendVal = stipendMatch[1].replace(/[\*_]/g, '').trim();
    // If inline "Location:" is present in the stipend string, cut it off
    const locSplit = stipendVal.split(/Location\s*:/i);
    if (locSplit.length > 1) {
      stipendVal = locSplit[0].trim();
    }
    if (stipendVal && !['tbd', 'na'].includes(stipendVal.toLowerCase())) {
      stipend = stipendVal;
    }
  }

  let finalCtc = '';
  if (ctc && stipend) {
    if (ctc.toLowerCase().includes('stipend')) {
      finalCtc = ctc;
    } else {
      finalCtc = `${ctc} (Stipend: ${stipend})`;
    }
  } else if (ctc) {
    finalCtc = ctc;
  } else if (stipend) {
    finalCtc = `Stipend: ${stipend}`;
  } else {
    finalCtc = 'Not Disclosed';
  }

  // 4. EXTRACT TIER / CATEGORY
  let tier: TierCategory = 'DREAM';
  const typeVal = extractField(/(?:^|\n)\s*[\*_]*\s*Type\s*[\*_]*\s*[:\-]\s*([^\r\n]+)/i);
  const typeStr = (typeVal || '').toLowerCase();

  if (typeStr.includes('open dream') || typeStr.includes('opendream')) {
    tier = 'OPEN_DREAM';
  } else if (typeStr.includes('dream') && !typeStr.includes('open dream')) {
    tier = 'DREAM';
  } else if (typeStr.includes('mass') || typeStr.includes('regular')) {
    tier = 'MASS';
  } else if (typeStr.includes('internship only') || typeStr.includes('summer internship')) {
    tier = 'INTERN_ONLY';
  } else {
    // Infer from CTC
    const ctcNumMatch = finalCtc.match(/(\d+(?:\.\d+)?)\s*(?:lpa|lakh|lac)/i);
    if (ctcNumMatch && parseFloat(ctcNumMatch[1]) >= 12) {
      tier = 'OPEN_DREAM';
    } else if (ctcNumMatch && parseFloat(ctcNumMatch[1]) >= 5) {
      tier = 'DREAM';
    } else if (/open dream/i.test(text)) {
      tier = 'OPEN_DREAM';
    } else if (/1\s*lakh|1\.25\s*lakh|75k|65k|90k/i.test(finalCtc)) {
      tier = 'OPEN_DREAM';
    }
  }

  // 5. EXTRACT DRIVE DATE / OA DATE
  let oaDate: string | undefined = undefined;
  const driveDateVal = extractField(/(?:^|\n)\s*[\*_]*\s*Drive\s*Dates?\s*[\*_]*\s*[:\-]\s*([^\r\n]+)/i);
  if (driveDateVal && !['tbd', 'na', 'tba', 'will confirm'].includes(driveDateVal.toLowerCase())) {
    oaDate = parseDateToISO(driveDateVal, text);
  }

  // 6. EXTRACT REGISTRATION LINK
  let formLink: string | undefined = undefined;
  const linkMatches = text.match(/https?:\/\/[^\s\*\)\>]+/g);
  if (linkMatches && linkMatches.length > 0) {
    const gForm = linkMatches.find(url => url.includes('forms.gle') || url.includes('docs.google.com/forms'));
    formLink = gForm || linkMatches[0];
  }

  // 7. EXTRACT DEADLINE
  const deadline = extractField(/(?:^|\n)\s*[\*_]*\s*DEADLINE\s*[\*_]*\s*[:\-]\s*([^\r\n]+)/i);

  // 8. COMPOSE NOTES
  const notesParts: string[] = [];

  const elig = extractField(/(?:^|\n)\s*[\*_]*\s*Eligibility\s*[\*_]*\s*[:\-]\s*([^\r\n]+)/i);
  if (elig) notesParts.push(`Eligibility: ${elig}`);

  const cgpa = extractField(/(?:^|\n)\s*[\*_]*\s*CGPA\s*Criteria\s*[\*_]*\s*[:\-]\s*([^\r\n]+)/i);
  if (cgpa) notesParts.push(`CGPA: ${cgpa}`);

  const loc = extractField(/(?:^|\n)\s*[\*_]*\s*Location\s*[\*_]*\s*[:\-]\s*([^\r\n]+)/i);
  if (loc && !['not specified', 'na', 'tbd'].includes(loc.toLowerCase())) {
    notesParts.push(`Location: ${loc}`);
  }

  if (deadline) notesParts.push(`Deadline: ${deadline}`);
  if (extraCompanyNote) notesParts.push(`Note: ${extraCompanyNote}`);

  return {
    name: cleanName,
    role: role || 'Software Engineer',
    tier,
    ctc: finalCtc,
    oaDate,
    formLink,
    applicationDeadline: deadline || undefined,
    notes: notesParts.length > 0 ? notesParts.join('\n') : undefined,
  };
}

/**
 * Converts various placement drive date strings into YYYY-MM-DD ISO format.
 */
function parseDateToISO(dateStr: string, fullText: string): string | undefined {
  if (!dateStr) return undefined;
  const s = dateStr.replace(/[\*_]/g, '').trim();

  // 1. Slash format: DD/MM/YY or DD/MM/YYYY e.g. "1/12/25" or "10/08/2026"
  const slashMatch = s.match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
  if (slashMatch) {
    const day = parseInt(slashMatch[1], 10);
    const month = parseInt(slashMatch[2], 10) - 1;
    let year = parseInt(slashMatch[3], 10);
    if (year < 100) year += 2000;
    const d = new Date(year, month, day);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }

  // 2. Day + Month name e.g. "25th September", "12th Aug", "30th June, 2026"
  const textMatch = s.match(/(\d{1,2})(?:st|nd|rd|th)?\s+(?:of\s+)?([A-Za-z]+)(?:\s*,?\s*(\d{4}))?/i);
  if (textMatch) {
    const day = parseInt(textMatch[1], 10);
    const monthStr = textMatch[2].toLowerCase();
    const months: Record<string, number> = {
      jan: 0, january: 0,
      feb: 1, february: 1,
      mar: 2, march: 2,
      apr: 3, april: 3,
      may: 4,
      jun: 5, june: 5,
      jul: 6, july: 6,
      aug: 7, august: 7,
      sep: 8, sept: 8, september: 8,
      oct: 9, october: 9,
      nov: 10, november: 10,
      dec: 11, december: 11,
    };
    const prefix = monthStr.substring(0, 3);
    if (months[prefix] !== undefined) {
      let year = textMatch[3] ? parseInt(textMatch[3], 10) : null;
      if (!year) {
        const textYearMatch = fullText.match(/\b(202[4-9])\b/);
        year = textYearMatch ? parseInt(textYearMatch[1], 10) : new Date().getFullYear();
      }
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${year}-${pad(months[prefix] + 1)}-${pad(day)}`;
    }
  }

  return undefined;
}
