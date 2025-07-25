import React, { useState, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { storage, isFirebaseConfigured } from '../../firebase/firebaseConfig';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { updateProfile } from 'firebase/auth';
import Button from './Button';
import { Camera, Upload, X, User } from 'lucide-react';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';

interface AvatarUploadProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ size = 'md', className }) => {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const sizeClasses = {
    sm: 'w-16 h-16',
    md: 'w-24 h-24',
    lg: 'w-32 h-32'
  };

  const iconSizes = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleUpload = async (file: File) => {
    if (!user) {
      toast.error('Vous devez être connecté pour uploader un avatar.');
      return;
    }

    if (!isFirebaseConfigured || !storage) {
      toast.error('Firebase Storage n\'est pas configuré.');
      return;
    }

    // Validation du fichier
    const maxSize = 5 * 1024 * 1024; // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

    if (file.size > maxSize) {
      toast.error('Le fichier est trop volumineux. Taille maximale : 5MB.');
      return;
    }

    if (!allowedTypes.includes(file.type)) {
      toast.error('Format de fichier non supporté. Utilisez JPG, PNG, GIF ou WebP.');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Supprimer l'ancien avatar s'il existe
      if (user.photoURL && user.photoURL.includes('firebase')) {
        try {
          const oldAvatarRef = ref(storage, user.photoURL);
          await deleteObject(oldAvatarRef);
        } catch (error) {
          // L'ancien fichier peut ne pas exister, on continue
          console.log('Ancien avatar non trouvé, on continue...');
        }
      }

      // Upload du nouveau fichier
      const fileName = `avatars/${user.uid}/${Date.now()}_${file.name}`;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        },
        (error) => {
          console.error('Erreur d\'upload:', error);
          toast.error('Erreur lors de l\'upload de l\'avatar.');
          setUploading(false);
        },
        async () => {
          try {
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

            // Mettre à jour le profil utilisateur
            await updateProfile(user, {
              photoURL: downloadURL
            });

            toast.success('Avatar mis à jour avec succès !');
            setUploading(false);
            setUploadProgress(0);
          } catch (error) {
            console.error('Erreur lors de la mise à jour du profil:', error);
            toast.error('Erreur lors de la mise à jour du profil.');
            setUploading(false);
          }
        }
      );
    } catch (error) {
      console.error('Erreur:', error);
      toast.error('Une erreur est survenue.');
      setUploading(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!user || !user.photoURL) return;

    if (!isFirebaseConfigured || !storage) {
      toast.error('Firebase Storage n\'est pas configuré.');
      return;
    }

    try {
      setUploading(true);

      // Supprimer le fichier du storage
      if (user.photoURL.includes('firebase')) {
        const avatarRef = ref(storage, user.photoURL);
        await deleteObject(avatarRef);
      }

      // Mettre à jour le profil utilisateur
      await updateProfile(user, {
        photoURL: null
      });

      toast.success('Avatar supprimé avec succès !');
      setUploading(false);
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression de l\'avatar.');
      setUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={cn('relative inline-block', className)}>
      {/* Avatar Display */}
      <div className={cn(
        'relative rounded-full overflow-hidden border-4 border-white dark:border-gray-800 shadow-lg',
        sizeClasses[size]
      )}>
        {user?.photoURL ? (
          <img
            src={user.photoURL}
            alt="Avatar"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center">
            <User className={cn('text-gray-500 dark:text-gray-400', iconSizes[size])} />
          </div>
        )}

        {/* Upload Progress Overlay */}
        {uploading && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin mb-2"></div>
              <div className="text-white text-xs font-medium">
                {Math.round(uploadProgress)}%
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="absolute -bottom-2 -right-2 flex space-x-1">
        <Button
          size="sm"
          className="rounded-full p-2 shadow-lg"
          onClick={triggerFileInput}
          disabled={uploading || !isFirebaseConfigured}
          title={isFirebaseConfigured ? 'Changer l\'avatar' : 'Firebase Storage non configuré'}
        >
          <Camera className="w-3 h-3" />
        </Button>

        {user?.photoURL && (
          <Button
            size="sm"
            variant="danger"
            className="rounded-full p-2 shadow-lg"
            onClick={handleRemoveAvatar}
            disabled={uploading || !isFirebaseConfigured}
            title="Supprimer l'avatar"
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Drag & Drop Area (for larger sizes) */}
      {size === 'lg' && !uploading && (
        <div
          className="absolute inset-0 rounded-full flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer bg-black bg-opacity-30"
          onClick={triggerFileInput}
        >
          <div className="text-center text-white">
            <Upload className="w-6 h-6 mx-auto mb-1" />
            <div className="text-xs font-medium">Upload</div>
          </div>
        </div>
      )}

      {/* Configuration Warning */}
      {!isFirebaseConfigured && (
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs text-red-500 whitespace-nowrap">
          Storage non configuré
        </div>
      )}
    </div>
  );
};

export default AvatarUpload; 