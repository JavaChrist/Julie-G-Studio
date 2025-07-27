import React from 'react';
import PortfolioCard from '../components/ui/PortfolioCard';

const Portfolios: React.FC = () => {
  const portfolioCategories = [
    {
      title: 'Mariage',
      image: '/DSC_0027.jpg',
      link: '/portfolios/mariage'
    },
    {
      title: 'Grossesse',
      image: '/Femme-enceinte-dans-pres.jpg',
      link: '/portfolios/grossesse'
    },
    {
      title: 'Nouveau-né',
      image: '/DSC_0384.jpg',
      link: '/portfolios/nouveau-ne'
    },
    {
      title: 'Famille & Enfants',
      image: '/DSC_0813.jpg',
      link: '/portfolios/enfants'
    },
    {
      title: 'Animaux',
      image: '/DSC_0164.jpg',
      link: '/portfolios/animaux'
    },
    {
      title: 'Sénior',
      image: '/DSC_0092 (1).jpg',
      link: '/portfolios/portrait'
    },
    {
      title: 'Spectacle',
      image: '/DSC_1244.jpg',
      link: '/portfolios/spectacle'
    },
    {
      title: 'Métiers & Entreprises',
      image: '/DSC_1090.jpg',
      link: '/portfolios/portrait'
    }
  ];

  return (
    <div className="min-h-screen bg-white transition-colors duration-300 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Mes univers
          </h1>
          <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto">
            Découvrez mon travail par catégorie
          </p>
        </div>

        {/* Grille des portfolios */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-8">
          {portfolioCategories.map((category, index) => (
            <div
              key={category.title}
              className={`${index === 4 ? 'col-span-2 md:col-span-1' : ''}`}
            >
              <PortfolioCard
                title={category.title}
                image={category.image}
                link={category.link}
              />
            </div>
          ))}
        </div>

        {/* Call to action */}
        <div className="text-center mt-16">
          <p className="text-gray-600 mb-6">
            Chaque univers raconte une histoire unique
          </p>
          <button
            onClick={() => typeof window !== 'undefined' && window.history.back()}
            className="inline-flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-300 font-medium"
          >
            <svg className="mr-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Retour à l'accueil
          </button>
        </div>
      </div>
    </div>
  );
};

export default Portfolios; 