'use client';

import { useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import {
  BetStep,
  Bet,
  BetType,
  BET_TYPE_NAMES,
  PAYOUTS,
  PROBABILITIES,
  DozenType,
  ColumnType,
  EvenMoneyType,
  WinTier,
  StepAction,
  StepActionType,
  BetSizing,
} from '@/app/lib/types';
import { Button } from './Button';
import { Input } from './Input';
import { Select } from './Select';
import { Card } from './Card';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, Zap, Target } from 'lucide-react';
import { cn, formatPercent } from '@/app/lib/utils';

interface StepEditorProps {
  step: BetStep;
  stepNumber: number;
  onChange: (step: BetStep) => void;
  onDelete: () => void;
  canDelete: boolean;
  allStepIds: string[];
  useAdvancedMode?: boolean;
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

const LEGACY_BET_SIZING_OPTIONS = [
  { value: 'fixed', label: 'Fixed Amount' },
  { value: 'all-in', label: 'All-In' },
  { value: 'half-bankroll', label: 'Half Bankroll' },
  { value: 'let-it-ride', label: 'Let It Ride' },
];

const ADVANCED_BET_SIZING_OPTIONS = [
  { value: 'fixed', label: 'Fixed Amount' },
  { value: 'bullet', label: 'Bullet (from bankroll)' },
  { value: 'carry', label: 'Carry (full amount)' },
  { value: 'carry_split', label: 'Carry Split (divided)' },
  { value: 'all-in', label: 'All-In' },
  { value: 'half-bankroll', label: 'Half Bankroll' },
  { value: 'let-it-ride', label: 'Let It Ride' },
];

const STEP_ACTION_OPTIONS = [
  { value: 'next_step', label: 'Go to Next Step' },
  { value: 'repeat_step', label: 'Repeat This Step' },
  { value: 'goto_step', label: 'Go to Specific Step' },
  { value: 'restart', label: 'Restart (Step 1)' },
];

export function StepEditor({
  step,
  stepNumber,
  onChange,
  onDelete,
  canDelete,
  allStepIds,
  useAdvancedMode = false,
}: StepEditorProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showAdvancedTiers, setShowAdvancedTiers] = useState(
    step.winTiers !== undefined && step.winTiers.length > 0
  );

  const BET_SIZING_OPTIONS = useAdvancedMode ? ADVANCED_BET_SIZING_OPTIONS : LEGACY_BET_SIZING_OPTIONS;

  const updateBet = (betIndex: number, updates: Partial<Bet>) => {
    const newBets = [...step.bets];
    newBets[betIndex] = { ...newBets[betIndex], ...updates };
    onChange({ ...step, bets: newBets });
  };

  const addBet = () => {
    const newBet: Bet = {
      betType: 'even_money',
      betAmount: useAdvancedMode ? 'carry_split' : 10,
      betDetail: 'red',
    };
    onChange({ ...step, bets: [...step.bets, newBet] });
  };

  const removeBet = (betIndex: number) => {
    if (step.bets.length <= 1) return;
    const newBets = step.bets.filter((_, i) => i !== betIndex);
    onChange({ ...step, bets: newBets });
  };

  const addWinTier = () => {
    const newTier: WinTier = {
      name: `Tier ${(step.winTiers?.length || 0) + 1}`,
      minPayout: 0,
      action: { type: 'next_step', carryAmount: 'all' },
    };
    onChange({ ...step, winTiers: [...(step.winTiers || []), newTier] });
  };

  const updateWinTier = (tierIndex: number, updates: Partial<WinTier>) => {
    const newTiers = [...(step.winTiers || [])];
    newTiers[tierIndex] = { ...newTiers[tierIndex], ...updates };
    onChange({ ...step, winTiers: newTiers });
  };

  const updateTierAction = (tierIndex: number, updates: Partial<StepAction>) => {
    const newTiers = [...(step.winTiers || [])];
    newTiers[tierIndex] = {
      ...newTiers[tierIndex],
      action: { ...newTiers[tierIndex].action, ...updates },
    };
    onChange({ ...step, winTiers: newTiers });
  };

  const removeWinTier = (tierIndex: number) => {
    const newTiers = (step.winTiers || []).filter((_, i) => i !== tierIndex);
    onChange({ ...step, winTiers: newTiers.length > 0 ? newTiers : undefined });
  };

  const updateOnLoss = (updates: Partial<StepAction>) => {
    onChange({
      ...step,
      onLoss: step.onLoss ? { ...step.onLoss, ...updates } : { type: 'restart', ...updates },
    });
  };

  const getBetSizingValue = (betAmount: BetSizing): string => {
    if (typeof betAmount === 'number') return 'fixed';
    return betAmount;
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
            onChange={(e) => updateBet(betIndex, { betDetail: e.target.value as DozenType })}
          />
        );

      case 'column':
        return (
          <Select
            label="Column"
            options={COLUMN_OPTIONS}
            value={String(bet.betDetail)}
            onChange={(e) => updateBet(betIndex, { betDetail: e.target.value as ColumnType })}
          />
        );

      case 'even_money':
        return (
          <Select
            label="Even Money Type"
            options={EVEN_MONEY_OPTIONS}
            value={String(bet.betDetail)}
            onChange={(e) => updateBet(betIndex, { betDetail: e.target.value as EvenMoneyType })}
          />
        );

