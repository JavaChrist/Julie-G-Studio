import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft, Plus, Shield } from 'lucide-react';
import AlbumForm from '../../components/ui/AlbumForm';
import SuccessModal from '../../components/ui/SuccessModal';
import { createAlbum } from '../../services/albumCreationService';
import { isUserAdmin } from '../../services/adminService';
import { AlbumFormData } from '../../types';

const AjouterAlbum: React.FC = () => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [createdAlbum, setCreatedAlbum] = useState<{
    code: string;
    title: string;
  } | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{
    stage: string;
    current?: number;
    total?: number;
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const checkAuthAndRedirect = useCallback(async () => {
    setIsLoading(true);

    try {
      const isAdmin = await isUserAdmin();

      if (!isAdmin) {
        router.push('/auth/login');
        return;
      }

      setIsAuthorized(true);
    } catch (error) {
      console.error('Erreur lors de la vérification des permissions:', error);
      router.push('/auth/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    checkAuthAndRedirect();
  }, [checkAuthAndRedirect]);

  const handleBackClick = () => {
    router.push('/admin');
  };

  const handleFormSubmit = async (formData: AlbumFormData, imageFiles: File[]) => {
    setIsSubmitting(true);
    setUploadProgress({ stage: 'Préparation...' });
    setError(null);

    try {
      const albumCode = await createAlbum(
        formData,
        imageFiles,
        (stage, current, total) => {
          setUploadProgress({ stage, current, total });
        }
      );

      // Succès
      setCreatedAlbum({
        code: albumCode,
        title: formData.title
      });
      setShowSuccessModal(true);
      setUploadProgress(null);

    } catch (error) {
      console.error('Erreur lors de la création de l\'album:', error);

      // Afficher l'erreur dans l'interface (plus d'alert ! 🎉)
      const errorMessage = error instanceof Error ? error.message : 'Une erreur est survenue';
      setError(`Erreur lors de la création de l'album: ${errorMessage}`);

      setUploadProgress(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    setCreatedAlbum(null);
    // Optionnel: retourner au dashboard ou réinitialiser le formulaire
    router.push('/admin');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream-main transition-colors duration-300 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-charcoal text-lg">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-cream-main transition-colors duration-300 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-taupe mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-charcoal mb-2">Accès non autorisé</h1>
          <p className="text-taupe">Vous n'avez pas les permissions pour créer des albums.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-main transition-colors duration-300 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Bouton retour */}
        <div className="mb-6">
          <button
            onClick={handleBackClick}
            className="inline-flex items-center px-4 py-2 text-charcoal hover:text-primary-600 transition-colors duration-300 group"
            disabled={isSubmitting}
          >
            <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
            Retour au dashboard
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-cream-light rounded-full flex items-center justify-center mx-auto mb-6">
            <Plus className="w-8 h-8 text-taupe" />
          </div>

          <h1 className="text-3xl md:text-4xl font-bold text-charcoal mb-4">
            Créer un nouvel album
          </h1>
          <p className="text-taupe max-w-md mx-auto">
            Ajoutez un nouvel album photo pour vos clients avec un code d'accès sécurisé.
          </p>
          <div className="w-24 h-1 bg-primary-400 mx-auto mt-6"></div>
        </div>

        {/* Indicateur de progression */}
        {uploadProgress && (
          <div className="mb-8 bg-primary-500/10 border border-primary-500/20 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
              <div className="flex-1">
                <p className="text-primary-600 font-medium">
                  {uploadProgress.stage}
                </p>
                {uploadProgress.current && uploadProgress.total && (
                  <div className="mt-2">
                    <div className="flex justify-between text-sm text-charcoal mb-1">
                      <span>Progression</span>
                      <span>{uploadProgress.current}/{uploadProgress.total}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${(uploadProgress.current / uploadProgress.total) * 100}%`
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Affichage des erreurs */}
        {error && (
          <div className="mb-8 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-red-400 text-xs">⚠️</span>
              </div>
              <div className="flex-1">
                <h4 className="text-red-600 font-medium mb-1">Erreur de création</h4>
                <p className="text-charcoal text-sm">{error}</p>
                <button
                  onClick={() => setError(null)}
                  className="mt-3 text-sm text-red-600 hover:text-red-500 underline"
                >
                  Fermer ce message
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire */}
        <div className="bg-cream-light rounded-xl p-8 shadow-lg border border-gray-200">
          <AlbumForm
            onSubmit={handleFormSubmit}
            isSubmitting={isSubmitting}
          />
        </div>

        {/* Informations importantes */}
        <div className="mt-8 bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="w-6 h-6 bg-yellow-500/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-yellow-400 text-xs">💡</span>
            </div>
            <div>
              <h4 className="text-yellow-600 font-medium mb-2">
                Informations importantes
              </h4>
              <ul className="text-charcoal text-sm space-y-1">
                <li>• Le code d'accès sera généré automatiquement</li>
                <li>• Les images seront stockées de manière sécurisée dans Firebase</li>
                <li>• Les clients pourront télécharger les photos en haute résolution</li>
                <li>• L'album expirera automatiquement à la date définie</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Note Firebase */}
        {(!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID === 'demo-project') && (
          <div className="mt-6 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-red-500/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-red-400 text-xs">⚠️</span>
              </div>
              <div>
                <h4 className="text-red-600 font-medium mb-1">Configuration Firebase requise</h4>
                <p className="text-charcoal text-sm">
                  Pour créer des albums, configurez Firebase dans le fichier .env.local avec vos clés de projet.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de succès */}
      {createdAlbum && (
        <SuccessModal
          isOpen={showSuccessModal}
          onClose={handleSuccessModalClose}
          albumCode={createdAlbum.code}
          albumTitle={createdAlbum.title}
        />
      )}
    </div>
  );
};

export default AjouterAlbum; 