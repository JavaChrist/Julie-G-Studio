import React, { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';

interface ImageModalProps {
  isOpen: boolean;
  imageSrc: string;
  imageAlt: string;
  onClose: () => void;
}

const ImageModal: React.FC<ImageModalProps> = ({ isOpen, imageSrc, imageAlt, onClose }) => {
  const [isDownloading, setIsDownloading] = useState(false);

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

  const handleDownload = async () => {
    setIsDownloading(true);

    try {
      console.log('Téléchargement de:', imageSrc);

      // Extraire le nom de fichier depuis l'URL ou générer un nom
      let fileName = 'photo.jpg';
      try {
        const url = new URL(imageSrc);
        const pathParts = url.pathname.split('/');
        const lastPart = pathParts[pathParts.length - 1];
        if (lastPart && lastPart.includes('.')) {
          const decodedPath = decodeURIComponent(lastPart);
          // Extraire juste le nom de fichier si c'est un chemin
          fileName = decodedPath.split('/').pop() || `photo-${Date.now()}.jpg`;
        } else {
          fileName = `photo-${Date.now()}.jpg`;
        }
      } catch {
        fileName = `photo-${Date.now()}.jpg`;
      }

      // Méthode alternative sans fetch pour éviter CORS
      // Créer un lien de téléchargement direct
      const link = document.createElement('a');
      link.href = imageSrc;
      link.download = fileName;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';

      // Ajouter des attributs pour forcer le téléchargement
      link.style.display = 'none';
      document.body.appendChild(link);

      // Cliquer sur le lien pour déclencher le téléchargement
      link.click();

      // Nettoyer
      document.body.removeChild(link);

      console.log('Téléchargement initié:', fileName);

      // Petit délai pour l'UX puis success
      setTimeout(() => {
        console.log('Téléchargement démarré avec succès');
      }, 500);

    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);

      // Fallback: ouvrir l'image dans un nouvel onglet avec instruction
      const newWindow = window.open(imageSrc, '_blank');
      if (newWindow) {
        // Message d'instruction pour l'utilisateur
        setTimeout(() => {
          alert('Photo ouverte dans un nouvel onglet. Pour la télécharger, cliquez droit sur l\'image et sélectionnez "Enregistrer l\'image sous..."');
        }, 1000);
      } else {
        alert('Impossible d\'ouvrir la photo. Veuillez autoriser les pop-ups pour ce site.');
      }
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 overflow-auto">
      {/* Boutons de contrôle - fixes en haut */}
      <div className="fixed top-4 left-4 right-4 z-[60] flex justify-between items-center">
        {/* Bouton télécharger */}
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg backdrop-blur-sm transition-colors duration-300 ${isDownloading
            ? 'bg-gray-500/80 cursor-not-allowed'
            : 'bg-primary-500/80 hover:bg-primary-600'
            } text-white`}
          aria-label="Télécharger la photo"
        >
          {isDownloading ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              <span className="hidden sm:inline">Téléchargement...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Télécharger</span>
            </>
          )}
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