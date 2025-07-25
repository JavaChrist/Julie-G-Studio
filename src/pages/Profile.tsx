import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Layout from '../components/layout/Layout';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import AvatarUpload from '../components/ui/AvatarUpload';
import { User, Mail, Calendar, Edit, Save, X } from 'lucide-react';

const Profile: React.FC = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(user?.displayName || '');

  const handleSave = () => {
    // Ici vous pourriez implémenter la mise à jour du profil
    // updateProfile(user, { displayName });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setDisplayName(user?.displayName || '');
    setIsEditing(false);
  };

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-20">
          <p className="text-gray-600 dark:text-gray-300">Vous devez être connecté pour voir cette page.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="flex items-center space-x-6">
            {/* Avatar avec upload */}
            <AvatarUpload size="lg" />

            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {user.displayName || 'Utilisateur'}
              </h1>
              <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
              <div className="flex items-center mt-2 text-sm text-gray-500 dark:text-gray-400">
                <Calendar className="w-4 h-4 mr-1" />
                Membre depuis {new Date(user.metadata.creationTime || '').toLocaleDateString('fr-FR')}
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
            >
              <Edit className="w-4 h-4 mr-2" />
              {isEditing ? 'Annuler' : 'Modifier'}
            </Button>
          </div>
        </div>

        {/* Profile Information */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-600">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Informations personnelles</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom complet
                </label>
                {isEditing ? (
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Votre nom"
                  />
                ) : (
                  <p className="text-gray-900 dark:text-gray-100">{user.displayName || 'Non renseigné'}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Adresse email
                </label>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 text-gray-400 mr-2" />
                  <p className="text-gray-900 dark:text-gray-100">{user.email}</p>
                  {user.emailVerified && (
                    <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 text-xs rounded-full">
                      Vérifié
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  ID utilisateur
                </label>
                <p className="text-gray-600 dark:text-gray-400 text-sm font-mono">{user.uid}</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Dernière connexion
                </label>
                <p className="text-gray-900 dark:text-gray-100">
                  {new Date(user.metadata.lastSignInTime || '').toLocaleDateString('fr-FR', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </p>
              </div>
            </div>

            {isEditing && (
              <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-600">
                <Button onClick={handleSave}>
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Annuler
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Account Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-600">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Paramètres du compte</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between py-3">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Notifications email</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Recevoir des notifications par email</p>
              </div>
              <Button variant="outline" size="sm">
                Gérer
              </Button>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-gray-200 dark:border-gray-600">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Sécurité</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Changer votre mot de passe</p>
              </div>
              <Button variant="outline" size="sm">
                Modifier
              </Button>
            </div>

            <div className="flex items-center justify-between py-3 border-t border-gray-200 dark:border-gray-600">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Données personnelles</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">Télécharger ou supprimer vos données</p>
              </div>
              <Button variant="outline" size="sm">
                Gérer
              </Button>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-red-200 dark:border-red-800">
          <div className="p-6 border-b border-gray-200 dark:border-gray-600">
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">Zone dangereuse</h2>
          </div>
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">Supprimer le compte</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Supprimer définitivement votre compte et toutes vos données
                </p>
              </div>
              <Button variant="destructive" size="sm">
                Supprimer
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile; 