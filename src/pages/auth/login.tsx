import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Layout from '../../components/layout/Layout';
import { Button, Input } from '../../components/ui';
import { useAuth } from '../../hooks/useAuth';
import { ROUTES } from '../../utils/constants';
import { isUserAdmin } from '../../services/adminService';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn, signOut } = useAuth();
  const router = useRouter();

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
                <a href="#" className="font-medium text-primary-600 hover:text-primary-500">
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
    </Layout>
  );
};

export default LoginPage; 