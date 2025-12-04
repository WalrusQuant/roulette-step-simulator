'use client';

import { cn } from '@/app/lib/utils';

export interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'danger' | 'warning';
  animated?: boolean;
  className?: string;
}

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue = true,
  size = 'md',
  variant = 'default',
  animated = false,
  className,
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  const variants = {
    default: 'bg-blue-500',
    success: 'bg-green-500',
    danger: 'bg-red-500',
    warning: 'bg-yellow-500',
  };

  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex justify-between items-center mb-1.5">
          {label && (
            <span className="text-sm font-medium text-casino-text">{label}</span>
          )}
          {showValue && (
            <span className="text-sm text-casino-muted">
              {percentage.toFixed(1)}%
            </span>
          )}
        </div>
      )}
      <div
        className={cn(
          'w-full bg-casino-dark rounded-full overflow-hidden',
          sizes[size]
        )}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={label || 'Progress'}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-300',
            variants[variant],
            animated && 'relative overflow-hidden'
          )}
          style={{ width: `${percentage}%` }}
        >
          {animated && (
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[shimmer_2s_infinite] bg-[length:200%_100%]" />
          )}
        </div>
      </div>
    </div>
  );
}

export interface MultiProgressBarProps {
  segments: Array<{
    value: number;
    color: string;
    label?: string;
  }>;
  total: number;
  size?: 'sm' | 'md' | 'lg';
  showLegend?: boolean;
  className?: string;
}

export function MultiProgressBar({
  segments,
  total,
  size = 'md',
  showLegend = true,
  className,
}: MultiProgressBarProps) {
  const sizes = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'w-full bg-casino-dark rounded-full overflow-hidden flex',
          sizes[size]
        )}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={total}
      >
        {segments.map((segment, index) => {
          const percentage = (segment.value / total) * 100;
          return (
            <div
              key={index}
              className="h-full transition-all duration-300"
              style={{
                width: `${percentage}%`,
                backgroundColor: segment.color,
              }}
              title={segment.label ? `${segment.label}: ${segment.value}` : undefined}
            />
          );
        })}
      </div>
      {showLegend && (
        <div className="flex flex-wrap gap-4 mt-2">
          {segments.map((segment, index) => (
            <div key={index} className="flex items-center gap-1.5">
              <div
                className="w-3 h-3 rounded-sm"
                style={{ backgroundColor: segment.color }}
              />
              <span className="text-xs text-casino-muted">
                {segment.label}: {segment.value} ({((segment.value / total) * 100).toFixed(1)}%)
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
