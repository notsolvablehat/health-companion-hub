import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bot, MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getInitials } from '@/lib/utils';
import {
  ChatSidebar,
  ChatHeader,
  ChatMessages,
  ChatInput,
  NewChatDialog,
  AttachReportsDialog,
} from '@/components/chat';
import {
  useChats,
  useChatHistory,
  useStartChat,
  useSendMessage,
  useDeleteChat,
  useUpdateChatReports,
  useSendVoiceMessage,
} from '@/hooks/queries/useChatQueries';
import { useReports } from '@/hooks/queries/useReportQueries';
import { cn } from '@/lib/utils';
import type { VoiceLanguage } from '@/types/chat';

export default function PatientChat() {
  const { chatId } = useParams<{ chatId?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();

  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [showAttachDialog, setShowAttachDialog] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [readAloud, setReadAloud] = useState(false);

  // User initials for avatar
  const userInitials = profile && 'first_name' in profile
    ? getInitials(profile.first_name, profile.last_name)
    : '?';

  // Queries
  const { data: chatsData, isLoading: chatsLoading } = useChats();
  const { data: chatHistory, isLoading: historyLoading } = useChatHistory(chatId);
  const { data: reportsData, isLoading: reportsLoading } = useReports();

  // Mutations
  const startChat = useStartChat();
  const sendMessage = useSendMessage(chatId || '');
  const sendVoiceMessage = useSendVoiceMessage(chatId || '');
  const deleteChat = useDeleteChat();
  const updateReports = useUpdateChatReports(chatId || '');

  // Sort chats by updated_at (newest first)
  const sortedChats = [...(chatsData?.chats || [])].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  const handleSendMessage = async (message: string) => {
    if (!chatId) return;

    try {
      const response = await sendMessage.mutateAsync({ message });
      if (readAloud && response.response) {
        speakText(response.response);
      }
    } catch (error) {
      toast({
        title: 'Failed to send message',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleSendVoiceMessage = useCallback(async (audioBlob: Blob, language: VoiceLanguage) => {
    if (!chatId) return;

    try {
      const response = await sendVoiceMessage.mutateAsync({
        audioBlob,
        language,
      });
      if (readAloud && response.response) {
        speakText(response.response);
      }
    } catch (error) {
      toast({
        title: 'Failed to send voice message',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  }, [chatId, sendVoiceMessage, readAloud, toast]);

  const speakText = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.pitch = 1;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  const handleStartChat = async (reportIds?: string[]): Promise<string> => {
    const result = await startChat.mutateAsync({
      report_ids: reportIds,
    });
    navigate(`/patient/chat/${result.chat_id}`);
    return result.chat_id;
  };

  const handleDeleteChat = async (targetChatId: string) => {
    try {
      await deleteChat.mutateAsync(targetChatId);
      toast({
        title: 'Conversation deleted',
        description: 'The conversation has been removed.',
      });
      if (targetChatId === chatId) {
        navigate('/patient/chat');
      }
    } catch (error) {
      toast({
        title: 'Failed to delete',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleUpdateReports = async (
    reportIds: string[],
    action: 'add' | 'remove' | 'replace'
  ) => {
    await updateReports.mutateAsync({ report_ids: reportIds, action });
  };

  // Mobile: collapse sidebar when chat is selected
  useEffect(() => {
    if (chatId && window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }
  }, [chatId]);

  // Full-screen container — no app sidebar/header
  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      {/* Top Header Bar — always visible */}
      <ChatHeader
        chat={chatId ? chatHistory : null}
        onAttachReports={chatId ? () => setShowAttachDialog(true) : undefined}
        onDeleteChat={chatId ? () => handleDeleteChat(chatId) : undefined}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        showSidebarToggle={!!chatId}
        readAloud={readAloud}
        onToggleReadAloud={setReadAloud}
        dashboardPath="/patient/dashboard"
        userInitials={userInitials}
      />

      {/* Main content below header */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={cn(
          'md:flex shrink-0',
          chatId && sidebarCollapsed ? 'hidden' : 'flex',
          !chatId ? 'flex' : '',
          // On mobile when no chat, show full width
          !chatId && 'w-full md:w-auto',
        )}>
          <ChatSidebar
            chats={sortedChats}
            selectedChatId={chatId || null}
            onSelectChat={(id) => navigate(`/patient/chat/${id}`)}
            onNewChat={() => setShowNewChatDialog(true)}
            onDeleteChat={handleDeleteChat}
            isLoading={chatsLoading}
            isDeleting={deleteChat.isPending}
            collapsed={sidebarCollapsed && !!chatId}
            onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
          />
        </div>

        {/* Chat area */}
        {chatId ? (
          <div className={cn(
            'flex-1 flex flex-col overflow-hidden bg-background',
            !sidebarCollapsed && 'hidden md:flex'
          )}>
            <ChatMessages
              messages={chatHistory?.messages || []}
              isLoading={historyLoading}
              isSending={sendMessage.isPending || sendVoiceMessage.isPending}
            />

            <ChatInput
              onSend={handleSendMessage}
              onSendVoice={handleSendVoiceMessage}
              disabled={!chatId}
              isLoading={sendMessage.isPending}
              isVoiceProcessing={sendVoiceMessage.isPending}
              placeholder="Type a message or speak..."
            />
          </div>
        ) : (
          /* Empty state — no chat selected */
          <div className={cn(
            'flex-1 flex flex-col items-center justify-center',
            'hidden md:flex'
          )}>
            <div className="text-center p-8">
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
                <Bot className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-2">AI Health Assistant</h2>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Start a conversation to ask questions about your medical history,
                lab results, medications, or health concerns.
              </p>
              <Button onClick={() => setShowNewChatDialog(true)} size="lg">
                <MessageCircle className="w-5 h-5 mr-2" />
                Start New Chat
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Dialogs */}
      <NewChatDialog
        open={showNewChatDialog}
        onClose={() => setShowNewChatDialog(false)}
        onStartChat={handleStartChat}
        reports={reportsData?.reports || []}
        isLoadingReports={reportsLoading}
        isStarting={startChat.isPending}
      />

      {chatId && (
        <AttachReportsDialog
          open={showAttachDialog}
          onClose={() => setShowAttachDialog(false)}
          onUpdate={handleUpdateReports}
          reports={reportsData?.reports || []}
          currentlyAttached={chatHistory?.attached_report_ids || []}
          isLoadingReports={reportsLoading}
          isUpdating={updateReports.isPending}
        />
      )}
    </div>
  );
}
