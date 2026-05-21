import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Vérification des variables d'environnement (Next.js format)
const requiredEnvVars = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Vérifier si toutes les variables sont définies
const missingVars = Object.entries(requiredEnvVars)
  .filter(([_, value]) => !value)
  .map(([key]) => `NEXT_PUBLIC_FIREBASE_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}`);

if (missingVars.length > 0) {
  console.warn('⚠️ Variables d\'environnement Firebase manquantes:', missingVars);
  console.log('📝 Créez un fichier .env.local avec vos clés Firebase. Exemple:');
  console.log('NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key');
  console.log('NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id');
  console.log('etc...');
}

// On utilise le storageBucket exactement tel que défini dans .env.local.
// Pour les projets Firebase créés après avril 2024, le bucket par défaut est
// <project-id>.firebasestorage.app. Pour les projets plus anciens, c'est
// <project-id>.appspot.com. Aucune normalisation: la valeur de la console
// Firebase est la source de vérité.
console.log('📦 Storage Bucket configuré:', requiredEnvVars.storageBucket);

const firebaseConfig = {
  apiKey: requiredEnvVars.apiKey || "demo-api-key",
  authDomain: requiredEnvVars.authDomain || "demo-project.firebaseapp.com",
  projectId: requiredEnvVars.projectId || "demo-project",
  storageBucket: requiredEnvVars.storageBucket || "demo-project.firebasestorage.app",
  messagingSenderId: requiredEnvVars.messagingSenderId || "123456789",
  appId: requiredEnvVars.appId || "1:123456789:web:demo"
};

let app;
let auth;
let db;
let storage;

try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);
  storage = getStorage(app);
} catch (error) {
  console.error('❌ Erreur d\'initialisation Firebase:', error);
  // Toujours tenter de récupérer l'app existante
  try {
    app = getApp();
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (e) {
    auth = null as any;
    db = null as any;
    storage = null as any;
  }
}

export { auth, db, storage };
export const isFirebaseConfigured = missingVars.length === 0;