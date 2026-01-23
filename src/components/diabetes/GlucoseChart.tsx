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
import type { FastingGlucoseReading } from '@/types/diabetes';

interface GlucoseChartProps {
  readings: FastingGlucoseReading[];
}

/**
 * Custom tooltip for glucose chart
 */
function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-background border border-border rounded-lg shadow-lg p-3">
      <p className="font-semibold">{data.date}</p>
      <p className="text-sm">
        <span className="font-medium">Glucose:</span> {data.value} mg/dL
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
 * Fasting Glucose Trend Chart Component
 * 
 * Displays fasting blood glucose levels over time with clinical reference lines:
 * - Normal: < 100 mg/dL (green line)
 * - Pre-diabetic: 100 - 125 mg/dL
 * - Diabetic: ≥ 126 mg/dL (red line)
 */
export function GlucoseChart({ readings }: GlucoseChartProps) {
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
        <CardTitle>Fasting Glucose Trends</CardTitle>
        <CardDescription>Blood glucose levels over time</CardDescription>
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
              domain={[70, 150]}
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              label={{ value: 'Glucose (mg/dL)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Reference Lines */}
            <ReferenceLine
              y={100}
              stroke="hsl(var(--success))"
              strokeDasharray="3 3"
              label={{ value: 'Normal', position: 'right', fill: 'hsl(var(--success))' }}
            />
            <ReferenceLine
              y={126}
              stroke="hsl(var(--destructive))"
              strokeDasharray="3 3"
              label={{ value: 'Diabetic', position: 'right', fill: 'hsl(var(--destructive))' }}
            />
            
            {/* Data Line */}
            <Line
              type="monotone"
              dataKey="value"
              stroke="#82ca9d"
              strokeWidth={2}
              dot={{ r: 5, fill: '#82ca9d' }}
              activeDot={{ r: 7 }}
              name="Glucose (mg/dL)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
