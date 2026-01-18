import api from './api';
import type { UserProfile, OnboardPatientRequest } from '@/types/auth';

export interface UpdateProfileRequest {
  date_of_birth: string;
  gender: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  phone_number: string;
  address: string;
  blood_group?: 'A+' | 'A-' | 'B+' | 'B-' | 'O+' | 'O-' | 'AB+' | 'AB-';
  height_cm?: number;
  weight_kg?: number;
  allergies?: string[];
  current_medications?: string[];
  medical_history?: string[];
  emergency_contact_name: string;
  emergency_contact_phone: string;
  consent_hipaa: boolean;
}

export const userService = {
  /**
   * Update user's profile information (patients only)
   * Backend endpoint: POST /users/update-user
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    const response = await api.post<UserProfile>('/users/update-user', data);
    return response.data;
  },

  /**
   * Update user's display name
   * Backend endpoint: POST /users/update-user-name?name_of_user={name}
   */
  updateName: async (name: string): Promise<void> => {
    await api.post('/users/update-user-name', null, {
      params: { name_of_user: name }
    });
  },
};

export default userService;
