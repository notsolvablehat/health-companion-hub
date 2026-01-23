// src/components/reports/ReportCard.tsx

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  FileText, 
  Image as ImageIcon, 
  CheckCircle, 
  Clock, 
  MoreVertical, 
  Share2 
} from 'lucide-react';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { formatDate, formatFileSize } from '@/lib/utils';
import type { Report } from '@/types/report';
import { ShareDialog } from '@/components/sharing/ShareDialog';

interface ReportCardProps {
  report: Report;
  onClick: () => void;
}

export function ReportCard({ report, onClick }: ReportCardProps) {
  const [isShareOpen, setIsShareOpen] = useState(false);
  const isAnalyzed = !!report.mongo_analysis_id;
  const isPdf = report.file_type === 'pdf' || report.content_type === 'application/pdf';
  const Icon = isPdf ? FileText : ImageIcon;

  const handleShareClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsShareOpen(true);
  };

  return (
    <>
      <Card 
        className="hover:shadow-lg transition-all cursor-pointer hover:border-primary/50 relative group"
        onClick={onClick}
      >
        <CardContent className="pt-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="p-3 bg-primary/10 rounded-lg shrink-0">
              <Icon className="w-6 h-6 text-primary" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="min-w-0 flex-1">
                   <h3 className="font-semibold truncate text-foreground pr-2" title={report.file_name}>
                    {report.file_name}
                  </h3>
                </div>
                
                <div className="flex items-center gap-2 shrink-0">
                  <Badge 
                    variant={isAnalyzed ? 'default' : 'secondary'} 
                    className="gap-1"
                  >
                    {isAnalyzed ? (
                      <>
                        <CheckCircle className="w-3 h-3" />
                        <span className="hidden sm:inline">Analyzed</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3" />
                        <span className="hidden sm:inline">Pending</span>
                      </>
                    )}
                  </Badge>

                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        className="h-6 w-6 p-0 hover:bg-muted" 
                        onClick={(e) => e.stopPropagation()}
                      >
                        <span className="sr-only">Open menu</span>
                        <MoreVertical className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={handleShareClick}>
                        <Share2 className="mr-2 h-4 w-4" />
                        Share
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              {report.description && (
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {report.description}
                </p>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                {report.patient_name && (
                  <>
                    <span className="font-medium">{report.patient_name}</span>
                    <span>•</span>
                  </>
                )}
                <span>{formatDate(report.created_at)}</span>
                {report.file_size_bytes && (
                  <>
                    <span>•</span>
                    <span>{formatFileSize(report.file_size_bytes)}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <ShareDialog 
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        resourceType="report"
        resourceId={report.id}
        resourceName={report.file_name}
      />
    </>
  );
}

export default ReportCard;
