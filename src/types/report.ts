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
    extracted_data: Record<string, any>; // Used loose typing here as structure is complex
    raw_text: string;
    mongo_analysis_id?: string;
    processing_time_ms?: number;
    extracted_at?: string;
  };
  analysis: {
    extracted_features?: Record<string, number>;
    prediction?: {
      label: string;
      confidence: number;
    };
    narrative: string;
    mongo_analysis_id?: string;
  };
  analyzedAt: string;
}

export type ActivityType = 'upload' | 'analysis' | 'extraction' | 'explanation_request' | 'download';
export type ActivityStatus = 'completed' | 'failed' | 'in_progress';

export interface ReportActivity {
  activity_type: ActivityType;
  user_id: string;
  user_role: 'patient' | 'doctor' | 'system';
  status: ActivityStatus;
  timestamp: string;
  metadata: Record<string, any> | null;
  error_message: string | null;
}

export interface ReportActivityResponse {
  report_id: string;
  patient_id: string;
  total_activities: number;
  upload_count: number;
  analysis_count: number;
  extraction_count: number;
  explanation_count: number;
  download_count: number;
  activities: ReportActivity[];
}

// Analysis Status
export interface AnalysisStatusResponse {
  report_id: string;
  is_analyzed: boolean;
  analysis_count: number;
  latest_analysis_id?: string;
  latest_analysis_date?: string;
}

// Analysis Summary (for list view)
export interface AnalysisSummary {
  mongo_id: string;
  status: 'completed' | 'failed' | 'in_progress';
  analysis_type: 'extraction' | 'diabetes_analysis';
  created_at: string;
  processing_time_ms?: number;
  // Extraction-specific fields
  report_type?: string;
  lab_results_count?: number;
  medications_count?: number;
  // Analysis-specific fields
  prediction_label?: string;
  prediction_confidence?: number;
}

// Analysis List Response
export interface AnalysisListResponse {
  report_id: string;
  total_analyses: number;
  analyses: AnalysisSummary[];
}

// Full Analysis Detail (when fetching a specific analysis)
export interface AnalysisDetail {
  analysis_id: string;
  report_id: string;
  patient_id: string;
  status: 'completed' | 'failed' | 'in_progress';
  created_at: string;
  processing_time_ms?: number;
  raw_text?: string;
  extracted_data?: Record<string, any>;
  extracted_features?: Record<string, number> | null;
  prediction?: {
    label: string;
    confidence: number;
  } | null;
  narrative?: string | null;
  error?: string | null;
}

