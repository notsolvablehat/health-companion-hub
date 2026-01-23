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
import type { BMIReading } from '@/types/diabetes';

interface BMIChartProps {
  readings: BMIReading[];
}

/**
 * Custom tooltip for BMI chart
 */
function CustomTooltip({ active, payload }: TooltipProps<number, string>) {
  if (!active || !payload || !payload.length) return null;

  const data = payload[0].payload;

  return (
    <div className="bg-background border border-border rounded-lg shadow-lg p-3">
      <p className="font-semibold">{data.date}</p>
      <p className="text-sm">
        <span className="font-medium">BMI:</span> {data.value}
      </p>
      {data.category && (
        <p className="text-sm">
          <span className="font-medium">Category:</span>{' '}
          <span
            className={
              data.category === 'Normal'
                ? 'text-green-600'
                : data.category === 'Underweight'
                ? 'text-blue-600'
                : data.category === 'Overweight'
                ? 'text-yellow-600'
                : 'text-red-600'
            }
          >
            {data.category}
          </span>
        </p>
      )}
    </div>
  );
}

/**
 * BMI Trend Chart Component
 * 
 * Displays Body Mass Index measurements over time with category reference lines:
 * - Underweight: < 18.5 (blue line)
 * - Normal: 18.5 - 24.9 (green line)
 * - Overweight: 25.0 - 29.9 (orange line)
 * - Obese: ≥ 30.0
 */
export function BMIChart({ readings }: BMIChartProps) {
  if (readings.length === 0) {
    return null;
  }

  // Transform data for chart (reverse to show oldest first)
  const chartData = [...readings]
    .reverse()
    .map((reading) => ({
      date: format(new Date(reading.date), 'MMM dd, yyyy'),
      value: reading.value,
      category: reading.category,
    }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>BMI History</CardTitle>
        <CardDescription>Body Mass Index measurements over time</CardDescription>
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
              domain={[15, 40]}
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              label={{ value: 'BMI (kg/m²)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            
            {/* Reference Lines */}
            <ReferenceLine
              y={18.5}
              stroke="#3b82f6"
              strokeDasharray="3 3"
              label={{ value: 'Underweight', position: 'right', fill: '#3b82f6' }}
            />
            <ReferenceLine
              y={25}
              stroke="hsl(var(--success))"
              strokeDasharray="3 3"
              label={{ value: 'Normal', position: 'right', fill: 'hsl(var(--success))' }}
            />
            <ReferenceLine
              y={30}
              stroke="#f97316"
              strokeDasharray="3 3"
              label={{ value: 'Overweight', position: 'right', fill: '#f97316' }}
            />
            
            {/* Data Line */}
            <Line
              type="monotone"
              dataKey="value"
              stroke="#ffc658"
              strokeWidth={2}
              dot={{ r: 5, fill: '#ffc658' }}
              activeDot={{ r: 7 }}
              name="BMI (kg/m²)"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
