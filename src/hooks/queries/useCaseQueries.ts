// src/hooks/queries/useCaseQueries.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { casesService } from '@/services';
import { QUERY_KEYS } from '@/lib/constants';
import type {
  CreateCaseRequest,
  UpdateCaseStatusRequest,
  CaseStatus,
} from '@/types/case';

/**
 * Hook to get all cases for current user
 */
export function useCases(params?: {
  status?: CaseStatus;
  page?: number;
  per_page?: number;
}) {
  return useQuery({
    queryKey: [...QUERY_KEYS.CASES, params],
    queryFn: () => casesService.getCases(params),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to get single case details
 */
export function useCase(caseId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.CASE_DETAIL(caseId || ''),
    queryFn: () => casesService.getCaseById(caseId!),
    enabled: !!caseId,
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook to get cases for a specific patient (Doctor only)
 */
export function usePatientCases(
  patientId: string | undefined,
  params?: { status?: CaseStatus }
) {
  return useQuery({
    queryKey: ['patientCases', patientId, params],
    queryFn: () => casesService.getPatientCases(patientId!, params),
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to create a new case
 */
export function useCreateCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCaseRequest) => casesService.createCase(data),
    onSuccess: (newCase) => {
      // Invalidate cases list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CASES });

      // Optionally, add to cache directly
      queryClient.setQueryData(QUERY_KEYS.CASE_DETAIL(newCase.id), newCase);
    },
  });
}

/**
 * Hook to update case status (Doctor only)
 */
export function useUpdateCaseStatus(caseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateCaseStatusRequest) =>
      casesService.updateCaseStatus(caseId, data),
    onSuccess: (updatedCase) => {
      // Update the case in cache
      queryClient.setQueryData(QUERY_KEYS.CASE_DETAIL(caseId), updatedCase);

      // Invalidate cases list
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CASES });
    },
  });
}

/**
 * Hook to prefetch case details
 */
export function usePrefetchCase() {
  const queryClient = useQueryClient();

  return (caseId: string) => {
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.CASE_DETAIL(caseId),
      queryFn: () => casesService.getCaseById(caseId),
      staleTime: 1 * 60 * 1000,
    });
  };
}
