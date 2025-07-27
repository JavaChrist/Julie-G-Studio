import React from 'react';
import { useRouter } from 'next/router';
import { ArrowLeft } from 'lucide-react';
import Gallery from '../../components/ui/Gallery';

// Données temporaires - à remplacer par Firestore plus tard
const galleries: Record<string, string[]> = {
  mariage: [
    "/DSC_0027.jpg",
    "/DSC_0031.jpg",
    "/DSC_0069.jpg",
    "/DSC_0042.jpg",
    "/DSC_0098.jpg",
    "/DSC_0134.jpg",
    "/DSC_0155.jpg",
    "/DSC_0181.jpg",
    "/DSC_0187.jpg",
    "/DSC_0195.jpg",
    "/DSC_0208 (1).jpg",
    "/DSC_0246.jpg",
    "/DSC_0016.jpg"
  ],
  grossesse: [
    "/DSC_0641.jpg",
    "/Femme-enceinte-dans-pres.jpg",
    "/DSC_0649 (2).jpg",
    "/DSC_0264.jpg",
    "/DSC_0201.jpg",
    "/DSC_0462.jpg",
    "/DSC_0467.jpg",
    "/DSC_0625.jpg",
    "/DSC_0626.jpg"
  ],
  "nouveau-ne": [
    "/DSC_0126.jpg",
    "/DSC_0158.jpg",
    "/DSC_0152.jpg",
    "/DSC_0391.jpg",
    "/DSC_0384.jpg",
    "/DSC_0400.jpg",
    "/DSC_0154.jpg",
    "/DSC_0184.jpg",
    "/DSC_0366.jpg",
    "/DSC_0448.jpg",
    "/DSC_0486.jpg",
    "/DSC_0496.jpg",
    "/DSC_0505.jpg",
    "/DSC_0507.jpg"
  ],
  enfants: [
    "/DSC_0813.jpg",
    "/DSC_0001.webp",
    "/DSC_0008.jpg",
    "/DSC_0018.jpg",
    "/DSC_1428.jpg",
    "/DSC_1465.jpg",
    "/DSC_0765.jpg",
    "/DSC_1072 (1).jpg",
    "/DSC_1074 (1).jpg"
  ],
  animaux: [
    "/DSC_1268.jpg",
    "/Cavalière.jpg",
    "/DSC_0321.jpg",
    "/DSC_0142.jpg",
    "/DSC_0164.jpg",
    "/DSC_01741.jpg",
    "/DSC_0326.jpg",
    "/DSC_0417 (1).jpg",
    "/DSC_0629.jpg",
    "/DSC_0638.jpg",
    "/DSC_0763.jpg",
    "/DSC_0994.jpg",
    "/DSC_1061.jpg",
    "/DSC_1177.jpg",
    "/DSC_1278.jpg",
    "/DSC_1272N.jpg",
    "/DSC_1275 N.jpg",
    "/DSC_1286.jpg",
    "/DSC_1299.jpg",
    "/DSC_1468.jpg",
    "/DSC_1307.jpg"
  ],
  portrait: [
    "/DSC_0092 (1).jpg",
    "/DSC_0098 (1).jpg",
    "/DSC_0120 (1).jpg"
  ],
  spectacle: [
    "/DSC_1244.jpg",
    "/Cavalière.jpg",
    "/DSC_0488 (3).jpg",
    "/DSC_0982.jpg",
    "/DSC_0992 (1).jpg",
    "/DSC_1002.jpg",
    "/DSC_1011.jpg",
    "/DSC_1179 (1).jpg",
    "/DSC_1191.jpg",
    "/DSC_1225.jpg",
    "/DSC_1244.jpg"

  ],
  entreprise: [
    "/DSC_1090.jpg",
    "/DSC_1089.jpg",
    "/DSC_1095.jpg",
    "/DSC_1100.jpg",
    "/DSC_1154.jpg",
    "/DSC_1158.jpg",
    "/DSC_1164.jpg",
    "/DSC_1166.jpg"
  ]
};

// Noms formatés pour l'affichage
const categoryNames: Record<string, string> = {
  mariage: "Mariage",
  grossesse: "Grossesse",
  "nouveau-ne": "Nouveau-né",
  enfants: "Enfants & Famille",
  animaux: "Animaux",
  portrait: "Sénior",
  spectacle: "Spectacle",
  entreprise: "Métiers & Entreprises"
};

