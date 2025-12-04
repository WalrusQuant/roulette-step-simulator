'use client';

import { BettingStrategy } from '@/app/lib/types';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './Card';
import { Button } from './Button';
import { formatCurrency, formatDate } from '@/app/lib/utils';
import { Play, Edit, Copy, Trash2, Lock } from 'lucide-react';

export interface StrategyCardProps {
  strategy: BettingStrategy;
  onRun?: (strategy: BettingStrategy) => void;
  onEdit?: (strategy: BettingStrategy) => void;
  onDuplicate?: (strategy: BettingStrategy) => void;
  onDelete?: (strategy: BettingStrategy) => void;
  showActions?: boolean;
}

export function StrategyCard({
  strategy,
  onRun,
  onEdit,
  onDuplicate,
  onDelete,
  showActions = true,
}: StrategyCardProps) {
  return (
    <Card variant="bordered" className="hover:border-casino-muted transition-colors">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {strategy.name}
              {strategy.isPreloaded && (
                <Lock className="w-4 h-4 text-casino-muted" title="Preloaded strategy" />
              )}
            </CardTitle>
            <CardDescription>{strategy.description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <span className="text-casino-muted">Initial:</span>
            <span className="text-casino-text ml-2">
              {formatCurrency(strategy.initialBankroll)}
            </span>
          </div>
          <div>
            <span className="text-casino-muted">Target:</span>
            <span className="text-casino-text ml-2">
              {formatCurrency(strategy.targetBankroll)}
            </span>
          </div>
          <div>
            <span className="text-casino-muted">Steps:</span>
            <span className="text-casino-text ml-2">{strategy.steps.length}</span>
          </div>
          <div>
            <span className="text-casino-muted">Max Spins:</span>
            <span className="text-casino-text ml-2">{strategy.maxIterations}</span>
          </div>
          {strategy.maxDrawdown && (
            <div className="col-span-2">
              <span className="text-casino-muted">Max Drawdown:</span>
              <span className="text-casino-text ml-2">
                {formatCurrency(strategy.maxDrawdown)}
              </span>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-casino-border">
          <p className="text-xs text-casino-muted">
            {strategy.isPreloaded ? 'Preloaded' : `Modified ${formatDate(strategy.modifiedAt)}`}
          </p>
        </div>
      </CardContent>

      {showActions && (
        <CardFooter>
          <div className="flex flex-wrap gap-2">
            {onRun && (
              <Button
                variant="primary"
                size="sm"
                onClick={() => onRun(strategy)}
                className="flex items-center gap-1"
              >
                <Play className="w-4 h-4" />
                Run
              </Button>
            )}
            {onEdit && !strategy.isPreloaded && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onEdit(strategy)}
                className="flex items-center gap-1"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
            )}
            {onDuplicate && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onDuplicate(strategy)}
                className="flex items-center gap-1"
              >
                <Copy className="w-4 h-4" />
                Copy
              </Button>
            )}
            {onDelete && !strategy.isPreloaded && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(strategy)}
                className="flex items-center gap-1 text-red-400 hover:text-red-300"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </Button>
            )}
          </div>
        </CardFooter>
      )}
    </Card>
  );
}
