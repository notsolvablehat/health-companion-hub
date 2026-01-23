import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PredictionCard } from './PredictionCard';
import type { DiabetesPrediction } from '@/types/diabetes';

interface PredictionHistoryProps {
  predictions: DiabetesPrediction[];
}

/**
 * Prediction History Component
 * 
 * Displays a timeline of all AI diabetes predictions.
 * Predictions are shown in reverse chronological order (newest first).
 */
export function PredictionHistory({ predictions }: PredictionHistoryProps) {
  if (predictions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analysis History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {predictions.map((prediction) => (
            <PredictionCard key={prediction.analysis_id} prediction={prediction} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
