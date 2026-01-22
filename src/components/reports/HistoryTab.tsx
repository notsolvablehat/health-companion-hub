// src/components/reports/HistoryTab.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, FileText, User, Calendar, Sparkles, Upload } from 'lucide-react';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import type { Report } from '@/types/report';

interface HistoryTabProps {
  report: Report;
}

export function HistoryTab({ report }: HistoryTabProps) {
  // Build timeline from report data
  const timeline = [
    {
      id: 'upload',
      icon: Upload,
      title: 'Report Uploaded',
      description: `File "${report.file_name}" was uploaded`,
      timestamp: report.created_at,
      variant: 'default' as const,
    },
    ...(report.mongo_analysis_id ? [{
      id: 'analyzed',
      icon: Sparkles,
      title: 'AI Analysis Complete',
      description: 'Report was analyzed with AI extraction and prediction',
      timestamp: report.updated_at || report.created_at,
      variant: 'success' as const,
    }] : []),
  ];

  return (
    <div className="space-y-6">
      {/* Report Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <FileText className="w-5 h-5 text-primary" />
            Report Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Filename:</span>
                <span className="font-medium text-foreground">{report.file_name}</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Uploaded:</span>
                <span className="font-medium text-foreground">{formatDate(report.created_at)}</span>
              </div>
              {report.patient_name && (
                <div className="flex items-center gap-2 text-sm">
                  <User className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Patient:</span>
                  <span className="font-medium text-foreground">{report.patient_name}</span>
                </div>
              )}
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Type:</span>
                <Badge variant="outline">{report.file_type || 'pdf'}</Badge>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={report.mongo_analysis_id ? 'default' : 'secondary'}>
                  {report.mongo_analysis_id ? 'Analyzed' : 'Pending'}
                </Badge>
              </div>
              {report.description && (
                <div className="flex items-start gap-2 text-sm">
                  <span className="text-muted-foreground">Description:</span>
                  <span className="text-foreground">{report.description}</span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Clock className="w-5 h-5 text-primary" />
            Activity Timeline
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
            
            <div className="space-y-6">
              {timeline.map((event, index) => {
                const Icon = event.icon;
                return (
                  <div key={event.id} className="relative flex gap-4">
                    {/* Icon */}
                    <div className={`
                      relative z-10 flex items-center justify-center w-8 h-8 rounded-full
                      ${event.variant === 'success' ? 'bg-success/20 text-success' : 'bg-primary/20 text-primary'}
                    `}>
                      <Icon className="w-4 h-4" />
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1 pb-2">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-medium text-foreground">{event.title}</h4>
                        <span className="text-xs text-muted-foreground">
                          {formatRelativeTime(event.timestamp)}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDate(event.timestamp, { 
                          year: 'numeric', 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {timeline.length === 1 && (
            <p className="text-sm text-muted-foreground text-center mt-4 pt-4 border-t border-border">
              More activity will appear here as the report is analyzed and reviewed.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default HistoryTab;
