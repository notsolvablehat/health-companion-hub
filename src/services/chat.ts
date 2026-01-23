// src/services/chat.ts

import api from './api';
import type {
  Chat,
  ChatHistory,
  ChatListResponse,
  StartChatRequest,
  SendMessageRequest,
  SendMessageResponse,
  UpdateChatReportsRequest,
} from '@/types/chat';

export const chatService = {
  /**
   * Start a new chat session
   */
  startChat: async (data: StartChatRequest = {}): Promise<{ chat_id: string; patient_id?: string; attached_report_ids: string[]; created_at: string }> => {
    const response = await api.post<{ chat_id: string; patient_id?: string; attached_report_ids: string[]; created_at: string }>('/ai/chat/start', data);
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
  getChatHistory: async (chatId: string): Promise<ChatHistory> => {
    const response = await api.get<ChatHistory>(`/ai/chat/${chatId}/history`);
    return response.data;
  },

  /**
   * List all user's chats
   */
  listChats: async (): Promise<ChatListResponse> => {
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
  updateReports: async (
    chatId: string,
    data: UpdateChatReportsRequest
  ): Promise<Chat> => {
    const response = await api.patch<Chat>(`/ai/chat/${chatId}/reports`, data);
    return response.data;
  },
};

export default chatService;
