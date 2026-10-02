import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';

/**
 * ThemeToggle component provides a dark/light mode switch button
 * Supports 'icon' (default), 'switch' (pill slider), and 'full' (with label) variants.
 */
export function ThemeToggle({ variant = 'icon', showLabel = false, className = '' }) {
  const { theme, isDark, toggleTheme } = useTheme();

  if (variant === 'switch') {
    return (
      <div className={`inline-flex items-center gap-2.5 ${className}`}>
        {showLabel && (
          <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
            {isDark ? 'Dark Mode' : 'Light Mode'}
          </span>
        )}
        <button
          type="button"
          role="switch"
          aria-checked={isDark}
          onClick={toggleTheme}
          title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className={`relative inline-flex h-7 w-13 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
            isDark ? 'bg-indigo-600' : 'bg-slate-300'
          }`}
        >
          <span className="sr-only">Toggle theme mode</span>
          <span
            className={`pointer-events-none flex h-6 w-6 transform items-center justify-center rounded-full bg-white shadow-md ring-0 transition duration-300 ease-in-out ${
              isDark ? 'translate-x-6 bg-slate-900 text-indigo-300' : 'translate-x-0 text-amber-500'
            }`}
          >
            {isDark ? (
              <Moon className="w-3.5 h-3.5 fill-current" />
            ) : (
              <Sun className="w-3.5 h-3.5 fill-current" />
            )}
          </span>
        </button>
      </div>
    );
  }

  if (variant === 'full') {
    return (
      <button
        type="button"
        onClick={toggleTheme}
        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
          isDark
            ? 'bg-slate-800 text-slate-200 hover:bg-slate-700 hover:text-white'
            : 'bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900'
        } ${className}`}
        aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      >
        <span className="flex items-center gap-2.5">
          {isDark ? (
            <Moon className="w-4 h-4 text-indigo-400 fill-indigo-400/20" />
          ) : (
            <Sun className="w-4 h-4 text-amber-500 fill-amber-500/20" />
          )}
          <span>{isDark ? 'Dark Mode' : 'Light Mode'}</span>
        </span>
        <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-200/80 dark:bg-slate-900 text-slate-600 dark:text-slate-300">
          {theme}
        </span>
      </button>
    );
  }

  // Default 'icon' button variant (perfect for top navigation bar)
  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`relative p-2 rounded-xl border transition-all duration-300 group hover:scale-105 active:scale-95 ${
        isDark
          ? 'bg-slate-900/80 hover:bg-slate-800 text-indigo-300 hover:text-indigo-200 border-slate-700/80 shadow-inner'
          : 'bg-white hover:bg-slate-100 text-amber-500 hover:text-amber-600 border-slate-200 shadow-sm'
      } ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
    >
      <div className="relative w-5 h-5 flex items-center justify-center">
        {isDark ? (
          <Moon className="w-4.5 h-4.5 transition-transform duration-300 group-hover:-rotate-12 fill-indigo-300/30" />
        ) : (
          <Sun className="w-4.5 h-4.5 transition-transform duration-300 group-hover:rotate-45 fill-amber-400/30" />
        )}
      </div>
      <span className="sr-only">
        {isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      </span>
    </button>
  );
}

export default ThemeToggle;
