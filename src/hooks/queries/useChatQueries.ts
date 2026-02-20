// src/hooks/queries/useChatQueries.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { chatService } from '@/services/chat';
import { QUERY_KEYS } from '@/lib/constants';
import type {
  ChatHistory,
  StartChatRequest,
  SendMessageRequest,
  SendVoiceMessageRequest,
} from '@/types/chat';

/**
 * Hook to list all user's chats
 */
export function useChats() {
  return useQuery({
    queryKey: QUERY_KEYS.CHATS,
    queryFn: () => chatService.listChats(),
    staleTime: 1 * 60 * 1000, // 1 minute
  });
}

/**
 * Hook to get chat history with messages
 */
export function useChatHistory(chatId: string | null | undefined) {
  return useQuery({
    queryKey: QUERY_KEYS.CHAT_DETAIL(chatId || ''),
    queryFn: () => chatService.getChatHistory(chatId!),
    enabled: !!chatId,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Hook to start a new chat
 */
export function useStartChat() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: StartChatRequest = {}) => chatService.startChat(data),
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
    mutationFn: (data: SendMessageRequest) => chatService.sendMessage(chatId, data),
    onSuccess: (response) => {
      // Invalidate chat to refetch messages
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CHAT_DETAIL(chatId),
      });

      // Update chat list (for updated_at timestamp and title)
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHATS });
    },
    // Optimistic update for user message
    onMutate: async (data) => {
      await queryClient.cancelQueries({
        queryKey: QUERY_KEYS.CHAT_DETAIL(chatId),
      });

      const previousChat = queryClient.getQueryData<ChatHistory>(
        QUERY_KEYS.CHAT_DETAIL(chatId)
      );

      // Optimistically add user message
      queryClient.setQueryData<ChatHistory>(
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
                timestamp: new Date().toISOString(),
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
    mutationFn: (chatId: string) => chatService.deleteChat(chatId),
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
    mutationFn: (data: { report_ids: string[]; action: 'add' | 'remove' | 'replace' }) =>
      chatService.updateReports(chatId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CHAT_DETAIL(chatId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHATS });
    },
  });
}

/**
 * Hook to send a voice message in a chat
 */
export function useSendVoiceMessage(chatId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SendVoiceMessageRequest) =>
      chatService.sendVoiceMessage(
        chatId,
        data.audioBlob,
        data.language,
        data.attachReportIds
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.CHAT_DETAIL(chatId),
      });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.CHATS });
    },
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
      queryFn: () => chatService.getChatHistory(chatId),
      staleTime: 30 * 1000,
    });
  };
}
