// src/hooks/queries/useAssignmentQueries.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { assignmentsService } from '@/services';
import { QUERY_KEYS } from '@/lib/constants';
import type {
  AssignPatientRequest,
  RevokeAssignmentRequest,
} from '@/types/assignment';

/**
 * Hook to get assigned patients (Doctor only)
 */
export function useMyPatients() {
  return useQuery({
    queryKey: QUERY_KEYS.MY_PATIENTS,
    queryFn: () => assignmentsService.getMyPatients(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get assigned doctors (Patient only)
 */
export function useMyDoctors() {
  return useQuery({
    queryKey: QUERY_KEYS.MY_DOCTORS,
    queryFn: () => assignmentsService.getMyDoctors(),
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to get patient profile (Doctor only)
 */
export function usePatientProfile(patientId: string | undefined) {
  return useQuery({
    queryKey: ['patientProfile', patientId],
    queryFn: () => assignmentsService.getPatientProfile(patientId!),
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook to assign a patient (Doctor only)
 */
export function useAssignPatient() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: AssignPatientRequest) =>
      assignmentsService.assignPatient(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_PATIENTS });
    },
  });
}

/**
 * Hook to revoke assignment (Doctor only)
 */
export function useRevokeAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: RevokeAssignmentRequest) =>
      assignmentsService.revokeAssignment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.MY_PATIENTS });
    },
  });
}

/**
 * Hook to prefetch patient profile
 */
export function usePrefetchPatientProfile() {
  const queryClient = useQueryClient();

  return (patientId: string) => {
    queryClient.prefetchQuery({
      queryKey: ['patientProfile', patientId],
      queryFn: () => assignmentsService.getPatientProfile(patientId),
      staleTime: 5 * 60 * 1000,
    });
  };
}
