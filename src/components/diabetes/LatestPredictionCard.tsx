import { format } from 'date-fns';
import { FileText, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import type { DiabetesPrediction } from '@/types/diabetes';

interface LatestPredictionCardProps {
  prediction: DiabetesPrediction;
}

/**
 * Latest prediction card component
 * 
 * Displays the most recent AI diabetes prediction with:
 * - Report name and analysis date
 * - Prediction result (diabetes/no diabetes)
 * - Confidence score with visual indicator
 */
export function LatestPredictionCard({ prediction }: LatestPredictionCardProps) {
  const isDiabetes = prediction.prediction_label === 'diabetes';
  const confidencePercent = (prediction.confidence * 100).toFixed(1);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Latest Analysis
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Report Info */}
        <div>
          <p className="text-sm text-muted-foreground">Report</p>
          <p className="font-medium">{prediction.report_name || 'Unnamed Report'}</p>
          <p className="text-xs text-muted-foreground mt-1">
            Analyzed on {format(new Date(prediction.analyzed_at), 'PPP')}
          </p>
        </div>

        {/* Prediction Result */}
        <div>
          <p className="text-sm text-muted-foreground mb-2">Prediction</p>
          <div className="flex items-center gap-2">
            {isDiabetes ? (
              <>
                <TrendingUp className="h-5 w-5 text-red-600" />
                <Badge variant="destructive">Diabetes Detected</Badge>
              </>
            ) : (
              <>
                <TrendingDown className="h-5 w-5 text-green-600" />
                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900/20 dark:text-green-400">
                  No Diabetes
                </Badge>
              </>
            )}
          </div>
        </div>

        {/* Confidence Meter */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-muted-foreground">Confidence</p>
            <p className="text-sm font-semibold">{confidencePercent}%</p>
          </div>
          <div className="w-full bg-muted rounded-full h-2.5">
            <div
              className={`h-2.5 rounded-full transition-all ${
                prediction.confidence >= 0.8
                  ? 'bg-green-600'
                  : prediction.confidence >= 0.6
                  ? 'bg-yellow-600'
                  : 'bg-orange-600'
              }`}
              style={{ width: `${confidencePercent}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {prediction.confidence >= 0.8
              ? 'High confidence'
              : prediction.confidence >= 0.6
              ? 'Moderate confidence'
              : 'Low confidence'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
