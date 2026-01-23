import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Copy, Loader2, Link as LinkIcon, Check } from 'lucide-react';
import { useCreateShareLink } from '@/hooks/queries/useSharingQueries';
import { toast } from 'sonner';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  resourceType: 'report' | 'document';
  resourceId: string;
  resourceName: string;
}

export function ShareDialog({
  isOpen,
  onClose,
  resourceType,
  resourceId,
  resourceName,
}: ShareDialogProps) {
  const [expiryHours, setExpiryHours] = useState('24');
  const [generatedLink, setGeneratedLink] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const { mutate: createLink, isPending } = useCreateShareLink();

  const handleGenerate = () => {
    createLink(
      {
        resource_type: resourceType,
        resource_id: resourceId,
        expires_in_hours: parseInt(expiryHours),
      },
      {
        onSuccess: (data) => {
          setGeneratedLink(data.share_link);
        },
      }
    );
  };

  const handleCopy = () => {
    if (generatedLink) {
      navigator.clipboard.writeText(generatedLink);
      setCopied(true);
      toast.success('Link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setGeneratedLink(null);
    setCopied(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share File</DialogTitle>
          <DialogDescription>
            Create a secure, temporary link to share "{resourceName}".
          </DialogDescription>
        </DialogHeader>

        {!generatedLink ? (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expiry" className="text-right">
                Expires in
              </Label>
              <Select
                value={expiryHours}
                onValueChange={setExpiryHours}
                disabled={isPending}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select duration" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Hour</SelectItem>
                  <SelectItem value="12">12 Hours</SelectItem>
                  <SelectItem value="24">24 Hours (1 Day)</SelectItem>
                  <SelectItem value="72">72 Hours (3 Days)</SelectItem>
                  <SelectItem value="168">168 Hours (7 Days)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        ) : (
          <div className="flex items-center space-x-2 py-4">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="link" className="sr-only">
                Link
              </Label>
              <div className="relative">
                <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="link"
                  defaultValue={generatedLink}
                  readOnly
                  className="pl-9 pr-12"
                />
              </div>
            </div>
            <Button size="icon" onClick={handleCopy} className="px-3">
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        )}

        <DialogFooter className="sm:justify-between sm:space-x-2">
           <Button variant="ghost" onClick={handleClose}>
              Close
            </Button>
          {!generatedLink && (
            <Button onClick={handleGenerate} disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Generate Link
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
