import React from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';

export default function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      type="button"
      aria-label="Toggle Theme"
      className="fixed top-5 right-5 z-50 flex items-center gap-2.5 px-3.5 py-2 rounded-full border border-stone-200/80 dark:border-stone-800/80 bg-paper-50/90 dark:bg-paper-900/90 backdrop-blur-md text-paper-900 dark:text-paper-100 shadow-elevated hover:border-accent hover:shadow-glow-accent transition-all duration-300 group cursor-pointer"
      title={isDark ? "Switch to Editorial Light Mode" : "Switch to Obsidian Dark Mode"}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-accent transition-transform duration-500 group-hover:rotate-90 group-hover:scale-110" />
        ) : (
          <Moon className="w-4 h-4 text-stone-700 transition-transform duration-500 group-hover:-rotate-45 group-hover:scale-110" />
        )}
      </div>
      <span className="text-[11px] tracking-widest uppercase font-semibold text-stone-600 dark:text-stone-300 group-hover:text-accent transition-colors hidden sm:inline">
        {isDark ? 'Obsidian' : 'Editorial'}
      </span>
      <Sparkles className="w-3 h-3 text-accent/60 opacity-0 group-hover:opacity-100 transition-opacity hidden sm:inline" />
    </button>
  );
}
