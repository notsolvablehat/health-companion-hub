// src/services/reports.ts

import api from './api';
import type {
  Report,
  ReportWithAnalysis,
  ReportListResponse,
  UploadUrlRequest,
  UploadUrlResponse,
  ConfirmUploadRequest,
  DownloadUrlResponse,
} from '@/types/report';
import { FILE_UPLOAD } from '@/lib/constants';

export const reportsService = {
  /**
   * Get a signed upload URL from backend
   */
  getUploadUrl: async (data: UploadUrlRequest): Promise<UploadUrlResponse> => {
    const response = await api.post<UploadUrlResponse>('/reports/upload-url', data);
    return response.data;
  },

  /**
   * Upload file directly to Supabase using signed URL
   */
  uploadToSupabase: async (
    uploadUrl: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable && onProgress) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed'));
      });

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', file.type);
      xhr.send(file);
    });
  },

  /**
   * Confirm upload after file is uploaded to Supabase
   */
  confirmUpload: async (
    reportId: string,
    data: ConfirmUploadRequest
  ): Promise<Report> => {
    const response = await api.post<Report>(`/reports/${reportId}/confirm`, data);
    return response.data;
  },

  /**
   * Complete upload flow: get URL → upload → confirm
   */
  uploadFile: async (
    file: File,
    options: {
      caseId?: string;
      patientId?: string;
      description?: string;
      onProgress?: (progress: number) => void;
    } = {}
  ): Promise<Report> => {
    // Validate file
    if (file.size > FILE_UPLOAD.MAX_SIZE) {
      throw new Error(`File size exceeds ${FILE_UPLOAD.MAX_SIZE / 1024 / 1024}MB limit`);
    }

    const acceptedTypes: readonly string[] = FILE_UPLOAD.ACCEPTED_TYPES;
    if (!acceptedTypes.includes(file.type)) {
      throw new Error('File type not supported. Please upload PDF or images.');
    }

    // Step 1: Get signed upload URL
    const { report_id, upload_url, storage_path } = await reportsService.getUploadUrl({
      filename: file.name,
      content_type: file.type,
      case_id: options.caseId,
      patient_id: options.patientId,
      description: options.description,
    });

    // Step 2: Upload to Supabase
    await reportsService.uploadToSupabase(upload_url, file, options.onProgress);

    // Step 3: Confirm upload
    const report = await reportsService.confirmUpload(report_id, {
      storage_path,
      file_size_bytes: file.size,
    });

    return report;
  },

  /**
   * Get reports for a case
   */
  getReportsByCase: async (caseId: string): Promise<ReportListResponse> => {
    const response = await api.get<ReportListResponse>(`/reports/case/${caseId}`);
    return response.data;
  },

  /**
   * Get reports for a patient
   */
  getReportsByPatient: async (patientId: string): Promise<ReportListResponse> => {
    const response = await api.get<ReportListResponse>(`/reports/patient/${patientId}`);
    return response.data;
  },

  /**
   * Get all reports for current user
   */
  getMyReports: async (): Promise<ReportListResponse> => {
    const response = await api.get<ReportListResponse>('/reports');
    return response.data;
  },

  /**
   * Get single report
   */
  getReportById: async (reportId: string): Promise<ReportWithAnalysis> => {
    const response = await api.get<ReportWithAnalysis>(`/reports/${reportId}`);
    return response.data;
  },

  /**
   * Get signed download URL
   */
  getDownloadUrl: async (reportId: string): Promise<DownloadUrlResponse> => {
    const response = await api.get<DownloadUrlResponse>(`/reports/${reportId}/download`);
    return response.data;
  },

  /**
   * Download file (opens in new tab or triggers download)
   */
  downloadFile: async (reportId: string): Promise<void> => {
    const { download_url } = await reportsService.getDownloadUrl(reportId);
    window.open(download_url, '_blank');
  },
};

export default reportsService;
