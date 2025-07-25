# 📸 Julie G Studio

> Site web professionnel pour photographe en Normandie spécialisée en mariage, naissance et famille.

## ✨ Fonctionnalités

### 🏠 Site Vitrine

- **Design moderne** responsive avec thème clair/sombre
- **Portfolio** organisé par catégories (Mariage, Naissance, Famille, Animaux)
- **Galerie photos** optimisée avec modal de visualisation
- **Page tarifs** détaillée avec prestations
- **Formulaire de contact** intégré

### 📱 Espace Client

- **Accès sécurisé** par code unique temporaire
- **Albums privés** avec photos haute résolution
- **Téléchargement autorisé** des images
- **Interface intuitive** pour navigation

### ⚙️ Dashboard Admin

- **Gestion complète** des albums clients
- **Création d'albums** avec upload multiple
- **Statistiques** en temps réel
- **Contrôle des accès** et dates d'expiration
- **Prolongation/désactivation** des albums

### 🎨 Design System

- **Icônes monochrome** (Lucide React)
- **Thème adaptatif** clair/sombre automatique
- **Accessibilité WCAG AA** respectée
- **Animations fluides** et microinteractions

## 🛠️ Stack Technique

### Frontend

- **Next.js 14** - Framework React avec SSR
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utilitaire
- **Lucide React** - Bibliothèque d'icônes

### Backend & Services

- **Firebase Authentication** - Authentification utilisateurs
- **Firestore** - Base de données NoSQL
- **Firebase Storage** - Stockage photos
- **Firebase Security Rules** - Sécurité des données

### Outils & Déploiement

- **Vite** - Build tool moderne
- **PWA** - Application web progressive
- **ESLint** - Linting JavaScript/TypeScript
- **Git** - Contrôle de version

## 📂 Structure du Projet

```
Julie-G Studio/
├── 📁 src/
│   ├── 📁 components/
│   │   ├── 📁 layout/         # Header, Footer, Layout
│   │   └── 📁 ui/             # Composants réutilisables
│   ├── 📁 pages/              # Pages Next.js
│   │   ├── 📁 admin/          # Dashboard administrateur
│   │   ├── 📁 album/          # Accès albums clients
│   │   ├── 📁 auth/           # Authentification
│   │   └── 📁 portfolios/     # Galeries par catégorie
│   ├── 📁 services/           # Services Firebase
│   ├── 📁 contexts/           # Contextes React
│   ├── 📁 hooks/              # Hooks personnalisés
│   ├── 📁 types/              # Types TypeScript
│   └── 📁 utils/              # Utilitaires
├── 📁 public/                 # Assets statiques
├── 📁 firebase/              # Configuration Firebase
└── 📄 Configuration files
```

## 🚀 Installation

### Prérequis

- Node.js 18+
- npm ou yarn
- Compte Firebase

### Étapes d'installation

1. **Cloner le repository**

```bash
git clone [URL_DU_REPO]
cd Julie-G-Studio
```

2. **Installer les dépendances**

```bash
npm install
```

3. **Configuration Firebase**

```bash
# Créer le fichier .env.local
cp .env.example .env.local
```

Remplir `.env.local` avec vos clés Firebase :

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

4. **Lancer en développement**

```bash
npm run dev
```

5. **Build pour production**

```bash
npm run build
npm run start
```

## 🔐 Configuration Firebase

### Firestore Database

```javascript
// Collection: albums
albums/{code} = {
  title: string,
  category: string,
  photos: string[], // URLs Storage
  expireAt: Timestamp,
  active: boolean,
  allowDownload: boolean,
  createdAt: Timestamp
}
```

### Storage Rules

```javascript
// Path: albums/{albumId}/{photoId}
// Public read, Admin write only
```

### Authentication

- **Email/Password** activé
- **Comptes admin** gérés via Firebase Console

## 📱 Utilisation

### Côté Client

1. Accéder à `/acces`
2. Entrer le code fourni par Julie
3. Visualiser et télécharger les photos

### Côté Admin (Julie)

1. Se connecter via `/admin`
2. Créer des albums pour clients
3. Gérer les accès et expirations
4. Suivre les statistiques

## 🎨 Personnalisation

### Couleurs & Thèmes

- Modification dans `tailwind.config.js`
- Variables CSS dans `globals.css`
- Contexte thème dans `ThemeContext.tsx`

### Contenus

- Tarifs : `pages/tarifs.tsx`
- Portfolio : Ajout photos dans `public/`
- Textes : Modification directe des composants

## 📈 SEO & Performance

- **Meta tags** optimisés par page
- **Images** optimisées et lazy loading
- **PWA** avec service worker
- **Lighthouse Score** : 95+ sur tous critères

## 🛡️ Sécurité

- **Codes d'accès** uniques et temporaires
- **Règles Firebase** restrictives
- **HTTPS** obligatoire en production
- **Validation** côté client et serveur

## 📞 Contact & Support

**Julie G Studio**

- 📧 Email : julie-g.studio@gmail.com
- 📱 Téléphone : 06 68 00 64 54
- 📍 Région : Normandie

**Développement**

- 👨‍💻 Développé par : [JavaChrist](https://javachrist.fr)
- 🐛 Issues : [GitHub Issues](lien_vers_issues)
- 📖 Documentation : Ce README

## 📄 Licence

© 2025 Julie G Studio. Tous droits réservés.

Site développé par JavaChrist - Reproduction interdite sans autorisation.

---

**⭐ Si ce projet vous plaît, n'hésitez pas à le partager !**
