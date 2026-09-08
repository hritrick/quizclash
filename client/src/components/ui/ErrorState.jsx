import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from './Button';

export const ErrorState = ({
  title = 'Buzzer Malfunction!',
  message = 'Something went sideways while talking to the quiz server.',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-5 xs:p-8 text-center bg-rose-50 border-2 border-rose-900/40 rounded-2xl max-w-full ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-accent-coral/20 border-2 border-ink-900 flex items-center justify-center text-accent-coral mb-4 shadow-[2px_2px_0px_0px_#14110F]">
        <AlertTriangle className="w-7 h-7 text-accent-coral fill-accent-coral/20" />
      </div>
      <h3 className="text-xl font-display font-bold text-ink-950 mb-2">{title}</h3>
      <p className="text-sm text-ink-700 max-w-md mb-6">{message}</p>
      {onRetry && (
        <Button variant="dark" size="sm" onClick={onRetry}>
          <RefreshCw className="w-4 h-4 mr-1.5" />
          Try Again
        </Button>
      )}
    </div>
  );
};
