import { ReactNode } from 'react';
import { cn } from '@/app/lib/utils';

export interface StatCardProps {
  label: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'success' | 'danger' | 'warning' | 'info';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function StatCard({
  label,
  value,
  icon,
  trend,
  variant = 'default',
  size = 'md',
  className,
}: StatCardProps) {
  const variants = {
    default: 'bg-casino-card border-casino-border',
    success: 'bg-green-900/20 border-green-700/50',
    danger: 'bg-red-900/20 border-red-700/50',
    warning: 'bg-yellow-900/20 border-yellow-700/50',
    info: 'bg-blue-900/20 border-blue-700/50',
  };

  const textVariants = {
    default: 'text-white',
    success: 'text-green-400',
    danger: 'text-red-400',
    warning: 'text-yellow-400',
    info: 'text-blue-400',
  };

  const sizes = {
    sm: {
      padding: 'p-3',
      label: 'text-xs',
      value: 'text-lg',
    },
    md: {
      padding: 'p-4',
      label: 'text-sm',
      value: 'text-2xl',
    },
    lg: {
      padding: 'p-6',
      label: 'text-base',
      value: 'text-3xl',
    },
  };

  return (
    <div
      className={cn(
        'rounded-xl border',
        variants[variant],
        sizes[size].padding,
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className={cn('text-casino-muted font-medium', sizes[size].label)}>
            {label}
          </p>
          <p
            className={cn(
              'font-bold mt-1',
              textVariants[variant],
              sizes[size].value
            )}
          >
            {value}
          </p>
          {trend && (
            <p
              className={cn(
                'text-xs mt-1 flex items-center gap-1',
                trend.isPositive ? 'text-green-400' : 'text-red-400'
              )}
            >
              <span>{trend.isPositive ? '↑' : '↓'}</span>
              <span>{Math.abs(trend.value).toFixed(1)}%</span>
            </p>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              'p-2 rounded-lg bg-casino-dark/50',
              textVariants[variant]
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

export interface StatsGridProps {
  stats: Array<StatCardProps>;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatsGrid({ stats, columns = 4, className }: StatsGridProps) {
  const gridCols = {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', gridCols[columns], className)}>
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}
