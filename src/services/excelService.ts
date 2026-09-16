import * as XLSX from 'xlsx';
import type { Company, TierCategory, ApplicationStatus, RejectionReasonTag, PriorityLevel, OAShortlistStatus, StudentProfile, OARejectionReasonTag } from '../types';

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
    'Role / Profile': c.role || 'Software Engineer',
    'Category / Tier': c.tier || 'DREAM',
    'CTC / Package': c.ctc || 'N/A',
    'Application Status': c.status === 'applied' ? 'Applied' : c.status === 'not_applied' ? 'Not Applied' : 'Undecided',
    'OA Drive Date': c.oaDate ? c.oaDate : '',
    'OA Shortlist Status': c.oaStatus === 'not_shortlisted' ? 'Not Shortlisted' : (c.status === 'applied' ? 'Writing OA' : ''),
    'OA Rejection Reason': c.oaRejectionReasonTags?.length ? c.oaRejectionReasonTags.join(', ') : (c.oaRejectionReasonTag || ''),
    'OA Rejection Note': c.oaCustomReasonNote || '',
    'Priority': c.priority || 'Medium',
    'Rejection Reason Tag': c.rejectionReasonTags?.length ? c.rejectionReasonTags.join(', ') : (c.rejectionReasonTag || ''),
    'Rejection Custom Note': c.customReasonNote || '',
    'Google Form Link': c.formLink || '',
    'Application Deadline': c.applicationDeadline || '',
    'Form Submitted': c.formSubmitted ? 'Yes' : 'No',
    'Form Submitted Date': c.formSubmittedDate || '',
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
      { Property: 'Batch / Graduation Year', Value: profile.batch || '2026' },
      { Property: 'College / Institute', Value: profile.college || '' },
      { Property: 'Exported At', Value: new Date().toISOString() },
      { Property: 'Source Application', Value: 'TrackMyCompany (Open Source)' },
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
    'Role': c.role || '',
    'Category': c.tier || '',
    'CTC': c.ctc || '',
    'Status': c.status,
    'OA Date': c.oaDate || '',
    'OA Status': c.oaStatus === 'not_shortlisted' ? 'Not Shortlisted' : (c.status === 'applied' ? 'Writing OA' : ''),
    'OA Rejection Reason': c.oaRejectionReasonTags?.length ? c.oaRejectionReasonTags.join(', ') : (c.oaRejectionReasonTag || ''),
    'OA Rejection Note': c.oaCustomReasonNote || '',
    'Priority': c.priority || '',
    'Rejection Reason': c.rejectionReasonTags?.length ? c.rejectionReasonTags.join(', ') : (c.rejectionReasonTag || ''),
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

