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

// Patient summary for doctor's patient list
export interface PatientSummary {
  user_id: string;
  patient_id: string;
  name: string;
  email: string;
  gender: string;
  date_of_birth: string;
}

// Historical patient entry with assignment details
export interface PatientHistoryEntry extends PatientSummary {
  assigned_at: string;
  revoked_at: string;
  reason?: string;
}

// Doctor summary for patient's doctor list
export interface DoctorSummary {
  user_id: string;
  doctor_id: string;
  name: string;
  email: string;
  specialisation: string;
  department?: string;
}

// Historical doctor entry with assignment details
export interface DoctorHistoryEntry extends DoctorSummary {
  assigned_at: string;
  revoked_at: string;
  reason?: string;
}

// Legacy types for backwards compatibility
export interface AssignedPatient {
  user_id?: string;
  patient_id: string;
  name?: string;
  email?: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: string;
  assigned_at?: string;
  last_case_date?: string;
  active_cases_count?: number;
}

export interface AssignedDoctor {
  user_id?: string;
  doctor_id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  specialisation: string;
  department?: string;
  phone?: string;
  assigned_at?: string;
}

// Request types
export interface AssignPatientRequest {
  patient_email: string;
  speciality_required: string;
}

export interface RevokeAssignmentRequest {
  patient_email: string;
  doctor_identifier?: string; // Admin only
  reason?: string;
}

// Response types - Doctor's view of patients
export interface MyPatientsResponse {
  doctor_id: string;
  count: number;
  patients: PatientSummary[];
  history: PatientHistoryEntry[];
}

// Response types - Patient's view of doctors
export interface MyDoctorsResponse {
  patient_id: string;
  count: number;
  doctors: DoctorSummary[];
  history: DoctorHistoryEntry[];
}

// Specialities response
export interface SpecialitiesResponse {
  count: number;
  specialities: string[];
}

// Assignment success response
export interface AssignmentSuccessResponse {
  status: string;
  assigned_doctor: string;
  specialization: string;
  current_load: number;
}

// Legacy response types for backwards compatibility
export interface PatientListResponse {
  patients: AssignedPatient[];
  total: number;
}

export interface DoctorListResponse {
  doctors: AssignedDoctor[];
  total: number;
}
