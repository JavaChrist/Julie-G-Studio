import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { appendAlbumPhotos, deleteAlbumPhotos } from '../../../services/adminService';
import { getAlbumByCode, type Album } from '../../../services/albumService';
import { ArrowLeft, Trash2, Upload } from 'lucide-react';
import {
  captureLocalFiles,
  partitionImageFiles,
  uploadImages,
  type PhotoFailure,
} from '../../../services/albumCreationService';

const AdminEditAlbumPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<{
    current: number;
    total: number;
    percent: number;
    label?: string;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [warnings, setWarnings] = useState<string[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!router.isReady) return;
    if (typeof id !== 'string') return;
    let isCancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await getAlbumByCode(id);
        if (!isCancelled) setAlbum(data);
      } finally {
        if (!isCancelled) setLoading(false);
      }
    })();
    return () => { isCancelled = true; };
  }, [router.isReady, id]);

  const toggleSelect = (url: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(url)) next.delete(url); else next.add(url);
      return next;
    });
  };

  const handleBack = () => router.push('/admin');

  const handleDeleteSelected = async () => {
    if (!album) return;
    const urls = Array.from(selected);
    if (urls.length === 0) return;
    setError(null);
    const ok = await deleteAlbumPhotos(album.id, urls);
    if (ok) {
      setAlbum({ ...album, photos: album.photos.filter(u => !selected.has(u)) });
      setSelected(new Set());
    } else {
      setError('Suppression échouée');
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const rawFiles = Array.from(input.files || []);
    if (!album || rawFiles.length === 0) return;

    const { valid, invalid } = partitionImageFiles(rawFiles);
    const pendingCapture =
      valid.length > 0
        ? captureLocalFiles(valid, (current, total) => {
            setUploadStatus({
              current,
              total,
              percent: Math.round((current / Math.max(total, 1)) * 100),
              label: `Copie des photos (${current}/${total})`,
            });
          })
        : Promise.resolve({ ready: [] as File[], failed: [] as { fileName: string; reason: string }[] });

    setUploading(true);
    setError(null);
    setWarnings([]);
    setUploadStatus({ current: 0, total: rawFiles.length, percent: 0, label: 'Préparation des photos…' });

    try {
      const newWarnings: string[] = invalid.map(
        ({ file, reason }) => `${file.name}: ${reason}`
      );

      const { ready, failed } = await pendingCapture;
      failed.forEach(({ fileName, reason }) => {
        newWarnings.push(`${fileName}: ${reason}`);
      });

      if (ready.length === 0) {
        setWarnings(newWarnings);
        setError('Aucun fichier valide à uploader.');
        return;
      }

      setUploadStatus({ current: 0, total: ready.length, percent: 0, label: 'Upload en cours…' });

      const { successes, failures } = await uploadImages(ready, album.id, {
        onProgress: (current, total, percent, fileName) => {
          setUploadStatus({
            current,
            total,
            percent,
            label: fileName ? `Upload de ${fileName}` : 'Upload en cours…',
          });
        },
        onPhotoFailure: (failure: PhotoFailure) => {
          newWarnings.push(`${failure.fileName}: ${failure.reason}`);
        },
      });

      if (successes.length === 0) {
        setWarnings(newWarnings);
        setError('Toutes les photos ont échoué à l\'upload.');
        return;
      }

      const uploadedUrls = successes
        .sort((a, b) => a.index - b.index)
        .map(s => s.url);

      const ok = await appendAlbumPhotos(album.id, uploadedUrls);
      if (ok) {
        setAlbum({ ...album, photos: [...album.photos, ...uploadedUrls] });
      } else {
        setError('Ajout des photos à l\'album échoué (Firestore).');
      }

      // Cumuler avec d'éventuels échecs upload
      const allWarnings = [
        ...newWarnings,
        ...failures.map(f => `${f.fileName}: ${f.reason}`),
      ];
      // Dédupliquer (les onPhotoFailure ont aussi pu remplir newWarnings)
      setWarnings(Array.from(new Set(allWarnings)));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur inconnue';
      setError(`Erreur lors de l'upload: ${msg}`);
    } finally {
      setUploading(false);
      setUploadStatus(null);
      input.value = '';
    }
  };

  if (loading || !album) {
    return (
      <div className="min-h-screen bg-cream-main flex items-center justify-center">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-main py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <button onClick={handleBack} className="inline-flex items-center mb-6 text-gray-700 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4 mr-2" /> Retour
        </button>

        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Modifier l'album: {album.title}</h1>
          <label className={`inline-flex items-center px-4 py-2 rounded-lg ${uploading ? 'bg-primary-400 cursor-not-allowed' : 'bg-primary-600 hover:bg-primary-700 cursor-pointer'} text-white`}>
            <Upload className="w-4 h-4 mr-2" /> Ajouter des photos
            <input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleUpload}
              disabled={uploading}
            />
          </label>
        </div>

        {error && (
          <div className="mb-4 bg-red-500/10 border border-red-500/30 text-red-700 rounded-lg p-3">
            {error}
          </div>
        )}

        {uploadStatus && (
          <div className="mb-4 bg-primary-500/10 border border-primary-500/30 rounded-lg p-3">
            <div className="flex justify-between text-sm text-charcoal mb-2">
              <span className="truncate pr-2">
                {uploadStatus.label || 'Upload en cours...'}
              </span>
              <span className="shrink-0">
                {uploadStatus.current}/{uploadStatus.total} • {uploadStatus.percent}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${uploadStatus.percent}%` }}
              />
            </div>
          </div>
        )}

        {warnings.length > 0 && (
          <div className="mb-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-700 mb-1">
                  Photos ignorées ({warnings.length})
                </p>
                <ul className="text-xs text-charcoal space-y-1 list-disc list-inside">
                  {warnings.map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                </ul>
                <p className="text-xs text-taupe mt-2">
                  Astuce : exportez d'abord vos photos en JPEG dans la galerie de votre appareil.
                  Évitez de sélectionner directement depuis Lightroom Mobile / OneDrive (proxies cloud).
                </p>
              </div>
              <button
                type="button"
                onClick={() => setWarnings([])}
                className="text-xs text-yellow-700 hover:text-yellow-800 underline shrink-0"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {album.photos.map((url, idx) => (
            <div key={idx} className={`relative rounded-lg overflow-hidden border ${selected.has(url) ? 'border-primary-500' : 'border-gray-200'}`}>
              <img src={url} alt={`photo-${idx + 1}`} className="w-full h-40 object-cover" loading="lazy" decoding="async" onClick={() => toggleSelect(url)} />
              <input type="checkbox" className="absolute top-2 right-2 w-5 h-5 accent-primary-500" checked={selected.has(url)} onChange={() => toggleSelect(url)} />
            </div>
          ))}
        </div>

        <div className="mt-6 flex gap-3">
          <button onClick={handleDeleteSelected} disabled={selected.size === 0} className={`inline-flex items-center px-4 py-2 rounded-lg ${selected.size === 0 ? 'bg-gray-300 text-gray-600' : 'bg-red-600 hover:bg-red-700 text-white'}`}>
            <Trash2 className="w-4 h-4 mr-2" /> Supprimer la sélection
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminEditAlbumPage;
