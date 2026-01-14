export const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://your-backend.onrender.com';

export const TOKEN_KEY = 'auth_token';
export const TOKEN_EXPIRY_KEY = 'auth_token_expiry';

export const ROLES = {
  PATIENT: 'patient',
  DOCTOR: 'doctor',
} as const;

export const SPECIALIZATIONS = [
  'Diabetology',
  'Endocrinology',
  'Internal Medicine',
  'Family Medicine',
  'Cardiology',
  'Nephrology',
  'Ophthalmology',
  'Podiatry',
  'Nutrition',
  'General Practice',
] as const;

export const GENDERS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
] as const;

export const COMMON_ALLERGIES = [
  'Penicillin',
  'Sulfa drugs',
  'Aspirin',
  'Ibuprofen',
  'Latex',
  'Peanuts',
  'Tree nuts',
  'Shellfish',
  'Eggs',
  'Milk',
  'Soy',
  'Wheat',
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
