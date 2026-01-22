// src/components/reports/ReportViewer.tsx

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, FileText, Sparkles, History } from 'lucide-react';
import { PDFViewerTab } from './PDFViewerTab';
import { AIInsightsTab } from './AIInsightsTab';
import { HistoryTab } from './HistoryTab';
import { formatDate } from '@/lib/utils';
import type { Report } from '@/types/report';

interface ReportViewerProps {
  report: Report;
  onBack: () => void;
}

export function ReportViewer({ report, onBack }: ReportViewerProps) {
  const [activeTab, setActiveTab] = useState('document');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} className="shrink-0">
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="min-w-0">
          <h1 className="text-xl md:text-2xl font-bold text-foreground truncate">{report.file_name}</h1>
          <p className="text-sm text-muted-foreground">
            {report.patient_name && <span>{report.patient_name} • </span>}
            Uploaded {formatDate(report.created_at)}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="document" className="gap-2">
            <FileText className="w-4 h-4" />
            <span className="hidden sm:inline">Document</span>
          </TabsTrigger>
          <TabsTrigger value="insights" className="gap-2">
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">AI Insights</span>
          </TabsTrigger>
          <TabsTrigger value="history" className="gap-2">
            <History className="w-4 h-4" />
            <span className="hidden sm:inline">History</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="document" className="mt-6">
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

export default ReportViewer;
