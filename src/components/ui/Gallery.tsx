import React, { useState } from 'react';
import Image from 'next/image';
import { X } from 'lucide-react';

interface GalleryProps {
  images: string[];
}

const Gallery: React.FC<GalleryProps> = ({ images }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const openModal = (image: string) => {
    setSelectedImage(image);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  // Fermer la modale avec Escape
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
      }
    };

    if (selectedImage) {
      document.addEventListener('keydown', handleKeyDown);
      // Empêcher le scroll de la page quand la modale est ouverte
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [selectedImage]);

  if (images.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-gray-400 text-lg">
          Aucune image disponible pour cette catégorie
        </p>
      </div>
    );
  }

  return (
    <>
      {/* Grille d'images */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative group cursor-pointer overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            onClick={() => openModal(image)}
          >
            <div className="aspect-square relative">
              <Image
                src={image}
                alt={`Photo ${index + 1}`}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 50vw, 33vw"
                priority={index < 6}
              />

              {/* Overlay hover */}
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Indicateur zoom */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modale plein écran */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 overflow-auto">
          {/* Bouton fermer - fixe en haut à droite */}
          <button
            onClick={closeModal}
            className="fixed top-4 right-4 z-[60] w-12 h-12 bg-black/50 rounded-full flex items-center justify-center hover:bg-black/70 transition-colors duration-300 border border-white/20"
            aria-label="Fermer"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Container avec scroll */}
          <div className="min-h-full flex items-center justify-center p-4">
            {/* Image container */}
            <div className="relative max-w-full max-h-full">
              <Image
                src={selectedImage}
                alt="Image agrandie"
                width={1200}
                height={800}
                className="max-w-full h-auto max-h-[calc(100vh-2rem)] object-contain mx-auto"
                style={{ width: 'auto', height: 'auto' }}
                onClick={(e) => e.stopPropagation()}
                priority
              />
            </div>
          </div>

          {/* Zone cliquable pour fermer - couvre toute la modale */}
          <div
            className="absolute inset-0 -z-10"
            onClick={closeModal}
          />
        </div>
      )}
    </>
  );
};

export default Gallery; 