import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bot, MessageCircle, Users, Loader2 } from 'lucide-react';
import type { VoiceLanguage } from '@/types/chat';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { getInitials } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Checkbox } from '@/components/ui/checkbox';
import { FileText } from 'lucide-react';
import {
  ChatSidebar,
  ChatHeader,
  ChatMessages,
  ChatInput,
  AttachReportsDialog,
} from '@/components/chat';
import {
  useChats,
  useChatHistory,
  useStartChat,
  useSendMessage,
  useSendVoiceMessage,
  useDeleteChat,
  useUpdateChatReports,
} from '@/hooks/queries/useChatQueries';
import { useMyPatients } from '@/hooks/queries/useAssignmentQueries';
import { usePatientReports } from '@/hooks/queries/useReportQueries';
import { cn } from '@/lib/utils';

export default function DoctorChat() {
  const { chatId } = useParams<{ chatId?: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { profile } = useAuth();

  const [showNewChatDialog, setShowNewChatDialog] = useState(false);
  const [showAttachDialog, setShowAttachDialog] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [readAloud, setReadAloud] = useState(false);
  
  // New chat dialog state
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');
  const [selectedReportIds, setSelectedReportIds] = useState<string[]>([]);

  // User initials for avatar
  const userInitials = profile && 'first_name' in profile
    ? getInitials(profile.first_name, profile.last_name)
    : '?';

  // Queries
  const { data: chatsData, isLoading: chatsLoading } = useChats();
  const { data: chatHistory, isLoading: historyLoading } = useChatHistory(chatId);
  const { data: patientsData, isLoading: patientsLoading } = useMyPatients();
  const { data: patientReportsData, isLoading: patientReportsLoading } = usePatientReports(
    selectedPatientId || undefined
  );
  
  // Reports for current chat's patient
  const currentPatientId = chatHistory?.patient_id;
  const { data: currentPatientReports } = usePatientReports(currentPatientId || undefined);

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

  // Get patient name for current chat
  const currentPatientName = useMemo(() => {
    if (!currentPatientId || !patientsData?.patients) return undefined;
    const patient = patientsData.patients.find((p) => p.patient_id === currentPatientId);
    return patient?.name;
  }, [currentPatientId, patientsData]);

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

  const handleStartChat = async () => {
    if (!selectedPatientId) {
      toast({
        title: 'Select a patient',
        description: 'Please select a patient to start a chat.',
        variant: 'destructive',
      });
      return;
    }

    try {
      const result = await startChat.mutateAsync({
        patient_id: selectedPatientId,
        report_ids: selectedReportIds.length > 0 ? selectedReportIds : undefined,
      });
      setShowNewChatDialog(false);
      setSelectedPatientId('');
      setSelectedReportIds([]);
      navigate(`/doctor/chat/${result.chat_id}`);
    } catch (error) {
      toast({
        title: 'Failed to start chat',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteChat = async (targetChatId: string) => {
    try {
      await deleteChat.mutateAsync(targetChatId);
      toast({
        title: 'Conversation deleted',
        description: 'The conversation has been removed.',
      });
      if (targetChatId === chatId) {
        navigate('/doctor/chat');
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

  const handleToggleReport = (reportId: string) => {
    setSelectedReportIds((prev) =>
      prev.includes(reportId)
        ? prev.filter((id) => id !== reportId)
        : [...prev, reportId]
    );
  };

  // Reset selected reports when patient changes
  useEffect(() => {
    setSelectedReportIds([]);
  }, [selectedPatientId]);

  // Mobile: collapse sidebar when chat is selected
  useEffect(() => {
    if (chatId && window.innerWidth < 768) {
      setSidebarCollapsed(true);
    }
  }, [chatId]);

  const handleCloseNewDialog = () => {
    setShowNewChatDialog(false);
    setSelectedPatientId('');
    setSelectedReportIds([]);
  };

  // Full-screen container — no app sidebar/header
  return (
    <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
      {/* Top Header Bar — always visible */}
      <ChatHeader
        chat={chatId ? chatHistory : null}
        patientName={currentPatientName}
        onAttachReports={chatId ? () => setShowAttachDialog(true) : undefined}
        onDeleteChat={chatId ? () => handleDeleteChat(chatId) : undefined}
        onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)}
        showSidebarToggle={!!chatId}
        readAloud={readAloud}
        onToggleReadAloud={setReadAloud}
        dashboardPath="/doctor/dashboard"
        userInitials={userInitials}
      />

      {/* Main content below header */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className={cn(
          'md:flex shrink-0',
          chatId && sidebarCollapsed ? 'hidden' : 'flex',
          !chatId ? 'flex' : '',
          !chatId && 'w-full md:w-auto',
        )}>
          <ChatSidebar
            chats={sortedChats}
            selectedChatId={chatId || null}
            onSelectChat={(id) => navigate(`/doctor/chat/${id}`)}
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
              <h2 className="text-2xl font-bold mb-2">AI Clinical Assistant</h2>
              <p className="text-muted-foreground mb-6 max-w-sm">
                Start a conversation about a patient's medical history, get AI-powered
                insights, and quickly understand patient trends.
              </p>
              <Button onClick={() => setShowNewChatDialog(true)} size="lg">
                <MessageCircle className="w-5 h-5 mr-2" />
                Start New Chat
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Doctor-specific New Chat Dialog */}
      <Dialog open={showNewChatDialog} onOpenChange={handleCloseNewDialog}>
        <DialogContent className="">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              New Patient Consultation
            </DialogTitle>
            <DialogDescription>
              Select a patient to start an AI-assisted consultation about their medical history.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Patient Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Patient *</label>
              <Select value={selectedPatientId} onValueChange={setSelectedPatientId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a patient..." />
                </SelectTrigger>
                <SelectContent>
                  {patientsLoading ? (
                    <div className="flex items-center justify-center p-4">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  ) : patientsData?.patients?.length === 0 ? (
                    <div className="p-4 text-center text-sm text-muted-foreground">
                      <Users className="h-6 w-6 mx-auto mb-2" />
                      No assigned patients
                    </div>
                  ) : (
                    patientsData?.patients?.map((patient) => (
                      <SelectItem key={patient.patient_id} value={patient.patient_id}>
                        {patient.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Report Selection (only show after patient is selected) */}
            {selectedPatientId && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Attach Reports (Optional)</label>
                <ScrollArea className="h-40 border rounded-md p-2">
                  {patientReportsLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : !patientReportsData?.reports?.length ? (
                    <div className="flex flex-col items-center justify-center h-full text-center p-4">
                      <FileText className="h-6 w-6 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">No reports for this patient</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {patientReportsData.reports.map((report) => (
                        <label
                          key={report.id}
                          className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                        >
                          <Checkbox
                            checked={selectedReportIds.includes(report.id)}
                            onCheckedChange={() => handleToggleReport(report.id)}
                            className="mt-0.5"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                              <span className="text-sm font-medium truncate">
                                {report.file_name || 'Untitled Report'}
                              </span>
                            </div>
                            {report.description && (
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                {report.description}
                              </p>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </ScrollArea>
                {selectedReportIds.length > 0 && (
                  <p className="text-xs text-muted-foreground">
                    {selectedReportIds.length} report{selectedReportIds.length !== 1 && 's'} selected
                  </p>
                )}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={handleCloseNewDialog} disabled={startChat.isPending}>
              Cancel
            </Button>
            <Button
              onClick={handleStartChat}
              disabled={!selectedPatientId || startChat.isPending}
            >
              {startChat.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                'Start Chat'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {chatId && (
        <AttachReportsDialog
          open={showAttachDialog}
          onClose={() => setShowAttachDialog(false)}
          onUpdate={handleUpdateReports}
          reports={currentPatientReports?.reports || []}
          currentlyAttached={chatHistory?.attached_report_ids || []}
          isLoadingReports={false}
          isUpdating={updateReports.isPending}
        />
      )}
    </div>
  );
}
