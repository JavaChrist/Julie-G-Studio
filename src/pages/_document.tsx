import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        {/* Meta tags additionnels pour PWA iOS */}
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
        <meta name="robots" content="index,follow" />
        <meta name="googlebot" content="index,follow" />

        {/* PWA iOS spécifique */}
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        {/* Description pour moteurs de recherche */}
        <meta name="description" content="Julie Grohens, photographe d'émotions en Normandie. Spécialisée dans la photographie de mariage, grossesse, nouveau-né, famille et portrait. Capturer vos plus beaux moments avec authenticité et délicatesse." />
        <meta name="keywords" content="photographe, Normandie, mariage, grossesse, nouveau-né, famille, portrait, Julie Grohens, photographie, émotions" />

        {/* Open Graph pour réseaux sociaux */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Julie Grohens Photographe d'émotions" />
        <meta property="og:description" content="Photographe d'émotions en Normandie - Mariage, Grossesse, Nouveau-né, Famille" />
        <meta property="og:image" content="/logo512.png" />
        <meta property="og:image:width" content="512" />
        <meta property="og:image:height" content="512" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:description" content="Photographe d'émotions en Normandie - Mariage, Grossesse, Nouveau-né, Famille" />
        <meta name="twitter:image" content="/logo512.png" />

        {/* Preload critical assets */}
        <link rel="preload" href="/SignatureJulieBlanc.png" as="image" />
        <link rel="preload" href="/logo192.png" as="image" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
} 