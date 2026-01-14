export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-backend.onrender.com';

export const TOKEN_KEY = 'auth_token';
export const TOKEN_EXPIRY_KEY = 'auth_token_expiry';

export const ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
} as const;

export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
] as const;

export const SPECIALIZATIONS = [
  'General Physician',
  'Endocrinologist',
  'Diabetologist',
  'Cardiologist',
  'Neurologist',
  'Nephrologist',
  'Ophthalmologist',
  'Podiatrist',
  'Dietitian',
  'Other',
] as const;

export const COMMON_ALLERGIES = [
  'Penicillin',
  'Sulfa drugs',
  'Aspirin',
  'Ibuprofen',
  'Insulin',
  'Latex',
  'Peanuts',
  'Shellfish',
  'Eggs',
  'Milk',
  'Soy',
  'Wheat',
  'None',
] as const;

export const COMMON_CONDITIONS = [
  'Type 1 Diabetes',
  'Type 2 Diabetes',
  'Gestational Diabetes',
  'Prediabetes',
  'Hypertension',
  'Heart Disease',
  'Kidney Disease',
  'Neuropathy',
  'Retinopathy',
  'Obesity',
] as const;

export const CASE_STATUS = {
  OPEN: 'open',
  IN_REVIEW: 'in_review',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CLOSED: 'closed',
} as const;

export const FILE_UPLOAD = {
  MAX_SIZE: 20 * 1024 * 1024, // 20MB
  ACCEPTED_TYPES: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
  ACCEPTED_EXTENSIONS: ['.pdf', '.jpg', '.jpeg', '.png', '.webp'],
} as const;

export const QUERY_KEYS = {
  CURRENT_USER: ['currentUser'],
  USER_PROFILE: ['userProfile'],
  CASES: ['cases'],
  CASE_DETAIL: (id: string) => ['cases', id],
  REPORTS: ['reports'],
  REPORT_DETAIL: (id: string) => ['reports', id],
  ASSIGNMENTS: ['assignments'],
  MY_PATIENTS: ['assignments', 'patients'],
  MY_DOCTORS: ['assignments', 'doctors'],
  CHATS: ['chats'],
  CHAT_DETAIL: (id: string) => ['chats', id],
  INSIGHTS: (patientId: string) => ['insights', patientId],
} as const;

export const ROUTES = {
  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  ONBOARDING: '/onboarding',
  
  // Patient
  PATIENT_DASHBOARD: '/patient/dashboard',
  PATIENT_CASES: '/patient/cases',
  PATIENT_CASE_DETAIL: (id: string) => `/patient/cases/${id}`,
  PATIENT_REPORTS: '/patient/reports',
  PATIENT_DOCTORS: '/patient/doctors',
  PATIENT_CHAT: '/patient/chat',
  
  // Doctor
  DOCTOR_DASHBOARD: '/doctor/dashboard',
  DOCTOR_PATIENTS: '/doctor/patients',
  DOCTOR_PATIENT_DETAIL: (id: string) => `/doctor/patients/${id}`,
  DOCTOR_CASES: '/doctor/cases',
  DOCTOR_CASE_REVIEW: (id: string) => `/doctor/cases/${id}`,
  DOCTOR_CHAT: '/doctor/chat',
  
  // Shared
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;
