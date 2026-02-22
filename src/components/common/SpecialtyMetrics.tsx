import { cn } from '@/lib/utils';

interface SpecialtyMetric {
  value: string;
  label: string;
  sub: string;
  cls: 'up' | 'down' | 'neutral';
}

interface SpecialtyMetricsProps {
  metrics: SpecialtyMetric[];
  specialisation: string;
}

export function SpecialtyMetrics({ metrics, specialisation }: SpecialtyMetricsProps) {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-3">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
          Specialty View
        </h3>
        <span className="text-xs px-2.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
          {specialisation}
        </span>
      </div>
      
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {metrics.map((metric, idx) => (
          <div
            key={idx}
            className={cn(
              "relative rounded-lg border bg-card p-4 text-center transition-all hover:border-muted-foreground/20 hover:-translate-y-0.5",
              "before:absolute before:top-0 before:left-0 before:right-0 before:h-0.5 before:rounded-t-lg before:opacity-60",
              metric.cls === 'up' && "before:bg-success",
              metric.cls === 'down' && "before:bg-destructive",
              metric.cls === 'neutral' && "before:bg-muted-foreground"
            )}
          >
            <div className="text-2xl font-semibold text-foreground mb-1">
              {metric.value}
            </div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">
              {metric.label}
            </div>
            <div
              className={cn(
                "text-[10px] font-medium",
                metric.cls === 'up' && "text-success",
                metric.cls === 'down' && "text-destructive",
                metric.cls === 'neutral' && "text-muted-foreground"
              )}
            >
              {metric.sub}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
