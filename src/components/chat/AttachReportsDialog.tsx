import { useState, useEffect } from 'react';
import { FileText, Loader2, Check } from 'lucide-react';
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

interface AttachReportsDialogProps {
  open: boolean;
  onClose: () => void;
  onUpdate: (reportIds: string[], action: 'add' | 'remove' | 'replace') => Promise<void>;
  reports?: Report[];
  currentlyAttached: string[];
  isLoadingReports?: boolean;
  isUpdating?: boolean;
}

export function AttachReportsDialog({
  open,
  onClose,
  onUpdate,
  reports = [],
  currentlyAttached,
  isLoadingReports = false,
  isUpdating = false,
}: AttachReportsDialogProps) {
  const [selectedReports, setSelectedReports] = useState<string[]>([]);
  const { toast } = useToast();

  // Sync with currently attached when dialog opens
  useEffect(() => {
    if (open) {
      setSelectedReports(currentlyAttached);
    }
  }, [open, currentlyAttached]);

  const handleToggleReport = (reportId: string) => {
    setSelectedReports((prev) =>
      prev.includes(reportId)
        ? prev.filter((id) => id !== reportId)
        : [...prev, reportId]
    );
  };

  const handleSave = async () => {
    try {
      await onUpdate(selectedReports, 'replace');
      toast({
        title: 'Reports updated',
        description: `${selectedReports.length} report${selectedReports.length !== 1 ? 's' : ''} attached to this chat.`,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Failed to update reports',
        description: 'Please try again later.',
        variant: 'destructive',
      });
    }
  };

  const hasChanges = JSON.stringify(selectedReports.sort()) !== JSON.stringify(currentlyAttached.sort());

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Manage Attached Reports
          </DialogTitle>
          <DialogDescription>
            Select which reports to include in this conversation's context.
            The AI will reference these when answering questions.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-64 border rounded-md p-2">
          {isLoadingReports ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : reports.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-4">
              <FileText className="h-8 w-8 text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No reports available</p>
            </div>
          ) : (
            <div className="space-y-2">
              {reports.map((report) => {
                const isSelected = selectedReports.includes(report.id);
                return (
                  <label
                    key={report.id}
                    className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 cursor-pointer"
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggleReport(report.id)}
                      className="mt-0.5"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span className="text-sm font-medium truncate">
                          {report.file_name || 'Untitled Report'}
                        </span>
                        {currentlyAttached.includes(report.id) && (
                          <Check className="h-3 w-3 text-success flex-shrink-0" />
                        )}
                      </div>
                      {report.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">
                          {report.description}
                        </p>
                      )}
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </ScrollArea>

        <p className="text-xs text-muted-foreground">
          {selectedReports.length} of {reports.length} reports selected
        </p>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isUpdating || !hasChanges}>
            {isUpdating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
