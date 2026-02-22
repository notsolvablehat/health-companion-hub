import { FileText, AlertTriangle, TrendingUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface DiabetesSummaryCardsProps {
  totalAnalyses: number;
  diabeticPredictionsCount: number;
  averageConfidence: number | null;
}

export function DiabetesSummaryCards({
  totalAnalyses,
  diabeticPredictionsCount,
  averageConfidence,
}: DiabetesSummaryCardsProps) {
  const cards = [
    {
      title: 'Total Analyses',
      value: totalAnalyses,
      icon: FileText,
      color: 'text-info',
    },
    {
      title: 'Diabetic Predictions',
      value: diabeticPredictionsCount,
      icon: AlertTriangle,
      color: 'text-warning',
    },
    {
      title: 'Average Confidence',
      value: averageConfidence ? `${(averageConfidence * 100).toFixed(1)}%` : 'N/A',
      icon: TrendingUp,
      color: 'text-success',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.title}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
                  <p className="text-2xl font-bold mt-2">{card.value}</p>
                </div>
                <div className={`p-3 rounded-full bg-muted ${card.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
