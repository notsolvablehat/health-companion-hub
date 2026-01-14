export type UserRole = 'patient' | 'doctor';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  is_onboarded: boolean;
  created_at: string;
}

export interface PatientProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  phone?: string;
  address?: string;
  medical_history: string[];
  allergies: string[];
  emergency_contact?: {
    name: string;
    phone: string;
    relationship: string;
  };
}

export interface DoctorProfile {
  user_id: string;
  first_name: string;
  last_name: string;
  specialisation: string;
  license_number: string;
  phone?: string;
  max_patients: number;
  current_patient_count?: number;
}

export type UserProfile = PatientProfile | DoctorProfile;

// Request/Response types
export interface RegisterRequest {
  email: string;
  password: string;
  role: UserRole;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface OnboardPatientRequest {
  first_name: string;
  last_name: string;
  date_of_birth: string;
  gender: 'male' | 'female' | 'other';
  phone?: string;
  address?: string;
  medical_history?: string[];
  allergies?: string[];
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  emergency_contact_relationship?: string;
}

export interface OnboardDoctorRequest {
  first_name: string;
  last_name: string;
  specialisation: string;
  license_number: string;
  phone?: string;
  max_patients?: number;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  address?: string;
  medical_history?: string[];
  allergies?: string[];
  specialisation?: string;
  max_patients?: number;
}
