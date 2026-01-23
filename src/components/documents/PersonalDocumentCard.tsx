import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { 
  FileText, 
  Image as ImageIcon, 
  MoreVertical, 
  Download, 
  Share2, 
  Trash2,
  Loader2 
} from 'lucide-react';
import { format } from 'date-fns';
import { PersonalDocument } from '@/types/document';
// import { documentsService } from '@/services/documents'; // Will use direct call or hook?
// Better to use a small local handler or custom hook if we want loading state.
import { documentsService } from '@/services/documents';
import { useDeleteDocument } from '@/hooks/queries/useDocumentQueries';
import { ShareDialog } from '@/components/sharing/ShareDialog';
import { toast } from 'sonner';

interface PersonalDocumentCardProps {
  document: PersonalDocument;
}

export function PersonalDocumentCard({ document }: PersonalDocumentCardProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const { mutate: deleteDoc } = useDeleteDocument();

  const handleDownload = async (e: React.Event) => {
    e.preventDefault(); // Prevent menu from closing immediately
    
    if (isDownloading) return;

    setIsDownloading(true);
    try {
      const { download_url } = await documentsService.getDownloadUrl(document.id);
      window.open(download_url, '_blank');
      setIsMenuOpen(false); // Close menu after successful download initiation
    } catch (error) {
      console.error('Download failed', error);
      toast.error('Failed to get download URL');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this document?')) {
      deleteDoc(document.id);
    }
  };

  const getIcon = () => {
    if (document.file_type === 'pdf') return <FileText className="h-10 w-10 text-red-500" />;
    return <ImageIcon className="h-10 w-10 text-blue-500" />;
  };

  const formatSize = (bytes?: number) => {
    if (!bytes) return 'Unknown size';
    const mb = bytes / (1024 * 1024);
    if (mb < 1) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
          <div className="flex items-center space-x-4">
            <div className="bg-muted p-2 rounded-lg">
              {getIcon()}
            </div>
            <div>
              <CardTitle className="text-base font-medium line-clamp-1" title={document.file_name}>
                {document.file_name}
              </CardTitle>
              <p className="text-sm text-muted-foreground capitalize">
                {document.category}
              </p>
            </div>
          </div>
          <DropdownMenu open={isMenuOpen} onOpenChange={setIsMenuOpen}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={handleDownload} disabled={isDownloading}>
                {isDownloading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Download className="mr-2 h-4 w-4" />
                )}
                {isDownloading ? 'Downloading...' : 'Download'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setIsShareOpen(true)}>
                <Share2 className="mr-2 h-4 w-4" />
                Share
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleDelete} className="text-destructive focus:text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground mt-2">
            <div>
              <p className="font-semibold">Uploaded</p>
              <p>{format(new Date(document.created_at), 'MMM d, yyyy')}</p>
            </div>
            <div>
              <p className="font-semibold">Size</p>
              <p>{formatSize(document.file_size_bytes)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <ShareDialog
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        resourceType="document"
        resourceId={document.id}
        resourceName={document.file_name}
      />
    </>
  );
}
