// src/services/ai.ts

import api from './api';
import type {
  Chat,
  ChatWithMessages,
  ChatListResponse,
  StartChatRequest,
  StartChatResponse,
  SendMessageRequest,
  SendMessageResponse,
  UpdateChatReportsRequest,
  ExtractReportResponse,
  AnalyzeReportResponse,
  SummarizeCaseResponse,
  PatientInsightsResponse,
} from '@/types/ai';

export const aiService = {
  // ============ CHAT ============

  /**
   * Start a new chat session
   */
  startChat: async (data: StartChatRequest = {}): Promise<StartChatResponse> => {
    const response = await api.post<StartChatResponse>('/ai/chat/start', data);
    return response.data;
  },

  /**
   * Send a message and get AI response
   */
  sendMessage: async (
    chatId: string,
    data: SendMessageRequest
  ): Promise<SendMessageResponse> => {
    const response = await api.post<SendMessageResponse>(
      `/ai/chat/${chatId}/message`,
      data
    );
    return response.data;
  },

  /**
   * Get chat history with all messages
   */
  getChatHistory: async (chatId: string): Promise<ChatWithMessages> => {
    const response = await api.get<ChatWithMessages>(`/ai/chat/${chatId}/history`);
    return response.data;
  },

  /**
   * List all user's chats
   */
  getChats: async (): Promise<ChatListResponse> => {
    const response = await api.get<ChatListResponse>('/ai/chats');
    return response.data;
  },

  /**
   * Delete a chat
   */
  deleteChat: async (chatId: string): Promise<void> => {
    await api.delete(`/ai/chat/${chatId}`);
  },

  /**
   * Attach/detach reports from a chat
   */
  updateChatReports: async (
    chatId: string,
    data: UpdateChatReportsRequest
  ): Promise<Chat> => {
    const response = await api.patch<Chat>(`/ai/chat/${chatId}/reports`, data);
    return response.data;
  },

  // ============ ANALYSIS ============

  /**
   * Extract medical data from a report (TF-IDF + Gemini)
   */
  extractReport: async (reportId: string): Promise<ExtractReportResponse> => {
    const response = await api.post<ExtractReportResponse>(
      `/ai/extract-report/${reportId}`
    );
    return response.data;
  },

  /**
   * Analyze report with XGBoost diabetes prediction (Legacy)
   */
  analyzeReport: async (reportId: string): Promise<AnalyzeReportResponse> => {
    const response = await api.post<AnalyzeReportResponse>(
      `/ai/analyze-report/${reportId}`
    );
    return response.data;
  },

  /**
   * Generate AI summary of a case
   */
  summarizeCase: async (caseId: string): Promise<SummarizeCaseResponse> => {
    const response = await api.post<SummarizeCaseResponse>(
      `/ai/summarize-case/${caseId}`
    );
    return response.data;
  },

  /**
   * Get AI-generated health insights for a patient
   */
  getPatientInsights: async (patientId: string): Promise<PatientInsightsResponse> => {
    const response = await api.get<PatientInsightsResponse>(
      `/ai/insights/${patientId}`
    );
    return response.data;
  },

  // ============ LEGACY ============

  /**
   * Ask a question about patient's medical history (Legacy - use chat instead)
   */
  askQuestion: async (
    patientId: string,
    question: string
  ): Promise<{ answer: string; sources: unknown[] }> => {
    const response = await api.post<{ answer: string; sources: unknown[] }>(
      '/ai/ask',
      { patient_id: patientId, question }
    );
    return response.data;
  },
};

export default aiService;
