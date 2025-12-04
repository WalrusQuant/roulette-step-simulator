'use client';

import { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { SimulationResults } from '@/app/lib/types';
import { CHART_COLORS } from '@/app/lib/types';
import { formatNumber } from '@/app/lib/utils';

export interface DistributionChartProps {
  results: SimulationResults;
  initialBankroll: number;
  height?: number;
  numBuckets?: number;
}

export function DistributionChart({
  results,
  initialBankroll,
  height = 300,
  numBuckets = 20,
}: DistributionChartProps) {
  const chartData = useMemo(() => {
    const bankrolls = results.allSimulations.map(s => s.finalBankroll);
    const min = Math.min(...bankrolls);
    const max = Math.max(...bankrolls);
    const range = max - min || 1;
    const bucketSize = range / numBuckets;

    const buckets: { range: string; count: number; start: number; end: number }[] = [];

    for (let i = 0; i < numBuckets; i++) {
      const start = min + i * bucketSize;
      const end = start + bucketSize;
      buckets.push({
        range: `$${formatNumber(start, 0)}`,
        count: 0,
        start,
        end,
      });
    }

    for (const bankroll of bankrolls) {
      let bucketIndex = Math.floor((bankroll - min) / bucketSize);
      if (bucketIndex >= numBuckets) bucketIndex = numBuckets - 1;
      if (bucketIndex < 0) bucketIndex = 0;
      buckets[bucketIndex].count++;
    }

    return buckets;
  }, [results, numBuckets]);

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer>
        <BarChart
          data={chartData}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
          <XAxis
            dataKey="range"
            stroke="#8B949E"
            tick={{ fill: '#8B949E', fontSize: 10 }}
            tickLine={{ stroke: '#30363D' }}
            axisLine={{ stroke: '#30363D' }}
            interval="preserveStartEnd"
          />
          <YAxis
            stroke="#8B949E"
            tick={{ fill: '#8B949E', fontSize: 12 }}
            tickLine={{ stroke: '#30363D' }}
            axisLine={{ stroke: '#30363D' }}
            label={{
              value: 'Count',
              angle: -90,
              position: 'insideLeft',
              fill: '#8B949E',
              fontSize: 12,
            }}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#161B22',
              border: '1px solid #30363D',
              borderRadius: '8px',
              color: '#C9D1D9',
            }}
            formatter={(value: number) => [value, 'Simulations']}
            labelFormatter={(_, payload) => {
              if (payload && payload[0]) {
                const data = payload[0].payload;
                return `$${formatNumber(data.start, 0)} - $${formatNumber(data.end, 0)}`;
              }
              return '';
            }}
          />
          <Bar dataKey="count" radius={[4, 4, 0, 0]}>
            {chartData.map((entry, index) => {
              let color = CHART_COLORS.primary;
              if (entry.end <= 0) {
                color = CHART_COLORS.danger;
              } else if (entry.start < initialBankroll && entry.end > initialBankroll) {
                color = CHART_COLORS.warning;
              } else if (entry.start >= initialBankroll) {
                color = CHART_COLORS.success;
              }
              return <Cell key={`cell-${index}`} fill={color} />;
            })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
