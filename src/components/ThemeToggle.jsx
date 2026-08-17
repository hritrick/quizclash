import React from 'react';
import { Sun, Moon } from 'lucide-react';

export default function ThemeToggle({ isDark, onToggle }) {
  return (
    <button
      onClick={onToggle}
      type="button"
      aria-label="Toggle Theme"
      className="fixed top-5 right-5 z-50 flex items-center gap-2 px-3 py-2 rounded-full border border-paper-300 dark:border-stone-800 bg-paper-50/90 dark:bg-paper-900/90 backdrop-blur-md text-paper-800 dark:text-paper-200 shadow-subtle hover:border-accent hover:text-accent transition-all duration-300 group cursor-pointer"
      title={isDark ? "Switch to Editorial Light Mode" : "Switch to Obsidian Dark Mode"}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Sun className="w-4 h-4 text-accent transition-transform duration-300 group-hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-stone-700 transition-transform duration-300 group-hover:-rotate-12" />
        )}
      </div>
      <span className="text-xs tracking-wider uppercase font-medium hidden sm:inline text-stone-600 dark:text-stone-400 group-hover:text-accent transition-colors">
        {isDark ? 'Dark' : 'Light'}
      </span>
    </button>
  );
}
