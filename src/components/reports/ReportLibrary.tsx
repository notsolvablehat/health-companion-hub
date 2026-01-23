// src/components/reports/ReportLibrary.tsx

import { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, FileText, CheckCircle, Clock, AlertCircle, Upload } from 'lucide-react';
import { ReportCard } from './ReportCard';
import { ReportFilters, type FilterState } from './ReportFilters';
import { UploadReportDialog } from './UploadReportDialog';
import { useDebounce } from '@/hooks/useDebounce';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import type { Report, ReportListResponse } from '@/types/report';

interface ReportLibraryProps {
  onSelectReport: (report: Report) => void;
  data: ReportListResponse | undefined;
  isLoading: boolean;
  error: Error | null;
  showPatientFilter?: boolean;
  title?: string;
  subtitle?: string;
}

export function ReportLibrary({ 
  onSelectReport, 
  data,
  isLoading,
  error,
  showPatientFilter = true,
  title = 'AI Report Insights',
  subtitle = 'Analyze and understand medical reports with AI assistance'
}: ReportLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState<FilterState>({
    patientId: '',
    fileType: 'all',
    analysisStatus: 'all',
  });
  const [showUploadDialog, setShowUploadDialog] = useState(false);

  const queryClient = useQueryClient();
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Filter and search reports
  const filteredReports = useMemo(() => {
    if (!data?.reports) return [];

    return data.reports.filter(report => {
      // Search filter
      const searchLower = debouncedSearch.toLowerCase();
      const matchesSearch = 
        !debouncedSearch ||
        report.file_name?.toLowerCase().includes(searchLower) ||
        report.description?.toLowerCase().includes(searchLower) ||
        report.patient_name?.toLowerCase().includes(searchLower);

      // Patient filter
      const matchesPatient = !filters.patientId || report.patient_id === filters.patientId;

      // File type filter
      const isPdf = report.file_type === 'pdf' || report.content_type === 'application/pdf';
      const matchesFileType = 
        filters.fileType === 'all' ||
        (filters.fileType === 'pdf' && isPdf) ||
        (filters.fileType === 'image' && !isPdf);

      // Analysis status filter
      const matchesAnalysis = 
        filters.analysisStatus === 'all' ||
        (filters.analysisStatus === 'analyzed' && report.mongo_analysis_id) ||
        (filters.analysisStatus === 'pending' && !report.mongo_analysis_id);

      return matchesSearch && matchesPatient && matchesFileType && matchesAnalysis;
    });
  }, [data?.reports, debouncedSearch, filters]);

  // Calculate quick stats
  const stats = useMemo(() => {
    const total = data?.reports?.length || 0;
    const analyzed = data?.reports?.filter(r => r.mongo_analysis_id).length || 0;
    const pending = total - analyzed;

    return { total, analyzed, pending };
  }, [data?.reports]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 mx-auto mb-4 text-destructive" />
            <h3 className="text-lg font-semibold mb-2">Error Loading Reports</h3>
            <p className="text-sm text-muted-foreground">{error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground">{subtitle}</p>
        </div>
        <Button onClick={() => setShowUploadDialog(true)}>
          <Upload className="w-4 h-4 mr-2" />
          Upload Report
        </Button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search reports by filename, description, or patient..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Filters */}
      <ReportFilters 
        filters={filters} 
        onFiltersChange={setFilters} 
        showPatientFilter={showPatientFilter}
      />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.analyzed}</p>
                <p className="text-sm text-muted-foreground">Analyzed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-card/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Clock className="w-6 h-6 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending Analysis</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4 text-foreground">
          Reports ({filteredReports.length})
        </h2>
        {filteredReports.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No reports found matching your criteria</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredReports.map(report => (
              <ReportCard
                key={report.id}
                report={report}
                onClick={() => onSelectReport(report)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      <UploadReportDialog
        open={showUploadDialog}
        onClose={() => setShowUploadDialog(false)}
        onSuccess={() => {
          // Invalidate queries to refresh report list
          queryClient.invalidateQueries({ queryKey: ['doctor-reports'] });
          queryClient.invalidateQueries({ queryKey: ['reports'] });
        }}
      />
    </div>
  );
}

export default ReportLibrary;
