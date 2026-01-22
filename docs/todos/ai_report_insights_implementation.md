# AI Report Insights Hub - Module-by-Module Build Guide

## Executive Summary

This document provides a comprehensive, step-by-step guide to building the **AI Report Insights Hub** feature that replaces the "My Patients" page. The feature enables doctors to view, analyze, and get AI-powered explanations for medical reports from their assigned patients.

**Route**: `/doctor/reports` (changed from `/doctor/patients`)

**Core Functionality**:
1. Report library with filtering and search
2. Tab-based report viewer (PDF, AI Insights, History)
3. Manual analysis trigger with caching
4. Text selection with AI explanations
5. Key findings and risk assessment display

---

## Module Breakdown

### Module 1: Report Library (Main Page)
### Module 2: Report Filters & Search
### Module 3: PDF Viewer with Text Selection
### Module 4: AI Insights Display
### Module 5: Analysis History
### Module 6: Text Selection Menu & Explain Modal
### Module 7: Data Services & API Integration
### Module 8: React Query Hooks
### Module 9: Router & Navigation Updates

---

## Module 1: Report Library (Main Page)

### Purpose
Main landing page showing all reports from assigned patients with filtering, search, and quick stats.

### File Location
`src/pages/doctor/ReportInsights.tsx`

### Dependencies
- `ReportLibrary` component
- `ReportViewer` component
- [useMyPatients](file:///home/solvablehat/Personal_Files/Capstone%20Frontend/health-companion-hub/src/hooks/queries/useAssignmentQueries.ts#22-32) hook (to get assigned patients)
- `useDoctorReports` hook (custom hook to aggregate reports)

### Implementation Details

```typescript
// src/pages/doctor/ReportInsights.tsx

import { useState } from 'react';
import { ReportLibrary } from '@/components/reports/ReportLibrary';
import { ReportViewer } from '@/components/reports/ReportViewer';
import type { Report } from '@/types/report';

export default function ReportInsights() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);

  if (selectedReport) {
    return (
      <ReportViewer
        report={selectedReport}
        onBack={() => setSelectedReport(null)}
      />
    );
  }

  return (
    <ReportLibrary
      onSelectReport={setSelectedReport}
    />
  );
}
```

**State Management**:
- `selectedReport`: Currently selected report for viewing
- When report is selected, show `ReportViewer`
- When back button clicked, return to `ReportLibrary`

---

## Module 2: Report Library Component

### Purpose
Display grid/list of reports with filters, search, and quick stats.

### File Location
`src/components/reports/ReportLibrary.tsx`

### Dependencies
- `ReportCard` component
- `ReportFilters` component
- `useDoctorReports` hook
- `useDebounce` hook (for search)

### Implementation Details

```typescript
// src/components/reports/ReportLibrary.tsx

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, FileText, CheckCircle, Clock } from 'lucide-react';
import { ReportCard } from './ReportCard';
import { ReportFilters } from './ReportFilters';
import { useDoctorReports } from '@/hooks/queries/useReportQueries';
import { useDebounce } from '@/hooks/useDebounce';
import type { Report } from '@/types/report';

interface ReportLibraryProps {
  onSelectReport: (report: Report) => void;
}

export function ReportLibrary({ onSelectReport }: ReportLibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    patientId: '',
    dateRange: { from: null, to: null },
    fileType: 'all', // 'all' | 'pdf' | 'image'
    analysisStatus: 'all', // 'all' | 'analyzed' | 'pending'
  });

  const debouncedSearch = useDebounce(searchQuery, 300);
  const { data, isLoading, error } = useDoctorReports();

  // Filter and search reports
  const filteredReports = useMemo(() => {
    if (!data?.reports) return [];

    return data.reports.filter(report => {
      // Search filter
      const matchesSearch = 
        report.file_name.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        report.description?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
        report.patient_name?.toLowerCase().includes(debouncedSearch.toLowerCase());

      // Patient filter
      const matchesPatient = !filters.patientId || report.patient_id === filters.patientId;

      // File type filter
      const matchesFileType = filters.fileType === 'all' || report.file_type === filters.fileType;

      // Analysis status filter
      const matchesAnalysis = 
        filters.analysisStatus === 'all' ||
        (filters.analysisStatus === 'analyzed' && report.mongo_analysis_id) ||
        (filters.analysisStatus === 'pending' && !report.mongo_analysis_id);

      // Date range filter
      const matchesDateRange = 
        (!filters.dateRange.from || new Date(report.created_at) >= filters.dateRange.from) &&
        (!filters.dateRange.to || new Date(report.created_at) <= filters.dateRange.to);

      return matchesSearch && matchesPatient && matchesFileType && matchesAnalysis && matchesDateRange;
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
    return <div>Loading reports...</div>;
  }

  if (error) {
    return <div>Error loading reports: {error.message}</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">AI Report Insights</h1>
        <p className="text-muted-foreground">
          Analyze and understand medical reports with AI assistance
        </p>
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
      <ReportFilters filters={filters} onFiltersChange={setFilters} />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Reports</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-success" />
              <div>
                <p className="text-2xl font-bold">{stats.analyzed}</p>
                <p className="text-sm text-muted-foreground">Analyzed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-warning" />
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending Analysis</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">
          Reports ({filteredReports.length})
        </h2>
        {filteredReports.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              No reports found matching your criteria
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
    </div>
  );
}
```

**Key Features**:
- Real-time search with debouncing
- Multiple filter options
- Quick stats cards
- Responsive grid layout
- Empty state handling

---

## Module 3: Report Card Component

### Purpose
Individual report card showing key information and analysis status.

### File Location
`src/components/reports/ReportCard.tsx`

### Implementation Details

```typescript
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
  const Icon = report.file_type === 'pdf' ? FileText : ImageIcon;

  return (
    <Card 
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <CardContent className="pt-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="p-3 bg-primary/10 rounded-lg">
            <Icon className="w-6 h-6 text-primary" />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-2">
              <h3 className="font-semibold truncate">{report.file_name}</h3>
              <Badge variant={isAnalyzed ? 'default' : 'secondary'} className="shrink-0">
                {isAnalyzed ? (
                  <><CheckCircle className="w-3 h-3 mr-1" /> Analyzed</>
                ) : (
                  <><Clock className="w-3 h-3 mr-1" /> Pending</>
                )}
              </Badge>
            </div>

            {report.description && (
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                {report.description}
              </p>
            )}

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>{report.patient_name || 'Unknown Patient'}</span>
              <span>•</span>
              <span>{formatDate(report.created_at)}</span>
              <span>•</span>
              <span>{formatFileSize(report.file_size_bytes)}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
```

---

## Module 4: Report Filters Component

### Purpose
Advanced filtering controls for reports.

### File Location
`src/components/reports/ReportFilters.tsx`

### Implementation Details

```typescript
// src/components/reports/ReportFilters.tsx

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useMyPatients } from '@/hooks/queries/useAssignmentQueries';

interface FilterState {
  patientId: string;
  dateRange: { from: Date | null; to: Date | null };
  fileType: 'all' | 'pdf' | 'image';
  analysisStatus: 'all' | 'analyzed' | 'pending';
}

interface ReportFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

export function ReportFilters({ filters, onFiltersChange }: ReportFiltersProps) {
  const { data: patientsData } = useMyPatients();

  return (
    <div className="flex flex-wrap gap-4">
      {/* Patient Filter */}
      <Select
        value={filters.patientId}
        onValueChange={(value) => onFiltersChange({ ...filters, patientId: value })}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="All Patients" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">All Patients</SelectItem>
          {patientsData?.patients.map(patient => (
            <SelectItem key={patient.user_id} value={patient.user_id}>
              {patient.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* File Type Filter */}
      <Select
        value={filters.fileType}
        onValueChange={(value: any) => onFiltersChange({ ...filters, fileType: value })}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="File Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="pdf">PDF Only</SelectItem>
          <SelectItem value="image">Images Only</SelectItem>
        </SelectContent>
      </Select>

      {/* Analysis Status Filter */}
      <Select
        value={filters.analysisStatus}
        onValueChange={(value: any) => onFiltersChange({ ...filters, analysisStatus: value })}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Reports</SelectItem>
          <SelectItem value="analyzed">Analyzed</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
        </SelectContent>
      </Select>

      {/* Date Range - Can add DatePicker component later */}
    </div>
  );
}
```

---

## Module 5: Report Viewer (Tab Container)

### Purpose
Main viewer component with tab navigation for PDF, AI Insights, and History.

### File Location
`src/components/reports/ReportViewer.tsx`

### Implementation Details

```typescript
// src/components/reports/ReportViewer.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, FileText, Sparkles, History } from 'lucide-react';
import { PDFViewerTab } from './PDFViewerTab';
import { AIInsightsTab } from './AIInsightsTab';
import { HistoryTab } from './HistoryTab';
import type { Report } from '@/types/report';

interface ReportViewerProps {
  report: Report;
  onBack: () => void;
}

export function ReportViewer({ report, onBack }: ReportViewerProps) {
  const [activeTab, setActiveTab] = useState('pdf');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack}>
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold">{report.file_name}</h1>
          <p className="text-muted-foreground">
            Patient: {report.patient_name} • Uploaded {formatDate(report.created_at)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="pdf">
            <FileText className="w-4 h-4 mr-2" />
            PDF View
          </TabsTrigger>
          <TabsTrigger value="insights">
            <Sparkles className="w-4 h-4 mr-2" />
            AI Insights
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="w-4 h-4 mr-2" />
            History
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pdf" className="mt-6">
          <PDFViewerTab report={report} />
        </TabsContent>

        <TabsContent value="insights" className="mt-6">
          <AIInsightsTab report={report} />
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <HistoryTab report={report} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

---

## Module 6: PDF Viewer Tab with Text Selection

### Purpose
Display PDF with text selection capability and floating menu.

### File Location
`src/components/reports/PDFViewerTab.tsx`

### Dependencies
- `react-pdf` library
- `TextSelectionMenu` component
- `ExplainModal` component
- `useReportDownloadUrl` hook

### Implementation Details

```typescript
// src/components/reports/PDFViewerTab.tsx

import { useState, useCallback } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/esm/Page/AnnotationLayer.css';
import 'react-pdf/dist/esm/Page/TextLayer.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ZoomIn, ZoomOut } from 'lucide-react';
import { TextSelectionMenu } from './TextSelectionMenu';
import { ExplainModal } from './ExplainModal';
import { useReportDownloadUrl } from '@/hooks/queries/useReportQueries';
import type { Report } from '@/types/report';

// Set up PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`;

interface PDFViewerTabProps {
  report: Report;
}

export function PDFViewerTab({ report }: PDFViewerTabProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState<number>(1);
  const [scale, setScale] = useState<number>(1.0);
  const [selectedText, setSelectedText] = useState<string>('');
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [showExplainModal, setShowExplainModal] = useState(false);

  const { data: downloadData, isLoading } = useReportDownloadUrl(report.id);

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (text && text.length > 0) {
      const range = selection?.getRangeAt(0);
      const rect = range?.getBoundingClientRect();

      setSelectedText(text);
      setMenuPosition({
        x: rect?.left || 0,
        y: rect?.bottom || 0,
      });
    } else {
      setMenuPosition(null);
    }
  }, []);

  const handleExplain = () => {
    setMenuPosition(null);
    setShowExplainModal(true);
  };

  const handleDownload = () => {
    if (downloadData?.download_url) {
      window.open(downloadData.download_url, '_blank');
    }
  };

  if (isLoading) {
    return <div>Loading PDF...</div>;
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm">{Math.round(scale * 100)}%</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setScale(s => Math.min(2.0, s + 0.1))}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            Page {pageNumber} of {numPages}
          </span>
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
      </div>

      {/* PDF Viewer */}
      <Card className="p-4">
        <div 
          className="overflow-auto max-h-[800px]"
          onMouseUp={handleTextSelection}
        >
          <Document
            file={downloadData?.download_url}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          >
            {Array.from(new Array(numPages), (el, index) => (
              <Page
                key={`page_${index + 1}`}
                pageNumber={index + 1}
                scale={scale}
                className="mb-4"
              />
            ))}
          </Document>
        </div>
      </Card>

      {/* Text Selection Menu */}
      {menuPosition && (
        <TextSelectionMenu
          position={menuPosition}
          selectedText={selectedText}
          onExplain={handleExplain}
          onClose={() => setMenuPosition(null)}
        />
      )}

      {/* Explain Modal */}
      {showExplainModal && (
        <ExplainModal
          reportId={report.id}
          selectedText={selectedText}
          onClose={() => setShowExplainModal(false)}
        />
      )}
    </div>
  );
}
```

---

## Module 7: Text Selection Menu

### Purpose
Floating menu that appears when text is selected in PDF.

### File Location
`src/components/reports/TextSelectionMenu.tsx`

### Implementation Details

```typescript
// src/components/reports/TextSelectionMenu.tsx

