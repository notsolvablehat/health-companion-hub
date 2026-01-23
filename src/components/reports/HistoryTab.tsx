// src/components/reports/HistoryTab.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Clock, 
  FileText, 
  User, 
  Calendar, 
  Sparkles, 
  Upload, 
  Activity, 
  Download,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { formatDate, formatRelativeTime } from '@/lib/utils';
import type { Report, ActivityType, ReportActivity } from '@/types/report';
import { useReportActivity } from '@/hooks/queries/useReportQueries';

interface HistoryTabProps {
  report: Report;
}

const activityIcons: Record<ActivityType, any> = {
  upload: Upload,
  analysis: Activity,
  extraction: FileText,
  explanation_request: Sparkles,
  download: Download,
};

export function HistoryTab({ report }: HistoryTabProps) {
  const { data: activityData, isLoading, error } = useReportActivity(report.id);

  const formatActivityTitle = (type: ActivityType) => {
    switch (type) {
      case 'upload': return 'Report Uploaded';
      case 'analysis': return 'AI Analysis Performed';
      case 'extraction': return 'Data Extraction';
      case 'explanation_request': return 'Explanation Requested';
      case 'download': return 'Report Downloaded';
      default: return 'Activity';
    }
  };

  const formatActivityDescription = (activity: ReportActivity) => {
    if (activity.activity_type === 'upload') {
      return `File "${report.file_name}" was uploaded by ${activity.user_role}`;
    }
    
    if (activity.activity_type === 'explanation_request' && activity.metadata?.selected_text) {
      const text = activity.metadata.selected_text;
      return `Asked for explanation of: "${text.substring(0, 50)}${text.length > 50 ? '...' : ''}"`;
    }

    if (activity.activity_type === 'analysis') {
      return activity.status === 'failed' 
        ? 'Analysis failed to complete' 
        : 'Medical analysis and diabetes risk assessment completed';
    }

    return activity.metadata?.description || 'Activity recorded';
  };

  // Combine real activities with basic fallbacks if loading or empty
  const activities = activityData?.activities || [];

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
          {isLoading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <div className="text-center p-8 text-destructive">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2" />
              <p>Failed to load activity history</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-border" />
              
              <div className="space-y-6">
                {activities.length === 0 && (
                  // Fallback if no activities returned (should at least have upload)
                  <div className="relative flex gap-4">
                    <div className="relative z-10 flex items-center justify-center w-8 h-8 rounded-full bg-muted text-muted-foreground">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="pt-1">
                      <p className="text-sm text-muted-foreground">No detailed tracking data available.</p>
                    </div>
                  </div>
                )}

                {activities.map((activity, index) => {
                  const Icon = activityIcons[activity.activity_type] || Clock;
                  const isSuccess = activity.status === 'completed';
                  const isFailed = activity.status === 'failed';

                  return (
                    <div key={`${activity.activity_type}-${activity.timestamp}-${index}`} className="relative flex gap-4">
                      {/* Icon */}
                      <div className={`
                        relative z-10 flex items-center justify-center w-8 h-8 rounded-full
                        ${isFailed ? 'bg-destructive/10 text-destructive' : 
                          isSuccess ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}
                      `}>
                        <Icon className="w-4 h-4" />
                      </div>
                      
                      {/* Content */}
                      <div className="flex-1 pb-2">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h4 className="font-medium text-foreground">
                            {formatActivityTitle(activity.activity_type)}
                          </h4>
                          <span className="text-xs text-muted-foreground">
                            {formatRelativeTime(activity.timestamp)}
                          </span>
                        </div>
                        
                        <p className="text-sm text-muted-foreground">
                          {formatActivityDescription(activity)}
                        </p>
                        
                        {activity.error_message && (
                          <p className="text-sm text-destructive mt-1 bg-destructive/5 p-2 rounded">
                            Error: {activity.error_message}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2 mt-2">
                          <p className="text-xs text-muted-foreground">
                            {formatDate(activity.timestamp, { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                          {activity.status !== 'completed' && (
                            <Badge variant={activity.status === 'failed' ? 'destructive' : 'secondary'} className="text-[10px] h-5">
                              {activity.status}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default HistoryTab;
