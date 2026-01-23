import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface SummaryCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
}

/**
 * Summary card component for displaying key metrics
 */
export function SummaryCard({ title, value, icon: Icon, iconColor = 'text-primary' }: SummaryCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-2">{value}</p>
          </div>
          <div className={`p-3 rounded-full bg-muted ${iconColor}`}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface DiabetesSummaryCardsProps {
  totalAnalyses: number;
  diabeticPredictionsCount: number;
  averageConfidence: number | null;
}

/**
 * Summary cards section for diabetes dashboard
 * 
 * Displays three key metrics:
 * - Total number of analyses performed
 * - Number of diabetic predictions
 * - Average prediction confidence
 */
export function DiabetesSummaryCards({
  totalAnalyses,
  diabeticPredictionsCount,
  averageConfidence,
}: DiabetesSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <SummaryCard
        title="Total Analyses"
        value={totalAnalyses}
        icon={({ className }) => (
          <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        )}
        iconColor="text-blue-600"
      />
      <SummaryCard
        title="Diabetic Predictions"
        value={diabeticPredictionsCount}
        icon={({ className }) => (
          <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        )}
        iconColor="text-orange-600"
      />
      <SummaryCard
        title="Average Confidence"
        value={averageConfidence ? `${(averageConfidence * 100).toFixed(1)}%` : 'N/A'}
        icon={({ className }) => (
          <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        )}
        iconColor="text-green-600"
      />
    </div>
  );
}