import { Sparkles, FileText, X } from 'lucide-react';

interface TextSelectionMenuProps {
  position: { x: number; y: number };
  selectedText: string;
  onExplain: () => void;
  onClose: () => void;
}

export function TextSelectionMenu({
  position,
  selectedText,
  onExplain,
  onClose
}: TextSelectionMenuProps) {
  return (
    <div
      className="fixed z-50 bg-popover border rounded-lg shadow-lg p-1 min-w-[180px]"
      style={{ top: position.y + 5, left: position.x }}
    >
      <button
        onClick={onExplain}
        className="flex items-center gap-2 px-3 py-2 hover:bg-accent rounded w-full text-left text-sm"
      >
        <Sparkles className="w-4 h-4 text-primary" />
        Explain this
      </button>
      
      {/* Disabled but visible "Add to notes" option */}
      <button
        disabled
        className="flex items-center gap-2 px-3 py-2 rounded w-full text-left text-sm opacity-50 cursor-not-allowed"
        title="Coming soon"
      >
        <FileText className="w-4 h-4" />
        Add to notes
      </button>

      <button
        onClick={onClose}
        className="flex items-center gap-2 px-3 py-2 hover:bg-accent rounded w-full text-left text-sm"
      >
        <X className="w-4 h-4" />
        Cancel
      </button>
    </div>
  );
}
```

---

## Module 8: Explain Modal

### Purpose
Modal showing AI explanation of selected text.

### File Location
`src/components/reports/ExplainModal.tsx`

### Dependencies
- `useExplainText` hook
- Dialog component from shadcn/ui

### Implementation Details

```typescript
// src/components/reports/ExplainModal.tsx

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Copy, FileText } from 'lucide-react';
import { useExplainText } from '@/hooks/queries/useAIQueries';
import { toast } from 'sonner';

