import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Button from '../ui/Button';

/**
 * Modale de mise à jour.
 *
 * La page embarque la version du déploiement qui l'a servie. On interroge
 * /api/version, toujours servie par le déploiement le plus récent. Si les
 * versions diffèrent, une nouvelle version est en ligne.
 *
 * La modale est portée sur document.body : un ancêtre avec transform
 * empêcherait un élément « fixed » de se coller à l'écran.
 */

const checkIntervalMs = 60_000;

type UpdateBannerProps = {
  /** Version du déploiement qui a rendu la page (SHA du commit, ou "dev"). */
  initialVersion: string;
};

export function UpdateBanner({ initialVersion }: UpdateBannerProps) {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);

  useEffect(() => {
    if (initialVersion === 'dev') {
      return;
    }

    let isCancelled = false;

    async function checkVersion() {
      try {
        const response = await fetch('/api/version', { cache: 'no-store' });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { version?: string };

        if (
          !isCancelled &&
          data.version &&
          data.version !== 'dev' &&
          data.version !== initialVersion
        ) {
          setIsUpdateAvailable(true);
        }
      } catch {
        // Hors ligne ou serveur injoignable : on réessaiera au prochain tick.
      }
    }

    function handleVisibilityChange() {
      if (document.visibilityState === 'visible') {
        void checkVersion();
      }
    }

    function handleReturn() {
      void checkVersion();
    }

    const interval = window.setInterval(() => void checkVersion(), checkIntervalMs);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleReturn);
    window.addEventListener('pageshow', handleReturn);
    void checkVersion();

    return () => {
      isCancelled = true;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleReturn);
      window.removeEventListener('pageshow', handleReturn);
    };
  }, [initialVersion]);

  if (!isUpdateAvailable || typeof document === 'undefined') {
    return null;
  }

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="app-update-title"
      className="fixed inset-0 z-[80] flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-charcoal/75 backdrop-blur-sm" />
      <div className="relative w-full max-w-md rounded-2xl border border-primary-200 bg-cream-light p-6 shadow-xl dark:border-primary-700 dark:bg-charcoal">
        <h2 id="app-update-title" className="text-lg font-medium text-primary-600 dark:text-primary-400">
          Nouvelle version disponible
        </h2>
        <p className="mt-2 text-sm leading-6 text-charcoal dark:text-cream-light">
          Mettez à jour pour profiter des dernières améliorations.
        </p>
        <div className="mt-6 flex justify-end">
          <Button type="button" onClick={() => window.location.reload()}>
            Mettre à jour
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}
