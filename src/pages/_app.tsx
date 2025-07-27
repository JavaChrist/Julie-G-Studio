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

        {/* Apple Touch Icons - iOS PWA (fond opaque requis) */}
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="144x144" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="114x114" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="76x76" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="72x72" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="60x60" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" sizes="57x57" href="/apple-touch-icon.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

        {/* Startup Images iOS */}
        <link rel="apple-touch-startup-image" href="/apple-touch-icon.png" />

        {/* Meta pour PWA */}
        <meta name="application-name" content="Julie Grohens Photographe d'émotions" />
        <meta name="apple-mobile-web-app-title" content="Julie Grohens Photographe" />
        <meta name="theme-color" content="#D08C60" />

        {/* Configuration PWA Apple */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-touch-fullscreen" content="yes" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />

        {/* Viewport optimisé pour PWA */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />

        {/* Meta pour forcer PWA iOS */}
        <meta name="mobile-web-app-title" content="Julie Grohens" />
        <meta name="apple-mobile-web-app-title" content="Julie Grohens" />
      </Head>
      <Component {...pageProps} />
    </AuthProvider>
  )
}