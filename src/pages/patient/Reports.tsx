import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, Eye, Download, Trash2 } from 'lucide-react';
import { formatDate, formatFileSize } from '@/lib/utils';

export default function PatientReports() {
  // Mock data
  const reports = [
    { id: '1', name: 'Blood Glucose Report - Jan 2024.pdf', type: 'pdf', size: 1024000, uploaded: '2024-01-10', status: 'reviewed' },
    { id: '2', name: 'HbA1c Test Results.pdf', type: 'pdf', size: 512000, uploaded: '2024-01-05', status: 'pending' },
    { id: '3', name: 'Kidney Function Test.pdf', type: 'pdf', size: 768000, uploaded: '2023-12-20', status: 'reviewed' },
    { id: '4', name: 'Eye Examination Report.pdf', type: 'pdf', size: 2048000, uploaded: '2023-12-15', status: 'reviewed' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Reports</h1>
          <p className="text-muted-foreground">Upload and manage your medical reports</p>
        </div>
        <Button>
          <Upload className="w-4 h-4 mr-2" />
          Upload Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Uploaded Reports</CardTitle>
          <CardDescription>{reports.length} reports total</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {reports.map((report) => (
              <div key={report.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium">{report.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatFileSize(report.size)} • Uploaded {formatDate(report.uploaded)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={report.status === 'reviewed' ? 'default' : 'secondary'}>
                    {report.status}
                  </Badge>
                  <Button variant="ghost" size="icon">
                    <Eye className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Download className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
