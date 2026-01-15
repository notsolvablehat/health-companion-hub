// src/types/report.ts

export type ReportStatus = 'pending' | 'uploaded' | 'processing' | 'analyzed' | 'failed';

export interface Report {
  id: string;
  patient_id: string;
  case_id?: string;
  filename: string;
  content_type: string;
  file_size_bytes?: number;
  storage_path?: string;
  status: ReportStatus;
  description?: string;
  created_at: string;
  updated_at: string;
  // Joined data
  patient_name?: string;
}

export interface ReportWithAnalysis extends Report {
  extracted_data?: ExtractedReportData;
  analysis_id?: string;
}

export interface ExtractedReportData {
  raw_text?: string;
  keywords?: string[];
  medical_entities?: {
    conditions?: string[];
    medications?: string[];
    procedures?: string[];
    lab_values?: Record<string, string | number>;
  };
  summary?: string;
  extracted_at?: string;
}

// Request types
export interface UploadUrlRequest {
  filename: string;
  content_type: string;
  patient_id?: string; // Optional for patients (uses their own ID)
  case_id?: string;
  description?: string;
}

export interface UploadUrlResponse {
  report_id: string;
  upload_url: string;
  storage_path: string;
  expires_at: string;
}

export interface ConfirmUploadRequest {
  storage_path: string;
  file_size_bytes?: number;
}

export interface DownloadUrlResponse {
  download_url: string;
  expires_at: string;
  filename: string;
  content_type: string;
}

// Response types
export interface ReportListResponse {
  reports: Report[];
  total: number;
}
