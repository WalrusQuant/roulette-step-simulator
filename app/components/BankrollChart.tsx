'use client';

import { useMemo } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { SingleSimulationResult } from '@/app/lib/types';
import { formatCurrency } from '@/app/lib/utils';
import { CHART_COLORS } from '@/app/lib/types';

export interface BankrollChartProps {
  data: SingleSimulationResult | SingleSimulationResult[];
  initialBankroll: number;
  targetBankroll: number;
  chartType?: 'line' | 'area';
  height?: number;
  showTarget?: boolean;
  showInitial?: boolean;
  maxDataPoints?: number;
}

export function BankrollChart({
  data,
  initialBankroll,
  targetBankroll,
  chartType = 'line',
  height = 300,
  showTarget = true,
  showInitial = true,
  maxDataPoints = 200,
}: BankrollChartProps) {
  const chartData = useMemo(() => {
    const simulations = Array.isArray(data) ? data : [data];

    // If multiple simulations, show an average line
    if (simulations.length > 1) {
      const maxLength = Math.max(...simulations.map(s => s.bankrollHistory.length));
      const avgData: { spin: number; bankroll: number }[] = [];

      for (let i = 0; i < maxLength; i++) {
        let sum = 0;
        let count = 0;
        for (const sim of simulations) {
          if (i < sim.bankrollHistory.length) {
            sum += sim.bankrollHistory[i];
            count++;
          }
        }
        avgData.push({
          spin: i,
          bankroll: count > 0 ? sum / count : 0,
        });
      }

      // Downsample if too many points
      if (avgData.length > maxDataPoints) {
        const step = Math.ceil(avgData.length / maxDataPoints);
        return avgData.filter((_, i) => i % step === 0 || i === avgData.length - 1);
      }

      return avgData;
    }

    // Single simulation
    const history = simulations[0].bankrollHistory;
    let result = history.map((bankroll, index) => ({
      spin: index,
      bankroll,
    }));

    // Downsample if too many points
    if (result.length > maxDataPoints) {
      const step = Math.ceil(result.length / maxDataPoints);
      result = result.filter((_, i) => i % step === 0 || i === result.length - 1);
    }

    return result;
  }, [data, maxDataPoints]);

  const minBankroll = Math.min(...chartData.map(d => d.bankroll), 0);
  const maxBankroll = Math.max(...chartData.map(d => d.bankroll), targetBankroll);
  const yDomain = [
    Math.floor(minBankroll * 0.9),
    Math.ceil(maxBankroll * 1.1),
  ];

  const Chart = chartType === 'area' ? AreaChart : LineChart;
  const DataComponent = chartType === 'area' ? Area : Line;

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer>
        <Chart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="bankrollGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={CHART_COLORS.primary} stopOpacity={0.3} />
              <stop offset="95%" stopColor={CHART_COLORS.primary} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#30363D" />
          <XAxis
            dataKey="spin"
            stroke="#8B949E"
            tick={{ fill: '#8B949E', fontSize: 12 }}
            tickLine={{ stroke: '#30363D' }}
            axisLine={{ stroke: '#30363D' }}
            label={{
              value: 'Spin',
              position: 'bottom',
              fill: '#8B949E',
              fontSize: 12,
            }}
          />
          <YAxis
            domain={yDomain}
            stroke="#8B949E"
            tick={{ fill: '#8B949E', fontSize: 12 }}
            tickLine={{ stroke: '#30363D' }}
            axisLine={{ stroke: '#30363D' }}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#161B22',
              border: '1px solid #30363D',
              borderRadius: '8px',
              color: '#C9D1D9',
            }}
            formatter={(value: number) => [formatCurrency(value), 'Bankroll']}
            labelFormatter={(label) => `Spin ${label}`}
          />
          {showTarget && (
            <ReferenceLine
              y={targetBankroll}
              stroke={CHART_COLORS.success}
              strokeDasharray="5 5"
              label={{
                value: 'Target',
                position: 'right',
                fill: CHART_COLORS.success,
                fontSize: 12,
              }}
            />
          )}
          {showInitial && (
            <ReferenceLine
              y={initialBankroll}
              stroke={CHART_COLORS.neutral}
              strokeDasharray="5 5"
              label={{
                value: 'Initial',
                position: 'right',
                fill: CHART_COLORS.neutral,
                fontSize: 12,
              }}
            />
          )}
          <ReferenceLine
            y={0}
            stroke={CHART_COLORS.danger}
            strokeDasharray="5 5"
            label={{
              value: 'Bankruptcy',
              position: 'right',
              fill: CHART_COLORS.danger,
              fontSize: 12,
            }}
          />
          <DataComponent
            type="monotone"
            dataKey="bankroll"
            stroke={CHART_COLORS.primary}
            strokeWidth={2}
            fill={chartType === 'area' ? 'url(#bankrollGradient)' : undefined}
            dot={false}
            activeDot={{ r: 4, fill: CHART_COLORS.primary }}
          />
        </Chart>
      </ResponsiveContainer>
    </div>
  );
}
