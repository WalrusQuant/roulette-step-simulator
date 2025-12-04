'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { BetStep, Bet, BetType, BET_TYPE_NAMES, PAYOUTS, PROBABILITIES } from '@/app/lib/types';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { Card } from './Card';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';
import { cn, formatPercent } from '@/app/lib/utils';

interface StepEditorProps {
  step: BetStep;
  stepNumber: number;
  onChange: (step: BetStep) => void;
  onDelete: () => void;
  canDelete: boolean;
}

const BET_TYPE_OPTIONS = Object.entries(BET_TYPE_NAMES).map(([value, label]) => ({
  value,
  label,
}));

const DOZEN_OPTIONS = [
  { value: '1st', label: '1st Dozen (1-12)' },
  { value: '2nd', label: '2nd Dozen (13-24)' },
  { value: '3rd', label: '3rd Dozen (25-36)' },
];

const COLUMN_OPTIONS = [
  { value: '1st', label: '1st Column' },
  { value: '2nd', label: '2nd Column' },
  { value: '3rd', label: '3rd Column' },
];

const EVEN_MONEY_OPTIONS = [
  { value: 'red', label: 'Red' },
  { value: 'black', label: 'Black' },
  { value: 'odd', label: 'Odd' },
  { value: 'even', label: 'Even' },
  { value: '1-18', label: 'Low (1-18)' },
  { value: '19-36', label: 'High (19-36)' },
];

const BET_SIZING_OPTIONS = [
  { value: 'fixed', label: 'Fixed Amount' },
  { value: 'all-in', label: 'All-In' },
  { value: 'half-bankroll', label: 'Half Bankroll' },
  { value: 'let-it-ride', label: 'Let It Ride' },
];

