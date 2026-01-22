// src/components/reports/PDFViewerTab.tsx

import { useState, useCallback } from 'react';
import { Viewer, Worker, SpecialZoomLevel } from '@react-pdf-viewer/core';
import '@react-pdf-viewer/core/lib/styles/index.css';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Download, ZoomIn, ZoomOut, Loader2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { TextSelectionMenu } from './TextSelectionMenu';
import { ExplainModal } from './ExplainModal';
import { useReportDownloadUrl } from '@/hooks/queries/useReportQueries';
import type { Report } from '@/types/report';

interface PDFViewerTabProps {
  report: Report;
}

export function PDFViewerTab({ report }: PDFViewerTabProps) {
  const [scale, setScale] = useState<number | SpecialZoomLevel>(1.0);
  const [selectedText, setSelectedText] = useState<string>('');
  const [menuPosition, setMenuPosition] = useState<{ x: number; y: number } | null>(null);
  const [showExplainModal, setShowExplainModal] = useState(false);

  const { data: downloadData, isLoading, error } = useReportDownloadUrl(report.id);

  const isPdf = report.file_type === 'pdf' || report.content_type === 'application/pdf';

  const handleTextSelection = useCallback(() => {
    const selection = window.getSelection();
    const text = selection?.toString().trim();

    if (text && text.length > 0 && text.length < 1000) {
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

  const handleZoomIn = () => {
    setScale(prev => typeof prev === 'number' ? Math.min(2.0, prev + 0.1) : 1.1);
  };

  const handleZoomOut = () => {
    setScale(prev => typeof prev === 'number' ? Math.max(0.5, prev - 0.1) : 0.9);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-9 w-32" />
          <Skeleton className="h-9 w-24" />
        </div>
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  if (error || !downloadData) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center text-center">
          <AlertCircle className="w-12 h-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">Failed to Load Document</h3>
          <p className="text-sm text-muted-foreground mb-4">
            {error?.message || 'Could not retrieve the document. Please try again.'}
          </p>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Retry
          </Button>
        </div>
      </Card>
    );
  }

  // For images, show a simple image viewer
  if (!isPdf) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-end">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
        </div>
        <Card className="p-4 flex items-center justify-center min-h-[400px]">
          <img 
            src={downloadData.download_url} 
            alt={report.file_name}
            className="max-w-full max-h-[600px] object-contain rounded-lg"
          />
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
          >
            <ZoomOut className="w-4 h-4" />
          </Button>
          <span className="text-sm text-muted-foreground min-w-[60px] text-center">
            {typeof scale === 'number' ? `${Math.round(scale * 100)}%` : 'Fit'}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
          >
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>

        <Button variant="outline" size="sm" onClick={handleDownload}>
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </div>

      {/* PDF Viewer */}
      <Card className="overflow-hidden">
        <div 
          className="h-[700px] overflow-auto"
          onMouseUp={handleTextSelection}
        >
          <Worker workerUrl={`https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`}>
            <Viewer
              fileUrl={downloadData.download_url}
              defaultScale={scale}
              renderLoader={(percentages: number) => (
                <div className="flex flex-col items-center justify-center h-full gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">
                    Loading {Math.round(percentages)}%
                  </span>
                </div>
              )}
            />
          </Worker>
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
      <ExplainModal
        reportId={report.id}
        selectedText={selectedText}
        open={showExplainModal}
        onClose={() => setShowExplainModal(false)}
      />
    </div>
  );
}

export default PDFViewerTab;
