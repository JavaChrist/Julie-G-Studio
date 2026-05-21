import { User as FirebaseUser } from 'firebase/auth';

export interface User extends FirebaseUser {
  displayName: string | null;
  email: string | null;
  photoURL: string | null;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export interface ComponentProps {
  children?: React.ReactNode;
  className?: string;
}

export interface ButtonProps extends ComponentProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
  onClick?: () => void;
  title?: string; // Ajout de la prop title pour les tooltips
  isLoading?: boolean; // Ajout de la prop isLoading pour les états de chargement
}

export interface InputProps {
  label?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  className?: string;
  autoComplete?: string;
  name?: string;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
  /** Si true et type === 'password', affiche un bouton œil pour basculer la visibilité. */
  togglePassword?: boolean;
}

// Interface principale pour les albums
export interface Album {
  id: string; // Code d'accès unique (aussi utilisé comme ID du document)
  title: string;
  category: string;
  expireAt: string; // Date ISO string
  photos: string[]; // URLs des images dans Firebase Storage
  active: boolean;
  allowDownload: boolean;
  clientName?: string;
  clientEmail?: string;
  eventDate?: string;
  createdAt: string; // Date ISO string
  updatedAt?: string; // Date ISO string
}

// Interface pour les données du formulaire
export interface AlbumFormData {
  title: string;
  category: string;
  expireAt: string;
  clientName?: string;
  clientEmail?: string;
  eventDate?: string;
  allowDownload?: boolean;
  /** Si true et clientEmail fourni, on envoie automatiquement le mail d'accès. */
  sendEmailToClient?: boolean;
}

// Interface pour les statistiques admin
export interface AdminStats {
  totalAlbums: number;
  activeAlbums: number;
  expiredAlbums: number;
  expiringSoon: number;
  albums: Album[];
} 