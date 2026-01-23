import { FileText, Paperclip, Trash2, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ChatHistory } from '@/types/chat';

interface ChatHeaderProps {
  chat: ChatHistory | null | undefined;
  patientName?: string;
  onAttachReports?: () => void;
  onDeleteChat?: () => void;
  onToggleSidebar?: () => void;
  showSidebarToggle?: boolean;
}

export function ChatHeader({
  chat,
  patientName,
  onAttachReports,
  onDeleteChat,
  onToggleSidebar,
  showSidebarToggle,
}: ChatHeaderProps) {
  const reportCount = chat?.attached_report_ids?.length || 0;

  return (
    <div className="border-b bg-background px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showSidebarToggle && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="h-8 w-8 md:hidden"
            >
              <Menu className="h-4 w-4" />
            </Button>
          )}
          
          <div>
            <h2 className="font-semibold text-lg leading-tight">
              {chat?.title || 'New Conversation'}
            </h2>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {patientName && (
                <span>Patient: {patientName}</span>
              )}
              {reportCount > 0 && (
                <Badge variant="secondary" className="text-xs">
                  <FileText className="h-3 w-3 mr-1" />
                  {reportCount} {reportCount === 1 ? 'report' : 'reports'} attached
                </Badge>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onAttachReports && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAttachReports}
            >
              <Paperclip className="h-4 w-4 mr-2" />
              Attach Reports
            </Button>
          )}

          {onDeleteChat && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={onDeleteChat}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Conversation
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </div>
  );
}
