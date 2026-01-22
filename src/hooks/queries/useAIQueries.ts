// src/hooks/queries/useAIQueries.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useRef, useCallback } from 'react';
import { aiService } from '@/services';
import { QUERY_KEYS } from '@/lib/constants';
import type {
  StartChatRequest,
  SendMessageRequest,
  UpdateChatReportsRequest,
  ChatWithMessages,
} from '@/types/ai';

// ============ CHAT HOOKS ============

/**
 * Hook to get all user's chats
 */
export function useChats() {
  return useQuery({
    queryKey: QUERY_KEYS.CHATS,
    queryFn: () => aiService.getChats(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook to get chat history with messages
 */
export function useChat(chatId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.CHAT_DETAIL(chatId || ''),
    queryFn: () => aiService.getChatHistory(chatId!),
    enabled: !!chatId,
    staleTime: 30 * 1000, // 30 seconds - chat changes frequently
  });
}

/**
 * Hook to start a new chat
 */
export function useStartChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StartChatRequest = {}) => aiService.startChat(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHATS });
    },
  });
}

/**
 * Hook to send a message in a chat
 */
export function useSendMessage(chatId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendMessageRequest) => aiService.sendMessage(chatId, data),
    onSuccess: (response) => {
      // Invalidate chat to refetch messages
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CHAT_DETAIL(chatId),
      });

      // Update chat title if returned
      if (response.title) {
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHATS });
      }
    },
    // Optimistic update for user message
    onMutate: async (data) => {
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.CHAT_DETAIL(chatId),
      });

      const previousChat = queryClient.getQueryData<ChatWithMessages>(
        QUERY_KEYS.CHAT_DETAIL(chatId)
      );

      // Optimistically add user message
      queryClient.setQueryData<ChatWithMessages>(
        QUERY_KEYS.CHAT_DETAIL(chatId),
        (old) => {
          if (!old) return old;
          return {
            ...old,
            messages: [
              ...old.messages,
              {
                id: 'temp-' + Date.now(),
                chat_id: chatId,
                role: 'user' as const,
                content: data.message,
                created_at: new Date().toISOString(),
              },
            ],
          };
        }
      );

      return { previousChat };
    },
    onError: (_err, _data, context) => {
      // Rollback on error
      if (context?.previousChat) {
        queryClient.setQueryData(
          QUERY_KEYS.CHAT_DETAIL(chatId),
          context.previousChat
        );
      }
    },
  });
}

/**
 * Hook to delete a chat
 */
export function useDeleteChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (chatId: string) => aiService.deleteChat(chatId),
    onSuccess: (_, chatId) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHATS });
      queryClient.removeQueries({ queryKey: QUERY_KEYS.CHAT_DETAIL(chatId) });
    },
  });
}

/**
 * Hook to update chat reports
 */
export function useUpdateChatReports(chatId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateChatReportsRequest) =>
      aiService.updateChatReports(chatId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CHAT_DETAIL(chatId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHATS });
    },
  });
}

// ============ ANALYSIS HOOKS ============

/**
 * Hook to extract report data
 */
export function useExtractReport() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reportId: string) => aiService.extractReport(reportId),
    onSuccess: (_, reportId) => {
      // Invalidate report to refetch with extracted data
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.REPORT_DETAIL(reportId),
      });
    },
  });
}

/**
 * Hook to analyze report (diabetes prediction)
 */
export function useAnalyzeReport() {
  return useMutation({
    mutationFn: (reportId: string) => aiService.analyzeReport(reportId),
  });
}

/**
 * Hook to summarize a case
 */
export function useSummarizeCase() {
  return useMutation({
    mutationFn: (caseId: string) => aiService.summarizeCase(caseId),
  });
}

/**
 * Hook to get patient insights
 */
export function usePatientInsights(patientId: string | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.INSIGHTS(patientId || ''),
    queryFn: () => aiService.getPatientInsights(patientId!),
    enabled: !!patientId,
    staleTime: 10 * 60 * 1000, // 10 minutes - insights don't change often
  });
}

/**
 * Hook to prefetch chat
 */
export function usePrefetchChat() {
  const queryClient = useQueryClient();

  return (chatId: string) => {
    queryClient.prefetchQuery({
      queryKey: QUERY_KEYS.CHAT_DETAIL(chatId),
      queryFn: () => aiService.getChatHistory(chatId),
      staleTime: 30 * 1000,
    });
  };
}

/**
 * Hook to explain selected text from a report using chat system
 */
export function useExplainText(reportId: string) {
  const chatIdRef = useRef<string | null>(null);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  const mutation = useMutation({
    mutationFn: async (selectedText: string) => {
      // Create or reuse chat session
      if (!chatIdRef.current) {
        setIsCreatingChat(true);
        const chat = await aiService.startChat({ report_ids: [reportId] });
        chatIdRef.current = chat.chat_id;
        setIsCreatingChat(false);
      }

      // Send explanation request
      const response = await aiService.sendMessage(chatIdRef.current, {
        message: `Please explain this medical term or finding from the report: "${selectedText}". Provide a clear, concise explanation suitable for a healthcare professional, including normal ranges if applicable.`,
      });

      return response;
    },
  });

  const reset = useCallback(() => {
    chatIdRef.current = null;
  }, []);

  return {
    ...mutation,
    isCreatingChat,
    reset,
  };
}
