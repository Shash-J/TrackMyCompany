import * as XLSX from 'xlsx';
import type { Company, TierCategory, ApplicationStatus, RejectionReasonTag, PriorityLevel, OAShortlistStatus } from '../types';

export interface ImportResult {
  success: boolean;
  importedCount: number;
  errors: string[];
  companies: Company[];
}

export const exportCompaniesToExcel = (companies: Company[], filename: string = 'Campus_Placement_Tracker.xlsx') => {
  const rows = companies.map((c, idx) => ({
    'S.No': idx + 1,
    'Company Name': c.name,
    'Role / Profile': c.role || 'N/A',
    'Category / Tier': c.tier || 'DREAM',
    'CTC / Package': c.ctc || 'N/A',
    'Application Status': c.status === 'applied' ? 'Applied' : c.status === 'not_applied' ? 'Not Applied' : 'Undecided',
    'OA Drive Date': c.oaDate ? new Date(c.oaDate).toLocaleDateString() : 'N/A',
    'OA Shortlist Status': c.oaStatus === 'shortlisted' ? 'Shortlisted' : c.oaStatus === 'not_shortlisted' ? 'Not Shortlisted' : c.oaStatus === 'pending' ? 'Pending' : 'N/A',
    'Priority': c.priority || 'Medium',
    'Rejection Reason Tag': c.rejectionReasonTag || 'N/A',
    'Rejection Custom Note': c.customReasonNote || '',
    'Google Form Link': c.formLink || '',
    'Application Deadline': c.applicationDeadline || '',
    'Notes': c.notes || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);

  // Set column widths for readability
  worksheet['!cols'] = [
    { wch: 6 },  // S.No
    { wch: 24 }, // Company Name
    { wch: 22 }, // Role
    { wch: 16 }, // Category
    { wch: 16 }, // CTC
    { wch: 18 }, // Application Status
    { wch: 15 }, // OA Drive Date
    { wch: 18 }, // OA Shortlist Status
    { wch: 10 }, // Priority
    { wch: 26 }, // Rejection Reason Tag
    { wch: 30 }, // Rejection Custom Note
    { wch: 35 }, // Form Link
    { wch: 18 }, // Deadline
    { wch: 30 }, // Notes
  ];

  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Placement Companies');
  XLSX.writeFile(workbook, filename);
};

export const exportCompaniesToCSV = (companies: Company[], filename: string = 'Campus_Placement_Tracker.csv') => {
  const rows = companies.map((c, idx) => ({
    'S.No': idx + 1,
    'Company Name': c.name,
    'Role': c.role || '',
    'Category': c.tier || '',
    'CTC': c.ctc || '',
    'Status': c.status,
    'OA Date': c.oaDate || '',
    'OA Status': c.oaStatus || '',
    'Priority': c.priority || '',
    'Rejection Reason': c.rejectionReasonTag || '',
    'Custom Reason Note': c.customReasonNote || '',
    'Form Link': c.formLink || '',
    'Notes': c.notes || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  
  const blob = new Blob([csvOutput], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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
  XLSX.writeFile(workbook, 'TrackMyCompany_Template.xlsx');
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
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });

        if (!jsonData || jsonData.length === 0) {
          return resolve({ success: false, importedCount: 0, errors: ['Spreadsheet is empty'], companies: [] });
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

          // Parse Rejection Reason
          let rejectionReasonTag: RejectionReasonTag | undefined = undefined;
          const rawReason = String(normalized['rejectionreason'] || normalized['rejectionreasontag'] || normalized['reason'] || '');
          if (rawReason) {
            const lowerReason = rawReason.toLowerCase();
            if (lowerReason.includes('ctc') || lowerReason.includes('pay') || lowerReason.includes('salary')) {
              rejectionReasonTag = 'Low CTC';
            } else if (lowerReason.includes('bond') || lowerReason.includes('agreement')) {
              rejectionReasonTag = 'Strict Bond / Service Agreement';
            } else if (lowerReason.includes('location')) {
              rejectionReasonTag = 'Location Not Preferred';
            } else if (lowerReason.includes('cgpa') || lowerReason.includes('criteria') || lowerReason.includes('eligib')) {
              rejectionReasonTag = 'CGPA / Branch Ineligible';
            } else if (lowerReason.includes('role') || lowerReason.includes('profile')) {
              rejectionReasonTag = 'Not Interested in Role';
            } else if (lowerReason.includes('focus') || lowerReason.includes('other')) {
              rejectionReasonTag = 'Focusing on Other Companies';
            } else {
              rejectionReasonTag = 'Other';
            }
          }

          const customReasonNote = String(normalized['rejectioncustomnote'] || normalized['customreason'] || normalized['customnote'] || '');

          // OA Status
          let oaStatus: OAShortlistStatus = 'pending';
          const rawOAStatus = String(normalized['oastatus'] || normalized['oashortliststatus'] || '').toLowerCase();
          if (rawOAStatus.includes('shortlist') && !rawOAStatus.includes('not')) {
            oaStatus = 'shortlisted';
          } else if (rawOAStatus.includes('not') || rawOAStatus.includes('rejected')) {
            oaStatus = 'not_shortlisted';
          }

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

          importedCompanies.push({
            id: `cmp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: companyName.trim(),
            role: String(role).trim(),
            tier,
            ctc: ctc.trim(),
            status,
            rejectionReasonTag,
            customReasonNote: customReasonNote.trim() || undefined,
            formSubmitted: status === 'applied',
            formSubmittedDate: status === 'applied' ? now : undefined,
            priority,
            oaDate: oaDate || undefined,
            oaStatus: status === 'applied' ? oaStatus : undefined,
            formLink: formLink.trim() || undefined,
            notes: notes.trim() || undefined,
            createdAt: now,
            updatedAt: now,
          });
        });

        return resolve({
          success: true,
          importedCount: importedCompanies.length,
          errors,
          companies: importedCompanies,
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
