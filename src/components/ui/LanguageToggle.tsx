import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Languages, ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

const LanguageToggle: React.FC = () => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇺🇸' },
  ];

  const currentLanguage = languages.find(lang => lang.code === i18n.language) || languages[0];

  const changeLanguage = (langCode: string) => {
    i18n.changeLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors',
          'bg-gray-100 hover:bg-gray-200 text-gray-900',
          'dark:bg-gray-800 dark:hover:bg-gray-700 dark:text-gray-100'
        )}
        aria-label="Changer la langue"
      >
        <Languages className="w-4 h-4" />
        <span className="hidden sm:inline">{currentLanguage.flag}</span>
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
            {languages.map((language) => {
              const isSelected = i18n.language === language.code;

              return (
                <button
                  key={language.code}
                  onClick={() => changeLanguage(language.code)}
                  className={cn(
                    'flex items-center w-full px-4 py-2 text-sm transition-colors',
                    'hover:bg-gray-100 dark:hover:bg-gray-700',
                    isSelected
                      ? 'text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-900/20'
                      : 'text-gray-700 dark:text-gray-300'
                  )}
                >
                  <span className="mr-3 text-lg">{language.flag}</span>
                  {language.name}
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

export default LanguageToggle; 