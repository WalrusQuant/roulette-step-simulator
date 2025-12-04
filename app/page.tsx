'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { BettingStrategy, SimulationResults } from '@/app/lib/types';
import { PRELOADED_STRATEGIES, createBlankStrategy } from '@/app/lib/preloadedStrategies';
import { saveStrategy } from '@/app/lib/storage';
import { runSimulations } from '@/app/lib/simulation';
import { Button } from '@/app/components/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/app/components/Card';
import { StrategyBuilder } from '@/app/components/StrategyBuilder';
import { StrategyCard } from '@/app/components/StrategyCard';
import { SimulationRunner } from '@/app/components/SimulationRunner';
import { ResultsSummary } from '@/app/components/ResultsSummary';
import { BankrollChart } from '@/app/components/BankrollChart';
import { Disclaimer } from '@/app/components/Disclaimer';
import {
  Play,
  Sparkles,
  ArrowRight,
  Target,
  BarChart3,
  Zap,
  Shield,
} from 'lucide-react';

export default function HomePage() {
  const router = useRouter();
  const [selectedStrategy, setSelectedStrategy] = useState<BettingStrategy | null>(null);
  const [results, setResults] = useState<SimulationResults | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);

  const handleSelectStrategy = (strategy: BettingStrategy) => {
    setSelectedStrategy(strategy);
    setResults(null);
  };

  const handleSaveStrategy = (strategy: BettingStrategy) => {
    const success = saveStrategy(strategy);
    if (success) {
      toast.success('Strategy saved successfully!');
      setSelectedStrategy(strategy);
    } else {
      toast.error('Failed to save strategy');
    }
  };

  const handleRunSimulation = (resultData: SimulationResults) => {
    setResults(resultData);
    toast.success(`Simulation complete! Success rate: ${resultData.successRate.toFixed(1)}%`);
  };

  const handleQuickRun = async (strategy: BettingStrategy) => {
    setSelectedStrategy(strategy);
    toast.loading('Running quick simulation...', { id: 'quick-sim' });
    try {
      const resultData = await runSimulations(strategy, 1000);
      setResults(resultData);
      toast.success(`Success rate: ${resultData.successRate.toFixed(1)}%`, { id: 'quick-sim' });
    } catch (error) {
      toast.error('Simulation failed', { id: 'quick-sim' });
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24">
        <div className="absolute inset-0 bg-gradient-to-br from-roulette-green/10 via-casino-darker to-roulette-red/10" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6">
              Roulette Step{' '}
              <span className="text-gradient from-roulette-red to-roulette-gold">
                Simulator
              </span>
            </h1>
            <p className="text-lg sm:text-xl text-casino-muted max-w-3xl mx-auto mb-8">
              Design, test, and analyze multi-step progressive betting strategies
              with sophisticated Monte Carlo simulations. Understand the math behind
              roulette betting systems.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button
                size="lg"
                onClick={() => setIsBuilding(true)}
                className="flex items-center gap-2"
              >
                <Sparkles className="w-5 h-5" />
                Build Strategy
              </Button>
              <Link href="/strategies">
                <Button size="lg" variant="secondary" className="flex items-center gap-2">
                  <Play className="w-5 h-5" />
                  Browse Strategies
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 border-t border-casino-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card variant="bordered" className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
                  <Target className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">Strategy Builder</h3>
                <p className="text-sm text-casino-muted">
                  Create custom multi-step betting progressions with all standard bet types
                </p>
              </CardContent>
            </Card>

            <Card variant="bordered" className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                  <Zap className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">Monte Carlo Engine</h3>
                <p className="text-sm text-casino-muted">
                  Run up to 100,000 simulations for statistically significant results
                </p>
              </CardContent>
            </Card>

            <Card variant="bordered" className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mx-auto mb-4">
                  <BarChart3 className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">Analytics Dashboard</h3>
                <p className="text-sm text-casino-muted">
                  Visualize results with interactive charts and detailed statistics
                </p>
              </CardContent>
            </Card>

            <Card variant="bordered" className="text-center">
              <CardContent className="pt-6">
                <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-6 h-6 text-yellow-400" />
                </div>
                <h3 className="font-semibold text-white mb-2">Educational Focus</h3>
                <p className="text-sm text-casino-muted">
                  Learn about probability, expected value, and why the house always wins
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Strategy Builder / Results Section */}
      {isBuilding && (
        <section className="py-12 border-t border-casino-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-white">Strategy Builder</h2>
              <Button variant="ghost" onClick={() => setIsBuilding(false)}>
                Close
              </Button>
            </div>
            <StrategyBuilder
              strategy={selectedStrategy || undefined}
              onSave={handleSaveStrategy}
              onRun={(strategy) => setSelectedStrategy(strategy)}
            />
          </div>
        </section>
      )}

      {/* Simulation Section */}
      {selectedStrategy && !isBuilding && (
        <section className="py-12 border-t border-casino-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedStrategy.name}</h2>
                <p className="text-casino-muted">{selectedStrategy.description}</p>
              </div>
              <Button variant="ghost" onClick={() => setSelectedStrategy(null)}>
                Change Strategy
              </Button>
            </div>

            <SimulationRunner
              strategy={selectedStrategy}
              onComplete={handleRunSimulation}
            />

            {results && (
              <div className="mt-8 space-y-8">
                <ResultsSummary
                  results={results}
                  initialBankroll={selectedStrategy.initialBankroll}
                />

                {/* Sample Bankroll Chart */}
                {results.allSimulations.length > 0 && (
                  <Card variant="bordered">
                    <CardHeader>
                      <CardTitle>Sample Bankroll Progression</CardTitle>
                      <CardDescription>
                        Showing a sample simulation run (first of {results.numSimulations.toLocaleString()})
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <BankrollChart
                        data={results.allSimulations[0]}
                        initialBankroll={selectedStrategy.initialBankroll}
                        targetBankroll={selectedStrategy.targetBankroll}
                        chartType="area"
                        height={350}
                      />
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </section>
      )}

      {/* Quick Start Strategies */}
      {!selectedStrategy && !isBuilding && (
        <section className="py-12 border-t border-casino-border">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-white">Quick Start</h2>
                <p className="text-casino-muted">
                  Try one of our pre-loaded strategies to see how the simulator works
                </p>
              </div>
              <Link href="/strategies">
                <Button variant="ghost" className="flex items-center gap-2">
                  View All <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PRELOADED_STRATEGIES.slice(0, 6).map((strategy) => (
                <StrategyCard
                  key={strategy.id}
                  strategy={strategy}
                  onRun={handleQuickRun}
                  onDuplicate={(s) => {
                    const newStrategy = { ...s, id: `${s.id}-copy`, name: `${s.name} (Copy)`, isPreloaded: false };
                    setSelectedStrategy(newStrategy);
                    setIsBuilding(true);
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Disclaimer */}
      <section className="py-12 border-t border-casino-border">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Disclaimer variant="banner" />
        </div>
      </section>
    </div>
  );
}
