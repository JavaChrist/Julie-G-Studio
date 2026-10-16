import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { confirmPasswordReset, verifyPasswordResetCode } from 'firebase/auth';
import Layout from '../../components/layout/Layout';
import { Button, Input } from '../../components/ui';
import { auth } from '../../firebase/firebaseConfig';
import { ROUTES } from '../../utils/constants';

function resetErrorMessage(error: unknown): string {
  const code = (error as { code?: string }).code;
  if (code === 'auth/expired-action-code') {
    return 'Ce lien a expiré. Demandez un nouvel email depuis la page de connexion.';
  }
  if (code === 'auth/invalid-action-code') {
    return 'Ce lien n’est plus valable. Demandez un nouvel email depuis la page de connexion.';
  }
  if (code === 'auth/weak-password') {
    return 'Le mot de passe doit contenir au moins 6 caractères.';
  }
  return 'Impossible de mettre à jour le mot de passe. Réessayez dans un instant.';
}

const NouveauMotDePassePage: React.FC = () => {
  const router = useRouter();
  const oobCode = typeof router.query.oobCode === 'string' ? router.query.oobCode : '';

  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    if (!oobCode || !auth) {
      setError('Ce lien de réinitialisation est incomplet.');
      setChecking(false);
      return;
    }

    let cancelled = false;
    verifyPasswordResetCode(auth, oobCode)
      .then((accountEmail) => {
        if (!cancelled) setEmail(accountEmail);
      })
      .catch((err) => {
        if (!cancelled) setError(resetErrorMessage(err));
      })
      .finally(() => {
        if (!cancelled) setChecking(false);
      });

    return () => {
      cancelled = true;
    };
  }, [router.isReady, oobCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }
    if (password !== confirm) {
      setError('Les deux mots de passe ne correspondent pas.');
      return;
    }
    if (!auth || !oobCode) {
      setError('Ce lien de réinitialisation est incomplet.');
      return;
    }

    try {
      setSaving(true);
      await confirmPasswordReset(auth, oobCode, password);
      setDone(true);
    } catch (err) {
      setError(resetErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout title="Nouveau mot de passe">
      <div className="min-h-screen flex items-center justify-center bg-cream-main py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div>
            <img className="mx-auto h-40 w-auto" src="/logo192.png" alt="Julie Grohens Photographie" />
            <h1 className="mt-6 text-center text-3xl font-extrabold text-charcoal">
              Nouveau mot de passe
            </h1>
            <p className="mt-2 text-center text-sm text-taupe">
              {email ? `Compte ${email}` : "Choisissez un mot de passe pour votre espace."}
            </p>
          </div>

          {checking ? (
            <p className="text-center text-charcoal">Vérification du lien…</p>
          ) : done ? (
            <div className="bg-white border border-primary-200 rounded-lg p-6 text-center space-y-4">
              <p className="text-charcoal">Votre mot de passe a été mis à jour.</p>
              <Link href={ROUTES.LOGIN} className="inline-block text-primary-600 font-medium hover:text-primary-500">
                Se connecter
              </Link>
            </div>
          ) : (
            <form className="space-y-4" onSubmit={handleSubmit}>
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              {email && (
                <>
                  <Input
                    label="Nouveau mot de passe"
                    type="password"
                    name="new-password"
                    autoComplete="new-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    togglePassword
                  />
                  <Input
                    label="Confirmer le mot de passe"
                    type="password"
                    name="confirm-password"
                    autoComplete="new-password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    placeholder="••••••••"
                    togglePassword
                  />
                  <Button type="submit" className="w-full" disabled={saving}>
                    {saving ? 'Enregistrement…' : 'Enregistrer'}
                  </Button>
                </>
              )}

              <p className="text-center text-sm">
                <Link href={ROUTES.LOGIN} className="text-primary-600 hover:text-primary-500">
                  Retour à la connexion
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default NouveauMotDePassePage;
