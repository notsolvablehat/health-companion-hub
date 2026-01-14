import {
  createContext,
  useContext,
  useCallback,
  useMemo,
  ReactNode,
} from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import authService from '@/services/auth';
import { tokenManager } from '@/services/api';
import type {
  User,
  UserProfile,
  LoginRequest,
  RegisterRequest,
  OnboardPatientRequest,
  OnboardDoctorRequest,
} from '@/types/auth';

interface AuthContextValue {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  
  login: (data: LoginRequest) => Promise<void>;
  register: (data: RegisterRequest) => Promise<void>;
  logout: () => void;
  onboardPatient: (data: OnboardPatientRequest) => Promise<void>;
  onboardDoctor: (data: OnboardDoctorRequest) => Promise<void>;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data: user,
    isLoading: isUserLoading,
    refetch: refetchUser,
  } = useQuery({
    queryKey: ['currentUser'],
    queryFn: authService.getCurrentUser,
    enabled: tokenManager.isValid(),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['userProfile'],
    queryFn: authService.getProfile,
    enabled: !!user?.is_onboarded,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: async (data) => {
      queryClient.setQueryData(['currentUser'], data.user);
      
      if (data.user.is_onboarded) {
        navigate(data.user.role === 'doctor' ? '/doctor/dashboard' : '/patient/dashboard');
      } else {
        navigate('/onboarding');
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], data.user);
      navigate('/onboarding');
    },
  });

  const onboardPatientMutation = useMutation({
    mutationFn: authService.onboardPatient,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      navigate('/patient/dashboard');
    },
  });

  const onboardDoctorMutation = useMutation({
    mutationFn: authService.onboardDoctor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
      queryClient.invalidateQueries({ queryKey: ['userProfile'] });
      navigate('/doctor/dashboard');
    },
  });

  const logout = useCallback(() => {
    authService.logout();
    queryClient.clear();
    navigate('/login');
  }, [queryClient, navigate]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: user ?? null,
      profile: profile ?? null,
      isLoading: isUserLoading || isProfileLoading,
      isAuthenticated: !!user,
      isOnboarded: !!user?.is_onboarded,
      
      login: async (data) => {
        await loginMutation.mutateAsync(data);
      },
      register: async (data) => {
        await registerMutation.mutateAsync(data);
      },
      logout,
      onboardPatient: async (data) => {
        await onboardPatientMutation.mutateAsync(data);
      },
      onboardDoctor: async (data) => {
        await onboardDoctorMutation.mutateAsync(data);
      },
      refetchUser: async () => {
        await refetchUser();
      },
    }),
    [
      user,
      profile,
      isUserLoading,
      isProfileLoading,
      loginMutation,
      registerMutation,
      logout,
      onboardPatientMutation,
      onboardDoctorMutation,
      refetchUser,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
