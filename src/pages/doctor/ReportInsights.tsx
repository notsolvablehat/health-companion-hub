// src/pages/doctor/ReportInsights.tsx

import { useState } from 'react';
import { ReportLibrary, ReportViewer } from '@/components/reports';
import { useDoctorReports } from '@/hooks/queries/useReportQueries';
import type { Report } from '@/types/report';

export default function DoctorReportInsights() {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const { data, isLoading, error } = useDoctorReports();

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
      showPatientFilter={true}
      title="AI Report Insights"
      subtitle="Analyze and understand medical reports from your patients with AI assistance"
    />
  );
}
