export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  bio?: string;
  phone?: string;
  website?: string;
  location?: string;
  dateOfBirth?: string;
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: 'fr' | 'en';
    notifications: {
      email: boolean;
      push: boolean;
      marketing: boolean;
    };
    privacy: {
      profileVisibility: 'public' | 'friends' | 'private';
      showEmail: boolean;
      showPhone: boolean;
    };
  };
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
}

export interface UserStats {
  uid: string;
  loginCount: number;
  lastIpAddress?: string;
  lastUserAgent?: string;
  sessionsToday: number;
  totalSessionTime: number; // en minutes
  favoriteFeatures: string[];
  activityLog: ActivityLog[];
}

export interface ActivityLog {
  id: string;
  action: string;
  description: string;
  timestamp: Date;
  metadata?: Record<string, any>;
}

export interface UserSettings {
  uid: string;
  emailNotifications: boolean;
  pushNotifications: boolean;
  marketingEmails: boolean;
  twoFactorEnabled: boolean;
  sessionTimeout: number; // en minutes
  autoSave: boolean;
  darkMode: 'auto' | 'enabled' | 'disabled';
} 