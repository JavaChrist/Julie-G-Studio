import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/layout/Layout';
import { Button, Input } from '../../components/ui';
import Modal from '../../components/ui/Modal';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../utils/constants';
import { isUserAdmin } from '../../services/adminService';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signOut, resetPassword } = useAuth();
  const router = useRouter();
  const [showReset, setShowReset] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(email, password);

      // Vérifier si l'utilisateur est admin après connexion
      const userIsAdmin = await isUserAdmin();

      if (userIsAdmin) {
        router.push('/admin'); // Redirection vers le dashboard admin
      } else {
        setError('Accès refusé - Vous n\'avez pas les permissions administrateur');
        // Déconnecter l'utilisateur s'il n'est pas admin
        await signOut();
      }
    } catch (error: any) {
      setError(error.message || 'Erreur lors de la connexion');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenReset = (e: React.MouseEvent) => {
    e.preventDefault();
    setResetMsg(null);
    setShowReset(true);
  };

  const handleSendReset = async () => {
    if (!email) {
      setResetMsg('Veuillez saisir votre adresse email.');
      return;
    }
    try {
      setResetLoading(true);
      setResetMsg(null);
      await resetPassword(email);
      setResetMsg("Email d'instructions envoyé. Vérifiez votre boîte de réception.");
    } catch (err: any) {
      setResetMsg(err?.message || 'Erreur lors de lenvoi.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <Layout title="Connexion">
      <div className="min-h-screen flex items-center justify-center bg-cream-main transition-colors duration-300 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <img
              className="mx-auto h-60 w-auto"
              src="/logo192.png"
              alt="Logo"
            />
            <h2 className="mt-6 text-center text-3xl font-extrabold text-charcoal">
              Connectez-vous à votre compte
            </h2>
            <p className="mt-2 text-center text-sm text-charcoal">
              Accès administrateur uniquement
            </p>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <Input
                label="Adresse email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="votre@email.com"
              />

              <Input
                label="Mot de passe"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="text-sm">
                <a href="#" onClick={handleOpenReset} className="font-medium text-primary-600 hover:text-primary-500">
                  Mot de passe oublié ?
                </a>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading}
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>
        </div>
      </div>

      {/* Modal reset password */}
      <Modal isOpen={showReset} onClose={() => setShowReset(false)} title="Réinitialiser le mot de passe">
        <div className="space-y-4">
          <p className="text-sm text-white">
            Entrez votre adresse email. Vous recevrez un lien de réinitialisation si un compte existe.
          </p>
          <Input
            label="Adresse email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="votre@email.com"
          />
          {resetMsg && (
            <div className="text-sm {resetLoading ? 'text-white/90' : 'text-white'}">
              {resetMsg}
            </div>
          )}
          <div className="flex gap-3">
            <button
              onClick={() => setShowReset(false)}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
              disabled={resetLoading}
            >
              Annuler
            </button>
            <button
              onClick={handleSendReset}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
              disabled={resetLoading}
            >
              {resetLoading ? 'Envoi...' : 'Envoyer le lien'}
            </button>
          </div>
        </div>
      </Modal>
    </Layout>
  );
};

export default LoginPage; 