// src/types/case.ts

export type CaseStatus = 'open' | 'in_review' | 'approved' | 'rejected' | 'closed';

export interface Case {
  id: string;
  patient_id: string;
  doctor_id?: string;
  mongo_case_id: string;
  status: CaseStatus;
  created_at: string;
  updated_at: string;
  // Joined data
  patient_name?: string;
  doctor_name?: string;
}

export interface CaseDetail extends Case {
  // From MongoDB
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
  doctor_notes?: DoctorNote[];
  diagnosis?: string;
  prescription?: string;
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
  page: number;
  per_page: number;
}
