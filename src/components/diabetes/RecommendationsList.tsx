import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface RecommendationsListProps {
  recommendations: string[];
}

/**
 * Recommendations List Component
 * 
 * Displays personalized health recommendations for diabetes management.
 * Each recommendation is shown with a checkmark icon.
 */
export function RecommendationsList({ recommendations }: RecommendationsListProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recommendations</CardTitle>
      </CardHeader>
      <CardContent>
        {recommendations.length === 0 ? (
          <p className="text-muted-foreground text-sm">No recommendations available</p>
        ) : (
          <ul className="space-y-3">
            {recommendations.map((recommendation, index) => (
              <li key={index} className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
                <span className="text-sm">{recommendation}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
