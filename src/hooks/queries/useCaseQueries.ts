import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { casesService } from '@/services';
import { useAuth } from '@/contexts/AuthContext';
import { QUERY_KEYS } from '@/lib/constants';
import type {
  CaseCreate,
  CaseUpdate,
  CaseApprovalRequest,
  DoctorNoteCreate,
  CaseStatus,
} from '@/types/case';

// -- Queries --

/**
 * Hook to get all cases for a specific doctor
 */
export function useDoctorCases(
  doctorId: string | undefined,
  params?: {
    status?: string | undefined; // Use string to match service, or update service to use CaseStatus
    skip?: number;
    limit?: number;
  }
) {
  return useQuery({
    queryKey: [...QUERY_KEYS.CASES, 'doctor', doctorId, params],
    queryFn: () => casesService.listDoctorCases(doctorId!, params),
    enabled: !!doctorId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to get all cases for a specific patient
 */
export function usePatientCases(
  patientId: string | undefined,
  params?: {
    skip?: number;
    limit?: number;
  }
) {
  return useQuery({
    queryKey: [...QUERY_KEYS.CASES, 'patient', patientId, params],
    queryFn: () => casesService.listPatientCases(patientId!, params),
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to get single case details
 */
export function useCase(caseId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.CASE_DETAIL(caseId || ''),
    queryFn: () => casesService.getCase(caseId!),
    enabled: !!caseId,
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Hook to get notes for a case
 */
export function useCaseNotes(caseId: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEYS.CASES, caseId, 'notes'],
    queryFn: () => casesService.getNotes(caseId!),
    enabled: !!caseId,
    staleTime: 1 * 60 * 1000,
  });
}

/**
 * Hook to get all cases for the current user
 */
export function useCases() {
  const { user } = useAuth();

  return useQuery({
    queryKey: [...QUERY_KEYS.CASES, 'my-cases', user?.id],
    queryFn: async () => {
      // Return empty list if no user or ID
      if (!user?.id) return { cases: [], total: 0 };
      
      // Fetch cases based on role
      if (user.role === 'doctor') {
        return casesService.listDoctorCases(user.id);
      } else {
        // Patient
        return casesService.listPatientCases(user.id);
      }
    },
    // Only fetch when we have a user ID
    enabled: !!user?.id,
    staleTime: 2 * 60 * 1000,
  });
}

// -- Mutations --

/**
 * Hook to create a new case (Doctor only)
 */
export function useCreateCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CaseCreate) => casesService.createCase(data),
    onSuccess: (newCase) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CASES });
      // We can also optimistically set the detail
      queryClient.setQueryData(QUERY_KEYS.CASE_DETAIL(newCase.case_id), newCase);
    },
  });
}

/**
 * Hook to update case (status or soap notes)
 */
export function useUpdateCase(caseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CaseUpdate) => casesService.updateCase(caseId, data),
    onSuccess: (updatedCase) => {
      queryClient.setQueryData(QUERY_KEYS.CASE_DETAIL(caseId), updatedCase);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CASES });
    },
  });
}

/**
 * Hook to approve a case (Doctor)
 */
export function useApproveCase(caseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CaseApprovalRequest) => casesService.approveCase(caseId, data),
    onSuccess: (updatedCase) => {
      queryClient.setQueryData(QUERY_KEYS.CASE_DETAIL(caseId), updatedCase);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CASES });
    },
  });
}

/**
 * Hook to add a doctor note
 */
export function useAddNote(caseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: DoctorNoteCreate) => casesService.addNote(caseId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEYS.CASES, caseId, 'notes'] });
      // Optionally invalidate case detail if notes are embedded
    },
  });
}
