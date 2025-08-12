import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Download, Calendar, Lock } from 'lucide-react';
import AlbumGallery from '../../components/ui/AlbumGallery';
import ErrorModal from '../../components/ui/ErrorModal';
import { getAlbumByCode, type Album } from '../../services/albumService';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import { ref as storageRef, getBytes } from 'firebase/storage';
import { storage } from '../../firebase/firebaseConfig';



const AlbumPage: React.FC = () => {
  const router = useRouter();
  const { code } = router.query;
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [album, setAlbum] = useState<Album | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [selectedPhotos, setSelectedPhotos] = useState<string[]>([]);

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

  const toggleSelectPhoto = (url: string) => {
    setSelectedPhotos(prev => prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]);
  };

  const handleClearSelection = () => setSelectedPhotos([]);

  const handleSelectAll = () => {
    if (!album?.photos) return;
    if (selectedPhotos.length === album.photos.length) setSelectedPhotos([]);
    else setSelectedPhotos([...album.photos]);
  };

  const downloadAsLinks = async (urls: string[]) => {
    for (let i = 0; i < urls.length; i++) {
      const photo = urls[i];
      // Nom de fichier
      let fileName = `${album?.title || 'album'}-photo-${i + 1}.jpg`;
      let mime = 'application/octet-stream';
      try {
        const url = new URL(photo);
        const lastPart = decodeURIComponent(url.pathname.split('/').pop() || '');
        if (lastPart) fileName = `${album?.title || 'album'}-${lastPart}`;
        const lower = lastPart.toLowerCase();
        if (lower.endsWith('.jpg') || lower.endsWith('.jpeg')) mime = 'image/jpeg';
        else if (lower.endsWith('.png')) mime = 'image/png';
        else if (lower.endsWith('.webp')) mime = 'image/webp';
      } catch { }

      try {
        const bytes = await fetchWithTimeout(photo, 45000);
        const blob = new Blob([bytes], { type: mime });
        saveAs(blob, fileName);
      } catch (e) {
        console.warn('Téléchargement direct échoué, tentative d\'ouverture:', e);
        // dernier recours, ouvrir l'image
        window.open(photo, '_blank');
      }

      if (i < urls.length - 1) await new Promise(r => setTimeout(r, 200));
      setDownloadProgress(Math.round(((i + 1) / urls.length) * 100));
    }
  };

  const extractStoragePath = (url: string): string | null => {
    try {
      // Support des URLs gs://bucket/path
      if (url.startsWith('gs://')) {
        const withoutScheme = url.replace('gs://', '');
        const firstSlash = withoutScheme.indexOf('/')
        if (firstSlash !== -1) {
          return decodeURIComponent(withoutScheme.slice(firstSlash + 1));
        }
        return null;
      }

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

  const fetchWithTimeout = async (url: string, timeoutMs = 45000): Promise<ArrayBuffer> => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
      // Normaliser l'URL Firebase malformée (b=*.firebasestorage.app -> *.appspot.com)
      try {
        const u = new URL(url);
        if (u.hostname === 'firebasestorage.googleapis.com') {
          const b = u.pathname.split('/')[3]; // '/v0/b/{bucket}/o/...'
          if (b && b.endsWith('.firebasestorage.app')) {
            const fixedBucket = b.replace('.firebasestorage.app', '.appspot.com');
            u.pathname = u.pathname.replace(`/b/${b}/`, `/b/${fixedBucket}/`);
            url = u.toString();
          }
        }
      } catch { }

      // Essayer d'abord via Firebase Storage SDK si URL Firebase
      const path = extractStoragePath(url);
      if (storage && path) {
        const sRef = storageRef(storage, path);
        const bytesPromise = getBytes(sRef);
        const timed = new Promise<ArrayBuffer>((_, reject) => setTimeout(() => reject(new Error('timeout')), timeoutMs));
        return (await Promise.race([bytesPromise, timed])) as ArrayBuffer;
      }

      // Fallback via fetch CORS
      const response = await fetch(url, { signal: controller.signal, mode: 'cors', cache: 'no-store', referrerPolicy: 'no-referrer' });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const buf = await response.arrayBuffer();
      return buf;
    } finally {
      clearTimeout(id);
    }
  };

  const handleDownload = async (mode: 'all' | 'selected') => {
    if (!album || !album.photos || album.photos.length === 0) {
      alert('Aucune photo à télécharger dans cet album.');
      setIsDownloading(false);
      setDownloadProgress(0);
      return;
    }

    setIsDownloading(true);
    setDownloadProgress(0);

    try {
      const targetUrls = mode === 'all' ? album.photos : selectedPhotos;
      if (targetUrls.length === 0) {
        alert('Aucune photo sélectionnée.');
        setIsDownloading(false);
        setDownloadProgress(0);
        return;
      }

      console.log(`Début du téléchargement (${mode}) via serveur (ZIP)...`);

      const resp = await fetch('/api/download-zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: album.title, urls: targetUrls }),
      });
      if (!resp.ok) throw new Error('API ZIP erreur');
      const blob = await resp.blob();
      const zipName = `${(album.title || 'album').replace(/[^a-zA-Z0-9-_]/g, '_')}${mode === 'selected' ? '-selection' : ''}.zip`;
      saveAs(blob, zipName);

    } catch (error) {
      console.error('Erreur lors du téléchargement global:', error);
      alert('Une erreur est survenue lors du téléchargement. Tentative de téléchargement individuel.');
      // Fallback sur liens directs
      const targetUrls = mode === 'all' ? (album?.photos || []) : selectedPhotos;
      if (targetUrls.length > 0) await downloadAsLinks(targetUrls);
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

              {/* Actions téléchargement */}
              <div className="flex flex-col items-stretch gap-2 w-full sm:w-auto">
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDownload('all')}
                    disabled={isDownloading}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors duration-300 font-medium whitespace-nowrap ${isDownloading
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
                        <span className="hidden sm:inline">Tout</span>
                        <span className="sm:hidden">Tout</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => handleDownload('selected')}
                    disabled={isDownloading || selectedPhotos.length === 0}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-colors duration-300 font-medium whitespace-nowrap ${isDownloading || selectedPhotos.length === 0
                      ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                      : 'bg-primary-500 hover:bg-primary-600 text-white'
                      }`}
                    title={selectedPhotos.length === 0 ? 'Sélectionnez des photos' : `Télécharger ${selectedPhotos.length} photo(s)`}
                  >
                    <Download className="w-5 h-5" />
                    <span className="hidden sm:inline">Sélection</span>
                    <span className="sm:hidden">Sélect.</span>
                  </button>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={handleSelectAll}
                    className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100"
                  >
                    {selectedPhotos.length === album.photos.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                  </button>
                  {selectedPhotos.length > 0 && (
                    <button
                      onClick={handleClearSelection}
                      className="px-3 py-2 text-sm rounded-lg border border-gray-300 hover:bg-gray-100"
                    >
                      Effacer sélection
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Galerie de photos avec sélection */}
        <AlbumGallery
          images={album.photos}
          albumTitle={album.title}
          selected={selectedPhotos}
          onToggleSelect={toggleSelectPhoto}
        />

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