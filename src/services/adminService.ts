import { collection, getDocs, doc, updateDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { ref, deleteObject, listAll } from "firebase/storage";
import { db, storage, auth } from "../firebase/firebaseConfig";
import { Album, AdminStats } from "../types";

/**
 * Récupère tous les albums pour l'admin
 * @returns Liste de tous les albums
 */
export const getAllAlbums = async (): Promise<Album[]> => {
  try {
    // Vérifier si Firebase est configuré
    if (!db) {
      console.warn('Firebase/Firestore non configuré');
      return [];
    }

    const albumsRef = collection(db, "albums");
    const snapshot = await getDocs(albumsRef);

    const albums: Album[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      albums.push({
        id: doc.id,
        title: data.title,
        category: data.category,
        expireAt: data.expireAt,
        photos: data.photos || [],
        active: data.active ?? true,
        allowDownload: data.allowDownload ?? true,
        clientName: data.clientName,
        eventDate: data.eventDate,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      } as Album);
    });

    // Trier par date d'expiration (les plus récents d'abord)
    albums.sort((a, b) => new Date(b.expireAt).getTime() - new Date(a.expireAt).getTime());

    console.log(`${albums.length} albums récupérés`);
    return albums;

  } catch (error) {
    console.error('Erreur lors de la récupération des albums:', error);
    return [];
  }
};

/**
 * Prolonge un album de 30 jours
 * @param albumId - ID de l'album à prolonger
 * @returns true si succès, false sinon
 */
export const extendAlbum = async (albumId: string): Promise<boolean> => {
  try {
    // Vérifier si Firebase est configuré
    if (!db) {
      console.warn('Firebase/Firestore non configuré');
      return false;
    }

    const albumRef = doc(db, "albums", albumId);

    // Calculer la nouvelle date d'expiration (+30 jours)
    const currentExpire = new Date();
    const newExpireDate = new Date(currentExpire.getTime() + (30 * 24 * 60 * 60 * 1000));

    await updateDoc(albumRef, {
      expireAt: newExpireDate.toISOString(),
      active: true, // Réactiver l'album au cas où il était désactivé
      updatedAt: new Date().toISOString()
    });

    console.log(`Album ${albumId} prolongé jusqu'au ${newExpireDate.toLocaleDateString()}`);
    return true;

  } catch (error) {
    console.error('Erreur lors de la prolongation de l\'album:', error);
    return false;
  }
};

/**
 * Désactive un album (sans le supprimer)
 * @param albumId - ID de l'album à désactiver
 * @returns true si succès, false sinon
 */
export const disableAlbum = async (albumId: string): Promise<boolean> => {
  try {
    // Vérifier si Firebase est configuré
    if (!db) {
      console.warn('Firebase/Firestore non configuré');
      return false;
    }

    const albumRef = doc(db, "albums", albumId);

    await updateDoc(albumRef, {
      active: false,
      updatedAt: new Date().toISOString()
    });

    console.log(`Album ${albumId} désactivé`);
    return true;

  } catch (error) {
    console.error('Erreur lors de la désactivation de l\'album:', error);
    return false;
  }
};

/**
 * Supprime un album et toutes ses photos
 * @param albumId - ID de l'album à supprimer
 * @param photos - Liste des URLs des photos à supprimer
 * @returns true si succès, false sinon
 */
export const deleteAlbum = async (albumId: string, photos: string[] = []): Promise<boolean> => {
  try {
    // Vérifier si Firebase est configuré
    if (!db || !storage) {
      console.warn('Firebase non configuré');
      return false;
    }

    // Supprimer les photos du Storage
    if (photos.length > 0) {
      console.log(`Suppression de ${photos.length} photos...`);

      for (const imageUrl of photos) {
        try {
          // Extraire le chemin depuis l'URL Firebase Storage
          if (imageUrl.includes('firebasestorage.googleapis.com')) {
            const imagePath = extractStoragePath(imageUrl);
            if (imagePath) {
              const imageRef = ref(storage, imagePath);
              await deleteObject(imageRef);
              console.log(`Image supprimée: ${imagePath}`);
            }
          }
        } catch (imageError) {
          console.warn(`Erreur lors de la suppression de l'image ${imageUrl}:`, imageError);
          // Continuer même si une image ne peut pas être supprimée
        }
      }
    }

    // Supprimer le document de l'album
    const albumRef = doc(db, "albums", albumId);
    await deleteDoc(albumRef);

    console.log(`Album ${albumId} supprimé avec succès`);
    return true;

  } catch (error) {
    console.error('Erreur lors de la suppression de l\'album:', error);
    return false;
  }
};

/**
 * Extrait le chemin de stockage depuis une URL Firebase Storage
 * @param url - URL Firebase Storage
 * @returns Chemin de stockage ou null
 */
const extractStoragePath = (url: string): string | null => {
  try {
    // Format: https://firebasestorage.googleapis.com/v0/b/bucket/o/path%2Fto%2Ffile.jpg?alt=media&token=...
    const urlParts = url.split('/o/');
    if (urlParts.length > 1) {
      const pathPart = urlParts[1].split('?')[0];
      return decodeURIComponent(pathPart);
    }
    return null;
  } catch (error) {
    console.error('Erreur lors de l\'extraction du chemin:', error);
    return null;
  }
};

/**
 * Liste des emails autorisés à avoir un accès administrateur
 * À configurer avec les vrais emails des administrateurs
 */
const ADMIN_EMAILS = [
  'jgrohens.photographie@gmail.com', // Email principal de Julie
  // Ajouter d'autres emails admin si nécessaire
];

/**
 * Vérifie si l'utilisateur connecté est admin
 * Sécurisé : seuls les emails dans ADMIN_EMAILS ont accès
 * @returns true si admin autorisé, false sinon
 */
export const isUserAdmin = async (): Promise<boolean> => {
  try {
    if (!auth) {
      console.error('Firebase Auth non configuré');
      return false;
    }

    const currentUser = auth.currentUser;

    if (!currentUser || !currentUser.email) {
      console.log('Aucun utilisateur connecté ou email manquant');
      return false;
    }

    // Vérifier si l'email de l'utilisateur est dans la liste des admins autorisés
    const isAdmin = ADMIN_EMAILS.includes(currentUser.email.toLowerCase());

    if (isAdmin) {
      console.log(`Accès admin accordé pour: ${currentUser.email}`);
    } else {
      console.log(`Accès admin refusé pour: ${currentUser.email} - Email non autorisé`);
    }

    return isAdmin;

  } catch (error) {
    console.error('Erreur lors de la vérification admin:', error);
    return false;
  }
};

/**
 * Statistiques pour le dashboard admin
 * @returns Objet avec les statistiques
 */
export const getAdminStats = async (): Promise<AdminStats> => {
  try {
    const albums = await getAllAlbums();
    const now = new Date();

    const activeAlbums = albums.filter(album =>
      album.active && new Date(album.expireAt) > now
    );
    const expiredAlbums = albums.filter(album =>
      new Date(album.expireAt) <= now
    );
    const expiringSoon = albums.filter(album => {
      const expireDate = new Date(album.expireAt);
      const diffDays = Math.ceil((expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      return album.active && diffDays <= 7 && diffDays > 0;
    });

    return {
      totalAlbums: albums.length,
      activeAlbums: activeAlbums.length,
      expiredAlbums: expiredAlbums.length,
      expiringSoon: expiringSoon.length,
      albums
    };

  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
    return {
      totalAlbums: 0,
      activeAlbums: 0,
      expiredAlbums: 0,
      expiringSoon: 0,
      albums: []
    };
  }
}; 