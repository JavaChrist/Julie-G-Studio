import React, { useState } from 'react';
import { Camera, Heart, Baby, Instagram, Facebook, ArrowDown, Shield, Mail, Phone, MapPin, Linkedin } from 'lucide-react';
import Link from 'next/link';
import Navbar from '../components/ui/Navbar';
import PortfolioGrid from '../components/ui/PortfolioGrid';
import ContactModal from '../components/ui/ContactModal';

export default function Home() {
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);

  const openContactModal = () => setIsContactModalOpen(true);
  const closeContactModal = () => setIsContactModalOpen(false);

  const scrollToPortfolios = () => {
    const element = document.getElementById('portfolios');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const tarifs = [
    {
      title: 'Mariage',
      price: 'À partir de 890€',
      description: 'Cérémonie + Cocktail + Soirée',
      icon: Heart,
      features: [
        'Couverture complète',
        'Retouches incluses',
        'Galerie en ligne',
        'Tirages HD offerts'
      ]
    },
    {
      title: 'Naissance',
      price: 'À partir de 350€',
      description: 'Séance nouveau-né à domicile',
      icon: Baby,
      features: [
        'Séance de 2h',
        '20 photos retouchées',
        'Accessoires fournis',
        'Photos famille incluses'
      ]
    },
    {
      title: 'Famille',
      price: 'À partir de 180€',
      description: 'Séance photo en extérieur',
      icon: Camera,
      features: [
        'Séance de 1h30',
        '15 photos retouchées',
        'Lieu au choix',
        'Galerie privée'
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      {/* Navbar */}
      <Navbar onContactClick={openContactModal} />

      {/* Hero Section */}
      <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Image de fond */}
        <div className="absolute inset-0">
          <img
            src="/Couple mariage.jpg"
            alt="Couple de mariés"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Contenu centré */}
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            Julie G Studio
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl mx-auto font-light">
            Capturer vos plus beaux moments
          </p>
          <button
            onClick={scrollToPortfolios}
            className="inline-flex items-center px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-300 font-medium text-lg shadow-lg hover:shadow-xl"
          >
            Voir les portfolios
            <ArrowDown className="ml-2 w-5 h-5" />
          </button>
        </div>


      </section>

      {/* Section Portfolios */}
      <PortfolioGrid />

      {/* Section Tarifs */}
      <section id="tarifs" className="py-16 px-4 bg-white dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          {/* Titre de section */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Mes prestations
            </h2>
            <p className="text-lg text-gray-700 dark:text-gray-300 max-w-2xl mx-auto">
              Des forfaits adaptés à tous vos besoins pour immortaliser vos moments précieux
            </p>
          </div>

          {/* Cartes tarifs */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {tarifs.map((tarif, index) => (
              <div
                key={index}
                className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 hover:shadow-lg transition-shadow duration-300 border border-gray-100 dark:border-gray-700"
              >
                {/* Icône */}
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center">
                    <tarif.icon className="w-8 h-8 text-gray-700 dark:text-gray-300" />
                  </div>
                </div>

                {/* Contenu */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                    {tarif.title}
                  </h3>
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    {tarif.description}
                  </p>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                    {tarif.price}
                  </div>

                  {/* Features */}
                  <ul className="space-y-3 mb-8">
                    {tarif.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-gray-700 dark:text-gray-300">
                        <svg className="w-4 h-4 text-gray-600 dark:text-gray-400 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  {/* Bouton */}
                  <button
                    onClick={openContactModal}
                    className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300 font-medium"
                  >
                    Me contacter
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Note */}
          <div className="text-center mt-12">
            <p className="text-gray-700 dark:text-gray-400 text-sm">
              * Tarifs indicatifs. Devis personnalisé sur demande selon vos besoins spécifiques.
            </p>
          </div>
        </div>
      </section>

      {/* Section Contact CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Envie d'immortaliser vos plus beaux instants ?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Contactez-moi pour discuter de votre projet et créer ensemble des souvenirs qui vous ressemblent
          </p>
          <button
            onClick={openContactModal}
            className="inline-flex items-center px-8 py-4 bg-white text-blue-600 rounded-lg hover:bg-gray-50 transition-colors duration-300 font-bold text-lg shadow-lg hover:shadow-xl"
          >
            Contactez-moi
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 dark:bg-gray-800 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Logo et description */}
            <div>
              <div className="flex items-center mb-4">
                <Camera className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                <span className="ml-2 text-xl font-bold">Julie G Studio</span>
              </div>
              <p className="text-gray-300 mb-6">
                Photographe passionnée, je capture l'émotion et l'authenticité de vos moments les plus précieux.
              </p>

              {/* Réseaux sociaux */}
              <div className="flex space-x-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors duration-300"
                  aria-label="Instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors duration-300"
                  aria-label="Facebook"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors duration-300"
                  aria-label="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Navigation */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Navigation</h3>
              <ul className="space-y-2">
                <li>
                  <a href="#hero" className="text-gray-300 hover:text-white transition-colors">
                    Accueil
                  </a>
                </li>
                <li>
                  <a href="#portfolios" className="text-gray-300 hover:text-white transition-colors">
                    Portfolios
                  </a>
                </li>
                <li>
                  <Link href="/tarifs" className="text-gray-300 hover:text-white transition-colors">
                    Tarifs
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-gray-300 hover:text-white transition-colors">
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href="/acces" className="text-gray-300 hover:text-white transition-colors flex items-center">
                    <Shield className="w-4 h-4 mr-2" />
                    Accès client
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="text-gray-300 hover:text-white transition-colors flex items-center">
                    <Camera className="w-4 h-4 mr-2" />
                    Admin
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact info */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact</h3>
              <div className="space-y-2 text-gray-300">
                <p className="flex items-center">
                  <Mail className="w-4 h-4 mr-2" />
                  julie-g.studio@gmail.com
                </p>
                <p className="flex items-center">
                  <Phone className="w-4 h-4 mr-2" />
                  06 68 00 64 54
                </p>
                <p className="flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Normandie
                </p>
              </div>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-gray-800 mt-8 pt-8 text-center space-y-2">
            <p className="text-gray-600 dark:text-gray-400">
              © 2025 Julie G Studio. Tous droits réservés.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Réalisé par{' '}
              <a
                href="https://javachrist.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 dark:text-gray-400 hover:text-white transition-colors underline"
              >
                JavaChrist
              </a>
            </p>
          </div>
        </div>
      </footer>

      {/* Modal de contact */}
      <ContactModal
        isOpen={isContactModalOpen}
        onClose={closeContactModal}
      />
    </div>
  );
}
