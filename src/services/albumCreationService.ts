import { doc, setDoc, getDoc } from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  type UploadTask,
} from "firebase/storage";
import { db, storage } from "../firebase/firebaseConfig";
import { Album, AlbumFormData } from "../types";

// ─────────────────────────────────────────────────────────────────────────────
// Types publics
// ─────────────────────────────────────────────────────────────────────────────

export interface AlbumCreationData extends AlbumFormData {
  code?: string;
}

export interface PhotoFailure {
  index: number;
  fileName: string;
  reason: string;
}

export interface FileValidationResult {
  valid: File[];
  invalid: { file: File; reason: string }[];
}

export type ProgressCallback = (
  stage: string,
  current?: number,
  total?: number,
  percent?: number
) => void;

// ─────────────────────────────────────────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────────────────────────────────────────

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB
const MAX_FILES_PER_ALBUM = 200;

// Si un upload n'a pas progressé (aucun nouvel octet transféré) pendant ce
// délai, on considère que le fichier est inaccessible (placeholder cloud,
// proxy Lightroom, OneDrive non synchronisé, etc.) et on annule.
const UPLOAD_STALL_TIMEOUT_MS = 45_000;

// Sécurité absolue: aucune photo ne devrait prendre plus de 5 minutes à uploader.
const UPLOAD_TOTAL_TIMEOUT_MS = 5 * 60_000;

// Délai pour la sonde de lecture initiale (test rapide de lisibilité).
const PROBE_READ_TIMEOUT_MS = 8_000;

// ─────────────────────────────────────────────────────────────────────────────
// Validation et partitionnement des fichiers
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Valide un seul fichier image. Renvoie une raison d'erreur ou null si OK.
 */
const validateSingleFile = (file: File): string | null => {
  if (file.size === 0) {
    return 'fichier vide ou indisponible (probablement un proxy Lightroom / fichier cloud non téléchargé)';
  }
  if (file.size > MAX_FILE_SIZE) {
    return `taille trop importante (${(file.size / (1024 * 1024)).toFixed(1)} MB, max 50 MB)`;
  }
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    const friendly = file.type || 'inconnu';
    return `format non supporté (${friendly}). Formats acceptés: JPG, PNG, WebP`;
  }
  return null;
};

/**
 * Partitionne une liste de fichiers en valides et invalides.
 * Préfère cette fonction à validateImageFiles pour ne pas rejeter en bloc.
 */
export const partitionImageFiles = (files: File[]): FileValidationResult => {
  const valid: File[] = [];
  const invalid: { file: File; reason: string }[] = [];

  for (const file of files) {
    const reason = validateSingleFile(file);
    if (reason) {
      invalid.push({ file, reason });
    } else {
      valid.push(file);
    }
  }

  return { valid, invalid };
};

/**
 * Conservée pour rétro-compatibilité. Préférer partitionImageFiles.
 */
export const validateImageFiles = (files: File[]): string[] => {
  const errors: string[] = [];

  if (files.length === 0) {
    errors.push('Au moins une image est requise');
  }

  if (files.length > MAX_FILES_PER_ALBUM) {
    errors.push(`Maximum ${MAX_FILES_PER_ALBUM} images par album`);
  }

  files.forEach((file, index) => {
    const reason = validateSingleFile(file);
    if (reason) {
      errors.push(`Image ${index + 1} (${file.name}): ${reason}`);
    }
  });

  return errors;
};

// ─────────────────────────────────────────────────────────────────────────────
// Sonde de lisibilité (détection rapide des placeholders / proxies)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Tente de lire un petit chunk du fichier pour vérifier qu'il est réellement
 * accessible. Si la lecture prend trop de temps ou échoue, on considère que
 * c'est un placeholder cloud (OneDrive online-only, Lightroom Smart Preview,
 * Google Drive virtuel, etc.).
 */
type ProbeReadResult =
  | { ok: true; bytes: number }
  | { ok: false; reason: string };

type ProbeFileResult =
  | { ok: true }
  | { ok: false; reason: string };

