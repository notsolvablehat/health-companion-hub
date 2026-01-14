import api, { tokenManager } from './api';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  UserProfile,
  OnboardPatientRequest,
  OnboardDoctorRequest,
  UpdateProfileRequest,
} from '@/types/auth';

export const authService = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/register', data, {
      skipAuth: true,
    });
    
    if (response.data.access_token) {
      tokenManager.set(response.data.access_token);
    }
    
    return response.data;
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await api.post<AuthResponse>('/auth/login', data, {
      skipAuth: true,
    });
    
    if (response.data.access_token) {
      tokenManager.set(response.data.access_token);
    }
    
    return response.data;
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<User>('/users/me');
    return response.data;
  },

  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>('/users/profile');
    return response.data;
  },

  onboardPatient: async (data: OnboardPatientRequest): Promise<UserProfile> => {
    const response = await api.post<UserProfile>('/users/onboard', {
      ...data,
      role: 'patient',
    });
    return response.data;
  },

  onboardDoctor: async (data: OnboardDoctorRequest): Promise<UserProfile> => {
    const response = await api.post<UserProfile>('/users/onboard', {
      ...data,
      role: 'doctor',
    });
    return response.data;
  },

  updateProfile: async (data: UpdateProfileRequest): Promise<UserProfile> => {
    const response = await api.post<UserProfile>('/users/update-profile', data);
    return response.data;
  },

  logout: (): void => {
    tokenManager.clear();
  },

  isAuthenticated: (): boolean => {
    return tokenManager.isValid();
  },
};

export default authService;
