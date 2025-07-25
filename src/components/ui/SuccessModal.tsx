import React, { useState } from 'react';
import { CheckCircle, Copy, X } from 'lucide-react';

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  albumCode: string;
  albumTitle: string;
}

const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  albumCode,
  albumTitle
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(albumCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
      // Fallback pour les navigateurs plus anciens
      const textArea = document.createElement('textarea');
      textArea.value = albumCode;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const clientUrl = `${window.location.origin}/acces`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4">
        {/* Overlay */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="relative w-full max-w-lg bg-gray-800 rounded-lg shadow-xl border border-gray-700">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <h3 className="text-lg font-semibold text-white">Album créé avec succès !</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-300 transition-colors"
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
              <h4 className="text-xl font-semibold text-white mb-2">
                Album créé avec succès !
              </h4>

              <p className="text-gray-300 mb-6">
                <strong>{albumTitle}</strong> a été créé et est maintenant accessible aux clients.
              </p>

              {/* Code d'accès */}
              <div className="w-full bg-gray-700/50 rounded-lg p-4 mb-6">
                <h5 className="text-sm font-medium text-blue-400 mb-3">
                  🔑 Code d'accès client
                </h5>

                <div className="flex items-center space-x-3">
                  <div className="flex-1 bg-gray-800 rounded-lg p-3 font-mono text-lg text-white text-center border border-gray-600">
                    {albumCode}
                  </div>

                  <button
                    onClick={handleCopyCode}
                    className={`px-4 py-2 rounded-lg font-medium transition-colors duration-300 flex items-center space-x-2 ${copied
                        ? 'bg-green-600 text-white'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                      }`}
                  >
                    {copied ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        <span>Copié</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Copier</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Instructions */}
              <div className="w-full bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 mb-6">
                <h5 className="text-sm font-medium text-blue-400 mb-2">
                  📋 Instructions pour le client
                </h5>
                <div className="text-left text-sm text-gray-300 space-y-1">
                  <p>1. Aller sur : <span className="font-mono text-blue-400">{clientUrl}</span></p>
                  <p>2. Entrer le code : <span className="font-mono text-blue-400">{albumCode}</span></p>
                  <p>3. Consulter et télécharger les photos</p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <button
                  onClick={() => window.open(`/album/${albumCode}`, '_blank')}
                  className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-300"
                >
                  Prévisualiser l'album
                </button>

                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-300"
                >
                  Créer un autre album
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SuccessModal; 