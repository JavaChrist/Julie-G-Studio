# Règles de sécurité Firebase - Julie-G Studio

## Règles Firestore

Copiez ces règles dans la console Firebase → Firestore Database → Rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Albums - Lecture publique pour les codes valides, écriture admin uniquement
    match /albums/{albumId} {
      // Lecture : permet aux clients d'accéder aux albums avec le bon code
      allow read: if true; // Le contrôle d'accès se fait côté client avec expireAt et active

      // Écriture : uniquement pour les administrateurs
      allow write: if isAdmin();
    }

    // Collection des utilisateurs (si implémentée)
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      allow read: if isAdmin(); // Les admins peuvent lire tous les profils
    }

    // Fonction pour vérifier si l'utilisateur est admin
    function isAdmin() {
      return request.auth != null &&
             request.auth.token.email in [
               'julie@juliegstudio.com',
               'admin@juliegstudio.com'
             ];
    }
  }
}
```

## Règles Firebase Storage

Copiez ces règles dans la console Firebase → Storage → Rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Albums - Photos accessibles uniquement si l'album est valide
    match /albums/{albumId}/{allPaths=**} {
      // Lecture : accessible à tous (le contrôle se fait au niveau Firestore)
      allow read: if true;

      // Écriture : uniquement pour les administrateurs
      allow write: if isAdmin();
    }

    // Fonction pour vérifier si l'utilisateur est admin
    function isAdmin() {
      return request.auth != null &&
             request.auth.token.email in [
               'julie@juliegstudio.com',
               'admin@juliegstudio.com'
             ];
    }
  }
}
```

## Structure des données Firestore

### Collection `albums/{code}`

```javascript
{
  id: "abc12345",           // Code d'accès unique
  title: "Mariage Laura & Pierre",
  category: "mariage",
  expireAt: "2024-06-01T00:00:00.000Z", // Date ISO
  photos: [                 // URLs des photos dans Storage
    "https://firebasestorage.googleapis.com/...",
    "https://firebasestorage.googleapis.com/..."
  ],
  active: true,             // Album actif ou désactivé
  allowDownload: true,      // Autoriser le téléchargement
  clientName: "Laura & Pierre",
  eventDate: "2024-03-15T00:00:00.000Z",
  createdAt: "2024-01-15T10:30:00.000Z",
  updatedAt: "2024-01-20T14:20:00.000Z"
}
```

### Collection `users/{userId}` (optionnelle)

```javascript
{
  email: "julie@juliegstudio.com",
  role: "admin",            // "admin" ou "client"
  displayName: "Julie G",
  createdAt: "2024-01-01T00:00:00.000Z"
}
```

## Sécurité côté client

### Validation d'accès à un album

Le code côté client doit vérifier :

1. **Album existe** : Document existe dans Firestore
2. **Album actif** : `active === true`
3. **Album non expiré** : `expireAt > now`

### Exemple de validation

```typescript
const isAlbumAccessible = (album: Album): boolean => {
  if (!album.active) return false;

  const now = new Date();
  const expireDate = new Date(album.expireAt);

  return expireDate > now;
};
```

## Configuration des permissions utilisateurs

### Pour activer l'authentification admin

1. Dans la console Firebase → Authentication → Users
2. Ajouter les emails admin :
   - `julie@juliegstudio.com`
   - `admin@juliegstudio.com`

### Claims personnalisés (optionnel)

Pour une sécurité renforcée, vous pouvez utiliser les Custom Claims :

```javascript
// Côté serveur (Cloud Functions)
admin.auth().setCustomUserClaims(uid, { admin: true });

// Dans les règles Firestore
function isAdmin() {
  return request.auth != null && request.auth.token.admin == true;
}
```

## Notes importantes

⚠️ **Sécurité des images** : Les URLs Firebase Storage sont publiques une fois générées. Le contrôle d'accès se fait au niveau logique (vérification de l'album).

✅ **Recommandation** : Pour une sécurité maximale, considérez l'implémentation de signed URLs avec une durée limitée via Cloud Functions.

🔐 **Authentication** : Les règles actuelles permettent la lecture publique des albums. L'accès est contrôlé par la logique applicative (code d'accès + validation).
