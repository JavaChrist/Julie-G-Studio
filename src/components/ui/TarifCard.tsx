import React from 'react';

interface TarifCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  price: string;
  features?: string[];
}

const TarifCard: React.FC<TarifCardProps> = ({ icon, title, description, price, features }) => {
  return (
    <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
      {/* Icône */}
      <div className="flex justify-center mb-6">
        <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center">
          <div className="text-blue-400 w-8 h-8">
            {icon}
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-white mb-3">
          {title}
        </h3>

        <p className="text-gray-300 mb-4 text-sm leading-relaxed">
          {description}
        </p>

        {/* Prix */}
        <div className="text-2xl font-bold text-blue-400 mb-6">
          {price}
        </div>

        {/* Features optionnelles */}
        {features && features.length > 0 && (
          <ul className="space-y-2 mb-6 text-left">
            {features.map((feature, index) => (
              <li key={index} className="flex items-center text-gray-300 text-sm">
                <svg className="w-4 h-4 text-blue-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default TarifCard; 