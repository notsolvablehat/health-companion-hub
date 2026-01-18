import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  ReactNode,
} from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsService } from '@/services';
import { useAuth } from './AuthContext';
import type { Notification, NotificationResponse } from '@/types/notification';

interface NotificationContextValue {
  unreadCount: number;
  notifications: NotificationResponse | undefined;
  isLoading: boolean;
  markAsRead: (id: string, link?: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refetchNotifications: () => Promise<void>;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();

  // Poll for unread count every 60 seconds
  const { data: unreadData } = useQuery({
    queryKey: ['notifications', 'unread'],
    queryFn: notificationsService.getUnreadCount,
    enabled: isAuthenticated,
    refetchInterval: 60 * 1000, // 60 seconds
    retry: false,
  });

  // Fetch notifications list (only when needed, but prefetching can be useful)
  // Actually, we'll let the dropdown component trigger the fetch for the full list
  // but we keep the query definition here or just use query hook in the component.
  // For context, we might want to expose the data if we want to show latest notification toast etc.
  // For now, we'll focus on the shared state management.

  const markAsReadMutation = useMutation({
    mutationFn: notificationsService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: notificationsService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });

  const value = useMemo<NotificationContextValue>(
    () => ({
      unreadCount: unreadData?.count || 0,
      notifications: undefined, // Let component fetch full list
      isLoading: false,
      
      markAsRead: async (id: string, _link?: string) => {
        // Optimistic update could go here
        await markAsReadMutation.mutateAsync(id);
      },
      
      markAllAsRead: async () => {
        await markAllAsReadMutation.mutateAsync();
      },
      
      refetchNotifications: async () => {
        await queryClient.invalidateQueries({ queryKey: ['notifications'] });
      },
    }),
    [unreadData, markAsReadMutation, markAllAsReadMutation, queryClient]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}
