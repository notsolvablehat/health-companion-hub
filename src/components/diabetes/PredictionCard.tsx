import { format } from 'date-fns';
import { FileText, TrendingUp, TrendingDown } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { DiabetesPrediction } from '@/types/diabetes';

interface PredictionCardProps {
  prediction: DiabetesPrediction;
}

/**
 * Individual Prediction Card Component
 * 
 * Displays a single AI prediction with:
 * - Report name and date
 * - Prediction result badge
 * - Confidence percentage
 */
export function PredictionCard({ prediction }: PredictionCardProps) {
  const isDiabetes = prediction.prediction_label === 'diabetes';
  const confidencePercent = (prediction.confidence * 100).toFixed(1);

  return (
    <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="p-2 rounded-lg bg-muted">
        <FileText className="h-5 w-5 text-muted-foreground" />
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium truncate">
              {prediction.report_name || 'Unnamed Report'}
            </h4>
            <p className="text-xs text-muted-foreground">
              {format(new Date(prediction.analyzed_at), 'PPP')}
            </p>
          </div>
          
          <div className="flex items-center gap-2 flex-shrink-0">
            {isDiabetes ? (
              <>
                <TrendingUp className="h-4 w-4 text-red-600" />
                <Badge variant="destructive" className="text-xs">
                  Diabetes
                </Badge>
              </>
            ) : (
              <>
                <TrendingDown className="h-4 w-4 text-green-600" />
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400 text-xs">
                  No Diabetes
                </Badge>
              </>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <div className="flex-1 bg-muted rounded-full h-1.5">
            <div
              className={`h-1.5 rounded-full ${
                prediction.confidence >= 0.8
                  ? 'bg-green-600'
                  : prediction.confidence >= 0.6
                  ? 'bg-yellow-600'
                  : 'bg-orange-600'
              }`}
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
          <span className="text-xs text-muted-foreground font-medium">
            {confidencePercent}%
          </span>
        </div>
      </div>
    </div>
  );
}
