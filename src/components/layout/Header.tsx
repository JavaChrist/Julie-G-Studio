import React from 'react';
import Link from 'next/link';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import { ROUTES, APP_NAME } from '../../utils/constants';

const Header: React.FC = () => {
  const { user, signOut, loading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href={ROUTES.HOME} className="flex items-center">
            <img src="/logo192.png" alt="Logo" className="h-8 w-8 mr-2" />
            <span className="font-bold text-xl text-gray-900">{APP_NAME}</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link
              href={ROUTES.HOME}
              className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
            >
              Accueil
            </Link>
            {user && (
              <Link
                href="/admin"
                className="text-gray-700 hover:text-blue-600 px-3 py-2 text-sm font-medium"
              >
                Admin
              </Link>
            )}
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="w-6 h-6 animate-spin rounded-full border-2 border-gray-300 border-t-blue-600"></div>
            ) : user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  Bonjour, {user.displayName || user.email}
                </span>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  Déconnexion
                </Button>
              </div>
            ) : (
              <div className="flex space-x-2">
                {/* Pas de bouton de connexion - accès via /admin */}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header; 