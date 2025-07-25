import React from 'react';
import Head from 'next/head';
import Header from './Header';
import Footer from './Footer';
import { APP_NAME, APP_DESCRIPTION } from '../../utils/constants';

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

const Layout: React.FC<LayoutProps> = ({
  children,
  title = APP_NAME,
  description = APP_DESCRIPTION,
}) => {
  const pageTitle = title === APP_NAME ? title : `${title} | ${APP_NAME}`;

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={description} />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" type="image/png" sizes="192x192" href="/logo192.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/logo192.png" />
        <link rel="shortcut icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Layout; 