const probeFileReadable = async (file: File): Promise<ProbeFileResult> => {
  if (file.size === 0) {
    return { ok: false, reason: 'fichier vide (probablement un placeholder cloud)' };
  }

  const chunkSize = Math.min(64 * 1024, file.size); // 64 KB max
  const chunk = file.slice(0, chunkSize);

  const readPromise: Promise<ProbeReadResult> = chunk.arrayBuffer().then(
    (buf): ProbeReadResult => ({ ok: true, bytes: buf.byteLength }),
    (err): ProbeReadResult => ({
      ok: false,
      reason: `lecture impossible: ${err instanceof Error ? err.message : 'erreur inconnue'}`,
    })
  );

  const timeoutPromise: Promise<ProbeReadResult> = new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ok: false,
        reason: 'lecture trop lente (le fichier est probablement stocké dans le cloud, pas localement)',
      });
    }, PROBE_READ_TIMEOUT_MS);
  });

  const result: ProbeReadResult = await Promise.race([readPromise, timeoutPromise]);
  if (result.ok === false) {
    return { ok: false, reason: result.reason };
  }
  if (result.bytes === 0) {
    return { ok: false, reason: 'aucune donnée lue (placeholder cloud probable)' };
  }
  return { ok: true };
};

// ─────────────────────────────────────────────────────────────────────────────
// Génération de codes d'album
// ─────────────────────────────────────────────────────────────────────────────

export const generateAlbumCode = (): string => {
  return crypto.randomUUID().slice(0, 8);
};

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

// ─────────────────────────────────────────────────────────────────────────────
// Upload résiliant d'une seule image
// ─────────────────────────────────────────────────────────────────────────────

export interface ResumableUploadOptions {
  onByteProgress?: (transferred: number, total: number, percent: number) => void;
  stallTimeoutMs?: number;
  totalTimeoutMs?: number;
}

/**
 * Upload une image vers Firebase Storage en utilisant uploadBytesResumable.
 * - Annule automatiquement si l'upload stagne (aucun progrès pendant N ms).
 * - Annule automatiquement si l'upload total dépasse une durée maximale.
 * - Détecte les fichiers placeholder/inaccessibles AVANT de tenter l'upload.
 */
