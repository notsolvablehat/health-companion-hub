// src/hooks/queries/useReportQueries.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { reportsService } from '@/services';
import { QUERY_KEYS } from '@/lib/constants';

/**
 * Hook to get all reports for current user
 */
export function useReports() {
  return useQuery({
    queryKey: QUERY_KEYS.REPORTS,
    queryFn: () => reportsService.getMyReports(),
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to get reports for a case
 */
export function useCaseReports(caseId: string | undefined) {
  return useQuery({
    queryKey: ['caseReports', caseId],
    queryFn: () => reportsService.getReportsByCase(caseId!),
    enabled: !!caseId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to get reports for a patient
 */
export function usePatientReports(patientId: string | undefined) {
  return useQuery({
    queryKey: ['patientReports', patientId],
    queryFn: () => reportsService.getReportsByPatient(patientId!),
    enabled: !!patientId,
    staleTime: 2 * 60 * 1000,
  });
}

/**
 * Hook to get single report details
 */
export function useReport(reportId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.REPORT_DETAIL(reportId || ''),
    queryFn: () => reportsService.getReportById(reportId!),
    enabled: !!reportId,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Hook for file upload with progress tracking
 */
export function useUploadReport() {
  const queryClient = useQueryClient();
  const [uploadProgress, setUploadProgress] = useState(0);

  const mutation = useMutation({
    mutationFn: ({
      file,
      caseId,
      patientId,
      description,
    }: {
      file: File;
      caseId?: string;
      patientId?: string;
      description?: string;
    }) =>
      reportsService.uploadFile(file, {
        caseId,
        patientId,
        description,
        onProgress: setUploadProgress,
      }),
    onSuccess: (newReport) => {
      // Reset progress
      setUploadProgress(0);

      // Invalidate reports lists
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.REPORTS });

      if (newReport.case_id) {
        queryClient.invalidateQueries({
          queryKey: ['caseReports', newReport.case_id],
        });
      }

      // Add to cache
      queryClient.setQueryData(
        QUERY_KEYS.REPORT_DETAIL(newReport.id),
        newReport
      );
    },
    onError: () => {
      setUploadProgress(0);
    },
  });

  return {
    ...mutation,
    uploadProgress,
  };
}

/**
 * Hook to get download URL
 */
export function useDownloadReport() {
  return useMutation({
    mutationFn: (reportId: string) => reportsService.downloadFile(reportId),
  });
}

/**
 * Hook to prefetch report
 */
export function usePrefetchReport() {
  const queryClient = useQueryClient();

  return (reportId: string) => {
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.REPORT_DETAIL(reportId),
      queryFn: () => reportsService.getReportById(reportId),
      staleTime: 5 * 60 * 1000,
    });
  };
}
