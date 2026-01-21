// src/hooks/queries/useAuthQueries.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { authService, tokenManager } from '@/services';
import { usersService } from '@/services/users';
import { QUERY_KEYS } from '@/lib/constants';
import type {
  LoginRequest,
  RegisterRequest,
  OnboardPatientRequest,
  OnboardDoctorRequest,
  UpdateProfileRequest,
} from '@/types/auth';

/**
 * Hook to get current user
 */
export function useCurrentUser() {
  return useQuery({
    queryKey: QUERY_KEYS.CURRENT_USER,
    queryFn: usersService.getCurrentUser,
    enabled: tokenManager.isValid(),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get user profile
 */
export function useUserProfile() {
  const { data: user } = useCurrentUser();

  return useQuery({
    queryKey: QUERY_KEYS.USER_PROFILE,
    queryFn: usersService.getProfile,
    enabled: !!user?.is_onboarded,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for login mutation
 */
export function useLogin() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (response) => {
      queryClient.setQueryData(QUERY_KEYS.CURRENT_USER, response.user);

      if (response.user.is_onboarded) {
        navigate(
          response.user.role === 'doctor'
            ? '/doctor/dashboard'
            : '/patient/dashboard'
        );
      } else {
        navigate('/onboarding');
      }
    },
  });
}

/**
 * Hook for register mutation
 */
export function useRegister() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (response) => {
      queryClient.setQueryData(QUERY_KEYS.CURRENT_USER, response.user);
      navigate('/onboarding');
    },
  });
}

/**
 * Hook for patient onboarding
 */
export function useOnboardPatient() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: OnboardPatientRequest) => authService.onboardPatient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CURRENT_USER });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PROFILE });
      navigate('/patient/dashboard');
    },
  });
}

/**
 * Hook for doctor onboarding
 */
export function useOnboardDoctor() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (data: OnboardDoctorRequest) => authService.onboardDoctor(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CURRENT_USER });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.USER_PROFILE });
      navigate('/doctor/dashboard');
    },
  });
}

/**
 * Hook for profile update
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateProfileRequest) => usersService.updateProfile(data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(QUERY_KEYS.USER_PROFILE, updatedProfile);
    },
  });
}

/**
 * Hook for logout
 */
export function useLogout() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return () => {
    authService.logout();
    queryClient.clear();
    navigate('/login');
  };
}
