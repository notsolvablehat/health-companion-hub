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
import type {
  AnalysisStatusResponse,
  AnalysisListResponse,
  AnalysisDetail,
} from '@/types/report';

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
  extractReport: async (reportId: string, analyzeAgain = false): Promise<ExtractReportResponse> => {
    const response = await api.post<ExtractReportResponse>(
      `/ai/extract-report/${reportId}`,
      {},
      { params: { analyze_again: analyzeAgain } }
    );
    return response.data;
  },

  /**
   * Analyze report with XGBoost diabetes prediction
   */
  analyzeReport: async (reportId: string, analyzeAgain = false): Promise<AnalyzeReportResponse> => {
    const response = await api.post<AnalyzeReportResponse>(
      `/ai/analyze-report/${reportId}`,
      {},
      { params: { analyze_again: analyzeAgain } }
    );
    return response.data;
  },

  /**
   * Get analysis status for a report
   */
  getAnalysisStatus: async (reportId: string): Promise<AnalysisStatusResponse> => {
    const response = await api.get<AnalysisStatusResponse>(
      `/reports/${reportId}/analysis-status`
    );
    return response.data;
  },

  /**
   * Get all analysis versions for a report
   */
  getAnalysisList: async (reportId: string): Promise<AnalysisListResponse> => {
    const response = await api.get<AnalysisListResponse>(
      `/reports/${reportId}/analyses`
    );
    return response.data;
  },

  /**
   * Get specific analysis detail by mongo_id
   */
  getAnalysisDetail: async (reportId: string, mongoId: string): Promise<AnalysisDetail> => {
    const response = await api.get<AnalysisDetail>(
      `/reports/${reportId}/analyses/${mongoId}`
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
