import React, { useEffect } from 'react';
import { Zap, Snowflake, Flame } from 'lucide-react';

export const Toast = ({ message, type = 'info', onClose, duration = 3500 }) => {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      if (onClose) onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const typeConfig = {
    freeze: {
      bg: 'bg-cyan-50 border-cyan-700 text-cyan-950',
      icon: <Snowflake className="w-5 h-5 text-cyan-600 animate-spin" />,
    },
    multiplier: {
      bg: 'bg-amber-50 border-amber-700 text-amber-950',
      icon: <Flame className="w-5 h-5 text-amber-600 animate-bounce" />,
    },
    info: {
      bg: 'bg-cream-50 border-ink-900 text-ink-950',
      icon: <Zap className="w-5 h-5 text-accent-amber fill-accent-amber" />,
    },
  };

  const config = typeConfig[type] || typeConfig.info;

  return (
    <div className="fixed top-6 right-6 z-50 animate-slide-up">
      <div
        className={`flex items-center gap-3 px-4 py-3 rounded-xl border-2 shadow-[4px_4px_0px_0px_#14110F] ${config.bg}`}
      >
        {config.icon}
        <span className="font-display font-bold text-sm">{message}</span>
      </div>
    </div>
  );
};
