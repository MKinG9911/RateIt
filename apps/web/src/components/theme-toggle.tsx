'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/theme-context';
import { Sun, Moon } from 'lucide-react';

export function ThemeToggle({ className = '' }: { className?: string }) {
  const { theme, toggleTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className={`w-9 h-9 rounded-xl bg-surface border border-surface-border animate-pulse ${className}`} />
    );
  }

  const isDark = theme === 'dark';

  return (
    <button
      onClick={toggleTheme}
      type="button"
      className={`relative w-9 h-9 rounded-xl bg-surface hover:bg-surface-light border border-surface-border flex items-center justify-center text-text-secondary hover:text-text-primary transition-all duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-primary/40 ${className}`}
      title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 rotate-0 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-primary rotate-0 transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
}
