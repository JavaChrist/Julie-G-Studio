import React, { useState } from 'react';
import { ArrowLeft, Shield } from 'lucide-react';
import { useRouter } from 'next/router';
import AccessForm from '../components/ui/AccessForm';
import ErrorModal from '../components/ui/ErrorModal';

const Acces: React.FC = () => {
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleBackClick = () => {
    router.push('/');
  };

  const handleError = (message: string) => {
    setErrorMessage(message);
    setIsErrorModalOpen(true);
  };

  const closeErrorModal = () => {
    setIsErrorModalOpen(false);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen bg-cream-main transition-colors duration-300 py-16 px-4">
      <div className="max-w-lg mx-auto">
        {/* Bouton retour */}
        <div className="mb-8">
          <button
            onClick={handleBackClick}
            className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-300 group"
          >
            <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
            Retour à l'accueil
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          {/* Logo Julie G */}
          <img src="/logo512.png" alt="Julie Grohens Photographe d'émotions" className="w-80 h-80 mx-auto mb-6" />

          <h1 className="text-4xl md:text-5xl font-bold text-charcoal mb-6">
            Accès client
          </h1>
          <p className="text-xl text-gray-700 max-w-md mx-auto leading-relaxed">
            Entrez le code fourni pour consulter vos photos.
          </p>
          <div className="w-24 h-1 bg-primary-400 mx-auto mt-6"></div>
        </div>

        {/* Formulaire d'accès */}
        <div className="bg-cream-light rounded-xl p-8 shadow-lg border border-gray-200 transition-colors duration-300 mb-8">
          <AccessForm onError={handleError} />
        </div>

        {/* Informations sur la sécurité */}
        <div className="bg-gradient-to-r from-primary-500/10 to-primary-400/10 border border-primary-500/20 rounded-lg p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <Shield className="w-5 h-5 text-gray-600" />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                Accès sécurisé à votre galerie privée
              </h3>
              <p className="text-gray-700 leading-relaxed text-sm mb-3">
                Chaque album client est protégé par un code d'accès unique et temporaire.
                Vos photos sont en sécurité et ne sont visibles que par vous.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-gray-600">
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                  <span>Accès limité dans le temps</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                  <span>Code unique par client</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                  <span>Photos haute résolution</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                  <span>Téléchargement autorisé</span>
                </div>
              </div>
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

export default Acces; 