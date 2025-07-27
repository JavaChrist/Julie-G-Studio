import React, { useState } from 'react';
import Image from 'next/image';
import { Instagram, Facebook, ArrowDown, Shield, Mail, Phone, MapPin, Linkedin } from 'lucide-react';
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



  return (
    <div className="min-h-screen bg-cream-main transition-colors duration-300">
      {/* Navbar */}
      <Navbar onContactClick={openContactModal} />

      {/* Hero Section */}
      <section id="hero" className="relative h-screen flex items-center justify-center overflow-hidden">
        {/* Image de fond */}
        <div className="absolute inset-0">
          <Image
            src="/DSC_0813.jpg"
            alt="Image de Soline fille de la photographe"
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        {/* Contenu centré */}
        <div className="relative z-10 text-center text-white px-4">
          <Image
            src="/SignatureJulieBlanc.png"
            alt="Julie Grohens Photographe d'émotions"
            width={800}
            height={280}
            className="mx-auto mb-6 h-96 md:h-80 lg:h-96 xl:h-96 w-auto"
            priority
          />
          <p className="text-xl md:text-2xl mb-8 max-w-4xl mx-auto font-light">
            Photographe d'émotions
          </p>
          <button
            onClick={scrollToPortfolios}
            className="inline-flex items-center px-8 py-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors duration-300 font-medium text-lg shadow-lg hover:shadow-xl"
          >
            Voir les portfolios
            <ArrowDown className="ml-2 w-5 h-5" />
          </button>
        </div>


      </section>

      {/* Section Portfolios */}
      <PortfolioGrid />



      {/* Section Contact CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-primary-500 to-primary-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Envie d'immortaliser vos plus beaux instants ?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-4xl mx-auto">
            Contactez-moi pour discuter de votre projet et créer ensemble des souvenirs qui vous ressemblent
          </p>
          <button
            onClick={openContactModal}
            className="inline-flex items-center px-8 py-4 bg-white text-primary-600 rounded-lg hover:bg-gray-50 transition-colors duration-300 font-bold text-lg shadow-lg hover:shadow-xl"
          >
            Contactez-moi
            <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Logo et description */}
            <div>
              <div className="flex items-center mb-4">
                <Image
                  src="/logo192.png"
                  alt="Logo Julie Grohens"
                  width={32}
                  height={32}
                  className="w-20 h-20"
                />
                <span className="ml-2 text-xl font-bold">Julie Grohens Photographe d'émotions</span>
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
                    <Image
                      src="/logo192.png"
                      alt="Logo"
                      width={16}
                      height={16}
                      className="w-4 h-4 mr-2"
                    />
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
                  jgrohens.photographie@gmail.com
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
            <p className="text-gray-600">
              © 2025 Julie Grohens Photographe d'émotions. Tous droits réservés.
            </p>
            <p className="text-sm text-gray-500">
              Réalisé par{' '}
              <a
                href="https://javachrist.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-white transition-colors underline"
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
