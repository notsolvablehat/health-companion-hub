import { useState } from 'react';
import { MessageCircle, FileText, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useToast } from '@/hooks/use-toast';
import type { Report } from '@/types/report';

interface NewChatDialogProps {
  open: boolean;
  onClose: () => void;
  onStartChat: (reportIds?: string[]) => Promise<string>;
  reports?: Report[];
  isLoadingReports?: boolean;
  isStarting?: boolean;
}

export function NewChatDialog({
  open,
  onClose,
  onStartChat,
  reports = [],
  isLoadingReports = false,
  isStarting = false,
}: NewChatDialogProps) {
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const { toast } = useToast();

  const handleToggleReport = (reportId: string) => {
    setSelectedReports((prev) =>
      prev.includes(reportId)
        ? prev.filter((id) => id !== reportId)
        : [...prev, reportId]
    );
  };

  const handleSelectAll = () => {
    if (selectedReports.length === reports.length) {
      setSelectedReports([]);
    } else {
      setSelectedReports(reports.map((r) => r.id));
    }
  };

  const handleStart = async () => {
    try {
      const chatId = await onStartChat(
        selectedReports.length > 0 ? selectedReports : undefined
      );
      setSelectedReports([]);
      onClose();
    } catch (error) {
      toast({
        title: 'Failed to start chat',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const handleClose = () => {
    setSelectedReports([]);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            New Conversation
          </DialogTitle>
          <DialogDescription>
            Start a new AI chat about your medical history. You can optionally
            select specific reports to focus the conversation.
          </DialogDescription>
        </DialogHeader>

        {reports.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium">Attach Reports (Optional)</p>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSelectAll}
                className="h-7 text-xs"
              >
                {selectedReports.length === reports.length
                  ? 'Deselect All'
                  : 'Select All'}
              </Button>
            </div>

            <ScrollArea className="h-48 border rounded-md p-2">
              {isLoadingReports ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : (
                <div className="space-y-2">
                  {reports.map((report) => (
                    <label
                      key={report.id}
                      className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedReports.includes(report.id)}
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

            {selectedReports.length > 0 && (
              <p className="text-xs text-muted-foreground">
                {selectedReports.length} report{selectedReports.length !== 1 && 's'} selected
              </p>
            )}
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={isStarting}>
            Cancel
          </Button>
          <Button onClick={handleStart} disabled={isStarting}>
            {isStarting ? (
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
  );
}
