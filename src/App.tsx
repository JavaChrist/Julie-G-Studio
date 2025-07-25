import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserDataProvider } from './contexts/UserDataContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Portfolios from './pages/portfolios';
import Tarifs from './pages/tarifs';
import Contact from './pages/contact';
import Acces from './pages/acces';
import AdminDashboard from './pages/admin';
import AjouterAlbum from './pages/admin/ajouter';
import PortfolioDetails from './pages/portfolios/[categorie]';
import AlbumDetails from './pages/album/[code]';

// Composant pour protéger les routes
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Chargement...</p>
        </div>
      </div>
    );
  }

  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

// Composant pour rediriger les utilisateurs connectés
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Chargement...</p>
        </div>
      </div>
    );
  }

  return !user ? <>{children}</> : <Navigate to="/" replace />;
};

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <UserDataProvider>
          <Router>
            <div className="App">
              <Routes>
                {/* Routes publiques */}
                <Route path="/" element={<Home />} />
                <Route path="/portfolios" element={<Portfolios />} />
                <Route path="/portfolios/:categorie" element={<PortfolioDetails />} />
                <Route path="/tarifs" element={<Tarifs />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/acces" element={<Acces />} />
                <Route path="/album/:code" element={<AlbumDetails />} />
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/ajouter" element={<AjouterAlbum />} />
                <Route
                  path="/login"
                  element={
                    <PublicRoute>
                      <Login />
                    </PublicRoute>
                  }
                />
                <Route
                  path="/register"
                  element={
                    <PublicRoute>
                      <Register />
                    </PublicRoute>
                  }
                />

                {/* Routes protégées */}
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <Profile />
                    </ProtectedRoute>
                  }
                />

                {/* Page pour les paramètres (exemple) */}
                <Route
                  path="/settings"
                  element={
                    <ProtectedRoute>
                      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                        <div className="text-center">
                          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Paramètres</h1>
                          <p className="text-gray-600 dark:text-gray-300">Cette page est en cours de développement...</p>
                        </div>
                      </div>
                    </ProtectedRoute>
                  }
                />

                {/* Route 404 */}
                <Route
                  path="*"
                  element={
                    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                      <div className="text-center">
                        <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">404</h1>
                        <p className="text-gray-600 dark:text-gray-300 mb-6">Page non trouvée</p>
                        <button
                          onClick={() => window.location.href = '/'}
                          className="text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                        >
                          Retour à l'accueil
                        </button>
                      </div>
                    </div>
                  }
                />
              </Routes>

              {/* Toast notifications */}
              <Toaster
                position="top-right"
                toastOptions={{
                  duration: 4000,
                  style: {
                    background: '#363636',
                    color: '#fff',
                  },
                  success: {
                    style: {
                      background: '#10b981',
                    },
                  },
                  error: {
                    style: {
                      background: '#ef4444',
                    },
                  },
                }}
              />
            </div>
          </Router>
        </UserDataProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;