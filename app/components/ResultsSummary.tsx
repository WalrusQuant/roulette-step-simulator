'use client';

import { SimulationResults } from '@/app/lib/types';
import { getSummaryStats } from '@/app/lib/simulation';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { StatsGrid, StatCardProps } from './StatCard';
import { MultiProgressBar } from './ProgressBar';
import { formatCurrency, formatPercent, formatNumber } from '@/app/lib/utils';
import { CHART_COLORS } from '@/app/lib/types';
import {
  Target,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart2,
  AlertCircle,
  Percent,
  Hash,
} from 'lucide-react';

export interface ResultsSummaryProps {
  results: SimulationResults;
  initialBankroll: number;
}

export function ResultsSummary({ results, initialBankroll }: ResultsSummaryProps) {
  const stats = getSummaryStats(results, initialBankroll);

  const primaryStats: StatCardProps[] = [
    {
      label: 'Success Rate',
      value: formatPercent(results.successRate),
      icon: <Target className="w-5 h-5" />,
      variant: results.successRate >= 50 ? 'success' : results.successRate >= 25 ? 'warning' : 'danger',
    },
    {
      label: 'Avg Final Bankroll',
      value: formatCurrency(results.avgFinalBankroll),
      icon: <DollarSign className="w-5 h-5" />,
      variant: results.avgFinalBankroll >= initialBankroll ? 'success' : 'danger',
    },
    {
      label: 'Bankruptcy Rate',
      value: formatPercent((results.bankruptcyCount / results.numSimulations) * 100),
      icon: <AlertCircle className="w-5 h-5" />,
      variant: results.bankruptcyCount === 0 ? 'success' : results.bankruptcyCount < results.numSimulations * 0.2 ? 'warning' : 'danger',
    },
    {
      label: 'Avg Spins to Win',
      value: results.avgIterationsToSuccess > 0
        ? formatNumber(results.avgIterationsToSuccess, 1)
        : 'N/A',
      icon: <Hash className="w-5 h-5" />,
      variant: 'info',
    },
  ];

  const outcomeSegments = [
    {
      value: results.profitCount - (results.numSimulations - results.bankruptcyCount - results.profitCount),
      color: CHART_COLORS.success,
      label: 'Goal Reached',
    },
    {
      value: results.numSimulations - results.bankruptcyCount - results.profitCount,
      color: CHART_COLORS.warning,
      label: 'Partial Loss',
    },
    {
      value: results.bankruptcyCount,
      color: CHART_COLORS.danger,
      label: 'Bankruptcy',
    },
  ].filter(s => s.value > 0);

  return (
    <div className="space-y-6">
      {/* Primary Stats */}
      <StatsGrid stats={primaryStats} columns={4} />

      {/* Outcome Distribution */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Outcome Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <MultiProgressBar
            segments={outcomeSegments}
            total={results.numSimulations}
            size="lg"
          />
        </CardContent>
      </Card>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Bankroll Statistics */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Bankroll Statistics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-casino-muted">Minimum</span>
                <span className="text-casino-text font-medium">
                  {formatCurrency(stats.min)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-casino-muted">5th Percentile</span>
                <span className="text-casino-text font-medium">
                  {formatCurrency(stats.percentile5)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-casino-muted">25th Percentile</span>
                <span className="text-casino-text font-medium">
                  {formatCurrency(stats.percentile25)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-casino-muted">Median</span>
                <span className="text-casino-text font-medium">
                  {formatCurrency(stats.median)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-casino-muted">75th Percentile</span>
                <span className="text-casino-text font-medium">
                  {formatCurrency(stats.percentile75)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-casino-muted">95th Percentile</span>
                <span className="text-casino-text font-medium">
                  {formatCurrency(stats.percentile95)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-casino-muted">Maximum</span>
                <span className="text-casino-text font-medium">
                  {formatCurrency(stats.max)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Risk Metrics */}
        <Card variant="bordered">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart2 className="w-5 h-5" />
              Risk Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-casino-muted">Standard Deviation</span>
                <span className="text-casino-text font-medium">
                  {formatCurrency(stats.stdDev)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-casino-muted">Variance</span>
                <span className="text-casino-text font-medium">
                  {formatNumber(stats.variance, 0)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-casino-muted">Risk of Ruin</span>
                <span className="text-casino-text font-medium">
                  {formatPercent(stats.riskOfRuin)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-casino-muted">Max Drawdown (Avg)</span>
                <span className="text-casino-text font-medium">
                  {formatCurrency(results.maxDrawdownAvg)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-casino-muted">Risk-Adjusted Return</span>
                <span className="text-casino-text font-medium">
                  {formatNumber(stats.riskAdjustedReturn, 3)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-casino-muted">Expected Value/Spin</span>
                <span className={`font-medium ${results.expectedValue >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatCurrency(results.expectedValue)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Educational Note */}
      <Card variant="bordered" className="bg-blue-900/10 border-blue-700/30">
        <CardContent>
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold text-blue-400 mb-1">
                Understanding the Results
              </p>
              <p className="text-blue-200/80">
                The expected value is negative because American roulette has a 5.26% house edge.
                Even strategies with high short-term success rates will lose money over time.
                These simulations demonstrate variance, not a path to profit.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
