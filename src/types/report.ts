// src/types/report.ts

export type ReportStatus = 'pending' | 'uploaded' | 'processing' | 'analyzed' | 'failed';
export type FileType = 'pdf' | 'image';

export interface Report {
  id: string;
  patient_id: string;
  case_id?: string | null;
  uploaded_by?: string;
  file_name: string;
  file_type: FileType;
  content_type: string;
  storage_path?: string;
  file_size_bytes?: number;
  description?: string | null;
  mongo_analysis_id?: string | null;
  created_at: string;
  updated_at?: string;
  // Extended fields (added by frontend)
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
  patient_id: string;
  case_id?: string;
  description?: string;
}

export interface UploadUrlResponse {
  report_id: string;
  upload_url: string;
  storage_path: string;
  expires_in: number;
}

export interface ConfirmUploadRequest {
  storage_path: string;
  file_size_bytes?: number;
}

export interface DownloadUrlResponse {
  report_id: string;
  download_url: string;
  expires_in: number;
}

// Response types
export interface ReportListResponse {
  reports: Report[];
  total: number;
}

// Analysis types
export interface ReportAnalysisCache {
  extraction: {
    extracted_data: Record<string, unknown>;
    raw_text: string;
    mongo_analysis_id: string;
    processing_time_ms: number;
  };
  analysis: {
    extracted_features: Record<string, number>;
    prediction: {
      is_diabetic: boolean;
      probability: number;
      risk_level: 'low' | 'medium' | 'high';
    };
    narrative: string;
    mongo_analysis_id: string;
  };
  analyzedAt: string;
}
