import React, { useEffect, useRef, useState } from 'react';
import { Upload, X, Calendar, Tag, Type, User, Image as ImageIcon, Mail } from 'lucide-react';
import { captureLocalFiles, partitionImageFiles } from '../../services/albumCreationService';
import { AlbumFormData } from '../../types';

interface AlbumFormProps {
  onSubmit: (formData: AlbumFormData, imageFiles: File[]) => Promise<void>;
  isSubmitting: boolean;
  uploadProgress?: {
    stage: string;
    current?: number;
    total?: number;
    percent?: number;
  } | null;
}

const AlbumForm: React.FC<AlbumFormProps> = ({ onSubmit, isSubmitting, uploadProgress }) => {
  const [formData, setFormData] = useState<AlbumFormData>({
    title: '',
    category: '',
    expireAt: '',
    clientName: '',
    clientEmail: '',
    eventDate: '',
    allowDownload: true,
    sendEmailToClient: true,
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [imageErrors, setImageErrors] = useState<string[]>([]);
  const [preparingImages, setPreparingImages] = useState(false);
  const [prepareProgress, setPrepareProgress] = useState<{ current: number; total: number } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const imagePreviewsRef = useRef<string[]>([]);
  imagePreviewsRef.current = imagePreviews;

  useEffect(() => {
    return () => {
      imagePreviewsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  const categories = [
    { value: 'mariage', label: 'Mariage' },
    { value: 'grossesse', label: 'Grossesse' },
    { value: 'nouveau-ne', label: 'Nouveau-né' },
    { value: 'enfants', label: 'Famille & Enfants' },
    { value: 'animaux', label: 'Animaux' },
    { value: 'portrait', label: 'Sénior' },
    { value: 'spectacle', label: 'Spectacle' },
    { value: 'entreprise', label: 'Métiers & Entreprises' },
    { value: 'autre', label: 'Autre' }
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Effacer l'erreur du champ
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const files = Array.from(input.files || []);

    if (files.length === 0 || preparingImages) return;

    const { valid, invalid } = partitionImageFiles(files);
    const formatInvalid = invalid.map(({ file, reason }) => `${file.name}: ${reason}`);

    // La copie démarre dans ce tour, tant que la galerie autorise encore la lecture.
    const pendingCapture =
      valid.length > 0
        ? captureLocalFiles(valid, (current, total) => {
            setPrepareProgress({ current, total });
          })
        : Promise.resolve({ ready: [] as File[], failed: [] as { fileName: string; reason: string }[] });

    if (valid.length === 0) {
      setImageErrors(formatInvalid);
      input.value = '';
      return;
    }

    setPreparingImages(true);
    setPrepareProgress({ current: 0, total: valid.length });

    try {
      const { ready, failed } = await pendingCapture;
      const problems = [
        ...formatInvalid,
        ...failed.map(({ fileName, reason }) => `${fileName}: ${reason}`),
      ];

      if (ready.length > 0) {
        const previews = ready.map((file) => URL.createObjectURL(file));
        setImageFiles((prev) => [...prev, ...ready]);
        setImagePreviews((prev) => [...prev, ...previews]);
        setErrors((prev) => ({ ...prev, images: '' }));
      }

      setImageErrors(problems);
    } finally {
      setPreparingImages(false);
      setPrepareProgress(null);
      input.value = '';
    }
  };

  const removeImage = (index: number) => {
    const url = imagePreviews[index];
    if (url) URL.revokeObjectURL(url);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Le titre est requis';
    }

    if (!formData.category) {
      newErrors.category = 'La catégorie est requise';
    }

    if (!formData.expireAt) {
      newErrors.expireAt = 'La date d\'expiration est requise';
    } else {
      const expireDate = new Date(formData.expireAt);
      const today = new Date();
      if (expireDate <= today) {
        newErrors.expireAt = 'La date d\'expiration doit être dans le futur';
      }
    }

    if (formData.clientEmail && formData.clientEmail.trim()) {
      // Validation email simple (RFC 5322 simplifiée, suffisante en pratique)
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.clientEmail.trim())) {
        newErrors.clientEmail = 'Adresse email invalide';
      }
    }

    if (imageFiles.length === 0) {
      newErrors.images = 'Au moins une image est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (preparingImages || !validateForm()) {
      return;
    }

    try {
      await onSubmit(formData, imageFiles);
    } catch (error) {
      console.error('Erreur lors de la soumission:', error);
    }
  };

  const getDefaultExpireDate = () => {
    const date = new Date();
    date.setMonth(date.getMonth() + 3); // 3 mois par défaut
    return date.toISOString().split('T')[0];
  };

  return (
    <form onSubmit={handleSubmit} className="min-w-0 space-y-6">
      {/* Titre de l'album */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-charcoal mb-2">
          Titre de l'album *
        </label>
        <div className="relative">
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 pl-12 bg-white border rounded-lg text-charcoal placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${errors.title ? 'border-red-500' : 'border-gray-300 focus:border-primary-500'
              }`}
            placeholder="Ex: Mariage de Laura & Pierre"
            disabled={isSubmitting}
          />
          <Type className="absolute left-4 top-3.5 w-5 h-5 text-taupe" />
        </div>
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      {/* Nom du client */}
      <div>
        <label htmlFor="clientName" className="block text-sm font-medium text-charcoal mb-2">
          Nom du client
        </label>
        <div className="relative">
          <input
            type="text"
            id="clientName"
            name="clientName"
            value={formData.clientName}
            onChange={handleInputChange}
            className="w-full px-4 py-3 pl-12 bg-white border border-gray-300 focus:border-primary-500 rounded-lg text-charcoal placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-300"
            placeholder="Ex: Laura & Pierre"
            disabled={isSubmitting}
          />
          <User className="absolute left-4 top-3.5 w-5 h-5 text-taupe" />
        </div>
      </div>

      {/* Email du client */}
      <div>
        <label htmlFor="clientEmail" className="block text-sm font-medium text-charcoal mb-2">
          Email du client
        </label>
        <div className="relative">
          <input
            type="email"
            id="clientEmail"
            name="clientEmail"
            value={formData.clientEmail}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 pl-12 bg-white border rounded-lg text-charcoal placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-300 ${errors.clientEmail ? 'border-red-500' : 'border-gray-300 focus:border-primary-500'
              }`}
            placeholder="laura.pierre@exemple.com"
            disabled={isSubmitting}
          />
          <Mail className="absolute left-4 top-3.5 w-5 h-5 text-taupe" />
        </div>
        {errors.clientEmail && (
          <p className="mt-1 text-sm text-red-600">{errors.clientEmail}</p>
        )}
        <p className="mt-1 text-xs text-taupe">
          Si renseigné, le client recevra un email automatique avec son code d'accès.
        </p>
      </div>

      {/* Catégorie */}
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-charcoal mb-2">
          Catégorie *
        </label>
        <div className="relative">
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 pl-12 bg-white border rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-300 ${errors.category ? 'border-red-500' : 'border-gray-300 focus:border-primary-500'
              }`}
            disabled={isSubmitting}
          >
            <option value="">Sélectionner une catégorie</option>
            {categories.map(cat => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          <Tag className="absolute left-4 top-3.5 w-5 h-5 text-taupe" />
        </div>
        {errors.category && (
          <p className="mt-1 text-sm text-red-600">{errors.category}</p>
        )}
      </div>

      {/* Date de l'événement */}
      <div>
        <label htmlFor="eventDate" className="block text-sm font-medium text-charcoal mb-2">
          Date de l'événement
        </label>
        <div className="relative w-full min-w-0">
          <input
            type="date"
            id="eventDate"
            name="eventDate"
            value={formData.eventDate}
            onChange={handleInputChange}
            className="block w-full min-w-0 max-w-full px-3 py-3 pl-11 bg-white border border-gray-300 focus:border-primary-500 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-300"
            disabled={isSubmitting}
          />
          <Calendar className="pointer-events-none absolute left-4 top-3.5 w-5 h-5 text-taupe" />
        </div>
      </div>

      {/* Date d'expiration */}
      <div>
        <label htmlFor="expireAt" className="block text-sm font-medium text-charcoal mb-2">
          Date d'expiration *
        </label>
        <div className="relative w-full min-w-0">
          <input
            type="date"
            id="expireAt"
            name="expireAt"
            value={formData.expireAt}
            onChange={handleInputChange}
            min={new Date().toISOString().split('T')[0]}
            className={`block w-full min-w-0 max-w-full px-3 py-3 pl-11 bg-white border rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-300 ${errors.expireAt ? 'border-red-500' : 'border-gray-300 focus:border-primary-500'
              }`}
            disabled={isSubmitting}
            placeholder={getDefaultExpireDate()}
          />
          <Calendar className="pointer-events-none absolute left-4 top-3.5 w-5 h-5 text-taupe" />
        </div>
        {errors.expireAt && (
          <p className="mt-1 text-sm text-red-600">{errors.expireAt}</p>
        )}
        <p className="mt-1 text-xs text-taupe">
          Recommandé: 3-6 mois après l'événement
        </p>
      </div>

      {/* Options avancées */}
      <div className="bg-gray-50 rounded-lg p-4 space-y-4 border border-gray-200">
        <h3 className="text-sm font-medium text-charcoal mb-3">Options d'accès</h3>

        {/* Autoriser les téléchargements */}
        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            id="allowDownload"
            name="allowDownload"
            checked={formData.allowDownload}
            onChange={(e) => setFormData(prev => ({ ...prev, allowDownload: e.target.checked }))}
            className="w-4 h-4 text-primary-500 bg-white border-gray-300 rounded focus:ring-primary-500 focus:ring-2"
            disabled={isSubmitting}
          />
          <label htmlFor="allowDownload" className="text-sm text-charcoal">
            Autoriser le téléchargement des photos
          </label>
        </div>
        <p className="text-xs text-taupe ml-7">
          Les clients pourront télécharger les photos en haute résolution
        </p>

        {/* Envoyer automatiquement le mail au client */}
        <div className="flex items-center space-x-3 pt-2 border-t border-gray-200">
          <input
            type="checkbox"
            id="sendEmailToClient"
            name="sendEmailToClient"
            checked={formData.sendEmailToClient ?? true}
            onChange={(e) => setFormData(prev => ({ ...prev, sendEmailToClient: e.target.checked }))}
            className="w-4 h-4 text-primary-500 bg-white border-gray-300 rounded focus:ring-primary-500 focus:ring-2 disabled:opacity-50"
            disabled={isSubmitting || !formData.clientEmail?.trim()}
          />
          <label htmlFor="sendEmailToClient" className="text-sm text-charcoal">
            Envoyer automatiquement le mail d'accès au client
          </label>
        </div>
        <p className="text-xs text-taupe ml-7">
          {formData.clientEmail?.trim()
            ? 'Le client recevra un email avec son code, le lien d\'accès et les instructions d\'installation iPhone/Android.'
            : 'Renseignez un email client ci-dessus pour activer cette option.'}
        </p>
      </div>

      {/* Upload des images */}
      <div>
        <label className="block text-sm font-medium text-charcoal mb-2">
          Photos de l'album *
        </label>

        {/* Zone de drop */}
        <div
          onClick={() => {
            if (!preparingImages && !isSubmitting) fileInputRef.current?.click();
          }}
          className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
            preparingImages || isSubmitting ? 'cursor-default' : 'cursor-pointer'
          } ${errors.images ? 'border-red-500 bg-red-500/5' : 'border-gray-300 hover:border-primary-500 bg-gray-50'
            }`}
        >
          <Upload className="w-12 h-12 text-taupe mx-auto mb-4" />
          <p className="text-charcoal font-medium mb-2">
            {preparingImages ? 'Copie des photos en cours…' : 'Cliquez pour sélectionner des images'}
          </p>
          <p className="text-taupe text-sm">
            JPG, PNG, WebP • Max 50 MB par image • Max 200 images
          </p>
          <p className="text-taupe text-xs mt-2">
            Les photos sont copiées dès la sélection, pour rester disponibles au moment de créer l'album. Évitez Lightroom Mobile, Google Photos en ligne et OneDrive.
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={handleImageUpload}
          className="hidden"
          disabled={isSubmitting || preparingImages}
        />

        {preparingImages && prepareProgress && (
          <div className="mt-3 bg-primary-500/10 border border-primary-500/20 rounded-lg p-3">
            <div className="flex justify-between text-sm text-charcoal mb-2">
              <span>Copie des photos sur cet appareil</span>
              <span className="shrink-0 font-medium">
                {prepareProgress.current}/{prepareProgress.total}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                style={{
                  width: `${(prepareProgress.current / Math.max(prepareProgress.total, 1)) * 100}%`,
                }}
              />
            </div>
            <p className="mt-2 text-xs text-taupe">
              Restez sur cette page le temps de la copie.
            </p>
          </div>
        )}

        {errors.images && (
          <p className="mt-1 text-sm text-red-600">{errors.images}</p>
        )}

        {imageErrors.length > 0 && (
          <div className="mt-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-yellow-700 mb-1">
                  Photos ignorées ({imageErrors.length})
                </p>
                <ul className="text-xs text-charcoal space-y-1 list-disc list-inside">
                  {imageErrors.map((msg, index) => (
                    <li key={index}>{msg}</li>
                  ))}
                </ul>
              </div>
              <button
                type="button"
                onClick={() => setImageErrors([])}
                className="text-xs text-yellow-700 hover:text-yellow-800 underline shrink-0"
              >
                Fermer
              </button>
            </div>
          </div>
        )}

        {/* Aperçu des images */}
        {imagePreviews.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-medium text-charcoal">
                Images sélectionnées ({imagePreviews.length})
              </h4>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="text-primary-600 hover:text-primary-500 text-sm disabled:opacity-50"
                disabled={isSubmitting || preparingImages}
              >
                Ajouter plus
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {imagePreviews.map((preview, index) => (
                <div key={index} className="relative group">
                  <img
                    src={preview}
                    alt={`Aperçu ${index + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    disabled={isSubmitting}
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Bouton de soumission */}
      <button
        type="submit"
        disabled={isSubmitting || preparingImages}
        className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-primary-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center space-x-2"
      >
        {preparingImages ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Copie des photos…</span>
          </>
        ) : isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Création en cours...</span>
          </>
        ) : (
          <>
            <ImageIcon className="w-5 h-5" />
            <span>Créer l'album</span>
          </>
        )}
      </button>

      {/* Barre de progression sous le bouton, visible pendant l'upload */}
      {isSubmitting && uploadProgress && (
        <div className="bg-primary-500/10 border border-primary-500/20 rounded-lg p-4 -mt-3">
          <div className="flex justify-between text-sm text-charcoal mb-2 gap-2">
            <span className="truncate">{uploadProgress.stage}</span>
            {uploadProgress.current !== undefined && uploadProgress.total !== undefined && (
              <span className="shrink-0 font-medium">
                {uploadProgress.current}/{uploadProgress.total}
                {typeof uploadProgress.percent === 'number' && ` • ${uploadProgress.percent}%`}
              </span>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${
                  typeof uploadProgress.percent === 'number'
                    ? uploadProgress.percent
                    : uploadProgress.current !== undefined && uploadProgress.total
                      ? (uploadProgress.current / Math.max(uploadProgress.total, 1)) * 100
                      : 0
                }%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Note */}
      <p className="text-center text-sm text-taupe">
        * Champs obligatoires
      </p>
    </form>
  );
};

export default AlbumForm; 