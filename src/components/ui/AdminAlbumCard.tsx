import React, { useState } from 'react';
import { Calendar, Clock, Trash2, RefreshCw, Image as ImageIcon, AlertTriangle, Power } from 'lucide-react';
import { Album } from '../../types';

interface AdminAlbumCardProps {
  album: Album;
  onExtend: (albumId: string) => Promise<void>;
  onDelete: (albumId: string) => Promise<void>;
  onDisable?: (albumId: string) => Promise<void>;
}

const AdminAlbumCard: React.FC<AdminAlbumCardProps> = ({ album, onExtend, onDelete, onDisable }) => {
  const [isExtending, setIsExtending] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDisabling, setIsDisabling] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showDisableConfirm, setShowDisableConfirm] = useState(false);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (expireDate: string) => {
    const expire = new Date(expireDate);
    const now = new Date();
    const diffTime = expire.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusColor = () => {
    if (!album.active) return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    const daysRemaining = getDaysRemaining(album.expireAt);
    if (daysRemaining <= 0) return 'text-red-400 bg-red-500/10 border-red-500/20';
    if (daysRemaining <= 7) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    return 'text-green-400 bg-green-500/10 border-green-500/20';
  };

  const getStatusText = () => {
    if (!album.active) return 'Désactivé';
    const daysRemaining = getDaysRemaining(album.expireAt);
    if (daysRemaining <= 0) return 'Expiré';
    if (daysRemaining === 1) return '1 jour restant';
    if (daysRemaining <= 7) return `${daysRemaining} jours restants`;
    return `${daysRemaining} jours restants`;
  };

  const handleExtend = async () => {
    setIsExtending(true);
    try {
      await onExtend(album.id);
    } catch (error) {
      console.error('Erreur lors de la prolongation:', error);
    } finally {
      setIsExtending(false);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(album.id);
      setShowDeleteConfirm(false);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDisable = async () => {
    if (!onDisable) return;
    setIsDisabling(true);
    try {
      await onDisable(album.id);
      setShowDisableConfirm(false);
    } catch (error) {
      console.error('Erreur lors de la désactivation:', error);
    } finally {
      setIsDisabling(false);
    }
  };

  const daysRemaining = getDaysRemaining(album.expireAt);
  const isExpired = daysRemaining <= 0;

  return (
    <>
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors duration-300">
        {/* Header avec titre et statut */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-1">
              {album.title}
            </h3>
            {album.clientName && (
              <p className="text-gray-400 text-sm mb-2">
                Client: {album.clientName}
              </p>
            )}
            <div className="flex items-center space-x-4 text-sm">
              <span className="text-gray-300">
                📂 {album.category || 'Non classé'}
              </span>
              <span className="text-gray-300">
                🔑 {album.id}
              </span>
            </div>
          </div>

          {/* Badge de statut */}
          <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
            {getStatusText()}
          </div>
        </div>

        {/* Informations détaillées */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center text-gray-300">
            <Calendar className="w-4 h-4 mr-2" />
            <span className="text-sm">
              Expire le {formatDate(album.expireAt)}
            </span>
          </div>

          {album.eventDate && (
            <div className="flex items-center text-gray-300">
              <Clock className="w-4 h-4 mr-2" />
              <span className="text-sm">
                Événement: {formatDate(album.eventDate)}
              </span>
            </div>
          )}

          <div className="flex items-center text-gray-300">
            <ImageIcon className="w-4 h-4 mr-2" />
            <span className="text-sm">
              {album.photos.length} photo{album.photos.length > 1 ? 's' : ''}
            </span>
          </div>

          {/* Indicateur téléchargement autorisé */}
          <div className="flex items-center text-gray-300">
            <span className="text-sm">
              📥 Téléchargement: {album.allowDownload ? 'Autorisé' : 'Bloqué'}
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-2">
          {/* Bouton Prolonger */}
          <button
            onClick={handleExtend}
            disabled={isExtending || isDeleting || isDisabling}
            className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white rounded-lg transition-colors duration-300 font-medium text-sm"
          >
            {isExtending ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Prolongation...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                Prolonger
              </>
            )}
          </button>

          {/* Bouton Désactiver/Activer */}
          {onDisable && (
            <button
              onClick={() => setShowDisableConfirm(true)}
              disabled={isExtending || isDeleting || isDisabling}
              className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-400 text-white rounded-lg transition-colors duration-300 font-medium text-sm"
            >
              {isDisabling ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Action...
                </>
              ) : (
                <>
                  <Power className="w-4 h-4 mr-2" />
                  {album.active ? 'Désactiver' : 'Activer'}
                </>
              )}
            </button>
          )}

          {/* Bouton Supprimer */}
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isExtending || isDeleting || isDisabling}
            className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white rounded-lg transition-colors duration-300 font-medium text-sm"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Supprimer
          </button>
        </div>

        {/* Avertissements */}
        {!album.active && (
          <div className="mt-4 flex items-center space-x-2 text-gray-400 text-sm bg-gray-500/10 border border-gray-500/20 rounded-lg p-3">
            <Power className="w-4 h-4 flex-shrink-0" />
            <span>Cet album est désactivé et n'est plus accessible aux clients</span>
          </div>
        )}
        {isExpired && album.active && (
          <div className="mt-4 flex items-center space-x-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Cet album a expiré et n'est plus accessible aux clients</span>
          </div>
        )}
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setShowDeleteConfirm(false)}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-gray-800 rounded-lg shadow-xl border border-gray-700">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-red-500/10 rounded-full flex items-center justify-center">
                    <AlertTriangle className="w-5 h-5 text-red-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    Confirmer la suppression
                  </h3>
                </div>

                <p className="text-gray-300 mb-2">
                  Êtes-vous sûr de vouloir supprimer cet album ?
                </p>
                <p className="text-sm text-gray-400 mb-6">
                  <strong>{album.title}</strong> - Cette action est irréversible et supprimera toutes les photos associées.
                </p>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-300"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDelete}
                    disabled={isDeleting}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-red-500 hover:bg-red-600 disabled:bg-red-400 text-white rounded-lg transition-colors duration-300"
                  >
                    {isDeleting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        Suppression...
                      </>
                    ) : (
                      'Supprimer définitivement'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de confirmation de désactivation */}
      {showDisableConfirm && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            {/* Overlay */}
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setShowDisableConfirm(false)}
            />

            {/* Modal */}
            <div className="relative w-full max-w-md bg-gray-800 rounded-lg shadow-xl border border-gray-700">
              <div className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-yellow-500/10 rounded-full flex items-center justify-center">
                    <Power className="w-5 h-5 text-yellow-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">
                    {album.active ? 'Désactiver' : 'Activer'} l'album
                  </h3>
                </div>

                <p className="text-gray-300 mb-2">
                  {album.active
                    ? 'Êtes-vous sûr de vouloir désactiver cet album ?'
                    : 'Êtes-vous sûr de vouloir réactiver cet album ?'
                  }
                </p>
                <p className="text-sm text-gray-400 mb-6">
                  <strong>{album.title}</strong> - {album.active
                    ? 'L\'album ne sera plus accessible aux clients mais les données seront conservées.'
                    : 'L\'album redeviendra accessible aux clients (si non expiré).'
                  }
                </p>

                <div className="flex space-x-3">
                  <button
                    onClick={() => setShowDisableConfirm(false)}
                    disabled={isDisabling}
                    className="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-300"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDisable}
                    disabled={isDisabling}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-400 text-white rounded-lg transition-colors duration-300"
                  >
                    {isDisabling ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                        {album.active ? 'Désactivation...' : 'Activation...'}
                      </>
                    ) : (
                      album.active ? 'Désactiver' : 'Activer'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AdminAlbumCard; 