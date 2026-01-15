// src/services/users.ts

import api from './api';
import type {
  User,
  UserProfile,
  UpdateProfileRequest,
  PatientProfile,
} from '@/types/auth';

export const usersService = {
  /**
   * Get current user basic info
   */
  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/users/me');
    return response.data;
  },

  /**
   * Get full profile of current user
   */
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>('/users/profile');
    return response.data;
  },

  /**
   * Update profile
   */
  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    const response = await api.post<UserProfile>('/users/update-profile', data);
    return response.data;
  },

  /**
   * Get patient profile by ID (Doctor only - must be assigned)
   */
  getPatientProfile: async (patientId: string): Promise<PatientProfile> => {
    const response = await api.get<PatientProfile>(
      `/users/patient-profile/${patientId}`
    );
    return response.data;
  },
};

export default usersService;
