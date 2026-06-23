import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { jwtVerify } from 'jose';

async function getEtablissementIdFromToken(request: Request) {
  const cookieHeader = request.headers.get('cookie') || '';
  const token = cookieHeader.split('; ').find((row) => row.startsWith('session_token='))?.split('=')[1];
  if (!token) return null;
  const secret = new TextEncoder().encode(process.env.JWT_SECRET);
  const { payload } = await jwtVerify(token, secret);
  return payload.etablissementId as string;
}

export async function GET(request: Request) {
  try {
    const etablissementId = await getEtablissementIdFromToken(request);
    if (!etablissementId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const result = await query(
      `SELECT s.id, s.date_debut, s.date_fin, s.note_finale,
              pm.titre AS projet_titre,
              sal.nom AS salle_nom
       FROM soutenances s
       JOIN projets_memoire pm ON s.projet_id = pm.id
       JOIN salles sal ON s.salle_id = sal.id
       WHERE s.etablissement_id = $1
       ORDER BY s.date_debut ASC;`,
      [etablissementId]
    );
    return NextResponse.json({ soutenances: result.rows });
  } catch (error) {
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const etablissementId = await getEtablissementIdFromToken(request);
    if (!etablissementId) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });

    const { projet_id, salle_id, date_debut, date_fin } = await request.json();

    if (!projet_id || !salle_id || !date_debut || !date_fin) {
      return NextResponse.json({ error: 'Tous les champs de planification sont obligatoires.' }, { status: 400 });
    }

    const result = await query(
      `INSERT INTO soutenances (id, etablissement_id, projet_id, salle_id, date_debut, date_fin, convocation_envoyee) 
       VALUES (gen_random_uuid(), $1, $2, $3, $4, $5, false) RETURNING *;`,
      [etablissementId, projet_id, salle_id, date_debut, date_fin]
    );
    return NextResponse.json({ message: 'Soutenance planifiée !', soutenance: result.rows[0] }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Erreur de planification' }, { status: 500 });
  }
}