interface ExplainModalProps {
  reportId: string;
  selectedText: string;
  onClose: () => void;
}

export function ExplainModal({ reportId, selectedText, onClose }: ExplainModalProps) {
  const { mutate: explain, data, isPending, error } = useExplainText(reportId);

  // Trigger explanation on mount
  useEffect(() => {
    explain(selectedText);
  }, []);

  const handleCopy = () => {
    if (data?.response) {
      navigator.clipboard.writeText(data.response);
      toast.success('Explanation copied to clipboard');
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
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
              <p className="text-sm italic">"{selectedText}"</p>
            </div>
          </div>

          <div className="border-t" />

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
              </div>
            )}

            {data && (
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm whitespace-pre-wrap">{data.response}</p>
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
```

---

## Module 9: AI Insights Tab

### Purpose
Display AI analysis results, key findings, and risk assessment.

### File Location
`src/components/reports/AIInsightsTab.tsx`

### Dependencies
- `useReportAnalysis` hook
- `KeyFindings` component
- `RiskIndicators` component

### Implementation Details

```typescript
// src/components/reports/AIInsightsTab.tsx

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, RefreshCw, Sparkles, AlertTriangle } from 'lucide-react';
import { useReportAnalysis } from '@/hooks/queries/useReportQueries';
import { formatDate } from '@/lib/utils';
import type { Report } from '@/types/report';

interface AIInsightsTabProps {
  report: Report;
}

export function AIInsightsTab({ report }: AIInsightsTabProps) {
  const {
    analysis,
    isAnalyzed,
    analyze,
    isAnalyzing
  } = useReportAnalysis(report.id);

  return (
    <div className="space-y-6">
      {/* Analysis Status */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isAnalyzed ? (
                <>
                  <Badge variant="default" className="gap-1">
                    <Sparkles className="w-3 h-3" />
                    Analyzed
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    Last analyzed on {formatDate(analysis.analyzedAt)}
                  </span>
                </>
              ) : (
                <>
                  <Badge variant="secondary">Not Analyzed</Badge>
                  <span className="text-sm text-muted-foreground">
                    Click the button to analyze this report
                  </span>
                </>
              )}
            </div>

            <Button
              onClick={() => analyze()}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing...
                </>
              ) : isAnalyzed ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Analyze Again
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Analyze Report
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {isAnalyzed && analysis && (
        <>
          {/* Key Findings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                📊 Key Findings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(analysis.extraction.extracted_data).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <span className="font-medium capitalize">
                      {key.replace(/_/g, ' ')}:
                    </span>
                    <span className="text-muted-foreground">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Narrative */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                🤖 AI Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <p className="whitespace-pre-wrap">{analysis.analysis.narrative}</p>
              </div>
            </CardContent>
          </Card>

          {/* Risk Assessment */}
          {analysis.analysis.prediction && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-warning" />
                  Risk Assessment
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Overall Risk:</span>
                    <Badge 
                      variant={
                        analysis.analysis.prediction.risk_level === 'high' ? 'destructive' :
                        analysis.analysis.prediction.risk_level === 'medium' ? 'warning' :
                        'default'
                      }
                    >
                      {analysis.analysis.prediction.risk_level.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Diabetes Risk:</span>
                    <span className="text-muted-foreground">
                      {(analysis.analysis.prediction.probability * 100).toFixed(1)}%
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-medium">Status:</span>
                    <Badge variant={analysis.analysis.prediction.is_diabetic ? 'destructive' : 'default'}>
                      {analysis.analysis.prediction.is_diabetic ? 'Diabetic' : 'Non-Diabetic'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* Empty State */}
      {!isAnalyzed && !isAnalyzing && (
        <Card>
          <CardContent className="py-12 text-center">
            <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Analysis Yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Click "Analyze Report" to get AI-powered insights and key findings
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
```

---

## Module 10: Data Services

### Purpose
API service layer for report operations.

### File Location
[src/services/reports.ts](file:///home/solvablehat/Personal_Files/Capstone%20Frontend/health-companion-hub/src/services/reports.ts) (already exists, may need updates)

### Required Methods

```typescript
// src/services/reports.ts

export const reportsService = {
  // Existing methods...
  
  /**
   * Get all reports for a specific patient
   * GET /reports/patient/{patient_id}
   */
  getPatientReports: async (patientId: string): Promise<ReportListResponse> => {
    const response = await api.get<ReportListResponse>(`/reports/patient/${patientId}`);
    return response.data;
  },

  // ... other existing methods
};
```

---

## Module 11: React Query Hooks

### Purpose
Custom hooks for data fetching and mutations.

### File Location
[src/hooks/queries/useReportQueries.ts](file:///home/solvablehat/Personal_Files/Capstone%20Frontend/health-companion-hub/src/hooks/queries/useReportQueries.ts)

### New Hooks Needed

```typescript
// src/hooks/queries/useReportQueries.ts

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reportsService, aiService, assignmentsService } from '@/services';
import { QUERY_KEYS } from '@/lib/constants';

/**
 * Get all reports from all assigned patients (for doctors)
 */
export function useDoctorReports() {
  return useQuery({
    queryKey: ['doctor-reports'],
    queryFn: async () => {
      // Get all assigned patients
      const patientsData = await assignmentsService.getMyPatients();
      
      // Get reports for each patient
      const reportsPromises = patientsData.patients.map(patient =>
        reportsService.getPatientReports(patient.user_id)
          .then(data => data.reports.map(report => ({
            ...report,
            patient_name: patient.name,
          })))
      );

      const reportsArrays = await Promise.all(reportsPromises);
      const allReports = reportsArrays.flat();

      // Sort by created_at descending
      allReports.sort((a, b) => 
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      );

      return {
        reports: allReports,
        total: allReports.length,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Get download URL for a report
 */
export function useReportDownloadUrl(reportId: string) {
  return useQuery({
    queryKey: ['report-download-url', reportId],
    queryFn: () => reportsService.getDownloadUrl(reportId),
    staleTime: 30 * 60 * 1000, // 30 minutes (URLs expire in 1 hour)
  });
}

/**
 * Hook to manage report analysis state and trigger analysis
 */
export function useReportAnalysis(reportId: string) {
  const queryClient = useQueryClient();

  // Check if report is already analyzed (from cache or localStorage)
  const { data: cachedAnalysis } = useQuery({
    queryKey: ['report-analysis', reportId],
    queryFn: () => {
      const cached = localStorage.getItem(`analysis-${reportId}`);
      return cached ? JSON.parse(cached) : null;
    },
    staleTime: Infinity,
  });

  // Mutation to trigger new analysis
  const analyzeMutation = useMutation({
    mutationFn: async () => {
      const [extraction, analysis] = await Promise.all([
        aiService.extractReport(reportId),
        aiService.analyzeReport(reportId),
      ]);

      return {
        extraction,
        analysis,
        analyzedAt: new Date().toISOString(),
      };
    },
    onSuccess: (data) => {
      // Cache the result
      localStorage.setItem(`analysis-${reportId}`, JSON.stringify(data));
      queryClient.setQueryData(['report-analysis', reportId], data);
    },
  });

  return {
    analysis: cachedAnalysis,
    isAnalyzed: !!cachedAnalysis,
    analyze: analyzeMutation.mutate,
    isAnalyzing: analyzeMutation.isPending,
  };
}
```

---

## Module 12: AI Explanation Hook

### Purpose
Hook for explaining selected text using AI chat.

### File Location
[src/hooks/queries/useAIQueries.ts](file:///home/solvablehat/Personal_Files/Capstone%20Frontend/health-companion-hub/src/hooks/queries/useAIQueries.ts) (add to existing file)

### Implementation

```typescript
// src/hooks/queries/useAIQueries.ts

/**
 * Hook to explain selected text from a report
 */
export function useExplainText(reportId: string) {
  const [chatId, setChatId] = useState<string | null>(null);

  return useMutation({
    mutationFn: async (selectedText: string) => {
      // Create or reuse chat session
      let currentChatId = chatId;

      if (!currentChatId) {
        const chat = await aiService.startChat({ report_ids: [reportId] });
        currentChatId = chat.chat_id;
        setChatId(currentChatId);
      }

      // Send explanation request
      const response = await aiService.sendMessage(currentChatId, {
        message: `Please explain this medical term or finding from the report: "${selectedText}". Provide a clear, concise explanation suitable for a healthcare professional, including normal ranges if applicable.`,
      });

      return response;
    },
  });
}
```

---

## Module 13: Router Updates

### Purpose
Update routing configuration to use new ReportInsights page.

### File Location
[src/router.tsx](file:///home/solvablehat/Personal_Files/Capstone%20Frontend/health-companion-hub/src/router.tsx)

### Changes Required

```typescript
// src/router.tsx

// Import new component
import ReportInsights from '@/pages/doctor/ReportInsights';

// Replace in doctor routes:
{
  path: '/doctor/reports', // Changed from /doctor/patients
  element: <ReportInsights />,
},

// Remove old patient detail route (no longer needed):
// {
//   path: '/doctor/patients/:patientId',
//   element: <DoctorPatientDetail />,
// },
```

---

## Module 14: Sidebar Navigation Update

### Purpose
Update sidebar to reflect new route and feature name.

### File Location
[src/components/layout/Sidebar.tsx](file:///home/solvablehat/Personal_Files/Capstone%20Frontend/health-companion-hub/src/components/layout/Sidebar.tsx) or `DoctorLayout.tsx`

### Changes Required

```typescript
// Update navigation item
{
  title: 'AI Report Insights', // Changed from 'My Patients'
  icon: Sparkles, // Or FileText
  href: '/doctor/reports', // Changed from /doctor/patients
}
```

---

## Suggested Backend Enhancements

While the existing backend endpoints are sufficient, these optional enhancements would improve the feature:

### 1. Bulk Report Endpoint for Doctors

**Endpoint**: `GET /reports/doctor/all`

**Purpose**: Get all reports from assigned patients in a single call instead of multiple patient-specific calls.

**Response**:
```json
{
  "total": 45,
  "reports": [
    {
      "id": "report-uuid",
      "patient_id": "patient-uuid",
      "patient_name": "John Doe",
      "file_name": "lab_results.pdf",
      "file_type": "pdf",
      "content_type": "application/pdf",
      "file_size_bytes": 1234567,
      "description": "Blood test",
      "mongo_analysis_id": "analysis-id",
      "created_at": "2026-01-21T10:00:00Z"
    }
  ]
}
```

**Benefits**:
- Single API call instead of N calls (one per patient)
- Reduces frontend complexity
- Better performance

---

### 2. Analysis Status Endpoint

**Endpoint**: `GET /ai/analysis-status/{report_id}`

**Purpose**: Check if a report has been analyzed without fetching full analysis.

**Response**:
```json
{
  "report_id": "report-uuid",
  "is_analyzed": true,
  "analyzed_at": "2026-01-21T10:00:00Z",
  "mongo_analysis_id": "analysis-id"
}
```

**Benefits**:
- Lightweight check for analysis status
- Can be used for batch status checks

---

### 3. Combined Analysis Endpoint

**Endpoint**: `GET /ai/report-insights/{report_id}`

**Purpose**: Get both extraction and analysis in a single call.

**Response**:
```json
{
  "report_id": "report-uuid",
  "extraction": { /* extracted_data */ },
  "analysis": { /* prediction, narrative */ },
  "analyzed_at": "2026-01-21T10:00:00Z"
}
```

**Benefits**:
- Single call instead of two separate calls
- Consistent data structure
- Easier caching

---

## Implementation Phases

### Phase 1: Core Infrastructure (Week 1)
- ✅ Module 1: Report Library page structure
- ✅ Module 2: Report Library component with filters
- ✅ Module 3: Report Card component
- ✅ Module 4: Report Filters component
- ✅ Module 10: Data services
- ✅ Module 11: React Query hooks
- ✅ Module 13: Router updates
- ✅ Module 14: Sidebar updates

**Deliverable**: Working report library that displays all reports from assigned patients with filtering.

---

### Phase 2: PDF Viewing (Week 2)
- ✅ Module 5: Report Viewer container
- ✅ Module 6: PDF Viewer Tab
- ✅ Module 7: Text Selection Menu
- ✅ Module 8: Explain Modal
- ✅ Module 12: AI Explanation hook

**Deliverable**: PDF viewing with text selection and AI explanations.

---

### Phase 3: AI Analysis (Week 3)
- ✅ Module 9: AI Insights Tab
- ✅ Analysis state management
- ✅ Key findings display
- ✅ Risk indicators

**Deliverable**: Complete AI analysis functionality with visual insights.

---

### Phase 4: Polish & Testing (Week 4)
- ✅ History Tab (analysis history)
- ✅ Error handling
- ✅ Loading states
- ✅ Responsive design
- ✅ Browser testing
- ✅ Bug fixes

**Deliverable**: Production-ready feature.

---

## Dependencies Installation

```bash
npm install react-pdf pdfjs-dist
```

---

## Type Definitions

### Extended Report Type

```typescript
// src/types/report.ts

export interface Report {
  id: string;
  case_id: string | null;
  patient_id: string;
  uploaded_by: string;
  file_name: string;
  file_type: 'pdf' | 'image';
  content_type: string;
  storage_path: string;
  file_size_bytes: number;
  description: string | null;
  mongo_analysis_id: string | null;
  created_at: string;
  
  // Extended fields (added by frontend)
  patient_name?: string;
}

export interface ReportListResponse {
  total: number;
  reports: Report[];
}

export interface DownloadUrlResponse {
  report_id: string;
  download_url: string;
  expires_in: number;
}
```

---

## Summary

This comprehensive guide provides:
- ✅ 14 detailed modules with implementation code
- ✅ Clear dependencies and data flow
- ✅ Suggested backend enhancements (optional)
- ✅ Phased implementation approach
- ✅ Type definitions
- ✅ Integration with existing services

**Next Steps**:
1. Review this guide
2. Confirm backend endpoint availability
3. Decide on optional backend enhancements
4. Begin Phase 1 implementation

**Questions?**
- Should we implement the suggested backend enhancements?
- Any specific styling or UX preferences?
- Ready to proceed with implementation?