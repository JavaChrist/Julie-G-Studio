import React, { useState } from 'react';
import { Key, Eye, Lightbulb, Lock } from 'lucide-react';
import { useRouter } from 'next/router';
import { isAlbumValid } from '../../services/albumService';

interface AccessFormProps {
  onError: (message: string) => void;
}

const AccessForm: React.FC<AccessFormProps> = ({ onError }) => {
  const [code, setCode] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [codeError, setCodeError] = useState('');
  const router = useRouter();

  // Validation du code
  const validateCode = (): boolean => {
    if (code.trim().length < 4) {
      setCodeError('Le code doit contenir au moins 4 caractères');
      return false;
    }
    setCodeError('');
    return true;
  };

  // Gestion du changement du champ
  const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCode(value);

    // Effacer l'erreur quand l'utilisateur tape
    if (codeError) {
      setCodeError('');
    }
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateCode()) {
      return;
    }

    setIsChecking(true);

    try {
      const isValid = await isAlbumValid(code.toLowerCase());

      if (isValid) {
        // Code valide → redirection vers l'album
        console.log(`Code valide: ${code}`);
        router.push(`/album/${code.toLowerCase()}`);
      } else {
        // Code invalide → afficher erreur
        onError("Code invalide ou expiré. Veuillez contacter Julie Grohens Photographe d'émotions.");
      }

    } catch (error) {
      console.error('Erreur lors de la vérification du code:', error);
      onError('Une erreur est survenue lors de la vérification. Veuillez réessayer.');
    } finally {
      setIsChecking(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Champ Code d'accès */}
      <div>
        <label htmlFor="access-code" className="block text-sm font-medium text-charcoal mb-2">
          Code d'accès *
        </label>
        <div className="relative">
          <input
            type="text"
            id="access-code"
            name="access-code"
            value={code}
            onChange={handleCodeChange}
            className={`w-full px-4 py-3 pl-12 bg-white border rounded-lg text-charcoal placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors duration-300 uppercase tracking-wider ${codeError ? 'border-red-500' : 'border-gray-300 focus:border-primary-500'
              }`}
            placeholder="ENTREZ VOTRE CODE"
            disabled={isChecking}
            autoComplete="off"
            spellCheck={false}
          />
          <Key className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
        </div>
        {codeError && (
          <p className="mt-1 text-sm text-red-400">{codeError}</p>
        )}
      </div>

      {/* Bouton d'accès */}
      <button
        type="submit"
        disabled={isChecking || code.length < 4}
        className="w-full bg-primary-600 hover:bg-primary-700 disabled:bg-primary-400 disabled:cursor-not-allowed text-white font-medium py-3 px-6 rounded-lg transition-colors duration-300 flex items-center justify-center space-x-2"
      >
        {isChecking ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Vérification...</span>
          </>
        ) : (
          <>
            <Eye className="w-5 h-5" />
            <span>Voir l'album</span>
          </>
        )}
      </button>

      {/* Aide */}
      <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
        <div className="flex items-start space-x-3">
          <div className="flex-shrink-0">
            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
              <Lightbulb className="w-4 h-4 text-gray-600" />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-800 mb-1">
              Besoin d'aide ?
            </h4>
            <p className="text-xs text-gray-600 leading-relaxed">
              Votre code d'accès unique vous a été fourni par email après votre séance photo.
              En cas de problème, contactez-moi directement.
            </p>
          </div>
        </div>
      </div>

      {/* Note de sécurité */}
      <p className="text-center text-xs text-gray-600 flex items-center justify-center">
        <Lock className="w-3 h-3 mr-1" />
        Vos photos sont protégées et accessibles uniquement avec votre code personnel
      </p>
    </form>
  );
};

export default AccessForm; 