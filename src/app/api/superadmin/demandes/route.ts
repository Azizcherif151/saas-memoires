import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { jwtVerify } from 'jose';

async function requireSuperAdmin(request: Request) {
  const token = request.headers
    .get('cookie')
    ?.split('; ')
    .find((r) => r.startsWith('session_token='))
    ?.split('=')[1];

  if (!token) return null;

  const secret = process.env.JWT_SECRET;
  if (!secret) throw new Error('JWT_SECRET manquant');

  const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
  if (payload.role !== 'superadmin') return null;
  return payload;
}

export async function GET(request: Request) {
  try {
    const auth = await requireSuperAdmin(request);
    if (!auth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const result = await query(
      `SELECT id, nom_etablissement, nom_contact, email, telephone, message, statut, date_creation
       FROM demandes_acces
       ORDER BY
         CASE WHEN statut = 'nouvelle' THEN 0 ELSE 1 END,
         date_creation DESC`
    );

    return NextResponse.json({ demandes: result.rows });
  } catch (error) {
    console.error('GET /api/superadmin/demandes:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const auth = await requireSuperAdmin(request);
    if (!auth) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { id, statut } = await request.json();
    if (!id || !['nouvelle', 'traitee', 'refusee'].includes(statut)) {
      return NextResponse.json({ error: 'Données invalides' }, { status: 400 });
    }

    const result = await query(
      `UPDATE demandes_acces SET statut = $1 WHERE id = $2
       RETURNING id, statut`,
      [statut, id]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Demande introuvable' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Statut mis à jour', data: result.rows[0] });
  } catch (error) {
    console.error('PATCH /api/superadmin/demandes:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}