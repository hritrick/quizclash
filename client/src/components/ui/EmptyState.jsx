import React from 'react';
import { HelpCircle, Sparkles } from 'lucide-react';
import { Button } from './Button';

export const EmptyState = ({
  icon: Icon = HelpCircle,
  title = "It's quiet in here...",
  description = "No items or quizzes found at this moment.",
  actionLabel,
  onAction,
  className = '',
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center border-2 border-dashed border-ink-600/40 rounded-2xl bg-cream-100/60 ${className}`}
    >
      <div className="w-14 h-14 rounded-2xl bg-accent-amber/20 border-2 border-ink-900 flex items-center justify-center text-ink-900 mb-4 shadow-[2px_2px_0px_0px_#14110F]">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-xl font-display font-bold text-ink-950 mb-2">{title}</h3>
      <p className="text-sm text-ink-700 max-w-md mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button variant="primary" size="sm" onClick={onAction}>
          <Sparkles className="w-4 h-4 mr-1.5" />
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
