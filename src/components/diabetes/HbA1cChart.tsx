import { format } from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
  TooltipProps,
} from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { HbA1cReading } from '@/types/diabetes';

interface HbA1cChartProps {
  readings: HbA1cReading[];
}

/**
 * Custom tooltip for HbA1c chart
 */
function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-background border border-border rounded-lg shadow-lg p-3">
      <p className="font-semibold">{data.date}</p>
      <p className="text-sm">
        <span className="font-medium">HbA1c:</span> {data.value}%
      </p>
      {data.status && (
        <p className="text-sm">
          <span className="font-medium">Status:</span>{' '}
          <span
            className={
              data.status === 'Normal'
                ? 'text-green-600'
                : data.status === 'Pre-diabetic'
                ? 'text-yellow-600'
                : 'text-red-600'
            }
          >
            {data.status}
          </span>
        </p>
      )}
    </div>
  );
}

/**
 * HbA1c Trend Chart Component
 * 
 * Displays glycated hemoglobin levels over time with clinical reference lines:
 * - Normal: < 5.7% (green line)
 * - Pre-diabetic: 5.7% - 6.4%
 * - Diabetic: ≥ 6.5% (red line)
 */
export function HbA1cChart({ readings }: HbA1cChartProps) {
  if (readings.length === 0) {
    return null;
  }

  // Transform data for chart (reverse to show oldest first)
  const chartData = [...readings]
    .reverse()
    .map((reading) => ({
      date: format(new Date(reading.date), 'MMM dd, yyyy'),
      value: reading.value,
      status: reading.status,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>HbA1c Trends</CardTitle>
        <CardDescription>Glycated hemoglobin levels over time</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="date"
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis
              domain={[4, 8]}
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              label={{ value: 'HbA1c (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Reference Lines */}
            <ReferenceLine
              y={5.7}
              stroke="hsl(var(--success))"
              strokeDasharray="3 3"
              label={{ value: 'Normal', position: 'right', fill: 'hsl(var(--success))' }}
            />
            <ReferenceLine
              y={6.5}
              stroke="hsl(var(--destructive))"
              strokeDasharray="3 3"
              label={{ value: 'Diabetic', position: 'right', fill: 'hsl(var(--destructive))' }}
            />
            
            {/* Data Line */}
            <Line
              type="monotone"
              dataKey="value"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              dot={{ r: 5, fill: 'hsl(var(--primary))' }}
              activeDot={{ r: 7 }}
              name="HbA1c (%)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
