import React, { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Sun, Moon, Monitor, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

const ThemeToggle: React.FC = () => {
  const { theme, setTheme, isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const themes = [
    { value: 'light', label: 'Clair', icon: Sun },
    { value: 'dark', label: 'Sombre', icon: Moon },
    { value: 'system', label: 'Système', icon: Monitor },
  ] as const;

  const currentTheme = themes.find(t => t.value === theme);
  const CurrentIcon = currentTheme?.icon || Monitor;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
          'bg-gray-100 hover:bg-gray-200 text-gray-900',
          'dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100'
        )}
        aria-label="Changer le thème"
      >
        <CurrentIcon className="w-4 h-4" />
        <span className="hidden sm:inline">{currentTheme?.label}</span>
        <ChevronDown className={cn(
          'w-4 h-4 transition-transform',
          isOpen && 'rotate-180'
        )} />
      </button>

      {isOpen && (
        <div className={cn(
          'absolute right-0 mt-2 w-40 rounded-md shadow-lg z-50',
          'bg-white border border-gray-200',
          'dark:bg-gray-800 dark:border-gray-700'
        )}>
          <div className="py-1">
            {themes.map((themeOption) => {
              const Icon = themeOption.icon;
              const isSelected = theme === themeOption.value;

              return (
                <button
                  key={themeOption.value}
                  onClick={() => {
                    setTheme(themeOption.value);
                    setIsOpen(false);
                  }}
                  className={cn(
                    'flex items-center w-full px-4 py-2 text-sm transition-colors',
                    'hover:bg-gray-100 dark:hover:bg-gray-700',
                    isSelected
                      ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20'
                      : 'text-gray-700 dark:text-gray-300'
                  )}
                >
                  <Icon className="w-4 h-4 mr-3" />
                  {themeOption.label}
                  {isSelected && (
                    <span className="ml-auto text-blue-600 dark:text-blue-400">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Overlay pour fermer le menu */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default ThemeToggle; 