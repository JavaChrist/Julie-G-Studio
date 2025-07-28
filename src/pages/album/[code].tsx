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
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);

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

  const handleDownloadAll = async () => {
    if (!album || !album.photos || album.photos.length === 0) {
      alert('Aucune photo à télécharger dans cet album.');
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      console.log('Début du téléchargement de toutes les photos...');

      // Informer l'utilisateur du processus
      const userConfirm = confirm(
        `Télécharger toutes les ${album.photos.length} photos ?\n\n` +
        `⚠️ IMPORTANT: Votre navigateur va demander l'autorisation de télécharger plusieurs fichiers.\n` +
        `Cliquez sur "AUTORISER" ou "ALLOW" quand cette popup apparaît.\n\n` +
        `Continuer le téléchargement ?`
      );

      if (!userConfirm) {
        setIsDownloading(false);
        setDownloadProgress(0);
        return;
      }

      // Télécharger les photos une par une sans fetch (évite CORS)
      for (let i = 0; i < album.photos.length; i++) {
        const photo = album.photos[i];

        try {
          // Mettre à jour la progression
          setDownloadProgress(Math.round(((i + 1) / album.photos.length) * 100));

          // Générer un nom de fichier
          let fileName = `${album.title || 'album'}-photo-${i + 1}.jpg`;
          try {
            const url = new URL(photo);
            const pathParts = url.pathname.split('/');
            const lastPart = pathParts[pathParts.length - 1];
            if (lastPart && lastPart.includes('.')) {
              const decodedPath = decodeURIComponent(lastPart);
              const originalName = decodedPath.split('/').pop() || `photo-${i + 1}.jpg`;
              fileName = `${album.title || 'album'}-${originalName}`;
            }
          } catch {
            // Garder le nom par défaut
          }

          // Créer le lien de téléchargement direct (sans fetch)
          const link = document.createElement('a');
          link.href = photo;
          link.download = fileName;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.style.display = 'none';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          // Délai court entre les téléchargements
          if (i < album.photos.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 300));
          }

        } catch (error) {
          console.error(`Erreur téléchargement photo ${i + 1}:`, error);
          // Continuer avec les autres photos même si une échoue
        }
      }

      console.log('Téléchargement terminé pour toutes les photos disponibles');
      alert(`Téléchargement de ${album.photos.length} photos initié avec succès ! Vérifiez votre dossier de téléchargements.`);

    } catch (error) {
      console.error('Erreur lors du téléchargement global:', error);
      alert('Une erreur est survenue lors du téléchargement. Veuillez essayer de télécharger les photos une par une.');
    } finally {
      setIsDownloading(false);
      setDownloadProgress(0);
    }
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
      <div className="min-h-screen bg-cream-main transition-colors duration-300 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-charcoal text-lg">Vérification de l'accès...</p>
          <p className="text-taupe text-sm mt-2">Code: {code || '...'}</p>
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
    <div className="min-h-screen bg-cream-main transition-colors duration-300 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header avec bouton retour */}
        <div className="mb-8">
          <button
            onClick={handleBackClick}
            className="inline-flex items-center px-4 py-2 text-charcoal hover:text-primary-600 transition-colors duration-300 group mb-6"
          >
            <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
            Retour à l'accès
          </button>

          {/* Informations de l'album */}
          <div className="bg-cream-light rounded-xl p-6 border border-gray-200 mb-8">
            <div className="flex items-start justify-between flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <h1 className="text-3xl md:text-4xl font-bold text-charcoal mb-2">
                  {album.title}
                </h1>
                {album.clientName && (
                  <p className="text-lg text-taupe mb-3">
                    Client: {album.clientName}
                  </p>
                )}
                {album.eventDate && (
                  <div className="flex items-center text-taupe mb-3">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Événement: {formatDate(album.eventDate)}</span>
                  </div>
                )}
                <div className="flex items-center text-taupe">
                  <Lock className="w-4 h-4 mr-2" />
                  <span>
                    Disponible jusqu'au {formatDate(album.expireAt)}
                    {daysRemaining > 0 && (
                      <span className="text-primary-600 ml-2">
                        ({daysRemaining} jour{daysRemaining > 1 ? 's' : ''} restant{daysRemaining > 1 ? 's' : ''})
                      </span>
                    )}
                  </span>
                </div>
              </div>

              {/* Bouton téléchargement global */}
              <button
                onClick={handleDownloadAll}
                disabled={isDownloading}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors duration-300 font-medium whitespace-nowrap ${isDownloading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-primary-500 hover:bg-primary-600'
                  } text-white`}
              >
                {isDownloading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="hidden sm:inline">{downloadProgress}%</span>
                    <span className="sm:hidden">{downloadProgress}%</span>
                  </>
                ) : (
                  <>
                    <Download className="w-5 h-5" />
                    <span className="hidden sm:inline">Télécharger tout</span>
                    <span className="sm:hidden">Tout</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Galerie de photos */}
        <AlbumGallery images={album.photos} albumTitle={album.title} />

        {/* Note de sécurité */}
        <div className="mt-12 bg-primary-50 border border-primary-200 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <Lock className="w-4 h-4 text-primary-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-primary-700 mb-2">
                Album privé et sécurisé
              </h3>
              <p className="text-charcoal leading-relaxed text-sm">
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