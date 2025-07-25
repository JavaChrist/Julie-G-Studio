import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase/firebaseConfig';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGitHub: () => Promise<void>;
  isConfigured: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isFirebaseConfigured || !auth) {
      setLoading(false);
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string) => {
    if (!isFirebaseConfigured || !auth) {
      toast.error('Firebase n\'est pas configuré. Vérifiez vos variables d\'environnement.');
      throw new Error('Firebase not configured');
    }

    try {
      setLoading(true);
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Connexion réussie !');
    } catch (error: any) {
      const errorMessage = getErrorMessage(error.code);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (email: string, password: string, displayName?: string) => {
    if (!isFirebaseConfigured || !auth) {
      toast.error('Firebase n\'est pas configuré. Vérifiez vos variables d\'environnement.');
      throw new Error('Firebase not configured');
    }

    try {
      setLoading(true);
      const { user } = await createUserWithEmailAndPassword(auth, email, password);

      if (displayName && user) {
        await updateProfile(user, { displayName });
      }

      toast.success('Compte créé avec succès !');
    } catch (error: any) {
      const errorMessage = getErrorMessage(error.code);
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    if (!isFirebaseConfigured || !auth) {
      toast.error('Firebase n\'est pas configuré. Vérifiez vos variables d\'environnement.');
      throw new Error('Firebase not configured');
    }

    try {
      setLoading(true);
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      await signInWithPopup(auth, provider);
      toast.success('Connexion Google réussie !');
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        const errorMessage = getErrorMessage(error.code);
        toast.error(errorMessage);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const loginWithGitHub = async () => {
    if (!isFirebaseConfigured || !auth) {
      toast.error('Firebase n\'est pas configuré. Vérifiez vos variables d\'environnement.');
      throw new Error('Firebase not configured');
    }

    try {
      setLoading(true);
      const provider = new GithubAuthProvider();
      provider.addScope('user:email');

      await signInWithPopup(auth, provider);
      toast.success('Connexion GitHub réussie !');
    } catch (error: any) {
      if (error.code !== 'auth/popup-closed-by-user') {
        const errorMessage = getErrorMessage(error.code);
        toast.error(errorMessage);
      }
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!isFirebaseConfigured || !auth) {
      toast.error('Firebase n\'est pas configuré.');
      throw new Error('Firebase not configured');
    }

    try {
      await signOut(auth);
      toast.success('Déconnexion réussie !');
    } catch (error: any) {
      toast.error('Erreur lors de la déconnexion');
      throw error;
    }
  };

  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/user-not-found':
        return 'Aucun utilisateur trouvé avec cette adresse email.';
      case 'auth/wrong-password':
        return 'Mot de passe incorrect.';
      case 'auth/email-already-in-use':
        return 'Cette adresse email est déjà utilisée.';
      case 'auth/weak-password':
        return 'Le mot de passe doit contenir au moins 6 caractères.';
      case 'auth/invalid-email':
        return 'Adresse email invalide.';
      case 'auth/too-many-requests':
        return 'Trop de tentatives. Veuillez réessayer plus tard.';
      case 'auth/popup-blocked':
        return 'La popup a été bloquée. Autorisez les popups pour ce site.';
      case 'auth/popup-closed-by-user':
        return 'Connexion annulée par l\'utilisateur.';
      case 'auth/account-exists-with-different-credential':
        return 'Un compte existe déjà avec cette adresse email mais avec un autre mode de connexion.';
      default:
        return 'Une erreur est survenue. Veuillez réessayer.';
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    loginWithGoogle,
    loginWithGitHub,
    isConfigured: isFirebaseConfigured,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 