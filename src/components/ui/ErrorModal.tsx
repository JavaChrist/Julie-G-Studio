import React from 'react';
import { AlertCircle, X, Mail, Phone } from 'lucide-react';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  message: string;
}

const ErrorModal: React.FC<ErrorModalProps> = ({ isOpen, onClose, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-md bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Accès refusé</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label="Fermer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Contenu */}
          <div className="p-6">
            <div className="flex flex-col items-center text-center">
              {/* Icône d'erreur */}
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8 text-gray-600 dark:text-gray-400" />
              </div>

              {/* Message d'erreur */}
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Code invalide ou expiré
              </h4>

              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                {message}
              </p>

              {/* Informations de contact */}
              <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-4 mb-6 w-full border border-gray-200 dark:border-gray-600">
                <h5 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  💬 Contactez Julie G Studio
                </h5>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span>julie-g.studio@gmail.com</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span>06 68 00 64 54</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col space-y-3 w-full">
                {/* Bouton de fermeture */}
                <button
                  onClick={onClose}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-300"
                >
                  Réessayer
                </button>

                {/* Lien vers contact */}
                <button
                  onClick={() => {
                    onClose();
                    if (typeof window !== 'undefined') {
                      window.location.href = '/contact';
                    }
                  }}
                  className="w-full bg-gray-700 hover:bg-gray-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-300"
                >
                  Contacter Julie
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorModal; 