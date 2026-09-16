export type TierCategory = 
  | 'OPEN_DREAM'   // >= 12 LPA
  | 'DREAM'        // < 12 LPA
  | 'MASS'         // Mass / Regular recruitment
  | 'INTERN_ONLY'  // Summer / 6-month internship
  | 'OFF_CAMPUS';  // Off-campus opportunities

export type ApplicationStatus = 'applied' | 'not_applied' | 'undecided';

export type RejectionReasonTag = 
  | 'Low CTC'
  | 'Strict Bond / Service Agreement'
  | 'Location Not Preferred'
  | 'Not Interested in Role'
  | 'CGPA / Branch Ineligible'
  | 'Focusing on Other Companies'
  | 'PBC'
  | 'Other';

export type OAShortlistStatus = 'pending' | 'shortlisted' | 'not_shortlisted';

export type PriorityLevel = 'High' | 'Medium' | 'Low';

export interface Company {
  id: string;
  name: string;
  role: string;
  tier: TierCategory;
  ctc: string;
  applicationDeadline?: string;
  formLink?: string;
  businessModel?: string; // e.g. FinTech, Enterprise Software, E-Commerce, EdTech
  status: ApplicationStatus;
  
  // Fields when status === 'not_applied'
  rejectionReasonTag?: RejectionReasonTag;
  rejectionReasonTags?: RejectionReasonTag[];
  customReasonNote?: string;
  
  // Fields when status === 'applied'
  formSubmitted?: boolean;
  formSubmittedDate?: string;
  priority?: PriorityLevel;
  oaDate?: string;
  oaStatus?: OAShortlistStatus;
  notes?: string;

  createdAt: string;
  updatedAt: string;
}

export interface StudentProfile {
  name: string;
  branch?: string;
  batch?: string;
  college?: string;
  targetCtc?: string;
}

export interface StatisticsData {
  totalVisited: number;
  totalApplied: number;
  totalNotApplied: number;
  totalUndecided: number;
  appliedPercentage: number;
  notAppliedPercentage: number;
  
  // OA stats
  totalOAScheduled: number;
  oaShortlistedCount: number;
  oaNotShortlistedCount: number;
  oaPendingCount: number;
  oaShortlistConversionRate: number; // Shortlisted / Applied %

  // Tier stats
  openDreamCount: number;
  dreamCount: number;
  massCount: number;
  internCount: number;
  offCampusCount: number;

  // Rejection Reason Breakdown
  rejectionReasons: {
    tag: string;
    count: number;
    percentage: number;
    customNotes: string[];
  }[];
}
