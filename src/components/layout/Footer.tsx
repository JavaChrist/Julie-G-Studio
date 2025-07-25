import React from 'react';
import { APP_NAME } from '../../utils/constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <img src="/logo192.png" alt="Logo" className="h-6 w-6 mr-2" />
            <span className="font-semibold text-gray-900">{APP_NAME}</span>
          </div>

          <div className="flex space-x-6 text-sm text-gray-600">
            <a href="#" className="hover:text-gray-900">
              À propos
            </a>
            <a href="#" className="hover:text-gray-900">
              Contact
            </a>
            <a href="#" className="hover:text-gray-900">
              Politique de confidentialité
            </a>
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-gray-200 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} {APP_NAME}. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};

export default Footer; 