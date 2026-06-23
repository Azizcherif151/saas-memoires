import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('session_token')?.value;
  const { pathname } = request.nextUrl;

  // Si l'utilisateur essaie d'accéder au dashboard sans être connecté
  if (pathname.startsWith('/dashboard')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Vérification de la validité du token JWT
      const secretText = process.env.JWT_SECRET;
      if (!secretText) throw new Error();
      const secret = new TextEncoder().encode(secretText);
      
      await jwtVerify(token, secret);
      
      // Si le token est valide, on le laisse passer vers le dashboard
      return NextResponse.next();
    } catch (error) {
      // Si le token est expiré ou truqué, on supprime le cookie et on redirige au login
      const reponse = NextResponse.redirect(new URL('/login', request.url));
      reponse.cookies.delete('session_token');
      return reponse;
    }
  }

  return NextResponse.next();
}

// On configure le middleware pour qu'il s'applique uniquement sur les routes du dashboard
export const config = {
  matcher: ['/dashboard/:path*'],
};