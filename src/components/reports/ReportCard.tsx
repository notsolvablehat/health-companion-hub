// src/components/reports/ReportCard.tsx

import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FileText, Image as ImageIcon, CheckCircle, Clock } from 'lucide-react';
import { formatDate, formatFileSize } from '@/lib/utils';
import type { Report } from '@/types/report';

interface ReportCardProps {
  report: Report;
  onClick: () => void;
}

export function ReportCard({ report, onClick }: ReportCardProps) {
  const isAnalyzed = !!report.mongo_analysis_id;
  const isPdf = report.file_type === 'pdf' || report.content_type === 'application/pdf';
  const Icon = isPdf ? FileText : ImageIcon;

  return (
    <Card 
      className="hover:shadow-lg transition-all cursor-pointer hover:border-primary/50"
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
              <h3 className="font-semibold truncate text-foreground">{report.file_name}</h3>
              <Badge 
                variant={isAnalyzed ? 'default' : 'secondary'} 
                className="shrink-0 gap-1"
              >
                {isAnalyzed ? (
                  <>
                    <CheckCircle className="w-3 h-3" />
                    Analyzed
                  </>
                ) : (
                  <>
                    <Clock className="w-3 h-3" />
                    Pending
                  </>
                )}
              </Badge>
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
  );
}

export default ReportCard;
