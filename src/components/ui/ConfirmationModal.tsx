import React from 'react';
import { CheckCircle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose }) => {
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
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Message envoyé !</h3>
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
              {/* Icône de succès */}
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-green-400" />
              </div>

              {/* Message principal */}
              <h4 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Merci pour votre message !
              </h4>

              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                J'ai bien reçu votre demande et je vous répondrai dans les plus brefs délais, généralement sous 24h.
              </p>

              {/* Informations supplémentaires */}
              <div className="bg-gray-100 dark:bg-gray-700/50 rounded-lg p-4 mb-6 w-full border border-gray-200 dark:border-gray-600">
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  <span className="font-medium text-blue-400">💡 En attendant :</span><br />
                  N'hésitez pas à consulter mes portfolios pour découvrir mon univers photographique.
                </p>
              </div>

              {/* Bouton de fermeture */}
              <button
                onClick={onClose}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-300"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal; 