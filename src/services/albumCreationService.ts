import { doc, setDoc, getDoc, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase/firebaseConfig";
import { Album, AlbumFormData } from "../types";

// Extension pour le processus de création avec fichiers
export interface AlbumCreationData extends AlbumFormData {
  code?: string;
}

/**
 * Génère un code d'accès unique pour un album
 * @returns Code d'accès unique de 8 caractères
 */
export const generateAlbumCode = (): string => {
  return crypto.randomUUID().slice(0, 8);
};

/**
 * Vérifie si un code d'accès existe déjà
 * @param code - Code à vérifier
 * @returns true si le code existe, false sinon
 */
export const codeExists = async (code: string): Promise<boolean> => {
  try {
    if (!db) return false;

    const albumRef = doc(db, "albums", code);
    const albumDoc = await getDoc(albumRef);
    return albumDoc.exists();
  } catch (error) {
    console.error('Erreur lors de la vérification du code:', error);
    return false;
  }
};

/**
 * Génère un code d'accès unique (qui n'existe pas déjà)
 * @returns Code d'accès unique
 */
export const generateUniqueCode = async (): Promise<string> => {
  let code = generateAlbumCode();
  let attempts = 0;

  while (await codeExists(code) && attempts < 10) {
    code = generateAlbumCode();
    attempts++;
  }

  if (attempts >= 10) {
    throw new Error('Impossible de générer un code unique après 10 tentatives');
  }

  return code;
};

/**
 * Upload une image vers Firebase Storage
 * @param file - Fichier image à uploader
 * @param albumCode - Code de l'album
 * @param index - Index de l'image
 * @returns URL de l'image uploadée
 */
export const uploadImage = async (
  file: File,
  albumCode: string,
  index: number
): Promise<string> => {
  try {
    console.log('🔥 Début upload image:', { fileName: file.name, albumCode, storage: !!storage });

    if (!storage) {
      console.error('❌ Firebase Storage non configuré');
      throw new Error('Firebase Storage non configuré. Vérifiez vos variables d\'environnement.');
    }

    // Vérifier la config Storage
    console.log('📦 Storage config:', {
      app: storage.app.name,
      bucket: storage.app.options.storageBucket
    });

    // Générer un nom de fichier unique
    const fileExtension = file.name.split('.').pop() || 'jpg';
    const fileName = `${index + 1}-${Date.now()}.${fileExtension}`;
    const imagePath = `albums/${albumCode}/${fileName}`;

    console.log('📁 Chemin d\'upload:', imagePath);

    const imageRef = ref(storage, imagePath);

    // Upload le fichier
    console.log('⬆️ Début upload vers Firebase Storage...');
    const snapshot = await uploadBytes(imageRef, file);
    console.log('✅ Upload terminé:', snapshot.metadata);

    // Récupérer l'URL de téléchargement
    console.log('🔗 Récupération de l\'URL de téléchargement...');
    const downloadURL = await getDownloadURL(snapshot.ref);

    console.log(`✅ Image uploadée avec succès: ${fileName} -> ${downloadURL}`);
    return downloadURL;

  } catch (error) {
    console.error('❌ Erreur lors de l\'upload de l\'image:', error);
    console.error('📊 Détails de l\'erreur:', {
      message: error instanceof Error ? error.message : 'Erreur inconnue',
      code: (error as any)?.code,
      serverResponse: (error as any)?.serverResponse
    });
    throw error;
  }
};

/**
 * Upload plusieurs images vers Firebase Storage
 * @param files - Liste des fichiers à uploader
 * @param albumCode - Code de l'album
 * @param onProgress - Callback pour suivre le progrès
 * @returns Liste des URLs des images uploadées
 */
export const uploadImages = async (
  files: File[],
  albumCode: string,
  onProgress?: (current: number, total: number) => void
): Promise<string[]> => {
  const imageUrls: string[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (onProgress) {
      onProgress(i + 1, files.length);
    }

    try {
      const imageUrl = await uploadImage(file, albumCode, i);
      imageUrls.push(imageUrl);
    } catch (error) {
      console.error(`Erreur lors de l'upload de l'image ${i + 1}:`, error);
      throw new Error(`Erreur lors de l'upload de l'image ${file.name}`);
    }
  }

  return imageUrls;
};

/**
 * Crée un nouvel album avec upload des images
 * @param formData - Données du formulaire
 * @param imageFiles - Fichiers images à uploader
 * @param onProgress - Callback pour suivre le progrès
 * @returns Code d'accès de l'album créé
 */
export const createAlbum = async (
  formData: AlbumFormData,
  imageFiles: File[],
  onProgress?: (stage: string, current?: number, total?: number) => void
): Promise<string> => {
  try {
    console.log('🚀 Début création album:', { formData, imageCount: imageFiles.length });

    if (!db || !storage) {
      console.error('❌ Firebase non configuré:', { db: !!db, storage: !!storage });
      throw new Error('Firebase non configuré. Vérifiez vos variables d\'environnement.');
    }

    if (imageFiles.length === 0) {
      throw new Error('Au moins une image est requise');
    }

    // Pas besoin d'authentification avec les règles temporaires ouvertes
    console.log('🔓 Upload sans authentification (règles temporaires ouvertes)');

    // Étape 1: Générer un code unique
    if (onProgress) onProgress('Génération du code d\'accès...');
    console.log('🔑 Génération du code d\'accès...');
    const albumCode = await generateUniqueCode();
    console.log('✅ Code généré:', albumCode);

    // Étape 2: Upload des images
    if (onProgress) onProgress('Upload des images...', 0, imageFiles.length);
    const imageUrls = await uploadImages(imageFiles, albumCode, (current, total) => {
      if (onProgress) onProgress(`Upload des images (${current}/${total})...`, current, total);
    });

    // Étape 3: Créer le document dans Firestore
    if (onProgress) onProgress('Création de l\'album...');
    console.log('📄 Création du document Firestore...');

    const albumData: Album = {
      id: albumCode,
      title: formData.title,
      category: formData.category,
      expireAt: formData.expireAt,
      photos: imageUrls, // Utiliser 'photos' au lieu d'images'
      active: true,
      allowDownload: formData.allowDownload ?? true,
      clientName: formData.clientName || '',
      eventDate: formData.eventDate || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    console.log('💾 Données à sauvegarder:', albumData);

    const albumRef = doc(db, "albums", albumCode);
    await setDoc(albumRef, albumData);

    console.log(`✅ Album créé avec succès dans Firestore: ${albumCode}`);
    console.log('🔗 Collection "albums" créée automatiquement (si première fois)');
    return albumCode;

  } catch (error) {
    console.error('Erreur lors de la création de l\'album:', error);
    throw error;
  }
};

/**
 * Valide les fichiers images avant upload
 * @param files - Fichiers à valider
 * @returns Erreurs de validation ou null si tout est OK
 */
export const validateImageFiles = (files: File[]): string[] => {
  const errors: string[] = [];
  const maxFileSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  if (files.length === 0) {
    errors.push('Au moins une image est requise');
  }

  if (files.length > 50) {
    errors.push('Maximum 50 images par album');
  }

  files.forEach((file, index) => {
    if (!allowedTypes.includes(file.type)) {
      errors.push(`Image ${index + 1}: Format non supporté (${file.type})`);
    }

    if (file.size > maxFileSize) {
      errors.push(`Image ${index + 1}: Taille trop importante (max 10MB)`);
    }
  });

  return errors;
}; 