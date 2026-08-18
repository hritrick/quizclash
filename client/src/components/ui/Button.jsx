import React from 'react';
import { sounds } from '../../lib/sound';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  isLoading = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-display font-bold rounded-xl transition-all duration-100 select-none border-2 border-ink-900 focus:outline-none focus:ring-2 focus:ring-accent-amber/50 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none';

  const variants = {
    primary:
      'bg-accent-amber text-ink-950 hover:bg-accent-amber-hover shadow-[3px_3px_0px_0px_#14110F] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#14110F]',
    coral:
      'bg-accent-coral text-white hover:bg-accent-coral-hover shadow-[3px_3px_0px_0px_#14110F] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#14110F]',
    teal:
      'bg-accent-teal text-white hover:bg-accent-teal-hover shadow-[3px_3px_0px_0px_#14110F] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#14110F]',
    secondary:
      'bg-cream-100 text-ink-900 hover:bg-cream-300 shadow-[3px_3px_0px_0px_#14110F] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#14110F]',
    dark:
      'bg-ink-900 text-cream-50 hover:bg-ink-800 shadow-[3px_3px_0px_0px_#231E1B] active:translate-x-[2px] active:translate-y-[2px] active:shadow-[1px_1px_0px_0px_#231E1B]',
    ghost:
      'bg-transparent border-transparent hover:bg-cream-300 text-ink-800 active:translate-y-[1px] shadow-none',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-6 py-3.5 text-base',
    xl: 'px-8 py-4 text-lg',
  };

  const handleClick = (e) => {
    if (!disabled && !isLoading) {
      sounds.playClick();
      if (onClick) onClick(e);
    }
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      onClick={handleClick}
      className={`${baseStyles} ${variants[variant] || variants.primary} ${
        sizes[size] || sizes.md
      } ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="inline-flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};
