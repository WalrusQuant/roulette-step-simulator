'use client';

import { SimulationResults } from '@/app/lib/types';
import { getSummaryStats } from '@/app/lib/simulation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './Card';
import { StatsGrid, StatCardProps } from './StatCard';
import { MultiProgressBar } from './ProgressBar';
import { formatCurrency, formatPercent, formatNumber } from '@/app/lib/utils';
import { CHART_COLORS } from '@/app/lib/types';
import {
  Target,
  DollarSign,
  BarChart2,
  AlertCircle,
  Hash,
  Layers,
  RefreshCw,
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

  // Calculate outcome counts correctly:
  // - Goal Reached: profitCount (simulations where goal was achieved)
  // - Partial Loss: simulations that didn't reach goal and didn't go bankrupt
  // - Bankruptcy: bankruptcyCount
  const partialLossCount = results.numSimulations - results.profitCount - results.bankruptcyCount;

  const outcomeSegments = [
    {
      value: results.profitCount,
      color: CHART_COLORS.success,
      label: 'Goal Reached',
    },
    {
      value: partialLossCount,
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

      {/* Step Progression Funnel */}
      {results.stepStatistics && results.stepStatistics.length > 0 && (
        <Card variant="bordered">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="w-5 h-5" />
              Step Progression Funnel
            </CardTitle>
            <CardDescription>
              How simulations progressed through each step
              {results.avgCompletedCycles !== undefined && results.avgCompletedCycles > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 text-casino-muted">
                  <RefreshCw className="w-3 h-3" />
                  Avg {formatNumber(results.avgCompletedCycles, 1)} cycles/sim
                </span>
              )}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.stepStatistics.map((stepStats, index) => {
                const winRate = stepStats.timesReached > 0
                  ? (stepStats.timesWon / stepStats.timesReached) * 100
                  : 0;
                const maxReached = Math.max(...results.stepStatistics!.map(s => s.timesReached));
                const barWidth = maxReached > 0 ? (stepStats.timesReached / maxReached) * 100 : 0;

                return (
                  <div key={stepStats.stepId} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 flex items-center justify-center rounded-full bg-casino-accent/20 text-casino-accent text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="text-casino-text font-medium">
                          Step {index + 1}
                        </span>
                        <span className="text-casino-muted text-sm">
                          ({stepStats.stepId})
                        </span>
                      </div>
                      <div className="text-right text-sm">
                        <span className="text-casino-text">
                          {formatNumber(stepStats.timesReached, 0)} reached
                        </span>
                        <span className="text-casino-muted ml-2">
                          ({formatPercent(winRate)} win rate)
                        </span>
                      </div>
                    </div>

                    {/* Funnel bar */}
                    <div className="relative h-8 bg-casino-dark rounded overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gradient-to-r from-casino-accent/40 to-casino-accent/20 transition-all duration-300"
                        style={{ width: `${barWidth}%` }}
                      />
                      <div className="absolute inset-0 flex items-center px-3">
                        <div className="flex gap-4 text-xs">
                          <span className="text-green-400">
                            {formatNumber(stepStats.timesWon, 0)} wins
                          </span>
                          <span className="text-red-400">
                            {formatNumber(stepStats.timesLost, 0)} losses
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Tier outcomes if available */}
                    {stepStats.tierOutcomes.length > 0 && (
                      <div className="ml-8 flex flex-wrap gap-2">
                        {stepStats.tierOutcomes.map((tier) => (
                          <span
                            key={tier.tierName}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-casino-dark rounded text-xs"
                          >
                            <span className="text-casino-accent">{tier.tierName}:</span>
                            <span className="text-casino-text">{formatNumber(tier.count, 0)}x</span>
                            <span className="text-casino-muted">
                              (avg {formatCurrency(tier.totalPayout / tier.count)})
                            </span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

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
