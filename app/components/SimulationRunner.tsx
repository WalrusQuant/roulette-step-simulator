'use client';

import { useState, useCallback } from 'react';
import { BettingStrategy, SimulationResults } from '@/app/lib/types';
import { runSimulations, SimulationProgress } from '@/app/lib/simulation';
import { Button } from './Button';
import { Input } from './Input';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { ProgressBar } from './ProgressBar';
import { Disclaimer } from './Disclaimer';
import { Play, Square, AlertTriangle } from 'lucide-react';

export interface SimulationRunnerProps {
  strategy: BettingStrategy;
  onComplete: (results: SimulationResults) => void;
  onProgress?: (progress: SimulationProgress) => void;
}

export function SimulationRunner({
  strategy,
  onComplete,
  onProgress,
}: SimulationRunnerProps) {
  const [numSimulations, setNumSimulations] = useState(1000);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState<SimulationProgress | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  const handleProgress = useCallback(
    (p: SimulationProgress) => {
      setProgress(p);
      onProgress?.(p);
    },
    [onProgress]
  );

  const runSimulation = async () => {
    if (numSimulations > 10000 && !showWarning) {
      setShowWarning(true);
      return;
    }

    setIsRunning(true);
    setProgress({ current: 0, total: numSimulations, percent: 0 });
    setShowWarning(false);

    try {
      const results = await runSimulations(
        strategy,
        numSimulations,
        handleProgress
      );
      onComplete(results);
    } catch (error) {
      console.error('Simulation error:', error);
    } finally {
      setIsRunning(false);
      setProgress(null);
    }
  };

  const stopSimulation = () => {
    // Note: In a real implementation with Web Workers, we'd terminate the worker here
    setIsRunning(false);
    setProgress(null);
  };

  return (
    <Card variant="bordered">
      <CardHeader>
        <CardTitle>Run Simulation</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Disclaimer variant="banner" />

          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              label="Number of Simulations"
              type="number"
              min={100}
              max={100000}
              step={100}
              value={numSimulations}
              onChange={(e) =>
                setNumSimulations(
                  Math.min(100000, Math.max(100, parseInt(e.target.value) || 100))
                )
              }
              disabled={isRunning}
              helperText="100 - 100,000 simulations"
              className="flex-1"
            />

            <div className="flex items-end gap-2">
              {!isRunning ? (
                <Button
                  variant="primary"
                  onClick={runSimulation}
                  className="flex items-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Run {numSimulations.toLocaleString()} Simulations
                </Button>
              ) : (
                <Button
                  variant="danger"
                  onClick={stopSimulation}
                  className="flex items-center gap-2"
                >
                  <Square className="w-4 h-4" />
                  Stop
                </Button>
              )}
            </div>
          </div>

          {/* Warning Modal */}
          {showWarning && (
            <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-500 mb-1">
                    Large Simulation Warning
                  </p>
                  <p className="text-sm text-yellow-200/80 mb-3">
                    Running {numSimulations.toLocaleString()} simulations may take a while
                    and could slow down your browser. Are you sure you want to continue?
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={runSimulation}
                    >
                      Yes, Continue
                    </Button>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setShowWarning(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Progress */}
          {isRunning && progress && (
            <div className="space-y-2">
              <ProgressBar
                value={progress.current}
                max={progress.total}
                label="Simulation Progress"
                animated
                variant="default"
              />
              <p className="text-sm text-casino-muted text-center">
                Running simulation {progress.current.toLocaleString()} of{' '}
                {progress.total.toLocaleString()}...
              </p>
            </div>
          )}

          {/* Simulation Parameters Summary */}
          <div className="pt-4 border-t border-casino-border">
            <p className="text-sm font-medium text-casino-text mb-2">
              Strategy Parameters
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-casino-muted">Strategy:</span>
                <span className="text-casino-text ml-2">{strategy.name}</span>
              </div>
              <div>
                <span className="text-casino-muted">Initial:</span>
                <span className="text-casino-text ml-2">
                  ${strategy.initialBankroll.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-casino-muted">Target:</span>
                <span className="text-casino-text ml-2">
                  ${strategy.targetBankroll.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-casino-muted">Max Spins:</span>
                <span className="text-casino-text ml-2">
                  {strategy.maxIterations.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
