import React from 'react';
import { AlertTriangle, ExternalLink } from 'lucide-react';
import Button from './Button';

const FirebaseWarning: React.FC = () => {
  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-6 mb-8">
      <div className="flex items-start">
        <AlertTriangle className="w-6 h-6 text-yellow-600 dark:text-yellow-500 mt-1 mr-3 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-300 mb-2">
            Configuration Firebase requise
          </h3>
          <p className="text-yellow-700 dark:text-yellow-200 mb-4">
            Firebase n'est pas encore configuré. Vous devez créer un projet Firebase et
            ajouter vos clés de configuration pour que l'authentification fonctionne.
          </p>

          <div className="bg-yellow-100 dark:bg-yellow-800/30 rounded-md p-4 mb-4">
            <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">Étapes à suivre :</h4>
            <ol className="list-decimal list-inside text-yellow-700 dark:text-yellow-200 space-y-1 text-sm">
              <li>Créez un projet sur <span className="font-mono">console.firebase.google.com</span></li>
              <li>Activez l'authentification (Email/Mot de passe)</li>
              <li>Copiez les clés de configuration</li>
              <li>Créez un fichier <span className="font-mono">.env</span> à la racine</li>
              <li>Ajoutez vos variables d'environnement</li>
            </ol>
          </div>

          <div className="bg-gray-900 dark:bg-gray-800 rounded-md p-4 mb-4">
            <h4 className="font-medium text-white mb-2">Exemple de fichier .env :</h4>
            <pre className="text-green-400 text-sm overflow-x-auto">
              {`VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id`}
            </pre>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="https://console.firebase.google.com"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="w-full sm:w-auto">
                <ExternalLink className="w-4 h-4 mr-2" />
                Ouvrir Firebase Console
              </Button>
            </a>
            <Button
              variant="ghost"
              onClick={() => typeof window !== 'undefined' && window.location.reload()}
            >
              Recharger la page
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FirebaseWarning; 