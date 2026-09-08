import React from 'react';
import { Loader2, Zap } from 'lucide-react';

export const LoadingState = ({ message = 'Brewing up the questions...', className = '' }) => {
  return (
    <div className={`flex flex-col items-center justify-center p-6 xs:p-12 text-center max-w-full ${className}`}>
      <div className="relative mb-4">
        <div className="w-12 h-12 xs:w-14 xs:h-14 rounded-2xl bg-accent-amber border-2 border-ink-900 flex items-center justify-center shadow-[3px_3px_0px_0px_#14110F] animate-bounce">
          <Zap className="w-6 h-6 xs:w-7 xs:h-7 text-ink-950 fill-current" />
        </div>
      </div>
      <p className="font-display font-bold text-ink-900 text-base xs:text-lg tracking-wide">{message}</p>
      <p className="text-xs text-ink-600 mt-1">Calibrating buzzer frequencies & scoreboards...</p>
    </div>
  );
};
