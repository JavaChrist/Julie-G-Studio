import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebaseConfig";
import { Album } from "../types";

// Réexporter le type Album pour les autres modules
export type { Album };

/**
 * Récupère un album par son code d'accès
 * @param code - Code d'accès unique de l'album
 * @returns Album ou null si non trouvé
 */
export const getAlbumByCode = async (code: string): Promise<Album | null> => {
  try {
    // Vérifier si Firebase est configuré
    if (!db) {
      console.warn('Firebase/Firestore non configuré');
      return null;
    }

    const ref = doc(db, "albums", code);
    const snapshot = await getDoc(ref);

    if (!snapshot.exists()) {
      console.log(`Album avec le code "${code}" non trouvé`);
      return null;
    }

    const data = snapshot.data();
    return {
      id: snapshot.id,
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
    } as Album;

  } catch (error) {
    console.error('Erreur lors de la récupération de l\'album:', error);
    return null;
  }
};

/**
 * Vérifie si un album est valide (existe et n'est pas expiré)
 * @param code - Code d'accès unique de l'album
 * @returns true si l'album est valide, false sinon
 */
export const isAlbumValid = async (code: string): Promise<boolean> => {
  try {
    // Vérifier si Firebase est configuré
    if (!db) {
      console.warn('Firebase/Firestore non configuré');
      return false;
    }

    const album = await getAlbumByCode(code);

    if (!album) {
      console.log(`Album "${code}" n'existe pas`);
      return false;
    }

    if (!album.active) {
      console.log(`Album "${code}" est désactivé`);
      return false;
    }

    const now = new Date();
    const expireDate = new Date(album.expireAt);

    if (expireDate <= now) {
      console.log(`Album "${code}" a expiré le ${album.expireAt}`);
      return false;
    }

    console.log(`Album "${code}" est valide jusqu'au ${album.expireAt}`);
    return true;

  } catch (error) {
    console.error('Erreur lors de la validation de l\'album:', error);
    return false;
  }
};

/**
 * Vérifie le statut d'un album (pour débuggage)
 * @param code - Code d'accès unique de l'album
 * @returns Objet avec le statut détaillé
 */
export const getAlbumStatus = async (code: string) => {
  try {
    const album = await getAlbumByCode(code);

    if (!album) {
      return {
        exists: false,
        valid: false,
        error: 'Album non trouvé'
      };
    }

    const now = new Date();
    const expireDate = new Date(album.expireAt);
    const isExpired = expireDate <= now;
    const daysRemaining = Math.ceil((expireDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    return {
      exists: true,
      valid: !isExpired,
      album,
      expireDate,
      isExpired,
      daysRemaining: isExpired ? 0 : daysRemaining
    };

  } catch (error) {
    return {
      exists: false,
      valid: false,
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    };
  }
}; 