      default:
        return null;
    }
  };

  const renderStepActionEditor = (
    action: StepAction,
    onUpdate: (updates: Partial<StepAction>) => void,
    label: string
  ) => (
    <div className="space-y-3 p-3 bg-casino-dark/50 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <Select
          label={label}
          options={STEP_ACTION_OPTIONS}
          value={action.type}
          onChange={(e) => onUpdate({ type: e.target.value as StepActionType })}
        />

        {action.type === 'goto_step' && (
          <Select
            label="Target Step"
            options={allStepIds.map((id, i) => ({
              value: id,
              label: `Step ${i + 1}`,
            }))}
            value={action.targetStepId || allStepIds[0]}
            onChange={(e) => onUpdate({ targetStepId: e.target.value })}
          />
        )}
      </div>

      {useAdvancedMode && action.type !== 'restart' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            type="number"
            min={0}
            value={typeof action.pocket === 'number' ? action.pocket : ''}
            onChange={(e) => {
              const val = e.target.value;
              onUpdate({ pocket: val === '' ? undefined : parseInt(val) || 0 });
            }}
            label="Pocket Amount ($)"
            placeholder="Optional"
          />
          <Select
            label="Carry Forward"
            options={[
              { value: 'all', label: 'All Winnings' },
              { value: 'remainder', label: 'Remainder (after pocket)' },
              { value: 'none', label: 'None' },
            ]}
            value={action.carryAmount === 'all' ? 'all' : action.carryAmount === 'remainder' ? 'remainder' : 'none'}
            onChange={(e) => {
              const val = e.target.value;
              onUpdate({ carryAmount: val === 'none' ? undefined : val as 'all' | 'remainder' });
            }}
          />
        </div>
      )}
    </div>
  );

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
          {step.winTiers && step.winTiers.length > 0 && (
            <span className="flex items-center gap-1 text-xs text-casino-accent bg-casino-accent/10 px-2 py-0.5 rounded">
              <Zap className="w-3 h-3" />
              {step.winTiers.length} tier{step.winTiers.length !== 1 ? 's' : ''}
            </span>
          )}
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
                    value={getBetSizingValue(bet.betAmount)}
                    onChange={(e) => {
                      const sizing = e.target.value;
                      if (sizing === 'fixed') {
                        updateBet(betIndex, { betAmount: 10 });
                      } else {
                        updateBet(betIndex, {
                          betAmount: sizing as BetSizing,
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

          {/* Step Behavior - Advanced Mode Toggle */}
          <div className="pt-4 border-t border-casino-border">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-casino-text">
                Step Progression
              </p>
              {useAdvancedMode && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowAdvancedTiers(!showAdvancedTiers);
                    if (!showAdvancedTiers && (!step.winTiers || step.winTiers.length === 0)) {
                      // Initialize with one default tier
                      onChange({
                        ...step,
                        winTiers: [{
                          name: 'Win',
                          minPayout: 0,
                          action: { type: 'next_step', carryAmount: 'all' },
                        }],
                        onLoss: { type: 'restart' },
                      });
                    }
                  }}
                  className={cn(
                    "flex items-center gap-1 text-xs",
                    showAdvancedTiers ? "text-casino-accent" : "text-casino-muted"
                  )}
                >
                  <Target className="w-3 h-3" />
                  {showAdvancedTiers ? 'Using Win Tiers' : 'Enable Win Tiers'}
                </Button>
              )}
            </div>

            {/* Legacy Mode */}
            {!showAdvancedTiers && (
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
            )}

            {/* Advanced Mode - Win Tiers */}
            {showAdvancedTiers && useAdvancedMode && (
              <div className="space-y-4">
                <p className="text-xs text-casino-muted">
                  Define different outcomes based on payout amount. Tiers are evaluated in order - first match wins.
                </p>

                {/* Win Tiers */}
                {(step.winTiers || []).map((tier, tierIndex) => (
                  <div
                    key={tierIndex}
                    className="p-4 bg-casino-dark/50 rounded-lg border border-green-800/30"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-green-400" />
                        <span className="text-sm font-medium text-green-400">
                          Win Tier {tierIndex + 1}
                        </span>
                      </div>
                      {(step.winTiers?.length || 0) > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeWinTier(tierIndex)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                      <Input
                        label="Tier Name"
                        value={tier.name}
                        onChange={(e) => updateWinTier(tierIndex, { name: e.target.value })}
                        placeholder="e.g., Single Hit"
                      />
                      <Input
                        type="number"
                        min={0}
                        label="Min Payout ($)"
                        value={tier.minPayout}
                        onChange={(e) => updateWinTier(tierIndex, { minPayout: parseInt(e.target.value) || 0 })}
                      />
                      <Input
                        type="number"
                        min={0}
                        label="Max Payout ($)"
                        value={tier.maxPayout || ''}
                        onChange={(e) => {
                          const val = e.target.value;
                          updateWinTier(tierIndex, { maxPayout: val === '' ? undefined : parseInt(val) || 0 });
                        }}
                        placeholder="Optional"
                      />
                    </div>

                    {renderStepActionEditor(
                      tier.action,
                      (updates) => updateTierAction(tierIndex, updates),
                      'On This Tier'
                    )}
                  </div>
                ))}

                <Button
                  variant="secondary"
                  size="sm"
                  onClick={addWinTier}
                  className="w-full flex items-center justify-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Win Tier
                </Button>

                {/* On Loss Action */}
                <div className="p-4 bg-casino-dark/50 rounded-lg border border-red-800/30">
                  <div className="flex items-center gap-2 mb-3">
                    <Trash2 className="w-4 h-4 text-red-400" />
                    <span className="text-sm font-medium text-red-400">On Loss (All Bets Lose)</span>
                  </div>
                  {renderStepActionEditor(
                    step.onLoss || { type: 'restart' },
                    updateOnLoss,
                    'Action'
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}
