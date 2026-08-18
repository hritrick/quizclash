import React from 'react';

export const Card = ({ children, className = '', hover = false, onClick, ...props }) => {
  return (
    <div
      onClick={onClick}
      className={`bg-cream-50 border-2 border-ink-900 rounded-2xl p-5 shadow-[4px_4px_0px_0px_#14110F] transition-all duration-150 ${
        hover
          ? 'hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#14110F] cursor-pointer'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
};