// Descriptions personnalisées pour chaque catégorie
const categoryDescriptions: Record<string, string> = {
  mariage: "Chaque mariage est unique, comme l’histoire qu’il célèbre. Je capture les regards échangés, les mains qui se cherchent, les sourires complices et les larmes discrètes. Discrète mais présente, je vous accompagne pour figer l’amour dans ce qu’il a de plus vrai, de plus vivant, de plus inoubliable.",
  grossesse: "Ces quelques mois uniques, intimes et vibrants, méritent d’être célébrés. Je vous propose une séance douce et naturelle, à votre rythme, pour immortaliser la beauté de votre maternité. En solo, en couple ou en famille, je capture l’émotion d’un ventre qui s’arrondit et d’un amour qui grandit.",
  "nouveau-ne": "Les tout premiers jours, fragiles et magiques, passent à toute vitesse. Dans une atmosphère apaisée et respectueuse de votre rythme, je capture la tendresse, les petits détails, les premiers liens tissés. Un reportage de douceur pour se souvenir, à jamais, de ce commencement.",
  enfants: "Capturer l’essence de vos liens, la spontanéité des rires et la tendresse d’un regard. Une séance en toute simplicité, pour figer ces moments si précieux que vous partagez au quotidien. Qu’il s’agisse d’une fratrie, de générations réunies ou d’une simple balade à deux, je saisis la beauté du vrai, avec douceur et authenticité.",
  animaux: "Ils font partie de la famille, avec leurs personnalités, leur tendresse, leur énergie. Je photographie vos compagnons dans un cadre naturel, pour figer leur caractère et les moments que vous partagez ensemble. Une séance pleine de spontanéité, de jeux, d’émotions…",
  portrait: "Parce que chaque ride est une histoire, chaque regard un souvenir, chaque sourire un héritage. Je me déplace en maison de repos ou de retraite pour offrir aux familles un moment suspendu : une séance intime, respectueuse, pleine de sens. Une manière d’honorer ceux qui ont tant donné, de créer un lien entre générations, et d’immortaliser la tendresse d’un instant avec eux.",
  spectacle: "Une performance ou un événement culturel, je capte la lumière, les regards, la tension, l’émerveillement. Photographier le spectacle, c’est raconter une histoire en images — la vôtre.",
  entreprise: "Vous êtes artisan, entrepreneur, créatif ou professionnel engagé ? Je mets en lumière votre univers, vos gestes, vos valeurs, à travers des images sincères et percutantes. Une photographie humaine et vraie pour parler de vous, de votre métier et de ce qui vous anime."
};

const PortfolioCategory: React.FC = () => {
  const router = useRouter();
  const { categorie } = router.query;

  // Vérifier que la catégorie existe
  const categoryString = typeof categorie === 'string' ? categorie : '';
  const images = galleries[categoryString] || [];
  const categoryName = categoryNames[categoryString] || categoryString;
  const categoryDescription = categoryDescriptions[categoryString] || "Découvrez ma sélection de photos pour cette catégorie";

  const handleBackClick = () => {
    router.push('/portfolios');
  };

  // Loading state pendant que Next.js génère la page
  if (router.isFallback) {
    return (
      <div className="min-h-screen bg-white transition-colors duration-300 flex items-center justify-center">
        <div className="text-gray-900 text-lg">Chargement...</div>
      </div>
    );
  }

  // Catégorie inconnue
  if (!categoryString || !galleries[categoryString]) {
    return (
      <div className="min-h-screen bg-white transition-colors duration-300 py-16 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">
            Portfolio non trouvé
          </h1>
          <p className="text-gray-300 mb-8">
            La catégorie "{categoryString}" n'existe pas.
          </p>
          <button
            onClick={handleBackClick}
            className="inline-flex items-center px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-300 font-medium"
          >
            <ArrowLeft className="mr-2 w-4 h-4" />
            Retour aux portfolios
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white transition-colors duration-300 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header avec bouton retour */}
        <div className="mb-12">
          <button
            onClick={handleBackClick}
            className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-300 mb-6 group"
          >
            <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
            Retour aux portfolios
          </button>

          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            {categoryName}
          </h1>
          <p className="text-lg text-gray-700 max-w-4xl">
            {categoryDescription}
          </p>
        </div>

        {/* Galerie */}
        <Gallery images={images} />

        {/* Call to action */}
        <div className="text-center mt-16 py-8 border-t border-gray-200">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Vous aimez ce style ?
          </h3>
          <p className="text-gray-700 mb-6 max-w-3xl mx-auto">
            Contactez-moi pour discuter de votre projet et créer ensemble des souvenirs uniques
          </p>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center px-8 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-300 font-medium"
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