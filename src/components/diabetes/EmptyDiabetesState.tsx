import { FileText, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/lib/constants';

interface EmptyDiabetesStateProps {
  message?: string;
}

/**
 * Empty state component shown when no diabetes data is available
 * 
 * Displays a friendly message prompting users to upload medical reports
 * for AI analysis to start tracking diabetes indicators.
 */
export function EmptyDiabetesState({ message }: EmptyDiabetesStateProps) {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <div className="text-center max-w-md">
        <div className="mx-auto w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
          <FileText className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-semibold mb-2">No Diabetes Data Available</h2>
        <p className="text-muted-foreground mb-6">
          {message || 'Upload and analyze medical reports to start tracking diabetes indicators.'}
        </p>
        <Button onClick={() => navigate(ROUTES.PATIENT_REPORTS)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Reports
        </Button>
      </div>
    </div>
  );
}
