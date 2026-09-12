import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

type Role = 'superadmin' | 'admin' | 'etudiant' | 'encadreur' | 'jury';

async function getPayload(token: string) {
  const secretText = process.env.JWT_SECRET;
  if (!secretText) throw new Error('JWT_SECRET manquant');
  const secret = new TextEncoder().encode(secretText);
  const { payload } = await jwtVerify(token, secret);
  return payload as {
    id: string;
    role: Role;
    prenom?: string;
    nom?: string;
    email?: string;
    etablissementId?: string;
  };
}

function redirectToLogin(request: NextRequest) {
  const res = NextResponse.redirect(new URL('/login', request.url));
  res.cookies.delete('session_token');
  return res;
}

function redirectByRole(request: NextRequest, role: Role) {
  const map: Record<Role, string> = {
    superadmin: '/superadmin/dashboard',
    admin: '/dashboard',
    etudiant: '/etudiant',
    encadreur: '/encadreur',
    jury: '/jury',
  };
  return NextResponse.redirect(new URL(map[role] || '/login', request.url));
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('session_token')?.value;
  const { pathname } = request.nextUrl;

  const isSuperAdminZone = pathname.startsWith('/superadmin');
  const isAdminZone = pathname.startsWith('/dashboard');
  const isEtudiantZone = pathname.startsWith('/etudiant');
  const isEncadreurZone = pathname.startsWith('/encadreur');
  const isJuryZone = pathname.startsWith('/jury');
  const isProtected =
    isSuperAdminZone || isAdminZone || isEtudiantZone || isEncadreurZone || isJuryZone;

  if (!isProtected) {
    return NextResponse.next();
  }

  if (!token) {
    return redirectToLogin(request);
  }

  try {
    const payload = await getPayload(token);
    const role = payload.role;

    // SuperAdmin uniquement sur /superadmin
    if (isSuperAdminZone && role !== 'superadmin') {
      return redirectByRole(request, role);
    }

    // Admin établissement uniquement sur /dashboard
    if (isAdminZone && role !== 'admin') {
      // si un superadmin tombe ici, on le renvoie vers son panel
      return redirectByRole(request, role);
    }

    if (isEtudiantZone && role !== 'etudiant') {
      return redirectByRole(request, role);
    }

    if (isEncadreurZone && role !== 'encadreur') {
      return redirectByRole(request, role);
    }

    if (isJuryZone && role !== 'jury') {
      return redirectByRole(request, role);
    }

    return NextResponse.next();
  } catch {
    return redirectToLogin(request);
  }
}

export const config = {
  matcher: [
    '/superadmin/:path*',
    '/dashboard/:path*',
    '/etudiant/:path*',
    '/encadreur/:path*',
    '/jury/:path*',
  ],
};