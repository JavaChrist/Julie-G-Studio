import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { appendAlbumPhotos, deleteAlbumPhotos } from '../../../services/adminService';
import { getAlbumByCode, type Album } from '../../../services/albumService';
import { ArrowLeft, Trash2, Upload } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../../firebase/firebaseConfig';

const AdminEditAlbumPage: React.FC = () => {
  const router = useRouter();
  const { id } = router.query;
  const [album, setAlbum] = useState<Album | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    if (!album || !storage) return;
    const files = e.target.files;
    if (!files || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      const uploaded: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const f = files[i];
        const ext = f.name.split('.').pop() || 'jpg';
        const path = `albums/${album.id}/${Date.now()}-${i}.${ext}`;
        const r = ref(storage, path);
        await uploadBytes(r, f);
        const url = await getDownloadURL(r);
        uploaded.push(url);
      }
      const ok = await appendAlbumPhotos(album.id, uploaded);
      if (ok) {
        setAlbum({ ...album, photos: [...album.photos, ...uploaded] });
      } else {
        setError('Ajout échoué');
      }
    } catch (err) {
      setError('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
      e.target.value = '';
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
          <label className="inline-flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg cursor-pointer">
            <Upload className="w-4 h-4 mr-2" /> Ajouter des photos
            <input type="file" multiple accept="image/*" className="hidden" onChange={handleUpload} disabled={uploading} />
          </label>
        </div>

        {error && <div className="mb-4 text-red-600">{error}</div>}
        {uploading && <div className="mb-4 text-gray-700">Upload en cours...</div>}

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


