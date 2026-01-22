// src/components/reports/ExplainModal.tsx

import { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Copy, Sparkles, FileText } from 'lucide-react';
import { useExplainText } from '@/hooks/queries/useAIQueries';
import { toast } from 'sonner';

interface ExplainModalProps {
  reportId: string;
  selectedText: string;
  open: boolean;
  onClose: () => void;
}

export function ExplainModal({ reportId, selectedText, open, onClose }: ExplainModalProps) {
  const { mutate: explain, data, isPending, error, reset } = useExplainText(reportId);

  // Trigger explanation when modal opens
  useEffect(() => {
    if (open && selectedText) {
      explain(selectedText);
    }
  }, [open, selectedText, explain]);

  // Reset on close
  const handleClose = () => {
    reset();
    onClose();
  };

  const handleCopy = () => {
    if (data?.response) {
      navigator.clipboard.writeText(data.response);
      toast.success('Explanation copied to clipboard');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Sparkles className="w-5 h-5 text-primary" />
            AI Explanation
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Selected Text */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              Selected Text:
            </p>
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm italic text-foreground">"{selectedText}"</p>
            </div>
          </div>

          <div className="border-t border-border" />

          {/* AI Explanation */}
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-2">
              AI Explanation:
            </p>
            
            {isPending && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">
                  Generating explanation...
                </span>
              </div>
            )}

            {error && (
              <div className="p-4 bg-destructive/10 text-destructive rounded-lg">
                <p className="text-sm">
                  Failed to generate explanation. Please try again.
                </p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="mt-2"
                  onClick={() => explain(selectedText)}
                >
                  Retry
                </Button>
              </div>
            )}

            {data && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm whitespace-pre-wrap text-foreground">{data.response}</p>
              </div>
            )}
          </div>

          {/* Actions */}
          {data && (
            <div className="flex items-center gap-2 pt-4">
              <Button variant="outline" size="sm" onClick={handleCopy}>
                <Copy className="w-4 h-4 mr-2" />
                Copy Explanation
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                disabled
                title="Coming soon"
              >
                <FileText className="w-4 h-4 mr-2" />
                Add to Notes
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default ExplainModal;
