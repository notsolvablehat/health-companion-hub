export type UserRole = 'patient' | 'doctor';

export interface User {
  id: string;
  email: string;
  role: UserRole;
  is_onboarded: boolean;
  created_at: string;
}


export interface PatientProfile {
  // User info
  name?: string;
  email?: string;
  role?: 'patient';
  is_onboarded?: boolean;
  created_at?: string;
  
  // IDs
  patient_id: string;
  user_id: string;
  
  // Demographics
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  phone_number: string;
  address: string;
  
  // Vitals
  blood_group?: 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';
  height_cm?: number;
  weight_kg?: number;
  
  // Medical
  allergies: string[];
  current_medications: string[];
  medical_history: string[];
  
  // Emergency
  emergency_contact_name: string;
  emergency_contact_phone: string;
  
  // Legal
  consent_hipaa: boolean;
}

export interface DoctorProfile {
  name: string;
  email: string;
  role: 'doctor';
  is_onboarded: boolean;
  created_at: string;
  doctor_id: string;
  license: string;
  specialisation: string;
  date_of_birth?: string;
  gender?: string;
  medical_info?: any;
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
