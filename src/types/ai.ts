// src/types/ai.ts

export interface Chat {
  id: string;
  user_id: string;
  patient_id?: string;
  title?: string;
  attached_report_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: ChatSource[];
  created_at: string;
}

export interface ChatSource {
  type: 'report' | 'case' | 'profile';
  id: string;
  title?: string;
  excerpt?: string;
}

export interface ChatWithMessages extends Chat {
  messages: ChatMessage[];
}

// Request types
export interface StartChatRequest {
  patient_id?: string;
  report_ids?: string[];
}

export interface SendMessageRequest {
  message: string;
  attach_report_ids?: string[];
}

export interface UpdateChatReportsRequest {
  report_ids: string[];
  action: 'add' | 'remove' | 'replace';
}

// Response types
export interface StartChatResponse {
  chat_id: string;
  patient_id?: string;
  attached_report_ids: string[];
  created_at: string;
}

export interface SendMessageResponse {
  message_id: string;
  response: string;
  sources?: ChatSource[];
  title?: string;
  timestamp: string;
}

export interface ChatListResponse {
  chats: Chat[];
  total: number;
}

// Analysis types
export interface ExtractReportResponse {
  extracted_data: Record<string, unknown>;
  raw_text: string;
  mongo_analysis_id: string;
  processing_time_ms: number;
}

export interface AnalyzeReportResponse {
  extracted_features: Record<string, number>;
  prediction: {
    is_diabetic: boolean;
    probability: number;
    risk_level: 'low' | 'medium' | 'high';
  };
  narrative: string;
  mongo_analysis_id: string;
}

export interface SummarizeCaseResponse {
  summary: string;
  key_findings: string[];
  recommendations: string[];
}

export interface PatientInsightsResponse {
  insights: Insight[];
  risk_factors: RiskFactor[];
  trends: Trend[];
}

export interface Insight {
  category: string;
  title: string;
  description: string;
  severity?: 'info' | 'warning' | 'critical';
}

export interface RiskFactor {
  factor: string;
  level: 'low' | 'medium' | 'high';
  description: string;
}

export interface Trend {
  metric: string;
  direction: 'improving' | 'stable' | 'declining';
  data_points?: { date: string; value: number }[];
}
