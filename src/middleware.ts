import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes qui nécessitent une authentification
const protectedRoutes = ['/dashboard', '/profile'];

// Routes d'authentification (à éviter si connecté)
const authRoutes = ['/auth/login', '/auth/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Vérifier si on est sur une route protégée
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Vérifier si on est sur une route d'auth
  const isAuthRoute = authRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Pour le moment, on laisse passer toutes les requêtes
  // Le middleware complet nécessiterait une vérification côté serveur
  // de l'état d'authentification Firebase
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 