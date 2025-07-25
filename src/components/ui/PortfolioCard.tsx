import React from 'react';
import { useRouter } from 'next/router';

interface PortfolioCardProps {
  title: string;
  image: string;
  link: string;
}

const PortfolioCard: React.FC<PortfolioCardProps> = ({ title, image, link }) => {
  const router = useRouter();

  const handleClick = () => {
    router.push(link);
  };

  return (
    <div
      onClick={handleClick}
      className="relative group cursor-pointer overflow-hidden rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
    >
      {/* Image de fond */}
      <div className="aspect-square md:aspect-[4/5] relative">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Overlay adaptatif */}
        <div className="absolute inset-0 bg-black/30 dark:bg-black/60" />

        {/* Overlay hover */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>

      {/* Contenu centré */}
      <div className="absolute inset-0 flex items-center justify-center">
        <h3 className="text-white text-xl md:text-2xl font-bold text-center px-4">
          {title}
        </h3>
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
  );
};

export default PortfolioCard; 