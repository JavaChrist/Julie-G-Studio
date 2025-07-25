import React, { createContext, useContext, useState, useEffect } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [theme, setTheme] = useState<Theme>('system');
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  // S'assurer qu'on est côté client
  useEffect(() => {
    setMounted(true);
  }, []);

  // Charger le thème sauvegardé
  useEffect(() => {
    if (!mounted) return;

    try {
      const savedTheme = localStorage.getItem('theme') as Theme;
      if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
        setTheme(savedTheme);
      }
    } catch (error) {
      console.warn('Erreur lors du chargement du thème:', error);
    }
  }, [mounted]);

  // Appliquer le thème
  useEffect(() => {
    if (!mounted) return;

    const applyTheme = () => {
      try {
        let shouldBeDark = false;

        if (theme === 'dark') {
          shouldBeDark = true;
        } else if (theme === 'light') {
          shouldBeDark = false;
        } else {
          // Mode système
          if (typeof window !== 'undefined' && window.matchMedia) {
            shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          }
        }

        setIsDark(shouldBeDark);

        // Appliquer la classe dark au document
        if (typeof document !== 'undefined') {
          if (shouldBeDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      } catch (error) {
        console.warn('Erreur lors de l\'application du thème:', error);
      }
    };

    applyTheme();

    // Écouter les changements de préférence système
    if (typeof window !== 'undefined' && window.matchMedia && theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        if (theme === 'system') {
          applyTheme();
        }
      };

      try {
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
      } catch (error) {
        console.warn('Erreur lors de l\'écoute des changements système:', error);
      }
    }
  }, [theme, mounted]);

  const handleSetTheme = (newTheme: Theme) => {
    setTheme(newTheme);

    // Sauvegarder le thème
    if (mounted && typeof localStorage !== 'undefined') {
      try {
        localStorage.setItem('theme', newTheme);
      } catch (error) {
        console.warn('Erreur lors de la sauvegarde du thème:', error);
      }
    }
  };

  const value: ThemeContextType = {
    theme,
    setTheme: handleSetTheme,
    isDark,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}; 