export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  link: string;
  is_read: boolean;
  created_at: string;
}

export interface NotificationResponse {
  total: number;
  unread_count: number;
  page: number;
  limit: number;
  items: Notification[];
}

export interface UnreadCountResponse {
  count: number;
}
