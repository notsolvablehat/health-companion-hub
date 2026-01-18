// src/types/assignment.ts

export interface Assignment {
  id: string;
  doctor_id: string;
  patient_id: string;
  is_active: boolean;
  assigned_at: string;
  revoked_at?: string;
  revoke_reason?: string;
}

export interface AssignedPatient {
  user_id?: string;
  patient_id: string;
  name?: string; // From backend API
  email?: string; // From backend API
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  assigned_at?: string;
  last_case_date?: string;
  active_cases_count?: number;
}

export interface AssignedDoctor {
  doctor_id: string;
  first_name: string;
  last_name: string;
  specialisation: string;
  phone?: string;
  assigned_at: string;
}

// Request types
export interface AssignPatientRequest {
  patient_email?: string;
  patient_id?: string;
  specialisation?: string; // For auto-assignment
}

export interface RevokeAssignmentRequest {
  patient_id: string;
  reason?: string;
}

// Response types
export interface PatientListResponse {
  patients: AssignedPatient[];
  total: number;
}

export interface DoctorListResponse {
  doctors: AssignedDoctor[];
  total: number;
}