export function StepEditor({
  step,
  stepNumber,
  onChange,
  onDelete,
  canDelete,
}: StepEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const updateBet = (betIndex: number, updates: Partial<Bet>) => {
    const newBets = [...step.bets];
    newBets[betIndex] = { ...newBets[betIndex], ...updates };
    onChange({ ...step, bets: newBets });
  };

  const addBet = () => {
    const newBet: Bet = {
      betType: 'even_money',
      betAmount: 10,
      betDetail: 'red',
    };
    onChange({ ...step, bets: [...step.bets, newBet] });
  };

  const removeBet = (betIndex: number) => {
    if (step.bets.length <= 1) return;
    const newBets = step.bets.filter((_, i) => i !== betIndex);
    onChange({ ...step, bets: newBets });
  };

  const renderBetDetail = (bet: Bet, betIndex: number) => {
    switch (bet.betType) {
      case 'straight':
        return (
          <Input
            type="number"
            min={0}
            max={36}
            value={typeof bet.betDetail === 'number' ? bet.betDetail : 0}
            onChange={(e) =>
              updateBet(betIndex, { betDetail: parseInt(e.target.value) || 0 })
            }
            label="Number"
          />
        );

      case 'split':
        const splitNums = Array.isArray(bet.betDetail) ? bet.betDetail : [1, 2];
        return (
          <div className="flex gap-2">
            <Input
              type="number"
              min={0}
              max={36}
              value={splitNums[0]}
              onChange={(e) =>
                updateBet(betIndex, {
                  betDetail: [parseInt(e.target.value) || 0, splitNums[1]],
                })
              }
              label="Num 1"
            />
            <Input
              type="number"
              min={0}
              max={36}
              value={splitNums[1]}
              onChange={(e) =>
                updateBet(betIndex, {
                  betDetail: [splitNums[0], parseInt(e.target.value) || 0],
                })
              }
              label="Num 2"
            />
          </div>
        );

      case 'street':
        return (
          <Select
            label="Street Start"
            options={[1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34].map((n) => ({
              value: n.toString(),
              label: `${n}-${n + 2}`,
            }))}
            value={String(bet.betDetail)}
            onChange={(e) => updateBet(betIndex, { betDetail: parseInt(e.target.value) })}
          />
        );

      case 'corner':
        const cornerNums = Array.isArray(bet.betDetail) ? bet.betDetail : [1, 2, 4, 5];
        return (
          <div className="grid grid-cols-4 gap-1">
            {[0, 1, 2, 3].map((i) => (
              <Input
                key={i}
                type="number"
                min={1}
                max={36}
                value={cornerNums[i] || 1}
                onChange={(e) => {
                  const newCorner = [...cornerNums] as [number, number, number, number];
                  newCorner[i] = parseInt(e.target.value) || 1;
                  updateBet(betIndex, { betDetail: newCorner });
                }}
                label={`#${i + 1}`}
              />
            ))}
          </div>
        );

      case 'double_street':
        return (
          <Select
            label="Double Street Start"
            options={[1, 7, 13, 19, 25, 31].map((n) => ({
              value: n.toString(),
              label: `${n}-${n + 5}`,
            }))}
            value={String(bet.betDetail)}
            onChange={(e) => updateBet(betIndex, { betDetail: parseInt(e.target.value) })}
          />
        );

      case 'dozen':
        return (
          <Select
            label="Dozen"
            options={DOZEN_OPTIONS}
            value={String(bet.betDetail)}
            onChange={(e) => updateBet(betIndex, { betDetail: e.target.value })}
          />
        );

      case 'column':
        return (
          <Select
            label="Column"
            options={COLUMN_OPTIONS}
            value={String(bet.betDetail)}
            onChange={(e) => updateBet(betIndex, { betDetail: e.target.value })}
          />
        );

      case 'even_money':
        return (
          <Select
            label="Even Money Type"
            options={EVEN_MONEY_OPTIONS}
            value={String(bet.betDetail)}
            onChange={(e) => updateBet(betIndex, { betDetail: e.target.value })}
          />
        );

      default:
        return null;
    }
  };

  return (
    <Card variant="bordered" className="relative">
      {/* Step Header */}
      <div
        className="flex items-center justify-between cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <GripVertical className="w-5 h-5 text-casino-muted cursor-grab" />
          <span className="font-semibold text-white">Step {stepNumber}</span>
          <span className="text-sm text-casino-muted">
            ({step.bets.length} bet{step.bets.length !== 1 ? 's' : ''})
          </span>
        </div>
        <div className="flex items-center gap-2">
          {canDelete && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="text-red-400 hover:text-red-300"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          )}
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-casino-muted" />
          ) : (
            <ChevronDown className="w-5 h-5 text-casino-muted" />
          )}
        </div>
      </div>

      {/* Step Content */}
      {isExpanded && (
        <div className="mt-4 space-y-4">
          {/* Bets */}
          {step.bets.map((bet, betIndex) => (
            <div
              key={betIndex}
              className="p-4 bg-casino-dark rounded-lg border border-casino-border"
            >
              <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-medium text-casino-text">
                  Bet {betIndex + 1}
                </span>
                {step.bets.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeBet(betIndex)}
                    className="text-red-400 hover:text-red-300 -mt-1 -mr-2"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Bet Type */}
                <Select
                  label="Bet Type"
                  options={BET_TYPE_OPTIONS}
                  value={bet.betType}
                  onChange={(e) => {
                    const newType = e.target.value as BetType;
                    let newDetail: Bet['betDetail'];
                    switch (newType) {
                      case 'straight':
                        newDetail = 17;
                        break;
                      case 'split':
                        newDetail = [17, 18];
                        break;
                      case 'street':
                        newDetail = 16;
                        break;
                      case 'corner':
                        newDetail = [17, 18, 20, 21];
                        break;
                      case 'double_street':
                        newDetail = 13;
                        break;
                      case 'dozen':
                        newDetail = '2nd';
                        break;
                      case 'column':
                        newDetail = '2nd';
                        break;
                      case 'even_money':
                        newDetail = 'red';
                        break;
                      default:
                        newDetail = 'red';
                    }
                    updateBet(betIndex, { betType: newType, betDetail: newDetail });
                  }}
                />

                {/* Bet Sizing */}
                <div className="space-y-2">
                  <Select
                    label="Bet Sizing"
                    options={BET_SIZING_OPTIONS}
                    value={
                      typeof bet.betAmount === 'number' ? 'fixed' : bet.betAmount
                    }
                    onChange={(e) => {
                      const sizing = e.target.value;
                      if (sizing === 'fixed') {
                        updateBet(betIndex, { betAmount: 10 });
                      } else {
                        updateBet(betIndex, {
                          betAmount: sizing as 'all-in' | 'half-bankroll' | 'let-it-ride',
                        });
                      }
                    }}
                  />
                  {typeof bet.betAmount === 'number' && (
                    <Input
                      type="number"
                      min={1}
                      value={bet.betAmount}
                      onChange={(e) =>
                        updateBet(betIndex, {
                          betAmount: Math.max(1, parseInt(e.target.value) || 1),
                        })
                      }
                      label="Amount ($)"
                    />
                  )}
                </div>

                {/* Bet Detail */}
                <div className="md:col-span-2">
                  {renderBetDetail(bet, betIndex)}
                </div>
              </div>

              {/* Bet Stats */}
              <div className="mt-3 pt-3 border-t border-casino-border flex flex-wrap gap-4 text-xs text-casino-muted">
                <span>
                  Payout:{' '}
                  <span className="text-casino-text">{PAYOUTS[bet.betType]}:1</span>
                </span>
                <span>
                  Win Probability:{' '}
                  <span className="text-casino-text">
                    {formatPercent(PROBABILITIES[bet.betType] * 100)}
                  </span>
                </span>
              </div>
            </div>
          ))}

          {/* Add Bet Button */}
          <Button
            variant="secondary"
            size="sm"
            onClick={addBet}
            className="w-full flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Bet to Step
          </Button>

          {/* Step Behavior */}
          <div className="pt-4 border-t border-casino-border">
            <p className="text-sm font-medium text-casino-text mb-3">
              Step Progression
            </p>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={step.continueOnWin}
                  onChange={(e) =>
                    onChange({ ...step, continueOnWin: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-casino-border bg-casino-dark text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-casino-text">Continue to next step on win</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={step.resetOnLoss}
                  onChange={(e) =>
                    onChange({ ...step, resetOnLoss: e.target.checked })
                  }
                  className="w-4 h-4 rounded border-casino-border bg-casino-dark text-blue-500 focus:ring-blue-500"
                />
                <span className="text-sm text-casino-text">Reset to step 1 on loss</span>
              </label>
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
