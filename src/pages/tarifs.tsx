import React, { useState } from 'react';
import { Heart, Baby, Users, PawPrint, Camera, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/router';
import TarifCard from '../components/ui/TarifCard';
import ContactModal from '../components/ui/ContactModal';

const Tarifs: React.FC = () => {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const router = useRouter();

  const openContactModal = () => setIsContactModalOpen(true);
  const closeContactModal = () => setIsContactModalOpen(false);

  const handleBackClick = () => {
    router.push('/');
  };

  const prestations = [
    {
      icon: <Heart className="w-full h-full" />,
      title: "Mariage",
      description: "Reportage complet de votre plus beau jour, de la préparation à la soirée",
      price: "À partir de 900€",
      features: [
        "Couverture complète de la journée",
        "Photos de la préparation",
        "Cérémonie et cocktail",
        "Soirée dansante",
        "Galerie en ligne privée",
        "Retouches incluses"
      ]
    },
    {
      icon: <Baby className="w-full h-full" />,
      title: "Grossesse",
      description: "Séance photo pour immortaliser cette période magique d'attente",
      price: "120€",
      features: [
        "Séance de 1h",
        "10 photos retouchées",
        "Shooting en extérieur ou studio",
        "Photos en couple incluses",
        "Galerie en ligne"
      ]
    },
    {
      icon: <Baby className="w-full h-full" />,
      title: "Nouveau-né",
      description: "Séance à domicile pour capturer les premiers instants de bébé",
      price: "180€",
      features: [
        "Séance de 2h à domicile",
        "15 photos retouchées",
        "Accessoires et décors fournis",
        "Photos famille incluses",
        "Ambiance cocooning et sécurisée"
      ]
    },
    {
      icon: <Users className="w-full h-full" />,
      title: "Enfants & Famille",
      description: "Séance conviviale pour capturer la complicité familiale",
      price: "150€",
      features: [
        "Séance de 1h30",
        "12 photos retouchées",
        "En extérieur au choix",
        "Ambiance naturelle et décontractée",
        "Photos individuelles et de groupe"
      ]
    },
    {
      icon: <PawPrint className="w-full h-full" />,
      title: "Animaux",
      description: "Séance photo avec vos compagnons à quatre pattes",
      price: "100€",
      features: [
        "Séance de 1h",
        "8 photos retouchées",
        "En extérieur ou à domicile",
        "Photos avec et sans propriétaires",
        "Patience et bienveillance garanties"
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 py-16 px-4">
      <div className="max-w-6xl mx-auto">
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
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Tarifs
          </h1>
          <p className="text-xl text-gray-700 dark:text-gray-300 max-w-3xl mx-auto">
            Des prestations adaptées à chaque moment de vie
          </p>
          <div className="w-24 h-1 bg-blue-400 mx-auto mt-6"></div>
        </div>

        {/* Grille des prestations */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {prestations.map((prestation, index) => (
            <TarifCard
              key={index}
              icon={prestation.icon}
              title={prestation.title}
              description={prestation.description}
              price={prestation.price}
              features={prestation.features}
            />
          ))}
        </div>

        {/* Section informations supplémentaires */}
        <div className="bg-gray-800 rounded-xl p-8 mb-12">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Informations importantes
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Inclus dans tous les forfaits</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-gray-600 dark:text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Retouches professionnelles
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-gray-600 dark:text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Galerie en ligne privée
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-gray-600 dark:text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Photos en haute résolution
                </li>
                <li className="flex items-center">
                  <svg className="w-4 h-4 text-gray-600 dark:text-gray-400 mr-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Livraison sous 15 jours
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-3">Options supplémentaires</h3>
              <ul className="space-y-2 text-gray-300">
                <li className="flex justify-between">
                  <span>Album photo premium</span>
                  <span className="text-gray-600 dark:text-gray-400">+80€</span>
                </li>
                <li className="flex justify-between">
                  <span>Tirages papier (lot de 20)</span>
                  <span className="text-gray-600 dark:text-gray-400">+25€</span>
                </li>
                <li className="flex justify-between">
                  <span>Retouches supplémentaires</span>
                  <span className="text-gray-600 dark:text-gray-400">5€/photo</span>
                </li>
                <li className="flex justify-between">
                  <span>Déplacement (+50km)</span>
                  <span className="text-gray-600 dark:text-gray-400">0,50€/km</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Call to action */}
        <div className="text-center bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Une question ? Un projet ?
          </h2>
          <p className="text-blue-100 mb-8 max-w-2xl mx-auto">
            Chaque projet est unique. Contactez-moi pour discuter de vos besoins et obtenir un devis personnalisé gratuit.
          </p>
          <button
            onClick={openContactModal}
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-50 transition-colors duration-300 font-bold text-lg shadow-lg hover:shadow-xl"
          >
            <Camera className="mr-3 w-5 h-5" />
            Demander un devis personnalisé
          </button>
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