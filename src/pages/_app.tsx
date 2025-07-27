import '@/styles/globals.css'
import type { AppProps } from 'next/app'
import Head from 'next/head'
import { AuthProvider } from '../hooks/useAuth'

export default function App({ Component, pageProps }: AppProps) {
  return (
    <AuthProvider>
      <Head>
        {/* Favicons optimisés pour une meilleure visibilité */}
        <link rel="icon" type="image/png" sizes="32x32" href="/logo192.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/logo192.png" />
        <link rel="shortcut icon" href="/favicon.ico" />

        {/* Apple Touch Icons - Tailles spécifiques iOS */}
        <link rel="apple-touch-icon" sizes="180x180" href="/logo512.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/logo192.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/logo192.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/logo192.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/logo192.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/logo192.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/logo192.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/logo192.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/logo192.png" />
        <link rel="apple-touch-icon" sizes="57x57" href="/logo192.png" />
        <link rel="apple-touch-icon" href="/logo192.png" />
        
        {/* Startup Images iOS */}
        <link rel="apple-touch-startup-image" href="/logo512.png" />

        {/* Meta pour PWA */}
        <meta name="application-name" content="Julie Grohens Photographe d'émotions" />
        <meta name="apple-mobile-web-app-title" content="Julie Grohens Photographe" />
        <meta name="theme-color" content="#D08C60" />

        {/* Configuration PWA Apple */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Viewport optimisé pour PWA */}
        <meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
      </Head>
      <Component {...pageProps} />
    </AuthProvider>
  )
}