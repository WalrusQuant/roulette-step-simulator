'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import toast from 'react-hot-toast';
import { BettingStrategy, SimulationResults } from '@/app/lib/types';
import { getAllStrategies, saveSimulationResult } from '@/app/lib/storage';
import { Button } from '@/app/components/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/app/components/Card';
import { Select } from '@/app/components/Select';
import { SimulationRunner } from '@/app/components/SimulationRunner';
import { ResultsSummary } from '@/app/components/ResultsSummary';
import { BankrollChart } from '@/app/components/BankrollChart';
import { DistributionChart } from '@/app/components/DistributionChart';
import { Disclaimer } from '@/app/components/Disclaimer';
import { Download, Trash2 } from 'lucide-react';

function SimulatorContent() {
  const searchParams = useSearchParams();
  const [strategies, setStrategies] = useState<BettingStrategy[]>([]);
  const [selectedStrategyId, setSelectedStrategyId] = useState<string>('');
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [selectedSimIndex, setSelectedSimIndex] = useState(0);

  useEffect(() => {
    const allStrategies = getAllStrategies();
    setStrategies(allStrategies);

    // Check for strategy query parameter from deep link
    const strategyParam = searchParams.get('strategy');
    if (strategyParam && allStrategies.some(s => s.id === strategyParam)) {
      setSelectedStrategyId(strategyParam);
    } else if (allStrategies.length > 0) {
      setSelectedStrategyId(allStrategies[0].id);
    }
  }, [searchParams]);

  const selectedStrategy = strategies.find((s) => s.id === selectedStrategyId);

  const handleComplete = (resultData: SimulationResults) => {
    setResults(resultData);
    setSelectedSimIndex(0);
    saveSimulationResult(resultData);
    toast.success(`Simulation complete! Success rate: ${resultData.successRate.toFixed(1)}%`);
  };

  const handleExportResults = () => {
    if (!results) return;

    const exportData = {
      ...results,
      allSimulations: results.allSimulations.map((sim) => ({
        finalBankroll: sim.finalBankroll,
        iterations: sim.iterations,
        goalReached: sim.goalReached,
        maxDrawdown: sim.maxDrawdown,
        endReason: sim.endReason,
      })),
    };

    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `simulation-${results.strategyName}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success('Results exported!');
  };

  const handleClearResults = () => {
    setResults(null);
    setSelectedSimIndex(0);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Simulation Engine</h1>
        <p className="text-casino-muted">
          Run Monte Carlo simulations to analyze betting strategies
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Strategy Selection & Runner */}
        <div className="lg:col-span-1 space-y-6">
          {/* Strategy Selection */}
          <Card variant="bordered">
            <CardHeader>
              <CardTitle>Select Strategy</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                options={strategies.map((s) => ({
                  value: s.id,
                  label: `${s.name}${s.isPreloaded ? ' (Preloaded)' : ''}`,
                }))}
                value={selectedStrategyId}
                onChange={(e) => setSelectedStrategyId(e.target.value)}
              />
              {selectedStrategy && (
                <div className="mt-4 p-4 bg-casino-dark rounded-lg">
                  <p className="text-sm text-casino-text mb-3">
                    {selectedStrategy.description}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-casino-muted">Initial:</span>
                      <span className="text-casino-text ml-1">
                        ${selectedStrategy.initialBankroll}
                      </span>
                    </div>
                    <div>
                      <span className="text-casino-muted">Target:</span>
                      <span className="text-casino-text ml-1">
                        ${selectedStrategy.targetBankroll}
                      </span>
                    </div>
                    <div>
                      <span className="text-casino-muted">Steps:</span>
                      <span className="text-casino-text ml-1">
                        {selectedStrategy.steps.length}
                      </span>
                    </div>
                    <div>
                      <span className="text-casino-muted">Max Spins:</span>
                      <span className="text-casino-text ml-1">
                        {selectedStrategy.maxIterations}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Simulation Runner */}
          {selectedStrategy && (
            <SimulationRunner
              strategy={selectedStrategy}
              onComplete={handleComplete}
            />
          )}

          {/* Actions */}
          {results && (
            <Card variant="bordered">
              <CardContent>
                <div className="flex flex-col gap-2">
                  <Button
                    variant="secondary"
                    onClick={handleExportResults}
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Export Results
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={handleClearResults}
                    className="w-full flex items-center justify-center gap-2 text-red-400 hover:text-red-300"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear Results
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Column - Results */}
        <div className="lg:col-span-2 space-y-6">
          {!results && (
            <Card variant="bordered" className="flex items-center justify-center min-h-[400px]">
              <div className="text-center">
                <p className="text-casino-muted mb-4">
                  Select a strategy and run a simulation to see results
                </p>
                <Disclaimer />
              </div>
            </Card>
          )}

          {results && selectedStrategy && (
            <>
              {/* Summary Stats */}
              <ResultsSummary
                results={results}
                initialBankroll={selectedStrategy.initialBankroll}
              />

              {/* Distribution Chart */}
              <Card variant="bordered">
                <CardHeader>
                  <CardTitle>Final Bankroll Distribution</CardTitle>
                  <CardDescription>
                    Distribution of final bankroll values across all simulations
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <DistributionChart
                    results={results}
                    initialBankroll={selectedStrategy.initialBankroll}
                    height={300}
                  />
                </CardContent>
              </Card>

              {/* Sample Simulation Browser */}
              <Card variant="bordered">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Browse Simulations</CardTitle>
                      <CardDescription>
                        View individual simulation results
                      </CardDescription>
                    </div>
                    <Select
                      options={results.allSimulations.slice(0, 100).map((sim, i) => ({
                        value: i.toString(),
                        label: `Sim #${i + 1} - $${sim.finalBankroll.toFixed(0)} (${sim.endReason.replace('_', ' ')})`,
                      }))}
                      value={selectedSimIndex.toString()}
                      onChange={(e) => setSelectedSimIndex(parseInt(e.target.value))}
                      className="w-64"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <BankrollChart
                    data={results.allSimulations[selectedSimIndex]}
                    initialBankroll={selectedStrategy.initialBankroll}
                    targetBankroll={selectedStrategy.targetBankroll}
                    chartType="area"
                    height={350}
                  />
                  <div className="mt-4 grid grid-cols-4 gap-4 text-sm">
                    <div className="text-center p-3 bg-casino-dark rounded-lg">
                      <p className="text-casino-muted">Final Bankroll</p>
                      <p className="text-lg font-bold text-white">
                        ${results.allSimulations[selectedSimIndex].finalBankroll.toFixed(0)}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-casino-dark rounded-lg">
                      <p className="text-casino-muted">Spins</p>
                      <p className="text-lg font-bold text-white">
                        {results.allSimulations[selectedSimIndex].iterations}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-casino-dark rounded-lg">
                      <p className="text-casino-muted">Max Drawdown</p>
                      <p className="text-lg font-bold text-white">
                        ${results.allSimulations[selectedSimIndex].maxDrawdown.toFixed(0)}
                      </p>
                    </div>
                    <div className="text-center p-3 bg-casino-dark rounded-lg">
                      <p className="text-casino-muted">Result</p>
                      <p
                        className={`text-lg font-bold ${
                          results.allSimulations[selectedSimIndex].goalReached
                            ? 'text-green-400'
                            : results.allSimulations[selectedSimIndex].finalBankroll <= 0
                            ? 'text-red-400'
                            : 'text-yellow-400'
                        }`}
                      >
                        {results.allSimulations[selectedSimIndex].endReason.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SimulatorPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Simulation Engine</h1>
          <p className="text-casino-muted">Loading...</p>
        </div>
      </div>
    }>
      <SimulatorContent />
    </Suspense>
  );
}
