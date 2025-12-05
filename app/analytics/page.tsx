'use client';

import { useState, useEffect } from 'react';
import { SimulationResults, BettingStrategy } from '@/app/lib/types';
import { getSimulationHistory, getAllStrategies, clearSimulationHistory } from '@/app/lib/storage';
import { compareStrategies } from '@/app/lib/simulation';
import { formatCurrency, formatPercent, formatDateTime } from '@/app/lib/utils';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/app/components/Card';
import { Button } from '@/app/components/Button';
import { Select } from '@/app/components/Select';
import { StatCard, StatsGrid } from '@/app/components/StatCard';
import { DistributionChart } from '@/app/components/DistributionChart';
import { Disclaimer } from '@/app/components/Disclaimer';
import { ConfirmModal } from '@/app/components/Modal';
import { CHART_COLORS } from '@/app/lib/types';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Target,
  AlertTriangle,
  Trash2,
  GitCompare,
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AnalyticsPage() {
  const [history, setHistory] = useState<SimulationResults[]>([]);
  const [strategies, setStrategies] = useState<BettingStrategy[]>([]);
  const [selectedResult, setSelectedResult] = useState<SimulationResults | null>(null);
  const [compareResult1, setCompareResult1] = useState<string>('');
  const [compareResult2, setCompareResult2] = useState<string>('');
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    const loadedHistory = getSimulationHistory();
    setHistory(loadedHistory);
    setStrategies(getAllStrategies());
    if (loadedHistory.length > 0) {
      setSelectedResult(loadedHistory[loadedHistory.length - 1]);
    }
  }, []);

  const handleClearHistory = () => {
    clearSimulationHistory();
    setHistory([]);
    setSelectedResult(null);
    setShowClearConfirm(false);
    toast.success('Simulation history cleared');
  };

  const result1 = history.find((h) => h.timestamp.toString() === compareResult1);
  const result2 = history.find((h) => h.timestamp.toString() === compareResult2);
  const comparison =
    result1 && result2 ? compareStrategies(result1, result2) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
          <p className="text-casino-muted">
            Analyze simulation results and compare strategies
          </p>
        </div>
        {history.length > 0 && (
          <Button
            variant="ghost"
            onClick={() => setShowClearConfirm(true)}
            className="text-red-400 hover:text-red-300 flex items-center gap-2"
          >
            <Trash2 className="w-4 h-4" />
            Clear History
          </Button>
        )}
      </div>

      {history.length === 0 ? (
        <Card variant="bordered" className="flex flex-col items-center justify-center py-16">
          <BarChart3 className="w-16 h-16 text-casino-muted mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Simulation Data</h3>
          <p className="text-casino-muted text-center max-w-md mb-6">
            Run some simulations to see analytics data here. Your simulation
            history will be saved automatically.
          </p>
          <Button
            variant="primary"
            onClick={() => (window.location.href = '/simulator')}
          >
            Go to Simulator
          </Button>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Summary Stats */}
          <div>
            <h2 className="text-xl font-semibold text-white mb-4">
              Overall Statistics
            </h2>
            {(() => {
              // Calculate weighted averages based on number of simulations
              const totalSimulations = history.reduce((sum, h) => sum + h.numSimulations, 0);
              const weightedSuccessRate = totalSimulations > 0
                ? history.reduce((sum, h) => sum + (h.successRate * h.numSimulations), 0) / totalSimulations
                : 0;
              const totalBankruptcies = history.reduce((sum, h) => sum + h.bankruptcyCount, 0);
              const weightedBankruptcyRate = totalSimulations > 0
                ? (totalBankruptcies / totalSimulations) * 100
                : 0;

              return (
                <StatsGrid
                  stats={[
                    {
                      label: 'Total Simulations Run',
                      value: totalSimulations.toLocaleString(),
                      icon: <BarChart3 className="w-5 h-5" />,
                      variant: 'info',
                    },
                    {
                      label: 'Strategies Tested',
                      value: new Set(history.map((h) => h.strategyId)).size,
                      icon: <Target className="w-5 h-5" />,
                      variant: 'default',
                    },
                    {
                      label: 'Avg Success Rate',
                      value: formatPercent(weightedSuccessRate),
                      icon: <TrendingUp className="w-5 h-5" />,
                      variant: 'success',
                    },
                    {
                      label: 'Avg Bankruptcy Rate',
                      value: formatPercent(weightedBankruptcyRate),
                      icon: <AlertTriangle className="w-5 h-5" />,
                      variant: 'danger',
                    },
                  ]}
                  columns={4}
                />
              );
            })()}
          </div>

          {/* Recent Results */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Simulation History</CardTitle>
              <CardDescription>
                Select a simulation to view detailed results
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-casino-border">
                      <th className="text-left py-3 px-4 text-casino-muted font-medium">
                        Strategy
                      </th>
                      <th className="text-left py-3 px-4 text-casino-muted font-medium">
                        Simulations
                      </th>
                      <th className="text-left py-3 px-4 text-casino-muted font-medium">
                        Success Rate
                      </th>
                      <th className="text-left py-3 px-4 text-casino-muted font-medium">
                        Avg Bankroll
                      </th>
                      <th className="text-left py-3 px-4 text-casino-muted font-medium">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {history
                      .slice()
                      .reverse()
                      .map((result) => (
                        <tr
                          key={result.timestamp}
                          className={`border-b border-casino-border cursor-pointer hover:bg-casino-dark transition-colors ${
                            selectedResult?.timestamp === result.timestamp
                              ? 'bg-casino-dark'
                              : ''
                          }`}
                          onClick={() => setSelectedResult(result)}
                        >
                          <td className="py-3 px-4 text-casino-text">
                            {result.strategyName}
                          </td>
                          <td className="py-3 px-4 text-casino-text">
                            {result.numSimulations.toLocaleString()}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={
                                result.successRate >= 50
                                  ? 'text-green-400'
                                  : result.successRate >= 25
                                  ? 'text-yellow-400'
                                  : 'text-red-400'
                              }
                            >
                              {formatPercent(result.successRate)}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-casino-text">
                            {formatCurrency(result.avgFinalBankroll)}
                          </td>
                          <td className="py-3 px-4 text-casino-muted">
                            {formatDateTime(result.timestamp)}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Selected Result Details */}
          {selectedResult && (
            <Card variant="bordered">
              <CardHeader>
                <CardTitle>{selectedResult.strategyName} Results</CardTitle>
                <CardDescription>
                  {selectedResult.numSimulations.toLocaleString()} simulations run on{' '}
                  {formatDateTime(selectedResult.timestamp)}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-casino-text mb-4">
                      Key Metrics
                    </h4>
                    <div className="space-y-3">
                      <div className="flex justify-between p-3 bg-casino-dark rounded-lg">
                        <span className="text-casino-muted">Success Rate</span>
                        <span className="text-white font-medium">
                          {formatPercent(selectedResult.successRate)}
                        </span>
                      </div>
                      <div className="flex justify-between p-3 bg-casino-dark rounded-lg">
                        <span className="text-casino-muted">
                          Average Final Bankroll
                        </span>
                        <span className="text-white font-medium">
                          {formatCurrency(selectedResult.avgFinalBankroll)}
                        </span>
                      </div>
                      <div className="flex justify-between p-3 bg-casino-dark rounded-lg">
                        <span className="text-casino-muted">Bankruptcy Count</span>
                        <span className="text-white font-medium">
                          {selectedResult.bankruptcyCount.toLocaleString()} (
                          {formatPercent(
                            (selectedResult.bankruptcyCount /
                              selectedResult.numSimulations) *
                              100
                          )}
                          )
                        </span>
                      </div>
                      <div className="flex justify-between p-3 bg-casino-dark rounded-lg">
                        <span className="text-casino-muted">Expected Value</span>
                        <span
                          className={`font-medium ${
                            selectedResult.expectedValue >= 0
                              ? 'text-green-400'
                              : 'text-red-400'
                          }`}
                        >
                          {formatCurrency(selectedResult.expectedValue)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-casino-text mb-4">
                      Bankroll Distribution
                    </h4>
                    <DistributionChart
                      results={selectedResult}
                      initialBankroll={
                        strategies.find((s) => s.id === selectedResult.strategyId)
                          ?.initialBankroll || 500
                      }
                      height={250}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Strategy Comparison */}
          {history.length >= 2 && (
            <Card variant="bordered">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GitCompare className="w-5 h-5" />
                  Strategy Comparison
                </CardTitle>
                <CardDescription>
                  Compare two simulation results side by side
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <Select
                    label="First Simulation"
                    options={history.map((h) => ({
                      value: h.timestamp.toString(),
                      label: `${h.strategyName} - ${formatDateTime(h.timestamp)}`,
                    }))}
                    value={compareResult1}
                    onChange={(e) => setCompareResult1(e.target.value)}
                    placeholder="Select first simulation"
                  />
                  <Select
                    label="Second Simulation"
                    options={history.map((h) => ({
                      value: h.timestamp.toString(),
                      label: `${h.strategyName} - ${formatDateTime(h.timestamp)}`,
                    }))}
                    value={compareResult2}
                    onChange={(e) => setCompareResult2(e.target.value)}
                    placeholder="Select second simulation"
                  />
                </div>

                {comparison && result1 && result2 && (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-casino-border">
                          <th className="text-left py-3 px-4 text-casino-muted font-medium">
                            Metric
                          </th>
                          <th className="text-left py-3 px-4 text-casino-muted font-medium">
                            {result1.strategyName}
                          </th>
                          <th className="text-left py-3 px-4 text-casino-muted font-medium">
                            {result2.strategyName}
                          </th>
                          <th className="text-left py-3 px-4 text-casino-muted font-medium">
                            Difference
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-casino-border">
                          <td className="py-3 px-4 text-casino-text">
                            Success Rate
                          </td>
                          <td
                            className={`py-3 px-4 ${
                              comparison.strategy1Better.successRate
                                ? 'text-green-400'
                                : 'text-casino-text'
                            }`}
                          >
                            {formatPercent(result1.successRate)}
                          </td>
                          <td
                            className={`py-3 px-4 ${
                              !comparison.strategy1Better.successRate
                                ? 'text-green-400'
                                : 'text-casino-text'
                            }`}
                          >
                            {formatPercent(result2.successRate)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={
                                comparison.successRateDiff > 0
                                  ? 'text-green-400'
                                  : comparison.successRateDiff < 0
                                  ? 'text-red-400'
                                  : 'text-casino-muted'
                              }
                            >
                              {comparison.successRateDiff > 0 ? '+' : ''}
                              {formatPercent(comparison.successRateDiff)}
                            </span>
                          </td>
                        </tr>
                        <tr className="border-b border-casino-border">
                          <td className="py-3 px-4 text-casino-text">
                            Avg Bankroll
                          </td>
                          <td
                            className={`py-3 px-4 ${
                              comparison.strategy1Better.avgBankroll
                                ? 'text-green-400'
                                : 'text-casino-text'
                            }`}
                          >
                            {formatCurrency(result1.avgFinalBankroll)}
                          </td>
                          <td
                            className={`py-3 px-4 ${
                              !comparison.strategy1Better.avgBankroll
                                ? 'text-green-400'
                                : 'text-casino-text'
                            }`}
                          >
                            {formatCurrency(result2.avgFinalBankroll)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={
                                comparison.avgBankrollDiff > 0
                                  ? 'text-green-400'
                                  : comparison.avgBankrollDiff < 0
                                  ? 'text-red-400'
                                  : 'text-casino-muted'
                              }
                            >
                              {comparison.avgBankrollDiff > 0 ? '+' : ''}
                              {formatCurrency(comparison.avgBankrollDiff)}
                            </span>
                          </td>
                        </tr>
                        <tr className="border-b border-casino-border">
                          <td className="py-3 px-4 text-casino-text">
                            Expected Value
                          </td>
                          <td
                            className={`py-3 px-4 ${
                              comparison.strategy1Better.ev
                                ? 'text-green-400'
                                : 'text-casino-text'
                            }`}
                          >
                            {formatCurrency(result1.expectedValue)}
                          </td>
                          <td
                            className={`py-3 px-4 ${
                              !comparison.strategy1Better.ev
                                ? 'text-green-400'
                                : 'text-casino-text'
                            }`}
                          >
                            {formatCurrency(result2.expectedValue)}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={
                                comparison.evDiff > 0
                                  ? 'text-green-400'
                                  : comparison.evDiff < 0
                                  ? 'text-red-400'
                                  : 'text-casino-muted'
                              }
                            >
                              {comparison.evDiff > 0 ? '+' : ''}
                              {formatCurrency(comparison.evDiff)}
                            </span>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          <Disclaimer variant="banner" />
        </div>
      )}

      <ConfirmModal
        isOpen={showClearConfirm}
        onClose={() => setShowClearConfirm(false)}
        onConfirm={handleClearHistory}
        title="Clear Simulation History"
        message="Are you sure you want to clear all simulation history? This action cannot be undone."
        confirmText="Clear History"
        variant="danger"
      />
    </div>
  );
}
