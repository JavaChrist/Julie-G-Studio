import React from 'react';
import { useRouter } from 'next/router';

interface PortfolioCategory {
  id: string;
  name: string;
  image: string;
  description: string;
}

const PortfolioGrid: React.FC = () => {
  const router = useRouter();

  const portfolioCategories: PortfolioCategory[] = [
    {
      id: 'mariage',
      name: 'Mariage',
      image: '/DSC_0027.jpg',
      description: ' L’émotion d’un oui'
    },
    {
      id: 'grossesse',
      name: 'Grossesse',
      image: '/Femme-enceinte-dans-pres.jpg',
      description: 'Porter la vie en lumière'
    },
    {
      id: 'nouveau-ne',
      name: 'Nouveau-né',
      image: '/DSC_0384.jpg',
      description: 'Les premiers souffles de la vie'
    },
    {
      id: 'enfants',
      name: 'Famille & Enfants',
      image: '/DSC_0813.jpg',
      description: 'Instants complices en famille'
    },
    {
      id: 'animaux',
      name: 'Animaux',
      image: '/DSC_0164.jpg',
      description: 'Complicités à quatre pattes'
    },
    {
      id: 'portrait',
      name: 'Sénior',
      image: '/DSC_0092 (1).jpg',
      description: 'L’émotion d’une vie en images'
    },
    {
      id: 'spectacle',
      name: 'Spectacle',
      image: '/DSC_1244.jpg',
      description: 'L’\émotion sur scène'
    },
    {
      id: 'entreprise',
      name: 'Métiers & Entreprises',
      image: '/DSC_1090.jpg',
      description: 'Votre savoir-faire en images'
    }
  ];

  const handleCategoryClick = (categoryId: string) => {
    router.push(`/portfolios/${categoryId}`);
  };

  return (
    <section id="portfolios" className="py-16 px-4 bg-gray-50 transition-colors duration-300">
      <div className="max-w-6xl mx-auto">
        {/* Titre de section */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Mes univers
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Découvrez mes différents styles photographiques adaptés à chaque moment de votre vie
          </p>
        </div>

        {/* Grille des portfolios */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
          {portfolioCategories.map((category, index) => (
            <div
              key={category.id}
              className="relative group cursor-pointer overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              onClick={() => handleCategoryClick(category.id)}
            >
              {/* Image de fond */}
              <div className="aspect-square md:aspect-[4/5] relative">
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />

                {/* Overlay gradient adaptatif */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent" />

                {/* Overlay hover */}
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Contenu */}
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h3 className="text-white text-lg md:text-xl font-bold mb-1">
                  {category.name}
                </h3>
                <p className="text-white/80 text-sm md:text-base">
                  {category.description}
                </p>
              </div>

              {/* Indicateur hover */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center mt-12">
          <p className="text-gray-600 mb-6">
            Envie de voir plus de mon travail ?
          </p>
          <button
            onClick={() => router.push('/portfolios')}
            className="inline-flex items-center px-6 py-3 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-600 hover:text-white transition-colors duration-300 font-medium"
          >
            Voir tous mes portfolios
            <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
};

export default PortfolioGrid; 