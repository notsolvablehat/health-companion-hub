// src/types/case.ts

export type CaseStatus = 'open' | 'in_review' | 'approved' | 'rejected' | 'closed';

export interface Case {
  case_id: string;           // Backend uses case_id, not id
  patient_id: string;
  doctor_id?: string;
  doctor_name?: string;      // Backend now includes this
  chief_complaint: string;   // Backend uses this as the title
  status: CaseStatus;
  created_at: string;
  updated_at?: string;       // May not be in list response
  // Optional fields not in list response
  mongo_case_id?: string;
  patient_name?: string;
}

export interface CaseDetail extends Case {
  // Full SOAP structure from backend
  id: string;
  encounter_id?: string;
  hospital_id?: string | null;
  department_id?: string | null;
  case_type?: string;
  severity?: string | null;
  closed_at?: string | null;
  
  subjective?: {
    chief_complaint: string;
    history_of_present_illness?: any;
    past_medical_history?: any[];
    current_medications?: any[];
    allergies?: any[];
    family_history?: any[];
    social_history?: any;
    review_of_systems?: any;
  };
  
  objective?: {
    vital_signs?: any;
    physical_examination?: any;
    lab_results?: any[];
    imaging_results?: any[];
  };
  
  assessment?: {
    problem_list?: any[];
    differential_diagnoses?: any[];
    clinical_impression?: any;
  };
  
  plan?: {
    diagnostic_plan?: any[];
    medications?: any[];
    non_pharmaceutical_interventions?: any[];
    procedures?: any[];
    patient_education?: any;
    follow_up?: any;
    referrals?: any[];
    disposition?: any;
  };
  
  attachments?: any[];
  doctor_notes?: any[];
  amendment_history?: any[];
  approvals?: any;
  patient_consent?: any;
  audit_trail?: any[];
  ai_analysis?: any;
  language?: string;
  tags?: string[];
  total_problems?: number;
  total_labs?: number;
  total_medications?: number;
  approval_status?: string;
  ai_summary_available?: boolean;
}

export interface DoctorNote {
  note: string;
  created_at: string;
  doctor_id: string;
  doctor_name?: string;
}

// Request types
export interface CreateCaseRequest {
  symptoms: string;
  vitals?: {
    blood_pressure?: string;
    heart_rate?: number;
    temperature?: number;
    blood_sugar?: number;
    weight?: number;
    height?: number;
  };
  notes?: string;
}

export interface UpdateCaseStatusRequest {
  status: CaseStatus;
  doctor_notes?: string;
}

// Response types
export interface CaseListResponse {
  cases: Case[];
  total: number;
  // Backend doesn't return page/per_page
}
