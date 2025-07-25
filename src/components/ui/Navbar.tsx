import React, { useState } from 'react';
import { Menu, X, Camera, Shield, LucideIcon } from 'lucide-react';
import { useRouter } from 'next/router';
import ThemeToggle from './ThemeToggle';

interface MenuItem {
  label: string;
  action: () => void;
  icon?: LucideIcon;
}

interface NavbarProps {
  onContactClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ onContactClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleMenuClick = (action?: () => void) => {
    setIsMenuOpen(false);
    if (action) action();
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

      const menuItems: MenuItem[] = [
    { label: 'Accueil', action: () => router.push('/') },
    { label: 'Portfolios', action: () => router.push('/portfolios') },
    { label: 'Tarifs', action: () => router.push('/tarifs') },
    { label: 'Contact', action: () => router.push('/contact') },
    { label: 'Accès client', action: () => router.push('/acces'), icon: Shield },
    { label: 'Admin', action: () => router.push('/admin'), icon: Camera },
  ];

  return (
    <>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo cliquable */}
            <button
              onClick={() => router.push('/')}
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <Camera className="w-8 h-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">Julie G Studio</span>
            </button>

            {/* Actions mobiles */}
            <div className="md:hidden flex items-center space-x-2">
              <ThemeToggle />
              <button
                onClick={toggleMenu}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Menu"
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Menu desktop */}
            <div className="hidden md:flex items-center space-x-6">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={item.action}
                  className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors font-medium"
                >
                  {item.label}
                </button>
              ))}
              <ThemeToggle />
            </div>
          </div>
        </div>
      </nav>

      {/* Menu mobile modal */}
      {isMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setIsMenuOpen(false)}
          />

          {/* Menu modal */}
          <div className="fixed top-0 right-0 h-full w-64 bg-white dark:bg-gray-800 shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <span className="text-lg font-semibold text-gray-900 dark:text-white">Menu</span>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                aria-label="Fermer le menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="py-4">
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => handleMenuClick(item.action)}
                  className="flex items-center w-full text-left px-6 py-3 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
                >
                  {item.icon && <item.icon className="w-4 h-4 mr-3" />}
                  {item.label}
                </button>
              ))}

              {/* Séparateur et ThemeToggle */}
              <div className="mx-6 my-4 border-t border-gray-200 dark:border-gray-700"></div>
              <div className="px-6 py-2">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">Thème</span>
                <ThemeToggle />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar; 