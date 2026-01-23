// src/hooks/queries/useReportQueries.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { reportsService, aiService, assignmentsService } from '@/services';
import { QUERY_KEYS } from '@/lib/constants';
import type { ReportAnalysisCache } from '@/types/report';

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
      queryClient.invalidateQueries({ queryKey: ['doctor-reports'] });

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
 * Hook to get download URL as query
 */
export function useReportDownloadUrl(reportId: string) {
  return useQuery({
    queryKey: ['report-download-url', reportId],
    queryFn: () => reportsService.getDownloadUrl(reportId),
    staleTime: 30 * 60 * 1000, // 30 minutes (URLs expire in 1 hour)
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

/**
 * Get all reports from all assigned patients (for doctors)
 */
export function useDoctorReports() {
  return useQuery({
    queryKey: ['doctor-reports'],
    queryFn: async () => {
      // Get all assigned patients
      const patientsData = await assignmentsService.getMyPatients();
      
      // Get reports for each patient
      const reportsPromises = patientsData.patients.map(patient =>
        reportsService.getReportsByPatient(patient.user_id)
          .then(data => data.reports.map(report => ({
            ...report,
            patient_name: patient.name,
          })))
          .catch(() => []) // Handle errors gracefully
      );

      const reportsArrays = await Promise.all(reportsPromises);
      const allReports = reportsArrays.flat();

      // Sort by created_at descending
      allReports.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      return {
        reports: allReports,
        total: allReports.length,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to get analysis status for a report
 */
export function useAnalysisStatus(reportId: string) {
  return useQuery({
    queryKey: ['analysis-status', reportId],
    queryFn: () => aiService.getAnalysisStatus(reportId),
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Hook to get all analysis versions for a report
 */
export function useAnalysisList(reportId: string) {
  return useQuery({
    queryKey: ['analysis-list', reportId],
    queryFn: () => aiService.getAnalysisList(reportId),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook to get specific analysis detail
 */
export function useAnalysisDetail(reportId: string, mongoId: string | null) {
  return useQuery({
    queryKey: ['analysis-detail', reportId, mongoId],
    queryFn: () => aiService.getAnalysisDetail(reportId, mongoId!),
    enabled: !!mongoId,
    staleTime: 5 * 60 * 1000, // 5 minutes - analysis results don't change
  });
}

/**
 * Hook to trigger new analysis (with optional re-analysis)
 */
export function useAnalyzeReport(reportId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ['analyze-report', reportId],
    mutationFn: async ({ analyzeAgain = false }: { analyzeAgain?: boolean }) => {
      // The analyze endpoint handles both extraction and analysis
      const result = await aiService.analyzeReport(reportId, analyzeAgain);
      return result;
    },
    onSuccess: () => {
      // Invalidate all analysis-related queries
      queryClient.invalidateQueries({ queryKey: ['analysis-status', reportId] });
      queryClient.invalidateQueries({ queryKey: ['analysis-list', reportId] });
      queryClient.invalidateQueries({ queryKey: ['analysis-detail', reportId] });
    },
  });
}

/**
 * Hook to get report activity history
 */
export function useReportActivity(reportId: string) {
  return useQuery({
    queryKey: ['report-activity', reportId],
    queryFn: () => reportsService.getReportActivity(reportId),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}
