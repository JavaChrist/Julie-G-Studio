import React, { useEffect, useState } from 'react';
import { X, Download } from 'lucide-react';
import { ref as storageRef, getBytes } from 'firebase/storage';
import { storage } from '../../firebase/firebaseConfig';
import { saveAs } from 'file-saver';

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
      let mime = 'application/octet-stream';
      try {
        const url = new URL(imageSrc);
        const pathParts = url.pathname.split('/');
        const lastPart = pathParts[pathParts.length - 1];
        if (lastPart && lastPart.includes('.')) {
          const decodedPath = decodeURIComponent(lastPart);
          // Extraire juste le nom de fichier si c'est un chemin
          fileName = decodedPath.split('/').pop() || `photo-${Date.now()}.jpg`;
          const lower = fileName.toLowerCase();
          if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) mime = 'image/jpeg';
          else if (lower.endsWith('.png')) mime = 'image/png';
          else if (lower.endsWith('.webp')) mime = 'image/webp';
        } else {
          fileName = `photo-${Date.now()}.jpg`;
        }
      } catch {
        fileName = `photo-${Date.now()}.jpg`;
      }

      // Tenter via Firebase Storage si possible
      const extractStoragePath = (url: string): string | null => {
        try {
          const parts = url.split('/o/');
          if (parts.length > 1) {
            const pathPart = parts[1].split('?')[0];
            return decodeURIComponent(pathPart);
          }
          return null;
        } catch {
          return null;
        }
      };

      try {
        // Proxy via API pour contourner CORS en prod
        const apiUrl = `/api/download-one?url=${encodeURIComponent(imageSrc)}&filename=${encodeURIComponent(fileName)}`;
        const resp = await fetch(apiUrl);
        if (!resp.ok) throw new Error('API download-one error');
        const blob = await resp.blob();
        saveAs(blob, fileName);
      } catch (e) {
        console.warn('API proxy échouée, tentative binaire directe:', e);
        try {
          const path = extractStoragePath(imageSrc);
          if (storage && path) {
            const sRef = storageRef(storage, path);
            const bytes = await getBytes(sRef);
            const blob = new Blob([bytes], { type: mime });
            saveAs(blob, fileName);
          } else {
            const res = await fetch(imageSrc, { mode: 'cors', cache: 'no-store' });
            const buf = await res.arrayBuffer();
            const blob = new Blob([buf], { type: mime });
            saveAs(blob, fileName);
          }
        } catch (err) {
          console.warn('Téléchargement direct échoué, ouverture de l\'image:', err);
          window.open(imageSrc, '_blank');
        }
      }

      // Réinitialiser immédiatement pour permettre la fermeture
      setIsDownloading(false);

    } catch (error) {
      console.error('Erreur lors du téléchargement:', error);

      // Réinitialiser l'état immédiatement en cas d'erreur
      setIsDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/95 overflow-auto">
      {/* Boutons de contrôle - fixes en haut avec safe area */}
      <div className="fixed top-4 left-4 right-4 z-[60] flex justify-between items-center" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        {/* Bouton télécharger */}
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className={`flex items-center space-x-2 px-4 py-3 rounded-lg backdrop-blur-sm transition-colors duration-300 touch-manipulation ${isDownloading
            ? 'bg-gray-500/80 cursor-not-allowed'
            : 'bg-primary-500/80 hover:bg-primary-600'
            } text-white`}
          style={{ minHeight: '44px', minWidth: '44px' }}
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

        {/* Bouton fermer - Zone tactile agrandie */}
        <button
          onClick={onClose}
          className="bg-black/50 hover:bg-black/70 rounded-full flex items-center justify-center transition-colors duration-300 border border-white/20 touch-manipulation"
          style={{
            minHeight: '56px',
            minWidth: '56px',
            width: '56px',
            height: '56px',
            padding: '16px'
          }}
          aria-label="Fermer la photo"
          title="Appuyez pour fermer"
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
        <div className="bg-black/50 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-lg border border-white/20 text-center">
          <div className="hidden sm:block">
            Appuyez sur <kbd className="bg-white/20 px-2 py-1 rounded text-xs mx-1">ESC</kbd> ou cliquez à l'extérieur pour fermer
          </div>
          <div className="sm:hidden">
            Appuyez sur <kbd className="bg-white/20 px-2 py-1 rounded text-xs mx-1">X</kbd> en haut à droite<br />
            ou touchez les côtés pour fermer
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageModal; 