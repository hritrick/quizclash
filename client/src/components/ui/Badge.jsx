import React from 'react';

export const Badge = ({ children, variant = 'neutral', size = 'sm', className = '' }) => {
  const variants = {
    neutral: 'bg-cream-300 text-ink-800 border-ink-700',
    amber: 'bg-amber-100 text-amber-900 border-amber-500',
    coral: 'bg-rose-100 text-rose-900 border-rose-400',
    teal: 'bg-emerald-100 text-emerald-900 border-emerald-500',
    violet: 'bg-purple-100 text-purple-900 border-purple-400',
    dark: 'bg-ink-900 text-cream-50 border-ink-950',
  };

  const sizes = {
    xs: 'text-[10px] px-1.5 py-0.5 font-bold',
    sm: 'text-xs px-2.5 py-1 font-bold',
    md: 'text-sm px-3 py-1.5 font-bold',
  };

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-lg border uppercase tracking-wider font-display ${
        variants[variant] || variants.neutral
      } ${sizes[size] || sizes.sm} ${className}`}
    >
      {children}
    </span>
  );
};
