import * as XLSX from 'xlsx';
import type { Company, TierCategory, ApplicationStatus, RejectionReasonTag, OAShortlistStatus, StudentProfile, OARejectionReasonTag } from '../types';

export interface ImportResult {
  success: boolean;
  importedCount: number;
  errors: string[];
  companies: Company[];
  profile?: StudentProfile;
}

export const exportCompaniesToExcel = (
  companies: Company[], 
  profile?: StudentProfile | null, 
  filename: string = 'Campus_Placement_Tracker.xlsx'
) => {
  const rows = companies.map((c, idx) => ({
    'S.No': idx + 1,
    'Company Name': c.name,
    'Opportunity Type': c.type || c.role || 'Full Time (FTE)',
    'Role / Profile': c.role || '',
    'Category / Tier': c.tier || 'DREAM',
    'CTC / Package': c.ctc || 'N/A',
    'Application Status': c.status === 'applied' ? 'Applied' : c.status === 'not_applied' ? 'Not Applied' : 'Undecided',
    'OA Drive Date': c.oaDate ? c.oaDate : '',
    'OA Shortlist Status': c.oaStatus === 'not_shortlisted' ? 'Not Shortlisted' : (c.status === 'applied' ? 'Writing OA' : ''),
    'OA Rejection Reason': c.oaRejectionReasonTags?.join(', ') || '',
    'OA Rejection Note': c.oaCustomReasonNote || '',
    'Rejection Reason Tag': c.rejectionReasonTags?.join(', ') || '',
    'Rejection Custom Note': c.customReasonNote || '',
    'Google Form Link': c.formLink || '',
    'Application Deadline': c.applicationDeadline || '',
    'Notes': c.notes || '',
    'Company ID': c.id,
    'Created At': c.createdAt,
    'Updated At': c.updatedAt,
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths for clean readability
  worksheet['!cols'] = [
    { wch: 6 },  // S.No
    { wch: 24 }, // Company Name
    { wch: 22 }, // Role
    { wch: 16 }, // Category
    { wch: 16 }, // CTC
    { wch: 18 }, // Application Status
    { wch: 15 }, // OA Drive Date
    { wch: 20 }, // OA Shortlist Status
    { wch: 22 }, // OA Rejection Reason
    { wch: 26 }, // OA Rejection Note
    { wch: 10 }, // Priority
    { wch: 26 }, // Rejection Reason Tag
    { wch: 30 }, // Rejection Custom Note
    { wch: 35 }, // Form Link
    { wch: 18 }, // Deadline
    { wch: 14 }, // Form Submitted
    { wch: 22 }, // Form Submitted Date
    { wch: 30 }, // Notes
    { wch: 28 }, // Company ID
    { wch: 24 }, // Created At
    { wch: 24 }, // Updated At
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Placement_Companies');

  // Sheet 2: Student Profile for seamless transfer & incognito restore
  if (profile) {
    const profileRows = [
      { Property: 'Student Name', Value: profile.name || 'Student' },
      { Property: 'Branch / Department', Value: profile.branch || '' },
      { Property: 'Batch / Graduation Year', Value: profile.batch || '2027' },
      { Property: 'College / Institute', Value: profile.college || '' },
      { Property: 'Exported At', Value: new Date().toISOString() },
      { Property: 'Source Application', Value: 'TrackMyCompany (PolyForm Noncommercial 1.0.0)' },
    ];
    const profileWorksheet = XLSX.utils.json_to_sheet(profileRows);
    profileWorksheet['!cols'] = [
      { wch: 28 },
      { wch: 40 },
    ];
    XLSX.utils.book_append_sheet(workbook, profileWorksheet, 'Student_Profile');
  }

  saveWorkbookToFile(workbook, filename);
};

/**
 * Safely trigger file download in the browser with guaranteed filename and proper MIME type.
 * Prevents synchronous URL.revokeObjectURL which causes Chromium browsers to drop the filename
 * and download a generic system file named with a GUID (e.g. "a8123e6a-...").
 */
export const downloadBlobFile = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.setAttribute('download', filename);
  link.style.display = 'none';
  document.body.appendChild(link);
  
  link.click();

  // Retain the blob URL and link long enough for Chromium/Firefox/Safari's
  // download manager to register the download request and metadata.
  setTimeout(() => {
    try {
      if (document.body.contains(link)) {
        document.body.removeChild(link);
      }
      URL.revokeObjectURL(url);
    } catch {
      // Ignore any errors during deferred cleanup
    }
  }, 10000);
};

export const saveWorkbookToFile = (workbook: XLSX.WorkBook, filename: string = 'Campus_Placement_Tracker.xlsx') => {
  const safeFilename = filename.toLowerCase().endsWith('.xlsx') ? filename : `${filename}.xlsx`;
  
  // Generate ArrayBuffer representation of XLSX workbook
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  
  // Explicit Microsoft Excel OpenXML Spreadsheet MIME type
  const blob = new Blob([excelBuffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  downloadBlobFile(blob, safeFilename);
};

export const exportCompaniesToCSV = (companies: Company[], filename: string = 'Campus_Placement_Tracker.csv') => {
  const safeFilename = filename.toLowerCase().endsWith('.csv') ? filename : `${filename}.csv`;
  const rows = companies.map((c, idx) => ({
    'S.No': idx + 1,
    'Company Name': c.name,
    'Type': c.type || c.role || 'Full Time (FTE)',
    'Role': c.role || '',
    'Category': c.tier || '',
    'CTC': c.ctc || '',
    'Status': c.status,
    'OA Drive Date': c.oaDate || '',
    'OA Status': c.oaStatus === 'not_shortlisted' ? 'Not Shortlisted' : (c.status === 'applied' ? 'Writing OA' : ''),
    'OA Rejection Reason': c.oaRejectionReasonTags?.join(', ') || '',
    'OA Rejection Note': c.oaCustomReasonNote || '',
    'Rejection Reason': c.rejectionReasonTags?.join(', ') || '',
    'Custom Reason Note': c.customReasonNote || '',
    'Form Link': c.formLink || '',
    'Notes': c.notes || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  
  // UTF-8 BOM so Excel opens CSVs with proper special character encoding
  const blob = new Blob(['\uFEFF' + csvOutput], { type: 'text/csv;charset=utf-8;' });
  downloadBlobFile(blob, safeFilename);
};

export const downloadExcelTemplate = () => {
  const templateRows = [
    {
      'Company Name': 'PhonePe',
      'Role / Profile': 'Software Engineer',
      'Category / Tier': 'OPEN_DREAM',
      'CTC / Package': '33 LPA',
      'Application Status': 'Applied',
      'OA Drive Date': '2026-09-25',
      'OA Shortlist Status': 'Pending',
      'Priority': 'High',
      'Rejection Reason Tag': '',
      'Rejection Custom Note': '',
      'Google Form Link': 'https://forms.gle/sample1',
      'Notes': 'DSA focus on graphs and DP',
    },
    {
      'Company Name': 'Tata Consultancy Services',
      'Role / Profile': 'System Engineer',
      'Category / Tier': 'MASS',
      'CTC / Package': '3.6 LPA',
      'Application Status': 'Not Applied',
      'OA Drive Date': '',
      'OA Shortlist Status': '',
      'Priority': 'Low',
      'Rejection Reason Tag': 'Low CTC',
      'Rejection Custom Note': 'Targeting product companies with >= 10 LPA',
      'Google Form Link': '',
      'Notes': '',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(templateRows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Companies Template');
  saveWorkbookToFile(workbook, 'TrackMyCompany_Template.xlsx');
};

/**
 * Convert Excel numeric serial date (e.g. 45560) or date strings to ISO YYYY-MM-DD
 */
export const parseSpreadsheetDate = (val: any): string | undefined => {
  if (val === null || val === undefined || val === '') return undefined;

  // If already a Date instance
  if (val instanceof Date) {
    if (!isNaN(val.getTime())) {
      return val.toISOString().split('T')[0];
    }
    return undefined;
  }

  // If number (Excel serial date)
  // In Excel: day 1 is 1900-01-01, with leap year bug (offset 25569 for Unix epoch)
  if (typeof val === 'number' || (!isNaN(Number(val)) && Number(val) > 20000 && Number(val) < 80000)) {
    const num = Number(val);
    const date = new Date(Math.round((num - 25569) * 86400 * 1000));
    if (!isNaN(date.getTime())) {
      return date.toISOString().split('T')[0];
    }
  }

  const str = String(val).trim();
  if (!str) return undefined;

  // Check ISO format YYYY-MM-DD
  const isoMatch = str.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})/);
  if (isoMatch) {
    const year = isoMatch[1];
    const month = isoMatch[2].padStart(2, '0');
    const day = isoMatch[3].padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // Check DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = str.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})/);
  if (dmyMatch) {
    const day = dmyMatch[1].padStart(2, '0');
    const month = dmyMatch[2].padStart(2, '0');
    const year = dmyMatch[3];
    return `${year}-${month}-${day}`;
  }

  // Fallback to Date.parse
  try {
    const d = new Date(str);
    if (!isNaN(d.getTime()) && d.getFullYear() > 2000 && d.getFullYear() < 2100) {
      return d.toISOString().split('T')[0];
    }
  } catch (_) {}

  return undefined;
};

/**
 * Clean and normalize company name, removing leading numbering/bullets like "1. Google", "12) Amazon"
 */
export const cleanCompanyName = (raw: any): string => {
  if (raw === null || raw === undefined) return '';
  let str = String(raw).trim();
  // Strip leading numbers, bullets, dots, parentheses, brackets, e.g. "1. Google", "2) Amazon", "[3] Microsoft"
  str = str.replace(/^[\s\d#.)\-:*\][|]+/, '').trim();
  return str;
};

/**
 * Detect summary rows (e.g. "Total: 50", "Average CTC: 12", "Grand Total")
 */
export const isSummaryOrFooterRow = (text: string): boolean => {
  const lower = text.toLowerCase().trim();
  if (!lower) return true;
  if (
    lower.startsWith('total') || 
    lower.startsWith('grand total') || 
    lower.startsWith('average') || 
    lower.startsWith('count') || 
    lower.startsWith('sum:') ||
    lower.startsWith('notes:') || 
    lower.startsWith('legend:') || 
    lower.startsWith('instructions:')
  ) {
    return true;
  }
  return false;
};

/**
 * CTC normalization and smart Tier determination
 */
export const normalizeCTC = (raw: any): { ctc: string; tier: TierCategory } => {
  if (raw === null || raw === undefined || String(raw).trim() === '') {
    return { ctc: 'Not Disclosed', tier: 'DREAM' };
  }

  const str = String(raw).trim();
  const lower = str.toLowerCase();

  // Extract first number
  const numMatch = str.match(/\d+(\.\d+)?/);
  const num = numMatch ? parseFloat(numMatch[0]) : null;

  let formattedCtc = str;
  // If user entered just a raw number like 15 or 8.5
  if (num !== null && !lower.includes('lpa') && !lower.includes('k') && !lower.includes('₹') && !lower.includes('inr') && !lower.includes('/')) {
    if (num <= 150) {
      formattedCtc = `${num} LPA`;
    }
  }

  // Tier determination
  let tier: TierCategory = 'DREAM';
  if (lower.includes('intern') || lower.includes('stipend')) {
    tier = 'INTERN_ONLY';
  } else if (lower.includes('off') || lower.includes('off campus')) {
    tier = 'OFF_CAMPUS';
  } else if (num !== null) {
    if (num >= 12) {
      tier = 'OPEN_DREAM';
    } else if (num >= 6) {
      tier = 'DREAM';
    } else {
      tier = 'MASS';
    }
  }

  return { ctc: formattedCtc, tier };
};

const COLUMN_SYNONYMS = {
  company: [
    'companyname', 'company', 'nameofcompany', 'firm', 'firmname', 'recruiter', 
    'recruitername', 'organisation', 'organization', 'organisationname', 'organizationname', 
    'employer', 'client', 'corporate', 'name', 'companies', 'placedin', 'drivenature', 
    'drivename', 'job', 'organizationfirm', 'firmorganization', 'companytitle'
  ],
  role: [
    'role', 'jobrole', 'designation', 'profile', 'jobprofile', 'position', 
    'jobtitle', 'title', 'domain', 'workprofile', 'roleprofile', 'profiledesignation'
  ],
  type: [
    'type', 'opportunitytype', 'jobtype', 'employmenttype', 'internfte', 
    'internship', 'natureofwork', 'program', 'hiringtype', 'category', 'natureofemployment'
  ],
  ctc: [
    'ctc', 'package', 'salary', 'stipend', 'compensation', 'remuneration', 
    'pay', 'lpa', 'annualctc', 'ctcpackage', 'offer', 'basepay', 'packagectc', 
    'ctcinlpa', 'packageinlpa', 'salarylpa'
  ],
  tier: [
    'tier', 'category', 'categorytier', 'placementtier', 'tiertype'
  ],
  status: [
    'status', 'applicationstatus', 'applied', 'appliedstatus', 'decision', 
    'state', 'result', 'registrationstatus', 'appliedornot', 'appliedyesno', 'registered'
  ],
  oaDate: [
    'oadate', 'oadrivedate', 'drivedate', 'testdate', 'examdate', 'date', 
    'eventdate', 'schedule', 'scheduledate', 'interviewdate', 'drivedatetime', 
    'oaschedule', 'assessmentdate'
  ],
  oaStatus: [
    'oastatus', 'oashortliststatus', 'shortliststatus', 'shortlisted', 
    'teststatus', 'assessmentstatus', 'oaresult'
  ],
  rejectionReason: [
    'rejectionreason', 'rejectionreasontag', 'skipreason', 'reason', 
    'reasonforskipping', 'whyskipped', 'remarks', 'whynotapplied', 'skipreasons'
  ],
  customReasonNote: [
    'rejectioncustomnote', 'customreason', 'customnote', 'rejectionnote', 'whynote'
  ],
  oaRejectionReason: [
    'oarejectionreason', 'oarejectionreasontag', 'oareason', 'whynotshortlisted', 'oaremarks'
  ],
  oaCustomReasonNote: [
    'oarejectionnote', 'oacustomreasonnote', 'oanote'
  ],
  formLink: [
    'googleformlink', 'formlink', 'link', 'registrationlink', 'url', 'form'
  ],
  notes: [
    'notes', 'note', 'comments', 'description', 'details'
  ],
  id: [
    'companyid', 'id', 'cmpid'
  ]
};

export const parseExcelOrCSVFile = async (file: File): Promise<ImportResult> => {
  try {
    let buffer: ArrayBuffer;
    if (typeof file.arrayBuffer === 'function') {
      buffer = await file.arrayBuffer();
    } else if (typeof FileReader !== 'undefined') {
      buffer = await new Promise<ArrayBuffer>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target?.result as ArrayBuffer);
        reader.onerror = () => reject(new Error('Failed to read file buffer'));
        reader.readAsArrayBuffer(file);
      });
    } else {
      throw new Error('Neither file.arrayBuffer nor FileReader is supported in this environment');
    }

    if (!buffer) {
      return { success: false, importedCount: 0, errors: ['File could not be read'], companies: [] };
    }

        // Modern array buffer reading with date cell parsing
        const workbook = XLSX.read(buffer, { 
          type: 'array',
          cellDates: true,
          dense: true
        });

        if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
          return { success: false, importedCount: 0, errors: ['No sheets found in workbook'], companies: [] };
        }

        // 1. Check for Student Profile sheet
        let importedProfile: StudentProfile | undefined;
        const profileSheetName = workbook.SheetNames.find(
          (name) => name.toLowerCase().includes('profile') || name.toLowerCase().includes('student')
        );

        if (profileSheetName && workbook.Sheets[profileSheetName]) {
          const pWorksheet = workbook.Sheets[profileSheetName];
          const pJsonData = XLSX.utils.sheet_to_json<Record<string, any>>(pWorksheet, { defval: '' });

          let pName = '';
          let pBranch = '';
          let pBatch = '2027';
          let pCollege = '';

          pJsonData.forEach((row) => {
            const propKey = String(row['Property'] || row['property'] || row['Key'] || row['key'] || '').toLowerCase();
            const val = String(row['Value'] || row['value'] || '').trim();

            if (propKey.includes('name')) pName = val;
            else if (propKey.includes('branch') || propKey.includes('department')) pBranch = val;
            else if (propKey.includes('batch') || propKey.includes('year')) pBatch = val;
            else if (propKey.includes('college') || propKey.includes('institute')) pCollege = val;

            if (row['Student Name'] || row['name']) pName = String(row['Student Name'] || row['name']).trim();
            if (row['Branch'] || row['branch']) pBranch = String(row['Branch'] || row['branch']).trim();
            if (row['Batch'] || row['batch']) pBatch = String(row['Batch'] || row['batch']).trim();
            if (row['College'] || row['college']) pCollege = String(row['College'] || row['college']).trim();
          });

          if (pName) {
            importedProfile = {
              name: pName,
              branch: pBranch || undefined,
              batch: pBatch || '2027',
              college: pCollege || undefined,
            };
          }
        }

        // 2. Intelligent sheet discovery & scoring
        const candidateSheetNames = workbook.SheetNames.filter((name) => name !== profileSheetName);
        let bestSheetScore = -1;
        let bestRawRows: any[][] = [];

        for (const sheetName of (candidateSheetNames.length > 0 ? candidateSheetNames : workbook.SheetNames)) {
          const sheet = workbook.Sheets[sheetName];
          if (!sheet) continue;

          // Convert to 2D array
          const rawRows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
          if (!rawRows || rawRows.length === 0) continue;

          let score = rawRows.length;
          const lowerSheetName = sheetName.toLowerCase();
          if (lowerSheetName.includes('comp') || lowerSheetName.includes('placement') || lowerSheetName.includes('drive')) {
            score += 50;
          }

          // Sample first 10 rows for data density & keywords
          let keywordHits = 0;
          for (let r = 0; r < Math.min(10, rawRows.length); r++) {
            const rowStr = (rawRows[r] || []).join(' ').toLowerCase();
            if (rowStr.includes('company') || rowStr.includes('role') || rowStr.includes('ctc') || rowStr.includes('status')) {
              keywordHits += 10;
            }
          }
          score += keywordHits;

          if (score > bestSheetScore) {
            bestSheetScore = score;
            bestRawRows = rawRows;
          }
        }

        if (bestRawRows.length === 0) {
          return {
            success: !!importedProfile,
            importedCount: 0,
            errors: importedProfile ? [] : ['Spreadsheet company sheet is empty'],
            companies: [],
            profile: importedProfile,
          };
        }

        // 3. Dynamic Header Detection (scan first 15 rows)
        let headerRowIndex = -1;
        let highestHeaderScore = 0;

        for (let r = 0; r < Math.min(15, bestRawRows.length); r++) {
          const row = bestRawRows[r];
          if (!Array.isArray(row)) continue;

          let rowScore = 0;
          let hasCompanyKeyword = false;

          for (const cell of row) {
            const clean = String(cell || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
            if (!clean) continue;

            if (COLUMN_SYNONYMS.company.some(syn => clean === syn || clean.includes('company') || clean.includes('firm') || clean.includes('recruiter'))) {
              rowScore += 6;
              hasCompanyKeyword = true;
            } else if (COLUMN_SYNONYMS.role.some(syn => clean === syn || clean.includes('designation') || clean.includes('role'))) {
              rowScore += 3;
            } else if (COLUMN_SYNONYMS.ctc.some(syn => clean === syn || clean.includes('package') || clean.includes('salary'))) {
              rowScore += 3;
            } else if (COLUMN_SYNONYMS.status.some(syn => clean === syn || clean.includes('status'))) {
              rowScore += 3;
            } else if (COLUMN_SYNONYMS.oaDate.some(syn => clean === syn || clean.includes('date'))) {
              rowScore += 2;
            } else if (clean === 'sno' || clean === 'slno' || clean === 'serialnumber') {
              rowScore += 2;
            }
          }

          if (hasCompanyKeyword && rowScore > highestHeaderScore) {
            highestHeaderScore = rowScore;
            headerRowIndex = r;
          } else if (rowScore >= 5 && rowScore > highestHeaderScore) {
            highestHeaderScore = rowScore;
            headerRowIndex = r;
          }
        }

        // 4. Map columns or switch to Headerless Mode
        type ColField = keyof typeof COLUMN_SYNONYMS;
        const colMap: Partial<Record<ColField, number>> = {};
        let dataRows: any[][] = [];

        if (headerRowIndex >= 0) {
          // Headered mode
          const headerRow = bestRawRows[headerRowIndex];
          headerRow.forEach((cell: any, cIdx: number) => {
            const clean = String(cell || '').trim().toLowerCase().replace(/[^a-z0-9]/g, '');
            if (!clean) return;

            (Object.keys(COLUMN_SYNONYMS) as ColField[]).forEach((field) => {
              if (colMap[field] !== undefined) return; // already mapped

              const synonyms = COLUMN_SYNONYMS[field];
              if (synonyms.some((syn) => clean === syn)) {
                colMap[field] = cIdx;
              }
            });

            // Fuzzy substring match if still unmapped
            if (colMap.company === undefined && (clean.includes('company') || clean.includes('firm') || clean.includes('recruiter') || clean.includes('employer'))) {
              colMap.company = cIdx;
            } else if (colMap.role === undefined && (clean.includes('role') || clean.includes('designation') || clean.includes('profile'))) {
              colMap.role = cIdx;
            } else if (colMap.ctc === undefined && (clean.includes('ctc') || clean.includes('package') || clean.includes('salary'))) {
              colMap.ctc = cIdx;
            } else if (colMap.status === undefined && clean.includes('status')) {
              colMap.status = cIdx;
            } else if (colMap.oaDate === undefined && clean.includes('date')) {
              colMap.oaDate = cIdx;
            }
          });

          dataRows = bestRawRows.slice(headerRowIndex + 1);
        }

        // If no valid company column found or no headers detected -> Headerless Mode!
        if (colMap.company === undefined) {
          dataRows = bestRawRows;

          // Find the column index with highest text / company name density
          let maxCols = 0;
          dataRows.slice(0, 20).forEach((r) => {
            if (Array.isArray(r) && r.length > maxCols) maxCols = r.length;
          });

          let bestColIdx = 0;
          let bestColTextScore = -1;

          for (let c = 0; c < Math.max(1, maxCols); c++) {
            let textScore = 0;
            for (let r = 0; r < Math.min(25, dataRows.length); r++) {
              const cellVal = dataRows[r]?.[c];
              if (cellVal !== undefined && cellVal !== null) {
                const str = String(cellVal).trim();
                // Check if looks like a company name: string length >= 2, not pure number, not pure date
                if (str.length >= 2 && isNaN(Number(str)) && !parseSpreadsheetDate(cellVal)) {
                  textScore++;
                }
              }
            }

            if (textScore > bestColTextScore) {
              bestColTextScore = textScore;
              bestColIdx = c;
            }
          }

          colMap.company = bestColIdx;

          // Check if other columns have CTC, dates, or status
          for (let c = 0; c < Math.max(1, maxCols); c++) {
            if (c === bestColIdx) continue;
            for (let r = 0; r < Math.min(10, dataRows.length); r++) {
              const val = dataRows[r]?.[c];
              if (!val) continue;
              const str = String(val).toLowerCase().trim();

              if (colMap.ctc === undefined && (str.includes('lpa') || str.includes('₹') || (!isNaN(Number(str)) && Number(str) > 0 && Number(str) < 150))) {
                colMap.ctc = c;
              } else if (colMap.oaDate === undefined && parseSpreadsheetDate(val)) {
                colMap.oaDate = c;
              } else if (colMap.status === undefined && (str === 'applied' || str === 'not applied' || str === 'skipped' || str === 'yes' || str === 'no')) {
                colMap.status = c;
              }
            }
          }
        }

        // 5. Extract Companies (The ONLY mandatory requirement is having a list of company names)
        const importedCompanies: Company[] = [];
        const errors: string[] = [];
        const now = new Date().toISOString();

        dataRows.forEach((row, rIdx) => {
          if (!Array.isArray(row) || row.length === 0) return;

          const rawCompanyName = row[colMap.company!];
          const companyName = cleanCompanyName(rawCompanyName);

          // Validation: must have a company name, must not be summary or duplicate header
          if (!companyName) return;
          if (isSummaryOrFooterRow(companyName)) return;

          // If row repeats the header word e.g. "Company Name" in paginated tables
          const lowerName = companyName.toLowerCase();
          if (lowerName === 'company' || lowerName === 'company name' || lowerName === 'companies' || lowerName === 'firm' || lowerName === 'recruiter') {
            return;
          }

          // Extract Type
          let type: string | undefined = undefined;
          if (colMap.type !== undefined && row[colMap.type] !== undefined) {
            const rawType = String(row[colMap.type]).trim();
            if (rawType) type = rawType;
          }

          // Extract Role
          let role: string | undefined = undefined;
          if (colMap.role !== undefined && row[colMap.role] !== undefined) {
            const rawRole = String(row[colMap.role]).trim();
            if (rawRole) role = rawRole;
          }

          // Extract CTC & Tier
          const rawCTC = colMap.ctc !== undefined ? row[colMap.ctc] : undefined;
          const { ctc, tier: autoTier } = normalizeCTC(rawCTC);

          let tier: TierCategory = autoTier;
          if (colMap.tier !== undefined && row[colMap.tier] !== undefined) {
            const rawTier = String(row[colMap.tier]).toUpperCase();
            if (rawTier.includes('OPEN') || rawTier.includes('OPENDREAM')) {
              tier = 'OPEN_DREAM';
            } else if (rawTier.includes('MASS') || rawTier.includes('REGULAR')) {
              tier = 'MASS';
            } else if (rawTier.includes('INTERN')) {
              tier = 'INTERN_ONLY';
            } else if (rawTier.includes('OFF')) {
              tier = 'OFF_CAMPUS';
            } else if (rawTier.includes('DREAM')) {
              tier = 'DREAM';
            }
          }

          // Default role and type if not provided
          if (!role) {
            role = 'Software Development Engineer';
          }
          if (!type) {
            type = (ctc.toLowerCase().includes('intern') || ctc.toLowerCase().includes('stipend') || tier === 'INTERN_ONLY')
              ? 'Internship'
              : 'Full Time (FTE)';
          }

          // Extract Status
          let status: ApplicationStatus = 'applied'; // Default to applied for tracked companies
          if (colMap.status !== undefined && row[colMap.status] !== undefined) {
            const rawStatus = String(row[colMap.status]).toLowerCase().trim();
            if (rawStatus.includes('not') || rawStatus.includes('reject') || rawStatus.includes('skip') || rawStatus === 'no') {
              status = 'not_applied';
            } else if (rawStatus.includes('apply') || rawStatus.includes('applied') || rawStatus === 'yes' || rawStatus.includes('write')) {
              status = 'applied';
            } else if (rawStatus.includes('undecided') || rawStatus.includes('pending')) {
              status = 'undecided';
            }
          }

          // Rejection Reasons (multi-tag support)
          let rejectionReasonTags: RejectionReasonTag[] | undefined = undefined;
          let customReasonNote: string | undefined = undefined;

          if (colMap.rejectionReason !== undefined && row[colMap.rejectionReason] !== undefined) {
            const rawReason = String(row[colMap.rejectionReason]).trim();
            if (rawReason) {
              // If student entered reason, default to not_applied if status was unspecified
              if (colMap.status === undefined) {
                status = 'not_applied';
              }

              const parts = rawReason.split(/[,;/|]+/).map((s) => s.trim()).filter(Boolean);
              const detectedTags: RejectionReasonTag[] = [];

              parts.forEach((part) => {
                const lower = part.toLowerCase();
                if (lower.includes('branch') || lower.includes('department') || lower.includes('dept')) {
                  if (!detectedTags.includes('Branch')) detectedTags.push('Branch');
                } else if (lower.includes('cgpa') || lower.includes('cutoff') || lower.includes('grade') || lower.includes('marks')) {
                  if (!detectedTags.includes('CGPA')) detectedTags.push('CGPA');
                } else if (lower.includes('ctc') || lower.includes('pay') || lower.includes('salary') || lower.includes('package') || lower.includes('bond')) {
                  if (!detectedTags.includes('CTC')) detectedTags.push('CTC');
                } else if (lower.includes('location') || lower.includes('relocation') || lower.includes('city') || lower.includes('place')) {
                  if (!detectedTags.includes('Location')) detectedTags.push('Location');
                } else if (lower.includes('role') || lower.includes('profile') || lower.includes('tech') || lower.includes('domain')) {
                  if (!detectedTags.includes('Role')) detectedTags.push('Role');
                } else if (lower.includes('pbc') || lower.includes('product') || lower.includes('service')) {
                  if (!detectedTags.includes('PBC')) detectedTags.push('PBC');
                } else {
                  if (!detectedTags.includes('Others')) detectedTags.push('Others');
                }
              });

              if (detectedTags.length > 0) {
                rejectionReasonTags = detectedTags;
              }
            }
          }

          if (colMap.customReasonNote !== undefined && row[colMap.customReasonNote] !== undefined) {
            const noteVal = String(row[colMap.customReasonNote]).trim();
            if (noteVal) customReasonNote = noteVal;
          }

          // OA Status
          let oaStatus: OAShortlistStatus | undefined = undefined;
          if (status === 'applied') {
            oaStatus = 'shortlisted'; // Default when applied is shortlisted / writing OA
            if (colMap.oaStatus !== undefined && row[colMap.oaStatus] !== undefined) {
              const rawOAStatus = String(row[colMap.oaStatus]).toLowerCase().trim();
              if (rawOAStatus.includes('not') || rawOAStatus.includes('reject') || rawOAStatus.includes('fail')) {
                oaStatus = 'not_shortlisted';
              } else if (rawOAStatus.includes('pending') || rawOAStatus.includes('undecided')) {
                oaStatus = 'pending';
              } else if (rawOAStatus.includes('shortlist') || rawOAStatus.includes('write') || rawOAStatus.includes('cleared')) {
                oaStatus = 'shortlisted';
              }
            }
          }

          // OA Rejection Reasons (when not shortlisted for OA)
          let oaRejectionReasonTags: OARejectionReasonTag[] | undefined = undefined;
          let oaCustomReasonNote: string | undefined = undefined;

          if (status === 'applied' && oaStatus === 'not_shortlisted') {
            if (colMap.oaRejectionReason !== undefined && row[colMap.oaRejectionReason] !== undefined) {
              const rawOAReason = String(row[colMap.oaRejectionReason]).trim();
              if (rawOAReason) {
                const parts = rawOAReason.split(/[,;/|]+/).map((s) => s.trim()).filter(Boolean);
                const detectedOATags: OARejectionReasonTag[] = [];

                parts.forEach((part) => {
                  const lower = part.toLowerCase();
                  if (lower.includes('cgpa') || lower.includes('cutoff') || lower.includes('marks') || lower.includes('criteria')) {
                    if (!detectedOATags.includes('CGPA')) detectedOATags.push('CGPA');
                  } else if (lower.includes('resume') || lower.includes('cv') || lower.includes('ats')) {
                    if (!detectedOATags.includes('Resume')) detectedOATags.push('Resume');
                  } else if (lower.includes('random') || lower.includes('luck') || lower.includes('unknown') || lower.includes('slot')) {
                    if (!detectedOATags.includes('Random')) detectedOATags.push('Random');
                  } else {
                    if (!detectedOATags.includes('Others')) detectedOATags.push('Others');
                  }
                });

                if (detectedOATags.length > 0) {
                  oaRejectionReasonTags = detectedOATags;
                }
              }
            }

            if (colMap.oaCustomReasonNote !== undefined && row[colMap.oaCustomReasonNote] !== undefined) {
              const noteVal = String(row[colMap.oaCustomReasonNote]).trim();
              if (noteVal) oaCustomReasonNote = noteVal;
            }
          }

          // OA Drive Date
          let oaDate: string | undefined = undefined;
          if (colMap.oaDate !== undefined && row[colMap.oaDate] !== undefined) {
            oaDate = parseSpreadsheetDate(row[colMap.oaDate]);
          }

          // Links & Notes
          let formLink: string | undefined = undefined;
          if (colMap.formLink !== undefined && row[colMap.formLink] !== undefined) {
            const linkVal = String(row[colMap.formLink]).trim();
            if (linkVal) formLink = linkVal;
          }

          let notes: string | undefined = undefined;
          if (colMap.notes !== undefined && row[colMap.notes] !== undefined) {
            const notesVal = String(row[colMap.notes]).trim();
            if (notesVal) notes = notesVal;
          }

          // ID
          let existingId: string | undefined = undefined;
          if (colMap.id !== undefined && row[colMap.id] !== undefined) {
            const idVal = String(row[colMap.id]).trim();
            if (idVal) existingId = idVal;
          }

          importedCompanies.push({
            id: existingId || `cmp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}_${rIdx}`,
            name: companyName,
            type,
            role,
            tier,
            ctc,
            status,
            rejectionReasonTags,
            customReasonNote,
            oaDate,
            oaStatus,
            oaRejectionReasonTags,
            oaCustomReasonNote,
            formLink,
            notes,
            createdAt: now,
            updatedAt: now,
          });
        });

        if (importedCompanies.length === 0 && !importedProfile) {
          return {
            success: false,
            importedCount: 0,
            errors: ['No valid company entries found in the file. Please ensure the file contains company names.'],
            companies: [],
          };
        }

        return {
          success: true,
          importedCount: importedCompanies.length,
          errors,
          companies: importedCompanies,
          profile: importedProfile,
        };
  } catch (err: any) {
    return {
      success: false,
      importedCount: 0,
      errors: [err.message || 'Error parsing spreadsheet'],
      companies: [],
    };
  }
};

