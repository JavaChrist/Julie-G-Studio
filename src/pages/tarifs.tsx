import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/router';
import ContactModal from '../components/ui/ContactModal';

const Tarifs: React.FC = () => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const router = useRouter();

  const openContactModal = () => setIsContactModalOpen(true);
  const closeContactModal = () => setIsContactModalOpen(false);

  const handleBackClick = () => {
    router.push('/');
  };

  const formules = [
    {
      title: "FORMULE FAMILLE ESSENTIELLE",
      subtitle: "Les échanges de pré-séance et sa préparation.",
      duration: "45min/1h de shoot",
      features: [
        "L'utilisation de mon matériel photographique et informatique",
        "10 photos sélectionnées par mon œil aguerri",
        "Le temps de retouche des photos",
        "Le droit de diffusion et de reproduction",
        "Livrées sous format numérique"
      ],
      price: "210€"
    },
    {
      title: "FORMULE FAMILLE CONFORT",
      subtitle: "Les échanges de pré-séance et sa préparation.",
      duration: "1h30/2h de shoot",
      features: [
        "L'utilisation de mon matériel photographique et informatique",
        "20 photos sélectionnées par mon œil aguerri",
        "Le temps de retouche des photos",
        "Le droit de diffusion et de reproduction",
        "Livrées sous format numérique"
      ],
      price: "370€"
    },
    {
      title: "FORMULE FAMILLE COMPLÈTE",
      subtitle: "Les échanges de pré-séance et sa préparation.",
      duration: "2h ou plus de shoot",
      features: [
        "L'utilisation de mon matériel photographique et informatique",
        "50 photos sélectionnées par mon œil aguerri",
        "Le temps de retouche des photos",
        "Le droit de diffusion et de reproduction",
        "Livrées sous format numérique"
      ],
      price: "750€"
    }
  ];

  return (
    <div className="min-h-screen bg-cream-main py-8 px-4">
      <div className="max-w-6xl mx-auto">
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

        {/* Header avec titre et images circulaires de chaque côté */}
        <div className="flex justify-center items-center mb-20 relative">
          {/* Image demi-cercle gauche */}
          <div className="absolute left-0 w-34 h-40 md:w-42 md:h-60 overflow-hidden" style={{ borderRadius: '50% 50% 0 0' }}>
            <img
              src="/DSC_0649.jpg"
              alt="Grossesse"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Titre central */}
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-light text-charcoal mb-2 tracking-wider">
              TARIFS <span className="italic font-serif">&</span>
            </h1>
            <h2 className="text-5xl md:text-6xl font-light text-charcoal mb-6 tracking-wider">
              PRESTATIONS
            </h2>
            <p className="text-lg text-gray-600 tracking-widest">
              SESSION PORTRAIT & FAMILLE
            </p>
          </div>

          {/* Image demi-cercle droite */}
          <div className="absolute right-0 w-34 h-40 md:w-42 md:h-60 overflow-hidden" style={{ borderRadius: '50% 50% 0 0' }}>
            <img
              src="/DSC_0400.jpg"
              alt="Famille"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Photos et Formules - chaque photo centrée au-dessus de sa formule */}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
          {formules.map((formule, index) => {
            const images = ["/DSC_0813.jpg", "/DSC_0001.webp", "/DSC_0384.jpg"];
            const alts = ["Portrait enfant", "Portrait enfant", "Portrait famille"];

            return (
              <div key={index} className="flex flex-col items-center">
                {/* Photo centrée */}
                <div className="w-42 h-60 mb-8 overflow-hidden" style={{ borderRadius: '50% 50% 0 0' }}>
                  <img
                    src={images[index]}
                    alt={alts[index]}
                    className="w-full h-full object-cover"
                  />
                </div>

                {/* Formule */}
                <div className="bg-cream-light p-8 text-center border border-gray-200 w-full">
                  <h3 className="text-lg font-semibold text-charcoal mb-2 tracking-wide">
                    {formule.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 italic">
                    {formule.subtitle}
                  </p>
                  <p className="text-sm font-medium text-gray-700 mb-6">
                    {formule.duration}
                  </p>

                  <div className="space-y-3 mb-8">
                    {formule.features.map((feature, featureIndex) => (
                      <p key={featureIndex} className="text-xs text-gray-600 leading-relaxed">
                        {feature}
                      </p>
                    ))}
                  </div>

                  <div className="border border-gray-400 inline-block px-8 py-3">
                    <span className="text-2xl font-light text-charcoal">
                      {formule.price}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de contact */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={closeContactModal}
      />
    </div>
  );
};

export default Tarifs; 