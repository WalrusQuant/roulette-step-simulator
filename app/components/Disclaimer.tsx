'use client';

import { AlertTriangle } from 'lucide-react';
import { cn } from '@/app/lib/utils';

interface DisclaimerProps {
  variant?: 'inline' | 'banner';
  className?: string;
}

export function Disclaimer({ variant = 'inline', className }: DisclaimerProps) {
  if (variant === 'banner') {
    return (
      <div
        className={cn(
          'bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-4',
          className
        )}
        role="alert"
      >
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-yellow-500 mb-1">
              Educational Purposes Only
            </p>
            <p className="text-yellow-200/80">
              This simulator is for educational and entertainment purposes only.
              No betting system can overcome the house edge in the long run.
              Gambling involves risk and should never be seen as a way to make money.
              If you or someone you know has a gambling problem, please seek help at{' '}
              <a
                href="https://www.ncpgambling.org"
                target="_blank"
                rel="noopener noreferrer"
                className="underline hover:text-yellow-100"
              >
                ncpgambling.org
              </a>
              .
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <p className={cn('text-xs text-casino-muted', className)}>
      <AlertTriangle className="w-3 h-3 inline mr-1" />
      For educational purposes only. Gambling involves risk.
    </p>
  );
}
