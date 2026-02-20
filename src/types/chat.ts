// src/types/chat.ts

export interface Chat {
  chat_id: string;
  patient_id?: string;
  title?: string;
  message_count?: number;
  attached_report_ids?: string[];
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  chat_id?: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  timestamp?: string;
  created_at?: string;
}

export interface ChatHistory {
  chat_id: string;
  patient_id?: string;
  title?: string;
  attached_report_ids: string[];
  messages: ChatMessage[];
  created_at: string;
  updated_at: string;
}

export interface ChatListResponse {
  total: number;
  chats: Chat[];
}

export interface StartChatRequest {
  patient_id?: string;
  report_ids?: string[];
}

export interface SendMessageRequest {
  message: string;
  attach_report_ids?: string[];
}

export interface SendMessageResponse {
  message_id: string;
  response: string;
  sources?: string[];
  title?: string;
  timestamp: string;
}

export interface UpdateChatReportsRequest {
  report_ids: string[];
  action: 'add' | 'remove' | 'replace';
}

// Voice chat types
export type VoiceLanguage = 'english' | 'kannada' | 'hindi';

export interface SendVoiceMessageRequest {
  audioBlob: Blob;
  language?: VoiceLanguage;
  attachReportIds?: string[];
}
