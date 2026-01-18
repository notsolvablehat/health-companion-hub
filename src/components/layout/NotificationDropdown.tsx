import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { Bell, Check, Loader2, Info, AlertCircle, FileText, UserPlus, FileCheck } from 'lucide-react';
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
import { useNotification } from '@/contexts/NotificationContext';
import { notificationsService } from '@/services';
import type { Notification } from '@/types/notification';

export function NotificationDropdown() {
  const navigate = useNavigate();
  const { markAsRead, markAllAsRead, unreadCount } = useNotification();
  const [isOpen, setIsOpen] = useState(false);

  // Fetch notifications when dropdown opens (or we could just fetch always)
  // For better UX, we'll fetch when mounted but re-fetch can be triggered manually
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['notifications', 'list'],
    queryFn: () => notificationsService.getNotifications(1, 20),
    // We can rely on global state invalidation, but here we explicitly refetch when needed
    staleTime: 1000 * 60, // 1 minute
  });

  const handleNotificationClick = async (notification: Notification) => {
    try {
      if (!notification.is_read) {
        await markAsRead(notification.id);
      }
      if (notification.link) {
        navigate(notification.link);
      }
    } catch (error) {
      console.error('Failed to handle notification click:', error);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'case_status_changed':
        return <FileCheck className="w-4 h-4 text-blue-500" />;
      case 'case_needs_approval':
        return <AlertCircle className="w-4 h-4 text-amber-500" />;
      case 'new_report_uploaded':
        return <FileText className="w-4 h-4 text-purple-500" />;
      case 'doctor_assigned':
        return <UserPlus className="w-4 h-4 text-green-500" />;
      case 'new_case_assigned':
        return <FileText className="w-4 h-4 text-blue-500" />;
      default:
        return <Info className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <DropdownMenuContent align="end" className="w-80 p-0" forceMount>
      <DropdownMenuLabel className="flex items-center justify-between p-4">
        <span className="font-semibold">Notifications</span>
        {unreadCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            className="text-xs h-auto py-1 px-2"
            onClick={() => markAllAsRead()}
          >
            Mark all read
          </Button>
        )}
      </DropdownMenuLabel>
      <DropdownMenuSeparator />

      <ScrollArea className="h-[350px]">
        {isLoading ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-2" />
            <span>Loading...</span>
          </div>
        ) : data?.items?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
            <Bell className="w-10 h-10 mb-3 opacity-20" />
            <p className="text-sm">No notifications yet</p>
          </div>
        ) : (
          <div className="py-2">
            {data?.items.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`flex items-start gap-3 p-3 mx-2 rounded-lg cursor-pointer my-1 focus:bg-accent ${
                  !notification.is_read ? 'bg-primary/5' : ''
                }`}
                onClick={() => handleNotificationClick(notification)}
              >
                <div className="mt-1 flex-shrink-0">
                  {getIcon(notification.type)}
                </div>
                <div className="flex-1 space-y-1">
                  <p className={`text-sm leading-none ${!notification.is_read ? 'font-semibold' : 'font-medium'}`}>
                    {notification.title}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    {notification.message}
                  </p>
                  <p className="text-[10px] text-muted-foreground/70">
                    {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                  </p>
                </div>
                {!notification.is_read && (
                  <div className="w-2 h-2 mt-2 rounded-full bg-primary flex-shrink-0" />
                )}
              </DropdownMenuItem>
            ))}
          </div>
        )}
      </ScrollArea>
    </DropdownMenuContent>
  );
}
