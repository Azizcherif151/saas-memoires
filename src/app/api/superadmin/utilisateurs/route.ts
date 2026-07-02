import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function GET(request: Request) {
  try {
    const token = request.headers.get('cookie')
      ?.split('; ')
      .find(row => row.startsWith('session_token='))
      ?.split('=')[1];

    if (!token) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET);
    if (payload.role !== 'superadmin') {
      return NextResponse.json({ error: 'Accès interdit.' }, { status: 403 });
    }

    // Récupération globale des utilisateurs connectés à leur établissement
    const result = await query(
      `SELECT u.id, u.nom, u.email, u.role, e.nom AS etablissement
       FROM utilisateurs u
       LEFT JOIN etablissements e ON u.etablissement_id = e.id
       ORDER BY u.nom ASC;`
    );

    return NextResponse.json({ utilisateurs: result.rows }, { status: 200 });

  } catch (error) {
    console.error('Erreur GET Users:', error);
    return NextResponse.json({ error: 'Erreur interne du serveur.' }, { status: 500 });
  }
}