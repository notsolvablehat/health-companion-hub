import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MessageCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
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
} from '@/hooks/queries/useChatQueries';
import { useReports } from '@/hooks/queries/useReportQueries';
import { cn } from '@/lib/utils';

export default function PatientChat() {
  const { chatId } = useParams<{ chatId?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [showAttachDialog, setShowAttachDialog] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Queries
  const { data: chatsData, isLoading: chatsLoading } = useChats();
  const { data: chatHistory, isLoading: historyLoading } = useChatHistory(chatId);
  const { data: reportsData, isLoading: reportsLoading } = useReports();

  // Mutations
  const startChat = useStartChat();
  const sendMessage = useSendMessage(chatId || '');
  const deleteChat = useDeleteChat();
  const updateReports = useUpdateChatReports(chatId || '');

  // Sort chats by updated_at (newest first)
  const sortedChats = [...(chatsData?.chats || [])].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
  );

  const handleSendMessage = async (message: string) => {
    if (!chatId) return;

    try {
      await sendMessage.mutateAsync({ message });
    } catch (error) {
      toast({
        title: 'Failed to send message',
        description: 'Please try again.',
        variant: 'destructive',
      });
    }
  };

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
      // If we deleted the current chat, navigate to chat list
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

  // Empty state - no chat selected
  if (!chatId) {
    return (
      <div className="flex h-[calc(100vh-8rem)]">
        <ChatSidebar
          chats={sortedChats}
          selectedChatId={null}
          onSelectChat={(id) => navigate(`/patient/chat/${id}`)}
          onNewChat={() => setShowNewChatDialog(true)}
          onDeleteChat={handleDeleteChat}
          isLoading={chatsLoading}
          isDeleting={deleteChat.isPending}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />

        <Card className={cn(
          'flex-1 flex flex-col items-center justify-center',
          sidebarCollapsed ? '' : 'hidden md:flex'
        )}>
          <div className="text-center p-8">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <MessageCircle className="w-10 h-10 text-primary" />
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
        </Card>

        <NewChatDialog
          open={showNewChatDialog}
          onClose={() => setShowNewChatDialog(false)}
          onStartChat={handleStartChat}
          reports={reportsData?.reports || []}
          isLoadingReports={reportsLoading}
          isStarting={startChat.isPending}
        />
      </div>
    );
  }

  // Chat view
  return (
    <div className="flex h-[calc(100vh-8rem)]">
      <div className={cn('md:block', sidebarCollapsed ? 'hidden' : 'block w-full md:w-auto')}>
        <ChatSidebar
          chats={sortedChats}
          selectedChatId={chatId}
          onSelectChat={(id) => navigate(`/patient/chat/${id}`)}
          onNewChat={() => setShowNewChatDialog(true)}
          onDeleteChat={handleDeleteChat}
          isLoading={chatsLoading}
          isDeleting={deleteChat.isPending}
          collapsed={sidebarCollapsed}
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
      </div>

      <Card className={cn(
        'flex-1 flex flex-col overflow-hidden',
        !sidebarCollapsed && 'hidden md:flex'
      )}>
        <ChatHeader
          chat={chatHistory}
          onAttachReports={() => setShowAttachDialog(true)}
          onDeleteChat={() => handleDeleteChat(chatId)}
          onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
          showSidebarToggle={true}
        />

        <ChatMessages
          messages={chatHistory?.messages || []}
          isLoading={historyLoading}
          isSending={sendMessage.isPending}
        />

        <ChatInput
          onSend={handleSendMessage}
          disabled={!chatId}
          isLoading={sendMessage.isPending}
          placeholder="Ask about your health, lab results, medications..."
        />
      </Card>

      <NewChatDialog
        open={showNewChatDialog}
        onClose={() => setShowNewChatDialog(false)}
        onStartChat={handleStartChat}
        reports={reportsData?.reports || []}
        isLoadingReports={reportsLoading}
        isStarting={startChat.isPending}
      />

      <AttachReportsDialog
        open={showAttachDialog}
        onClose={() => setShowAttachDialog(false)}
        onUpdate={handleUpdateReports}
        reports={reportsData?.reports || []}
        currentlyAttached={chatHistory?.attached_report_ids || []}
        isLoadingReports={reportsLoading}
        isUpdating={updateReports.isPending}
      />
    </div>
  );
}
