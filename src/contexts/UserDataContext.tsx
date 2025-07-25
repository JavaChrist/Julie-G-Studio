import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  collection,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  serverTimestamp,
  onSnapshot,
  Unsubscribe
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/firebaseConfig';
import { useAuth } from './AuthContext';
import { UserProfile, UserStats, ActivityLog, UserSettings } from '../types/user';
import toast from 'react-hot-toast';

interface UserDataContextType {
  userProfile: UserProfile | null;
  userStats: UserStats | null;
  userSettings: UserSettings | null;
  loading: boolean;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateSettings: (data: Partial<UserSettings>) => Promise<void>;
  logActivity: (action: string, description: string, metadata?: Record<string, any>) => Promise<void>;
  getRecentActivity: (limitCount?: number) => Promise<ActivityLog[]>;
  isConfigured: boolean;
}

const UserDataContext = createContext<UserDataContextType | undefined>(undefined);

export const useUserData = () => {
  const context = useContext(UserDataContext);
  if (context === undefined) {
    throw new Error('useUserData must be used within a UserDataProvider');
  }
  return context;
};

interface UserDataProviderProps {
  children: React.ReactNode;
}

export const UserDataProvider: React.FC<UserDataProviderProps> = ({ children }) => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [userSettings, setUserSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(false);

  // Créer un profil par défaut
  const createDefaultProfile = (uid: string, email: string, displayName?: string): UserProfile => ({
    uid,
    email,
    displayName,
    preferences: {
      theme: 'system',
      language: 'fr',
      notifications: {
        email: true,
        push: true,
        marketing: false,
      },
      privacy: {
        profileVisibility: 'private',
        showEmail: false,
        showPhone: false,
      }
    },
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: new Date(),
  });

  const createDefaultStats = (uid: string): UserStats => ({
    uid,
    loginCount: 1,
    sessionsToday: 1,
    totalSessionTime: 0,
    favoriteFeatures: [],
    activityLog: [],
  });

  const createDefaultSettings = (uid: string): UserSettings => ({
    uid,
    emailNotifications: true,
    pushNotifications: true,
    marketingEmails: false,
    twoFactorEnabled: false,
    sessionTimeout: 60,
    autoSave: true,
    darkMode: 'auto',
  });

  // Charger les données utilisateur
  useEffect(() => {
    if (!user || !isFirebaseConfigured || !db) {
      setUserProfile(null);
      setUserStats(null);
      setUserSettings(null);
      return;
    }

    const loadUserData = async () => {
      setLoading(true);
      try {
        // Charger le profil
        const profileRef = doc(db, 'userProfiles', user.uid);
        const profileSnap = await getDoc(profileRef);

        if (profileSnap.exists()) {
          const data = profileSnap.data();
          setUserProfile({
            ...data,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            lastLoginAt: data.lastLoginAt?.toDate() || new Date(),
          } as UserProfile);
        } else {
          // Créer un nouveau profil
          const newProfile = createDefaultProfile(user.uid, user.email!, user.displayName || undefined);
          await setDoc(profileRef, {
            ...newProfile,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
          });
          setUserProfile(newProfile);
        }

        // Charger les statistiques
        const statsRef = doc(db, 'userStats', user.uid);
        const statsSnap = await getDoc(statsRef);

        if (statsSnap.exists()) {
          setUserStats(statsSnap.data() as UserStats);
        } else {
          const newStats = createDefaultStats(user.uid);
          await setDoc(statsRef, newStats);
          setUserStats(newStats);
        }

        // Charger les paramètres
        const settingsRef = doc(db, 'userSettings', user.uid);
        const settingsSnap = await getDoc(settingsRef);

        if (settingsSnap.exists()) {
          setUserSettings(settingsSnap.data() as UserSettings);
        } else {
          const newSettings = createDefaultSettings(user.uid);
          await setDoc(settingsRef, newSettings);
          setUserSettings(newSettings);
        }

        // Mettre à jour la dernière connexion
        await updateDoc(profileRef, {
          lastLoginAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

      } catch (error) {
        console.error('Erreur lors du chargement des données utilisateur:', error);
        // En cas d'erreur, créer des données par défaut localement
        if (user) {
          setUserProfile(createDefaultProfile(user.uid, user.email!, user.displayName || undefined));
          setUserStats(createDefaultStats(user.uid));
          setUserSettings(createDefaultSettings(user.uid));
        }
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, [user, isFirebaseConfigured]);

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!user || !isFirebaseConfigured || !db) {
      toast.error('Firestore n\'est pas configuré.');
      return;
    }

    try {
      const profileRef = doc(db, 'userProfiles', user.uid);
      await updateDoc(profileRef, {
        ...data,
        updatedAt: serverTimestamp(),
      });

      // Mettre à jour l'état local
      setUserProfile(prev => prev ? { ...prev, ...data, updatedAt: new Date() } : null);
      toast.success('Profil mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la mise à jour du profil:', error);
      toast.error('Erreur lors de la mise à jour du profil.');
    }
  };

  const updateSettings = async (data: Partial<UserSettings>) => {
    if (!user || !isFirebaseConfigured || !db) {
      toast.error('Firestore n\'est pas configuré.');
      return;
    }

    try {
      const settingsRef = doc(db, 'userSettings', user.uid);
      await updateDoc(settingsRef, data);

      // Mettre à jour l'état local
      setUserSettings(prev => prev ? { ...prev, ...data } : null);
      toast.success('Paramètres mis à jour avec succès !');
    } catch (error) {
      console.error('Erreur lors de la mise à jour des paramètres:', error);
      toast.error('Erreur lors de la mise à jour des paramètres.');
    }
  };

  const logActivity = async (action: string, description: string, metadata?: Record<string, any>) => {
    if (!user || !isFirebaseConfigured || !db) {
      return;
    }

    try {
      const activityRef = collection(db, 'userActivity');
      await addDoc(activityRef, {
        uid: user.uid,
        action,
        description,
        metadata: metadata || {},
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement de l\'activité:', error);
    }
  };

  const getRecentActivity = async (limitCount: number = 10): Promise<ActivityLog[]> => {
    if (!user || !isFirebaseConfigured || !db) {
      return [];
    }

    try {
      const activityRef = collection(db, 'userActivity');
      const q = query(
        activityRef,
        where('uid', '==', user.uid),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date(),
      })) as ActivityLog[];
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'activité:', error);
      return [];
    }
  };

  const value: UserDataContextType = {
    userProfile,
    userStats,
    userSettings,
    loading,
    updateProfile,
    updateSettings,
    logActivity,
    getRecentActivity,
    isConfigured: isFirebaseConfigured,
  };

  return (
    <UserDataContext.Provider value={value}>
      {children}
    </UserDataContext.Provider>
  );
}; 