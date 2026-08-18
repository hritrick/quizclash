import React from 'react';

export const Avatar = ({ seed = 'player', size = 'md', className = '', showBorder = true }) => {
  const sizeClasses = {
    xs: 'w-7 h-7 text-xs',
    sm: 'w-9 h-9 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-20 h-20 text-xl',
    '2xl': 'w-28 h-28 text-2xl',
  };

  const safeSeed = encodeURIComponent(seed || 'quizzer');
  // DiceBear thumbs / bottts style
  const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${safeSeed}&backgroundColor=transparent`;

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl bg-cream-100 ${
        showBorder ? 'border-2 border-ink-900 shadow-[2px_2px_0px_0px_#14110F]' : ''
      } ${sizeClasses[size] || sizeClasses.md} ${className} overflow-hidden shrink-0`}
    >
      <img
        src={avatarUrl}
        alt={`Avatar ${seed}`}
        className="w-full h-full object-contain p-0.5 select-none pointer-events-none"
        loading="lazy"
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
    </div>
  );
};
