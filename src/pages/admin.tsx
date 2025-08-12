import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { Plus, BarChart3, Clock, AlertTriangle, Shield, Loader, ArrowLeft, LogOut } from 'lucide-react';
import { getAllAlbums, extendAlbum, deleteAlbum, disableAlbum, getAdminStats, isUserAdmin } from '../services/adminService';
import { Album, AdminStats } from '../types';
import AdminAlbumCard from '../components/ui/AdminAlbumCard';
import Modal from '../components/ui/Modal';
import { useAuth } from '../hooks/useAuth';

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const { signOut } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalAlbums: 0,
    activeAlbums: 0,
    expiredAlbums: 0,
    expiringSoon: 0,
    albums: []
  });
  const [refreshing, setRefreshing] = useState(false);

  // États modales centralisées
  const [extendTarget, setExtendTarget] = useState<Album | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Album | null>(null);
  const [disableTarget, setDisableTarget] = useState<Album | null>(null);
  const [isWorking, setIsWorking] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      const dashboardStats = await getAdminStats();
      setStats(dashboardStats);
      setAlbums(dashboardStats.albums);
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error);
    }
  }, []);

  const checkAuthAndLoadData = useCallback(async () => {
    setIsLoading(true);

    try {
      // Vérifier les permissions admin
      const isAdmin = await isUserAdmin();

      if (!isAdmin) {
        // Rediriger vers login si pas admin
        router.push('/auth/login');
        return;
      }

      setIsAuthorized(true);
      await loadDashboardData();

    } catch (error) {
      console.error('Erreur lors de la vérification des permissions:', error);
      router.push('/auth/login');
    } finally {
      setIsLoading(false);
    }
  }, [router, loadDashboardData]);

  useEffect(() => {
    checkAuthAndLoadData();
  }, [checkAuthAndLoadData]);

  const handleExtendAlbum = async (albumId: string) => {
    try {
      setIsWorking(true);
      const success = await extendAlbum(albumId);
      if (success) {
        // Recharger les données pour voir la mise à jour
        await loadDashboardData();
        console.log('Album prolongé avec succès');
      } else {
        console.error('Erreur lors de la prolongation');
      }
    } catch (error) {
      console.error('Erreur lors de la prolongation:', error);
    } finally {
      setIsWorking(false);
      setExtendTarget(null);
    }
  };

  const handleDeleteAlbum = async (albumId: string) => {
    try {
      setIsWorking(true);
      const albumToDelete = albums.find(album => album.id === albumId);
      if (!albumToDelete) return;

      const success = await deleteAlbum(albumId, albumToDelete.photos);
      if (success) {
        // Recharger les données pour voir la suppression
        await loadDashboardData();
        console.log('Album supprimé avec succès');
      } else {
        console.error('Erreur lors de la suppression');
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    } finally {
      setIsWorking(false);
      setDeleteTarget(null);
    }
  };

  const handleDisableAlbum = async (albumId: string) => {
    try {
      setIsWorking(true);
      const success = await disableAlbum(albumId);
      if (success) {
        // Recharger les données pour voir la mise à jour
        await loadDashboardData();
        console.log('Album désactivé/activé avec succès');
      } else {
        console.error('Erreur lors de la désactivation/activation');
      }
    } catch (error) {
      console.error('Erreur lors de la désactivation/activation:', error);
    } finally {
      setIsWorking(false);
      setDisableTarget(null);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    setRefreshing(false);
  };

  const handleCreateAlbum = () => {
    // Rediriger vers la page de création (à implémenter plus tard)
    router.push('/admin/ajouter');
  };

  const handleOpenEdit = (albumId: string) => {
    router.push(`/admin/editer/${albumId}`);
  };

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/'); // Rediriger vers l'accueil après déconnexion
    } catch (error) {
      console.error('Erreur lors de la déconnexion:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-cream-main transition-colors duration-300 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-charcoal text-lg">Vérification des permissions...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-cream-main transition-colors duration-300 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-taupe mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-charcoal mb-2">Accès non autorisé</h1>
          <p className="text-taupe">Vous n'avez pas les permissions pour accéder à cette page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-main transition-colors duration-300 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Bouton retour à l'accueil */}
        <div className="mb-6">
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 transition-colors duration-300 group"
          >
            <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform duration-300" />
            Retour à l'accueil
          </button>
        </div>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
          <div className="mb-6 lg:mb-0">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900  mb-2">
              Dashboard Admin
            </h1>
            <p className="text-gray-700 ">
              Gestion des albums clients - Julie Grohens Photographe d'émotions
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg transition-colors duration-300"
            >
              {refreshing ? (
                <Loader className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <BarChart3 className="w-4 h-4 mr-2" />
              )}
              Actualiser
            </button>

            <button
              onClick={handleCreateAlbum}
              className="inline-flex items-center px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg transition-colors duration-300 font-medium"
            >
              <Plus className="w-5 h-5 mr-2" />
              Créer un album
            </button>

            <button
              onClick={handleLogout}
              className="inline-flex items-center px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors duration-300"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Déconnexion
            </button>
          </div>
        </div>

        {/* Statistiques */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-cream-light rounded-xl p-6 border border-gray-200  transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600  text-sm">Total albums</p>
                <p className="text-2xl font-bold text-gray-900 ">{stats.totalAlbums}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-gray-600 " />
              </div>
            </div>
          </div>

          <div className="bg-cream-light rounded-xl p-6 border border-gray-200  transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600  text-sm">Albums actifs</p>
                <p className="text-2xl font-bold text-gray-900 ">{stats.activeAlbums}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <span className="text-gray-600  text-xl">✓</span>
              </div>
            </div>
          </div>

          <div className="bg-cream-light rounded-xl p-6 border border-gray-200  transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600  text-sm">Expirent bientôt</p>
                <p className="text-2xl font-bold text-gray-900 ">{stats.expiringSoon}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-gray-600 " />
              </div>
            </div>
          </div>

          <div className="bg-cream-light rounded-xl p-6 border border-gray-200  transition-colors duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600  text-sm">Albums expirés</p>
                <p className="text-2xl font-bold text-gray-900 ">{stats.expiredAlbums}</p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-gray-600 " />
              </div>
            </div>
          </div>
        </div>

        {/* Liste des albums */}
        <div className="bg-cream-light rounded-xl p-6 border border-gray-200  transition-colors duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 ">
              Albums ({albums.length})
            </h2>

            {stats.expiringSoon > 0 && (
              <div className="flex items-center space-x-2 text-yellow-600 text-sm bg-yellow-500/10 border border-yellow-500/20 rounded-lg px-3 py-2">
                <Clock className="w-4 h-4" />
                <span>{stats.expiringSoon} album{stats.expiringSoon > 1 ? 's' : ''} expire{stats.expiringSoon > 1 ? 'nt' : ''} bientôt</span>
              </div>
            )}
          </div>

          {albums.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <BarChart3 className="w-8 h-8 text-gray-600 " />
              </div>
              <h3 className="text-xl font-semibold text-gray-900  mb-2">Aucun album</h3>
              <p className="text-gray-700  mb-6">
                Commencez par créer votre premier album client.
              </p>
              <button
                onClick={handleCreateAlbum}
                className="inline-flex items-center px-6 py-3 bg-primary-500 hover:bg-blue-600 text-white rounded-lg transition-colors duration-300 font-medium"
              >
                <Plus className="w-5 h-5 mr-2" />
                Créer un album
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {albums.map((album) => (
                <AdminAlbumCard
                  key={album.id}
                  album={album}
                  onOpenExtend={(a) => setExtendTarget(a)}
                  onOpenDelete={(a) => setDeleteTarget(a)}
                  onOpenDisable={(a) => setDisableTarget(a)}
                  onOpenEdit={(a) => handleOpenEdit(a.id)}
                />
              ))}
            </div>
          )}
        </div>


      </div>

      {/* Modal Prolonger */}
      <Modal
        isOpen={!!extendTarget}
        onClose={() => (!isWorking ? setExtendTarget(null) : undefined)}
        title="Prolonger l'album"
      >
        {extendTarget && (
          <div>
            <p className="text-gray-700 mb-4">
              Voulez-vous prolonger l'album <strong>{extendTarget.title}</strong> de 30 jours et le réactiver si besoin ?
            </p>
            <div className="flex gap-3">
              <button
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                onClick={() => setExtendTarget(null)}
                disabled={isWorking}
              >
                Annuler
              </button>
              <button
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                onClick={() => handleExtendAlbum(extendTarget.id)}
                disabled={isWorking}
              >
                {isWorking ? 'Traitement...' : 'Confirmer'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Supprimer */}
      <Modal
        isOpen={!!deleteTarget}
        onClose={() => (!isWorking ? setDeleteTarget(null) : undefined)}
        title="Supprimer l'album"
      >
        {deleteTarget && (
          <div>
            <p className="text-gray-700 mb-4">
              Êtes-vous sûr de vouloir supprimer l'album <strong>{deleteTarget.title}</strong> ? Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                onClick={() => setDeleteTarget(null)}
                disabled={isWorking}
              >
                Annuler
              </button>
              <button
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
                onClick={() => handleDeleteAlbum(deleteTarget.id)}
                disabled={isWorking}
              >
                {isWorking ? 'Suppression...' : 'Supprimer définitivement'}
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Désactiver/Activer */}
      <Modal
        isOpen={!!disableTarget}
        onClose={() => (!isWorking ? setDisableTarget(null) : undefined)}
        title={disableTarget?.active ? "Désactiver l'album" : "Activer l'album"}
      >
        {disableTarget && (
          <div>
            <p className="text-gray-700 mb-4">
              {disableTarget.active
                ? "Êtes-vous sûr de vouloir désactiver cet album ? Il ne sera plus accessible aux clients."
                : "Êtes-vous sûr de vouloir réactiver cet album ?"}
            </p>
            <div className="flex gap-3">
              <button
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg"
                onClick={() => setDisableTarget(null)}
                disabled={isWorking}
              >
                Annuler
              </button>
              <button
                className="flex-1 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg"
                onClick={() => handleDisableAlbum(disableTarget.id)}
                disabled={isWorking}
              >
                {isWorking ? 'Traitement...' : disableTarget.active ? 'Désactiver' : 'Activer'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminDashboard; 