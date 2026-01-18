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
    // Enable for doctors always, for patients only if onboarded
    enabled: !!user && (user.role === 'doctor' || user.is_onboarded),
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: async (data) => {
      queryClient.setQueryData(['currentUser'], data.user);
      
      // Doctors don't have onboarding - always go to dashboard
      if (data.user.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else if (data.user.is_onboarded) {
        navigate('/patient/dashboard');
      } else {
        navigate('/onboarding');
      }
    },
  });

  const registerMutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      queryClient.setQueryData(['currentUser'], data.user);
      
      // Doctors don't have onboarding - go directly to dashboard
      if (data.user.role === 'doctor') {
        navigate('/doctor/dashboard');
      } else if (data.user.is_onboarded) {
        // Patient already onboarded
        navigate('/patient/dashboard');
      } else {
        // Patient needs onboarding
        navigate('/onboarding');
      }
    },
  });

  const onboardPatientMutation = useMutation({
    mutationFn: authService.onboardPatient,
    onSuccess: async () => {
      // Refetch user data to get updated is_onboarded status
      await refetchUser();
      navigate('/patient/dashboard');
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
