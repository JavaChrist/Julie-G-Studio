import { cert, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

function readServiceAccount(): { projectId: string; clientEmail: string; privateKey: string } | null {
  const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON?.trim();
  if (json) {
    const parsed = JSON.parse(json) as Record<string, string>;
    const projectId = parsed.project_id || parsed.projectId;
    const clientEmail = parsed.client_email || parsed.clientEmail;
    const privateKey = String(parsed.private_key || parsed.privateKey || '').replace(/\\n/g, '\n');
    if (projectId && clientEmail && privateKey) {
      return { projectId, clientEmail, privateKey };
    }
  }

  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL?.trim();
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
  const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID?.trim();
  if (projectId && clientEmail && privateKey) {
    return { projectId, clientEmail, privateKey };
  }

  return null;
}

export function isFirebaseAdminConfigured(): boolean {
  try {
    return readServiceAccount() !== null;
  } catch {
    return false;
  }
}

let adminApp: App | null = null;

export function getFirebaseAdminAuth() {
  if (!adminApp) {
    const existing = getApps()[0];
    if (existing) {
      adminApp = existing;
    } else {
      const account = readServiceAccount();
      if (!account) {
        throw new Error('Firebase Admin non configuré');
      }
      adminApp = initializeApp({
        credential: cert(account),
      });
    }
  }
  return getAuth(adminApp);
}
