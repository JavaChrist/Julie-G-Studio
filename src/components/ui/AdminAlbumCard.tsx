import React from 'react';
import { Calendar, Clock, Trash2, RefreshCw, Image as ImageIcon, AlertTriangle, Power, Edit, Key } from 'lucide-react';
import { Album } from '../../types';

interface AdminAlbumCardProps {
  album: Album;
  onOpenExtend: (album: Album) => void;
  onOpenDelete: (album: Album) => void;
  onOpenDisable?: (album: Album) => void;
  onOpenEdit?: (album: Album) => void;
  onShowCode?: (album: Album) => void;
}

const AdminAlbumCard: React.FC<AdminAlbumCardProps> = ({ album, onOpenExtend, onOpenDelete, onOpenDisable, onOpenEdit, onShowCode }) => {

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

  const handleExtend = () => {
    onOpenExtend(album);
  };

  const daysRemaining = getDaysRemaining(album.expireAt);
  const isExpired = daysRemaining <= 0;

  return (
    <>
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 hover:border-gray-600 transition-colors duration-300 flex flex-col h-full">
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
              {onShowCode ? (
                <button
                  type="button"
                  onClick={() => onShowCode(album)}
                  className="inline-flex items-center text-gray-300 hover:text-white underline decoration-dotted underline-offset-2 transition-colors"
                  title="Voir le code d'accès et les instructions client"
                >
                  🔑 {album.id}
                </button>
              ) : (
                <span className="text-gray-300">
                  🔑 {album.id}
                </span>
              )}
            </div>
          </div>

          {/* Badge de statut + Modifier */}
          <div className="flex items-center gap-2">
            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor()}`}>
              {getStatusText()}
            </div>
            {onOpenEdit && (
              <button
                onClick={() => onOpenEdit(album)}
                className="inline-flex items-center px-2.5 py-1.5 bg-gray-700 hover:bg-gray-600 text-white rounded-md transition-colors duration-300 text-xs font-medium"
                title="Modifier l'album"
              >
                <Edit className="w-3.5 h-3.5 mr-1" />
                Modifier
              </button>
            )}
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

        {/* Bloc actions + avertissements collé au bas de la carte */}
        <div className="mt-auto flex flex-col gap-2">
          {/* Bouton Code d'accès (large, en haut) */}
          {onShowCode && (
            <button
              onClick={() => onShowCode(album)}
              className="w-full inline-flex items-center justify-center px-3 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-300 font-medium text-sm"
            >
              <Key className="w-4 h-4 mr-2" />
              Code d'accès & instructions
            </button>
          )}

          <div className="flex flex-col sm:flex-row gap-2">
            {/* Bouton Prolonger */}
            <button
              onClick={handleExtend}
              className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-300 font-medium text-sm"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Prolonger
            </button>

            {/* Bouton Désactiver/Activer */}
            {onOpenDisable && (
              <button
                onClick={() => onOpenDisable(album)}
                className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg transition-colors duration-300 font-medium text-sm"
              >
                <Power className="w-4 h-4 mr-2" />
                {album.active ? 'Désactiver' : 'Activer'}
              </button>
            )}

            {/* Bouton Supprimer */}
            <button
              onClick={() => onOpenDelete(album)}
              className="flex-1 inline-flex items-center justify-center px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-300 font-medium text-sm"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </button>
          </div>

          {/* Avertissements (rendus dans le même bloc bas pour rester alignés) */}
          {!album.active && (
            <div className="mt-2 flex items-center space-x-2 text-gray-400 text-sm bg-gray-500/10 border border-gray-500/20 rounded-lg p-3">
              <Power className="w-4 h-4 flex-shrink-0" />
              <span>Cet album est désactivé et n'est plus accessible aux clients</span>
            </div>
          )}
          {isExpired && album.active && (
            <div className="mt-2 flex items-center space-x-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg p-3">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>Cet album a expiré et n'est plus accessible aux clients</span>
            </div>
          )}
        </div>
      </div>

      {/* Modales gérées par le parent */}
    </>
  );
};

export default AdminAlbumCard; 