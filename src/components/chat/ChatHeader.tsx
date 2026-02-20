import { Link } from 'react-router-dom';
import { ArrowLeft, Bot, FileText, Paperclip, Trash2, Menu, Volume2, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
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
  readAloud?: boolean;
  onToggleReadAloud?: (enabled: boolean) => void;
  dashboardPath?: string;
  userInitials?: string;
}

export function ChatHeader({
  chat,
  patientName,
  onAttachReports,
  onDeleteChat,
  onToggleSidebar,
  showSidebarToggle,
  readAloud,
  onToggleReadAloud,
  dashboardPath = '/patient/dashboard',
  userInitials = '?',
}: ChatHeaderProps) {
  const reportCount = chat?.attached_report_ids?.length || 0;

  return (
    <header className="h-16 bg-background border-b border-border flex items-center justify-between px-4 lg:px-6 shrink-0 z-20">
      {/* Left: Back + Branding */}
      <div className="flex items-center gap-3">
        {/* Mobile sidebar toggle */}
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

        {/* Back to Dashboard */}
        <Link
          to={dashboardPath}
          className="flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="font-semibold text-sm hidden sm:inline">Dashboard</span>
        </Link>

        <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

        {/* AI branding */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Bot className="h-4 w-4" />
          </div>
          <h1 className="text-base lg:text-lg font-bold text-foreground">AI Health Assistant</h1>
        </div>

        {/* Patient name badge (for doctors) */}
        {patientName && (
          <>
            <div className="h-6 w-px bg-border mx-1 hidden md:block" />
            <span className="text-sm text-muted-foreground hidden md:inline">
              Patient: <span className="font-medium text-foreground">{patientName}</span>
            </span>
          </>
        )}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 lg:gap-3">
        {/* Attached reports count */}
        {reportCount > 0 && (
          <Badge variant="secondary" className="text-xs hidden sm:flex">
            <FileText className="h-3 w-3 mr-1" />
            {reportCount} {reportCount === 1 ? 'report' : 'reports'}
          </Badge>
        )}

        {/* Read Aloud Toggle */}
        {onToggleReadAloud && (
          <div className="hidden sm:flex items-center gap-2 bg-muted/50 px-3 py-1.5 rounded-full border border-border">
            <Label htmlFor="read-aloud" className="text-xs font-semibold cursor-pointer text-muted-foreground">
              Read Aloud
            </Label>
            <Switch
              id="read-aloud"
              checked={readAloud}
              onCheckedChange={onToggleReadAloud}
              className="scale-75"
            />
          </div>
        )}

        {/* Attach Reports */}
        {onAttachReports && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onAttachReports}
            className="h-8 w-8"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
        )}

        {/* Delete Chat */}
        {onDeleteChat && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Settings className="h-4 w-4" />
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

        {/* User Avatar */}
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {userInitials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
