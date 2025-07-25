import React, { useState } from 'react';
import { ArrowLeft, Mail, Phone, MapPin, Lightbulb } from 'lucide-react';
import { useRouter } from 'next/router';
import ContactForm from '../components/ui/ContactForm';
import ConfirmationModal from '../components/ui/ConfirmationModal';

const Contact: React.FC = () => {
  const [isConfirmationOpen, setIsConfirmationOpen] = useState(false);
  const router = useRouter();

  const handleBackClick = () => {
    router.push('/');
  };

  const handleSubmitSuccess = () => {
    setIsConfirmationOpen(true);
  };

  const closeConfirmation = () => {
    setIsConfirmationOpen(false);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 py-16 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Bouton retour */}
        <div className="mb-8">
          <button
            onClick={handleBackClick}
            className="inline-flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300 group"
          >
            <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
            Retour à l'accueil
          </button>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Contact
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-xl mx-auto leading-relaxed">
            Une question, un projet ? Envoyez-moi un message et je vous répondrai rapidement.
          </p>
          <div className="w-24 h-1 bg-blue-400 mx-auto mt-6"></div>
        </div>

        {/* Formulaire de contact */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300">
          <ContactForm onSubmitSuccess={handleSubmitSuccess} />
        </div>

        {/* Informations de contact supplémentaires */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-gray-800 rounded-lg border border-gray-700">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Email</h3>
            <p className="text-gray-300">julie-g.studio@gmail.com</p>
          </div>

          <div className="text-center p-6 bg-gray-800 rounded-lg border border-gray-700">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <Phone className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Téléphone</h3>
            <p className="text-gray-300">06 68 00 64 54</p>
          </div>

          <div className="text-center p-6 bg-gray-800 rounded-lg border border-gray-700">
            <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-4">
              <MapPin className="w-6 h-6 text-gray-600 dark:text-gray-300" />
            </div>
            <h3 className="text-lg font-semibold text-white mb-2">Zone</h3>
            <p className="text-gray-300">Normandie</p>
          </div>
        </div>

        {/* Note informative */}
        <div className="mt-12 bg-blue-500/10 border border-blue-500/20 rounded-lg p-6">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500/20 rounded-full flex items-center justify-center">
                <Lightbulb className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
            <div>
              <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">
                Temps de réponse
              </h4>
              <p className="text-gray-300 leading-relaxed">
                Je réponds généralement dans les 24h. Pour les demandes urgentes,
                n'hésitez pas à me contacter directement par téléphone.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmation */}
      <ConfirmationModal
        isOpen={isConfirmationOpen}
        onClose={closeConfirmation}
      />
    </div>
  );
};

export default Contact; 