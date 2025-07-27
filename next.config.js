/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Formats optimisés - WebP et AVIF (encore plus compact)
    formats: ['image/webp', 'image/avif'],

    // Tailles d'appareils pour responsive
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],

    // Tailles d'images pour srcset
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],

    // Domaines externes autorisés (si besoin plus tard)
    domains: [],
  },
};

module.exports = nextConfig;
