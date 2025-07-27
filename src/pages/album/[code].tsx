import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Download, Calendar, Lock } from 'lucide-react';
import AlbumGallery from '../../components/ui/AlbumGallery';
import ErrorModal from '../../components/ui/ErrorModal';
import { getAlbumByCode, type Album } from '../../services/albumService';



const AlbumPage: React.FC = () => {
  const router = useRouter();
  const { code } = router.query;
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [album, setAlbum] = useState<Album | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (router.isReady && typeof code === 'string') {
      fetchAlbum(code);
    }
  }, [router.isReady, code]);

  const fetchAlbum = async (albumCode: string) => {
    setIsLoading(true);

    try {
      const albumData = await getAlbumByCode(albumCode.toLowerCase());

      if (!albumData) {
        setErrorMessage('Album introuvable. Vérifiez votre code d\'accès.');
        setIsErrorModalOpen(true);
        setIsLoading(false);
        return;
      }

      // Vérifier l'expiration
      const expireDate = new Date(albumData.expireAt);
      const now = new Date();

      if (expireDate <= now) {
        setErrorMessage("Cet album a expiré. Veuillez contacter Julie Grohens Photographe d'émotions pour renouveler l'accès.");
        setIsErrorModalOpen(true);
        setIsLoading(false);
        return;
      }

      // Album valide
      setAlbum(albumData);
      setIsLoading(false);

    } catch (error) {
      console.error('Erreur lors du chargement de l\'album:', error);
      setErrorMessage('Une erreur est survenue lors du chargement de l\'album. Veuillez réessayer.');
      setIsErrorModalOpen(true);
      setIsLoading(false);
    }
  };

  const handleBackClick = () => {
    router.push('/acces');
  };

  const closeErrorModal = () => {
    setIsErrorModalOpen(false);
    router.push('/acces');
  };

  const handleDownloadAll = () => {
    // Mock du téléchargement global
    console.log('Téléchargement de toutes les photos de l\'album:', code);

    // Simulation d'un téléchargement
    alert('Fonctionnalité de téléchargement en cours de développement. Pour le moment, téléchargez les photos une par une en cliquant dessus.');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (expireDate: string) => {
    const expire = new Date(expireDate);
    const now = new Date();
    const diffTime = expire.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (!router.isReady || isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-900 dark:text-white text-lg">Vérification de l'accès...</p>
          <p className="text-gray-600 dark:text-gray-400 text-sm mt-2">Code: {code || '...'}</p>
        </div>
      </div>
    );
  }

  if (!album) {
    return (
      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={closeErrorModal}
        message={errorMessage}
      />
    );
  }

  const daysRemaining = getDaysRemaining(album.expireAt);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header avec bouton retour */}
        <div className="mb-8">
          <button
            onClick={handleBackClick}
            className="inline-flex items-center px-4 py-2 text-gray-300 hover:text-white transition-colors duration-300 group mb-6"
          >
            <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
            Retour à l'accès
          </button>

          {/* Informations de l'album */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mb-8">
            <div className="flex items-start justify-between flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {album.title}
                </h1>
                {album.clientName && (
                  <p className="text-lg text-gray-300 mb-3">
                    Client: {album.clientName}
                  </p>
                )}
                {album.eventDate && (
                  <div className="flex items-center text-gray-400 mb-3">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Événement: {formatDate(album.eventDate)}</span>
                  </div>
                )}
                <div className="flex items-center text-gray-400">
                  <Lock className="w-4 h-4 mr-2" />
                  <span>
                    Disponible jusqu'au {formatDate(album.expireAt)}
                    {daysRemaining > 0 && (
                      <span className="text-blue-400 ml-2">
                        ({daysRemaining} jour{daysRemaining > 1 ? 's' : ''} restant{daysRemaining > 1 ? 's' : ''})
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Bouton téléchargement global */}
              <button
                onClick={handleDownloadAll}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-300 font-medium whitespace-nowrap"
              >
                <Download className="w-5 h-5" />
                <span className="hidden sm:inline">Télécharger tout</span>
                <span className="sm:hidden">Tout</span>
              </button>
            </div>
          </div>
        </div>

        {/* Galerie de photos */}
        <AlbumGallery images={album.photos} albumTitle={album.title} />

        {/* Note de sécurité */}
        <div className="mt-12 bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Lock className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-blue-400 mb-2">
                Album privé et sécurisé
              </h3>
              <p className="text-gray-300 leading-relaxed text-sm">
                Cet album vous est destiné exclusivement. Les photos sont en haute résolution
                et vous pouvez les télécharger en cliquant dessus. L'accès expirera automatiquement
                le {formatDate(album.expireAt)}.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal d'erreur */}
      <ErrorModal
        isOpen={isErrorModalOpen}
        onClose={closeErrorModal}
        message={errorMessage}
      />
    </div>
  );
};

export default AlbumPage;

// Rendu côté serveur pour les codes d'album dynamiques
export async function getServerSideProps() {
  // Pas de props spéciales nécessaires, juste pour permettre le rendu SSR
  return {
    props: {}
  };
} 