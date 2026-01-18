import { api } from './api';
import type { NotificationResponse, UnreadCountResponse } from '@/types/notification';

export const notificationsService = {
  getUnreadCount: async (): Promise<{ count: number }> => {
    const response = await api.get<UnreadCountResponse>('/notifications/unread-count');
    return response.data;
  },

  getNotifications: async (page = 1, limit = 20, unreadOnly = false): Promise<NotificationResponse> => {
    const response = await api.get<NotificationResponse>('/notifications', {
      params: { page, limit, unread_only: unreadOnly },
    });
    return response.data;
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await api.patch(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.patch('/notifications/read-all');
  },
};

export default notificationsService;