export const parseExcelOrCSVFile = async (file: File): Promise<ImportResult> => {
  return new Promise((resolve) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const buffer = e.target?.result;
        if (!buffer) {
          return resolve({ success: false, importedCount: 0, errors: ['File could not be read'], companies: [] });
        }

        const workbook = XLSX.read(buffer, { type: 'binary' });

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
          let pBatch = '2026';
          let pCollege = '';

          pJsonData.forEach((row) => {
            const propKey = String(row['Property'] || row['property'] || row['Key'] || row['key'] || '').toLowerCase();
            const val = String(row['Value'] || row['value'] || '').trim();

            if (propKey.includes('name')) pName = val;
            else if (propKey.includes('branch') || propKey.includes('department')) pBranch = val;
            else if (propKey.includes('batch') || propKey.includes('year')) pBatch = val;
            else if (propKey.includes('college') || propKey.includes('institute')) pCollege = val;

            // Also support direct column headers
            if (row['Student Name'] || row['name']) pName = String(row['Student Name'] || row['name']).trim();
            if (row['Branch'] || row['branch']) pBranch = String(row['Branch'] || row['branch']).trim();
            if (row['Batch'] || row['batch']) pBatch = String(row['Batch'] || row['batch']).trim();
            if (row['College'] || row['college']) pCollege = String(row['College'] || row['college']).trim();
          });

          if (pName) {
            importedProfile = {
              name: pName,
              branch: pBranch || undefined,
              batch: pBatch || '2026',
              college: pCollege || undefined,
            };
          }
        }

        // 2. Identify the companies sheet (not the profile sheet)
        let companiesSheetName = workbook.SheetNames.find(
          (name) => name.toLowerCase().includes('comp') || name.toLowerCase().includes('placement') || name.toLowerCase().includes('sheet1')
        );

        if (!companiesSheetName) {
          companiesSheetName = workbook.SheetNames.find((name) => name !== profileSheetName) || workbook.SheetNames[0];
        }

        const worksheet = workbook.Sheets[companiesSheetName];
        if (!worksheet) {
          return resolve({
            success: !!importedProfile,
            importedCount: 0,
            errors: importedProfile ? [] : ['No company data found in spreadsheet'],
            companies: [],
            profile: importedProfile,
          });
        }

        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

        if (!jsonData || jsonData.length === 0) {
          return resolve({
            success: !!importedProfile,
            importedCount: 0,
            errors: importedProfile ? [] : ['Spreadsheet company sheet is empty'],
            companies: [],
            profile: importedProfile,
          });
        }

        const importedCompanies: Company[] = [];
        const errors: string[] = [];
        const now = new Date().toISOString();

        jsonData.forEach((row, index) => {
          // Normalize keys
          const normalized: Record<string, any> = {};
          Object.keys(row).forEach((key) => {
            const cleanKey = key.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
            normalized[cleanKey] = row[key];
          });

          // Look for company name
          const companyName = 
            normalized['companyname'] || 
            normalized['company'] || 
            normalized['name'] || 
            normalized['organisation'] || 
            normalized['organization'];

          if (!companyName || typeof companyName !== 'string' || !companyName.trim()) {
            errors.push(`Row ${index + 2}: Missing company name, skipped.`);
            return;
          }

          // Parse role
          const role = normalized['role'] || normalized['profile'] || normalized['jobprofile'] || normalized['position'] || 'Software Engineer';

          // Parse CTC
          const ctc = String(normalized['ctc'] || normalized['package'] || normalized['ctcpackage'] || 'Not Disclosed');

          // Parse Tier
          let tier: TierCategory = 'DREAM';
          const rawTier = String(normalized['category'] || normalized['tier'] || normalized['categorytier'] || '').toUpperCase();
          if (rawTier.includes('OPEN') || rawTier.includes('OPENDREAM')) {
            tier = 'OPEN_DREAM';
          } else if (rawTier.includes('MASS') || rawTier.includes('REGULAR')) {
            tier = 'MASS';
          } else if (rawTier.includes('INTERN')) {
            tier = 'INTERN_ONLY';
          } else if (rawTier.includes('OFF')) {
            tier = 'OFF_CAMPUS';
          } else {
            // Auto categorize based on CTC text if number >= 12
            const matchNumber = ctc.match(/\d+(\.\d+)?/);
            if (matchNumber && parseFloat(matchNumber[0]) >= 12) {
              tier = 'OPEN_DREAM';
            }
          }

          // Parse Status
          let status: ApplicationStatus = 'undecided';
          const rawStatus = String(normalized['status'] || normalized['applicationstatus'] || '').toLowerCase();
          if (rawStatus.includes('not') || rawStatus.includes('reject') || rawStatus.includes('skip')) {
            status = 'not_applied';
          } else if (rawStatus.includes('apply') || rawStatus.includes('applied') || rawStatus.includes('yes')) {
            status = 'applied';
          }

          // Parse Rejection Reasons (single or multi-tag support)
          let rejectionReasonTag: RejectionReasonTag | undefined = undefined;
          let rejectionReasonTags: RejectionReasonTag[] | undefined = undefined;
          const rawReason = String(normalized['rejectionreason'] || normalized['rejectionreasontag'] || normalized['reason'] || '');
          if (rawReason) {
            const parts = rawReason.split(/[,;/|]+/).map((s) => s.trim()).filter(Boolean);
            const detectedTags: RejectionReasonTag[] = [];

            parts.forEach((part) => {
              const lower = part.toLowerCase();
              if (lower.includes('ctc') || lower.includes('pay') || lower.includes('salary')) {
                if (!detectedTags.includes('Low CTC')) detectedTags.push('Low CTC');
              } else if (lower.includes('bond') || lower.includes('agreement')) {
                if (!detectedTags.includes('Strict Bond / Service Agreement')) detectedTags.push('Strict Bond / Service Agreement');
              } else if (lower.includes('location')) {
                if (!detectedTags.includes('Location Not Preferred')) detectedTags.push('Location Not Preferred');
              } else if (lower.includes('cgpa') || lower.includes('criteria') || lower.includes('eligib')) {
                if (!detectedTags.includes('CGPA / Branch Ineligible')) detectedTags.push('CGPA / Branch Ineligible');
              } else if (lower.includes('role') || lower.includes('profile')) {
                if (!detectedTags.includes('Not Interested in Role')) detectedTags.push('Not Interested in Role');
              } else if (lower.includes('focus') || lower.includes('other comp')) {
                if (!detectedTags.includes('Focusing on Other Companies')) detectedTags.push('Focusing on Other Companies');
              } else if (lower.includes('pbc') || lower.includes('product based')) {
                if (!detectedTags.includes('PBC')) detectedTags.push('PBC');
              } else {
                if (!detectedTags.includes('Other')) detectedTags.push('Other');
              }
            });

            if (detectedTags.length > 0) {
              rejectionReasonTags = detectedTags;
              rejectionReasonTag = detectedTags[0];
            }
          }

          const customReasonNote = String(normalized['rejectioncustomnote'] || normalized['customreason'] || normalized['customnote'] || '');

          // OA Status (Default is shortlisted / writing OA when applied)
          let oaStatus: OAShortlistStatus = 'shortlisted';
          const rawOAStatus = String(normalized['oastatus'] || normalized['oashortliststatus'] || '').toLowerCase();
          if (rawOAStatus.includes('not') || rawOAStatus.includes('rejected')) {
            oaStatus = 'not_shortlisted';
          } else if (rawOAStatus.includes('shortlist') || rawOAStatus.includes('writing')) {
            oaStatus = 'shortlisted';
          } else if (status === 'applied') {
            oaStatus = 'shortlisted';
          }

          // OA Rejection Reasons (when not shortlisted for OA)
          let oaRejectionReasonTag: OARejectionReasonTag | undefined = undefined;
          let oaRejectionReasonTags: OARejectionReasonTag[] | undefined = undefined;
          const rawOAReason = String(normalized['oarejectionreason'] || normalized['oarejectionreasontag'] || normalized['oareason'] || '');
          if (rawOAReason) {
            const parts = rawOAReason.split(/[,;/|]+/).map((s) => s.trim()).filter(Boolean);
            const detectedOATags: OARejectionReasonTag[] = [];

            parts.forEach((part) => {
              const lower = part.toLowerCase();
              if (lower.includes('cgpa') || lower.includes('cutoff') || lower.includes('criteria')) {
                if (!detectedOATags.includes('CGPA')) detectedOATags.push('CGPA');
              } else if (lower.includes('resume') || lower.includes('cv') || lower.includes('profile')) {
                if (!detectedOATags.includes('Resume')) detectedOATags.push('Resume');
              } else if (lower.includes('random') || lower.includes('unknown') || lower.includes('luck')) {
                if (!detectedOATags.includes('Random / Unknown')) detectedOATags.push('Random / Unknown');
              } else {
                if (!detectedOATags.includes('Other')) detectedOATags.push('Other');
              }
            });

            if (detectedOATags.length > 0) {
              oaRejectionReasonTags = detectedOATags;
              oaRejectionReasonTag = detectedOATags[0];
            }
          }

          const oaCustomReasonNote = String(normalized['oarejectionnote'] || normalized['oacustomreasonnote'] || normalized['oanote'] || '');

          // OA Date
          const rawOADate = normalized['oadate'] || normalized['oadrivedate'] || normalized['drivedate'] || '';
          let oaDate = '';
          if (rawOADate) {
            try {
              const d = new Date(rawOADate);
              if (!isNaN(d.getTime())) {
                oaDate = d.toISOString().split('T')[0];
              }
            } catch (_) {}
          }

          // Priority
          let priority: PriorityLevel = 'Medium';
          const rawPriority = String(normalized['priority'] || '').toLowerCase();
          if (rawPriority.includes('high')) priority = 'High';
          if (rawPriority.includes('low')) priority = 'Low';

          const formLink = String(normalized['googleformlink'] || normalized['formlink'] || normalized['link'] || '');
          const notes = String(normalized['notes'] || normalized['note'] || '');
          const existingId = normalized['companyid'] || normalized['id'];
          const createdAt = normalized['createdat'] || now;
          const updatedAt = normalized['updatedat'] || now;

          const formSubmitted = 
            status === 'applied' || 
            String(normalized['formsubmitted']).toLowerCase() === 'yes' || 
            String(normalized['formsubmitted']).toLowerCase() === 'true';

          const formSubmittedDate = normalized['formsubmitteddate'] || (formSubmitted ? createdAt : undefined);

          importedCompanies.push({
            id: existingId ? String(existingId) : `cmp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: companyName.trim(),
            role: String(role).trim(),
            tier,
            ctc: ctc.trim(),
            status,
            rejectionReasonTag,
            rejectionReasonTags,
            customReasonNote: customReasonNote.trim() || undefined,
            formSubmitted,
            formSubmittedDate,
            priority,
            oaDate: oaDate || undefined,
            oaStatus: status === 'applied' ? oaStatus : undefined,
            oaRejectionReasonTag: status === 'applied' && oaStatus === 'not_shortlisted' ? oaRejectionReasonTag : undefined,
            oaRejectionReasonTags: status === 'applied' && oaStatus === 'not_shortlisted' ? oaRejectionReasonTags : undefined,
            oaCustomReasonNote: status === 'applied' && oaStatus === 'not_shortlisted' && oaCustomReasonNote.trim() ? oaCustomReasonNote.trim() : undefined,
            formLink: formLink.trim() || undefined,
            notes: notes.trim() || undefined,
            createdAt,
            updatedAt,
          });
        });

        return resolve({
          success: true,
          importedCount: importedCompanies.length,
          errors,
          companies: importedCompanies,
          profile: importedProfile,
        });
      } catch (err: any) {
        return resolve({
          success: false,
          importedCount: 0,
          errors: [err.message || 'Error parsing spreadsheet'],
          companies: [],
        });
      }
    };

    reader.onerror = () => {
      resolve({
        success: false,
        importedCount: 0,
        errors: ['Failed to read file'],
        companies: [],
      });
    };

    reader.readAsBinaryString(file);
  });
};
