import React, { useState, useRef } from 'react';
import { Upload, X, Calendar, Tag, Type, User, Image as ImageIcon } from 'lucide-react';
import { validateImageFiles } from '../../services/albumCreationService';
import { AlbumFormData } from '../../types';

interface AlbumFormProps {
  onSubmit: (formData: AlbumFormData, imageFiles: File[]) => Promise<void>;
  isSubmitting: boolean;
}

const AlbumForm: React.FC<AlbumFormProps> = ({ onSubmit, isSubmitting }) => {
  const [formData, setFormData] = useState<AlbumFormData>({
    title: '',
    category: '',
    expireAt: '',
    clientName: '',
    eventDate: '',
    allowDownload: true
  });

  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [imageErrors, setImageErrors] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    // Valider les fichiers
    const validationErrors = validateImageFiles(files);
    if (validationErrors.length > 0) {
      setImageErrors(validationErrors);
      return;
    }

    setImageErrors([]);

    // Ajouter les nouveaux fichiers aux existants
    const allFiles = [...imageFiles, ...files];
    setImageFiles(allFiles);

    // Générer les aperçus
    const newPreviews: string[] = [];
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviews.push(e.target?.result as string);
        if (newPreviews.length === files.length) {
          setImagePreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const newFiles = imageFiles.filter((_, i) => i !== index);
    const newPreviews = imagePreviews.filter((_, i) => i !== index);

    setImageFiles(newFiles);
    setImagePreviews(newPreviews);
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

    if (imageFiles.length === 0) {
      newErrors.images = 'Au moins une image est requise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
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
    <form onSubmit={handleSubmit} className="space-y-6">
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
        <div className="relative">
          <input
            type="date"
            id="eventDate"
            name="eventDate"
            value={formData.eventDate}
            onChange={handleInputChange}
            className="w-full px-4 py-3 pl-12 bg-white border border-gray-300 focus:border-primary-500 rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-300"
            disabled={isSubmitting}
          />
          <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-taupe" />
        </div>
      </div>

      {/* Date d'expiration */}
      <div>
        <label htmlFor="expireAt" className="block text-sm font-medium text-charcoal mb-2">
          Date d'expiration *
        </label>
        <div className="relative">
          <input
            type="date"
            id="expireAt"
            name="expireAt"
            value={formData.expireAt}
            onChange={handleInputChange}
            min={new Date().toISOString().split('T')[0]}
            className={`w-full px-4 py-3 pl-12 bg-white border rounded-lg text-charcoal focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-300 ${errors.expireAt ? 'border-red-500' : 'border-gray-300 focus:border-primary-500'
              }`}
            disabled={isSubmitting}
            placeholder={getDefaultExpireDate()}
          />
          <Calendar className="absolute left-4 top-3.5 w-5 h-5 text-taupe" />
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
      </div>

      {/* Upload des images */}
      <div>
        <label className="block text-sm font-medium text-charcoal mb-2">
          Photos de l'album *
        </label>

        {/* Zone de drop */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${errors.images ? 'border-red-500 bg-red-500/5' : 'border-gray-300 hover:border-primary-500 bg-gray-50'
            }`}
        >
          <Upload className="w-12 h-12 text-taupe mx-auto mb-4" />
          <p className="text-charcoal font-medium mb-2">
            Cliquez pour sélectionner des images
          </p>
          <p className="text-taupe text-sm">
            JPG, PNG, WebP • Max 10MB par image • Max 50 images
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          disabled={isSubmitting}
        />

        {errors.images && (
          <p className="mt-1 text-sm text-red-600">{errors.images}</p>
        )}

        {imageErrors.length > 0 && (
          <div className="mt-2 space-y-1">
            {imageErrors.map((error, index) => (
              <p key={index} className="text-sm text-red-600">{error}</p>
            ))}
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
                className="text-primary-600 hover:text-primary-500 text-sm"
                disabled={isSubmitting}
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
        disabled={isSubmitting}
        className="w-full bg-primary-500 hover:bg-primary-600 disabled:bg-primary-400 text-white font-medium py-3 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center space-x-2"
      >
        {isSubmitting ? (
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

      {/* Note */}
      <p className="text-center text-sm text-taupe">
        * Champs obligatoires
      </p>
    </form>
  );
};

export default AlbumForm; 