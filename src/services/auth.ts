import api, { tokenManager } from './api';
import { API_BASE_URL } from '@/lib/constants';
import type {
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
  UserProfile,
  OnboardPatientRequest,


} from '@/types/auth';

// Helper to send OAuth2 form data
async function postFormData<T>(endpoint: string, formData: URLSearchParams): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: formData,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.detail || 'Request failed');
  }
  
  return data;
}

export const authService = {
  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    // Backend expects JSON with email, username, password, role
    const payload = {
      email: data.email,
      username: data.email, // Use email as username
      password: data.password,
      role: data.role,
    };
    
    const response = await api.post<any>('/auth/register', payload, {
      skipAuth: true,
    });
    
    const rawResponse = response.data;
    
    if (rawResponse.access_token) {
      tokenManager.set(rawResponse.access_token);
    }
    
    // Backend returns: {access_token, token_type, role, is_onboarded}
    // Fetch /users/me to get complete user info
    const userResponse = await api.get<any>('/users/me');
    
    return {
      access_token: rawResponse.access_token,
      token_type: rawResponse.token_type,
      user: {
        id: userResponse.data.user_id,
        email: userResponse.data.email,
        role: userResponse.data.role,
        is_onboarded: userResponse.data.is_onboarded,
        created_at: new Date().toISOString(),
      },
    };
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    // OAuth2 form expects 'username' not 'email'
    const formData = new URLSearchParams();
    formData.append('username', data.email);
    formData.append('password', data.password);
    
    const rawResponse = await postFormData<any>('/auth/login', formData);
    
    if (rawResponse.access_token) {
      tokenManager.set(rawResponse.access_token);
    }
    
    // Backend now returns: {access_token, token_type, role, is_onboarded}
    // Fetch /users/me to get complete user info
    const userResponse = await api.get<any>('/users/me');
    
    return {
      access_token: rawResponse.access_token,
      token_type: rawResponse.token_type,
      user: {
        id: userResponse.data.user_id,
        email: userResponse.data.email,
        role: userResponse.data.role,
        is_onboarded: userResponse.data.is_onboarded,
        created_at: new Date().toISOString(),
      },
    };
  },

  getCurrentUser: async (): Promise<User> => {
    const response = await api.get<any>('/users/me');
    
    // Backend returns: {user_id, role, is_onboarded, email, username, name}
    return {
      id: response.data.user_id,
      email: response.data.email,
      role: response.data.role,
      is_onboarded: response.data.is_onboarded,
      created_at: new Date().toISOString(),
    };
  },

  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get<UserProfile>('/users/profile');
    return response.data;
  },

  onboardPatient: async (data: OnboardPatientRequest): Promise<UserProfile> => {
    // Transform data to match backend expectations
    const payload = {
      role: 'patient',
      first_name: data.first_name,
      last_name: data.last_name,
      date_of_birth: data.date_of_birth,
      // Capitalize gender: 'male' -> 'Male'
      gender: data.gender.charAt(0).toUpperCase() + data.gender.slice(1),
      // Rename phone to phone_number
      phone_number: data.phone || '',
      address: data.address || '',
      medical_history: data.medical_history || [],
      allergies: data.allergies || [],
      emergency_contact_name: data.emergency_contact_name || '',
      emergency_contact_phone: data.emergency_contact_phone || '',
      emergency_contact_relationship: data.emergency_contact_relationship || '',
      // Add required consent field
      consent_hipaa: true,
    };
    
    const response = await api.post<UserProfile>('/users/onboard', payload);
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
