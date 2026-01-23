export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

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

export const CASE_STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  in_review: 'In Review',
  approved: 'Approved',
  rejected: 'Rejected',
  closed: 'Closed',
};

export const CASE_STATUS_COLORS: Record<string, string> = {
  open: 'bg-info/10 text-info',
  in_review: 'bg-warning/10 text-warning',
  approved: 'bg-success/10 text-success',
  rejected: 'bg-destructive/10 text-destructive',
  closed: 'bg-muted text-muted-foreground',
};

export const REPORT_STATUS = {
  PENDING: 'pending',
  UPLOADED: 'uploaded',
  PROCESSING: 'processing',
  ANALYZED: 'analyzed',
  FAILED: 'failed',
} as const;

export const FILE_UPLOAD = {
  MAX_SIZE: 20 * 1024 * 1024, // 20MB
  ACCEPTED_TYPES: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
  ACCEPTED_EXTENSIONS: ['.pdf', '.jpg', '.jpeg', '.png', '.webp'],
} as const;

export const QUERY_KEYS = {
  // Auth
  CURRENT_USER: ['currentUser'] as const,
  USER_PROFILE: ['userProfile'] as const,
  
  // Cases
  CASES: ['cases'] as const,
  CASE_DETAIL: (id: string) => ['cases', id] as const,
  
  // Reports
  REPORTS: ['reports'] as const,
  REPORT_DETAIL: (id: string) => ['reports', id] as const,
  
  // Assignments
  ASSIGNMENTS: ['assignments'] as const,
  MY_PATIENTS: ['assignments', 'patients'] as const,
  MY_DOCTORS: ['assignments', 'doctors'] as const,
  
  // AI
  CHATS: ['chats'] as const,
  CHAT_DETAIL: (id: string) => ['chats', id] as const,
  INSIGHTS: (patientId: string) => ['insights', patientId] as const,
  
  // Diabetes Dashboard
  DIABETES_DASHBOARD: ['diabetesDashboard'] as const,
  PATIENT_DIABETES_DASHBOARD: (patientId: string) => ['diabetesDashboard', patientId] as const,
  
  // Analysis Status (for auto-refresh)
  ANALYSIS_STATUS: (reportId: string) => ['analysisStatus', reportId] as const,

  // Appointments
  APPOINTMENTS: ['appointments'] as const,
  MY_APPOINTMENTS: (role: string) => ['appointments', role] as const,
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
  PATIENT_DIABETES_DASHBOARD: '/patient/diabetes-dashboard',
  PATIENT_CHAT: '/patient/chat',
  PATIENT_CHAT_DETAIL: (id: string) => `/patient/chat/${id}`,
  
  // Doctor
  DOCTOR_DASHBOARD: '/doctor/dashboard',
  DOCTOR_PATIENTS: '/doctor/patients',
  DOCTOR_PATIENT_DETAIL: (id: string) => `/doctor/patients/${id}`,
  DOCTOR_CASES: '/doctor/cases',
  DOCTOR_CASE_REVIEW: (id: string) => `/doctor/cases/${id}`,
  DOCTOR_CHAT: '/doctor/chat',
  DOCTOR_CHAT_DETAIL: (id: string) => `/doctor/chat/${id}`,
  
  // Shared
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;