export const uploadImage = async (
  file: File,
  albumCode: string,
  index: number,
  options: ResumableUploadOptions = {}
): Promise<string> => {
  if (!storage) {
    throw new Error('Firebase Storage non configuré. Vérifiez vos variables d\'environnement.');
  }

  const stallTimeoutMs = options.stallTimeoutMs ?? UPLOAD_STALL_TIMEOUT_MS;
  const totalTimeoutMs = options.totalTimeoutMs ?? UPLOAD_TOTAL_TIMEOUT_MS;

  // Étape 1: sonde de lecture
  const probe = await probeFileReadable(file);
  if (probe.ok === false) {
    throw new Error(probe.reason);
  }

  // Étape 2: préparation
  const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${index + 1}-${Date.now()}.${fileExtension}`;
  const imagePath = `albums/${albumCode}/${fileName}`;
  const imageRef = ref(storage, imagePath);

  // Étape 3: upload avec watchdog
  return new Promise<string>((resolve, reject) => {
    let task: UploadTask;
    try {
      task = uploadBytesResumable(imageRef, file, { contentType: file.type });
    } catch (err) {
      reject(err);
      return;
    }

    let lastTransferred = 0;
    let lastProgressAt = Date.now();
    let settled = false;

    const cleanup = () => {
      clearInterval(stallInterval);
      clearTimeout(totalTimeout);
    };

    const failWith = (reason: string) => {
      if (settled) return;
      settled = true;
      cleanup();
      try {
        task.cancel();
      } catch {
        // ignore
      }
      reject(new Error(reason));
    };

    // Watchdog "stall": vérifie périodiquement qu'on a progressé.
    const stallInterval = setInterval(() => {
      const elapsed = Date.now() - lastProgressAt;
      if (elapsed > stallTimeoutMs) {
        failWith(
          `upload bloqué (aucun octet transféré depuis ${Math.round(elapsed / 1000)}s) — fichier probablement inaccessible (proxy Lightroom / cloud non synchronisé)`
        );
      }
    }, 5_000);

    // Watchdog "total": durée maximale absolue.
    const totalTimeout = setTimeout(() => {
      failWith(`upload trop long (> ${Math.round(totalTimeoutMs / 1000)}s)`);
    }, totalTimeoutMs);

    task.on(
      'state_changed',
      (snapshot) => {
        if (snapshot.bytesTransferred > lastTransferred) {
          lastTransferred = snapshot.bytesTransferred;
          lastProgressAt = Date.now();
        }
        if (options.onByteProgress) {
          const percent = snapshot.totalBytes > 0
            ? Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
            : 0;
          options.onByteProgress(snapshot.bytesTransferred, snapshot.totalBytes, percent);
        }
      },
      (error) => {
        if (settled) return;
        settled = true;
        cleanup();
        const code = (error as { code?: string }).code;
        if (code === 'storage/canceled') {
          // Déjà rejeté par failWith ou l'appelant
          return;
        }
        reject(error);
      },
      async () => {
        if (settled) return;
        settled = true;
        cleanup();
        try {
          const downloadURL = await getDownloadURL(task.snapshot.ref);
          resolve(downloadURL);
        } catch (err) {
          reject(err);
        }
      }
    );
  });
};

// ─────────────────────────────────────────────────────────────────────────────
// Upload résiliant d'une liste d'images (continue en cas d'échec)
// ─────────────────────────────────────────────────────────────────────────────

export interface BatchUploadResult {
  successes: { index: number; fileName: string; url: string }[];
  failures: PhotoFailure[];
}

export interface BatchUploadOptions {
  onProgress?: (current: number, total: number, percent: number, currentFile?: string) => void;
  onPhotoFailure?: (failure: PhotoFailure) => void;
}

/**
 * Upload plusieurs images. Continue en cas d'échec d'une photo individuelle.
 * Le caller décide ensuite quoi faire des échecs.
 */
export const uploadImages = async (
  files: File[],
  albumCode: string,
  options: BatchUploadOptions = {}
): Promise<BatchUploadResult> => {
  const successes: BatchUploadResult['successes'] = [];
  const failures: PhotoFailure[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];

    if (options.onProgress) {
      const percent = Math.round(((i) / files.length) * 100);
      options.onProgress(i + 1, files.length, percent, file.name);
    }

    try {
      const url = await uploadImage(file, albumCode, i, {
        onByteProgress: (_transferred, _total, percent) => {
          if (options.onProgress) {
            // Progression composite: i fichiers + percent du fichier en cours
            const fileShare = 1 / files.length;
            const overallPercent = Math.round(
              ((i + (percent / 100)) / files.length) * 100
            );
            options.onProgress(i + 1, files.length, overallPercent, file.name);
            void fileShare;
          }
        },
      });
      successes.push({ index: i, fileName: file.name, url });
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'erreur inconnue';
      const failure: PhotoFailure = { index: i, fileName: file.name, reason };
      failures.push(failure);
      console.warn(`⚠️ Échec upload photo ${i + 1} (${file.name}):`, reason);
      if (options.onPhotoFailure) {
        options.onPhotoFailure(failure);
      }
    }
  }

  return { successes, failures };
};

// ─────────────────────────────────────────────────────────────────────────────
// Création d'album (haute niveau)
// ─────────────────────────────────────────────────────────────────────────────

export type EmailStatus =
  | { sent: true }
  | { sent: false; reason: string }
  | null;

export interface CreateAlbumResult {
  albumCode: string;
  uploadedCount: number;
  failures: PhotoFailure[];
  /**
   * Statut de l'envoi du mail au client.
   * - null : pas d'email client renseigné, rien tenté
   * - { sent: true } : envoi réussi
   * - { sent: false, reason: 'skipped' } : email renseigné mais case décochée
   * - { sent: false, reason } : tentative effectuée mais échec
   */
  emailStatus: EmailStatus;
}

/**
 * Appelle l'endpoint API d'envoi du mail album. Ne lève jamais : retourne
 * un EmailStatus pour que l'UI puisse afficher l'info sans bloquer la création.
 */
const sendClientEmail = async (params: {
  albumCode: string;
  albumTitle: string;
  clientName?: string;
  clientEmail: string;
  photoCount: number;
  expireAt: string;
  category?: string;
}): Promise<EmailStatus> => {
  // L'origine est nécessaire pour générer l'URL d'accès dans le mail.
  // En SSR (cas improbable ici), on ne peut pas envoyer le mail.
  if (typeof window === 'undefined') {
    return { sent: false, reason: 'origine du site indisponible (SSR)' };
  }

  try {
    const response = await fetch('/api/send-album-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...params,
        siteOrigin: window.location.origin,
      }),
    });

    if (!response.ok) {
      let reason = `HTTP ${response.status}`;
      try {
        const data = await response.json();
        if (data?.error) reason = String(data.error);
      } catch {
        // ignore parsing error
      }
      return { sent: false, reason };
    }

    return { sent: true };
  } catch (error) {
    const reason = error instanceof Error ? error.message : 'erreur réseau inconnue';
    return { sent: false, reason };
  }
};

/**
 * Crée un album. Tolère les échecs partiels d'upload : l'album est créé avec
 * les photos qui ont réussi, et la liste des échecs est retournée pour que
 * l'UI puisse les afficher à l'utilisateur.
 *
 * Lève une erreur uniquement si :
 *   - Firebase n'est pas configuré
 *   - Aucune photo n'a réussi à être uploadée
 */
export const createAlbumDetailed = async (
  formData: AlbumFormData,
  imageFiles: File[],
  onProgress?: ProgressCallback,
  onPhotoFailure?: (failure: PhotoFailure) => void
): Promise<CreateAlbumResult> => {
  if (!db || !storage) {
    throw new Error('Firebase non configuré. Vérifiez vos variables d\'environnement.');
  }

  if (imageFiles.length === 0) {
    throw new Error('Au moins une image est requise');
  }

  if (onProgress) onProgress('Génération du code d\'accès...');
  const albumCode = await generateUniqueCode();

  if (onProgress) onProgress('Upload des images...', 0, imageFiles.length, 0);

  const { successes, failures } = await uploadImages(imageFiles, albumCode, {
    onProgress: (current, total, percent, currentFile) => {
      if (onProgress) {
        const stage = currentFile
          ? `Upload (${current}/${total}) — ${currentFile}`
          : `Upload (${current}/${total})...`;
        onProgress(stage, current, total, percent);
      }
    },
    onPhotoFailure,
  });

  if (successes.length === 0) {
    const reasons = failures.map(f => `• ${f.fileName}: ${f.reason}`).join('\n');
    throw new Error(
      `Aucune photo n'a pu être uploadée.\n${reasons}`
    );
  }

  if (onProgress) onProgress('Création de l\'album...', successes.length, imageFiles.length, 100);

  const imageUrls = successes
    .sort((a, b) => a.index - b.index)
    .map(s => s.url);

  const albumData: Album = {
    id: albumCode,
    title: formData.title,
    category: formData.category,
    expireAt: formData.expireAt,
    photos: imageUrls,
    active: true,
    allowDownload: formData.allowDownload ?? true,
    clientName: formData.clientName || '',
    clientEmail: formData.clientEmail?.trim() || '',
    eventDate: formData.eventDate || '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const albumRef = doc(db, "albums", albumCode);
  await setDoc(albumRef, albumData);

  // Envoi du mail au client si demandé. Non bloquant côté logique métier :
  // l'album est créé même si l'envoi échoue.
  let emailStatus: EmailStatus = null;
  const trimmedEmail = formData.clientEmail?.trim();
  if (trimmedEmail) {
    if (formData.sendEmailToClient === false) {
      emailStatus = { sent: false, reason: 'skipped' };
    } else {
      if (onProgress) onProgress('Envoi de l\'email au client...', successes.length, imageFiles.length, 100);
      emailStatus = await sendClientEmail({
        albumCode,
        albumTitle: formData.title,
        clientName: formData.clientName,
        clientEmail: trimmedEmail,
        photoCount: imageUrls.length,
        expireAt: formData.expireAt,
        category: formData.category,
      });
    }
  }

  return {
    albumCode,
    uploadedCount: successes.length,
    failures,
    emailStatus,
  };
};

/**
 * Variante rétro-compatible: retourne juste le code d'album.
 * Préférer createAlbumDetailed pour pouvoir afficher les échecs partiels.
 */
export const createAlbum = async (
  formData: AlbumFormData,
  imageFiles: File[],
  onProgress?: ProgressCallback,
  onPhotoFailure?: (failure: PhotoFailure) => void
): Promise<string> => {
  const result = await createAlbumDetailed(formData, imageFiles, onProgress, onPhotoFailure);
  return result.albumCode;
};
