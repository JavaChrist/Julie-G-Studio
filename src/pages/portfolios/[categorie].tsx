import React from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft } from 'lucide-react';
import Gallery from '../../components/ui/Gallery';

// Données temporaires - à remplacer par Firestore plus tard
const galleries: Record<string, string[]> = {
  mariage: [
    "/Couple mariage.jpg",
    "/La marié.jpg",
    "/DSC_0026.jpg",
    "/DSC_0069.jpg",
    "/DSC_0174 (2).jpg",
    "/DSC_0321.jpg"
  ],
  grossesse: [
    "/Femme-enceinte-dans-pres.jpg",
    "/Femme-enceinte-avec-enfant.jpg",
    "/DSC_0156 (3).jpg",
    "/DSC_0326.jpg"
  ],
  "nouveau-ne": [
    "/Famille-enfant-epaule.jpg",
    "/DSC_0397.jpg",
    "/DSC_0500.jpg",
    "/DSC_0602 (3).jpg"
  ],
  enfants: [
    "/Famille-au-bord-de-eau.jpg",
    "/DSC_0629 (1).jpg",
    "/DSC_0641.jpg",
    "/DSC_0674.jpg",
    "/DSC_0677.jpg"
  ],
  animaux: [
    "/Cheval.jpg",
    "/Cavalière.jpg",
    "/DSC_0705.jpg",
    "/DSC_0803 (2).jpg"
  ]
};

// Noms formatés pour l'affichage
const categoryNames: Record<string, string> = {
  mariage: "Mariage",
  grossesse: "Grossesse",
  "nouveau-ne": "Nouveau-né",
  enfants: "Enfants",
  animaux: "Animaux"
};

const PortfolioCategory: React.FC = () => {
  const router = useRouter();
  const { categorie } = router.query;

  // Vérifier que la catégorie existe
  const categoryString = typeof categorie === 'string' ? categorie : '';
  const images = galleries[categoryString] || [];
  const categoryName = categoryNames[categoryString] || categoryString;

  const handleBackClick = () => {
    router.push('/portfolios');
  };

  // Loading state pendant que Next.js génère la page
  if (router.isFallback) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 flex items-center justify-center">
        <div className="text-gray-900 dark:text-white text-lg">Chargement...</div>
      </div>
    );
  }

  // Catégorie inconnue
  if (!categoryString || !galleries[categoryString]) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
            Portfolio non trouvé
          </h1>
          <p className="text-gray-300 mb-8">
            La catégorie "{categoryString}" n'existe pas.
          </p>
          <button
            onClick={handleBackClick}
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 font-medium"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Retour aux portfolios
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header avec bouton retour */}
        <div className="mb-12">
          <button
            onClick={handleBackClick}
            className="inline-flex items-center px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors duration-300 mb-6 group"
          >
            <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
            Retour aux portfolios
          </button>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
            {categoryName}
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300">
            Découvrez ma sélection de photos pour cette catégorie
          </p>
        </div>

        {/* Galerie */}
        <Gallery images={images} />

        {/* Call to action */}
        <div className="text-center mt-16 py-8 border-t border-gray-200 dark:border-gray-800">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Vous aimez ce style ?
          </h3>
          <p className="text-gray-700 dark:text-gray-300 mb-6">
            Contactez-moi pour discuter de votre projet et créer ensemble des souvenirs uniques
          </p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 font-medium"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
};

export default PortfolioCategory;

// Rendu côté serveur pour les catégories dynamiques
export async function getServerSideProps() {
  // Pas de props spéciales nécessaires, juste pour permettre le rendu SSR
  return {
    props: {}
  };
} 