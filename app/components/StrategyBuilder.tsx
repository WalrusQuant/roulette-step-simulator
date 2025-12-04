'use client';

import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { BettingStrategy, BetStep } from '@/app/lib/types';
import { createBlankStrategy } from '@/app/lib/preloadedStrategies';
import { validateStrategy } from '@/app/lib/roulette';
import { Button } from './Button';
import { Input } from './Input';
import { Card, CardHeader, CardTitle, CardContent } from './Card';
import { StepEditor } from './StepEditor';
import { Plus, Save, Play, AlertTriangle } from 'lucide-react';
import { cn } from '@/app/lib/utils';

export interface StrategyBuilderProps {
  strategy?: BettingStrategy;
  onSave?: (strategy: BettingStrategy) => void;
  onRun?: (strategy: BettingStrategy) => void;
  readOnly?: boolean;
}

export function StrategyBuilder({
  strategy: initialStrategy,
  onSave,
  onRun,
  readOnly = false,
}: StrategyBuilderProps) {
  const [strategy, setStrategy] = useState<BettingStrategy>(
    initialStrategy || createBlankStrategy()
  );
  const [errors, setErrors] = useState<string[]>([]);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (initialStrategy) {
      setStrategy(initialStrategy);
      setHasChanges(false);
    }
  }, [initialStrategy]);

  const updateStrategy = (updates: Partial<BettingStrategy>) => {
    setStrategy((prev) => ({ ...prev, ...updates, modifiedAt: Date.now() }));
    setHasChanges(true);
    setErrors([]);
  };

  const updateStep = (index: number, updatedStep: BetStep) => {
    const newSteps = [...strategy.steps];
    newSteps[index] = updatedStep;
    updateStrategy({ steps: newSteps });
  };

  const addStep = () => {
    const newStep: BetStep = {
      id: uuidv4(),
      bets: [{ betType: 'even_money', betAmount: 10, betDetail: 'red' }],
      continueOnWin: true,
      resetOnLoss: true,
    };
    updateStrategy({ steps: [...strategy.steps, newStep] });
  };

  const removeStep = (index: number) => {
    if (strategy.steps.length <= 1) return;
    const newSteps = strategy.steps.filter((_, i) => i !== index);
    updateStrategy({ steps: newSteps });
  };

  const handleSave = () => {
    const validation = validateStrategy(strategy);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    onSave?.(strategy);
    setHasChanges(false);
  };

  const handleRun = () => {
    const validation = validateStrategy(strategy);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }
    onRun?.(strategy);
  };

  return (
    <div className="space-y-6">
      {/* Strategy Info */}
      <Card variant="bordered">
        <CardHeader>
          <CardTitle>Strategy Details</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Strategy Name"
              value={strategy.name}
              onChange={(e) => updateStrategy({ name: e.target.value })}
              disabled={readOnly}
            />
            <div className="md:col-span-2">
              <Input
                label="Description"
                value={strategy.description}
                onChange={(e) => updateStrategy({ description: e.target.value })}
                disabled={readOnly}
              />
            </div>
            <Input
              label="Initial Bankroll ($)"
              type="number"
              min={1}
              value={strategy.initialBankroll}
              onChange={(e) =>
                updateStrategy({
                  initialBankroll: Math.max(1, parseInt(e.target.value) || 1),
                })
              }
              disabled={readOnly}
            />
            <Input
              label="Target Bankroll ($)"
              type="number"
              min={1}
              value={strategy.targetBankroll}
              onChange={(e) =>
                updateStrategy({
                  targetBankroll: Math.max(1, parseInt(e.target.value) || 1),
                })
              }
              disabled={readOnly}
            />
            <Input
              label="Max Iterations"
              type="number"
              min={1}
              max={10000}
              value={strategy.maxIterations}
              onChange={(e) =>
                updateStrategy({
                  maxIterations: Math.min(10000, Math.max(1, parseInt(e.target.value) || 1)),
                })
              }
              disabled={readOnly}
              helperText="Maximum number of spins per session"
            />
            <Input
              label="Max Drawdown ($)"
              type="number"
              min={0}
              value={strategy.maxDrawdown || 0}
              onChange={(e) =>
                updateStrategy({
                  maxDrawdown: parseInt(e.target.value) || undefined,
                })
              }
              disabled={readOnly}
              helperText="Stop if losses exceed this amount (0 = no limit)"
            />
          </div>
        </CardContent>
      </Card>

      {/* Steps */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">Betting Steps</h3>
          {!readOnly && (
            <Button
              variant="secondary"
              size="sm"
              onClick={addStep}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Step
            </Button>
          )}
        </div>

        <div className="space-y-4">
          {strategy.steps.map((step, index) => (
            <StepEditor
              key={step.id}
              step={step}
              stepNumber={index + 1}
              onChange={(updatedStep) => updateStep(index, updatedStep)}
              onDelete={() => removeStep(index)}
              canDelete={strategy.steps.length > 1 && !readOnly}
            />
          ))}
        </div>
      </div>

      {/* Errors */}
      {errors.length > 0 && (
        <div className="bg-red-900/20 border border-red-700/50 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-red-500 mb-1">Validation Errors</p>
              <ul className="text-sm text-red-300 space-y-1">
                {errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {!readOnly && (
        <div className="flex flex-wrap gap-3 pt-4 border-t border-casino-border">
          {onSave && (
            <Button
              variant="secondary"
              onClick={handleSave}
              disabled={!hasChanges}
              className="flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              Save Strategy
            </Button>
          )}
          {onRun && (
            <Button
              variant="primary"
              onClick={handleRun}
              className="flex items-center gap-2"
            >
              <Play className="w-4 h-4" />
              Run Simulation
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
