// src/pages/patient/ReportInsights.tsx

import { useState } from 'react';
import { ReportLibrary, ReportViewer } from '@/components/reports';
import { useReports } from '@/hooks/queries/useReportQueries';
import type { Report } from '@/types/report';

export default function PatientReportInsights() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const { data, isLoading, error } = useReports();

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
      data={data}
      isLoading={isLoading}
      error={error}
      showPatientFilter={false}
      title="My Reports & AI Insights"
      subtitle="View your medical reports and get AI-powered analysis"
    />
  );
}
