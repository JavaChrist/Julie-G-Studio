import React, { useEffect } from 'react';
import { X, Download } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  imageSrc: string;
  imageAlt: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, imageSrc, imageAlt, onClose }) => {
  // Gérer la fermeture avec Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Empêcher le scroll du body
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleDownload = () => {
    // Mock du téléchargement - à implémenter plus tard
    console.log('Téléchargement de:', imageSrc);

    // Créer un lien temporaire pour le téléchargement
    const link = document.createElement('a');
    link.href = imageSrc;
    link.download = `photo-${Date.now()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 overflow-auto">
      {/* Boutons de contrôle - fixes en haut */}
      <div className="fixed top-4 left-4 right-4 z-[60] flex justify-between items-center">
        {/* Bouton télécharger */}
        <button
          onClick={handleDownload}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-500/80 hover:bg-blue-500 text-white rounded-lg backdrop-blur-sm transition-colors duration-300"
          aria-label="Télécharger la photo"
        >
          <Download className="w-4 h-4" />
          <span className="hidden sm:inline">Télécharger</span>
        </button>

        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="w-12 h-12 bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors duration-300 border border-white/20"
          aria-label="Fermer"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      {/* Container avec scroll */}
      <div
        className="min-h-full flex items-center justify-center p-4 pt-20 pb-16"
        onClick={onClose}
      >
        {/* Image container */}
        <div className="relative max-w-full max-h-full">
          <img
            src={imageSrc}
            alt={imageAlt}
            className="max-w-full h-auto max-h-[calc(100vh-8rem)] object-contain mx-auto block rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      </div>

      {/* Instructions de navigation */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[60]">
        <div className="bg-black/50 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-lg border border-white/20">
          <span className="hidden sm:inline">Appuyez sur </span>
          <kbd className="bg-white/20 px-2 py-1 rounded text-xs">ESC</kbd>
          <span className="hidden sm:inline"> ou cliquez à l'extérieur pour fermer</span>
          <span className="sm:hidden"> pour fermer</span>
        </div>
      </div>
    </div>
  );
};

export default ImageModal; 