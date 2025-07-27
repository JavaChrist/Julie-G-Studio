import React, { useState } from 'react';
import { ZoomIn, Lock, Camera } from 'lucide-react';
import ImageModal from './ImageModal';

interface AlbumGalleryProps {
  images: string[];
  albumTitle: string;
}

const AlbumGallery: React.FC<AlbumGalleryProps> = ({ images, albumTitle }) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const openModal = (imageSrc: string) => {
    setSelectedImage(imageSrc);
  };

  const closeModal = () => {
    setSelectedImage(null);
  };

  if (!images || images.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-2xl">📷</span>
        </div>
        <h3 className="text-xl font-semibold text-charcoal mb-2">Album vide</h3>
        <p className="text-taupe">Aucune photo disponible pour le moment.</p>
      </div>
    );
  }

  return (
    <>
      {/* Grille de photos */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {images.map((image, index) => (
          <div
            key={index}
            className="relative group cursor-pointer overflow-hidden rounded-lg bg-gray-200 aspect-square"
            onClick={() => openModal(image)}
          >
            {/* Image */}
            <img
              src={image}
              alt={`Photo ${index + 1} de ${albumTitle}`}
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />

            {/* Overlay au hover */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                <ZoomIn className="w-5 h-5 text-white" />
              </div>
            </div>

            {/* Numéro de la photo */}
            <div className="absolute top-2 left-2 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">
              {index + 1}
            </div>
          </div>
        ))}
      </div>

      {/* Statistiques de l'album */}
      <div className="mt-8 bg-cream-light rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between text-sm text-taupe">
          <span className="flex items-center">
            <Camera className="w-4 h-4 mr-2" />
            {images.length} photo{images.length > 1 ? 's' : ''} dans cet album
          </span>
          <span className="flex items-center">
            <Lock className="w-4 h-4 mr-2" />
            Accès privé et sécurisé
          </span>
        </div>
      </div>

      {/* Modal d'image */}
      <ImageModal
        isOpen={!!selectedImage}
        imageSrc={selectedImage || ''}
        imageAlt={`Photo de ${albumTitle}`}
        onClose={closeModal}
      />
    </>
  );
};

export default AlbumGallery; 