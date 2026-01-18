export type CaseStatus = 'open' | 'under_review' | 'approved_by_doctor' | 'closed';
export type CaseType = 'initial' | 'follow_up' | 'urgent' | 'emergency';
export type SeverityLevel = 'critical' | 'high' | 'moderate' | 'low';

// SOAP Sections
export interface Allergy {
  allergen_type: string;
  allergen_name: string;
  reaction_type: string;
  severity: string;
  reaction_date?: string;
}

export interface SubjectiveSection {
  chief_complaint: string;
  history_of_present_illness?: string;
  past_medical_history?: string[];
  current_medications?: string[]; // TODO: might be objects too, but error only flagged allergies
  allergies?: Allergy[];
  family_history?: string[]; 
  social_history?: string;
  review_of_systems?: Record<string, any>;
}

export interface ObjectiveSection {
  vital_signs?: {
    blood_pressure?: string;
    heart_rate?: number;
    temperature?: number;
    respiratory_rate?: number;
    oxygen_saturation?: number;
    weight?: number;
    height?: number;
    bmi?: number;
  };
  physical_examination?: Record<string, string>;
  lab_results?: Array<{
    test_name: string;
    value: string;
    unit: string;
    reference_range?: string;
    date?: string;
  }>;
  imaging_results?: Array<{
    modality: string;
    body_part: string;
    impression: string;
    image_url?: string;
  }>;
}

export interface ClinicalImpression {
  summary?: string;
  complexity_level?: string;
  diagnostic_certainty?: string;
  main_concerns?: string[];
  key_findings?: string[];
}

export interface AssessmentSection {
  problem_list?: Array<{
    diagnosis: string;
    code?: string; // ICD-10 or SNOMED
    status?: 'active' | 'resolved';
  }>;
  differential_diagnoses?: string[];
  clinical_impression?: string | ClinicalImpression;
}

export interface PatientEducation {
  topics?: string[];
  education_provided?: string;
  patient_understanding?: string;
  education_materials?: string[];
}

export interface PlanSection {
  diagnostic_plan?: string[];
  medications?: Array<{
    drug_name: string;
    dosage: string;
    frequency: string;
    duration?: string;
    instructions?: string;
  }>;
  non_pharmaceutical_interventions?: string[];
  procedures?: string[];
  patient_education?: string | PatientEducation;
  follow_up?: {
    date?: string;
    instructions?: string;
    type?: string;
  };
  referrals?: string[];
  disposition?: string;
}

export interface DoctorNote {
  note_id: string;
  created_at: string;
  created_by: string; // doctor_id
  content: string;
  note_type: 'progress' | 'amendment' | 'clarification' | 'follow_up_observation';
  visibility: 'doctor_only' | 'patient_visible' | 'shared';
  linked_to_case_section?: string;
}

export interface AuditLog {
  action: string;
  timestamp: string;
  performed_by: string;
  details?: Record<string, any>;
}

export interface ApprovalData {
  approved: boolean;
  approved_by: string;
  approval_date: string;
  approval_notes?: string;
}

// Core Case Model
export interface Case {
  // Relational Fields
  id: string; // UUID from internal DB
  case_id: string; // Business ID (CASE2026...)
  patient_id: string;
  doctor_id: string;
  status: CaseStatus;
  chief_complaint: string;
  created_at: string;
  updated_at?: string;
  mongo_case_id?: string;

  // MongoDB Fields (Optional in list views, present in detailed views)
  encounter_id?: string;
  case_type?: CaseType;
  subjective?: SubjectiveSection;
  objective?: ObjectiveSection;
  assessment?: AssessmentSection;
  plan?: PlanSection;
  doctor_notes?: DoctorNote[];
  audit_trail?: AuditLog[];
  approvals?: ApprovalData;

  // Computed/Joined fields (Frontend convenience)
  patient_name?: string;
  doctor_name?: string;
}

// Request Models
export interface CaseCreate {
  patient_id: string; // The ID of the patient
  doctor_id: string; // The ID of the doctor creating the case
  chief_complaint: string;
  case_type?: CaseType;
  encounter_id?: string;
  subjective?: SubjectiveSection;
  objective?: ObjectiveSection;
  assessment?: AssessmentSection;
  plan?: PlanSection;
}

export interface CaseUpdate {
  status?: CaseStatus;
  subjective?: SubjectiveSection;
  objective?: ObjectiveSection;
  assessment?: AssessmentSection;
  plan?: PlanSection;
}

export interface CaseApprovalRequest {
  approval_notes?: string;
}

export interface DoctorNoteCreate {
  case_id: string;
  content: string;
  note_type: 'progress' | 'amendment' | 'clarification' | 'follow_up_observation';
  visibility: 'doctor_only' | 'patient_visible' | 'shared';
  linked_to_case_section?: string;
}

// Response Models
export interface CaseResponse extends Case {}

export interface CaseListResponse {
  total: number;
  cases: Partial<Case>[]; // List view often has partial data
}

export interface DoctorNoteListResponse {
  notes: DoctorNote[];
}
